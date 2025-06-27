import { v2 as cloudinary } from "cloudinary";
import connectToDatabase from "@/lib/mongodb";
import mongoose from "mongoose";
import webpush from "web-push";
import Subscription from "@/models/Subscription";

// Configuración de Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configura WebPush
webpush.setVapidDetails(
  "mailto:admin@arricam.cl",
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

// Definir modelo de MongoDB si no existe
if (!mongoose.models.Item) {
  const ItemSchema = new mongoose.Schema(
    {
      tipo: { type: String, required: true },
      title: { type: String, required: true },
      descripcion: { type: String, required: true },
      estado: { type: String, required: true },
      cantidad: { type: Number, default: 1, required: true },
      imagenes: [{ type: String }],
      arrendadoPor: { type: String, default: null },
      accion: { type: String, default: "actualizado" },
    },
    {
      timestamps: true, // ✅ Agrega esto
    }
  );

  mongoose.model("Item", ItemSchema);
}

const Item = mongoose.models.Item;

export async function PUT(req) {
  try {
    await connectToDatabase();

    let tipo,
      title,
      descripcion,
      estado,
      nuevoEstado,
      cantidadNumerica,
      arrendadoPor = null,
      imagenes = [];

    const contentType = req.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      const body = await req.json();
      ({
        tipo,
        title,
        descripcion,
        estado,
        nuevoEstado,
        cantidad: cantidadNumerica,
        arrendadoPor,
        imagenes,
      } = body);
    } else if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      tipo = formData.get("tipo");
      title = formData.get("title");
      descripcion = formData.get("descripcion");
      estado = formData.get("estado");
      nuevoEstado = formData.get("nuevoEstado");
      cantidadNumerica = Number(formData.get("cantidad"));
      arrendadoPor = formData.get("arrendadoPor") || null;

      const imagenesArchivos = formData.getAll("imagenes");
      for (const file of imagenesArchivos) {
        if (file && file.size > 0) {
          const buffer = Buffer.from(await file.arrayBuffer());
          const result = await new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
              { folder: "items" },
              (error, result) => {
                if (error) reject(error);
                else resolve(result);
              }
            );
            stream.end(buffer);
          });
          imagenes.push(result.secure_url);
        }
      }
    } else {
      return new Response(
        JSON.stringify({ message: "Formato de solicitud no soportado." }),
        {
          status: 415,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    if (
      !tipo ||
      !title ||
      !descripcion ||
      !estado ||
      !nuevoEstado ||
      isNaN(cantidadNumerica)
    ) {
      return new Response(
        JSON.stringify({
          message:
            "Todos los campos son requeridos y 'cantidad' debe ser un número válido.",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const currentItem = await Item.findOne({
      tipo,
      title,
      descripcion,
      estado,
    });

    if (!currentItem) {
      return new Response(
        JSON.stringify({ message: "Ítem original no encontrado." }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    if (cantidadNumerica > currentItem.cantidad) {
      return new Response(
        JSON.stringify({
          message: "Cantidad solicitada excede la cantidad disponible.",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    let targetItem = await Item.findOne({
      tipo,
      title,
      descripcion,
      estado: nuevoEstado,
    });

    if (targetItem) {
      targetItem.cantidad += cantidadNumerica;
      targetItem.imagenes = [...new Set([...targetItem.imagenes, ...imagenes])];

      if (nuevoEstado === "arriendo" && arrendadoPor) {
        targetItem.arrendadoPor = arrendadoPor;
      }

      targetItem.accion = "actualizado";
      await targetItem.save();
    } else {
      targetItem = new Item({
        tipo,
        title,
        descripcion,
        estado: nuevoEstado,
        cantidad: cantidadNumerica,
        imagenes,
        accion: "movido",
        ...(nuevoEstado === "arriendo" && arrendadoPor ? { arrendadoPor } : {}),
      });
      await targetItem.save();
    }

    // Actualiza o elimina el ítem original
    currentItem.cantidad -= cantidadNumerica;
    if (currentItem.cantidad <= 0) {
      await currentItem.deleteOne();
    } else {
      currentItem.imagenes = [
        ...new Set([...currentItem.imagenes, ...imagenes]),
      ];
      await currentItem.save();
    }

    // Enviar notificación push
    // Enviar notificación push solo si el título NO es "test"
    if (title.trim().toLowerCase() !== "test") {
      try {
        const subscriptions = await Subscription.find({});

        let estadoTexto = nuevoEstado;
        if (nuevoEstado === "arriendo" && arrendadoPor) {
          estadoTexto += ` (arrendado por ${arrendadoPor})`;
        }

        const notificationPayload = JSON.stringify({
          title: "¡Estado actualizado!",
          body: `Ítem "${title}" ha sido movido a: ${estadoTexto}`,
          icon: "/arricam.png",
        });

        for (const sub of subscriptions) {
          try {
            await webpush.sendNotification(sub, notificationPayload);
          } catch (err) {
            console.error("Error enviando a una suscripción:", err);
            if (err.statusCode === 410) {
              await Subscription.deleteOne({ endpoint: sub.endpoint });
            }
          }
        }
      } catch (err) {
        console.error("Error al manejar las notificaciones:", err);
      }
    }

    return new Response(
      JSON.stringify({ message: "Ítem actualizado correctamente." }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error en la API:", error);
    return new Response(
      JSON.stringify({
        message: "Error al actualizar el ítem",
        error: error.message,
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
