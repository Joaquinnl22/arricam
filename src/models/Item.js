import mongoose from 'mongoose';

const ItemSchema = new mongoose.Schema({
  tipo: String,
  title: String,
  descripcion: String,
  estado: String,
  cantidad: { type: Number, default: 1 },
  imagen: { type: String, required: false },
  arrendadoPor: { type: String, default: "NaN" },
  accion: { type: String, enum: ["agregado", "modificado"], required: true }, 
}, {
  timestamps: true
});


const Item = mongoose.models.Item || mongoose.model('Item', ItemSchema);

export default Item;
