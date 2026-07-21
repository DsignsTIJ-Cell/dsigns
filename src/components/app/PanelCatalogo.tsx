"use client";

import { Package, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useAppStore } from "@/stores/appStore";

const mockProductos = [
  { codigo: "A0514", descripcion: "Impresión en acrílico 3mm 4x3 pies con soportes metálicos", precio: 6189 },
  { codigo: "A0515", descripcion: "Impresión en acrílico 6mm 4x3 pies con soportes metálicos", precio: 8650 },
  { code: "A0517", descripcion: "Impresión en PVC 3mm con laminado 4x3 pies", precio: 4714 },
];

export function PanelCatalogo() {
  const { searchQuery, setSearchQuery } = useAppStore();

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por código o descripción..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-10"
          />
        </div>
        <Button className="h-10 bg-[#1e3a5f] hover:bg-[#2a5082] shrink-0 gap-2">
          <Plus size={18} />
          <span className="hidden sm:inline">Nuevo</span>
        </Button>
      </div>

      <div className="space-y-2">
        {[
          { codigo: "A0514", descripcion: "Impresión en acrílico 3mm 4x3 pies con soportes metálicos", precio: 6189 },
          { codigo: "A0515", descripcion: "Impresión en acrílico 6mm 4x3 pies con soportes metálicos", precio: 8650 },
          { codigo: "A0517", descripcion: "Impresión en PVC 3mm con laminado 4x3 pies", precio: 4714 },
          { codigo: "A0518", descripcion: "Impresión en PVC 6mm con laminado 4x3 pies", precio: 6488 },
          { codigo: "A0519", descripcion: "Impresión en 2 lados estireno 0.40 tamaño carta", precio: 520 },
        ].map((prod) => (
          <Card key={prod.codigo} className="overflow-hidden">
            <CardContent className="p-3 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#f3f4f6] flex items-center justify-center shrink-0">
                <Package size={18} className="text-[#1e3a5f]" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[#1e3a5f] bg-blue-50 px-2 py-0.5 rounded">
                    {prod.codigo}
                  </span>
                </div>
                <p className="text-sm truncate mt-0.5">{prod.descripcion}</p>
              </div>
              <p className="font-bold text-sm text-foreground shrink-0">
                ${prod.precio.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}