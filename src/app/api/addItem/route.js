import { v2 as cloudinary } from "cloudinary";
import connectToDatabase from "@/lib/mongodb";
import webpush from "web-push";
import Item from "@/models/Item";
import Subscription from "@/models/Subscription";
import { ESTADOS, ESTADOS_INICIALES } from "@/lib/estados";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
// Configura webpush
webpush.setVapidDetails(
  "mailto:admin@arricam.cl",
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

export async function POST(req) {
  try {
    await connectToDatabase();

    const form = await req.formData();
    const data = {
      tipo: form.get("tipo"),
      title: form.get("title"),
      descripcion: form.get("descripcion"),
      estado: form.get("estado"),
      cantidad: Number(form.get("cantidad")),
      arrendadoPor: form.get("arrendadoPor") || null,
      accion: "agregado",
    };

    // Un ítem nuevo no puede nacer vendido: la venta solo sale de stock disponible.
    if (!ESTADOS_INICIALES.includes(data.estado)) {
      return new Response(
        JSON.stringify({ message: `Estado inicial inválido: "${data.estado}".` }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const files = form.getAll("imagenes");
    data.imagenes = [];

    for (const file of files) {
      if (file && file.size > 0) {
        const buffer = await file.arrayBuffer();
        const result = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: "items" },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          );
          stream.end(Buffer.from(buffer));
        });
        data.imagenes.push(result.secure_url);
      }
    }

    const newItem = new Item(data);
    await newItem.save();
    // Evitar notificación si el título es "test"
    if (data.title.trim().toLowerCase() !== "test") {
      const subscriptions = await Subscription.find({});
      let estadoTexto = data.estado;

      if (data.estado === ESTADOS.ARRIENDO && data.arrendadoPor) {
        estadoTexto += ` (arrendado por ${data.arrendadoPor})`;
      }

      const notificationPayload = JSON.stringify({
        title: "¡Nuevo Container agregado!",
        body: `Se ha agregado: ${data.title} - Estado: ${estadoTexto}`,
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
    }

    return new Response(
      JSON.stringify({ message: "Item added successfully", data: newItem }),
      {
        status: 201,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ message: "Failed to add item", error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
