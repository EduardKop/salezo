import Link from "next/link";
import { ArrowRight, BarChart3 } from "lucide-react";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-neutral-200/50 via-transparent to-transparent dark:from-neutral-900/50" />
      
      <div className="z-10 flex flex-col items-center text-center max-w-3xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 mb-8 backdrop-blur-sm">
          <span className="flex h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
          <span className="text-sm font-medium">Major Moments is now in Beta</span>
        </div>

        <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-b from-neutral-900 to-neutral-500 dark:from-white dark:to-neutral-500">
          The Workspace for <br className="hidden md:block" /> 
          Top-tier Sales Teams.
        </h1>
        
        <p className="text-lg text-neutral-600 dark:text-neutral-400 mb-10 max-w-xl">
          High-performance utility dashboard designed specifically for sales reps, 
          team leads, and owners. Maximum information density, zero visual noise.
        </p>

        <div className="flex items-center gap-4">
          <Link 
            href="/login" 
            className="group inline-flex items-center justify-center gap-2 bg-black dark:bg-white text-white dark:text-black px-8 py-3.5 rounded-2xl font-medium tracking-tight hover:scale-105 active:scale-95 transition-all"
          >
            Sign In
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link 
            href="/about" 
            className="inline-flex items-center justify-center px-8 py-3.5 rounded-2xl font-medium text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors"
          >
            Learn More
          </Link>
        </div>
      </div>
    </main>
  );
}
