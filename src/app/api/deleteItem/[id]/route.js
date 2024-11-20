import  connectToDatabase  from '@/lib/mongodb';
import mongoose from 'mongoose';

// Define el esquema del modelo (puedes adaptarlo si ya tienes uno)
const ItemSchema = new mongoose.Schema({
  tipo: String,
  title: String,
  descripcion: String,
  estado: String,
  cantidad: { type: Number, default: 1 }, // Aquí añadimos el campo cantidad
});

const Item = mongoose.models.Item || mongoose.model('Item', ItemSchema);

export async function DELETE(req, { params }) {
  try {
    // Conectar a la base de datos
    await connectToDatabase();

    const { id } = params;

    // Validar que el ID sea válido
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return new Response(
        JSON.stringify({ message: 'Invalid ID format' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Buscar y eliminar el elemento
    const deletedItem = await Item.findByIdAndDelete(id);

    if (!deletedItem) {
      return new Response(
        JSON.stringify({ message: 'Item not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Respuesta exitosa
    return new Response(
      JSON.stringify({ message: 'Item deleted successfully', data: deletedItem }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    // Manejo de errores
    return new Response(
      JSON.stringify({ message: 'Failed to delete item', error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
