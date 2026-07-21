"use client";

import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
  DrawerDescription,
} from "@/components/ui/drawer";
import {
  UNIDADES_MEDIDA_OPTIONS,
  UNIDADES_MEDIDA,
  type Producto,
  type UnidadMedida,
} from "@/types";

interface ProductoFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  producto?: Producto | null;
  onSave: (data: Record<string, unknown>) => void;
  loading?: boolean;
}

function getEjemploArea(unidad: UnidadMedida): { alto: number; ancho: number; label: string } {
  switch (unidad) {
    case "cm2": return { alto: 120, ancho: 90, label: "120 x 90 cm = 10,800 cm²" };
    case "m2": return { alto: 1.2, ancho: 0.9, label: "1.2 x 0.9 m = 1.08 m²" };
    case "in2": return { alto: 48, ancho: 36, label: "48 x 36 in = 1,728 in²" };
    case "pie2": return { alto: 4, ancho: 3, label: "4 x 3 pies = 12 pie²" };
  }
}

export function ProductoFormInner({
  producto,
  onSave,
  loading,
  onClose,
}: Omit<ProductoFormProps, "open" | "onOpenChange"> & { onClose: () => void }) {
  const isEdit = !!producto?.id;

  // Utilidad global desde configuración
  const [utilidadGlobal, setUtilidadGlobal] = useState(50);

  const [form, setForm] = useState({
    codigo: "",
    descripcion: "",
    precioBaseM2: "",
    tieneDimensiones: true,
    unidadMedida: "pie2" as UnidadMedida,
    precioUnitario: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Cargar datos del producto al editar
  useEffect(() => {
    if (producto) {
      setForm({
        codigo: producto.codigo,
        descripcion: producto.descripcion,
        precioBaseM2: String(producto.precioBaseM2 || ""),
        tieneDimensiones: producto.tieneDimensiones,
        unidadMedida: (producto.unidadMedida || "pie2") as UnidadMedida,
        precioUnitario: String(producto.precioUnitario || ""),
      });
    }
  }, [producto]);

  // Cargar utilidad global desde la API de configuración
  useEffect(() => {
    fetch("/api/config")
      .then((r) => r.json())
      .then((data) => {
        if (data.utilidadDefault != null) {
          setUtilidadGlobal(data.utilidadDefault);
        }
      })
      .catch(() => {});
  }, []);

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!form.codigo.trim()) e.codigo = "El código es obligatorio";
    if (!form.descripcion.trim()) e.descripcion = "La descripción es obligatoria";
    if (!form.tieneDimensiones && !form.precioUnitario) {
      e.precioUnitario = "Ingresa el precio fijo";
    }
    if (form.tieneDimensiones && !form.precioBaseM2) {
      e.precioBaseM2 = `Ingresa el precio base por ${UNIDADES_MEDIDA[form.unidadMedida]}`;
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const recalcPrecio = () => {
    if (form.tieneDimensiones && form.precioBaseM2) {
      const pb = parseFloat(form.precioBaseM2) || 0;
      const { alto, ancho } = getEjemploArea(form.unidadMedida);
      const area = alto * ancho;
      const base = pb * area;
      const conUtilidad = base + base * (utilidadGlobal / 100);
      setForm((f) => ({ ...f, precioUnitario: String(conUtilidad.toFixed(2)) }));
    }
  };

  const handleSubmit = () => {
    if (!validate()) return;
    onSave({
      ...(isEdit ? { id: producto!.id } : {}),
      codigo: form.codigo.trim().toUpperCase(),
      descripcion: form.descripcion.trim(),
      precioBaseM2: form.tieneDimensiones ? (parseFloat(form.precioBaseM2) || 0) : 0,
      tieneDimensiones: form.tieneDimensiones,
      unidadMedida: form.unidadMedida,
      utilidadDefault: utilidadGlobal,
      precioUnitario: parseFloat(form.precioUnitario) || 0,
      activo: true,
    });
  };

  // Datos del cálculo de ejemplo
  const ejemplo = getEjemploArea(form.unidadMedida);
  const areaEjemplo = ejemplo.alto * ejemplo.ancho;
  const pb = parseFloat(form.precioBaseM2) || 0;
  const baseEjemplo = pb * areaEjemplo;
  const utilEjemplo = baseEjemplo * (utilidadGlobal / 100);
  const totalEjemplo = baseEjemplo + utilEjemplo;
  const um = UNIDADES_MEDIDA[form.unidadMedida];
  const fmt = (n: number) => n.toLocaleString("es-MX", { minimumFractionDigits: 2 });

  return (
    <>
      <DrawerHeader className="border-b border-border">
        <DrawerTitle className="text-base">
          {isEdit ? "Editar Producto" : "Nuevo Producto"}
        </DrawerTitle>
        <DrawerDescription className="text-xs">
          {isEdit
            ? "Modifica los datos del producto o servicio"
            : "Agrega un nuevo producto o servicio al catálogo"}
        </DrawerDescription>
      </DrawerHeader>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 max-h-[60vh]">
        {/* Código */}
        <div className="space-y-1.5">
          <Label className="text-xs font-medium">Código *</Label>
          <Input
            placeholder="A0520"
            value={form.codigo}
            onChange={(e) =>
              setForm({ ...form, codigo: e.target.value.toUpperCase() })
            }
            className="h-10"
            disabled={isEdit}
          />
          {errors.codigo && (
            <p className="text-xs text-destructive">{errors.codigo}</p>
          )}
        </div>

        {/* Descripción */}
        <div className="space-y-1.5">
          <Label className="text-xs font-medium">Descripción *</Label>
          <Textarea
            placeholder="Impresión en acrílico 3mm con soportes metálicos"
            value={form.descripcion}
            onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
            rows={2}
          />
          {errors.descripcion && (
            <p className="text-xs text-destructive">{errors.descripcion}</p>
          )}
        </div>

        {/* Requiere dimensiones */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
          <div>
            <Label className="text-xs font-medium">Requiere Alto x Ancho</Label>
            <p className="text-[10px] text-muted-foreground">
              El precio se calcula con base en las dimensiones
            </p>
          </div>
          <Switch
            checked={form.tieneDimensiones}
            onCheckedChange={(checked) =>
              setForm({ ...form, tieneDimensiones: checked, precioUnitario: "" })
            }
          />
        </div>

        {/* Campos dimensionales */}
        {form.tieneDimensiones && (
          <div className="space-y-3 p-3 rounded-lg border border-blue-200 bg-blue-50/50">
            <p className="text-xs font-medium text-[#1e3a5f]">
              Configuración de precio por dimensiones
            </p>

            {/* Unidad de medida */}
            <div className="space-y-1.5">
              <Label className="text-xs">Unidad de Medida</Label>
              <Select
                value={form.unidadMedida}
                onValueChange={(v) => {
                  setForm({ ...form, unidadMedida: v as UnidadMedida, precioUnitario: "" });
                  setTimeout(recalcPrecio, 0);
                }}
              >
                <SelectTrigger className="h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {UNIDADES_MEDIDA_OPTIONS.map((u) => (
                    <SelectItem key={u.value} value={u.value}>
                      {u.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Precio base */}
            <div className="space-y-1.5">
              <Label className="text-xs">Precio Base por {um} *</Label>
              <Input
                type="number"
                step="0.01"
                placeholder={um === "pie²" ? "1031.50" : um === "m²" ? "850.00" : "5.50"}
                value={form.precioBaseM2}
                onChange={(e) =>
                  setForm({ ...form, precioBaseM2: e.target.value })
                }
                className="h-10"
                onBlur={recalcPrecio}
              />
              {errors.precioBaseM2 && (
                <p className="text-xs text-destructive">{errors.precioBaseM2}</p>
              )}
            </div>

            {/* Indicador de utilidad (solo lectura, desde config global) */}
            <div className="flex items-center gap-2 p-2.5 rounded-md bg-amber-50 border border-amber-200">
              <div className="flex-1">
                <p className="text-xs text-amber-800 font-medium">
                  Utilidad aplicada: {utilidadGlobal}%
                </p>
                <p className="text-[10px] text-amber-600">
                  Configurada en Configuración &gt; Fiscal
                </p>
              </div>
            </div>

            {/* Cálculo de ejemplo dinámico */}
            {form.precioBaseM2 && (
              <div className="bg-white rounded-md p-2.5 space-y-1">
                <p className="text-[10px] text-muted-foreground font-medium">
                  Ejemplo: {ejemplo.label}
                </p>
                <div className="text-[11px] space-y-0.5">
                  <div className="flex justify-between">
                    <span>{fmt(areaEjemplo)} {um} x ${form.precioBaseM2}</span>
                    <span>${fmt(baseEjemplo)}</span>
                  </div>
                  <div className="flex justify-between text-amber-700">
                    <span>+ Utilidad {utilidadGlobal}%</span>
                    <span>+${fmt(utilEjemplo)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-[#1e3a5f] pt-1 border-t border-blue-100">
                    <span>Precio de referencia</span>
                    <span>${fmt(totalEjemplo)}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Precio fijo */}
        {!form.tieneDimensiones && (
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Precio Fijo *</Label>
            <Input
              type="number"
              step="0.01"
              placeholder="520.00"
              value={form.precioUnitario}
              onChange={(e) =>
                setForm({ ...form, precioUnitario: e.target.value })
              }
              className="h-10"
            />
            {errors.precioUnitario && (
              <p className="text-xs text-destructive">
                {errors.precioUnitario}
              </p>
            )}
          </div>
        )}
      </div>

      <DrawerFooter className="border-t border-border gap-2">
        <Button
          onClick={handleSubmit}
          disabled={loading}
          className="h-11 bg-[#1e3a5f] hover:bg-[#2a5082] gap-2"
        >
          {loading && <Loader2 size={16} className="animate-spin" />}
          {isEdit ? "Guardar Cambios" : "Agregar Producto"}
        </Button>
        <Button
          variant="outline"
          onClick={onClose}
          className="h-10"
        >
          Cancelar
        </Button>
      </DrawerFooter>
    </>
  );
}

export function ProductoForm(props: ProductoFormProps) {
  return (
    <Drawer open={props.open} onOpenChange={props.onOpenChange}>
      <DrawerContent>
        <ProductoFormInner
          key={props.producto?.id ?? "new"}
          producto={props.producto}
          onSave={props.onSave}
          loading={props.loading}
          onClose={() => props.onOpenChange(false)}
        />
      </DrawerContent>
    </Drawer>
  );
}