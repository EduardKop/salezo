"use client";

import * as React from "react";
import { useRouter, useParams } from "next/navigation";
import { PageLoader } from "@/components/ui/page-loader";
import { createClient } from "@/lib/supabase";
import { toast } from "sonner";
import { useLanguage } from "@/hooks/useLanguage";

export default function ProjectScriptsRedirectPage() {
  const router = useRouter();
  const params = useParams();
  const projectId = params?.id as string;
  const { language, mounted } = useLanguage();

  React.useEffect(() => {
    if (!projectId) return;

    let alive = true;
    (async () => {
      try {
        const supabase = createClient();
        const { data: scripts, error } = await supabase
          .from("scripts")
          .select("id")
          .eq("project_id", projectId)
          .order("created_at", { ascending: false })
          .limit(1);

        if (error) throw error;

        if (alive) {
          if (scripts && scripts.length > 0) {
            router.replace(`/sales-agents/scripts/${scripts[0].id}/chat`);
          } else {
            // No scripts connected — redirect back to scripts list where they can connect one
            if (mounted) {
              toast.info(
                language === "ru" 
                  ? "В этом проекте пока нет скриптов. Добавьте или подключите скрипт здесь." 
                  : "No scripts in this project yet. Create or connect one here."
              );
            }
            router.replace("/sales-agents/scripts/all");
          }
        }
      } catch (error) {
        console.error("Failed to load project scripts:", error);
        if (alive) {
          router.replace(`/sales-agents/projects/${projectId}`);
        }
      }
    })();

    return () => {
      alive = false;
    };
  }, [projectId, router, language, mounted]);

  return <PageLoader className="min-h-[calc(100vh-5rem)]" />;
}
