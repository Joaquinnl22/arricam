import mongoose from 'mongoose';

const ItemSchema = new mongoose.Schema({
  tipo: { type: String, required: true },
  title: { type: String, required: true },
  descripcion: { type: String, required: true },
  estado: { type: String, required: true },
  cantidad: { type: Number, default: 1 },
  imagen: { type: String },  // Guardar la URL de la imagen aquí
});

const Item = mongoose.models.Item || mongoose.model('Item', ItemSchema);

export default Item;
