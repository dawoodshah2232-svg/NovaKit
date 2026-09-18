'use client';

import React, { useState, useMemo } from 'react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
  Download,
  Plus,
  Trash2,
  Receipt,
  Building2,
  User,
  Calendar,
  FileCheck,
  ShieldCheck,
  RotateCcw,
  Sparkles,
  Eye,
  Edit3,
} from 'lucide-react';

export type InvoiceTemplate = 'Clean Minimal' | 'Corporate Blue' | 'Bold Modern';

export interface LineItem {
  id: string;
  description: string;
  quantity: number;
  price: number;
}

interface TemplateTheme {
  id: InvoiceTemplate;
  name: string;
  badge: string;
  preview: {
    accentStrip: string;
    headerTextColor: string;
    sectionLabelColor: string;
    tableHeadBg: string;
    tableHeadText: string;
    totalTextColor: string;
    accentButton: string;
  };
  pdf: {
    topBarColor: [number, number, number];
    topBarHeight: number;
    secondaryBar?: {
      color: [number, number, number];
      height: number;
    };
    titleColor: [number, number, number];
    subtitleText: string;
    accentColor: [number, number, number];
    tableHeadFill: [number, number, number];
    tableHeadText: [number, number, number];
    tableAltRowFill: [number, number, number];
    tableLineColor: [number, number, number];
    totalColor: [number, number, number];
  };
}

const TEMPLATE_CONFIGS: Record<InvoiceTemplate, TemplateTheme> = {
  'Clean Minimal': {
    id: 'Clean Minimal',
    name: 'Clean Minimal',
    badge: 'Monochrome',
    preview: {
      accentStrip: 'bg-slate-400 dark:bg-slate-600',
      headerTextColor: 'text-slate-900 dark:text-white',
      sectionLabelColor: 'text-slate-500 dark:text-slate-400',
      tableHeadBg: 'bg-slate-100 dark:bg-slate-800',
      tableHeadText: 'text-slate-800 dark:text-slate-200',
      totalTextColor: 'text-slate-900 dark:text-white',
      accentButton: 'from-slate-800 to-slate-950 hover:from-slate-700 hover:to-slate-900',
    },
    pdf: {
      topBarColor: [203, 213, 225],
      topBarHeight: 2.5,
      titleColor: [30, 41, 59],
      subtitleText: 'Clean Minimalist Invoice • 100% In-Browser Document',
      accentColor: [100, 116, 139],
      tableHeadFill: [241, 245, 249],
      tableHeadText: [30, 41, 59],
      tableAltRowFill: [250, 250, 250],
      tableLineColor: [226, 232, 240],
      totalColor: [15, 23, 42],
    },
  },
  'Corporate Blue': {
    id: 'Corporate Blue',
    name: 'Corporate Blue',
    badge: 'Enterprise',
    preview: {
      accentStrip: 'bg-blue-600',
      headerTextColor: 'text-blue-950 dark:text-blue-100',
      sectionLabelColor: 'text-blue-600 dark:text-blue-400',
      tableHeadBg: 'bg-blue-900 text-white',
      tableHeadText: 'text-white',
      totalTextColor: 'text-blue-700 dark:text-blue-400',
      accentButton: 'from-blue-600 to-indigo-700 hover:from-blue-500 hover:to-indigo-600',
    },
    pdf: {
      topBarColor: [30, 58, 138],
      topBarHeight: 5,
      titleColor: [30, 58, 138],
      subtitleText: 'Corporate Standard Invoice • 100% In-Browser Document',
      accentColor: [37, 99, 235],
      tableHeadFill: [30, 58, 138],
      tableHeadText: [255, 255, 255],
      tableAltRowFill: [239, 246, 255],
      tableLineColor: [219, 234, 254],
      totalColor: [30, 58, 138],
    },
  },
  'Bold Modern': {
    id: 'Bold Modern',
    name: 'Bold Modern',
    badge: 'High Contrast',
    preview: {
      accentStrip: 'bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600',
      headerTextColor: 'text-slate-950 dark:text-white',
      sectionLabelColor: 'text-violet-600 dark:text-violet-400',
      tableHeadBg: 'bg-slate-950 text-white dark:bg-slate-800',
      tableHeadText: 'text-white',
      totalTextColor: 'text-violet-600 dark:text-violet-400',
      accentButton: 'from-violet-600 via-purple-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500',
    },
    pdf: {
      topBarColor: [15, 23, 42],
      topBarHeight: 5,
      secondaryBar: {
        color: [124, 58, 237],
        height: 1.5,
      },
      titleColor: [15, 23, 42],
      subtitleText: 'Modern Bold Invoice • 100% In-Browser Document',
      accentColor: [124, 58, 237],
      tableHeadFill: [15, 23, 42],
      tableHeadText: [255, 255, 255],
      tableAltRowFill: [245, 243, 255],
      tableLineColor: [226, 232, 240],
      totalColor: [124, 58, 237],
    },
  },
};

