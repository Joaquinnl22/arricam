import { v2 as cloudinary } from "cloudinary";
import connectToDatabase from "@/lib/mongodb";
import mongoose from "mongoose";

// Configuración de Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Definir modelo de MongoDB si no existe
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

    let tipo, title, descripcion, estado, nuevoEstado, cantidadNumerica, imagenes = [];

    // Detectar si la solicitud es JSON o FormData
    const contentType = req.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      // Si la solicitud es JSON
      const body = await req.json();
      ({ tipo, title, descripcion, estado, nuevoEstado, cantidad: cantidadNumerica, imagenes } = body);
    } else if (contentType.includes("multipart/form-data")) {
      // Si la solicitud es FormData
      const formData = await req.formData();
      tipo = formData.get("tipo");
      title = formData.get("title");
      descripcion = formData.get("descripcion");
      estado = formData.get("estado");
      nuevoEstado = formData.get("nuevoEstado");
      cantidadNumerica = Number(formData.get("cantidad"));

      const imagenesArchivos = formData.getAll("imagenes");

      // Subir imágenes a Cloudinary si existen
      for (const file of imagenesArchivos) {
        if (file && file.size > 0) {
          const buffer = Buffer.from(await file.arrayBuffer());
          const result = await new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream({ folder: "items" }, (error, result) => {
              if (error) reject(error);
              else resolve(result);
            });
            stream.end(buffer);
          });
          imagenes.push(result.secure_url);
        }
      }
    } else {
      return new Response(
        JSON.stringify({ message: "Formato de solicitud no soportado." }),
        { status: 415, headers: { "Content-Type": "application/json" } }
      );
    }

    // Validación de datos
    if (!tipo || !title || !descripcion || !estado || !nuevoEstado || isNaN(cantidadNumerica)) {
      return new Response(
        JSON.stringify({ message: "Todos los campos son requeridos y 'cantidad' debe ser un número válido." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Buscar el ítem actual en la base de datos
    // Buscar el ítem actual en la base de datos
    const currentItem = await Item.findOne({ tipo, title, descripcion, estado });

    if (!currentItem) {
      return new Response(
        JSON.stringify({ message: "Ítem original no encontrado." }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    // Ahora sí podemos actualizar sus imágenes sin errores
    currentItem.imagenes = [...new Set([...(currentItem.imagenes || []), ...(imagenes || [])])];

    if (cantidadNumerica > currentItem.cantidad) {
      return new Response(
        JSON.stringify({ message: "Cantidad solicitada excede la cantidad disponible." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Buscar o crear el nuevo ítem
    let targetItem = await Item.findOne({ tipo, title, descripcion, estado: nuevoEstado });

    if (targetItem) {
      targetItem.cantidad += cantidadNumerica;
      targetItem.imagenes = [...new Set([...targetItem.imagenes, ...imagenes])];
      await targetItem.save();
    } else {
      targetItem = new Item({
        tipo,
        title,
        descripcion,
        estado: nuevoEstado,
        cantidad: cantidadNumerica,
        imagenes,
      });
      await targetItem.save();
    }

    // Actualizar o eliminar el ítem original
    currentItem.cantidad -= cantidadNumerica;
    if (currentItem.cantidad <= 0) {
      await currentItem.deleteOne();
    } else {
      currentItem.imagenes = [...new Set([...currentItem.imagenes, ...imagenes])];
      await currentItem.save();
    }

    return new Response(
      JSON.stringify({ message: "Ítem actualizado correctamente." }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error en la API:", error);
    return new Response(
      JSON.stringify({ message: "Error al actualizar el ítem", error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
