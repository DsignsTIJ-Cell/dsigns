"use client";

import { FileText, Plus, Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useAppStore } from "@/stores/appStore";

const estadoColors: Record<string, string> = {
  pendiente: "bg-amber-100 text-amber-800",
  aprobada: "bg-green-100 text-green-800",
  rechazada: "bg-red-100 text-red-800",
  convertida: "bg-blue-100 text-blue-800",
  pagada: "bg-emerald-100 text-emerald-800",
};

const mockData = [
  { num: "S01347", empresa: "Costa Coronado Residencial", cliente: "Teresa Garibaldi", total: "$20,872.83", estado: "pendiente", fecha: "24/04/2026" },
  { num: "S01346", empresa: "Grupo Alfa", cliente: "Carlos Méndez", total: "$15,320.00", estado: "aprobada", fecha: "22/04/2026" },
  { num: "S01345", empresa: "Restaurante El Buen Sabor", cliente: "María López", total: "$8,450.50", estado: "pagada", fecha: "20/04/2026" },
];

export function PanelCotizaciones() {
  const { searchQuery, setSearchQuery } = useAppStore();

  return (
    <div className="space-y-4">
      {/* Barra de búsqueda y acciones */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Buscar cotización, cliente..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-10"
          />
        </div>
        <Button variant="outline" size="icon" className="h-10 w-10 shrink-0">
          <Filter size={16} />
        </Button>
        <Button className="h-10 bg-[#1e3a5f] hover:bg-[#2a5082] shrink-0 gap-2">
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
              variant={estado === "todos" ? "default" : "secondary"}
              className="cursor-pointer whitespace-nowrap text-xs px-3 py-1"
            >
              {estado.charAt(0).toUpperCase() + estado.slice(1)}
            </Badge>
          )
        )}
      </div>

      {/* Lista de cotizaciones */}
      <div className="space-y-3">
        {mockData.map((cot) => (
          <Card key={cot.num} className="overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <FileText size={16} className="text-[#1e3a5f] shrink-0" />
                    <span className="font-bold text-sm text-[#1e3a5f]">
                      {cot.num}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {cot.fecha}
                    </span>
                  </div>
                  <p className="text-sm font-medium truncate">
                    {cot.empresa}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {cot.cliente}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-bold text-sm">{cot.total}</p>
                  <Badge
                    className={`text-[10px] mt-1 ${estadoColors[cot.estado]}`}
                  >
                    {cot.estado}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}