import connectToDatabase from '@/lib/mongodb';
import mongoose from 'mongoose';

delete mongoose.models.Item;

const ItemSchema = new mongoose.Schema({
  tipo: String,
  title: String,
  descripcion: String,
  estado: String,
  cantidad: { type: Number, default: 1 },
  imagen: { type: String, required: false },
});

const Item = mongoose.models.Item || mongoose.model('Item', ItemSchema);

export async function PUT(req) {
  try {
    await connectToDatabase();
    const { tipo, title, descripcion, estado, nuevoEstado, cantidad,imagen } = await req.json();

    // Asegurarse de que 'cantidad' sea un número
    const cantidadNumerica = Number(cantidad); // Convierte a número

    if (!tipo || !title || !descripcion || !estado || !nuevoEstado || isNaN(cantidadNumerica) || !imagen) {
      return new Response(
        JSON.stringify({
          message: "Todos los campos son requeridos y 'cantidad' debe ser un número válido.",
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Encontrar el ítem actual con el estado y descripción originales
    const currentItem = await Item.findOne({ tipo, title, descripcion, estado,imagen });

    if (!currentItem) {
      return new Response(
        JSON.stringify({ message: "Ítem original no encontrado." }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Verificar si la cantidad solicitada es mayor que la disponible
    if (cantidadNumerica > currentItem.cantidad) {
      return new Response(
        JSON.stringify({ message: "Cantidad solicitada excede la cantidad disponible." }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Actualizar o sumar al nuevo estado
    const targetItem = await Item.findOne({ tipo, title, descripcion, estado: nuevoEstado,imagen });

    if (targetItem) {
      // Si ya existe un ítem en el nuevo estado, sumamos la cantidad
      targetItem.cantidad += cantidadNumerica;
      await targetItem.save();
    } else {
      // Si no existe, creamos un nuevo ítem
      await Item.create({
        tipo,
        title,
        descripcion,
        estado: nuevoEstado,
        cantidad: cantidadNumerica,
        imagen
      });
    }
        
    // Reducir la cantidad del estado original
    currentItem.cantidad -= cantidadNumerica;

    if (currentItem.cantidad <= 0) {
      // Si la cantidad llega a 0, eliminamos el ítem original
      await currentItem.deleteOne();
    } else {
      // Guardamos los cambios si todavía hay cantidad restante
      await currentItem.save();
    }

    return new Response(
      JSON.stringify({ message: "Ítem actualizado correctamente." }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ message: 'Error al actualizar el ítem', error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
