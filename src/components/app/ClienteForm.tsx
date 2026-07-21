"use client";

import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
  DrawerDescription,
} from "@/components/ui/drawer";
import type { Cliente } from "@/types";

interface ClienteFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cliente?: Cliente | null;
  onSave: (data: Record<string, unknown>) => void;
  loading?: boolean;
}

export function ClienteFormInner({
  cliente,
  onSave,
  loading,
  onClose,
}: Omit<ClienteFormProps, "open" | "onOpenChange"> & { onClose: () => void }) {
  const isEdit = !!cliente?.id;
  const [form, setForm] = useState({
    nombre: "",
    empresa: "",
    telefono: "",
    email: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (cliente) {
      setForm({
        nombre: cliente.nombre,
        empresa: cliente.empresa || "",
        telefono: cliente.telefono || "",
        email: cliente.email || "",
      });
    }
  }, [cliente]);

  // Generar siguiente ID de cliente
  const [nextId, setNextId] = useState("C0092");
  useEffect(() => {
    if (!isEdit) {
      fetch("/api/clientes")
        .then((r) => r.json())
        .then((data: Cliente[]) => {
          if (data.length > 0) {
            const nums = data
              .map((c) => parseInt(c.clienteId.replace("C", ""), 10))
              .filter((n) => !isNaN(n));
            const max = Math.max(...nums, 91);
            setNextId(`C${String(max + 1).padStart(4, "0")}`);
          }
        })
        .catch(() => {});
    }
  }, [isEdit]);

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!form.nombre.trim()) e.nombre = "El nombre es obligatorio";
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      e.email = "Correo electrónico no válido";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    onSave({
      ...(isEdit ? { id: cliente!.id } : { clienteId: nextId }),
      nombre: form.nombre.trim(),
      empresa: form.empresa.trim(),
      telefono: form.telefono.trim(),
      email: form.email.trim(),
    });
  };

  return (
    <>
      <DrawerHeader className="border-b border-border">
        <DrawerTitle className="text-base">
          {isEdit ? "Editar Cliente" : "Nuevo Cliente"}
        </DrawerTitle>
        <DrawerDescription className="text-xs">
          {isEdit
            ? "Modifica los datos del cliente"
            : "Agrega un nuevo cliente al sistema"}
        </DrawerDescription>
      </DrawerHeader>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 max-h-[60vh]">
        {/* ID del cliente (solo lectura) */}
        <div className="space-y-1.5">
          <Label className="text-xs font-medium">ID del Cliente</Label>
          <div className="flex items-center gap-2 h-10 px-3 rounded-md border border-input bg-muted/50 text-sm text-muted-foreground">
            {isEdit ? cliente!.clienteId : nextId}
          </div>
          <p className="text-[10px] text-muted-foreground">
            Se genera automáticamente de forma secuencial
          </p>
        </div>

        {/* Nombre */}
        <div className="space-y-1.5">
          <Label className="text-xs font-medium">Nombre / Razón Social *</Label>
          <Input
            placeholder="Teresa Garibaldi"
            value={form.nombre}
            onChange={(e) => setForm({ ...form, nombre: e.target.value })}
            className="h-10"
          />
          {errors.nombre && (
            <p className="text-xs text-destructive">{errors.nombre}</p>
          )}
        </div>

        {/* Empresa */}
        <div className="space-y-1.5">
          <Label className="text-xs font-medium">Empresa / Proyecto</Label>
          <Input
            placeholder="Costa Coronado Residencial"
            value={form.empresa}
            onChange={(e) => setForm({ ...form, empresa: e.target.value })}
            className="h-10"
          />
          <p className="text-[10px] text-muted-foreground">
            Opcional — nombre de la empresa o proyecto asociado
          </p>
        </div>

        {/* Teléfono */}
        <div className="space-y-1.5">
          <Label className="text-xs font-medium">Teléfono</Label>
          <Input
            type="tel"
            placeholder="(664) 729-7867"
            value={form.telefono}
            onChange={(e) => setForm({ ...form, telefono: e.target.value })}
            className="h-10"
          />
        </div>

        {/* Email */}
        <div className="space-y-1.5">
          <Label className="text-xs font-medium">Correo Electrónico</Label>
          <Input
            type="email"
            placeholder="cliente@ejemplo.com"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="h-10"
          />
          {errors.email && (
            <p className="text-xs text-destructive">{errors.email}</p>
          )}
        </div>
      </div>

      <DrawerFooter className="border-t border-border gap-2">
        <Button
          onClick={handleSubmit}
          disabled={loading}
          className="h-11 bg-[#1e3a5f] hover:bg-[#2a5082] gap-2"
        >
          {loading && <Loader2 size={16} className="animate-spin" />}
          {isEdit ? "Guardar Cambios" : "Agregar Cliente"}
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

export function ClienteForm(props: ClienteFormProps) {
  return (
    <Drawer open={props.open} onOpenChange={props.onOpenChange}>
      <DrawerContent>
        <ClienteFormInner
          key={props.cliente?.id ?? "new"}
          cliente={props.cliente}
          onSave={props.onSave}
          loading={props.loading}
          onClose={() => props.onOpenChange(false)}
        />
      </DrawerContent>
    </Drawer>
  );
}