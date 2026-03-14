"use client";

import { cn } from "@/lib/utils";
import { ArrowUpRight, TrendingUp, Users, DollarSign, Activity } from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard overview</h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
            Real-time insights and major moments of your sales organization.
          </p>
        </div>
        
        {/* Glassmorphism Role Badge */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 dark:bg-white/5 border border-black/5 dark:border-white/10 backdrop-blur-md shadow-sm hover:scale-105 transition-transform cursor-pointer">
          <div className="w-2 h-2 rounded-full bg-green-500 blur-[1px]" />
          <span className="text-xs font-medium">TeamLead Access</span>
        </div>
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 auto-rows-[180px]">
        {/* Metric 1 */}
        <div className="row-span-1 md:col-span-2 lg:col-span-1 border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#0a0a0a] rounded-3xl p-6 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="flex justify-between items-start mb-4">
             <div className="p-2 bg-neutral-100 dark:bg-neutral-900 rounded-xl">
               <DollarSign className="w-5 h-5 text-neutral-700 dark:text-neutral-300" />
             </div>
             <span className="flex items-center text-xs font-semibold text-green-500 bg-green-500/10 px-2 py-1 rounded-md">
               <ArrowUpRight className="w-3 h-3 mr-1" />
               +12.5%
             </span>
          </div>
          <div>
            <h3 className="text-3xl font-bold tracking-tight">$45,231.89</h3>
            <p className="text-sm text-neutral-500 font-medium mt-1">Total Revenue</p>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="row-span-1 border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#0a0a0a] rounded-3xl p-6 relative overflow-hidden group">
          <div className="flex justify-between items-start mb-4">
             <div className="p-2 bg-neutral-100 dark:bg-neutral-900 rounded-xl">
               <Users className="w-5 h-5 text-neutral-700 dark:text-neutral-300" />
             </div>
          </div>
          <div>
            <h3 className="text-3xl font-bold tracking-tight">+2350</h3>
            <p className="text-sm text-neutral-500 font-medium mt-1">New Leads</p>
          </div>
        </div>

        {/* Main Chart Area (Spans 2 cols, 2 rows) */}
        <div className="md:col-span-2 lg:col-span-2 row-span-2 border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#0a0a0a] rounded-3xl p-6 relative overflow-hidden">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-semibold tracking-tight">Deal Velocity</h3>
            <button className="text-xs px-3 py-1.5 rounded-lg bg-neutral-100 dark:bg-neutral-900 font-medium">This Week</button>
          </div>
          {/* Placeholder for actual Recharts or similar */}
          <div className="flex-1 w-full h-[calc(100%-3rem)] rounded-xl border border-dashed border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50 flex flex-col items-center justify-center text-neutral-400">
            <Activity className="w-8 h-8 mb-2 opacity-50" />
            <span className="text-sm font-medium">Chart visualization loading...</span>
          </div>
        </div>

        {/* Activity Feed (Spans 1 col, 2 rows) */}
        <div className="md:col-span-1 lg:col-span-1 row-span-2 border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#0a0a0a] rounded-3xl p-6 flex flex-col">
          <h3 className="font-semibold tracking-tight mb-4">Recent Activity</h3>
          
          <div className="flex-1 space-y-4 overflow-hidden mask-image-[linear-gradient(to_bottom,black_50%,transparent_100%)]">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-neutral-100 dark:bg-neutral-900 flex-shrink-0 flex items-center justify-center text-xs">
                  A{i}
                </div>
                <div>
                  <p className="text-sm font-medium leading-none">Alex closed a deal</p>
                  <p className="text-xs text-neutral-500 mt-1">2 hours ago</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Small Widget */}
        <div className="md:col-span-2 lg:col-span-3 border border-neutral-200 dark:border-neutral-800 bg-neutral-900 dark:bg-white text-white dark:text-black rounded-3xl p-6 relative overflow-hidden group flex items-center justify-between">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 dark:bg-black/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
          
          <div>
            <h3 className="text-lg font-semibold tracking-tight mb-1">Upgrade your workspace</h3>
            <p className="text-sm opacity-80 max-w-sm text-balance">
              Unlock advanced pipeline analytics and predictive ML models for your sales team.
            </p>
          </div>
          
          <button className="z-10 px-5 py-2.5 rounded-xl bg-white text-black dark:bg-black dark:text-white text-sm font-semibold tracking-tight hover:scale-105 transition-transform shadow-lg shadow-black/10 dark:shadow-white/10 border border-transparent dark:border-white/20">
            Upgrade Now
          </button>
        </div>
      </div>
    </div>
  );
}
