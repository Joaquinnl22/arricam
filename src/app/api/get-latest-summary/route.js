import connectToDatabase from "@/lib/mongodb";
import GlobalSummary from "@/models/GlobalSummary";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await connectToDatabase();

    const summaries = await GlobalSummary.find({})
      .sort({ date: -1 })
      .limit(2)
      .lean();

    if (summaries.length < 2) {
      return new Response(
        JSON.stringify({ message: "No hay suficientes resúmenes disponibles" }),
        { status: 404 }
      );
    }

    return new Response(
      JSON.stringify({ date: summaries[1].date }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ message: "Error interno", error: error.message }),
      { status: 500 }
    );
  }
}
