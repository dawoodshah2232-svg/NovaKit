import { TOOLS_CONFIG } from './tools-config';

export interface DayUsage {
  date: string;
  displayDate: string;
  runs: number;
  uniqueVisitors: number;
  pdfRuns: number;
  imageRuns: number;
  financeRuns: number;
  otherRuns: number;
}

export interface ToolUsageStat {
  slug: string;
  name: string;
  category: string;
  runs: number;
  percentage: number;
  gradient: string;
  accentColor: string;
}

export interface AnalyticsSummary {
  totalRuns: number;
  uniqueVisitors: number;
  activeUsersToday: number;
  mostPopularTool: ToolUsageStat;
  operationalStatus: string;
  estimatedImpressions: number;
  estimatedAdRevenue: number;
  toolBreakdown: ToolUsageStat[];
  history7Days: DayUsage[];
  lastUpdated: string;
}

interface StoredAnalyticsData {
  toolCounts: Record<string, number>;
  dailyHistory: Record<string, { runs: number; uniqueVisitors?: number; byCategory: Record<string, number> }>;
  totalUniqueVisitors: number;
  lastSeedTime: number;
}

const STORAGE_KEY = 'novakit_analytics_prod_v3';
const VISITOR_ID_KEY = 'novakit_visitor_id_v3';
const VISITED_DATES_KEY = 'novakit_visited_dates_v3';
const EVENT_NAME = 'novakit_analytics_updated';

// Format YYYY-MM-DD
function getLocalDateKey(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Generate past 7 days date strings
function getPast7Days(): Date[] {
  const days: Date[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d);
  }
  return days;
}

