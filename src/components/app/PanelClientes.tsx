"use client";

import { Users, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useAppStore } from "@/stores/appStore";

export function PanelClientes() {
  const { searchQuery, setSearchQuery } = useAppStore();

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Buscar cliente o empresa..."
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
          { id: "C0091", nombre: "Teresa Garibaldi", empresa: "Costa Coronado Residencial", tel: "(664) 7297867" },
          { id: "C0090", nombre: "Carlos Méndez", empresa: "Grupo Alfa", tel: "(663) 1234567" },
          { id: "C0089", nombre: "María López", empresa: "Restaurante El Buen Sabor", tel: "(664) 9876543" },
        ].map((cli) => (
          <Card key={cli.id} className="overflow-hidden">
            <CardContent className="p-3 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#1e3a5f] flex items-center justify-center shrink-0">
                <Users size={18} className="text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{cli.nombre}</p>
                <p className="text-xs text-muted-foreground truncate">{cli.empresa}</p>
              </div>
              <div className="text-right shrink-0">
                <span className="text-[10px] font-bold text-[#1e3a5f] bg-blue-50 px-2 py-0.5 rounded">
                  {cli.id}
                </span>
                <p className="text-xs text-muted-foreground mt-0.5">{cli.tel}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}