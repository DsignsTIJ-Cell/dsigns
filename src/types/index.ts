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

export interface Producto {
  id: string;
  codigo: string;
  descripcion: string;
  precioBaseM2: number; // Precio por m2 o unitario base
  tieneDimensiones: boolean; // Si requiere alto x ancho
  utilidadDefault: number; // 50 o 65
  precioUnitario: number; // Precio final con utilidad
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
  precioBaseM2: number; // Precio base por m2
  precioBaseTotal: number; // area x precioBaseM2
  utilidadPorcentaje: number; // 50 o 65
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
  anticipoUSD: number;
  totalUSD: number;
  cliente?: Cliente;
  items: CotizacionItem[];
  createdAt: string;
  updatedAt: string;
}

export type AppTab = "cotizaciones" | "catalogo" | "clientes" | "reportes" | "configuracion";