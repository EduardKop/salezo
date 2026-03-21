import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { DotPattern } from "@/components/ui/dot-pattern";
import { cn } from "@/lib/utils";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen relative z-0">
      <div className="pointer-events-none fixed inset-0 flex items-start justify-center z-[-2]">
        <div className="h-[40rem] w-[40rem] mt-[-10rem] bg-rose-500/[0.04] dark:bg-blue-500/[0.06] rounded-full blur-3xl mix-blend-multiply dark:mix-blend-screen" />
      </div>
      <DotPattern 
        width={20} 
        height={20} 
        cx={1} 
        cy={1} 
        cr={1} 
        className={cn(
          "fixed inset-0 z-[-1] opacity-60 dark:opacity-30 mix-blend-multiply dark:mix-blend-screen pointer-events-none",
          "[mask-image:linear-gradient(to_bottom_right,white,transparent,transparent)]"
        )} 
      />
      
      <Header />
      <div className="flex">
        <Sidebar />
        {/* pt-12 matches the h-12 of the fixed header, pl-[260px] pushes content right of sidebar */}
        <main className="flex-1 w-full pt-12 md:pl-[260px]">
          {children}
        </main>
      </div>
    </div>
  );
}
