import mongoose from 'mongoose';

// Modelo único de Item. Todas las rutas deben importarlo desde aquí:
// definir el schema en cada ruta hace que gane el primero en registrarse
// y que los campos nuevos se pierdan silenciosamente (strict mode).
const ItemSchema = new mongoose.Schema({
  tipo: { type: String, required: true },
  title: { type: String, required: true },
  descripcion: { type: String, required: true },
  estado: { type: String, required: true },
  cantidad: { type: Number, default: 1, required: true },
  imagenes: [{ type: String }],
  arrendadoPor: { type: String, default: "NaN" },
  vendidoA: { type: String, default: "NaN" },
  accion: { type: String, default: "agregado" },
}, {
  timestamps: true
});


const Item = mongoose.models.Item || mongoose.model('Item', ItemSchema);

export default Item;
