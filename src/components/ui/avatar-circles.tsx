import React from "react";
import { cn } from "@/lib/utils";

interface AvatarCirclesProps {
  className?: string;
  numPeople?: number;
  members: { name: string; url: string; initials: string; role?: string }[];
}

const MAX_VISIBLE = 7;

export const AvatarCircles = ({
  numPeople,
  className,
  members,
}: AvatarCirclesProps) => {
  const visible = members.slice(0, MAX_VISIBLE);
  const hiddenCount = Math.max(0, members.length - MAX_VISIBLE) + (numPeople ?? 0);

  return (
    <div className={cn("z-10 flex -space-x-3 rtl:space-x-reverse flex-wrap gap-y-1", className)}>
      {visible.map((member, index) => (
        <div key={index} className="relative group/avatar cursor-pointer">
          {member.url ? (
            <img
              className="h-8 w-8 rounded-full border-2 border-white dark:border-[#000000] object-cover bg-white dark:bg-neutral-900"
              src={member.url}
              alt={member.name}
            />
          ) : (
            <div className="h-8 w-8 rounded-full border-2 border-white dark:border-[#000000] bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-[10px] text-neutral-600 dark:text-neutral-400 font-bold tracking-wider uppercase">
              {member.initials}
            </div>
          )}
          {/* Tooltip */}
          <div className="absolute opacity-0 group-hover/avatar:opacity-100 transition-opacity bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-neutral-900 dark:bg-neutral-100 text-white dark:text-black text-[10px] rounded whitespace-nowrap z-50 pointer-events-none">
            {member.name}{member.role && <span className="opacity-70"> ({member.role})</span>}
          </div>
        </div>
      ))}

      {hiddenCount > 0 && (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-white dark:border-[#000000] bg-neutral-900 text-center text-[10px] font-bold text-white dark:bg-neutral-100 dark:text-black">
          +{hiddenCount}
        </div>
      )}
    </div>
  );
};
