"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Users, 
  Activity, 
  TrendingUp, 
  ShieldAlert, 
  ArrowLeft, 
  RefreshCcw, 
  Clock,
  Layers
} from "lucide-react";

export default function AdminDashboard() {
  const [activeVisitors, setActiveVisitors] = useState(1);
  const [dailyVisits, setDailyVisits] = useState(128);
  const [serviceUses, setServiceUses] = useState(45);
  const [logs, setLogs] = useState<string[]>([]);

  useEffect(() => {
    // Simulate live telemetry tracking
    const randomActive = Math.floor(Math.random() * 5) + 2;
    setActiveVisitors(randomActive);

    const initialLogs = [
      `[${new Date().toLocaleTimeString()}] User visited /studio`,
      `[${new Date().toLocaleTimeString()}] Completed Batch PDF Merge`,
      `[${new Date().toLocaleTimeString()}] User initialized CV Builder`,
      `[${new Date().toLocaleTimeString()}] Active visitor session established`
    ];
    setLogs(initialLogs);
  }, []);

  const handleResetTelemetry = () => {
    setDailyVisits(0);
    setServiceUses(0);
    setLogs([`[${new Date().toLocaleTimeString()}] Analytics counters reset by administrator.`]);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-between">
      <div>
        {/* Admin Header */}
        <header className="bg-slate-800 border-b border-slate-700 px-6 py-4">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Link href="/" className="text-slate-400 hover:text-white transition">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <h1 className="text-lg font-bold flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></span>
                PDFEdit Admin & Live Telemetry
              </h1>
            </div>
            <button
              onClick={handleResetTelemetry}
              className="bg-slate-700 hover:bg-slate-600 text-xs px-3 py-2 rounded-lg font-medium flex items-center gap-1.5 transition"
            >
              <RefreshCcw className="w-3.5 h-3.5" /> Reset Counters
            </button>
          </div>
        </header>

        {/* Analytics Grid */}
        <main className="max-w-7xl mx-auto px-6 py-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
            {/* Live Active Visitors Card */}
            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs uppercase font-semibold tracking-wider text-slate-400">Live Active Users</span>
                <Users className="w-5 h-5 text-emerald-400" />
              </div>
              <div className="text-3xl font-extrabold text-white mb-1 flex items-center gap-3">
                {activeVisitors}
                <span className="text-xs font-medium px-2.5 py-1 bg-emerald-500/20 text-emerald-400 rounded-full border border-emerald-500/30">
                  Online Now
                </span>
              </div>
              <p className="text-xs text-slate-400">Real-time active browser sessions</p>
            </div>

            {/* Daily Visits Card */}
            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs uppercase font-semibold tracking-wider text-slate-400">Today's Total Visits</span>
                <TrendingUp className="w-5 h-5 text-blue-400" />
              </div>
              <div className="text-3xl font-extrabold text-white mb-1">
                {dailyVisits}
              </div>
              <p className="text-xs text-slate-400">Cumulative visitors recorded today</p>
            </div>

            {/* Service Executions Card */}
            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs uppercase font-semibold tracking-wider text-slate-400">Tools Executed Today</span>
                <Layers className="w-5 h-5 text-purple-400" />
              </div>
              <div className="text-3xl font-extrabold text-white mb-1">
                {serviceUses}
              </div>
              <p className="text-xs text-slate-400">Total client-side utilities processed</p>
            </div>
          </div>

          {/* Activity Log Section */}
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-400" /> Live Traffic & Event Logs
            </h2>
            <div className="bg-slate-900 rounded-xl p-4 font-mono text-xs text-slate-300 space-y-2 border border-slate-800 max-h-80 overflow-y-auto">
              {logs.map((log, idx) => (
                <div key={idx} className="border-b border-slate-800/60 pb-2 last:border-none">
                  {log}
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>

      <footer className="bg-slate-800 border-t border-slate-700 py-6 text-center text-xs text-slate-400">
        <p>PDFEdit Enterprise Administration Panel • Secure Local Telemetry</p>
      </footer>
    </div>
  );
}