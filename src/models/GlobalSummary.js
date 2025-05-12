// models/GlobalSummary.js
import mongoose from "mongoose";

const GlobalSummarySchema = new mongoose.Schema({
  date: { type: String, required: true, unique: true }, // Formato: YYYY-MM-DD
  globalAvailable: Number,
  globalMaintenance:Number,
  globalOccupied: Number,
  globalStock: Number,
});

export default mongoose.models.GlobalSummary ||
  mongoose.model("GlobalSummary", GlobalSummarySchema);
