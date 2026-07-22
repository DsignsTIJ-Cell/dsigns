import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { Cotizacion, CotizacionItem, Configuracion, Cliente, UnidadMedida } from "@/types";

const UNIDADES: Record<UnidadMedida, string> = {
  cm2: "cm\u00B2",
  m2: "m\u00B2",
  in2: "in\u00B2",
  pie2: "pie\u00B2",
};

const fmt = (n: number) =>
  n.toLocaleString("es-MX", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const fmtDate = (d: string) => {
  const date = new Date(d);
  return date.toLocaleDateString("es-MX", { day: "2-digit", month: "2-digit", year: "numeric" });
};

function construirTituloCompuesto(cot: Cotizacion, cliente?: Cliente): string {
  const partes = [cot.numeroCotizacion, "Cotizaci\u00F3n"];
  const nombreEmpresa = cliente?.empresa || cliente?.nombre || "";
  if (nombreEmpresa) partes.push(nombreEmpresa);
  if (cot.titulo?.trim()) partes.push(cot.titulo.trim());
  return partes.join(" - ");
}

export function generarPDF(cot: Cotizacion, config: Configuracion): Uint8Array {
  const doc = new jsPDF({ unit: "mm", format: "letter" });
  const pageW = doc.internal.pageSize.getWidth();
  const margin = 15;
  const contentW = pageW - margin * 2;
  const cliente = cot.cliente;
  const tituloCompuesto = construirTituloCompuesto(cot, cliente);

  // Color tema Dsigns
  const azul = [30, 58, 95] as [number, number, number]; // #1e3a5f
  const gris = [100, 100, 100] as [number, number, number];

  // ─── ENCABEZADO ───────────────────────────────────────────
  // Barra azul superior
  doc.setFillColor(...azul);
  doc.rect(0, 0, pageW, 28, "F");

  // Nombre de empresa
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text(config.nombreEmpresa || "Dsigns", margin, 14);

  // Datos de empresa en la barra
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  const datosEmpresa: string[] = [];
  if (config.telefono) datosEmpresa.push(`Tel: ${config.telefono}`);
  if (config.correo) datosEmpresa.push(config.correo);
  if (datosEmpresa.length > 0) {
    doc.text(datosEmpresa.join("  |  "), margin, 21);
  }

  // Asesor en la esquina derecha de la barra
  doc.setFontSize(8);
  doc.text(`Asesor: ${config.asesor || ""}`, pageW - margin, 14, { align: "right" });
  if (config.asesorTelefono) {
    doc.text(config.asesorTelefono, pageW - margin, 19, { align: "right" });
  }

  // ─── TÍTULO DE COTIZACIÓN ────────────────────────────────
  let y = 34;
  doc.setTextColor(...azul);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  // Dividir título compuesto si es muy largo
  const tituloLines = doc.splitTextToSize(tituloCompuesto, contentW);
  doc.text(tituloLines, margin, y);
  y += tituloLines.length * 5.5 + 4;

  // ─── LÍNEA SEPARADORA ────────────────────────────────────
  doc.setDrawColor(...azul);
  doc.setLineWidth(0.5);
  doc.line(margin, y, pageW - margin, y);
  y += 6;

  // ─── FECHA Y VIGENCIA ─────────────────────────────────────
  doc.setTextColor(...gris);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text(`Fecha: ${fmtDate(cot.fecha)}`, margin, y);
  doc.text(`Vigencia: ${fmtDate(cot.validoHasta)}`, margin + 60, y);
  doc.text(`Tipo de cambio: ${cot.tipoCambio} MXN/USD`, margin + 120, y);
  y += 8;

  // ─── DATOS DEL CLIENTE ───────────────────────────────────
  doc.setTextColor(...azul);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("CLIENTE", margin, y);
  y += 5;

  doc.setTextColor(40, 40, 40);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");

  const clienteLines: string[] = [];
  if (cliente?.nombre) clienteLines.push(cliente.nombre);
  if (cliente?.empresa) clienteLines.push(cliente.empresa);
  if (cliente?.telefono) clienteLines.push(`Tel: ${cliente.telefono}`);
  if (cliente?.email) clienteLines.push(cliente.email);

  for (const line of clienteLines) {
    doc.text(line, margin, y);
    y += 4.5;
  }
  y += 3;

  // ─── TABLA DE ITEMS ──────────────────────────────────────
  const umLabel = (um: string) => UNIDADES[um as UnidadMedida] || um;

  // Agrupar items por opcion si existen
  const tieneOpciones = cot.items.some((it) => it.opcion && it.opcion.trim());

  const tableBody: (string | number)[][] = [];

  // Agrupar por opcion
  const grupos = new Map<string, CotizacionItem[]>();
  for (const item of cot.items) {
    const key = item.opcion?.trim() || "__sin_opcion__";
    if (!grupos.has(key)) grupos.set(key, []);
    grupos.get(key)!.push(item);
  }

  for (const [opcion, items] of grupos) {
    if (tieneOpciones && opcion !== "__sin_opcion__") {
      tableBody.push([
        { content: opcion, colSpan: 6, styles: { fontStyle: "bold", fillColor: [240, 245, 250], textColor: azul } },
      ] as (string | number)[][][0]);
    }

    for (const item of items) {
      const dimensiones =
        item.alto > 0 && item.ancho > 0
          ? `${item.alto} x ${item.ancho} ${umLabel(item.unidadMedida)}`
          : "-";

      tableBody.push([
        item.codigo,
        item.descripcion,
        dimensiones,
        item.cantidad,
        `$${fmt(item.precioUnitario)}`,
        `$${fmt(item.total)}`,
      ]);
    }
  }

  autoTable(doc, {
    startY: y,
    head: [["C\u00F3digo", "Descripci\u00F3n", "Dimensiones", "Cant.", "Precio Unit.", "Total"]],
    body: tableBody as (string | number | { content: string; colSpan: number; styles?: Record<string, unknown> })[][],
    margin: { left: margin, right: margin },
    styles: {
      fontSize: 8,
      cellPadding: 2.5,
      textColor: [40, 40, 40],
      lineColor: [200, 200, 200],
      lineWidth: 0.1,
    },
    headStyles: {
      fillColor: azul,
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 8,
      halign: "left",
    },
    columnStyles: {
      0: { cellWidth: 18 },
      1: { cellWidth: "auto" },
      2: { cellWidth: 32, halign: "center" },
      3: { cellWidth: 14, halign: "center" },
      4: { cellWidth: 28, halign: "right" },
      5: { cellWidth: 28, halign: "right" },
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
  });

  // Obtener posición después de la tabla
  y = (doc as unknown as Record<string, number>).lastAutoTable?.finalY ?? y + 40;
  y += 6;

  // ─── RESUMEN FINANCIERO ──────────────────────────────────
  const resumenX = pageW - margin - 65;
  const resumenLabelX = resumenX;
  const resumenValueX = pageW - margin;

  // Fondo del resumen
  doc.setFillColor(245, 248, 252);
  doc.roundedRect(resumenX - 3, y - 3, 68, 58, 2, 2, "F");

  doc.setFontSize(8.5);
  const lineH = 7;

  // Subtotal
  doc.setTextColor(...gris);
  doc.setFont("helvetica", "normal");
  doc.text("Subtotal:", resumenLabelX, y);
  doc.setTextColor(40, 40, 40);
  doc.text(`$${fmt(cot.subtotal)}`, resumenValueX, y, { align: "right" });
  y += lineH;

  // IVA
  doc.setTextColor(180, 40, 40);
  doc.text(`- IVA (${config.ivaPorcentaje}%):`, resumenLabelX, y);
  doc.text(`-$${fmt(cot.iva)}`, resumenValueX, y, { align: "right" });
  y += lineH;

  // ISR
  doc.text(`- Ret. ISR (${config.retencionISRPorcentaje}%):`, resumenLabelX, y);
  doc.text(`-$${fmt(cot.retISR)}`, resumenValueX, y, { align: "right" });
  y += lineH;

  // Línea separadora
  doc.setDrawColor(...azul);
  doc.setLineWidth(0.4);
  doc.line(resumenLabelX, y - 1, resumenValueX, y - 1);
  y += 3;

  // Total
  doc.setTextColor(...azul);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("TOTAL:", resumenLabelX, y);
  doc.text(`$${fmt(cot.total)}`, resumenValueX, y, { align: "right" });
  y += 7;

  // Anticipo
  doc.setFontSize(8.5);
  doc.setTextColor(30, 120, 60);
  doc.setFont("helvetica", "bold");
  doc.text(`Anticipo 50% (${cot.monedaAnticipo}):`, resumenLabelX, y);
  doc.text(`$${fmt(cot.anticipo)} ${cot.monedaAnticipo}`, resumenValueX, y, { align: "right" });
  y += lineH;

  // Saldo
  doc.setTextColor(...gris);
  doc.setFont("helvetica", "normal");
  doc.text("Saldo:", resumenLabelX, y);
  doc.text(`$${fmt(cot.total - cot.anticipo)} MXN`, resumenValueX, y, { align: "right" });
  y += lineH + 2;

  // Equiv USD
  doc.setFontSize(7.5);
  doc.text(`Equiv. USD: $${fmt(cot.totalUSD)} USD`, resumenLabelX, y);
  y += 10;

  // ─── TÉRMINOS Y CONDICIONES ─────────────────────────────
  if (config.terminosCondiciones && config.terminosCondiciones.trim()) {
    // Verificar si hay espacio, si no nueva página
    const terminos = config.terminosCondiciones.trim();
    const lineasEstimadas = terminos.split("\n").length * 2 + 5;
    if (y + lineasEstimadas * 3.5 > doc.internal.pageSize.getHeight() - 20) {
      doc.addPage();
      y = margin;
    }

    doc.setFillColor(...azul);
    doc.roundedRect(margin, y - 3, contentW, 5, 1, 1, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.text("T\u00C9RMINOS Y CONDICIONES", margin + 3, y);
    y += 6;

    doc.setTextColor(60, 60, 60);
    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");

    const terminosLines = terminos.split("\n");
    for (const linea of terminosLines) {
      if (y > doc.internal.pageSize.getHeight() - 15) {
        doc.addPage();
        y = margin;
      }
      const wrapped = doc.splitTextToSize(linea, contentW - 4);
      for (const wLine of wrapped) {
        doc.text(wLine, margin + 2, y);
        y += 3.2;
      }
    }
  }

  // ─── PIE DE PÁGINA ───────────────────────────────────────
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    const pageH = doc.internal.pageSize.getHeight();

    // Línea de pie
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.2);
    doc.line(margin, pageH - 12, pageW - margin, pageH - 12);

    doc.setTextColor(150, 150, 150);
    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.text(`${config.nombreEmpresa || "Dsigns"} | ${config.correo || ""} | ${config.telefono || ""}`, margin, pageH - 7);
    doc.text(`P\u00E1gina ${i} de ${totalPages}`, pageW - margin, pageH - 7, { align: "right" });
  }

  return doc.output("arraybuffer") as Uint8Array;
}