import connectToDatabase from "@/lib/mongodb";
import mongoose from "mongoose";

delete mongoose.models.Item;

const ItemSchema = new mongoose.Schema({
  tipo: String,
  title: String,
  descripcion: String,
  estado: String,
  cantidad: { type: Number, default: 1 },
  imagen: { type: String, required: false },
});

const Item = mongoose.models.Item || mongoose.model("Item", ItemSchema);

export async function PUT(req) {
  try {
    await connectToDatabase();
    const { tipo, title, descripcion, estado, nuevoEstado, cantidad, imagen } =
      await req.json();

    // Convert 'cantidad' to a number
    const cantidadNumerica = Number(cantidad);

    // Validation: Ensure required fields are present and valid
    if (
      !tipo ||
      !title ||
      !descripcion ||
      !estado ||
      !nuevoEstado ||
      isNaN(cantidadNumerica)
    ) {
      return new Response(
        JSON.stringify({
          message: "Todos los campos son requeridos y 'cantidad' debe ser un número válido.",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Find the current item based on the original state
    const currentItem = await Item.findOne({
      tipo,
      title,
      descripcion,
      estado,
      imagen: imagen || null, // Handle undefined 'imagen'
    });

    if (!currentItem) {
      return new Response(
        JSON.stringify({ message: "Ítem original no encontrado." }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    // Check if the requested quantity exceeds the available amount
    if (cantidadNumerica > currentItem.cantidad) {
      return new Response(
        JSON.stringify({
          message: "Cantidad solicitada excede la cantidad disponible.",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Find or create the target item with the new state
    const targetItem = await Item.findOne({
      tipo,
      title,
      descripcion,
      estado: nuevoEstado,
      imagen: imagen || null, // Handle undefined 'imagen'
    });

    if (targetItem) {
      // Update the quantity of the target item
      targetItem.cantidad += cantidadNumerica;
      await targetItem.save();
    } else {
      // Create a new item if it doesn't exist
      await Item.create({
        tipo,
        title,
        descripcion,
        estado: nuevoEstado,
        cantidad: cantidadNumerica,
        imagen: imagen || null, // Handle undefined 'imagen'
      });
    }

    // Reduce the quantity of the original item
    currentItem.cantidad -= cantidadNumerica;

    if (currentItem.cantidad <= 0) {
      // Delete the original item if its quantity reaches 0
      await currentItem.deleteOne();
    } else {
      // Save the remaining quantity
      await currentItem.save();
    }

    return new Response(
      JSON.stringify({ message: "Ítem actualizado correctamente." }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        message: "Error al actualizar el ítem",
        error: error.message,
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
  