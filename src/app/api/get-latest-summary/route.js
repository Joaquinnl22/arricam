export const dynamic = "force-dynamic";

import connectToDatabase from "@/lib/mongodb";
import GlobalSummary from "@/models/GlobalSummary";

export async function GET() {
  try {
    await connectToDatabase();

    const todayISO = new Date().toISOString().split("T")[0];

    // Excluir la fecha de hoy en la búsqueda
    const summaries = await GlobalSummary.find({ date: { $lt: todayISO } })
      .sort({ date: -1 })
      .skip(1)
      .limit(1)
      .lean();

    if (!summaries.length) {
      return new Response(
        JSON.stringify({ message: "No hay resúmenes anteriores a hoy" }),
        { status: 404 }
      );
    }

    return new Response(
      JSON.stringify({ date: summaries[0].date }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ message: "Error interno", error: error.message }),
      { status: 500 }
    );
  }
}
