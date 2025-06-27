import connectToDatabase from "../../../lib/mongodb";
import mongoose from "mongoose";

export async function GET(req) {
  try {
    await connectToDatabase();

    const ItemSchema = new mongoose.Schema(
      {
        tipo: String,
        title: String,
        descripcion: String,
        estado: String,
        cantidad: { type: Number, default: 1 },
        imagen: { type: String, required: false },
        arrendadoPor: { type: String, default: "NaN" },
        accion: { type: String, default: "" },
      },
      {
        timestamps: true,
      }
    );

    const Item = mongoose.models.Item || mongoose.model("Item", ItemSchema);

    const latestChanges = await Item.find({}).sort({ updatedAt: -1 }).limit(10);

    return new Response(JSON.stringify(latestChanges), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error al obtener los últimos cambios:", error);
    return new Response(
      JSON.stringify({ message: "Error interno", error: error.message }),
      { status: 500 }
    );
  }
}
