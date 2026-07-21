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
  precioUnitario: number;
  activo: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CotizacionItem {
  id?: string;
  codigo: string;
  descripcion: string;
  precioUnitario: number;
  cantidad: number;
  total: number;
  opcion: string;
  orden: number;
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