"use client";

import { useState, useEffect, useCallback } from "react";
import {
  FileText, Plus, Search, Filter, Download, ArrowLeft,
  Loader2, Package, Trash2, AlertCircle, Pencil, Copy,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAppStore } from "@/stores/appStore";
import { toast } from "sonner";

// ─── Tipos ─────────────────────────────────────────────────
interface CotizacionItemRow {
  id: string;
  codigo: string;
  descripcion: string;
  alto: number;
  ancho: number;
  area: number;
  unidadMedida: string;
  precioBaseM2: number;
  precioBaseTotal: number;
  utilidadPorcentaje: number;
  montoUtilidad: number;
  precioUnitario: number;
  cantidad: number;
  total: number;
  opcion: string;
  orden: number;
}

interface CotizacionRow {
  id: string;
  numeroCotizacion: string;
  titulo: string;
  fecha: string;
  validoHasta: string;
  tipoCambio: number;
  asesor: string;
  estado: string;
  total: number;
  totalUSD: number;
  subtotal: number;
  iva: number;
  retISR: number;
  anticipo: number;
  monedaAnticipo: string;
  clienteId: string;
  cliente: {
    id: string;
    clienteId: string;
    nombre: string;
    empresa: string;
    telefono: string;
    email: string;
  };
  items: CotizacionItemRow[];
}

interface ConfigData {
  ivaPorcentaje: number;
  retencionISRPorcentaje: number;
}

// ─── Constantes ────────────────────────────────────────────
const estadoColors: Record<string, string> = {
  pendiente: "bg-amber-100 text-amber-800",
  aprobada: "bg-green-100 text-green-800",
  rechazada: "bg-red-100 text-red-800",
  convertida: "bg-blue-100 text-blue-800",
  pagada: "bg-emerald-100 text-emerald-800",
};

const estadoOptions = ["pendiente", "aprobada", "rechazada", "convertida", "pagada"];

const UNIDADES: Record<string, string> = {
  cm2: "cm\u00B2",
  m2: "m\u00B2",
  in2: "in\u00B2",
  pie2: "pie\u00B2",
};

function construirTituloCompuesto(cot: CotizacionRow): string {
  const partes = [cot.numeroCotizacion, "Cotizaci\u00F3n"];
  const nombreEmpresa = cot.cliente?.empresa || cot.cliente?.nombre || "";
  if (nombreEmpresa) partes.push(nombreEmpresa);
  if (cot.titulo?.trim()) partes.push(cot.titulo.trim());
  return partes.join(" - ");
}

