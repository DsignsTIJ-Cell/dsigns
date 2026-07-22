"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Loader2,
  Package,
  Search,
  DollarSign,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { useAppStore } from "@/stores/appStore";
import { toast } from "sonner";
import type { Cliente, Producto, CotizacionItem, Configuracion, UnidadMedida } from "@/types";
import { UNIDADES_MEDIDA, calcularPrecioItem } from "@/types";

interface ItemForm {
  productoId: string;
  codigo: string;
  descripcion: string;
  tieneDimensiones: boolean;
  unidadMedida: UnidadMedida;
  precioBaseM2: number;
  utilidadPorcentaje: number;
  alto: string;
  ancho: string;
  cantidad: string;
  opcion: string;
}

const emptyItem: ItemForm = {
  productoId: "",
  codigo: "",
  descripcion: "",
  tieneDimensiones: false,
  unidadMedida: "pie2",
  precioBaseM2: 0,
  utilidadPorcentaje: 50,
  alto: "",
  ancho: "",
  cantidad: "1",
  opcion: "",
};

export function CotizacionForm() {
  const { editingCotizacionId, setCreatingCotizacion, setEditingCotizacionId } = useAppStore();
  const isEditing = !!editingCotizacionId;

  // Datos maestros
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [config, setConfig] = useState<Configuracion | null>(null);
  const [loading, setLoading] = useState(true);

  // Formulario
  const [titulo, setTitulo] = useState("");
  const [clienteId, setClienteId] = useState("");
  const [tipoCambio, setTipoCambio] = useState("17.5");
  const [monedaAnticipo, setMonedaAnticipo] = useState<"MXN" | "USD">("MXN");
  const [items, setItems] = useState<ItemForm[]>([]);
  const [saving, setSaving] = useState(false);

  // Selector de producto
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerSearch, setPickerSearch] = useState("");
  const [pickerTargetIdx, setPickerTargetIdx] = useState(-1);

  // Cargar datos maestros (y datos de cotización si estamos editando)
  useEffect(() => {
    Promise.all([
      fetch("/api/clientes").then((r) => r.json()),
      fetch("/api/productos?activos=true").then((r) => r.json()),
      fetch("/api/config").then((r) => r.json()),
    ])
      .then(async ([cls, prods, cfg]) => {
        setClientes(cls);
        setProductos(prods);
        setConfig(cfg);
        setTipoCambio(String(cfg.tipoCambio || 17.5));

        // Si estamos editando, cargar datos de la cotización
        if (editingCotizacionId) {
          try {
            const res = await fetch(`/api/cotizaciones/${editingCotizacionId}`);
            if (res.ok) {
              const cot = await res.json();
              setTitulo(cot.titulo || "");
              setClienteId(cot.clienteId || "");
              setTipoCambio(String(cot.tipoCambio || 17.5));
              setMonedaAnticipo(cot.monedaAnticipo || "MXN");
              // Precargar items
              if (cot.items && cot.items.length > 0) {
                setItems(
                  cot.items.map((it: Record<string, unknown>) => ({
                    productoId: "",
                    codigo: String(it.codigo || ""),
                    descripcion: String(it.descripcion || ""),
                    tieneDimensiones: Number(it.alto) > 0 && Number(it.ancho) > 0,
                    unidadMedida: (it.unidadMedida as UnidadMedida) || "pie2",
                    precioBaseM2: Number(it.precioBaseM2) || 0,
                    utilidadPorcentaje: Number(it.utilidadPorcentaje) || 50,
                    alto: Number(it.alto) > 0 ? String(it.alto) : "",
                    ancho: Number(it.ancho) > 0 ? String(it.ancho) : "",
                    cantidad: String(it.cantidad || 1),
                    opcion: String(it.opcion || ""),
                  }))
                );
              }
            }
          } catch {
            toast.error("Error al cargar cotización");
          }
        }
      })
      .catch(() => toast.error("Error al cargar datos"))
      .finally(() => setLoading(false));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Agregar item vacío
  const addItem = useCallback(() => {
    setItems((prev) => [...prev, { ...emptyItem }]);
  }, []);

  // Abrir picker para un item
  const openPicker = (idx: number) => {
    setPickerTargetIdx(idx);
    setPickerSearch("");
    setPickerOpen(true);
  };

  // Seleccionar producto del picker
  const selectProducto = (prod: Producto) => {
    if (pickerTargetIdx < 0) return;
    setItems((prev) => {
      const copy = [...prev];
      copy[pickerTargetIdx] = {
        ...copy[pickerTargetIdx],
        productoId: prod.id,
        codigo: prod.codigo,
        descripcion: prod.descripcion,
        tieneDimensiones: prod.tieneDimensiones,
        unidadMedida: prod.unidadMedida,
        precioBaseM2: prod.precioBaseM2,
        utilidadPorcentaje: prod.utilidadDefault,
        alto: "",
        ancho: "",
        cantidad: "1",
        opcion: "",
      };
      return copy;
    });
    setPickerOpen(false);
  };

  // Actualizar campo de un item
  const updateItem = (idx: number, field: keyof ItemForm, value: string) => {
    setItems((prev) => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], [field]: value };
      return copy;
    });
  };

  // Eliminar item
  const removeItem = (idx: number) => {
    setItems((prev) => prev.filter((_, i) => i !== idx));
  };

  // Calcular item individual
  const calcItem = (item: ItemForm) => {
    if (!item.tieneDimensiones) {
      const prod = productos.find((p) => p.id === item.productoId);
      const pu = prod?.precioUnitario || 0;
      const cant = parseFloat(item.cantidad) || 1;
      return { precioUnitario: pu, total: pu * cant };
    }
    const alto = parseFloat(item.alto) || 0;
    const ancho = parseFloat(item.ancho) || 0;
    if (alto === 0 || ancho === 0) return { precioUnitario: 0, total: 0 };
    const result = calcularPrecioItem({
      alto,
      ancho,
      precioBaseM2: item.precioBaseM2,
      utilidadPorcentaje: item.utilidadPorcentaje,
      cantidad: parseFloat(item.cantidad) || 1,
    });
    return { precioUnitario: result.precioUnitario, total: result.total };
  };

  // Resumen
  const resumen = useMemo(() => {
    const subtotal = items.reduce((sum, it) => sum + calcItem(it).total, 0);
    const ivaPct = (config?.ivaPorcentaje || 8) / 100;
    const isrPct = (config?.retencionISRPorcentaje || 1.25) / 100;
    const iva = subtotal * ivaPct;
    const retISR = subtotal * isrPct;
    const total = subtotal - iva - retISR;
    const tc = parseFloat(tipoCambio) || 17.5;
    const anticipo = monedaAnticipo === "USD" ? (total * 0.5) / tc : total * 0.5;
    const totalUSD = total / tc;
    return { subtotal, iva, retISR, total, anticipo, totalUSD };
  }, [items, config, tipoCambio, monedaAnticipo]);

  // Productos filtrados para picker
  const filteredProducts = useMemo(() => {
    if (!pickerSearch) return productos;
    const q = pickerSearch.toLowerCase();
    return productos.filter(
      (p) =>
        p.codigo.toLowerCase().includes(q) ||
        p.descripcion.toLowerCase().includes(q)
    );
  }, [productos, pickerSearch]);

  // Guardar cotización
  const handleSave = async () => {
    if (!clienteId) {
      toast.error("Selecciona un cliente");
      return;
    }
    if (!titulo.trim()) {
      toast.error("Ingresa el título de la cotización");
      return;
    }
    if (items.length === 0) {
      toast.error("Agrega al menos un producto");
      return;
    }

    // Validar items
    for (let i = 0; i < items.length; i++) {
      const it = items[i];
      if (!it.productoId) {
        toast.error(`Item ${i + 1}: selecciona un producto`);
        return;
      }
      if (it.tieneDimensiones && (!it.alto || !it.ancho)) {
        toast.error(`Item ${i + 1}: ingresa alto y ancho`);
        return;
      }
    }

    try {
      setSaving(true);
      const cotizacionItems: Record<string, unknown>[] = items.map((it, i) => {
        if (!it.tieneDimensiones) {
          const prod = productos.find((p) => p.id === it.productoId);
          const pu = prod?.precioUnitario || 0;
          const cant = parseFloat(it.cantidad) || 1;
          return {
            codigo: it.codigo,
            descripcion: it.descripcion,
            alto: 0,
            ancho: 0,
            area: 0,
            unidadMedida: it.unidadMedida,
            precioBaseM2: 0,
            precioBaseTotal: 0,
            utilidadPorcentaje: 0,
            montoUtilidad: 0,
            precioUnitario: pu,
            cantidad: cant,
            total: pu * cant,
            opcion: it.opcion,
            orden: i,
          };
        }
        const alto = parseFloat(it.alto) || 0;
        const ancho = parseFloat(it.ancho) || 0;
        const calc = calcularPrecioItem({
          alto,
          ancho,
          precioBaseM2: it.precioBaseM2,
          utilidadPorcentaje: it.utilidadPorcentaje,
          cantidad: parseFloat(it.cantidad) || 1,
        });
        return {
          codigo: it.codigo,
          descripcion: it.descripcion,
          alto,
          ancho,
          area: calc.area,
          unidadMedida: it.unidadMedida,
          precioBaseM2: it.precioBaseM2,
          precioBaseTotal: calc.precioBaseTotal,
          utilidadPorcentaje: it.utilidadPorcentaje,
          montoUtilidad: calc.montoUtilidad,
          precioUnitario: calc.precioUnitario,
          cantidad: parseFloat(it.cantidad) || 1,
          total: calc.total,
          opcion: it.opcion,
          orden: i,
        };
      });

      const url = isEditing ? "/api/cotizaciones" : "/api/cotizaciones";
      const method = isEditing ? "PUT" : "POST";
      const bodyData: Record<string, unknown> = {
        clienteId,
        titulo: titulo.trim(),
        tipoCambio: parseFloat(tipoCambio) || 17.5,
        monedaAnticipo,
        items: cotizacionItems,
      };
      if (isEditing) bodyData.id = editingCotizacionId;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyData),
      });

      if (res.ok) {
        const data = await res.json();
        toast.success(isEditing ? `Cotización ${data.numeroCotizacion} actualizada` : `Cotización ${data.numeroCotizacion} creada`);
        setCreatingCotizacion(false);
        setEditingCotizacionId(null);
      } else {
        const err = await res.json();
        toast.error(err.error || "Error al guardar");
      }
    } catch {
      toast.error("Error de conexión");
    } finally {
      setSaving(false);
    }
  };

  const fmt = (n: number) =>
    n.toLocaleString("es-MX", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const selectedCliente = clientes.find((c) => c.id === clienteId);

  // Preview del nombre compuesto de cotización
  const tituloCompuesto = useMemo(() => {
    const partes = ["S0--- Cotización"];
    if (selectedCliente?.empresa) partes.push(selectedCliente.empresa);
    else if (selectedCliente?.nombre) partes.push(selectedCliente.nombre);
    if (titulo.trim()) partes.push(titulo.trim());
    return partes.join(" - ");
  }, [selectedCliente, titulo]);

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Encabezado */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9"
          onClick={() => {
            setCreatingCotizacion(false);
            setEditingCotizacionId(null);
          }}
        >
          <ArrowLeft size={18} />
        </Button>
        <div>
          <h2 className="text-base font-bold text-[#1e3a5f]">
            {isEditing ? "Editar Cotización" : "Nueva Cotización"}
          </h2>
          <p className="text-[10px] text-muted-foreground">
            {tituloCompuesto}
          </p>
        </div>
      </div>

      {/* Datos generales */}
      <Card>
        <CardContent className="p-3 space-y-3">
          {/* Cliente */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Cliente *</Label>
            <Select value={clienteId} onValueChange={setClienteId}>
              <SelectTrigger className="h-10">
                <SelectValue placeholder="Seleccionar cliente..." />
              </SelectTrigger>
              <SelectContent>
                {clientes.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.clienteId} — {c.nombre}
                    {c.empresa ? ` · ${c.empresa}` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Título de la cotización */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Título de Cotización *</Label>
            <Input
              placeholder="Ej: Letrero de plano en Acrilico y PVC"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              className="h-10"
            />
            {titulo.trim() && selectedCliente && (
              <p className="text-[10px] text-[#1e3a5f] font-medium truncate">
                Vista previa: {tituloCompuesto}
              </p>
            )}
          </div>

          {/* Tipo de cambio y moneda anticipo */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs flex items-center gap-1">
                <DollarSign size={12} /> Tipo de Cambio
              </Label>
              <Input
                type="number"
                step="0.01"
                value={tipoCambio}
                onChange={(e) => setTipoCambio(e.target.value)}
                className="h-10"
              />
              <p className="text-[10px] text-muted-foreground">1 USD = $MXN</p>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Moneda del Anticipo (50%)</Label>
              <Select
                value={monedaAnticipo}
                onValueChange={(v) => setMonedaAnticipo(v as "MXN" | "USD")}
              >
                <SelectTrigger className="h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MXN">MXN - Pesos</SelectItem>
                  <SelectItem value="USD">USD - Dólares</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {selectedCliente && (
            <div className="bg-blue-50 rounded-md p-2.5 text-xs space-y-0.5">
              <p className="font-medium text-[#1e3a5f]">{selectedCliente.nombre}</p>
              {selectedCliente.empresa && (
                <p className="text-muted-foreground">{selectedCliente.empresa}</p>
              )}
              {selectedCliente.telefono && (
                <p className="text-muted-foreground">Tel: {selectedCliente.telefono}</p>
              )}
              {selectedCliente.email && (
                <p className="text-muted-foreground">{selectedCliente.email}</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Items */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold">Productos / Servicios</h3>
          <Badge variant="secondary" className="text-[10px]">
            {items.length} item(s)
          </Badge>
        </div>

        {items.length === 0 ? (
          <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg">
            <Package size={32} className="mx-auto text-muted-foreground/30 mb-2" />
            <p className="text-sm text-muted-foreground">Sin productos</p>
            <Button
              onClick={addItem}
              variant="outline"
              className="mt-3 gap-2 text-xs"
            >
              <Plus size={14} /> Agregar producto
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item, idx) => {
              const calc = calcItem(item);
              const um = UNIDADES_MEDIDA[item.unidadMedida] || "";
              return (
                <Card key={idx} className="overflow-hidden">
                  <CardContent className="p-3 space-y-3">
                    {/* Encabezado del item */}
                    <div className="flex items-start gap-2">
                      <div className="flex-1 min-w-0">
                        {/* Selector de producto */}
                        {!item.productoId ? (
                          <Button
                            variant="outline"
                            className="w-full h-9 text-xs justify-start gap-2 border-dashed"
                            onClick={() => openPicker(idx)}
                          >
                            <Search size={14} /> Seleccionar producto...
                          </Button>
                        ) : (
                          <div
                            className="cursor-pointer hover:bg-gray-50 rounded-md p-1.5 -m-1.5"
                            onClick={() => openPicker(idx)}
                          >
                            <div className="flex items-center gap-2">
                              <Badge className="text-[10px] bg-blue-50 text-[#1e3a5f]">
                                {item.codigo}
                              </Badge>
                              {item.tieneDimensiones && (
                                <Badge variant="outline" className="text-[10px]">
                                  {um}
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs mt-0.5 truncate">{item.descripcion}</p>
                          </div>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive shrink-0"
                        onClick={() => removeItem(idx)}
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>

                    {/* Campos según tipo */}
                    {item.productoId && !item.tieneDimensiones && (
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <Label className="text-[10px]">Precio Unitario</Label>
                          <p className="text-sm font-bold text-[#1e3a5f]">
                            ${fmt(productos.find((p) => p.id === item.productoId)?.precioUnitario || 0)}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-[10px]">Cantidad</Label>
                          <Input
                            type="number"
                            min="1"
                            value={item.cantidad}
                            onChange={(e) => updateItem(idx, "cantidad", e.target.value)}
                            className="h-9 text-sm"
                          />
                        </div>
                      </div>
                    )}

                    {item.productoId && item.tieneDimensiones && (
                      <div className="space-y-3">
                        <div className="grid grid-cols-3 gap-2">
                          <div className="space-y-1">
                            <Label className="text-[10px]">Alto ({um.replace("²", "")})</Label>
                            <Input
                              type="number"
                              step="0.01"
                              placeholder="0"
                              value={item.alto}
                              onChange={(e) => updateItem(idx, "alto", e.target.value)}
                              className="h-9 text-sm"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-[10px]">Ancho ({um.replace("²", "")})</Label>
                            <Input
                              type="number"
                              step="0.01"
                              placeholder="0"
                              value={item.ancho}
                              onChange={(e) => updateItem(idx, "ancho", e.target.value)}
                              className="h-9 text-sm"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-[10px]">Cantidad</Label>
                            <Input
                              type="number"
                              min="1"
                              value={item.cantidad}
                              onChange={(e) => updateItem(idx, "cantidad", e.target.value)}
                              className="h-9 text-sm"
                            />
                          </div>
                        </div>

                        {/* Opción label */}
                        <div className="space-y-1">
                          <Label className="text-[10px]">Opción (opcional)</Label>
                          <Input
                            placeholder="Opción 1, Opción 2..."
                            value={item.opcion}
                            onChange={(e) => updateItem(idx, "opcion", e.target.value)}
                            className="h-8 text-xs"
                          />
                        </div>

                        {/* Cálculo en vivo */}
                        {(parseFloat(item.alto) > 0 && parseFloat(item.ancho) > 0) && (
                          <div className="bg-gray-50 rounded-md p-2 space-y-0.5 text-[11px]">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">
                                {fmt(parseFloat(item.alto) * parseFloat(item.ancho))} {um} x ${fmt(item.precioBaseM2)}
                              </span>
                              <span>${fmt(calc.precioUnitario * (1 - item.utilidadPorcentaje / (100 + item.utilidadPorcentaje)))}</span>
                            </div>
                            <div className="flex justify-between text-amber-700">
                              <span>+ Utilidad {item.utilidadPorcentaje}%</span>
                              <span>
                                +${fmt(calc.precioUnitario * (item.utilidadPorcentaje / (100 + item.utilidadPorcentaje)))}
                              </span>
                            </div>
                            <div className="flex justify-between font-bold pt-1 border-t border-gray-200">
                              <span>
                                Unitario x {item.cantidad || 1}
                              </span>
                              <span className="text-[#1e3a5f]">${fmt(calc.total)}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}

            {/* Botón agregar */}
            <Button
              variant="outline"
              className="w-full h-9 gap-2 text-xs border-dashed"
              onClick={addItem}
            >
              <Plus size={14} /> Agregar otro producto
            </Button>
          </div>
        )}
      </div>

      {/* Resumen financiero */}
      {items.length > 0 && (
        <Card className="border-[#1e3a5f]/20">
          <CardContent className="p-3 space-y-2">
            <h3 className="text-sm font-semibold text-[#1e3a5f]">Resumen</h3>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>${fmt(resumen.subtotal)}</span>
              </div>
              <div className="flex justify-between text-red-600">
                <span>- IVA ({config?.ivaPorcentaje || 8}%)</span>
                <span>-${fmt(resumen.iva)}</span>
              </div>
              <div className="flex justify-between text-red-600">
                <span>- Ret. ISR ({config?.retencionISRPorcentaje || 1.25}%)</span>
                <span>-${fmt(resumen.retISR)}</span>
              </div>
              <Separator />
              <div className="flex justify-between text-sm font-bold">
                <span>Total</span>
                <span className="text-[#1e3a5f]">${fmt(resumen.total)}</span>
              </div>
              <div className="flex justify-between text-green-700">
                <span>Anticipo 50% ({monedaAnticipo})</span>
                <span>${fmt(resumen.anticipo)} {monedaAnticipo}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Saldo</span>
                <span>
                  ${fmt(resumen.total - resumen.anticipo)} {monedaAnticipo === "MXN" ? "MXN" : "MXN"}
                </span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Equiv. USD (total)</span>
                <span>${fmt(resumen.totalUSD)} USD</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Botón guardar */}
      <Button
        onClick={handleSave}
        disabled={saving || items.length === 0}
        className="w-full h-12 bg-[#1e3a5f] hover:bg-[#2a5082] gap-2 text-sm font-semibold"
      >
        {saving ? (
          <Loader2 size={18} className="animate-spin" />
        ) : (
          <CheckCircle2 size={18} />
        )}
        {saving ? "Guardando..." : isEditing ? "Guardar Cambios" : "Crear Cotización"}
      </Button>

      {/* Sheet: Selector de productos */}
      <Sheet open={pickerOpen} onOpenChange={setPickerOpen}>
        <SheetContent side="bottom" className="max-h-[70vh]">
          <SheetHeader className="pb-2">
            <SheetTitle className="text-sm">Seleccionar Producto</SheetTitle>
            <SheetDescription className="text-xs">
              {filteredProducts.length} producto(s) disponible(s)
            </SheetDescription>
          </SheetHeader>
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por código o descripción..."
              value={pickerSearch}
              onChange={(e) => setPickerSearch(e.target.value)}
              className="pl-9 h-9 text-sm"
              autoFocus
            />
          </div>
          <div className="overflow-y-auto max-h-[45vh] space-y-1.5">
            {filteredProducts.length === 0 ? (
              <p className="text-center text-xs text-muted-foreground py-6">
                No se encontraron productos
              </p>
            ) : (
              filteredProducts.map((prod) => (
                <button
                  key={prod.id}
                  onClick={() => selectProducto(prod)}
                  className="w-full text-left p-2.5 rounded-lg hover:bg-gray-50 border border-transparent hover:border-gray-200 transition-colors"
                >
                  <div className="flex items-center gap-2 mb-0.5">
                    <Badge className="text-[10px] bg-blue-50 text-[#1e3a5f]">
                      {prod.codigo}
                    </Badge>
                    {prod.tieneDimensiones && (
                      <Badge variant="outline" className="text-[10px]">
                        {UNIDADES_MEDIDA[prod.unidadMedida]}
                      </Badge>
                    )}
                    <span className="text-[10px] text-green-700 ml-auto font-medium">
                      ${fmt(prod.precioBaseM2)}/{UNIDADES_MEDIDA[prod.unidadMedida]}
                    </span>
                  </div>
                  <p className="text-xs truncate">{prod.descripcion}</p>
                </button>
              ))
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}