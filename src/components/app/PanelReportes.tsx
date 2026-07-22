"use client";

import { useEffect, useState, useCallback } from "react";
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  FileText,
  Users,
  RefreshCw,
  PieChartIcon,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Bar,
  BarChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Pie,
  PieChart,
  Cell,
  Line,
  LineChart,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from "@/components/ui/chart";

/* ── tipos ─────────────────────────────────────────────── */
interface Kpis {
  totalCotizaciones: number;
  sumaTotal: number;
  sumaAnticipos: number;
  tasaAprobacion: number;
  aprobadas: number;
}
interface MesData {
  mes: string;
  total: number;
  cantidad: number;
  aprobadas: number;
}
interface EstadoData {
  estado: string;
  label: string;
  cantidad: number;
  total: number;
}
interface TopCliente {
  nombre: string;
  empresa: string;
  total: number;
  cantidad: number;
}
interface ReportesData {
  kpis: Kpis;
  porMes: MesData[];
  porEstado: EstadoData[];
  topClientes: TopCliente[];
}

/* ── colores temáticos ─────────────────────────────────── */
const ESTADO_COLORS: Record<string, string> = {
  pendiente: "#f59e0b",
  aprobada: "#22c55e",
  rechazada: "#ef4444",
  convertida: "#3b82f6",
  pagada: "#8b5cf6",
};

const CHART_COLORS = ["#1e3a5f", "#22c55e", "#f59e0b", "#3b82f6", "#8b5cf6"];

const barConfig = {
  total: { label: "Monto", color: "#1e3a5f" },
  cantidad: { label: "Cant.", color: "#93c5fd" },
} satisfies ChartConfig;

const lineConfig = {
  aprobadas: { label: "Aprobadas", color: "#22c55e" },
  cantidad: { label: "Totales", color: "#1e3a5f" },
} satisfies ChartConfig;

const pieConfig: ChartConfig = {
  pendiente: { label: "Pendiente", color: "#f59e0b" },
  aprobada: { label: "Aprobada", color: "#22c55e" },
  rechazada: { label: "Rechazada", color: "#ef4444" },
  convertida: { label: "Convertida", color: "#3b82f6" },
  pagada: { label: "Pagada", color: "#8b5cf6" },
};

/* ── helpers ───────────────────────────────────────────── */
function fmt(n: number) {
  return n.toLocaleString("es-MX", { style: "currency", currency: "MXN", minimumFractionDigits: 2 });
}

