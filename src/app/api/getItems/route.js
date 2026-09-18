import connectToDatabase from "../../../lib/mongodb";
import Item from "@/models/Item";

export async function GET(req) {
  try {
    await connectToDatabase();

    // Obtener todos los items de la base de datos
    const items = await Item.find();

    // Asegurar que todos los ítems tengan "arrendadoPor" y "vendidoA" (poner "NaN" si no lo tienen)
    const updatedItems = items.map((item) => ({
      ...item.toObject(),
      arrendadoPor: item.arrendadoPor || "NaN",
      vendidoA: item.vendidoA || "NaN",
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
