"use client";

import { Package, Plus, Search, Ruler, Percent } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAppStore } from "@/stores/appStore";
import type { Producto } from "@/types";

const productosEjemplo: Producto[] = [
  {
    id: "1", codigo: "A0514", descripcion: "Impresión en acrílico 3mm con soportes metálicos",
    precioBaseM2: 1031.50, tieneDimensiones: true, utilidadDefault: 50, precioUnitario: 6472.25,
    activo: true, createdAt: "", updatedAt: "",
  },
  {
    id: "2", codigo: "A0515", descripcion: "Impresión en acrílico 6mm con soportes metálicos",
    precioBaseM2: 1441.67, tieneDimensiones: true, utilidadDefault: 50, precioUnitario: 8650.00,
    activo: true, createdAt: "", updatedAt: "",
  },
  {
    id: "3", codigo: "A0517", descripcion: "Impresión en PVC 3mm con laminado",
    precioBaseM2: 785.67, tieneDimensiones: true, utilidadDefault: 50, precioUnitario: 4714.00,
    activo: true, createdAt: "", updatedAt: "",
  },
  {
    id: "4", codigo: "A0518", descripcion: "Impresión en PVC 6mm con laminado",
    precioBaseM2: 1081.33, tieneDimensiones: true, utilidadDefault: 50, precioUnitario: 6488.00,
    activo: true, createdAt: "", updatedAt: "",
  },
  {
    id: "5", codigo: "A0519", descripcion: "Impresión en 2 lados estireno 0.40 tamaño carta",
    precioBaseM2: 520.00, tieneDimensiones: false, utilidadDefault: 50, precioUnitario: 520.00,
    activo: true, createdAt: "", updatedAt: "",
  },
];

export function PanelCatalogo() {
  const { searchQuery, setSearchQuery } = useAppStore();

  const fmt = (n: number) =>
    n.toLocaleString("es-MX", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

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
        {productosEjemplo.map((prod) => (
          <Card key={prod.codigo} className="overflow-hidden">
            <CardContent className="p-3 space-y-2">
              {/* Fila principal */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#f3f4f6] flex items-center justify-center shrink-0">
                  <Package size={18} className="text-[#1e3a5f]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold text-[#1e3a5f] bg-blue-50 px-2 py-0.5 rounded">
                      {prod.codigo}
                    </span>
                    {prod.tieneDimensiones && (
                      <Badge variant="secondary" className="text-[10px] px-1.5 py-0 gap-0.5">
                        <Ruler size={10} /> Medible
                      </Badge>
                    )}
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 gap-0.5">
                      <Percent size={10} /> Utilidad {prod.utilidadDefault}%
                    </Badge>
                  </div>
                  <p className="text-sm truncate mt-0.5">{prod.descripcion}</p>
                </div>
              </div>

              {/* Fila de precios */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pl-[52px]">
                <div className="bg-gray-50 rounded-md px-2.5 py-1.5">
                  <p className="text-[10px] text-muted-foreground leading-tight">Precio Base/m2</p>
                  <p className="text-xs font-semibold">${fmt(prod.precioBaseM2)}</p>
                </div>
                {prod.tieneDimensiones && (
                  <div className="bg-gray-50 rounded-md px-2.5 py-1.5">
                    <p className="text-[10px] text-muted-foreground leading-tight">Área (Alto x Ancho)</p>
                    <p className="text-xs font-semibold">Se calcula al cotizar</p>
                  </div>
                )}
                <div className="bg-blue-50 rounded-md px-2.5 py-1.5">
                  <p className="text-[10px] text-[#1e3a5f] leading-tight">Precio Final</p>
                  <p className="text-xs font-bold text-[#1e3a5f]">${fmt(prod.precioUnitario)}</p>
                </div>
                <div className="bg-gray-50 rounded-md px-2.5 py-1.5">
                  <p className="text-[10px] text-muted-foreground leading-tight">Ejemplo: 4x3 pies</p>
                  <p className="text-xs font-semibold">
                    {prod.tieneDimensiones
                      ? `${fmt(4 * 3 * prod.precioBaseM2)} base + ${fmt(4 * 3 * prod.precioBaseM2 * prod.utilidadDefault / 100)} utilidad`
                      : "Precio fijo"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}