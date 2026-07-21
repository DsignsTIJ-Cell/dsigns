"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Users,
  Plus,
  Search,
  Pencil,
  Trash2,
  Loader2,
  MoreVertical,
  Building2,
  Phone,
  Mail,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
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
import { ClienteForm } from "./ClienteForm";
import type { Cliente } from "@/types";

export function PanelClientes() {
  const { searchQuery, setSearchQuery } = useAppStore();
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editCliente, setEditCliente] = useState<Cliente | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Cliente | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchClientes = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchQuery) params.append("q", searchQuery);
      const res = await fetch(`/api/clientes?${params}`);
      if (res.ok) {
        const data = await res.json();
        setClientes(data);
      }
    } catch {
      toast.error("Error al cargar clientes");
    } finally {
      setLoading(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    const timer = setTimeout(fetchClientes, 300);
    return () => clearTimeout(timer);
  }, [fetchClientes]);

  const handleSave = async (data: Record<string, unknown>) => {
    try {
      setSaving(true);
      const isEdit = !!data.id;
      const res = await fetch("/api/clientes", {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        toast.success(
          isEdit ? "Cliente actualizado" : "Cliente agregado"
        );
        setFormOpen(false);
        setEditCliente(null);
        fetchClientes();
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
      const res = await fetch(`/api/clientes?id=${deleteTarget.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast.success("Cliente eliminado");
        setDeleteTarget(null);
        fetchClientes();
      } else {
        const err = await res.json();
        toast.error(err.error || "Error al eliminar. Puede tener cotizaciones asociadas.");
      }
    } catch {
      toast.error("Error de conexión");
    } finally {
      setDeleting(false);
    }
  };

  const openEdit = (cli: Cliente) => {
    setEditCliente(cli);
    setFormOpen(true);
  };

  const openNew = () => {
    setEditCliente(null);
    setFormOpen(true);
  };

  return (
    <>
      <div className="space-y-4">
        {/* Barra de búsqueda y nuevo */}
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
            {loading ? "Cargando..." : `${clientes.length} cliente(s)`}
          </p>
        </div>

        {/* Lista de clientes */}
        <div className="space-y-2">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-3">
                  <div className="flex items-center gap-3">
                    <Skeleton className="w-10 h-10 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                    <Skeleton className="h-4 w-20" />
                  </div>
                </CardContent>
              </Card>
            ))
          ) : clientes.length === 0 ? (
            <div className="text-center py-12">
              <Users
                size={40}
                className="mx-auto text-muted-foreground/30 mb-3"
              />
              <p className="text-sm text-muted-foreground">
                {searchQuery
                  ? "No se encontraron clientes"
                  : "No hay clientes registrados"}
              </p>
              {!searchQuery && (
                <Button
                  onClick={openNew}
                  variant="outline"
                  className="mt-3 gap-2"
                >
                  <Plus size={16} />
                  Agregar primer cliente
                </Button>
              )}
            </div>
          ) : (
            clientes.map((cli) => (
              <Card key={cli.id} className="overflow-hidden">
                <CardContent className="p-3">
                  <div className="flex items-center gap-3">
                    {/* Avatar con iniciales */}
                    <div className="w-10 h-10 rounded-full bg-[#1e3a5f] flex items-center justify-center shrink-0">
                      <span className="text-white text-sm font-bold">
                        {cli.nombre
                          .split(" ")
                          .map((w) => w[0])
                          .slice(0, 2)
                          .join("")
                          .toUpperCase()}
                      </span>
                    </div>

                    {/* Info principal */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {cli.nombre}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        {cli.empresa && (
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Building2 size={10} />
                            {cli.empresa}
                          </span>
                        )}
                      </div>
                      {/* Datos de contacto */}
                      {(cli.telefono || cli.email) && (
                        <div className="flex items-center gap-3 mt-1 flex-wrap">
                          {cli.telefono && (
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Phone size={10} />
                              {cli.telefono}
                            </span>
                          )}
                          {cli.email && (
                            <span className="text-xs text-muted-foreground flex items-center gap-1 truncate max-w-[180px]">
                              <Mail size={10} />
                              {cli.email}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* ID y menú */}
                    <div className="flex items-center gap-1 shrink-0">
                      <span className="text-[10px] font-bold text-[#1e3a5f] bg-blue-50 px-2 py-0.5 rounded">
                        {cli.clienteId}
                      </span>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                          >
                            <MoreVertical size={16} />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEdit(cli)}>
                            <Pencil size={14} className="mr-2" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => setDeleteTarget(cli)}
                          >
                            <Trash2 size={14} className="mr-2" />
                            Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Formulario drawer */}
      <ClienteForm
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) setEditCliente(null);
        }}
        cliente={editCliente}
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
            <AlertDialogTitle>Eliminar cliente</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de eliminar a{" "}
              <span className="font-semibold text-foreground">
                {deleteTarget?.nombre}
              </span>
              {deleteTarget?.empresa && (
                <>
                  {" "}— <span className="font-semibold text-foreground">
                    {deleteTarget.empresa}
                  </span>
                </>
              )}
              ? Si tiene cotizaciones asociadas no se podrá eliminar.
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