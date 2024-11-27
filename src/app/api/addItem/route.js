import { v2 as cloudinary } from "cloudinary";
import connectToDatabase from "@/lib/mongodb";
import mongoose from "mongoose";

// Configurar Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req) {
  try {
    await connectToDatabase();

    // Leer datos del cuerpo de la solicitud
    const form = await req.formData(); // Next.js permite manejar FormData
    const data = {
      tipo: form.get("tipo"),
      title: form.get("title"),
      descripcion: form.get("descripcion"),
      estado: form.get("estado"),
      cantidad: Number(form.get("cantidad")),
    };

    // Subir la imagen si existe
    const file = form.get("imagen"); // Clave del archivo en FormData
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
      data.imagen = result.secure_url; // Guardar enlace de la imagen
    }

    // Crear y guardar el nuevo ítem
    delete mongoose.models.Item;
    const ItemSchema = new mongoose.Schema({
      tipo: String,
      title: String,
      descripcion: String,
      estado: String,
      cantidad: { type: Number, default: 1 },
      imagen: { type: String, required: false },
    });
    const Item = mongoose.models.Item || mongoose.model("Item", ItemSchema);

    const newItem = new Item(data);
    await newItem.save();

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
