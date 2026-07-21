"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Save, Building2, Phone, Mail, User, Percent } from "lucide-react";
import { toast } from "sonner";

export function PanelConfiguracion() {
  const [config, setConfig] = useState({
    nombreEmpresa: "Dsigns",
    telefono: "663 4917254",
    correo: "dsigns.tij@gmail.com",
    asesor: "Daniel Sepúlveda Ruíz",
    asesorTelefono: "6647297867",
    ivaPorcentaje: "8",
    retencionISRPorcentaje: "1.25",
    vigenciaDias: "15",
    terminosCondiciones: "",
  });

  useEffect(() => {
    fetch("/api/config")
      .then((r) => r.json())
      .then((data) => {
        setConfig({
          nombreEmpresa: data.nombreEmpresa || "Dsigns",
          telefono: data.telefono || "",
          correo: data.correo || "",
          asesor: data.asesor || "",
          asesorTelefono: data.asesorTelefono || "",
          ivaPorcentaje: String(data.ivaPorcentaje || 8),
          retencionISRPorcentaje: String(data.retencionISRPorcentaje || 1.25),
          vigenciaDias: String(data.vigenciaDias || 15),
          terminosCondiciones: data.terminosCondiciones || "",
        });
      })
      .catch(() => {});
  }, []);

  const handleSave = async () => {
    try {
      const res = await fetch("/api/config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombreEmpresa: config.nombreEmpresa,
          telefono: config.telefono,
          correo: config.correo,
          asesor: config.asesor,
          asesorTelefono: config.asesorTelefono,
          ivaPorcentaje: parseFloat(config.ivaPorcentaje),
          retencionISRPorcentaje: parseFloat(config.retencionISRPorcentaje),
          vigenciaDias: parseInt(config.vigenciaDias),
          terminosCondiciones: config.terminosCondiciones,
        }),
      });
      if (res.ok) {
        toast.success("Configuración guardada correctamente");
      } else {
        toast.error("Error al guardar");
      }
    } catch {
      toast.error("Error de conexión");
    }
  };

  return (
    <div className="space-y-4">
      {/* Datos de la empresa */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Building2 size={16} className="text-[#1e3a5f]" />
            Datos de la Empresa
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <Label className="text-xs">Nombre de la empresa</Label>
            <Input
              value={config.nombreEmpresa}
              onChange={(e) => setConfig({ ...config, nombreEmpresa: e.target.value })}
              className="h-10"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Label className="text-xs flex items-center gap-1">
                <Phone size={12} /> Teléfono
              </Label>
              <Input
                value={config.telefono}
                onChange={(e) => setConfig({ ...config, telefono: e.target.value })}
                className="h-10"
              />
            </div>
            <div>
              <Label className="text-xs flex items-center gap-1">
                <Mail size={12} /> Correo electrónico
              </Label>
              <Input
                value={config.correo}
                onChange={(e) => setConfig({ ...config, correo: e.target.value })}
                className="h-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Datos del asesor */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <User size={16} className="text-[#1e3a5f]" />
            Asesor de Servicio
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <Label className="text-xs">Nombre del asesor</Label>
            <Input
              value={config.asesor}
              onChange={(e) => setConfig({ ...config, asesor: e.target.value })}
              className="h-10"
            />
          </div>
          <div>
            <Label className="text-xs">Teléfono del asesor</Label>
            <Input
              value={config.asesorTelefono}
              onChange={(e) => setConfig({ ...config, asesorTelefono: e.target.value })}
              className="h-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Configuración fiscal */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Percent size={16} className="text-[#1e3a5f]" />
            Configuración Fiscal
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label className="text-xs">IVA (%)</Label>
              <Input
                type="number"
                step="0.01"
                value={config.ivaPorcentaje}
                onChange={(e) => setConfig({ ...config, ivaPorcentaje: e.target.value })}
                className="h-10"
              />
            </div>
            <div>
              <Label className="text-xs">RET. ISR (%)</Label>
              <Input
                type="number"
                step="0.01"
                value={config.retencionISRPorcentaje}
                onChange={(e) => setConfig({ ...config, retencionISRPorcentaje: e.target.value })}
                className="h-10"
              />
            </div>
            <div>
              <Label className="text-xs">Vigencia (días)</Label>
              <Input
                type="number"
                value={config.vigenciaDias}
                onChange={(e) => setConfig({ ...config, vigenciaDias: e.target.value })}
                className="h-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Botón guardar */}
      <Button
        onClick={handleSave}
        className="w-full h-11 bg-[#1e3a5f] hover:bg-[#2a5082] gap-2"
      >
        <Save size={18} />
        Guardar Configuración
      </Button>
    </div>
  );
}