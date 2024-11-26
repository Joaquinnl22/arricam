import connectToDatabase from '@/lib/mongodb';
import mongoose from 'mongoose';

delete mongoose.models.Item;

const ItemSchema = new mongoose.Schema({
  tipo: String,
  title: String,
  descripcion: String,
  estado: String,
  cantidad: { type: Number, default: 1 }, // Campo cantidad
});

const Item = mongoose.models.Item || mongoose.model('Item', ItemSchema);

export async function PUT(req) {
  try {
    await connectToDatabase();
    const { id, cantidad } = await req.json();

    if (!id || cantidad === undefined) {
      return new Response(
        JSON.stringify({
          message: "El 'id' y 'cantidad' son requeridos.",
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const cantidadNumerica = Number(cantidad);

    if (isNaN(cantidadNumerica)) {
      return new Response(
        JSON.stringify({
          message: "'cantidad' debe ser un número válido.",
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const item = await Item.findById(id);

    if (!item) {
      return new Response(
        JSON.stringify({ message: "Ítem no encontrado." }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    item.cantidad += cantidadNumerica;

    if (item.cantidad <= 0) {
      // Si la cantidad llega a 0 o menos, eliminamos el ítem
      await item.deleteOne();
      return new Response(
        JSON.stringify({ message: "Ítem eliminado porque la cantidad llegó a 0." }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    await item.save();

    return new Response(
      JSON.stringify({ message: "Cantidad actualizada correctamente.", data: item }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        message: "Error al actualizar la cantidad.",
        error: error.message,
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