/* ── componente ────────────────────────────────────────── */
export function PanelReportes() {
  const [data, setData] = useState<ReportesData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchReportes = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/reportes");
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (e) {
      console.error("Error reportes:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReportes();
  }, [fetchReportes]);

  /* ── loading skeleton ─────────────────────────────────── */
  if (loading || !data) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-4 h-20 bg-gray-100 rounded-lg" />
            </Card>
          ))}
        </div>
        <Card>
          <CardContent className="p-4 h-64 bg-gray-100 rounded-lg" />
        </Card>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Card>
            <CardContent className="p-4 h-56 bg-gray-100 rounded-lg" />
          </Card>
          <Card>
            <CardContent className="p-4 h-56 bg-gray-100 rounded-lg" />
          </Card>
        </div>
      </div>
    );
  }

  const { kpis, porMes, porEstado, topClientes } = data;
  const tieneDatos = kpis.totalCotizaciones > 0;

  return (
    <div className="space-y-4">
      {/* ── Encabezado con refresh ──────────────────────── */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-[#1e3a5f]">Reportes</h2>
        <Button variant="ghost" size="icon" onClick={fetchReportes} title="Actualizar">
          <RefreshCw size={16} className="text-muted-foreground" />
        </Button>
      </div>

      {/* ── KPIs ───────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#1e3a5f]/10 flex items-center justify-center text-[#1e3a5f]">
                <FileText size={20} />
              </div>
              <div>
                <p className="text-[11px] text-muted-foreground leading-tight">Cotizaciones</p>
                <p className="text-xl font-bold">{kpis.totalCotizaciones}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center text-green-600">
                <DollarSign size={20} />
              </div>
              <div>
                <p className="text-[11px] text-muted-foreground leading-tight">Total General</p>
                <p className="text-base font-bold">{fmt(kpis.sumaTotal)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
                <TrendingUp size={20} />
              </div>
              <div>
                <p className="text-[11px] text-muted-foreground leading-tight">Tasa Aprobación</p>
                <p className="text-xl font-bold">{kpis.tasaAprobacion}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── KPIs secundarios ────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                <DollarSign size={18} />
              </div>
              <div>
                <p className="text-[11px] text-muted-foreground leading-tight">Anticipos Cobrados</p>
                <p className="text-sm font-bold">{fmt(kpis.sumaAnticipos)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-purple-50 flex items-center justify-center text-purple-600">
                <Users size={18} />
              </div>
              <div>
                <p className="text-[11px] text-muted-foreground leading-tight">Aprobadas / Convertidas</p>
                <p className="text-sm font-bold">
                  {kpis.aprobadas} <span className="text-muted-foreground font-normal">de {kpis.totalCotizaciones}</span>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Estado vacío ────────────────────────────────── */}
      {!tieneDatos && (
        <Card>
          <CardContent className="py-12 text-center">
            <BarChart3 size={40} className="mx-auto text-muted-foreground/30 mb-3" />
            <p className="text-sm text-muted-foreground">
              Aún no hay cotizaciones para mostrar reportes.
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Crea tu primera cotización para ver estadísticas aquí.
            </p>
          </CardContent>
        </Card>
      )}

      {tieneDatos && (
        <>
          {/* ── Barras: Ventas por mes ────────────────────── */}
          <Card>
            <CardHeader className="pb-2 pt-4 px-4">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <BarChart3 size={16} className="text-[#1e3a5f]" />
                Ventas por Periodo
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <ChartContainer config={barConfig} className="h-52 w-full">
                <BarChart data={porMes} barSize={24}>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" />
                  <XAxis dataKey="mes" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                  <YAxis
                    tick={{ fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Bar dataKey="total" fill="var(--color-total)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* ── Línea: Cotizaciones por mes ──────────────── */}
          <Card>
            <CardHeader className="pb-2 pt-4 px-4">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <TrendingUp size={16} className="text-[#1e3a5f]" />
                Cotizaciones por Mes
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <ChartContainer config={lineConfig} className="h-52 w-full">
                <LineChart data={porMes}>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" />
                  <XAxis dataKey="mes" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Line
                    type="monotone"
                    dataKey="cantidad"
                    stroke="var(--color-cantidad)"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="aprobadas"
                    stroke="var(--color-aprobadas)"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                  />
                </LineChart>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* ── Pastel: Distribución por estado ──────────── */}
          {porEstado.length > 0 && (
            <Card>
              <CardHeader className="pb-2 pt-4 px-4">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <PieChartIcon size={16} className="text-[#1e3a5f]" />
                  Distribución por Estado
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <ChartContainer config={pieConfig} className="h-48 w-48 shrink-0">
                    <PieChart>
                      <Pie
                        data={porEstado}
                        dataKey="cantidad"
                        nameKey="estado"
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={70}
                        paddingAngle={3}
                        strokeWidth={0}
                      >
                        {porEstado.map((entry) => (
                          <Cell
                            key={entry.estado}
                            fill={ESTADO_COLORS[entry.estado] || "#94a3b8"}
                          />
                        ))}
                      </Pie>
                      <ChartTooltip content={<ChartTooltipContent />} />
                    </PieChart>
                  </ChartContainer>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {porEstado.map((e) => (
                      <div
                        key={e.estado}
                        className="flex items-center gap-1.5 bg-gray-50 rounded-full px-3 py-1.5"
                      >
                        <div
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: ESTADO_COLORS[e.estado] || "#94a3b8" }}
                        />
                        <span className="text-xs text-muted-foreground">{e.label}</span>
                        <Badge variant="secondary" className="text-[11px] h-5 px-1.5 font-bold">
                          {e.cantidad}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* ── Tabla: Top Clientes ──────────────────────── */}
          {topClientes.length > 0 && (
            <Card>
              <CardHeader className="pb-2 pt-4 px-4">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Users size={16} className="text-[#1e3a5f]" />
                  Top 5 Clientes por Monto
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <div className="space-y-2">
                  {topClientes.map((c, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                          style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }}
                        >
                          {c.nombre.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">{c.nombre}</p>
                          {c.empresa && (
                            <p className="text-[11px] text-muted-foreground truncate">{c.empresa}</p>
                          )}
                        </div>
                      </div>
                      <div className="text-right shrink-0 ml-2">
                        <p className="text-sm font-bold">{fmt(c.total)}</p>
                        <p className="text-[11px] text-muted-foreground">{c.cantidad} cot.</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* ── Monto por estado (barras horizontales) ──── */}
          {porEstado.length > 0 && (
            <Card>
              <CardHeader className="pb-2 pt-4 px-4">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <DollarSign size={16} className="text-[#1e3a5f]" />
                  Monto Total por Estado
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <div className="space-y-3">
                  {porEstado.map((e) => {
                    const maxTotal = Math.max(...porEstado.map((x) => x.total), 1);
                    const pct = (e.total / maxTotal) * 100;
                    return (
                      <div key={e.estado}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-muted-foreground">{e.label}</span>
                          <span className="text-xs font-medium">{fmt(e.total)}</span>
                        </div>
                        <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${pct}%`,
                              backgroundColor: ESTADO_COLORS[e.estado] || "#94a3b8",
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}