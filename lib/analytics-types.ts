export interface AnalyticsDashboardData {
  updatedAt: string; rangeStart: string;
  metrics: { online: number; visitors: number; sessions: number; views: number; tools: number; duration: number };
  traffic: { bucket: string; label: string; views: number; visitors: number }[];
  pages: { path: string; views: number; visitors: number }[];
  tools: { name: string; runs: number; percentage: number; succeeded: number; failed: number; unknown: number }[];
  acquisition: Breakdown[]; geography: Breakdown[]; devices: Breakdown[];
  live: { session_id: string; first_seen: string; last_seen: string; last_path: string; country: string | null;
    device: string; browser: string; os: string; referrer: string | null; source: string | null; duration: number }[];
  activity: { id: string; session_id: string; event_type: string; path: string; tool_slug: string | null; success: boolean | null; created_at: string }[];
}
export interface Breakdown { name: string; value: number }
