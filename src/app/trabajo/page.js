"use client";
import React, { useState, useEffect } from "react";
import { FaSpinner, FaPlus, FaFilter, FaCalendarAlt, FaUser, FaClock, FaSearch, FaEdit, FaTrash, FaHammer, FaPaintBrush, FaCog, FaEye, FaEyeSlash, FaDollarSign, FaExclamationTriangle, FaDownload } from "react-icons/fa";

export default function RegistroTrabajoPage() {
  const [trabajadores, setTrabajadores] = useState([]);
  const [registros, setRegistros] = useState([]);
  const [filteredRegistros, setFilteredRegistros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mostrarMontos, setMostrarMontos] = useState(false);
  
  // Estados para los modales
  const [isAgregarOpen, setIsAgregarOpen] = useState(false);
  const [isEditarOpen, setIsEditarOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  
  // Estados para el formulario
  const [formData, setFormData] = useState({
    trabajadorId: '',
    trabajadorNombre: '',
    tipoTrabajo: '',
    fecha: new Date().toISOString().split('T')[0],
    horaInicio: '',
    horaFin: '',
    accionRealizada: '',
    montoAccion: 0,
    observaciones: ''
  });
  
  // Estados para filtros
  const [filtros, setFiltros] = useState({
    trabajador: '',
    tipoTrabajo: '',
    fecha: new Date().toISOString().split('T')[0], // Fecha actual por defecto
    mes: '',
    busqueda: ''
  });
  
  const [showFiltros, setShowFiltros] = useState(false);
  const [conflictoHorario, setConflictoHorario] = useState(null);
  const [generandoBonos, setGenerandoBonos] = useState(false);
  const [showPreviewBonos, setShowPreviewBonos] = useState(false);
  const [datosPreviewBonos, setDatosPreviewBonos] = useState([]);

  // Configuración de tipos de trabajo y acciones con montos
  const tiposTrabajo = {
    'estructura-mantencion': {
      nombre: 'Estructura',
      icono: FaCog,
      acciones: {
        'Instalación estructuras': 25000,
        'Soldadura refuerzos': 20000,
        'Mantención equipos': 15000,
        'Reparación estructuras': 18000,
        'Inspección soldaduras': 12000,
        'Montaje andamios': 16000,
        'Limpieza maquinaria': 10000,
        'Bono por disposición': 20000

      }
    },
    'pintura': {
      nombre: 'Pintura',
      icono: FaPaintBrush,
      acciones: {
        'Preparación superficies': 12000,
        'Aplicación primer': 14000,
        'Pintura brocha': 16000,
        'Pintura rodillo': 15000,
        'Pintura pistola': 18000,
        'Retoque áreas': 10000,
        'Lijado y pulido': 13000,
        'Bono por disposición': 20000

      }
    },
    'carpinteria': {
      nombre: 'Carpintería',
      icono: FaHammer,
      acciones: {
        'Carpinteria': 15000,
        'Reparación': 20000,
        'Revisión camaras': 18000,
        'Terminaciones': 16000,
        'Salida a terreno': 22000,
        'Instalación luz': 14000,
        'Sitio': 17000,
        'Mantención': 10000,
        'Bono por disposición': 20000
      }
    }
  };

  // Datos de trabajadores
  useEffect(() => {
    setTrabajadores([
      { id: '1', nombre: 'ERIK', tipo: 'carpinteria', sueldoBase: 500000 },
      { id: '2', nombre: 'SANCHEZ', tipo: 'estructura-mantencion', sueldoBase: 450000 },
      { id: '3', nombre: 'CRISTINA', tipo: 'estructura-mantencion', sueldoBase: 450000 },
      { id: '4', nombre: 'CAMILO', tipo: 'estructura-mantencion', sueldoBase: 450000 },
      { id: '5', nombre: 'LUIS', tipo: 'pintura', sueldoBase: 400000 },
      { id: '6', nombre: 'VICTOR', tipo: 'carpinteria', sueldoBase: 500000 }
    ]);
  }, []);

  // Cargar registros desde la API
  const cargarRegistros = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/trabajo');
      const data = await response.json();
      
      if (data.success) {
        setRegistros(data.data);
      } else {
        console.error('Error al cargar registros:', data.error);
      }
    } catch (error) {
      console.error('Error al cargar registros:', error);
    } finally {
      setLoading(false);
    }
  };

  // Cargar registros al montar el componente
  useEffect(() => {
    cargarRegistros();
  }, []);

  // Aplicar filtros
  useEffect(() => {
    let filtered = [...registros];
    
    if (filtros.trabajador) {
      filtered = filtered.filter(r => r.trabajadorId === filtros.trabajador);
    }
    
    if (filtros.tipoTrabajo) {
      filtered = filtered.filter(r => r.tipoTrabajo === filtros.tipoTrabajo);
    }
    
    if (filtros.fecha) {
      filtered = filtered.filter(r => r.fecha === filtros.fecha);
    }
    
    if (filtros.mes) {
      filtered = filtered.filter(r => {
        const fechaRegistro = new Date(r.fecha);
        const mesRegistro = fechaRegistro.getMonth() + 1; // getMonth() devuelve 0-11
        const añoRegistro = fechaRegistro.getFullYear();
        const [mesFiltro, añoFiltro] = filtros.mes.split('-');
        return mesRegistro === parseInt(mesFiltro) && añoRegistro === parseInt(añoFiltro);
      });
    }
    
    if (filtros.busqueda) {
      filtered = filtered.filter(r => 
        r.accionRealizada.toLowerCase().includes(filtros.busqueda.toLowerCase()) ||
        r.observaciones.toLowerCase().includes(filtros.busqueda.toLowerCase())
      );
    }
    
    setFilteredRegistros(filtered);
  }, [registros, filtros]);

  const calcularHoras = (inicio, fin) => {
    const [horaI, minI] = inicio.split(':').map(Number);
    const [horaF, minF] = fin.split(':').map(Number);
    
    const inicioMinutos = horaI * 60 + minI;
    const finMinutos = horaF * 60 + minF;
    
    return Math.round(((finMinutos - inicioMinutos) / 60) * 100) / 100; // Redondear a 2 decimales
  };

  const verificarConflictoHorario = (trabajadorId, fecha, horaInicio, horaFin, excludeId = null) => {
    const registrosExistentes = registros.filter(r => 
      r.trabajadorId === trabajadorId && 
      r.fecha === fecha && 
      r._id !== excludeId
    );

    const inicioMinutos = convertirHoraAMinutos(horaInicio);
    const finMinutos = convertirHoraAMinutos(horaFin);

    for (const registro of registrosExistentes) {
      const registroInicioMinutos = convertirHoraAMinutos(registro.horaInicio);
      const registroFinMinutos = convertirHoraAMinutos(registro.horaFin);

      // Verificar si hay solapamiento
      if (
        (inicioMinutos >= registroInicioMinutos && inicioMinutos < registroFinMinutos) ||
        (finMinutos > registroInicioMinutos && finMinutos <= registroFinMinutos) ||
        (inicioMinutos <= registroInicioMinutos && finMinutos >= registroFinMinutos)
      ) {
        return {
          conflicto: true,
          registroConflictivo: registro
        };
      }
    }

    return { conflicto: false };
  };

  const convertirHoraAMinutos = (hora) => {
    const [h, m] = hora.split(':').map(Number);
    return h * 60 + m;
  };

  // Verificar conflictos cuando cambien los horarios
  useEffect(() => {
    if (formData.trabajadorId && formData.fecha && formData.horaInicio && formData.horaFin) {
      const resultado = verificarConflictoHorario(
        formData.trabajadorId, 
        formData.fecha, 
        formData.horaInicio, 
        formData.horaFin,
        editItem?._id
      );
      
      setConflictoHorario(resultado.conflicto ? resultado.registroConflictivo : null);
    } else {
      setConflictoHorario(null);
    }
  }, [formData.trabajadorId, formData.fecha, formData.horaInicio, formData.horaFin, registros, editItem]);

  const handleSubmit = async () => {
    if (!formData.trabajadorId || !formData.fecha || !formData.horaInicio || !formData.horaFin || !formData.accionRealizada) {
      alert('Completa todos los campos obligatorios');
      return;
    }
    
    const horasTrabajadas = calcularHoras(formData.horaInicio, formData.horaFin);
    if (horasTrabajadas <= 0) {
      alert('La hora fin debe ser mayor a la hora inicio');
      return;
    }

    // Verificar conflicto de horario
    const conflicto = verificarConflictoHorario(
      formData.trabajadorId, 
      formData.fecha, 
      formData.horaInicio, 
      formData.horaFin,
      editItem?._id
    );

    if (conflicto.conflicto) {
      alert(`Conflicto de horario: El trabajador ya tiene registrado trabajo de ${conflicto.registroConflictivo.horaInicio} a ${conflicto.registroConflictivo.horaFin} ese día.`);
      return;
    }
    
    const totalPago = horasTrabajadas * formData.montoAccion;
    
    const nuevoRegistro = {
      ...formData,
      horasTrabajadas,
      totalPago
    };
    
    try {
              if (isEditarOpen) {
          // Actualizar registro existente
          const response = await fetch(`/api/trabajo/${editItem._id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(nuevoRegistro),
          });
          
          const data = await response.json();
          
          if (data.success) {
            await cargarRegistros(); // Recargar registros
            handleCloseModal();
          } else {
            alert('Error al actualizar registro: ' + data.error);
          }
        } else {
          // Crear nuevo registro
          const response = await fetch('/api/trabajo', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(nuevoRegistro),
          });
          
          const data = await response.json();
          
          if (data.success) {
            await cargarRegistros(); // Recargar registros
            handleCloseModal();
          } else {
            alert('Error al crear registro: ' + data.error);
          }
        }
    } catch (error) {
      console.error('Error al guardar registro:', error);
      alert('Error al guardar registro');
    }
  };

  const handleCloseModal = () => {
    setIsAgregarOpen(false);
    setIsEditarOpen(false);
    setEditItem(null);
    setConflictoHorario(null);
    setFormData({
      trabajadorId: '',
      trabajadorNombre: '',
      tipoTrabajo: '',
      fecha: new Date().toISOString().split('T')[0],
      horaInicio: '',
      horaFin: '',
      accionRealizada: '',
      montoAccion: 0,
      observaciones: ''
    });
  };

  const handleEdit = (registro) => {
    setEditItem(registro);
    setFormData(registro);
    setIsEditarOpen(true);
  };

  const handleDelete = async (id) => {
    if (confirm('¿Eliminar este registro?')) {
      try {
        const response = await fetch(`/api/trabajo/${id}`, {
          method: 'DELETE',
        });
        
        const data = await response.json();
        
        if (data.success) {
          await cargarRegistros(); // Recargar registros
        } else {
          alert('Error al eliminar registro: ' + data.error);
        }
      } catch (error) {
        console.error('Error al eliminar registro:', error);
        alert('Error al eliminar registro');
      }
    }
  };

  const onTrabajadorChange = (e) => {
    const trabajadorId = e.target.value;
    const trabajador = trabajadores.find(t => t.id === trabajadorId);
    
    setFormData(prev => ({
      ...prev,
      trabajadorId,
      trabajadorNombre: trabajador?.nombre || '',
      tipoTrabajo: trabajador?.tipo || '',
      accionRealizada: '',
      montoAccion: 0
    }));
  };

  const onAccionChange = (e) => {
    const accion = e.target.value;
    const monto = formData.tipoTrabajo ? tiposTrabajo[formData.tipoTrabajo]?.acciones[accion] || 0 : 0;
    
    setFormData(prev => ({
      ...prev,
      accionRealizada: accion,
      montoAccion: monto
    }));
  };

  // Calcular total filtrado
  const calcularTotalFiltrado = () => {
    return filteredRegistros.reduce((total, registro) => total + registro.totalPago, 0);
  };

  // Preparar datos agrupados para bonos
  const prepararDatosBonos = () => {
    // Agrupar por trabajador
    const trabajadoresAgrupados = {};
    
    filteredRegistros.forEach(registro => {
      if (!trabajadoresAgrupados[registro.trabajadorId]) {
        const trabajadorInfo = trabajadores.find(t => t.id === registro.trabajadorId);
        trabajadoresAgrupados[registro.trabajadorId] = {
          trabajadorId: registro.trabajadorId,
          trabajadorNombre: registro.trabajadorNombre,
          sueldoBase: trabajadorInfo?.sueldoBase || 0,
          acciones: {},
          totalPago: 0,
          dias: new Set()
        };
      }
      
      // Agrupar por acción dentro del trabajador
      if (!trabajadoresAgrupados[registro.trabajadorId].acciones[registro.accionRealizada]) {
        trabajadoresAgrupados[registro.trabajadorId].acciones[registro.accionRealizada] = {
          accionRealizada: registro.accionRealizada,
          montoAccion: registro.montoAccion,
          totalHoras: 0,
          totalPago: 0,
          dias: new Set(),
          observaciones: ''
        };
      }
      
      const accion = trabajadoresAgrupados[registro.trabajadorId].acciones[registro.accionRealizada];
      accion.totalHoras += registro.horasTrabajadas;
      accion.totalPago += registro.totalPago;
      accion.dias.add(registro.fecha);
      
      // Agregar fecha a observaciones
      const fechaFormateada = new Date(registro.fecha).toLocaleDateString('es-ES');
      if (accion.observaciones) {
        accion.observaciones += `, ${fechaFormateada}`;
      } else {
        accion.observaciones = fechaFormateada;
      }
      
      trabajadoresAgrupados[registro.trabajadorId].totalPago += registro.totalPago;
      trabajadoresAgrupados[registro.trabajadorId].dias.add(registro.fecha);
    });

    // Convertir a array y ordenar
    return Object.values(trabajadoresAgrupados).map(trabajador => ({
      ...trabajador,
      dias: Array.from(trabajador.dias).sort(),
      diasCount: trabajador.dias.size,
      acciones: Object.values(trabajador.acciones).map(accion => ({
        ...accion,
        dias: Array.from(accion.dias).sort(),
        diasCount: accion.dias.size
      })).sort((a, b) => a.accionRealizada.localeCompare(b.accionRealizada))
    })).sort((a, b) => a.trabajadorNombre.localeCompare(b.trabajadorNombre));
  };

  // Función para abrir preview de bonos
  const abrirPreviewBonos = () => {
    const datosAgrupados = prepararDatosBonos();
    setDatosPreviewBonos(datosAgrupados);
    setShowPreviewBonos(true);
  };

  // Función para generar bonos de producción
  const generarBonosPDF = async (datosEditados) => {
    try {
      setGenerandoBonos(true);
      
      // Obtener el mes y año actual
      const fechaActual = new Date();
      const mes = fechaActual.toLocaleString('es-ES', { month: 'long' });
      const anio = fechaActual.getFullYear().toString();
      
      // Preparar los datos para la API usando los datos editados
      const datosBonos = {
        mes: mes.charAt(0).toUpperCase() + mes.slice(1),
        anio: anio,
        trabajadores: datosEditados.flatMap(trabajador => {
          const registrosAcciones = trabajador.acciones.map(accion => ({
            trabajadorId: trabajador.trabajadorId,
            trabajadorNombre: trabajador.trabajadorNombre,
            sueldoBase: trabajador.sueldoBase || 0,
            tipoTrabajo: 'general',
            fecha: accion.dias.join(', '), // Fechas como string
            horaInicio: '08:00', // Hora por defecto
            horaFin: '18:00', // Hora por defecto
            accionRealizada: accion.accionRealizada,
            montoAccion: accion.montoAccion,
            observaciones: accion.observaciones || '',
            horasTrabajadas: accion.totalHoras,
            totalPago: accion.totalPago
          }));

          // Agregar registro de horas extras solo si tiene monto
          if (trabajador.horasExtras && trabajador.horasExtras > 0) {
            registrosAcciones.push({
              trabajadorId: trabajador.trabajadorId,
              trabajadorNombre: trabajador.trabajadorNombre,
              sueldoBase: trabajador.sueldoBase || 0,
              tipoTrabajo: 'general',
              fecha: 'Horas Extras',
              horaInicio: '00:00',
              horaFin: '00:00',
              accionRealizada: 'Horas Extras',
              montoAccion: 0,
              observaciones: `Monto adicional: $${trabajador.horasExtras.toLocaleString()}`,
              horasTrabajadas: 0,
              totalPago: trabajador.horasExtras
            });
          }

          return registrosAcciones;
        })
      };

      // Log para ver los datos que se envían
      console.log('Datos enviados al generador de PDF:', JSON.stringify(datosBonos, null, 2));
      
      // Log detallado de horas extras y sueldo base
      console.log('=== DETALLE DE HORAS EXTRAS Y SUELDO BASE ===');
      datosEditados.forEach(trabajador => {
        console.log(`Trabajador: ${trabajador.trabajadorNombre}`);
        console.log(`  - Sueldo Base: $${(trabajador.sueldoBase || 0).toLocaleString()}`);
        console.log(`  - Horas Extras: $${(trabajador.horasExtras || 0).toLocaleString()}`);
        console.log(`  - Total: $${((trabajador.totalPago || 0) + (trabajador.horasExtras || 0)).toLocaleString()}`);
        console.log('---');
      });

      const response = await fetch("https://arricam-pdf-service.onrender.com/api/generatebonos", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(datosBonos)
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `bonos-produccion-${datosBonos.mes}-${datosBonos.anio}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        setShowPreviewBonos(false);
      } else {
        const error = await response.json();
        console.error('Error:', error);
        alert('Error al generar el PDF de bonos');
      }
    } catch (error) {
      console.error('Error al generar PDF:', error);
      alert('Error al generar el PDF de bonos');
    } finally {
      setGenerandoBonos(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-2 sm:p-3">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-800 to-gray-900 text-blue-300 rounded-xl shadow-2xl p-4 sm:p-6 mb-4 sm:mb-6 border border-blue-400/20 backdrop-blur-sm">
                  <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-300 to-indigo-300 bg-clip-text text-transparent">
                Registro de Trabajo
              </h1>
              <div className="flex gap-2 w-full sm:w-auto">
                <button
                  onClick={() => setMostrarMontos(!mostrarMontos)}
                  className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-3 py-2 rounded-lg text-sm flex items-center gap-2 font-semibold hover:from-blue-600 hover:to-indigo-600 transition-all duration-200 shadow-lg flex-1 sm:flex-none"
                >
                  {mostrarMontos ? <FaEyeSlash /> : <FaEye />}
                  {mostrarMontos ? 'Ocultar $' : 'Mostrar $'}
                </button>
                <button
                  onClick={abrirPreviewBonos}
                  className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-3 py-2 rounded-lg text-sm flex items-center gap-2 font-semibold hover:from-green-600 hover:to-emerald-600 transition-all duration-200 shadow-lg flex-1 sm:flex-none"
                >
                  <FaDownload />
                  Bonos
                </button>
                <button
                  onClick={() => setIsAgregarOpen(true)}
                  className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-4 py-2 rounded-xl flex items-center gap-2 font-semibold hover:from-blue-600 hover:to-indigo-600 transition-all duration-200 shadow-lg transform hover:scale-105 flex-1 sm:flex-none"
                >
                  <FaPlus /> Nuevo
                </button>
              </div>
            </div>
            
            {/* Total filtrado */}
            {mostrarMontos && (
              <div className="bg-gradient-to-r from-slate-700 to-gray-800 text-blue-300 px-4 py-3 rounded-lg shadow-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FaDollarSign className="text-blue-400" />
                    <span className="font-semibold">Total filtrado:</span>
                  </div>
                  <span className="font-bold text-xl text-blue-200">
                    ${calcularTotalFiltrado().toLocaleString()}
                  </span>
                </div>
                <div className="text-sm text-blue-300 mt-1">
                  {filteredRegistros.length} registro{filteredRegistros.length !== 1 ? 's' : ''} encontrado{filteredRegistros.length !== 1 ? 's' : ''}
                </div>
              </div>
            )}
          </div>
      </div>

      {/* Filtros */}
      <div className="bg-white/90 backdrop-blur-sm border border-blue-200 rounded-xl p-4 sm:p-6 mb-4 sm:mb-6 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-lg flex items-center gap-2 text-gray-800">
            <FaFilter className="text-blue-600" /> Filtros
          </h2>
          <button
            onClick={() => setShowFiltros(!showFiltros)}
            className="text-blue-600 font-medium hover:text-blue-700 transition-colors"
          >
            {showFiltros ? 'Ocultar' : 'Mostrar'}
          </button>
        </div>
        
        {showFiltros && (
          <div className="grid gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <select
                value={filtros.trabajador}
                onChange={(e) => setFiltros(prev => ({ ...prev, trabajador: e.target.value }))}
                className="border-2 border-blue-200 rounded-lg px-4 py-3 focus:border-blue-500 focus:outline-none bg-white/80"
              >
                <option value="">Todos los trabajadores</option>
                {trabajadores.map(t => (
                  <option key={t.id} value={t.id}>{t.nombre}</option>
                ))}
              </select>
              
              <select
                value={filtros.tipoTrabajo}
                onChange={(e) => setFiltros(prev => ({ ...prev, tipoTrabajo: e.target.value }))}
                className="border-2 border-blue-200 rounded-lg px-4 py-3 focus:border-blue-500 focus:outline-none bg-white/80"
              >
                <option value="">Todas las especialidades</option>
                {Object.entries(tiposTrabajo).map(([key, tipo]) => (
                  <option key={key} value={key}>{tipo.nombre}</option>
                ))}
              </select>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input
                type="date"
                value={filtros.fecha}
                onChange={(e) => setFiltros(prev => ({ ...prev, fecha: e.target.value }))}
                className="border-2 border-blue-200 rounded-lg px-4 py-3 focus:border-blue-500 focus:outline-none bg-white/80"
                placeholder="Fecha específica"
              />
              <input
                type="month"
                value={filtros.mes}
                onChange={(e) => setFiltros(prev => ({ ...prev, mes: e.target.value }))}
                className="border-2 border-blue-200 rounded-lg px-4 py-3 focus:border-blue-500 focus:outline-none bg-white/80"
                placeholder="Mes específico"
              />
            </div>
            
            <div className="relative">
              <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-500" />
              <input
                type="text"
                value={filtros.busqueda}
                onChange={(e) => setFiltros(prev => ({ ...prev, busqueda: e.target.value }))}
                className="border-2 border-blue-200 rounded-lg px-12 py-3 w-full focus:border-blue-500 focus:outline-none bg-white/80"
                placeholder="Buscar en acciones y observaciones..."
              />
            </div>
          </div>
        )}
      </div>

      {/* Lista de registros */}
      <div className="bg-white/90 backdrop-blur-sm border border-blue-200 rounded-xl p-4 sm:p-6 shadow-lg">
        <h2 className="font-bold text-lg mb-6 text-gray-800">
          Historial de Trabajos ({filteredRegistros.length} registros)
        </h2>
        
        {loading ? (
          <div className="flex justify-center py-12">
            <FaSpinner className="text-blue-600 text-3xl animate-spin" />
          </div>
        ) : (
          <div className="space-y-4">
            {filteredRegistros.map(registro => {
              const tipoConfig = tiposTrabajo[registro.tipoTrabajo];
              const IconoTipo = tipoConfig?.icono || FaCog;
              
              return (
                <div key={registro._id} className="border-2 border-blue-100 rounded-xl p-4 bg-gradient-to-r from-blue-50 to-indigo-50 hover:shadow-md transition-all duration-200">
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <div className="bg-slate-700 text-blue-300 p-2 rounded-lg">
                          <FaUser />
                        </div>
                        <span className="font-bold text-lg text-gray-800">{registro.trabajadorNombre}</span>
                        <div className="bg-blue-500 text-white p-2 rounded-lg">
                          <IconoTipo />
                        </div>
                        <span className="text-blue-700 font-medium">{tipoConfig?.nombre}</span>
                      </div>
                      
                      <div className="text-sm text-gray-600 mb-2 flex flex-wrap gap-4">
                        <div className="flex items-center gap-2">
                          <FaCalendarAlt className="text-blue-600" />
                          <span className="font-medium">{registro.fecha}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <FaClock className="text-blue-600" />
                          <span className="font-medium">{registro.horaInicio} - {registro.horaFin}</span>
                          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-bold">
                            {registro.horasTrabajadas.toFixed(2)}h
                          </span>
                        </div>
                      </div>
                      
                      <div className="font-medium mb-2 text-gray-800 bg-white/60 px-3 py-2 rounded-lg">
                        {registro.accionRealizada}
                      </div>
                      
                      {registro.observaciones && (
                        <div className="text-sm text-gray-600 italic bg-gray-50 px-3 py-2 rounded-lg">
                          "{registro.observaciones}"
                        </div>
                      )}
                      
                      {mostrarMontos && (
                        <div className="mt-3 bg-gradient-to-r from-slate-700 to-gray-800 text-blue-300 px-4 py-2 rounded-lg text-sm inline-flex items-center gap-2 shadow-lg">
                          <FaDollarSign />
                          <span>${registro.montoAccion.toLocaleString()}/h</span>
                          <span>→</span>
                          <span className="font-bold text-lg">${registro.totalPago.toLocaleString()}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex gap-2 self-end sm:self-start">
                      <button
                        onClick={() => handleEdit(registro)}
                        className="text-blue-600 hover:bg-blue-100 p-3 rounded-lg transition-colors"
                      >
                        <FaEdit size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(registro._id)}
                        className="text-red-600 hover:bg-red-100 p-3 rounded-lg transition-colors"
                      >
                        <FaTrash size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
            
            {filteredRegistros.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <FaClock className="text-4xl mx-auto mb-4 opacity-50" />
                <p className="text-lg">No hay registros que mostrar</p>
                <p className="text-sm">Agrega el primer registro de trabajo</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal */}
      {(isAgregarOpen || isEditarOpen) && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white border-2 border-blue-200 rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-4 sm:p-6">
              <h3 className="text-xl font-bold mb-6 text-gray-800">
                {isEditarOpen ? 'Editar' : 'Nuevo'} Registro de Trabajo
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block font-semibold mb-2 text-gray-700">Trabajador *</label>
                  <select
                    value={formData.trabajadorId}
                    onChange={onTrabajadorChange}
                    className="w-full border-2 border-blue-200 rounded-lg px-4 py-3 focus:border-blue-500 focus:outline-none bg-white"
                  >
                    <option value="">Seleccionar trabajador</option>
                    {trabajadores.map(t => (
                      <option key={t.id} value={t.id}>
                        {t.nombre} - {tiposTrabajo[t.tipo]?.nombre}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block font-semibold mb-2 text-gray-700">Fecha *</label>
                  <input
                    type="date"
                    value={formData.fecha}
                    onChange={(e) => setFormData(prev => ({ ...prev, fecha: e.target.value }))}
                    className="w-full border-2 border-blue-200 rounded-lg px-4 py-3 focus:border-blue-500 focus:outline-none bg-white"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold mb-2 text-gray-700">Hora Inicio *</label>
                    <input
                      type="time"
                      value={formData.horaInicio}
                      onChange={(e) => setFormData(prev => ({ ...prev, horaInicio: e.target.value }))}
                      className="w-full border-2 border-blue-200 rounded-lg px-4 py-3 focus:border-blue-500 focus:outline-none bg-white"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-2 text-gray-700">Hora Fin *</label>
                    <input
                      type="time"
                      value={formData.horaFin}
                      onChange={(e) => setFormData(prev => ({ ...prev, horaFin: e.target.value }))}
                      className="w-full border-2 border-blue-200 rounded-lg px-4 py-3 focus:border-blue-500 focus:outline-none bg-white"
                    />
                  </div>
                </div>

                {/* Alerta de conflicto de horario */}
                {conflictoHorario && (
                  <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4 flex items-start gap-3">
                    <FaExclamationTriangle className="text-red-600 mt-1" />
                    <div className="text-red-800">
                      <div className="font-semibold">¡Conflicto de horario!</div>
                      <div className="text-sm">
                        Ya existe un registro de {conflictoHorario.horaInicio} a {conflictoHorario.horaFin} 
                        para {conflictoHorario.accionRealizada}
                      </div>
                    </div>
                  </div>
                )}
                
                {formData.tipoTrabajo && (
                  <div>
                    <label className="block font-semibold mb-2 text-gray-700">Acción Realizada *</label>
                    <select
                      value={formData.accionRealizada}
                      onChange={onAccionChange}
                      className="w-full border-2 border-blue-200 rounded-lg px-4 py-3 focus:border-blue-500 focus:outline-none bg-white"
                    >
                      <option value="">Seleccionar acción</option>
                      {Object.entries(tiposTrabajo[formData.tipoTrabajo]?.acciones || {}).map(([accion, monto]) => (
                        <option key={accion} value={accion}>
                          {accion} - ${monto.toLocaleString()}/h
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                
                {formData.montoAccion > 0 && (
                  <div>
                    <label className="block font-semibold mb-2 text-gray-700">Monto por Hora</label>
                    <input
                      type="number"
                      value={formData.montoAccion}
                      onChange={(e) => setFormData(prev => ({ ...prev, montoAccion: Number(e.target.value) }))}
                      className="w-full border-2 border-blue-200 rounded-lg px-4 py-3 focus:border-blue-500 focus:outline-none bg-white"
                    />
                  </div>
                )}
                
                <div>
                  <label className="block font-semibold mb-2 text-gray-700">Observaciones</label>
                  <textarea
                    value={formData.observaciones}
                    onChange={(e) => setFormData(prev => ({ ...prev, observaciones: e.target.value }))}
                    rows={3}
                    className="w-full border-2 border-blue-200 rounded-lg px-4 py-3 focus:border-blue-500 focus:outline-none bg-white"
                    placeholder="Detalles adicionales del trabajo realizado..."
                  />
                </div>
                
                {formData.horaInicio && formData.horaFin && formData.montoAccion > 0 && !conflictoHorario && (
                  <div className="bg-gradient-to-r from-slate-700 to-gray-800 text-blue-300 p-4 rounded-lg shadow-lg">
                    <div className="text-sm space-y-1">
                      <div className="flex justify-between">
                        <span>Horas trabajadas:</span>
                        <span className="font-bold">{calcularHoras(formData.horaInicio, formData.horaFin).toFixed(2)}h</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Monto por hora:</span>
                        <span className="font-bold">${formData.montoAccion.toLocaleString()}</span>
                      </div>
                      <hr className="border-blue-600/30" />
                      <div className="flex justify-between text-lg">
                        <span>Total a pagar:</span>
                        <span className="font-bold text-blue-300">
                          ${(calcularHoras(formData.horaInicio, formData.horaFin) * formData.montoAccion).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleCloseModal}
                    className="flex-1 px-6 py-3 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-lg font-semibold transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={conflictoHorario}
                    className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-all ${
                      conflictoHorario 
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                        : 'bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white'
                    }`}
                  >
                    {isEditarOpen ? 'Actualizar' : 'Guardar'} Registro
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Preview de Bonos */}
      {showPreviewBonos && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white border-2 border-blue-200 rounded-xl w-full max-w-6xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-800">
                  Preview de Datos para Bonos
                </h3>
                <button
                  onClick={() => setShowPreviewBonos(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>
              
              <div className="space-y-6">
                {datosPreviewBonos.map((trabajador, trabajadorIndex) => (
                  <div key={trabajadorIndex} className="border-2 border-blue-100 rounded-xl p-6 bg-gradient-to-r from-blue-50 to-indigo-50">
                    {/* Header del trabajador */}
                    <div className="mb-4">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="bg-slate-700 text-blue-300 p-2 rounded-lg">
                          <FaUser />
                        </div>
                        <input
                          type="text"
                          value={trabajador.trabajadorNombre}
                          onChange={(e) => {
                            const nuevosDatos = [...datosPreviewBonos];
                            nuevosDatos[trabajadorIndex].trabajadorNombre = e.target.value;
                            setDatosPreviewBonos(nuevosDatos);
                          }}
                          className="text-xl font-bold text-gray-800 bg-transparent border-b-2 border-blue-200 focus:border-blue-500 focus:outline-none px-2 py-1"
                        />
                      </div>
                      <div className="flex items-center gap-4">
                        <div>
                          <label className="block font-semibold mb-1 text-gray-700 text-sm">Sueldo Base</label>
                          <input
                            type="number"
                            value={trabajador.sueldoBase || 0}
                            onChange={(e) => {
                              const nuevosDatos = [...datosPreviewBonos];
                              nuevosDatos[trabajadorIndex].sueldoBase = Number(e.target.value);
                              setDatosPreviewBonos(nuevosDatos);
                            }}
                            className="border-2 border-blue-200 rounded-lg px-3 py-2 focus:border-blue-500 focus:outline-none bg-white text-sm"
                            placeholder="Sueldo base"
                          />
                        </div>
                        <div className="text-sm text-gray-600">
                          <span className="font-semibold">Total días:</span> {trabajador.diasCount || 0}
                        </div>
                      </div>
                    </div>
                    
                    {/* Acciones del trabajador */}
                    <div className="space-y-4">
                      {trabajador.acciones && trabajador.acciones.length > 0 ? (
                        trabajador.acciones.map((accion, accionIndex) => (
                          <div key={accionIndex} className="border border-blue-200 rounded-lg p-4 bg-white/80">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div>
                                <label className="block font-semibold mb-2 text-gray-700">Acción</label>
                                <input
                                  type="text"
                                  value={accion.accionRealizada}
                                  onChange={(e) => {
                                    const nuevosDatos = [...datosPreviewBonos];
                                    nuevosDatos[trabajadorIndex].acciones[accionIndex].accionRealizada = e.target.value;
                                    setDatosPreviewBonos(nuevosDatos);
                                  }}
                                  className="w-full border-2 border-blue-200 rounded-lg px-4 py-3 focus:border-blue-500 focus:outline-none bg-white"
                                />
                              </div>
                              
                              <div>
                                <label className="block font-semibold mb-2 text-gray-700">Monto por Hora</label>
                                <input
                                  type="number"
                                  value={accion.montoAccion}
                                  onChange={(e) => {
                                    const nuevosDatos = [...datosPreviewBonos];
                                    nuevosDatos[trabajadorIndex].acciones[accionIndex].montoAccion = Number(e.target.value);
                                    nuevosDatos[trabajadorIndex].acciones[accionIndex].totalPago = nuevosDatos[trabajadorIndex].acciones[accionIndex].totalHoras * Number(e.target.value);
                                    // Recalcular total del trabajador
                                    nuevosDatos[trabajadorIndex].totalPago = nuevosDatos[trabajadorIndex].acciones.reduce((sum, a) => sum + a.totalPago, 0);
                                    setDatosPreviewBonos(nuevosDatos);
                                  }}
                                  className="w-full border-2 border-blue-200 rounded-lg px-4 py-3 focus:border-blue-500 focus:outline-none bg-white"
                                />
                              </div>
                              
                              <div>
                                <label className="block font-semibold mb-2 text-gray-700">Total Horas</label>
                                <input
                                  type="number"
                                  step="0.01"
                                  value={accion.totalHoras}
                                  onChange={(e) => {
                                    const nuevosDatos = [...datosPreviewBonos];
                                    nuevosDatos[trabajadorIndex].acciones[accionIndex].totalHoras = Number(e.target.value);
                                    nuevosDatos[trabajadorIndex].acciones[accionIndex].totalPago = Number(e.target.value) * nuevosDatos[trabajadorIndex].acciones[accionIndex].montoAccion;
                                    // Recalcular total del trabajador
                                    nuevosDatos[trabajadorIndex].totalPago = nuevosDatos[trabajadorIndex].acciones.reduce((sum, a) => sum + a.totalPago, 0);
                                    setDatosPreviewBonos(nuevosDatos);
                                  }}
                                  className="w-full border-2 border-blue-200 rounded-lg px-4 py-3 focus:border-blue-500 focus:outline-none bg-white"
                                />
                              </div>
                            </div>
                            
                            <div className="mt-3">
                              <label className="block font-semibold mb-2 text-gray-700">Observaciones (Fechas)</label>
                              <input
                                type="text"
                                value={accion.observaciones || ''}
                                onChange={(e) => {
                                  const nuevosDatos = [...datosPreviewBonos];
                                  nuevosDatos[trabajadorIndex].acciones[accionIndex].observaciones = e.target.value;
                                  setDatosPreviewBonos(nuevosDatos);
                                }}
                                className="w-full border-2 border-blue-200 rounded-lg px-4 py-3 focus:border-blue-500 focus:outline-none bg-white"
                                placeholder="01/01/2024, 02/01/2024, ..."
                              />
                            </div>
                            
                            <div className="mt-3 bg-gradient-to-r from-slate-600 to-gray-700 text-blue-200 px-4 py-2 rounded-lg">
                              <div className="flex justify-between items-center">
                                <span className="font-semibold">Subtotal:</span>
                                <span className="font-bold text-lg">
                                  ${accion.totalPago.toLocaleString()}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-6 text-gray-500 bg-white/60 rounded-lg">
                          <p>No hay acciones registradas para este trabajador</p>
                        </div>
                      )}
                    </div>
                    
                    {/* Horas Extras */}
                    <div className="mt-4 border-2 border-orange-200 rounded-lg p-4 bg-gradient-to-r from-orange-50 to-amber-50">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="bg-orange-500 text-white p-2 rounded-lg">
                          <FaClock />
                        </div>
                        <h4 className="font-semibold text-gray-800">Horas Extras</h4>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block font-semibold mb-2 text-gray-700">Monto Horas Extras</label>
                          <input
                            type="number"
                            value={trabajador.horasExtras || 0}
                            onChange={(e) => {
                              const nuevosDatos = [...datosPreviewBonos];
                              nuevosDatos[trabajadorIndex].horasExtras = Number(e.target.value);
                              setDatosPreviewBonos(nuevosDatos);
                            }}
                            className="w-full border-2 border-orange-200 rounded-lg px-4 py-3 focus:border-orange-500 focus:outline-none bg-white"
                            placeholder="0"
                          />
                        </div>
                        <div className="flex items-end">
                          <div className="bg-orange-100 text-orange-800 px-3 py-2 rounded-lg text-sm">
                            <span className="font-semibold">Total con extras:</span>
                            <span className="font-bold ml-2">
                              ${((trabajador.totalPago || 0) + (trabajador.horasExtras || 0)).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Total del trabajador */}
                    <div className="mt-4 bg-gradient-to-r from-slate-700 to-gray-800 text-blue-300 px-4 py-3 rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold">Total a Pagar:</span>
                        <span className="font-bold text-xl text-blue-200">
                          ${((trabajador.totalPago || 0) + (trabajador.horasExtras || 0)).toLocaleString()}
                        </span>
                      </div>
                      <div className="text-sm text-blue-300 mt-1">
                        {trabajador.diasCount || 0} día{(trabajador.diasCount || 0) !== 1 ? 's' : ''} trabajado{(trabajador.diasCount || 0) !== 1 ? 's' : ''}
                        {(trabajador.horasExtras || 0) > 0 && (
                          <span className="ml-2 text-orange-300">
                            + ${(trabajador.horasExtras || 0).toLocaleString()} extras
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                
                {datosPreviewBonos.length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    <FaClock className="text-4xl mx-auto mb-4 opacity-50" />
                    <p className="text-lg">No hay datos para mostrar</p>
                    <p className="text-sm">Aplica filtros para ver los datos agrupados</p>
                  </div>
                )}
              </div>
              
              <div className="flex gap-3 pt-6">
                <button
                  onClick={() => setShowPreviewBonos(false)}
                  className="flex-1 px-6 py-3 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-lg font-semibold transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => generarBonosPDF(datosPreviewBonos)}
                  disabled={generandoBonos || datosPreviewBonos.length === 0}
                  className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-all ${
                    generandoBonos || datosPreviewBonos.length === 0
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                      : 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white'
                  }`}
                >
                  {generandoBonos ? (
                    <>
                      <FaSpinner className="animate-spin inline mr-2" />
                      Generando PDF...
                    </>
                  ) : (
                    <>
                      <FaDownload className="inline mr-2" />
                      Generar PDF
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )};