"use client";

import { useState } from "react";
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
import type { Producto } from "@/types";

interface ProductoFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  producto?: Producto | null;
  onSave: (data: Record<string, unknown>) => void;
  loading?: boolean;
}

const emptyForm = {
  codigo: "",
  descripcion: "",
  precioBaseM2: "",
  tieneDimensiones: true,
  utilidadDefault: "50",
  precioUnitario: "",
};

function buildInitialForm(producto?: Producto | null) {
  if (producto) {
    return {
      codigo: producto.codigo,
      descripcion: producto.descripcion,
      precioBaseM2: String(producto.precioBaseM2 || ""),
      tieneDimensiones: producto.tieneDimensiones,
      utilidadDefault: String(producto.utilidadDefault),
      precioUnitario: String(producto.precioUnitario || ""),
    };
  }
  return { ...emptyForm };
}

export function ProductoFormInner({
  producto,
  onSave,
  loading,
  onClose,
}: Omit<ProductoFormProps, "open" | "onOpenChange"> & { onClose: () => void }) {
  const isEdit = !!producto?.id;
  const [form, setForm] = useState(() => buildInitialForm(producto));
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!form.codigo.trim()) e.codigo = "El código es obligatorio";
    if (!form.descripcion.trim()) e.descripcion = "La descripción es obligatoria";
    if (!form.tieneDimensiones && !form.precioUnitario) {
      e.precioUnitario = "Ingresa el precio fijo";
    }
    if (form.tieneDimensiones && !form.precioBaseM2) {
      e.precioBaseM2 = "Ingresa el precio base por m2";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const recalcPrecio = () => {
    if (form.tieneDimensiones && form.precioBaseM2 && form.utilidadDefault) {
      const pb = parseFloat(form.precioBaseM2) || 0;
      const util = parseFloat(form.utilidadDefault) || 0;
      const ejemploArea = 12;
      const base = pb * ejemploArea;
      const conUtilidad = base + base * (util / 100);
      setForm((f) => ({ ...f, precioUnitario: String(conUtilidad.toFixed(2)) }));
    }
  };

  const handleSubmit = () => {
    if (!validate()) return;
    const precioBaseM2 = form.tieneDimensiones
      ? parseFloat(form.precioBaseM2) || 0
      : 0;
    const precioUnitario = form.tieneDimensiones
      ? parseFloat(form.precioUnitario) || 0
      : parseFloat(form.precioUnitario) || 0;
    onSave({
      ...(isEdit ? { id: producto!.id } : {}),
      codigo: form.codigo.trim().toUpperCase(),
      descripcion: form.descripcion.trim(),
      precioBaseM2,
      tieneDimensiones: form.tieneDimensiones,
      utilidadDefault: parseFloat(form.utilidadDefault) || 50,
      precioUnitario,
      activo: true,
    });
  };

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

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Precio Base/m2 *</Label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="1031.50"
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
              <div className="space-y-1.5">
                <Label className="text-xs">Utilidad (%)</Label>
                <Select
                  value={form.utilidadDefault}
                  onValueChange={(v) => {
                    setForm({ ...form, utilidadDefault: v });
                    setTimeout(recalcPrecio, 0);
                  }}
                >
                  <SelectTrigger className="h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="50">50%</SelectItem>
                    <SelectItem value="65">65%</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {form.precioBaseM2 && (
              <div className="bg-white rounded-md p-2.5 space-y-1">
                <p className="text-[10px] text-muted-foreground font-medium">
                  Ejemplo de cálculo (4 x 3 pies = 12 pies²)
                </p>
                <div className="text-[11px] space-y-0.5">
                  <div className="flex justify-between">
                    <span>12 pies² x ${form.precioBaseM2}</span>
                    <span>
                      $
                      {(
                        12 * (parseFloat(form.precioBaseM2) || 0)
                      ).toLocaleString("es-MX", {
                        minimumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                  <div className="flex justify-between text-amber-700">
                    <span>+ Utilidad {form.utilidadDefault}%</span>
                    <span>
                      +$
                      {(
                        12 *
                        (parseFloat(form.precioBaseM2) || 0) *
                        ((parseFloat(form.utilidadDefault) || 0) / 100)
                      ).toLocaleString("es-MX", {
                        minimumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                  <div className="flex justify-between font-bold text-[#1e3a5f] pt-1 border-t border-blue-100">
                    <span>Precio de referencia</span>
                    <span>
                      $
                      {(
                        12 *
                        (parseFloat(form.precioBaseM2) || 0) *
                        (1 + (parseFloat(form.utilidadDefault) || 0) / 100)
                      ).toLocaleString("es-MX", {
                        minimumFractionDigits: 2,
                      })}
                    </span>
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
        {/* key forces remount when producto changes, resetting all state */}
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