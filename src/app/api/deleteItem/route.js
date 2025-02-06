import { v2 as cloudinary } from "cloudinary";
import connectToDatabase from "@/lib/mongodb";
import mongoose from "mongoose";

// Configuración de Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Definir el modelo si no existe
if (!mongoose.models.Item) {
  const ItemSchema = new mongoose.Schema({
    tipo: { type: String, required: true },
    title: { type: String, required: true },
    descripcion: { type: String, required: true },
    estado: { type: String, required: true },
    cantidad: { type: Number, default: 1, required: true },
    imagenes: [{ type: String }],
  });

  mongoose.model("Item", ItemSchema);
}

const Item = mongoose.models.Item;
export async function PUT(req) {
  try {
    await connectToDatabase();

    const { id, cantidadEliminar } = await req.json(); // Recibir cantidadEliminar
    console.log("ID recibido:", id, "Cantidad a eliminar:", cantidadEliminar);

    if (!id || cantidadEliminar == null) {
      return new Response(
        JSON.stringify({ message: "Se requieren 'id' y 'cantidadEliminar'." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const item = await Item.findById(id);

    if (!item) {
      return new Response(
        JSON.stringify({ message: "Ítem no encontrado." }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    // Si la cantidad restante es mayor a 0, solo actualiza la cantidad
    const nuevaCantidad = item.cantidad - cantidadEliminar;
    if (nuevaCantidad > 0) {
      item.cantidad = nuevaCantidad;
      await item.save();

      return new Response(
        JSON.stringify({ message: "Cantidad actualizada.", nuevaCantidad }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    // Si la cantidad llega a 0, eliminar imágenes y luego el ítem
    if (item.imagenes && item.imagenes.length > 0) {
      await eliminarImagenesDeCloudinary(item.imagenes);
    }

    await item.deleteOne();

    return new Response(
      JSON.stringify({ message: "Ítem eliminado completamente." }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error en la API:", error);
    return new Response(
      JSON.stringify({ message: "Error en la operación", error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
// Función para eliminar imágenes de Cloudinary// Función para eliminar imágenes de Cloudinary
async function eliminarImagenesDeCloudinary(imagenes) {
  try {
    console.log("URLs de imágenes recibidas para eliminación:", imagenes);

    // Extraer los public_ids de las URLs de Cloudinary
    const publicIds = imagenes.map((url) => {
      try {
        const matches = url.match(/\/upload\/(?:v\d+\/)?(.+)\.\w+$/);
        return matches ? matches[1] : null;
      } catch (err) {
        console.error("Error al procesar URL:", url, err);
        return null;
      }
    }).filter(Boolean); // Filtrar valores nulos

    if (publicIds.length === 0) {
      console.log("No se encontraron imágenes válidas para eliminar.");
      return;
    }

    console.log("Intentando eliminar imágenes con public_id:", publicIds);

    // Eliminar imágenes de Cloudinary
    const response = await cloudinary.api.delete_resources(publicIds);
    console.log("Imágenes eliminadas de Cloudinary:", response);
  } catch (error) {
    console.error("Error al eliminar imágenes de Cloudinary:", error);
  }
}
