import { v2 as cloudinary } from "cloudinary";
import connectToDatabase from "@/lib/mongodb";
import mongoose from "mongoose";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

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
      arrendadoPor: form.get("arrendadoPor") || null, // Añadido
    };

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

    delete mongoose.models.Item;
    const ItemSchema = new mongoose.Schema({
      tipo: String,
      title: String,
      descripcion: String,
      estado: String,
      cantidad: { type: Number, default: 1 },
      imagenes: [{ type: String, required: false }],
      arrendadoPor: { type: String, default: null }, // Añadido al esquema
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