const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  CAD: 'CA$',
  AUD: 'AU$',
  JPY: '¥',
};

const DEFAULT_SAMPLE_ITEMS: LineItem[] = [
  {
    id: '1',
    description: 'Full-Stack Web Application Development & UI Design',
    quantity: 1,
    price: 2400,
  },
  {
    id: '2',
    description: 'Client-Side Performance & WebAssembly Optimization',
    quantity: 1,
    price: 850,
  },
  {
    id: '3',
    description: 'Cloud Infrastructure & Automated Deployment Setup',
    quantity: 2,
    price: 350,
  },
];

export function InvoiceGenerator() {
  // Selected Design Template
  const [selectedTemplate, setSelectedTemplate] = useState<InvoiceTemplate>('Corporate Blue');
  const currentTheme = TEMPLATE_CONFIGS[selectedTemplate];

  // Company / Sender Details
  const [senderName, setSenderName] = useState('Acme Digital Studio');
  const [senderEmail, setSenderEmail] = useState('billing@acmedigital.io');
  const [senderAddress, setSenderAddress] = useState('742 Evergreen Terrace, Suite 400\nSan Francisco, CA 94107');
  const [senderPhone, setSenderPhone] = useState('+1 (555) 234-5678');

  // Client Details
  const [clientName, setClientName] = useState('Horizon Global Enterprises');
  const [clientEmail, setClientEmail] = useState('accounts@horizonglobal.com');
  const [clientAddress, setClientAddress] = useState('100 Innovation Boulevard\nAustin, TX 78701');

  // Invoice Meta
  const [invoiceNumber, setInvoiceNumber] = useState('INV-2026-001');
  const [invoiceDate, setInvoiceDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [dueDate, setDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    return d.toISOString().slice(0, 10);
  });
  const [currency, setCurrency] = useState('USD');
  const [notes, setNotes] = useState('Payment is requested within 14 days of issue date. Bank transfer details available upon request.');

  // Calculation parameters
  const [taxRate, setTaxRate] = useState<number>(8.5);
  const [discountRate, setDiscountRate] = useState<number>(0);

  // Line items
  const [items, setItems] = useState<LineItem[]>(DEFAULT_SAMPLE_ITEMS);

  // Active view for mobile / split view: 'edit' | 'preview'
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');
  const [isDownloading, setIsDownloading] = useState(false);

  const currencySymbol = CURRENCY_SYMBOLS[currency] || '$';

  // Financial calculations
  const subtotal = useMemo(() => {
    return items.reduce((acc, item) => acc + (Number(item.quantity) || 0) * (Number(item.price) || 0), 0);
  }, [items]);

  const discountAmount = useMemo(() => {
    return subtotal * ((Number(discountRate) || 0) / 100);
  }, [subtotal, discountRate]);

  const taxAmount = useMemo(() => {
    const taxableAmount = Math.max(0, subtotal - discountAmount);
    return taxableAmount * ((Number(taxRate) || 0) / 100);
  }, [subtotal, discountAmount, taxRate]);

  const total = useMemo(() => {
    return Math.max(0, subtotal - discountAmount + taxAmount);
  }, [subtotal, discountAmount, taxAmount]);

  // Line item handlers
  const handleAddItem = () => {
    const newItem: LineItem = {
      id: Math.random().toString(36).substring(2, 9),
      description: '',
      quantity: 1,
      price: 0,
    };
    setItems((prev) => [...prev, newItem]);
  };

  const handleUpdateItem = (id: string, field: keyof LineItem, value: string | number) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const handleRemoveItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleReset = () => {
    setSenderName('');
    setSenderEmail('');
    setSenderAddress('');
    setSenderPhone('');
    setClientName('');
    setClientEmail('');
    setClientAddress('');
    setInvoiceNumber(`INV-${Date.now().toString().slice(-4)}`);
    setItems([
      {
        id: '1',
        description: '',
        quantity: 1,
        price: 0,
      },
    ]);
    setTaxRate(0);
    setDiscountRate(0);
    setNotes('');
  };

  const handleLoadSample = () => {
    setSenderName('Acme Digital Studio');
    setSenderEmail('billing@acmedigital.io');
    setSenderAddress('742 Evergreen Terrace, Suite 400\nSan Francisco, CA 94107');
    setSenderPhone('+1 (555) 234-5678');
    setClientName('Horizon Global Enterprises');
    setClientEmail('accounts@horizonglobal.com');
    setClientAddress('100 Innovation Boulevard\nAustin, TX 78701');
    setInvoiceNumber('INV-2026-001');
    setItems(DEFAULT_SAMPLE_ITEMS);
    setTaxRate(8.5);
    setDiscountRate(0);
    setNotes('Payment is requested within 14 days of issue date. Bank transfer details available upon request.');
  };

  // PDF Generation using jsPDF and jspdf-autotable
  const handleDownloadPdf = () => {
    setIsDownloading(true);

    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pageWidth = doc.internal.pageSize.getWidth();

      // Top decorative banner from template theme
      doc.setFillColor(...currentTheme.pdf.topBarColor);
      doc.rect(0, 0, pageWidth, currentTheme.pdf.topBarHeight, 'F');

      if (currentTheme.pdf.secondaryBar) {
        doc.setFillColor(...currentTheme.pdf.secondaryBar.color);
        doc.rect(0, currentTheme.pdf.topBarHeight, pageWidth, currentTheme.pdf.secondaryBar.height, 'F');
      }

      // Header: Document title & Brand
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(26);
      doc.setTextColor(...currentTheme.pdf.titleColor);
      doc.text('INVOICE', 14, 24);

      doc.setFontSize(9.5);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 116, 139); // Slate 500
      doc.text(currentTheme.pdf.subtitleText, 14, 30);

      // Top Right: Invoice Meta Box
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(71, 85, 105);
      doc.text('Invoice #:', pageWidth - 65, 20);
      doc.text('Date:', pageWidth - 65, 26);
      doc.text('Due Date:', pageWidth - 65, 32);

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(15, 23, 42);
      doc.text(invoiceNumber || 'DRAFT', pageWidth - 14, 20, { align: 'right' });
      doc.text(invoiceDate || '—', pageWidth - 14, 26, { align: 'right' });
      doc.text(dueDate || '—', pageWidth - 14, 32, { align: 'right' });

      // Horizontal separator
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.4);
      doc.line(14, 38, pageWidth - 14, 38);

      // "From" & "Bill To" Sections
      const startYInfo = 46;

      // Sender Info (Left)
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(...currentTheme.pdf.accentColor);
      doc.text('FROM / SENDER', 14, startYInfo);

      doc.setFontSize(11);
      doc.setTextColor(15, 23, 42);
      doc.setFont('helvetica', 'bold');
      doc.text(senderName || 'Your Business Name', 14, startYInfo + 6);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(71, 85, 105);
      let senderCurrentY = startYInfo + 11;
      if (senderEmail) {
        doc.text(senderEmail, 14, senderCurrentY);
        senderCurrentY += 5;
      }
      if (senderPhone) {
        doc.text(senderPhone, 14, senderCurrentY);
        senderCurrentY += 5;
      }
      if (senderAddress) {
        const addressLines = senderAddress.split('\n');
        addressLines.forEach((line) => {
          doc.text(line, 14, senderCurrentY);
          senderCurrentY += 5;
        });
      }

      // Client Info (Right)
      const clientX = pageWidth / 2 + 5;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(...currentTheme.pdf.accentColor);
      doc.text('BILL TO / CLIENT', clientX, startYInfo);

      doc.setFontSize(11);
      doc.setTextColor(15, 23, 42);
      doc.setFont('helvetica', 'bold');
      doc.text(clientName || 'Client Name / Company', clientX, startYInfo + 6);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(71, 85, 105);
      let clientCurrentY = startYInfo + 11;
      if (clientEmail) {
        doc.text(clientEmail, clientX, clientCurrentY);
        clientCurrentY += 5;
      }
      if (clientAddress) {
        const addressLines = clientAddress.split('\n');
        addressLines.forEach((line) => {
          doc.text(line, clientX, clientCurrentY);
          clientCurrentY += 5;
        });
      }

      // Line items table with jspdf-autotable
      const tableStartY = Math.max(senderCurrentY, clientCurrentY, 74) + 4;

      const tableData = items.map((item, index) => [
        (index + 1).toString(),
        item.description || 'Item Description',
        (Number(item.quantity) || 0).toString(),
        `${currencySymbol}${(Number(item.price) || 0).toFixed(2)}`,
        `${currencySymbol}${((Number(item.quantity) || 0) * (Number(item.price) || 0)).toFixed(2)}`,
      ]);

      autoTable(doc, {
        startY: tableStartY,
        head: [['#', 'Description', 'Qty', 'Unit Price', 'Amount']],
        body: tableData,
        margin: { left: 14, right: 14 },
        headStyles: {
          fillColor: currentTheme.pdf.tableHeadFill,
          textColor: currentTheme.pdf.tableHeadText,
          fontStyle: 'bold',
          fontSize: 9,
          cellPadding: 3.5,
        },
        styles: {
          font: 'helvetica',
          fontSize: 9,
          cellPadding: 3,
          textColor: [51, 65, 85],
          lineColor: currentTheme.pdf.tableLineColor,
        },
        alternateRowStyles: {
          fillColor: currentTheme.pdf.tableAltRowFill,
        },
        columnStyles: {
          0: { cellWidth: 10, halign: 'center' },
          1: { cellWidth: 'auto' },
          2: { cellWidth: 18, halign: 'right' },
          3: { cellWidth: 28, halign: 'right' },
          4: { cellWidth: 32, halign: 'right' },
        },
      });

      // Retrieve final Y position after table
      const finalY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY || tableStartY + 40;

      // Bottom Section: Notes on left, Totals on right
      const totalsStartY = finalY + 8;

      // Notes / Terms
      if (notes) {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.setTextColor(100, 116, 139);
        doc.text('NOTES & PAYMENT TERMS', 14, totalsStartY);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8.5);
        doc.setTextColor(71, 85, 105);
        const splitNotes = doc.splitTextToSize(notes, pageWidth / 2 - 10);
        doc.text(splitNotes, 14, totalsStartY + 5);
      }

      // Totals Box (Right Aligned)
      const totalsXLabel = pageWidth - 75;
      const totalsXValue = pageWidth - 14;
      let currY = totalsStartY;

      // Subtotal
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(100, 116, 139);
      doc.text('Subtotal:', totalsXLabel, currY);
      doc.setTextColor(30, 41, 59);
      doc.text(`${currencySymbol}${subtotal.toFixed(2)}`, totalsXValue, currY, { align: 'right' });
      currY += 6;

      // Discount (if any)
      if (discountRate > 0) {
        doc.setTextColor(100, 116, 139);
        doc.text(`Discount (${discountRate}%):`, totalsXLabel, currY);
        doc.setTextColor(16, 185, 129); // Emerald
        doc.text(`-${currencySymbol}${discountAmount.toFixed(2)}`, totalsXValue, currY, { align: 'right' });
        currY += 6;
      }

      // Tax (if any)
      if (taxRate > 0) {
        doc.setTextColor(100, 116, 139);
        doc.text(`Tax (${taxRate}%):`, totalsXLabel, currY);
        doc.setTextColor(30, 41, 59);
        doc.text(`+${currencySymbol}${taxAmount.toFixed(2)}`, totalsXValue, currY, { align: 'right' });
        currY += 6;
      }

      // Divider line
      doc.setDrawColor(226, 232, 240);
      doc.line(totalsXLabel, currY - 1, totalsXValue, currY - 1);
      currY += 4;

      // Grand Total Highlight
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.setTextColor(...currentTheme.pdf.totalColor);
      doc.text('Total Due:', totalsXLabel, currY);
      doc.text(`${currencySymbol}${total.toFixed(2)}`, totalsXValue, currY, { align: 'right' });

      // Footer notice
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.text(
        `Thank you for your business! Generated with NovaKit (${selectedTemplate} Template) • 100% In-Browser & Private.`,
        pageWidth / 2,
        285,
        {
          align: 'center',
        }
      );

      // Save PDF directly to user's device
      const fileName = `Invoice-${invoiceNumber.trim() || 'draft'}.pdf`;
      doc.save(fileName);
    } catch (err) {
      console.error('Failed to generate PDF:', err);
      alert('An error occurred while generating your invoice PDF. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Privacy guarantee banner */}
      <div className="flex items-center justify-between p-3.5 rounded-2xl bg-violet-50/90 dark:bg-violet-950/40 border border-violet-200/80 dark:border-violet-800/60 text-xs font-medium text-violet-800 dark:text-violet-300 shadow-xs">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-violet-600 dark:text-violet-400 shrink-0" />
          <span>
            <strong>Zero Server Uploads:</strong> Invoice calculations and PDF compiling happen exclusively in local browser memory. No financial data is ever transmitted.
          </span>
        </div>
        <span className="hidden sm:inline-block text-[11px] font-semibold px-2 py-0.5 rounded-full bg-violet-100 dark:bg-violet-900/60 text-violet-700 dark:text-violet-300">
          jsPDF Client Engine
        </span>
      </div>

      {/* Top Action Bar: Tab Switcher (Mobile), Sample Loader, Clear & Download */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs">
        {/* Mobile View Toggle */}
        <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800 self-start sm:self-auto w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setActiveTab('edit')}
            className={`flex-1 sm:flex-initial min-h-[38px] px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 active:scale-95 ${
              activeTab === 'edit'
                ? 'bg-white dark:bg-slate-700 text-violet-700 dark:text-violet-300 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Editor</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('preview')}
            className={`flex-1 sm:flex-initial min-h-[38px] px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 active:scale-95 ${
              activeTab === 'preview'
                ? 'bg-white dark:bg-slate-700 text-violet-700 dark:text-violet-300 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Preview</span>
          </button>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={handleLoadSample}
            className="min-h-[40px] px-3.5 py-1.5 rounded-xl text-xs font-semibold text-violet-700 dark:text-violet-300 bg-violet-50 dark:bg-violet-950/60 border border-violet-200/80 dark:border-violet-800/60 hover:bg-violet-100 dark:hover:bg-violet-900/60 transition-colors inline-flex items-center gap-1.5 active:scale-95"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Load Sample</span>
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="min-h-[40px] px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors inline-flex items-center gap-1.5 active:scale-95"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
          <button
            type="button"
            onClick={handleDownloadPdf}
            disabled={isDownloading || items.length === 0}
            className="min-h-[40px] px-4 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white text-xs sm:text-sm font-bold shadow-md shadow-violet-500/20 active:scale-95 transition-all inline-flex items-center gap-2 disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>{isDownloading ? 'Generating PDF...' : 'Download Invoice (PDF)'}</span>
          </button>
        </div>
      </div>

      {/* Main Content: Form Editor OR Live Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Form Editor (Always visible on desktop, or when activeTab === 'edit' on mobile) */}
        <div
          className={`space-y-6 ${
            activeTab === 'edit' ? 'block' : 'hidden'
          } lg:block lg:col-span-7`}
        >
          {/* Section 1: Invoice Header Meta */}
          <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 p-4 sm:p-5 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
              <Receipt className="w-4 h-4 text-violet-600 dark:text-violet-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                Invoice Details
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Invoice Number
                </label>
                <input
                  type="text"
                  value={invoiceNumber}
                  onChange={(e) => setInvoiceNumber(e.target.value)}
                  placeholder="e.g. INV-2026-001"
                  className="w-full min-h-[44px] px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Currency
                </label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full min-h-[44px] px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500"
                >
                  <option value="USD">USD ($) - US Dollar</option>
                  <option value="EUR">EUR (€) - Euro</option>
                  <option value="GBP">GBP (£) - British Pound</option>
                  <option value="CAD">CAD ($) - Canadian Dollar</option>
                  <option value="AUD">AUD ($) - Australian Dollar</option>
                  <option value="JPY">JPY (¥) - Japanese Yen</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>Invoice Date</span>
                </label>
                <input
                  type="date"
                  value={invoiceDate}
                  onChange={(e) => setInvoiceDate(e.target.value)}
                  className="w-full min-h-[44px] px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>Due Date</span>
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full min-h-[44px] px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Sender & Client Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Sender / From */}
            <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 p-4 sm:p-5 shadow-xs space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
                <Building2 className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                  Your Details (From)
                </h3>
              </div>
              <div className="space-y-2.5">
                <div>
                  <input
                    type="text"
                    value={senderName}
                    onChange={(e) => setSenderName(e.target.value)}
                    placeholder="Your Business / Name"
                    className="w-full min-h-[44px] px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/40"
                  />
                </div>
                <div>
                  <input
                    type="email"
                    value={senderEmail}
                    onChange={(e) => setSenderEmail(e.target.value)}
                    placeholder="Your Email"
                    className="w-full min-h-[44px] px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/40"
                  />
                </div>
                <div>
                  <input
                    type="text"
                    value={senderPhone}
                    onChange={(e) => setSenderPhone(e.target.value)}
                    placeholder="Phone Number (Optional)"
                    className="w-full min-h-[44px] px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/40"
                  />
                </div>
                <div>
                  <textarea
                    rows={2}
                    value={senderAddress}
                    onChange={(e) => setSenderAddress(e.target.value)}
                    placeholder="Address, City, State, ZIP"
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/40 resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Client / Bill To */}
            <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 p-4 sm:p-5 shadow-xs space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
                <User className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                  Client Details (Bill To)
                </h3>
              </div>
              <div className="space-y-2.5">
                <div>
                  <input
                    type="text"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="Client / Company Name"
                    className="w-full min-h-[44px] px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/40"
                  />
                </div>
                <div>
                  <input
                    type="email"
                    value={clientEmail}
                    onChange={(e) => setClientEmail(e.target.value)}
                    placeholder="Client Email"
                    className="w-full min-h-[44px] px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/40"
                  />
                </div>
                <div>
                  <textarea
                    rows={4}
                    value={clientAddress}
                    onChange={(e) => setClientAddress(e.target.value)}
                    placeholder="Client Address, City, Country"
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/40 resize-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Dynamic Line Items Table */}
          <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 p-4 sm:p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                  Line Items ({items.length})
                </h3>
              </div>
              <button
                type="button"
                onClick={handleAddItem}
                className="min-h-[40px] px-3 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold inline-flex items-center gap-1.5 shadow-xs transition-colors active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>Add Item</span>
              </button>
            </div>

            {/* Line items list with mobile friendly responsive row format */}
            <div className="space-y-3">
              {items.map((item, index) => {
                const lineTotal = (Number(item.quantity) || 0) * (Number(item.price) || 0);
                return (
                  <div
                    key={item.id}
                    className="p-3 sm:p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/70 space-y-2.5 transition-all"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                        Item #{index + 1}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900 dark:text-white">
                          {currencySymbol}{lineTotal.toFixed(2)}
                        </span>
                        {items.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(item.id)}
                            aria-label="Remove item"
                            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    <div>
                      <input
                        type="text"
                        value={item.description}
                        onChange={(e) => handleUpdateItem(item.id, 'description', e.target.value)}
                        placeholder="Description of service or product"
                        className="w-full min-h-[44px] px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/40"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                          Qty
                        </label>
                        <input
                          type="number"
                          min="1"
                          step="1"
                          value={item.quantity}
                          onChange={(e) => handleUpdateItem(item.id, 'quantity', Math.max(1, parseFloat(e.target.value) || 0))}
                          className="w-full min-h-[44px] px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/40"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                          Price ({currencySymbol})
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.price}
                          onChange={(e) => handleUpdateItem(item.id, 'price', Math.max(0, parseFloat(e.target.value) || 0))}
                          className="w-full min-h-[44px] px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/40"
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 4: Tax, Discount & Notes */}
          <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 p-4 sm:p-5 shadow-xs space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Tax Rate (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={taxRate}
                  onChange={(e) => setTaxRate(Math.max(0, parseFloat(e.target.value) || 0))}
                  className="w-full min-h-[44px] px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/40"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Discount (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.5"
                  value={discountRate}
                  onChange={(e) => setDiscountRate(Math.max(0, parseFloat(e.target.value) || 0))}
                  className="w-full min-h-[44px] px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/40"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Notes & Payment Terms
              </label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Payment due dates, bank transfer details, terms..."
                className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/40 resize-none"
              />
            </div>
          </div>
        </div>

        {/* Right Column: Live Visual Invoice Preview */}
        <div
          className={`space-y-4 ${
            activeTab === 'preview' ? 'block' : 'hidden'
          } lg:block lg:col-span-5`}
        >
          <div className="sticky top-20 space-y-4">
            {/* Design Template Selector UI */}
            <div className="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  <span>Design Template</span>
                </span>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                  {currentTheme.badge}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {(['Clean Minimal', 'Corporate Blue', 'Bold Modern'] as const).map((tmpl) => {
                  const isSelected = selectedTemplate === tmpl;
                  return (
                    <button
                      key={tmpl}
                      type="button"
                      onClick={() => setSelectedTemplate(tmpl)}
                      className={`min-h-[46px] px-2 py-2 rounded-xl text-xs font-bold transition-all text-center border active:scale-95 flex flex-col items-center justify-center gap-0.5 cursor-pointer ${
                        isSelected
                          ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-slate-900 dark:border-white shadow-xs'
                          : 'bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 border-slate-200/80 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <span className="truncate w-full">{tmpl}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Live Paper Mockup Card */}
            <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xl overflow-hidden transition-all">
              {/* Decorative top accent strip */}
              <div className={`h-2 transition-all ${currentTheme.preview.accentStrip}`} />

              <div className="p-4 sm:p-6 space-y-5 text-xs text-slate-800 dark:text-slate-200">
                {/* Preview Header */}
                <div className="flex items-start justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                  <div>
                    <h4 className={`text-xl sm:text-2xl font-black tracking-tight transition-colors ${currentTheme.preview.headerTextColor}`}>
                      INVOICE
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-0.5 font-mono">
                      #{invoiceNumber || 'DRAFT'}
                    </p>
                  </div>
                  <div className="text-right space-y-0.5">
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">
                      Date: <span className="font-semibold text-slate-800 dark:text-slate-200">{invoiceDate}</span>
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">
                      Due: <span className="font-semibold text-slate-800 dark:text-slate-200">{dueDate}</span>
                    </div>
                  </div>
                </div>

                {/* From & Bill To */}
                <div className="grid grid-cols-2 gap-3 text-[11px] leading-relaxed">
                  <div>
                    <span className={`font-bold uppercase tracking-wider block mb-1 transition-colors ${currentTheme.preview.sectionLabelColor}`}>
                      From:
                    </span>
                    <p className="font-bold text-slate-900 dark:text-white">{senderName || 'Your Name'}</p>
                    <p className="text-slate-500 dark:text-slate-400 whitespace-pre-line">{senderAddress}</p>
                    {senderEmail && <p className="text-slate-500 dark:text-slate-400">{senderEmail}</p>}
                    {senderPhone && <p className="text-slate-500 dark:text-slate-400">{senderPhone}</p>}
                  </div>
                  <div>
                    <span className={`font-bold uppercase tracking-wider block mb-1 transition-colors ${currentTheme.preview.sectionLabelColor}`}>
                      Bill To:
                    </span>
                    <p className="font-bold text-slate-900 dark:text-white">{clientName || 'Client Name'}</p>
                    <p className="text-slate-500 dark:text-slate-400 whitespace-pre-line">{clientAddress}</p>
                    {clientEmail && <p className="text-slate-500 dark:text-slate-400">{clientEmail}</p>}
                  </div>
                </div>

                {/* Line Items Table */}
                <div className="border border-slate-100 dark:border-slate-800 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-[11px]">
                    <thead className={`font-bold border-b border-slate-100 dark:border-slate-800 transition-colors ${currentTheme.preview.tableHeadBg} ${currentTheme.preview.tableHeadText}`}>
                      <tr>
                        <th className="p-2 pl-3">Description</th>
                        <th className="p-2 text-right">Qty</th>
                        <th className="p-2 text-right">Price</th>
                        <th className="p-2 pr-3 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {items.map((item) => {
                        const lineTotal = (Number(item.quantity) || 0) * (Number(item.price) || 0);
                        return (
                          <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                            <td className="p-2 pl-3 font-medium truncate max-w-[140px]">
                              {item.description || '—'}
                            </td>
                            <td className="p-2 text-right text-slate-500 dark:text-slate-400">
                              {item.quantity}
                            </td>
                            <td className="p-2 text-right text-slate-500 dark:text-slate-400">
                              {currencySymbol}{item.price.toFixed(2)}
                            </td>
                            <td className="p-2 pr-3 text-right font-bold text-slate-900 dark:text-white">
                              {currencySymbol}{lineTotal.toFixed(2)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Totals Summary */}
                <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800 text-right">
                  <div className="flex justify-between text-slate-500 dark:text-slate-400 text-[11px]">
                    <span>Subtotal:</span>
                    <span>{currencySymbol}{subtotal.toFixed(2)}</span>
                  </div>
                  {discountRate > 0 && (
                    <div className="flex justify-between text-emerald-600 dark:text-emerald-400 text-[11px]">
                      <span>Discount ({discountRate}%):</span>
                      <span>-{currencySymbol}{discountAmount.toFixed(2)}</span>
                    </div>
                  )}
                  {taxRate > 0 && (
                    <div className="flex justify-between text-slate-500 dark:text-slate-400 text-[11px]">
                      <span>Tax ({taxRate}%):</span>
                      <span>+{currencySymbol}{taxAmount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className={`flex justify-between text-sm sm:text-base font-black pt-1.5 border-t border-slate-200 dark:border-slate-700 transition-colors ${currentTheme.preview.totalTextColor}`}>
                    <span>Total Due:</span>
                    <span>{currencySymbol}{total.toFixed(2)}</span>
                  </div>
                </div>

                {/* Notes in Preview */}
                {notes && (
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed border border-slate-100 dark:border-slate-800">
                    <strong className="block text-slate-700 dark:text-slate-300 mb-0.5">Notes:</strong>
                    {notes}
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Instant Download Trigger (Massive & Foolproof) */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleDownloadPdf}
                disabled={isDownloading || items.length === 0}
                className={`w-full min-h-[56px] px-8 py-4 rounded-2xl bg-gradient-to-r ${currentTheme.preview.accentButton} disabled:opacity-50 text-white text-base sm:text-lg font-black shadow-xl shadow-slate-900/15 active:scale-[0.98] transition-all flex items-center justify-center gap-3 cursor-pointer`}
              >
                <Download className="w-5 h-5 sm:w-6 sm:h-6" />
                <span>
                  {isDownloading
                    ? 'Creating PDF Document...'
                    : `Download ${selectedTemplate} (${currencySymbol}${total.toFixed(2)})`}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
