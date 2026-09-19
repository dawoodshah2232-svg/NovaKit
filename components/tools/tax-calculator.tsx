'use client';

import React, { useState, useMemo } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { jsPDF } from 'jspdf';
import { trackToolExecution } from '@/lib/analytics';
import {
  Calculator,
  ShieldCheck,
  Download,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  Percent,
  TrendingDown,
  CheckCircle2,
} from 'lucide-react';

const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  CAD: 'CA$',
  AUD: 'AU$',
  JPY: '¥',
};

interface PresetProfile {
  name: string;
  gross: number;
  taxRate: number;
  deductions: number;
  currency: string;
}

const PRESETS: PresetProfile[] = [
  {
    name: 'US Moderate ($85k)',
    gross: 85000,
    taxRate: 22,
    deductions: 14600,
    currency: 'USD',
  },
  {
    name: 'Tech / High ($150k)',
    gross: 150000,
    taxRate: 28,
    deductions: 23000,
    currency: 'USD',
  },
  {
    name: 'European (€60k)',
    gross: 60000,
    taxRate: 24,
    deductions: 11000,
    currency: 'EUR',
  },
  {
    name: 'UK Professional (£50k)',
    gross: 50000,
    taxRate: 20,
    deductions: 12570,
    currency: 'GBP',
  },
];

const emptySubscribe = () => () => {};

