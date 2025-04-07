import connectToDatabase from "../../../lib/mongodb";
import mongoose from "mongoose";

export async function GET(req) {
  try {
    await connectToDatabase();

    // Definir el esquema y el modelo de los items
    const ItemSchema = new mongoose.Schema({
      tipo: String,
      title: String,
      descripcion: String,
      estado: String,
      cantidad: { type: Number, default: 1 },
      imagen: { type: String, required: false },
      arrendadoPor: { type: String, default: "NaN" }, // Nuevo campo con valor por defecto
    });

    const Item = mongoose.models.Item || mongoose.model("Item", ItemSchema);

    // Obtener todos los items de la base de datos
    const items = await Item.find();

    // Asegurar que todos los ítems tengan "arrendadoPor" y poner "NaN" si no lo tienen
    const updatedItems = items.map((item) => ({
      ...item.toObject(),
      arrendadoPor: item.arrendadoPor || "NaN",
    }));

    // Retornar los items
    return new Response(JSON.stringify(updatedItems), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error al obtener los ítems:", error);
    return new Response(
      JSON.stringify({
        message: "Error al obtener los ítems",
        error: error.message,
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
