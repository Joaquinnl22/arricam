import connectToDatabase from "@/lib/mongodb";
import GlobalSummary from "@/models/GlobalSummary";

export const dynamic = "force-dynamic"; // si usas app router

export async function GET() {
  try {
    await connectToDatabase();

    const summaries = await GlobalSummary.find({})
      .sort({ date: -1 }) // los más recientes primero
      .limit(2)            // obtenemos los dos últimos
      .lean();

    if (summaries.length < 2) {
      return new Response(
        JSON.stringify({ message: "No hay suficientes resúmenes disponibles" }),
        { status: 404 }
      );
    }

    const penultimate = summaries[1]; // este es el anterior al actual
    return new Response(
      JSON.stringify({ date: penultimate.date }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error al obtener resumen más reciente:", error);
    return new Response(
      JSON.stringify({ message: "Error interno", error: error.message }),
      { status: 500 }
    );
  }
}
