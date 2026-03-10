/**
 * src/lib/pdf.ts
 *
 * Geração de PDFs client-side com jsPDF + jspdf-autotable.
 *
 * Instalar dependências:
 *   npm install jspdf jspdf-autotable
 */

import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

// ─── Tipos ────────────────────────────────────────────────────────────────────

export interface Transaction {
  date: string
  description: string
  category: string
  type: 'income' | 'expense'
  value: number
  source: string
}

export interface DASRecord {
  reference_month: string
  value: number
  paid_date: string
  receipt_number?: string | null
}

export interface QuoteItem {
  description: string
  quantity: number
  unit_price: number
}

export interface Quote {
  client_name: string
  description?: string | null
  items: QuoteItem[]
  total: number
  valid_until?: string | null
  notes?: string | null
  created_at: string
}

export interface ClientReport {
  name: string
  email?: string | null
  phone?: string | null
  total_revenue: number
  created_at: string
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatBRL(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function formatDate(dateStr: string): string {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  return d.toLocaleDateString('pt-BR')
}

function addHeader(doc: jsPDF, title: string, subtitle?: string) {
  // Fundo do header
  doc.setFillColor(6, 10, 18)
  doc.rect(0, 0, 210, 28, 'F')

  // Linha accent
  doc.setFillColor(59, 130, 246)
  doc.rect(0, 0, 4, 28, 'F')

  // Logo text
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(14)
  doc.setTextColor(241, 245, 249)
  doc.text('KORE', 12, 12)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(148, 163, 184)
  doc.text('Sistema de Gestão MEI', 12, 18)

  // Título do relatório
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(13)
  doc.setTextColor(241, 245, 249)
  doc.text(title, 12, 36)

  if (subtitle) {
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.setTextColor(148, 163, 184)
    doc.text(subtitle, 12, 43)
  }

  // Data de geração
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(100, 116, 139)
  doc.text(`Gerado em ${new Date().toLocaleString('pt-BR')}`, 198, 36, { align: 'right' })
}

function addFooter(doc: jsPDF) {
  const pageCount = doc.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setDrawColor(30, 41, 59)
    doc.line(12, 284, 198, 284)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7)
    doc.setTextColor(100, 116, 139)
    doc.text('Kore System — Gestão Financeira para MEI', 12, 289)
    doc.text(`${i} / ${pageCount}`, 198, 289, { align: 'right' })
  }
}

// ─── Relatório: Extrato Mensal ────────────────────────────────────────────────

export function exportExtrato(
  transactions: Transaction[],
  mes: string, // formato: "2024-03"
  nomeEmpresa?: string
) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })

  const [year, month] = mes.split('-')
  const mesLabel = new Date(Number(year), Number(month) - 1).toLocaleString('pt-BR', { month: 'long', year: 'numeric' })
  const subtitle = nomeEmpresa ? `${nomeEmpresa} · ${mesLabel}` : mesLabel

  addHeader(doc, 'Extrato Mensal', subtitle)

  // Totalizadores
  const receitas = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.value, 0)
  const despesas = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.value, 0)
  const saldo = receitas - despesas

  const summaryY = 52
  const boxW = 56
  const boxes = [
    { label: 'Receitas', value: receitas, color: [16, 185, 129] as [number, number, number] },
    { label: 'Despesas', value: despesas, color: [239, 68, 68] as [number, number, number] },
    { label: 'Saldo', value: saldo, color: saldo >= 0 ? [16, 185, 129] as [number, number, number] : [239, 68, 68] as [number, number, number] },
  ]

  boxes.forEach((box, i) => {
    const x = 12 + i * (boxW + 3)
    doc.setFillColor(15, 23, 42)
    doc.roundedRect(x, summaryY, boxW, 18, 3, 3, 'F')
    doc.setDrawColor(...box.color)
    doc.setLineWidth(0.5)
    doc.roundedRect(x, summaryY, boxW, 18, 3, 3, 'S')

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7)
    doc.setTextColor(148, 163, 184)
    doc.text(box.label.toUpperCase(), x + 4, summaryY + 6)

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(10)
    doc.setTextColor(...box.color)
    doc.text(formatBRL(box.value), x + 4, summaryY + 13)
  })

  // Tabela
  autoTable(doc, {
    startY: 76,
    head: [['Data', 'Descrição', 'Categoria', 'Tipo', 'Valor']],
    body: transactions.map(t => [
      formatDate(t.date),
      t.description,
      t.category,
      t.type === 'income' ? 'Receita' : 'Despesa',
      formatBRL(t.value),
    ]),
    styles: {
      font: 'helvetica',
      fontSize: 8,
      cellPadding: 3,
      textColor: [226, 232, 240],
      fillColor: [13, 18, 32],
      lineColor: [30, 41, 59],
      lineWidth: 0.1,
    },
    headStyles: {
      fillColor: [6, 10, 18],
      textColor: [148, 163, 184],
      fontSize: 7,
      fontStyle: 'bold',
    },
    alternateRowStyles: { fillColor: [15, 23, 42] },
    columnStyles: {
      0: { cellWidth: 20 },
      3: { cellWidth: 20, halign: 'center' },
      4: { cellWidth: 28, halign: 'right', fontStyle: 'bold' },
    },
    didParseCell: (data) => {
      if (data.column.index === 4 && data.section === 'body') {
        const tx = transactions[data.row.index]
        data.cell.styles.textColor = tx?.type === 'income' ? [16, 185, 129] : [239, 68, 68]
      }
    },
  })

  addFooter(doc)
  doc.save(`kore-extrato-${mes}.pdf`)
}

