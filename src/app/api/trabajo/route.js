import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Trabajo from '@/models/Trabajo';

// GET - Obtener todos los registros de trabajo
export async function GET() {
  try {
    await connectToDatabase();
    
    const registros = await Trabajo.find({}).sort({ fecha: -1, createdAt: -1 });
    
    return NextResponse.json({ 
      success: true, 
      data: registros 
    });
  } catch (error) {
    console.error('Error al obtener registros de trabajo:', error);
    return NextResponse.json(
      { success: false, error: 'Error al obtener registros' },
      { status: 500 }
    );
  }
}

// POST - Crear nuevo registro de trabajo
export async function POST(request) {
  try {
    await connectToDatabase();
    
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
    
    // Crear nuevo registro
    const nuevoRegistro = new Trabajo({
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
    });
    
    const registroGuardado = await nuevoRegistro.save();
    
    return NextResponse.json({ 
      success: true, 
      data: registroGuardado 
    });
  } catch (error) {
    console.error('Error al crear registro de trabajo:', error);
    return NextResponse.json(
      { success: false, error: 'Error al crear registro' },
      { status: 500 }
    );
  }
} 