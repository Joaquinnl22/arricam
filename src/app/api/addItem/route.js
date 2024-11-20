import connectToDatabase from '@/lib/mongodb';
import mongoose from 'mongoose';

export async function POST(req) {
  try {
    await connectToDatabase();
    const data = await req.json();
    delete mongoose.models.Item;
    const ItemSchema = new mongoose.Schema({
      tipo: String,
      title: String,
      descripcion: String,
      estado: String,
      cantidad: { type: Number, default: 1 }, // Aquí añadimos el campo cantidad
      imagen: { type: String, required: false },
    });
    const Item = mongoose.models.Item || mongoose.model('Item', ItemSchema);

    const newItem = new Item(data);
    await newItem.save();

    return new Response(
      JSON.stringify({ message: 'Item added successfully', data: newItem }),
      {
        status: 201,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ message: 'Failed to add item', error: error.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