// ─── Relatório: Histórico DAS ─────────────────────────────────────────────────

export function exportDAS(records: DASRecord[], nomeEmpresa?: string) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })

  addHeader(doc, 'Histórico DAS', nomeEmpresa)

  const total = records.reduce((s, r) => s + r.value, 0)

  // Total pago
  doc.setFillColor(15, 23, 42)
  doc.roundedRect(12, 52, 80, 18, 3, 3, 'F')
  doc.setDrawColor(59, 130, 246)
  doc.setLineWidth(0.5)
  doc.roundedRect(12, 52, 80, 18, 3, 3, 'S')
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7)
  doc.setTextColor(148, 163, 184)
  doc.text('TOTAL PAGO', 16, 58)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.setTextColor(59, 130, 246)
  doc.text(formatBRL(total), 16, 66)

  autoTable(doc, {
    startY: 76,
    head: [['Competência', 'Data de Pagamento', 'Nº Recibo', 'Valor']],
    body: records.map(r => [
      r.reference_month,
      formatDate(r.paid_date),
      r.receipt_number ?? '—',
      formatBRL(r.value),
    ]),
    styles: {
      font: 'helvetica',
      fontSize: 8,
      cellPadding: 3,
      textColor: [226, 232, 240],
      fillColor: [13, 18, 32],
      lineColor: [30, 41, 59],
      lineWidth: 0.1,
    },
    headStyles: {
      fillColor: [6, 10, 18],
      textColor: [148, 163, 184],
      fontSize: 7,
      fontStyle: 'bold',
    },
    alternateRowStyles: { fillColor: [15, 23, 42] },
    columnStyles: {
      3: { halign: 'right', fontStyle: 'bold', textColor: [59, 130, 246] },
    },
  })

  addFooter(doc)
  doc.save('kore-das-historico.pdf')
}

// ─── Relatório: Cotação ───────────────────────────────────────────────────────

