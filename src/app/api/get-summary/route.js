import connectToDatabase from "@/lib/mongodb";
import GlobalSummary from "@/models/GlobalSummary";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const date = searchParams.get("date");

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return new Response(
      JSON.stringify({ message: "Formato de fecha inválido" }),
      { status: 400 }
    );
  }

  try {
    await connectToDatabase();
    const summary = await GlobalSummary.findOne({ date });

    if (!summary) {
      return new Response(
        JSON.stringify({ message: "Resumen no encontrado" }),
        { status: 404 }
      );
    }

    return new Response(JSON.stringify(summary), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ message: "Error interno", error: error.message }),
      { status: 500 }
    );
  }
}

