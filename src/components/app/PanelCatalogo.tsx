"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Package,
  Plus,
  Search,
  Ruler,
  Percent,
  Pencil,
  Trash2,
  Loader2,
  MoreVertical,
  EyeOff,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAppStore } from "@/stores/appStore";
import { toast } from "sonner";
import { ProductoForm } from "./ProductoForm";
import type { Producto } from "@/types";

export function PanelCatalogo() {
  const { searchQuery, setSearchQuery } = useAppStore();
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editProducto, setEditProducto] = useState<Producto | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Producto | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [showInactivos, setShowInactivos] = useState(false);

  const fetchProductos = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append("q", searchQuery);
      if (!showInactivos) params.append("activos", "true");
      const res = await fetch(`/api/productos?${params}`);
      if (res.ok) {
        const data = await res.json();
        setProductos(data);
      }
    } catch {
      toast.error("Error al cargar productos");
    } finally {
      setLoading(false);
    }
  }, [searchQuery, showInactivos]);

  useEffect(() => {
    const timer = setTimeout(fetchProductos, 300);
    return () => clearTimeout(timer);
  }, [fetchProductos]);

  const handleSave = async (data: Record<string, unknown>) => {
    try {
      setSaving(true);
      const isEdit = !!data.id;
      const res = await fetch("/api/productos", {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        toast.success(
          isEdit ? "Producto actualizado" : "Producto agregado"
        );
        setFormOpen(false);
        setEditProducto(null);
        fetchProductos();
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

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      const res = await fetch(`/api/productos?id=${deleteTarget.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast.success("Producto eliminado");
        setDeleteTarget(null);
        fetchProductos();
      } else {
        toast.error("Error al eliminar");
      }
    } catch {
      toast.error("Error de conexión");
    } finally {
      setDeleting(false);
    }
  };

  const toggleActivo = async (prod: Producto) => {
    try {
      const res = await fetch("/api/productos", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: prod.id, activo: !prod.activo }),
      });
      if (res.ok) {
        toast.success(
          prod.activo ? "Producto desactivado" : "Producto activado"
        );
        fetchProductos();
      }
    } catch {
      toast.error("Error al cambiar estado");
    }
  };

  const fmt = (n: number) =>
    n.toLocaleString("es-MX", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const openEdit = (prod: Producto) => {
    setEditProducto(prod);
    setFormOpen(true);
  };

  const openNew = () => {
    setEditProducto(null);
    setFormOpen(true);
  };

  return (
    <>
      <div className="space-y-4">
        {/* Barra de búsqueda y acciones */}
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
          <Button
            variant="outline"
            size="icon"
            className="h-10 w-10 shrink-0"
            onClick={() => setShowInactivos(!showInactivos)}
            title={showInactivos ? "Ocultar inactivos" : "Mostrar todos"}
          >
            {showInactivos ? <EyeOff size={16} /> : <Eye size={16} />}
          </Button>
          <Button
            onClick={openNew}
            className="h-10 bg-[#1e3a5f] hover:bg-[#2a5082] shrink-0 gap-2"
          >
            <Plus size={18} />
            <span className="hidden sm:inline">Nuevo</span>
          </Button>
        </div>

        {/* Contador */}
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            {loading ? "Cargando..." : `${productos.length} producto(s)`}
          </p>
        </div>

        {/* Lista de productos */}
        <div className="space-y-2">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-3">
                  <div className="flex items-center gap-3">
                    <Skeleton className="w-10 h-10 rounded-lg" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                    <Skeleton className="h-4 w-20" />
                  </div>
                </CardContent>
              </Card>
            ))
          ) : productos.length === 0 ? (
            <div className="text-center py-12">
              <Package
                size={40}
                className="mx-auto text-muted-foreground/30 mb-3"
              />
              <p className="text-sm text-muted-foreground">
                {searchQuery
                  ? "No se encontraron productos"
                  : "No hay productos en el catálogo"}
              </p>
              {!searchQuery && (
                <Button
                  onClick={openNew}
                  variant="outline"
                  className="mt-3 gap-2"
                >
                  <Plus size={16} />
                  Agregar primer producto
                </Button>
              )}
            </div>
          ) : (
            productos.map((prod) => (
              <Card
                key={prod.id}
                className={`overflow-hidden transition-opacity ${
                  !prod.activo ? "opacity-50" : ""
                }`}
              >
                <CardContent className="p-3 space-y-2">
                  {/* Fila principal */}
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                        prod.activo
                          ? "bg-[#f3f4f6]"
                          : "bg-gray-200"
                      }`}
                    >
                      <Package
                        size={18}
                        className={
                          prod.activo
                            ? "text-[#1e3a5f]"
                            : "text-gray-400"
                        }
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-[#1e3a5f] bg-blue-50 px-2 py-0.5 rounded">
                          {prod.codigo}
                        </span>
                        {prod.tieneDimensiones && (
                          <Badge
                            variant="secondary"
                            className="text-[10px] px-1.5 py-0 gap-0.5"
                          >
                            <Ruler size={10} /> Medible
                          </Badge>
                        )}
                        <Badge
                          variant="outline"
                          className="text-[10px] px-1.5 py-0 gap-0.5"
                        >
                          <Percent size={10} /> {prod.utilidadDefault}%
                        </Badge>
                        {!prod.activo && (
                          <Badge
                            variant="secondary"
                            className="text-[10px] px-1.5 py-0"
                          >
                            Inactivo
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm truncate mt-0.5">
                        {prod.descripcion}
                      </p>
                    </div>

                    {/* Menú de acciones */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 shrink-0"
                        >
                          <MoreVertical size={16} />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEdit(prod)}>
                          <Pencil size={14} className="mr-2" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => toggleActivo(prod)}
                        >
                          {prod.activo ? (
                            <>
                              <EyeOff size={14} className="mr-2" />
                              Desactivar
                            </>
                          ) : (
                            <>
                              <Eye size={14} className="mr-2" />
                              Activar
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => setDeleteTarget(prod)}
                        >
                          <Trash2 size={14} className="mr-2" />
                          Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {/* Fila de precios */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pl-[52px]">
                    {prod.tieneDimensiones ? (
                      <>
                        <div className="bg-gray-50 rounded-md px-2.5 py-1.5">
                          <p className="text-[10px] text-muted-foreground leading-tight">
                            Precio Base/m2
                          </p>
                          <p className="text-xs font-semibold">
                            ${fmt(prod.precioBaseM2)}
                          </p>
                        </div>
                        <div className="bg-blue-50 rounded-md px-2.5 py-1.5">
                          <p className="text-[10px] text-[#1e3a5f] leading-tight">
                            Utilidad {prod.utilidadDefault}%
                          </p>
                          <p className="text-xs font-semibold text-[#1e3a5f]">
                            ${
                              fmt(
                                12 *
                                  prod.precioBaseM2 *
                                  (prod.utilidadDefault / 100)
                              )
                            }
                            /12pies²
                          </p>
                        </div>
                      </>
                    ) : (
                      <div className="bg-gray-50 rounded-md px-2.5 py-1.5">
                        <p className="text-[10px] text-muted-foreground leading-tight">
                          Precio Fijo
                        </p>
                        <p className="text-xs font-semibold">
                          ${fmt(prod.precioUnitario)}
                        </p>
                      </div>
                    )}
                    <div className="bg-green-50 rounded-md px-2.5 py-1.5">
                      <p className="text-[10px] text-green-700 leading-tight">
                        {prod.tieneDimensiones ? "Ejemplo 4x3 pies" : "Precio Unitario"}
                      </p>
                      <p className="text-xs font-bold text-green-700">
                        ${fmt(prod.precioUnitario)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Formulario drawer */}
      <ProductoForm
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) setEditProducto(null);
        }}
        producto={editProducto}
        onSave={handleSave}
        loading={saving}
      />

      {/* Diálogo de confirmación de eliminación */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar producto</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de eliminar{" "}
              <span className="font-semibold text-foreground">
                {deleteTarget?.codigo}
              </span>{" "}
              — {deleteTarget?.descripcion}? Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive hover:bg-destructive/90"
            >
              {deleting && <Loader2 size={16} className="animate-spin mr-2" />}
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
