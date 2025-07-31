import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Trabajo from '@/models/Trabajo';

// PUT - Actualizar registro de trabajo
export async function PUT(request, { params }) {
  try {
    await connectToDatabase();
    
    const { id } = params;
    const body = await request.json();
    
    // Validar campos requeridos
    const camposRequeridos = [
      'trabajadorId', 'trabajadorNombre', 'tipoTrabajo', 'fecha',
      'horaInicio', 'horaFin', 'accionRealizada', 'montoAccion',
      'horasTrabajadas', 'totalPago'
    ];
    
    for (const campo of camposRequeridos) {
      if (!body[campo]) {
        return NextResponse.json(
          { success: false, error: `Campo requerido faltante: ${campo}` },
          { status: 400 }
        );
      }
    }
    
    // Actualizar registro
    const registroActualizado = await Trabajo.findByIdAndUpdate(
      id,
      {
        trabajadorId: body.trabajadorId,
        trabajadorNombre: body.trabajadorNombre,
        tipoTrabajo: body.tipoTrabajo,
        fecha: body.fecha,
        horaInicio: body.horaInicio,
        horaFin: body.horaFin,
        accionRealizada: body.accionRealizada,
        montoAccion: body.montoAccion,
        observaciones: body.observaciones || '',
        horasTrabajadas: body.horasTrabajadas,
        totalPago: body.totalPago
      },
      { new: true }
    );
    
    if (!registroActualizado) {
      return NextResponse.json(
        { success: false, error: 'Registro no encontrado' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ 
      success: true, 
      data: registroActualizado 
    });
  } catch (error) {
    console.error('Error al actualizar registro de trabajo:', error);
    return NextResponse.json(
      { success: false, error: 'Error al actualizar registro' },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar registro de trabajo
export async function DELETE(request, { params }) {
  try {
    await connectToDatabase();
    
    const { id } = params;
    
    const registroEliminado = await Trabajo.findByIdAndDelete(id);
    
    if (!registroEliminado) {
      return NextResponse.json(
        { success: false, error: 'Registro no encontrado' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Registro eliminado correctamente' 
    });
  } catch (error) {
    console.error('Error al eliminar registro de trabajo:', error);
    return NextResponse.json(
      { success: false, error: 'Error al eliminar registro' },
      { status: 500 }
    );
  }
} 