export type EstadoCotizacion = "pendiente" | "aprobada" | "rechazada" | "convertida" | "pagada";

export interface Configuracion {
  id: string;
  nombreEmpresa: string;
  telefono: string;
  correo: string;
  asesor: string;
  asesorTelefono: string;
  logoUrl: string;
  ivaPorcentaje: number;
  retencionISRPorcentaje: number;
  utilidadDefault: number;
  terminosCondiciones: string;
  vigenciaDias: number;
  siguienteCotizacionNum: number;
}

export interface Cliente {
  id: string;
  clienteId: string;
  nombre: string;
  empresa: string;
  telefono: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export type UnidadMedida = "cm2" | "m2" | "in2" | "pie2";

export const UNIDADES_MEDIDA: Record<UnidadMedida, string> = {
  cm2: "cm²",
  m2: "m²",
  in2: "in²",
  pie2: "pie²",
};

export const UNIDADES_MEDIDA_OPTIONS: { value: UnidadMedida; label: string }[] = [
  { value: "cm2", label: "cm²" },
  { value: "m2", label: "m²" },
  { value: "in2", label: "in²" },
  { value: "pie2", label: "pie²" },
];

export interface Producto {
  id: string;
  codigo: string;
  descripcion: string;
  precioBaseM2: number;
  tieneDimensiones: boolean;
  unidadMedida: UnidadMedida;
  utilidadDefault: number; // Cualquier valor (50, 65, etc.)
  precioUnitario: number;
  activo: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CotizacionItem {
  id?: string;
  codigo: string;
  descripcion: string;
  alto: number; // Alto del producto
  ancho: number; // Ancho del producto
  area: number; // alto x ancho
  unidadMedida: UnidadMedida;
  precioBaseM2: number; // Precio base por unidad de area
  precioBaseTotal: number; // area x precioBaseM2
  utilidadPorcentaje: number; // Cualquier valor, variable por item
  montoUtilidad: number; // precioBaseTotal x (utilidad/100)
  precioUnitario: number; // precioBaseTotal + montoUtilidad
  cantidad: number;
  total: number; // precioUnitario x cantidad
  opcion: string;
  orden: number;
}

/** Calcula el precio de un item con alto, ancho y utilidad */
export function calcularPrecioItem(item: {
  alto: number;
  ancho: number;
  precioBaseM2: number;
  utilidadPorcentaje: number;
  cantidad: number;
  tieneDimensiones?: boolean;
  unidadMedida?: UnidadMedida;
}): Pick<CotizacionItem, 'area' | 'precioBaseTotal' | 'montoUtilidad' | 'precioUnitario' | 'total'> {
  const area = item.alto * item.ancho;
  const precioBaseTotal = area * item.precioBaseM2;
  const montoUtilidad = precioBaseTotal * (item.utilidadPorcentaje / 100);
  const precioUnitario = precioBaseTotal + montoUtilidad;
  const total = precioUnitario * item.cantidad;
  return { area, precioBaseTotal, montoUtilidad, precioUnitario, total };
}

export interface Cotizacion {
  id: string;
  numeroCotizacion: string;
  titulo: string;
  fecha: string;
  validoHasta: string;
  tipoCambio: number;
  asesor: string;
  estado: EstadoCotizacion;
  clienteId: string;
  subtotal: number;
  iva: number;
  retISR: number;
  total: number;
  anticipo: number;
  monedaAnticipo: "MXN" | "USD";
  totalUSD: number;
  cliente?: Cliente;
  items: CotizacionItem[];
  createdAt: string;
  updatedAt: string;
}

export type AppTab = "cotizaciones" | "catalogo" | "clientes" | "reportes" | "configuracion";