import connectToDatabase from "@/lib/mongodb";
import GlobalSummary from "@/models/GlobalSummary";

export async function GET() {
  try {
    await connectToDatabase();

    const latestSummary = await GlobalSummary.findOne({})
      .sort({ date: -1 }) // Asegúrate de tener el campo `date` como Date o ISO string
      .lean();

    if (!latestSummary) {
      return new Response(
        JSON.stringify({ message: "No hay resúmenes disponibles" }),
        { status: 404 }
      );
    }

    return new Response(
      JSON.stringify({ date: latestSummary.date.toISOString().split("T")[0] }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ message: "Error interno", error: error.message }),
      { status: 500 }
    );
  }
}
