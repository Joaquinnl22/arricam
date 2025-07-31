import mongoose from 'mongoose';

const TrabajoSchema = new mongoose.Schema({
  trabajadorId: { type: String, required: true },
  trabajadorNombre: { type: String, required: true },
  tipoTrabajo: { type: String, required: true },
  fecha: { type: String, required: true },
  horaInicio: { type: String, required: true },
  horaFin: { type: String, required: true },
  accionRealizada: { type: String, required: true },
  montoAccion: { type: Number, required: true },
  observaciones: { type: String, default: '' },
  horasTrabajadas: { type: Number, required: true },
  totalPago: { type: Number, required: true }
}, {
  timestamps: true
});

const Trabajo = mongoose.models.Trabajo || mongoose.model('Trabajo', TrabajoSchema);

export default Trabajo; 