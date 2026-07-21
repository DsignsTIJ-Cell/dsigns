"use client";

import { useState, useEffect, useCallback } from "react";
import { FileText, Plus, Search, Filter, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAppStore } from "@/stores/appStore";

interface CotizacionRow {
  id: string;
  numeroCotizacion: string;
  titulo: string;
  fecha: string;
  validoHasta: string;
  estado: string;
  total: number;
  totalUSD: number;
  anticipo: number;
  monedaAnticipo: string;
  cliente: {
    id: string;
    clienteId: string;
    nombre: string;
    empresa: string;
    telefono: string;
    email: string;
  };
  items: { id: string }[];
}

const estadoColors: Record<string, string> = {
  pendiente: "bg-amber-100 text-amber-800",
  aprobada: "bg-green-100 text-green-800",
  rechazada: "bg-red-100 text-red-800",
  convertida: "bg-blue-100 text-blue-800",
  pagada: "bg-emerald-100 text-emerald-800",
};

function construirTituloCompuesto(cot: CotizacionRow): string {
  const partes = [cot.numeroCotizacion, "Cotización"];
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

export function PanelCotizacionesInner() {
  const { searchQuery, setSearchQuery, setCreatingCotizacion } = useAppStore();

  const [cotizaciones, setCotizaciones] = useState<CotizacionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroEstado, setFiltroEstado] = useState("todos");

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
            <Card key={cot.id} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    {/* Título compuesto principal */}
                    <div className="flex items-center gap-2 mb-1">
                      <FileText size={16} className="text-[#1e3a5f] shrink-0" />
                      <span className="font-bold text-sm text-[#1e3a5f] truncate">
                        {construirTituloCompuesto(cot)}
                      </span>
                    </div>
                    {/* Info secundaria */}
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