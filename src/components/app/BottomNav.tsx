"use client";

import { useAppStore } from "@/stores/appStore";
import {
  FileText,
  Package,
  Users,
  BarChart3,
  Settings,
} from "lucide-react";
import type { AppTab } from "@/types";

const tabs: { id: AppTab; label: string; icon: React.ReactNode }[] = [
  { id: "cotizaciones", label: "Cotizaciones", icon: <FileText size={22} /> },
  { id: "catalogo", label: "Catálogo", icon: <Package size={22} /> },
  { id: "clientes", label: "Clientes", icon: <Users size={22} /> },
  { id: "reportes", label: "Reportes", icon: <BarChart3 size={22} /> },
  { id: "configuracion", label: "Ajustes", icon: <Settings size={22} /> },
];

export function BottomNav() {
  const { activeTab, setActiveTab } = useAppStore();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-white pb-safe">
      <div className="flex items-center justify-around h-16">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center justify-center gap-0.5 w-full h-full transition-colors relative
                ${isActive
                  ? "text-[#1e3a5f]"
                  : "text-muted-foreground hover:text-foreground"
                }`}
            >
              {isActive && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-[#1e3a5f] rounded-full" />
              )}
              {tab.icon}
              <span className="text-[10px] font-medium leading-tight">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