// Client-side unique visitor identifier (Zero-cost, anonymous, strictly client-side)
export function getOrCreateVisitorId(): string {
  if (typeof window === 'undefined') return 'serverless-visitor';
  try {
    let id = localStorage.getItem(VISITOR_ID_KEY);
    if (!id) {
      id = typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : `nvk_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      localStorage.setItem(VISITOR_ID_KEY, id);
    }
    return id;
  } catch {
    return 'ephemeral-client';
  }
}

// Baseline data: clean 0 baseline for live production telemetry ingestion
function generateBaselineData(): StoredAnalyticsData {
  const initialCounts: Record<string, number> = {};
  TOOLS_CONFIG.forEach((tool) => {
    initialCounts[tool.slug] = 0;
  });

  const dailyHistory: Record<string, { runs: number; uniqueVisitors: number; byCategory: Record<string, number> }> = {};
  const past7 = getPast7Days();

  past7.forEach((dateObj) => {
    const key = getLocalDateKey(dateObj);
    dailyHistory[key] = {
      runs: 0,
      uniqueVisitors: 0,
      byCategory: {
        PDF: 0,
        Image: 0,
        Finance: 0,
        Text: 0,
        Security: 0,
      },
    };
  });

  return {
    toolCounts: initialCounts,
    dailyHistory,
    totalUniqueVisitors: 0,
    lastSeedTime: Date.now(),
  };
}

// Read from LocalStorage or seed baseline
function getStoredData(): StoredAnalyticsData {
  if (typeof window === 'undefined') {
    return generateBaselineData();
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const initial = generateBaselineData();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
      return initial;
    }
    const parsed = JSON.parse(raw);
    // Ensure all required fields exist
    if (!parsed.toolCounts || typeof parsed.toolCounts !== 'object') {
      parsed.toolCounts = {};
    }
    TOOLS_CONFIG.forEach((tool) => {
      if (typeof parsed.toolCounts[tool.slug] !== 'number') {
        parsed.toolCounts[tool.slug] = 0;
      }
    });
    if (!parsed.dailyHistory || typeof parsed.dailyHistory !== 'object') {
      parsed.dailyHistory = {};
    }
    if (typeof parsed.totalUniqueVisitors !== 'number') {
      parsed.totalUniqueVisitors = 0;
    }
    return parsed;
  } catch (err) {
    console.warn('Failed to parse analytics from localStorage, using fallback:', err);
    return generateBaselineData();
  }
}

// Save to LocalStorage and trigger event
function saveStoredData(data: StoredAnalyticsData): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    window.dispatchEvent(new CustomEvent(EVENT_NAME));
  } catch (err) {
    console.error('Failed to save analytics data:', err);
  }
}

/**
 * Register visitor session for today.
 */
export function trackVisitor(): void {
  if (typeof window === 'undefined') return;
  try {
    getOrCreateVisitorId();
    const todayKey = getLocalDateKey(new Date());

    let visitedDates: string[] = [];
    try {
      const raw = localStorage.getItem(VISITED_DATES_KEY);
      visitedDates = raw ? JSON.parse(raw) : [];
    } catch {
      visitedDates = [];
    }

    if (!visitedDates.includes(todayKey)) {
      visitedDates.push(todayKey);
      if (visitedDates.length > 30) visitedDates.shift();
      localStorage.setItem(VISITED_DATES_KEY, JSON.stringify(visitedDates));

      const data = getStoredData();
      data.totalUniqueVisitors = (data.totalUniqueVisitors || 0) + 1;
      if (!data.dailyHistory[todayKey]) {
        data.dailyHistory[todayKey] = { runs: 0, uniqueVisitors: 0, byCategory: {} };
      }
      data.dailyHistory[todayKey].uniqueVisitors =
        (data.dailyHistory[todayKey].uniqueVisitors || 0) + 1;
      saveStoredData(data);
    }
  } catch (err) {
    console.error('Error recording visitor:', err);
  }
}

/**
 * Record a tool execution event.
 * Call this whenever a user executes a tool action in the browser.
 */
export function trackToolExecution(toolSlug: string): void {
  if (typeof window === 'undefined') return;

  try {
    trackVisitor();
    const data = getStoredData();
    const today = new Date();
    const dateKey = getLocalDateKey(today);

    // Find category from config
    const tool = TOOLS_CONFIG.find((t) => t.slug === toolSlug);
    const category = tool ? tool.category : 'Other';

    // 1. Increment tool count
    data.toolCounts[toolSlug] = (data.toolCounts[toolSlug] || 0) + 1;

    // 2. Increment daily history
    if (!data.dailyHistory[dateKey]) {
      data.dailyHistory[dateKey] = {
        runs: 0,
        uniqueVisitors: 1,
        byCategory: {},
      };
    }

    data.dailyHistory[dateKey].runs = (data.dailyHistory[dateKey].runs || 0) + 1;
    data.dailyHistory[dateKey].byCategory[category] =
      (data.dailyHistory[dateKey].byCategory[category] || 0) + 1;

    saveStoredData(data);
  } catch (err) {
    console.error('Error tracking tool execution:', err);
  }
}

/**
 * Calculate and aggregate analytics summary for the Admin dashboard.
 */
export function getAnalyticsSummary(): AnalyticsSummary {
  const data = getStoredData();
  const past7 = getPast7Days();

  // 1. Calculate tool breakdown across all 12 tools
  let totalRuns = 0;
  const toolBreakdownRaw = TOOLS_CONFIG.map((tool) => {
    const runs = data.toolCounts[tool.slug] || 0;
    totalRuns += runs;
    return {
      slug: tool.slug,
      name: tool.name,
      category: tool.category,
      runs,
      percentage: 0,
      gradient: tool.gradient,
      accentColor: tool.accentColor,
    };
  });

  // Calculate percentages
  const toolBreakdown = toolBreakdownRaw
    .map((item) => ({
      ...item,
      percentage: totalRuns > 0 ? parseFloat(((item.runs / totalRuns) * 100).toFixed(1)) : 0,
    }))
    .sort((a, b) => b.runs - a.runs);

  // 2. Most popular tool
  const topTool = toolBreakdown[0];
  const mostPopularTool =
    topTool && topTool.runs > 0
      ? topTool
      : {
          slug: 'pdf-merger',
          name: 'Awaiting First Run',
          category: 'Live Ingestion Ready',
          runs: 0,
          percentage: 0,
          gradient: 'from-blue-500 to-indigo-600',
          accentColor: 'text-blue-500',
        };

  // 3. Past 7 Days History
  const history7Days: DayUsage[] = past7.map((d) => {
    const key = getLocalDateKey(d);
    const dayEntry = data.dailyHistory[key];
    const runs = dayEntry ? dayEntry.runs : 0;
    const uniqueVisitors = dayEntry ? dayEntry.uniqueVisitors || 0 : 0;
    const byCategory = dayEntry ? dayEntry.byCategory : {};

    const displayDate = d.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });

    return {
      date: key,
      displayDate,
      runs,
      uniqueVisitors,
      pdfRuns: byCategory['PDF'] || 0,
      imageRuns: byCategory['Image'] || 0,
      financeRuns: byCategory['Finance'] || 0,
      otherRuns: (byCategory['Text'] || 0) + (byCategory['Security'] || 0),
    };
  });

  // 4. Active Users Today
  const todayKey = getLocalDateKey(new Date());
  const todayEntry = data.dailyHistory[todayKey];
  const activeUsersToday = todayEntry?.uniqueVisitors || 0;

  // Total Unique Visitors
  const uniqueVisitors = data.totalUniqueVisitors || 0;

  // 5. AdSense Impressions (~2.45 page impressions per tool run with zero layout shift)
  const estimatedImpressions = Math.round(totalRuns * 2.45);

  // 6. Estimated Ad Revenue based on $3.80 Average Corporate Tools CPM
  const estimatedAdRevenue = parseFloat(((estimatedImpressions / 1000) * 3.8).toFixed(2));

  return {
    totalRuns,
    uniqueVisitors,
    activeUsersToday,
    mostPopularTool,
    operationalStatus: '100% Serverless / $0 Cost',
    estimatedImpressions,
    estimatedAdRevenue,
    toolBreakdown,
    history7Days,
    lastUpdated: new Date().toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }),
  };
}

/**
 * Reset analytics data back to fresh baseline.
 */
export function resetAnalyticsData(): void {
  if (typeof window === 'undefined') return;
  const baseline = generateBaselineData();
  saveStoredData(baseline);
}

/**
 * Reset all analytics data to clean 0 baseline.
 */
export function clearAllAnalyticsData(): void {
  if (typeof window === 'undefined') return;
  const empty = generateBaselineData();
  saveStoredData(empty);
}

/**
 * Export analytics breakdown as CSV string.
 */
export function generateAnalyticsCsv(): string {
  const summary = getAnalyticsSummary();
  const rows = [
    ['# NovaKit Telemetry Report', `Exported: ${new Date().toISOString()}`].join(','),
    ['Total Tool Runs', summary.totalRuns].join(','),
    ['Unique Visitors', summary.uniqueVisitors].join(','),
    ['Top Performing Tool', `"${summary.mostPopularTool.name}"`].join(','),
    ['Operational Status', `"${summary.operationalStatus}"`].join(','),
    [],
    ['# Tool Breakdown', 'All 12 Utilities'].join(','),
    ['Rank', 'Tool Name', 'Slug', 'Category', 'Execution Runs', 'Share (%)'].join(','),
    ...summary.toolBreakdown.map((t, idx) =>
      [idx + 1, `"${t.name}"`, `"${t.slug}"`, `"${t.category}"`, t.runs, `${t.percentage}%`].join(',')
    ),
    [],
    ['# 7-Day Daily History'].join(','),
    ['Date', 'Total Runs', 'Unique Visitors', 'PDF Runs', 'Image Runs', 'Finance Runs', 'Other Runs'].join(','),
    ...summary.history7Days.map((d) =>
      [d.date, d.runs, d.uniqueVisitors, d.pdfRuns, d.imageRuns, d.financeRuns, d.otherRuns].join(',')
    ),
  ];

  return rows.join('\n');
}

/**
 * Export full analytics snapshot as JSON string.
 */
export function generateAnalyticsJson(): string {
  const summary = getAnalyticsSummary();
  const rawData = getStoredData();

  const exportPayload = {
    metadata: {
      platform: 'NovaKit Suite',
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      architecture: '100% Serverless / Client-Side WebAssembly & HTML5 Canvas',
      storageEngine: 'localStorage (novakit_analytics_prod_v2)',
    },
    metrics: {
      totalRuns: summary.totalRuns,
      uniqueVisitors: summary.uniqueVisitors,
      activeUsersToday: summary.activeUsersToday,
      topPerformingTool: summary.mostPopularTool,
      operationalStatus: summary.operationalStatus,
      estimatedImpressions: summary.estimatedImpressions,
      estimatedAdRevenueUsd: summary.estimatedAdRevenue,
    },
    toolBreakdown: summary.toolBreakdown,
    history7Days: summary.history7Days,
    rawCounts: rawData.toolCounts,
  };

  return JSON.stringify(exportPayload, null, 2);
}

/**
 * Trigger direct file download in the browser.
 */
export function exportAnalyticsData(format: 'json' | 'csv'): void {
  if (typeof window === 'undefined') return;
  try {
    const isJson = format === 'json';
    const content = isJson ? generateAnalyticsJson() : generateAnalyticsCsv();
    const mimeType = isJson ? 'application/json' : 'text/csv;charset=utf-8;';
    const extension = isJson ? 'json' : 'csv';

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `novakit-analytics-${new Date().toISOString().slice(0, 10)}.${extension}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (err) {
    console.error(`Failed to export analytics as ${format}:`, err);
  }
}

/**
 * Custom hook to listen for real-time analytics updates.
 */
export function subscribeToAnalytics(callback: () => void): () => void {
  if (typeof window === 'undefined') return () => {};

  const handler = () => callback();
  window.addEventListener(EVENT_NAME, handler);
  window.addEventListener('storage', handler);

  return () => {
    window.removeEventListener(EVENT_NAME, handler);
    window.removeEventListener('storage', handler);
  };
}