export function TaxCalculator() {
  const [currency, setCurrency] = useState<string>('USD');
  const [grossIncome, setGrossIncome] = useState<number>(85000);
  const [taxRate, setTaxRate] = useState<number>(22);
  const [deductions, setDeductions] = useState<number>(14600);
  const [periodView, setPeriodView] = useState<'annual' | 'monthly'>('annual');
  const [copied, setCopied] = useState<boolean>(false);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const isMounted = React.useSyncExternalStore(emptySubscribe, () => true, () => false);

  const symbol = CURRENCY_SYMBOLS[currency] || '$';

  // Math Calculations (Instant & 100% Client-Side)
  const taxableIncome = useMemo(() => {
    return Math.max(0, grossIncome - deductions);
  }, [grossIncome, deductions]);

  const totalTax = useMemo(() => {
    return taxableIncome * (taxRate / 100);
  }, [taxableIncome, taxRate]);

  const netIncome = useMemo(() => {
    return Math.max(0, grossIncome - totalTax);
  }, [grossIncome, totalTax]);

  const effectiveTaxRate = useMemo(() => {
    if (grossIncome <= 0) return 0;
    return (totalTax / grossIncome) * 100;
  }, [grossIncome, totalTax]);

  const takeHomePercentage = useMemo(() => {
    if (grossIncome <= 0) return 0;
    return (netIncome / grossIncome) * 100;
  }, [grossIncome, netIncome]);

  // Monthly values
  const monthlyGross = grossIncome / 12;
  const monthlyTax = totalTax / 12;
  const monthlyNet = netIncome / 12;
  const monthlyDeductions = deductions / 12;

  // Formatter helper
  const formatMoney = (amount: number): string => {
    return `${symbol}${amount.toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })}`;
  };

  // Recharts Donut data
  const chartData = useMemo(() => {
    return [
      {
        name: 'Net Take-Home',
        value: Math.max(0, Math.round(netIncome)),
        color: '#10b981', // Emerald
      },
      {
        name: 'Total Tax',
        value: Math.max(0, Math.round(totalTax)),
        color: '#f59e0b', // Amber
      },
      {
        name: 'Deductions / Allowances',
        value: Math.max(0, Math.round(deductions)),
        color: '#6366f1', // Indigo
      },
    ].filter((item) => item.value > 0);
  }, [netIncome, totalTax, deductions]);

  // Handle Preset application
  const applyPreset = (preset: PresetProfile) => {
    setGrossIncome(preset.gross);
    setTaxRate(preset.taxRate);
    setDeductions(preset.deductions);
    setCurrency(preset.currency);
  };

  const handleReset = () => {
    setGrossIncome(50000);
    setTaxRate(20);
    setDeductions(10000);
    setCurrency('USD');
  };

  // Copy breakdown to clipboard
  const handleCopyBreakdown = async () => {
    const text = `NovaKit Tax & Salary Calculation Breakdown:
Gross Annual Income: ${formatMoney(grossIncome)} (${formatMoney(monthlyGross)}/mo)
Taxable Base: ${formatMoney(taxableIncome)}
Custom Deductions: ${formatMoney(deductions)} (${formatMoney(monthlyDeductions)}/mo)
Nominal Tax Rate: ${taxRate}%
Total Tax Paid: ${formatMoney(totalTax)} (${formatMoney(monthlyTax)}/mo)
Effective Tax Rate: ${effectiveTaxRate.toFixed(1)}%
Net Take-Home Pay: ${formatMoney(netIncome)} (${formatMoney(monthlyNet)}/mo)
Take-Home Ratio: ${takeHomePercentage.toFixed(1)}%
100% In-Browser Computation via NovaKit`;

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      trackToolExecution('tax-calculator');
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  };

  // Download PDF Summary using jsPDF
  const handleDownloadPdf = () => {
    setIsExporting(true);

    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pageWidth = doc.internal.pageSize.getWidth();

      // Top banner accent
      doc.setFillColor(245, 158, 11); // Amber
      doc.rect(0, 0, pageWidth, 5, 'F');

      // Title & Header
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(24);
      doc.setTextColor(15, 23, 42); // Slate 900
      doc.text('TAX & SALARY SUMMARY', 14, 22);

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 116, 139);
      doc.text(
        `Generated on ${new Date().toLocaleDateString()} • 100% Private Client-Side Calculation`,
        14,
        28
      );

      doc.setDrawColor(226, 232, 240);
      doc.line(14, 34, pageWidth - 14, 34);

      // Primary Metric Highlights
      doc.setFillColor(248, 250, 252);
      doc.roundedRect(14, 40, pageWidth - 28, 30, 3, 3, 'F');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(100, 116, 139);
      doc.text('ANNUAL NET TAKE-HOME', 20, 48);
      doc.text('MONTHLY TAKE-HOME', pageWidth / 2 + 10, 48);

      doc.setFontSize(18);
      doc.setTextColor(16, 185, 129); // Emerald
      doc.text(formatMoney(netIncome), 20, 58);
      doc.text(formatMoney(monthlyNet), pageWidth / 2 + 10, 58);

      doc.setFontSize(9);
      doc.setTextColor(71, 85, 105);
      doc.text(`Take-Home Ratio: ${takeHomePercentage.toFixed(1)}% of Gross`, 20, 65);
      doc.text(`Effective Tax Rate: ${effectiveTaxRate.toFixed(1)}%`, pageWidth / 2 + 10, 65);

      // Detailed Breakdown Table
      let tableY = 82;
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(15, 23, 42);
      doc.text('Comprehensive Financial Breakdown', 14, tableY);

      tableY += 8;
      const rows = [
        ['Gross Earnings', formatMoney(grossIncome), formatMoney(monthlyGross)],
        ['Custom Deductions & Allowances', `-${formatMoney(deductions)}`, `-${formatMoney(monthlyDeductions)}`],
        ['Taxable Income Base', formatMoney(taxableIncome), formatMoney(taxableIncome / 12)],
        ['Nominal Tax Rate', `${taxRate}%`, '—'],
        ['Total Estimated Tax Paid', `-${formatMoney(totalTax)}`, `-${formatMoney(monthlyTax)}`],
        ['Effective Overall Tax Rate', `${effectiveTaxRate.toFixed(1)}%`, '—'],
        ['Final Net Take-Home Pay', formatMoney(netIncome), formatMoney(monthlyNet)],
      ];

      doc.setFontSize(9);
      doc.setTextColor(100, 116, 139);
      doc.text('Metric', 14, tableY);
      doc.text('Annual Figure', pageWidth - 70, tableY, { align: 'right' });
      doc.text('Monthly Equivalent', pageWidth - 14, tableY, { align: 'right' });
      doc.line(14, tableY + 2, pageWidth - 14, tableY + 2);

      tableY += 8;
      rows.forEach(([label, annual, monthly], index) => {
        const isTotal = index === rows.length - 1;
        if (isTotal) {
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(16, 185, 129);
        } else {
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(51, 65, 85);
        }

        doc.text(label, 14, tableY);
        doc.text(annual, pageWidth - 70, tableY, { align: 'right' });
        doc.text(monthly, pageWidth - 14, tableY, { align: 'right' });

        doc.setDrawColor(241, 245, 249);
        doc.line(14, tableY + 2, pageWidth - 14, tableY + 2);
        tableY += 7;
      });

      // Disclaimer & Guarantee
      tableY += 12;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(100, 116, 139);
      doc.text('SECURITY & COMPUTATION GUARANTEE', 14, tableY);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      const disclaimer =
        'This calculation was processed 100% on your device using client-side JavaScript. No salary details, tax figures, or user identities were transmitted to or stored on any server. Figures are estimates based on user-provided parameters.';
      const splitDisclaimer = doc.splitTextToSize(disclaimer, pageWidth - 28);
      doc.text(splitDisclaimer, 14, tableY + 5);

      // Save PDF
      doc.save(`NovaKit-Tax-Breakdown-${new Date().toISOString().slice(0, 10)}.pdf`);
      trackToolExecution('tax-calculator');
    } catch (err) {
      console.error('Failed to export PDF:', err);
      alert('Unable to generate PDF document. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="w-full space-y-6 sm:space-y-8">
      {/* Privacy guarantee banner */}
      <div className="flex items-center justify-between p-4 rounded-2xl bg-amber-50/90 dark:bg-amber-950/40 border border-amber-200/90 dark:border-amber-800/70 text-xs font-semibold text-amber-900 dark:text-amber-200 shadow-xs">
        <div className="flex items-center gap-2.5">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
          </span>
          <ShieldCheck className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
          <span>
            <strong>100% In-Browser Computation:</strong> Your salary and financial parameters never leave your browser RAM. Zero analytics or server logging.
          </span>
        </div>
        <span className="hidden sm:inline-block text-[11px] font-black px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-200 border border-amber-200 dark:border-amber-800">
          Client-Side Math
        </span>
      </div>

      {/* Quick Presets Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-[0_2px_8px_rgba(0,0,0,0.03)]">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
            Quick Profiles:
          </span>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          {PRESETS.map((preset) => (
            <button
              key={preset.name}
              type="button"
              onClick={() => applyPreset(preset)}
              className="min-h-[36px] px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60 transition-colors active:scale-95"
            >
              {preset.name}
            </button>
          ))}
          <button
            type="button"
            onClick={handleReset}
            className="min-h-[36px] px-2.5 py-1.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors inline-flex items-center gap-1"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Inputs (Left) & Visual Breakdown / Outputs (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
        {/* Left Column: Form Inputs */}
        <div className="lg:col-span-6 space-y-6">
          <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 sm:p-7 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.04)] space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 flex items-center justify-center font-black">
                  <Calculator className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white">
                    Income & Tax Settings
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Adjust variables to see real-time recalculations
                  </p>
                </div>
              </div>

              {/* Currency Selector */}
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="min-h-[40px] px-3 py-1.5 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/40"
              >
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="CAD">CAD ($)</option>
                <option value="AUD">AUD ($)</option>
                <option value="JPY">JPY (¥)</option>
              </select>
            </div>

            {/* Input 1: Gross Annual Income */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-extrabold text-slate-800 dark:text-slate-200">
                  Gross Annual Income
                </label>
                <span className="text-xs font-black text-slate-900 dark:text-white font-mono">
                  {formatMoney(grossIncome)}
                </span>
              </div>
              <div className="relative flex items-center">
                <span className="absolute left-3.5 text-sm font-bold text-slate-400 pointer-events-none">
                  {symbol}
                </span>
                <input
                  type="number"
                  min="0"
                  step="1000"
                  value={grossIncome}
                  onChange={(e) => setGrossIncome(Math.max(0, parseFloat(e.target.value) || 0))}
                  placeholder="e.g. 85000"
                  className="w-full min-h-[48px] pl-9 pr-4 text-sm font-bold rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/60 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 transition-all"
                />
              </div>
              {/* Quick slider */}
              <input
                type="range"
                min="10000"
                max="300000"
                step="5000"
                value={Math.min(300000, grossIncome)}
                onChange={(e) => setGrossIncome(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
            </div>

            {/* Input 2: Estimated Tax Rate (%) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-extrabold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                  <Percent className="w-3.5 h-3.5 text-amber-500" />
                  <span>Estimated Tax Rate (%)</span>
                </label>
                <span className="text-xs font-black px-2.5 py-0.5 rounded-lg bg-amber-50 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 font-mono">
                  {taxRate}%
                </span>
              </div>
              <div className="relative flex items-center">
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.5"
                  value={taxRate}
                  onChange={(e) => setTaxRate(Math.min(100, Math.max(0, parseFloat(e.target.value) || 0)))}
                  placeholder="e.g. 22"
                  className="w-full min-h-[48px] px-4 text-sm font-bold rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/60 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 transition-all"
                />
                <span className="absolute right-4 text-sm font-bold text-slate-400 pointer-events-none">
                  %
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="60"
                step="1"
                value={taxRate}
                onChange={(e) => setTaxRate(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
            </div>

            {/* Input 3: Custom Deductions & Allowances */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-extrabold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                  <TrendingDown className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Custom Deductions / Allowances</span>
                </label>
                <span className="text-xs font-black text-slate-900 dark:text-white font-mono">
                  {formatMoney(deductions)}
                </span>
              </div>
              <div className="relative flex items-center">
                <span className="absolute left-3.5 text-sm font-bold text-slate-400 pointer-events-none">
                  {symbol}
                </span>
                <input
                  type="number"
                  min="0"
                  step="500"
                  value={deductions}
                  onChange={(e) => setDeductions(Math.max(0, parseFloat(e.target.value) || 0))}
                  placeholder="e.g. 14600"
                  className="w-full min-h-[48px] pl-9 pr-4 text-sm font-bold rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/60 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all"
                />
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Includes Standard Deduction, 401(k)/Pension contributions, health insurance, and pre-tax benefits.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Visualization & Output Cards */}
        <div className="lg:col-span-6 space-y-6">
          {/* Key Metric Headline Cards */}
          <div className="grid grid-cols-2 gap-3.5">
            {/* Net Take-Home Card */}
            <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.04)] space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Net Take-Home</span>
              </span>
              <div className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight">
                {periodView === 'annual' ? formatMoney(netIncome) : formatMoney(monthlyNet)}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {periodView === 'annual'
                  ? `${formatMoney(monthlyNet)} / month`
                  : `${formatMoney(netIncome)} / year`}
              </p>
            </div>

            {/* Total Tax Paid Card */}
            <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.04)] space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1">
                <Percent className="w-3.5 h-3.5" />
                <span>Total Tax Paid</span>
              </span>
              <div className="text-2xl sm:text-3xl font-black text-amber-600 dark:text-amber-400 tracking-tight">
                {periodView === 'annual' ? formatMoney(totalTax) : formatMoney(monthlyTax)}
              </div>
              <div className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 dark:text-amber-300">
                <span>Effective Rate: {effectiveTaxRate.toFixed(1)}%</span>
              </div>
            </div>
          </div>

          {/* Recharts Animated Donut Visualization Card */}
          <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.04)] space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                Income Allocation Breakdown
              </h4>
              {/* Annual / Monthly Toggle */}
              <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800">
                <button
                  type="button"
                  onClick={() => setPeriodView('annual')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    periodView === 'annual'
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  Annual
                </button>
                <button
                  type="button"
                  onClick={() => setPeriodView('monthly')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    periodView === 'monthly'
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  Monthly
                </button>
              </div>
            </div>

            {/* Donut Chart Container with min-height */}
            <div className="relative w-full h-[260px] sm:h-[280px] flex items-center justify-center">
              {isMounted ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={65}
                      outerRadius={95}
                      paddingAngle={4}
                      dataKey="value"
                      stroke="none"
                      animationDuration={800}
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: unknown) => [
                        typeof value === 'number' ? formatMoney(value) : String(value ?? ''),
                        'Amount',
                      ]}
                      contentStyle={{
                        borderRadius: '16px',
                        backgroundColor: '#0f172a',
                        border: 'none',
                        color: '#fff',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        boxShadow: '0 10px 25px -5px rgba(0,0,0,0.3)',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="w-48 h-48 rounded-full border-4 border-slate-200 animate-pulse" />
              )}

              {/* Center Donut Label */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-[10px] uppercase font-extrabold tracking-wider text-slate-400">
                  Take-Home
                </span>
                <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                  {takeHomePercentage.toFixed(0)}%
                </span>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                  {periodView === 'annual' ? formatMoney(netIncome) : formatMoney(monthlyNet)}
                </span>
              </div>
            </div>

            {/* Custom Legend / Metric List */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                <span className="w-3 h-3 rounded-full bg-emerald-500 shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-bold text-slate-500 truncate">Net Pay</p>
                  <p className="text-xs font-black text-slate-900 dark:text-white truncate">
                    {periodView === 'annual' ? formatMoney(netIncome) : formatMoney(monthlyNet)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                <span className="w-3 h-3 rounded-full bg-amber-500 shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-bold text-slate-500 truncate">Total Tax</p>
                  <p className="text-xs font-black text-slate-900 dark:text-white truncate">
                    {periodView === 'annual' ? formatMoney(totalTax) : formatMoney(monthlyTax)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                <span className="w-3 h-3 rounded-full bg-indigo-500 shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-bold text-slate-500 truncate">Deductions</p>
                  <p className="text-xs font-black text-slate-900 dark:text-white truncate">
                    {periodView === 'annual' ? formatMoney(deductions) : formatMoney(monthlyDeductions)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Export Action Controls */}
          <div className="space-y-2.5">
            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={isExporting || grossIncome <= 0}
              className="w-full min-h-[56px] px-8 py-4 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-400 text-white text-base sm:text-lg font-black shadow-xl shadow-amber-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-3 cursor-pointer disabled:opacity-50"
            >
              <Download className="w-5 h-5 sm:w-6 sm:h-6" />
              <span>
                {isExporting ? 'Generating PDF...' : 'Download Summary (PDF)'}
              </span>
            </button>

            <button
              type="button"
              onClick={handleCopyBreakdown}
              className="w-full min-h-[48px] px-6 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs sm:text-sm font-bold shadow-xs active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span className="text-emerald-600 font-bold">Copied to Clipboard!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-slate-400" />
                  <span>Copy Breakdown to Clipboard</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
