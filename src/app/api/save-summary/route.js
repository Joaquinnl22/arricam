import connectToDatabase from "@/lib/mongodb";
import GlobalSummary from "@/models/GlobalSummary";

export async function POST(req) {
  try {
    await connectToDatabase();
    const body = await req.json();

    const { globalAvailable, globalOccupied, globalStock, date } = body;

    const existing = await GlobalSummary.findOne({ date });

    if (existing) {
      existing.globalAvailable = globalAvailable;
      existing.globalOccupied = globalOccupied;
      existing.globalStock = globalStock;
      await existing.save();
    } else {
      await GlobalSummary.create({
        date,
        globalAvailable,
        globalOccupied,
        globalStock,
      });
    }

    return new Response(
      JSON.stringify({ message: "Resumen guardado correctamente" }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error al guardar el resumen:", error);
    return new Response(
      JSON.stringify({ message: "Error interno", error: error.message }),
      { status: 500 }
    );
  }
}
