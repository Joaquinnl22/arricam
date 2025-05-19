import connectToDatabase from "@/lib/mongodb";
import GlobalSummary from "@/models/GlobalSummary";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Método no permitido" });
  }

  try {
    await connectToDatabase();

    const summaries = await GlobalSummary.find({})
      .sort({ date: -1 })
      .limit(2)
      .lean();

    console.log("Últimos 2 resúmenes:", summaries);

    if (summaries.length < 2) {
      return res
        .status(404)
        .json({ message: "No hay suficientes resúmenes disponibles" });
    }

    const penultimate = summaries[1];
    res.status(200).json({ date: penultimate.date });
  } catch (error) {
    console.error("Error al obtener resumen más reciente:", error);
    res
      .status(500)
      .json({ message: "Error interno", error: error.message });
  }
}