const fmt = (n: number) =>
  n.toLocaleString("es-MX", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

// ─── Vista Detalle ─────────────────────────────────────────
function VistaDetalle({
  cot,
  onBack,
  onDeleted,
}: {
  cot: CotizacionRow;
  onBack: () => void;
  onDeleted: () => void;
}) {
  const { setEditingCotizacionId, setCreatingCotizacion } = useAppStore();
  const [descargando, setDescargando] = useState(false);
  const [duplicando, setDuplicando] = useState(false);
  const [nuevoEstado, setNuevoEstado] = useState(cot.estado);
  const [config, setConfig] = useState<ConfigData | null>(null);

  useEffect(() => {
    fetch("/api/config")
      .then((r) => r.json())
      .then(setConfig);
  }, []);

  const editarCotizacion = () => {
    setEditingCotizacionId(cot.id);
    setCreatingCotizacion(true);
  };

  const duplicarCotizacion = async () => {
    try {
      setDuplicando(true);
      const res = await fetch("/api/cotizaciones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clienteId: cot.clienteId,
          titulo: (cot.titulo || "") + " (copia)",
          tipoCambio: cot.tipoCambio,
          monedaAnticipo: cot.monedaAnticipo,
          items: (cot.items || []).map((it) => ({
            codigo: it.codigo,
            descripcion: it.descripcion,
            alto: it.alto,
            ancho: it.ancho,
            area: it.area,
            unidadMedida: it.unidadMedida,
            precioBaseM2: it.precioBaseM2,
            precioBaseTotal: it.precioBaseTotal,
            utilidadPorcentaje: it.utilidadPorcentaje,
            montoUtilidad: it.montoUtilidad,
            precioUnitario: it.precioUnitario,
            cantidad: it.cantidad,
            total: it.total,
            opcion: it.opcion,
            orden: it.orden,
          })),
        }),
      });
      if (res.ok) {
        const data = await res.json();
        toast.success(`Cotización ${data.numeroCotizacion} duplicada`);
      } else {
        toast.error("Error al duplicar");
      }
    } catch {
      toast.error("Error de conexión");
    } finally {
      setDuplicando(false);
    }
  };

  const descargarPDF = async () => {
    try {
      setDescargando(true);
      const res = await fetch(`/api/cotizaciones/pdf?id=${cot.id}`);
      if (!res.ok) throw new Error();
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${cot.numeroCotizacion}_${cot.titulo || "cotizacion"}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("PDF descargado");
    } catch {
      toast.error("Error al descargar PDF");
    } finally {
      setDescargando(false);
    }
  };

  const cambiarEstado = async () => {
    try {
      const res = await fetch("/api/cotizaciones", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: cot.id, estado: nuevoEstado }),
      });
      if (res.ok) {
        toast.success(`Estado cambiado a "${nuevoEstado}"`);
      } else {
        toast.error("Error al cambiar estado");
      }
    } catch {
      toast.error("Error de conexi\u00F3n");
    }
  };

  const eliminarCotizacion = async () => {
    try {
      const res = await fetch(`/api/cotizaciones?id=${cot.id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Cotizaci\u00F3n eliminada");
        onDeleted();
      } else {
        toast.error("Error al eliminar");
      }
    } catch {
      toast.error("Error de conexi\u00F3n");
    }
  };

  return (
    <div className="space-y-4">
      {/* Encabezado */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="h-9 w-9" onClick={onBack}>
          <ArrowLeft size={18} />
        </Button>
        <div className="flex-1 min-w-0">
          <h2 className="text-sm font-bold text-[#1e3a5f] truncate">
            {construirTituloCompuesto(cot)}
          </h2>
          <p className="text-[10px] text-muted-foreground">
            {new Date(cot.fecha).toLocaleDateString("es-MX", { day: "2-digit", month: "2-digit", year: "numeric" })}
            {" "}· V\u00E1lida hasta{" "}
            {new Date(cot.validoHasta).toLocaleDateString("es-MX", { day: "2-digit", month: "2-digit", year: "numeric" })}
          </p>
        </div>
        <Badge className={`text-[10px] shrink-0 ${estadoColors[cot.estado] || ""}`}>
          {cot.estado}
        </Badge>
      </div>

      {/* Datos cliente */}
      <Card>
        <CardContent className="p-3">
          <p className="text-xs font-semibold text-[#1e3a5f] mb-1.5">Cliente</p>
          <p className="text-sm font-medium">{cot.cliente?.nombre}</p>
          {cot.cliente?.empresa && (
            <p className="text-xs text-muted-foreground">{cot.cliente.empresa}</p>
          )}
          <div className="flex gap-4 mt-1 text-xs text-muted-foreground">
            {cot.cliente?.telefono && <span>Tel: {cot.cliente.telefono}</span>}
            {cot.cliente?.email && <span>{cot.cliente.email}</span>}
          </div>
        </CardContent>
      </Card>

      {/* Items */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold">Productos / Servicios</h3>
          <Badge variant="secondary" className="text-[10px]">
            {cot.items?.length || 0} item(s)
          </Badge>
        </div>
        {cot.items?.map((item) => {
          const um = UNIDADES[item.unidadMedida] || item.unidadMedida;
          return (
            <Card key={item.id}>
              <CardContent className="p-3 space-y-1.5">
                <div className="flex items-center gap-2">
                  <Badge className="text-[10px] bg-blue-50 text-[#1e3a5f]">{item.codigo}</Badge>
                  {item.opcion && (
                    <Badge variant="outline" className="text-[10px]">{item.opcion}</Badge>
                  )}
                </div>
                <p className="text-xs font-medium">{item.descripcion}</p>
                {item.alto > 0 && item.ancho > 0 && (
                  <p className="text-[10px] text-muted-foreground">
                    {item.alto} x {item.ancho} {um} ({fmt(item.area)} {um}) &middot; Cant: {item.cantidad}
                  </p>
                )}
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">
                    ${fmt(item.precioUnitario)} u.
                  </span>
                  <span className="font-bold text-[#1e3a5f]">${fmt(item.total)}</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Resumen financiero */}
      <Card className="border-[#1e3a5f]/20">
        <CardContent className="p-3 space-y-1.5 text-xs">
          <h3 className="text-sm font-semibold text-[#1e3a5f]">Resumen</h3>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Subtotal</span>
            <span>${fmt(cot.subtotal)}</span>
          </div>
          <div className="flex justify-between text-red-600">
            <span>- IVA ({config?.ivaPorcentaje || 8}%)</span>
            <span>-${fmt(cot.iva)}</span>
          </div>
          <div className="flex justify-between text-red-600">
            <span>- Ret. ISR ({config?.retencionISRPorcentaje || 1.25}%)</span>
            <span>-${fmt(cot.retISR)}</span>
          </div>
          <Separator />
          <div className="flex justify-between text-sm font-bold">
            <span>Total</span>
            <span className="text-[#1e3a5f]">${fmt(cot.total)}</span>
          </div>
          <div className="flex justify-between text-green-700">
            <span>Anticipo 50% ({cot.monedaAnticipo})</span>
            <span>${fmt(cot.anticipo)} {cot.monedaAnticipo}</span>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <span>Saldo</span>
            <span>${fmt(cot.total - cot.anticipo)} MXN</span>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <span>Equiv. USD</span>
            <span>${fmt(cot.totalUSD)} USD</span>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <span>Tipo de cambio</span>
            <span>{cot.tipoCambio} MXN/USD</span>
          </div>
        </CardContent>
      </Card>

      {/* Cambiar estado */}
      <Card>
        <CardContent className="p-3 space-y-2">
          <Label className="text-xs font-medium">Cambiar Estado</Label>
          <div className="flex gap-2">
            <Select value={nuevoEstado} onValueChange={setNuevoEstado}>
              <SelectTrigger className="h-9 flex-1 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {estadoOptions.map((e) => (
                  <SelectItem key={e} value={e} className="text-xs">
                    {e.charAt(0).toUpperCase() + e.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              size="sm"
              className="h-9 bg-[#1e3a5f] hover:bg-[#2a5082] text-xs"
              onClick={cambiarEstado}
              disabled={nuevoEstado === cot.estado}
            >
              Actualizar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Botones de acción */}
      <div className="flex gap-2">
        <Button
          onClick={descargarPDF}
          disabled={descargando}
          className="flex-1 h-11 bg-[#1e3a5f] hover:bg-[#2a5082] gap-2 text-sm font-semibold"
        >
          {descargando ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
          {descargando ? "Generando..." : "Descargar PDF"}
        </Button>

        <Button
          variant="outline"
          className="h-11 w-11 shrink-0"
          size="icon"
          onClick={editarCotizacion}
          title="Editar"
        >
          <Pencil size={16} />
        </Button>

        <Button
          variant="outline"
          className="h-11 w-11 shrink-0"
          size="icon"
          onClick={duplicarCotizacion}
          disabled={duplicando}
          title="Duplicar"
        >
          {duplicando ? <Loader2 size={16} className="animate-spin" /> : <Copy size={16} />}
        </Button>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline" className="h-11 w-11 text-destructive shrink-0" size="icon">
              <Trash2 size={16} />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Eliminar cotizaci\u00F3n</AlertDialogTitle>
              <AlertDialogDescription>
                Se eliminar\u00E1 la cotizaci\u00F3n {cot.numeroCotizacion} permanentemente. Esta acci\u00F3n no se puede deshacer.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={eliminarCotizacion} className="bg-destructive text-white hover:bg-destructive/90">
                Eliminar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}

// ─── Panel Principal ───────────────────────────────────────
export function PanelCotizacionesInner() {
  const { searchQuery, setSearchQuery, setCreatingCotizacion } = useAppStore();

  const [cotizaciones, setCotizaciones] = useState<CotizacionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroEstado, setFiltroEstado] = useState("todos");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedCot, setSelectedCot] = useState<CotizacionRow | null>(null);

  const fetchCotizaciones = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filtroEstado && filtroEstado !== "todos") params.set("estado", filtroEstado);
      if (searchQuery) params.set("q", searchQuery);
      const res = await fetch(`/api/cotizaciones?${params}`);
      if (res.ok) {
        const json = await res.json();
        setCotizaciones(json.data || []);
      }
    } catch {
      // silencio
    } finally {
      setLoading(false);
    }
  }, [filtroEstado, searchQuery]);

  useEffect(() => {
    fetchCotizaciones();
  }, [fetchCotizaciones]);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => fetchCotizaciones(), 400);
    return () => clearTimeout(t);
  }, [searchQuery]); // eslint-disable-line react-hooks/exhaustive-deps

  // Abrir detalle
  const openDetalle = async (id: string) => {
    try {
      setSelectedId(id);
      const res = await fetch(`/api/cotizaciones?id=${id}`);
      if (res.ok) {
        // La API GET lista no tiene los items completos, necesitamos buscar por id
        // pero usamos la misma lista ya que tiene los datos básicos
        const cot = cotizaciones.find((c) => c.id === id);
        if (cot) {
          // Obtener detalle completo con items
          const detailRes = await fetch(`/api/cotizaciones/${id}`);
          if (detailRes.ok) {
            const detail = await detailRes.json();
            setSelectedCot(detail);
          } else {
            setSelectedCot(cot);
          }
        }
      }
    } catch {
      // Si falla, mostrar lo que tenemos
      const cot = cotizaciones.find((c) => c.id === id);
      setSelectedCot(cot || null);
    }
  };

  // Si estamos en vista detalle
  if (selectedId && selectedCot) {
    return (
      <VistaDetalle
        cot={selectedCot}
        onBack={() => {
          setSelectedId(null);
          setSelectedCot(null);
          fetchCotizaciones();
        }}
        onDeleted={() => {
          setSelectedId(null);
          setSelectedCot(null);
          fetchCotizaciones();
        }}
      />
    );
  }

  return (
    <div className="space-y-4">
      {/* Barra de búsqueda y acciones */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Buscar cotización, cliente, título..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-10"
          />
        </div>
        <Button variant="outline" size="icon" className="h-10 w-10 shrink-0">
          <Filter size={16} />
        </Button>
        <Button onClick={() => setCreatingCotizacion(true)} className="h-10 bg-[#1e3a5f] hover:bg-[#2a5082] shrink-0 gap-2">
          <Plus size={18} />
          <span className="hidden sm:inline">Nueva</span>
        </Button>
      </div>

      {/* Filtros de estado */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {["todos", "pendiente", "aprobada", "rechazada", "convertida", "pagada"].map(
          (estado) => (
            <Badge
              key={estado}
              variant={filtroEstado === estado ? "default" : "secondary"}
              className={`cursor-pointer whitespace-nowrap text-xs px-3 py-1 ${
                filtroEstado === estado ? "bg-[#1e3a5f]" : ""
              }`}
              onClick={() => setFiltroEstado(estado)}
            >
              {estado.charAt(0).toUpperCase() + estado.slice(1)}
            </Badge>
          )
        )}
      </div>

      {/* Lista de cotizaciones */}
      <div className="space-y-3">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
                <Skeleton className="h-4 w-1/4 ml-auto" />
              </CardContent>
            </Card>
          ))
        ) : cotizaciones.length === 0 ? (
          <div className="text-center py-12">
            <FileText size={40} className="mx-auto text-muted-foreground/20 mb-3" />
            <p className="text-sm text-muted-foreground">Sin cotizaciones</p>
            <Button
              onClick={() => setCreatingCotizacion(true)}
              variant="outline"
              className="mt-3 gap-2 text-xs"
            >
              <Plus size={14} /> Crear primera cotización
            </Button>
          </div>
        ) : (
          cotizaciones.map((cot) => (
            <Card
              key={cot.id}
              className="overflow-hidden cursor-pointer hover:bg-gray-50/50 transition-colors"
              onClick={() => openDetalle(cot.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <FileText size={16} className="text-[#1e3a5f] shrink-0" />
                      <span className="font-bold text-sm text-[#1e3a5f] truncate">
                        {construirTituloCompuesto(cot)}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {cot.cliente?.nombre}
                      {cot.fecha && (
                        <span className="ml-2">
                          {new Date(cot.fecha).toLocaleDateString("es-MX", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                          })}
                        </span>
                      )}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-bold text-sm">${fmt(cot.total)}</p>
                    <Badge
                      className={`text-[10px] mt-1 ${estadoColors[cot.estado] || ""}`}
                    >
                      {cot.estado}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

// Wrapper with key remount for state reset
export function PanelCotizaciones() {
  return <PanelCotizacionesInner key="panel-cotizaciones" />;
}