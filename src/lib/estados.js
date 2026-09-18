// Fuente única de verdad para los estados de un ítem.
// La usan tanto la UI como las rutas de la API, para que las reglas no se desincronicen.

export const ESTADOS = {
  DISPONIBLE: "disponible",
  MANTENCION: "mantencion",
  ARRIENDO: "arriendo",
  VENTA: "venta",
};

// Estados en los que se puede crear un ítem nuevo (una venta solo nace de stock disponible).
export const ESTADOS_INICIALES = [
  ESTADOS.DISPONIBLE,
  ESTADOS.ARRIENDO,
  ESTADOS.MANTENCION,
];

// Estados a los que se puede mover un ítem, según su estado actual.
// - "venta" solo se alcanza desde "disponible".
// - "venta" es final: un ítem vendido ya no se mueve.
const TRANSICIONES = {
  [ESTADOS.DISPONIBLE]: [ESTADOS.ARRIENDO, ESTADOS.MANTENCION, ESTADOS.VENTA],
  [ESTADOS.MANTENCION]: [ESTADOS.DISPONIBLE, ESTADOS.ARRIENDO],
  [ESTADOS.ARRIENDO]: [ESTADOS.DISPONIBLE, ESTADOS.MANTENCION],
  [ESTADOS.VENTA]: [],
};

export const transicionesDesde = (estado) => TRANSICIONES[estado] || [];

export const puedeMoverse = (desde, hacia) =>
  transicionesDesde(desde).includes(hacia);

// Estados que exigen registrar a la contraparte, y el campo donde se guarda.
export const CAMPO_CONTRAPARTE = {
  [ESTADOS.ARRIENDO]: "arrendadoPor",
  [ESTADOS.VENTA]: "vendidoA",
};
