import connectToDatabase from "@/lib/mongodb";
import GlobalSummary from "@/models/GlobalSummary";

export const dynamic = "force-dynamic"; // necesario si usas app router (Next.js 13+)

export async function GET() {
  try {
    await connectToDatabase();

    const latestSummary = await GlobalSummary.find({})
      .sort({ date: -1 }) // como es string en formato YYYY-MM-DD, esto funciona
      .limit(1)
      .lean();

    if (!latestSummary.length) {
      return new Response(
        JSON.stringify({ message: "No hay resúmenes disponibles" }),
        { status: 404 }
      );
    }

    return new Response(
      JSON.stringify({ date: latestSummary[0].date }),
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
