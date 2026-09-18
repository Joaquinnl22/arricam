import connectToDatabase from "../../../lib/mongodb";
import Item from "@/models/Item";

export async function GET(req) {
  try {
    await connectToDatabase();

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
