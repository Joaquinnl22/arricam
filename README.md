# 🏗️ Arricam - Sistema de Gestión de Trabajos

Sistema completo para la gestión de registros de trabajo, bonos de producción y generación de PDFs para la empresa Arricam.

## 📋 Índice

- [Características](#-características)
- [Tecnologías](#-tecnologías)
- [Instalación](#-instalación)
- [Configuración](#-configuración)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [APIs](#-apis)
- [Funcionalidades](#-funcionalidades)
- [Uso del Sistema](#-uso-del-sistema)
- [Estructura de Datos](#-estructura-de-datos)

## ✨ Características

### 🎯 **Gestión de Trabajos**
- ✅ Registro de trabajos por trabajador y especialidad
- ✅ Cálculo automático de horas trabajadas
- ✅ Validación de conflictos de horarios
- ✅ Filtros avanzados por fecha, trabajador y tipo de trabajo
- ✅ Edición y eliminación de registros

### 💰 **Sistema de Bonos**
- ✅ Agrupación automática por trabajador y acción
- ✅ Cálculo de totales y subtotales
- ✅ Sueldo base por trabajador
- ✅ Horas extras configurables
- ✅ Preview editable antes de generar PDF

### 📊 **Reportes y PDFs**
- ✅ Generación de PDFs de bonos de producción
- ✅ Integración con API externa de PDFs
- ✅ Datos estructurados y organizados
- ✅ Descarga automática de documentos

### 🎨 **Interfaz de Usuario**
- ✅ Diseño responsive para móviles y desktop
- ✅ Colores modernos y profesionales
- ✅ Efectos visuales (blur, gradientes)
- ✅ Estados de carga y feedback visual

## 🛠️ Tecnologías

- **Frontend**: Next.js 14, React, Tailwind CSS
- **Backend**: Next.js API Routes
- **Base de Datos**: MongoDB con Mongoose
- **Iconos**: React Icons (FontAwesome)
- **PDFs**: API externa (arricam-pdf-service)

## 🚀 Instalación

### Prerrequisitos
- Node.js 18+ 
- MongoDB
- npm o yarn

### Pasos de instalación

1. **Clonar el repositorio**
```bash
git clone <repository-url>
cd arricam
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**
```bash
cp .env.example .env.local
```

4. **Configurar MongoDB**
```bash
# Agregar tu URI de MongoDB en .env.local
MONGODB_URI=mongodb://localhost:27017/arricam
```

5. **Ejecutar el proyecto**
```bash
npm run dev
```

El proyecto estará disponible en `http://localhost:3000`

## ⚙️ Configuración

### Variables de Entorno (.env.local)
```env
MONGODB_URI=mongodb://localhost:27017/arricam
NEXT_PUBLIC_API_URL=http://localhost:3000
```

### Configuración de Trabajadores
Los trabajadores se configuran en `src/app/trabajo/page.js`:

```javascript
const trabajadores = [
  { id: '1', nombre: 'ERIK', tipo: 'carpinteria', sueldoBase: 500000 },
  { id: '2', nombre: 'SANCHEZ', tipo: 'estructura-mantencion', sueldoBase: 450000 },
  // ... más trabajadores
];
```

## 📁 Estructura del Proyecto

```
arricam/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── trabajo/
│   │   │   │   ├── route.js          # CRUD de trabajos
│   │   │   │   └── [id]/
│   │   │   │       └── route.js      # Actualizar/Eliminar
│   │   │   └── ... (otras APIs)
│   │   ├── trabajo/
│   │   │   └── page.js               # Página principal de trabajo
│   │   └── ... (otras páginas)
│   ├── components/                    # Componentes reutilizables
│   ├── lib/
│   │   └── mongodb.js                # Configuración de MongoDB
│   └── models/
│       └── Trabajo.js                # Modelo de datos
├── public/                           # Archivos estáticos
└── package.json
```

## 🔌 APIs

### APIs Locales (MongoDB)

#### `GET /api/trabajo`
Obtiene todos los registros de trabajo ordenados por fecha.

#### `POST /api/trabajo`
Crea un nuevo registro de trabajo.

**Body:**
```json
{
  "trabajadorId": "1",
  "trabajadorNombre": "ERIK",
  "tipoTrabajo": "carpinteria",
  "fecha": "2024-12-01",
  "horaInicio": "08:00",
  "horaFin": "17:00",
  "accionRealizada": "Carpinteria",
  "montoAccion": 15000,
  "observaciones": "Trabajo completado",
  "horasTrabajadas": 9,
  "totalPago": 135000
}
```

#### `PUT /api/trabajo/[id]`
Actualiza un registro existente.

#### `DELETE /api/trabajo/[id]`
Elimina un registro.

### API Externa (PDFs)

#### `POST https://arricam-pdf-service.onrender.com/api/generatebonos`
Genera PDF de bonos de producción.

**Body:**
```json
{
  "mes": "Diciembre",
  "anio": "2024",
  "trabajadores": [
    {
      "trabajadorId": "1",
      "trabajadorNombre": "ERIK",
      "sueldoBase": 500000,
      "tipoTrabajo": "general",
      "fecha": "2024-12-01, 2024-12-02",
      "horaInicio": "08:00",
      "horaFin": "18:00",
      "accionRealizada": "Carpinteria",
      "montoAccion": 15000,
      "observaciones": "01/12/2024, 02/12/2024",
      "horasTrabajadas": 16.0,
      "totalPago": 240000
    }
  ]
}
```

## 🎯 Funcionalidades

### 📝 Registro de Trabajos

1. **Crear Registro**
   - Seleccionar trabajador
   - Elegir fecha y horarios
   - Seleccionar acción realizada
   - Agregar observaciones
   - Validación de conflictos de horario

2. **Filtros Avanzados**
   - Por trabajador
   - Por tipo de trabajo
   - Por fecha específica
   - Por mes/año
   - Búsqueda por texto

3. **Gestión de Datos**
   - Editar registros existentes
   - Eliminar registros
   - Cálculo automático de totales

### 💰 Sistema de Bonos

1. **Agrupación Automática**
   - Agrupa por trabajador
   - Agrupa por acción realizada
   - Suma horas y totales
   - Cuenta días trabajados

2. **Preview Editable**
   - Revisar datos antes de generar PDF
   - Editar montos y observaciones
   - Agregar horas extras
   - Ver totales en tiempo real

3. **Generación de PDFs**
   - Datos estructurados
   - Sueldo base incluido
   - Horas extras opcionales
   - Descarga automática

### 🎨 Interfaz de Usuario

1. **Diseño Responsive**
   - Adaptado para móviles
   - Diseño desktop optimizado
   - Navegación intuitiva

2. **Estados Visuales**
   - Loading spinners
   - Feedback de errores
   - Confirmaciones de acciones

3. **Colores y Estilos**
   - Paleta azul profesional
   - Gradientes modernos
   - Efectos blur y sombras

## 📖 Uso del Sistema

### 1. Registrar un Trabajo

1. Ir a la página de trabajo
2. Hacer clic en "Nuevo"
3. Seleccionar trabajador
4. Elegir fecha y horarios
5. Seleccionar acción realizada
6. Revisar total calculado
7. Guardar registro

### 2. Filtrar Registros

1. Hacer clic en "Mostrar" en la sección de filtros
2. Seleccionar criterios de filtrado
3. Los registros se actualizan automáticamente
4. Ver total filtrado en tiempo real

### 3. Generar PDF de Bonos

1. Aplicar filtros deseados
2. Hacer clic en "Bonos"
3. Revisar preview de datos
4. Editar si es necesario
5. Hacer clic en "Generar PDF"
6. El PDF se descarga automáticamente

### 4. Gestionar Registros

- **Editar**: Hacer clic en el ícono de editar
- **Eliminar**: Hacer clic en el ícono de eliminar
- **Ver montos**: Usar el botón "Mostrar $" / "Ocultar $"

## 📊 Estructura de Datos

### Modelo Trabajo (MongoDB)
```javascript
{
  trabajadorId: String,
  trabajadorNombre: String,
  tipoTrabajo: String,
  fecha: String,
  horaInicio: String,
  horaFin: String,
  accionRealizada: String,
  montoAccion: Number,
  observaciones: String,
  horasTrabajadas: Number,
  totalPago: Number,
  createdAt: Date,
  updatedAt: Date
}
```

### Tipos de Trabajo
- **Estructura/Mantención**: Instalación, soldadura, mantención
- **Pintura**: Preparación, aplicación, retoque
- **Carpintería**: Corte, ensamblaje, instalación

### Montos por Acción
- **Estructura**: $10,000 - $25,000 por hora
- **Pintura**: $10,000 - $18,000 por hora
- **Carpintería**: $14,000 - $22,000 por hora
- **Bono por disposición**: $20,000 (adicional)

## 🔧 Desarrollo

### Scripts Disponibles
```bash
npm run dev          # Desarrollo
npm run build        # Producción
npm run start        # Servidor de producción
npm run lint         # Linting
```

### Estructura de Componentes
- **Modales**: Para crear/editar registros
- **Filtros**: Componente de filtros avanzados
- **Lista**: Visualización de registros
- **Preview**: Modal de preview de bonos

## 🚀 Despliegue

### Vercel (Recomendado)
1. Conectar repositorio a Vercel
2. Configurar variables de entorno
3. Desplegar automáticamente

### Variables de Entorno de Producción
```env
MONGODB_URI=mongodb+srv://...
NEXT_PUBLIC_API_URL=https://tu-dominio.vercel.app
```

## 📝 Notas

- El sistema requiere MongoDB configurado
- La API de PDFs es externa y puede tener latencia
- Los montos se pueden configurar en el código
- Los trabajadores se pueden agregar/modificar en el código

## 🤝 Contribución

1. Fork el proyecto
2. Crear rama feature (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir Pull Request

## 📄 Licencia

Este proyecto es privado para Arricam.

---

**Desarrollado con ❤️ para Arricam**
