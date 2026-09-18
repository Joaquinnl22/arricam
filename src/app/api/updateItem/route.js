import { v2 as cloudinary } from "cloudinary";
import connectToDatabase from "@/lib/mongodb";
import webpush from "web-push";
import Item from "@/models/Item";
import Subscription from "@/models/Subscription";
import {
  ESTADOS,
  CAMPO_CONTRAPARTE,
  puedeMoverse,
} from "@/lib/estados";

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

const jsonResponse = (body, status) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });

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
      vendidoA = null,
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
        vendidoA,
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
      vendidoA = formData.get("vendidoA") || null;

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
      return jsonResponse({ message: "Formato de solicitud no soportado." }, 415);
    }

    if (
      !tipo ||
      !title ||
      !descripcion ||
      !estado ||
      !nuevoEstado ||
      !Number.isInteger(cantidadNumerica) ||
      cantidadNumerica < 1
    ) {
      return jsonResponse(
        {
          message:
            "Todos los campos son requeridos y 'cantidad' debe ser un entero mayor a 0.",
        },
        400
      );
    }

    // Regla de negocio: solo se puede vender stock disponible (y una venta no se revierte).
    if (!puedeMoverse(estado, nuevoEstado)) {
      return jsonResponse(
        {
          message:
            nuevoEstado === ESTADOS.VENTA
              ? "Solo se puede vender stock en estado 'disponible'."
              : `No se puede mover un ítem de '${estado}' a '${nuevoEstado}'.`,
        },
        400
      );
    }

    // Arriendo y venta requieren registrar a la contraparte.
    const campoContraparte = CAMPO_CONTRAPARTE[nuevoEstado];
    const contraparte = String(
      (nuevoEstado === ESTADOS.VENTA ? vendidoA : arrendadoPor) ?? ""
    ).trim();
    if (campoContraparte && !contraparte) {
      return jsonResponse(
        {
          message:
            nuevoEstado === ESTADOS.VENTA
              ? "Debes indicar a quién se vendió."
              : "Debes indicar quién arrienda.",
        },
        400
      );
    }

    const currentItem = await Item.findOne({
      tipo,
      title,
      descripcion,
      estado,
    });

    if (!currentItem) {
      return jsonResponse({ message: "Ítem original no encontrado." }, 404);
    }

    if (cantidadNumerica > currentItem.cantidad) {
      return jsonResponse(
        { message: "Cantidad solicitada excede la cantidad disponible." },
        400
      );
    }

    // Las ventas de distintos compradores se mantienen como registros separados.
    let targetItem = await Item.findOne({
      tipo,
      title,
      descripcion,
      estado: nuevoEstado,
      ...(nuevoEstado === ESTADOS.VENTA ? { vendidoA: contraparte } : {}),
    });

    if (targetItem) {
      targetItem.cantidad += cantidadNumerica;
      targetItem.imagenes = [...new Set([...targetItem.imagenes, ...imagenes])];

      if (nuevoEstado === ESTADOS.ARRIENDO) {
        targetItem.arrendadoPor = contraparte;
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
        ...(campoContraparte ? { [campoContraparte]: contraparte } : {}),
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
        if (nuevoEstado === ESTADOS.ARRIENDO) {
          estadoTexto += ` (arrendado por ${contraparte})`;
        } else if (nuevoEstado === ESTADOS.VENTA) {
          estadoTexto += ` (vendido a ${contraparte})`;
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

    return jsonResponse({ message: "Ítem actualizado correctamente." }, 200);
  } catch (error) {
    console.error("Error en la API:", error);
    return jsonResponse(
      { message: "Error al actualizar el ítem", error: error.message },
      500
    );
  }
}
