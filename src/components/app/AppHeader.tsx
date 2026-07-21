"use client";

import { useAppStore } from "@/stores/appStore";

export function AppHeader() {
  const { activeTab } = useAppStore();

  const titles: Record<string, string> = {
    cotizaciones: "Cotizaciones",
    catalogo: "Catálogo de Productos",
    clientes: "Clientes",
    reportes: "Reportes de Ventas",
    configuracion: "Configuración",
  };

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-border pt-safe">
      <div className="flex items-center justify-between px-4 h-14">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#1e3a5f] flex items-center justify-center">
            <span className="text-white font-bold text-sm">D</span>
          </div>
          <div>
            <h1 className="text-base font-bold text-foreground leading-tight">
              {titles[activeTab]}
            </h1>
            <p className="text-[10px] text-muted-foreground leading-tight">
              Dsigns
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}