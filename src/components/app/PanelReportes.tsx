"use client";

import { BarChart3, TrendingUp, DollarSign, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function PanelReportes() {
  const stats = [
    { label: "Cotizaciones del Mes", value: "24", icon: <FileText size={20} />, color: "text-[#1e3a5f]" },
    { label: "Ventas Totales", value: "$285,430.00", icon: <DollarSign size={20} />, color: "text-green-600" },
    { label: "Tasa de Aprobación", value: "67%", icon: <TrendingUp size={20} />, color: "text-amber-600" },
  ];

  return (
    <div className="space-y-4">
      {/* Resumen rápido */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center ${s.color}`}>
                  {s.icon}
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                  <p className="text-lg font-bold">{s.value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Placeholder para gráficas */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <BarChart3 size={16} className="text-[#1e3a5f]" />
            Ventas por Periodo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-48 rounded-lg bg-gray-50 flex items-center justify-center border border-dashed border-gray-200">
            <p className="text-sm text-muted-foreground">
              Las gráficas se construirán en el Paso 7
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}