export function exportCotacao(quote: Quote, nomeEmpresa?: string, cnpj?: string) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })

  // items pode vir como string JSON do Supabase
  const items = typeof quote.items === 'string' 
    ? JSON.parse(quote.items) 
    : quote.items ?? []
  quote = { ...quote, items }

  addHeader(doc, 'Proposta Comercial', nomeEmpresa)

  let y = 50

  // Info do cliente
  doc.setFillColor(15, 23, 42)
  doc.roundedRect(12, y, 186, 24, 3, 3, 'F')

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8)
  doc.setTextColor(148, 163, 184)
  doc.text('CLIENTE', 16, y + 7)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.setTextColor(241, 245, 249)
  doc.text(quote.client_name, 16, y + 15)

  if (quote.valid_until) {
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    doc.setTextColor(148, 163, 184)
    doc.text(`Válido até: ${formatDate(quote.valid_until)}`, 185, y + 15, { align: 'right' })
  }

  if (cnpj) {
    doc.setFontSize(7)
    doc.setTextColor(100, 116, 139)
    doc.text(`CNPJ: ${cnpj}`, 185, y + 7, { align: 'right' })
  }

  y += 32

  if (quote.description) {
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.setTextColor(148, 163, 184)
    doc.text(quote.description, 12, y)
    y += 10
  }

  // Itens
  autoTable(doc, {
    startY: y,
    head: [['Descrição', 'Qtd', 'Valor Unit.', 'Total']],
    body: quote.items.map((item: any) => [
      item.description ?? item.desc ?? '',
      (item.quantity ?? 1).toString(),
      formatBRL(item.unit_price ?? item.value ?? 0),
      formatBRL((item.quantity ?? 1) * (item.unit_price ?? item.value ?? 0)),
    ]),
    styles: {
      font: 'helvetica',
      fontSize: 9,
      cellPadding: 4,
      textColor: [226, 232, 240],
      fillColor: [13, 18, 32],
      lineColor: [30, 41, 59],
      lineWidth: 0.1,
    },
    headStyles: {
      fillColor: [6, 10, 18],
      textColor: [148, 163, 184],
      fontSize: 7,
      fontStyle: 'bold',
    },
    alternateRowStyles: { fillColor: [15, 23, 42] },
    columnStyles: {
      0: { cellWidth: 100 },
      1: { halign: 'center', cellWidth: 18 },
      2: { halign: 'right', cellWidth: 35 },
      3: { halign: 'right', cellWidth: 33, fontStyle: 'bold' },
    },
  })

  // Total geral
  const finalY = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 6
  doc.setFillColor(59, 130, 246)
  doc.roundedRect(120, finalY, 78, 14, 3, 3, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.setTextColor(255, 255, 255)
  doc.text('TOTAL', 124, finalY + 6)
  doc.setFontSize(11)
  doc.text(formatBRL(quote.total), 195, finalY + 9, { align: 'right' })

  // Observações
  if (quote.notes) {
    const notesY = finalY + 24
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(8)
    doc.setTextColor(148, 163, 184)
    doc.text('OBSERVAÇÕES', 12, notesY)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    doc.setTextColor(226, 232, 240)
    const lines = doc.splitTextToSize(quote.notes, 186)
    doc.text(lines, 12, notesY + 6)
  }

  addFooter(doc)
  doc.save(`kore-cotacao-${quote.client_name.toLowerCase().replace(/\s+/g, '-')}.pdf`)
}

// ─── Relatório: Clientes ──────────────────────────────────────────────────────

export function exportClientes(clients: ClientReport[], nomeEmpresa?: string) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })

  addHeader(doc, 'Relatório de Clientes', nomeEmpresa)

  const totalRevenue = clients.reduce((s, c) => s + c.total_revenue, 0)

  doc.setFillColor(15, 23, 42)
  doc.roundedRect(12, 52, 80, 18, 3, 3, 'F')
  doc.setDrawColor(16, 185, 129)
  doc.setLineWidth(0.5)
  doc.roundedRect(12, 52, 80, 18, 3, 3, 'S')
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7)
  doc.setTextColor(148, 163, 184)
  doc.text('RECEITA TOTAL DE CLIENTES', 16, 58)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.setTextColor(16, 185, 129)
  doc.text(formatBRL(totalRevenue), 16, 66)

  const sorted = [...clients].sort((a, b) => b.total_revenue - a.total_revenue)

  autoTable(doc, {
    startY: 76,
    head: [['Cliente', 'Email', 'Telefone', 'Receita Total', 'Cliente desde']],
    body: sorted.map(c => [
      c.name,
      c.email ?? '—',
      c.phone ?? '—',
      formatBRL(c.total_revenue),
      formatDate(c.created_at),
    ]),
    styles: {
      font: 'helvetica',
      fontSize: 8,
      cellPadding: 3,
      textColor: [226, 232, 240],
      fillColor: [13, 18, 32],
      lineColor: [30, 41, 59],
      lineWidth: 0.1,
    },
    headStyles: {
      fillColor: [6, 10, 18],
      textColor: [148, 163, 184],
      fontSize: 7,
      fontStyle: 'bold',
    },
    alternateRowStyles: { fillColor: [15, 23, 42] },
    columnStyles: {
      3: { halign: 'right', fontStyle: 'bold', textColor: [16, 185, 129] },
    },
  })

  addFooter(doc)
  doc.save('kore-clientes.pdf')
}
