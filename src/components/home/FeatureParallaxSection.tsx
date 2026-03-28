"use client";

import type { PropsWithChildren } from "react";
import { cn } from "@/lib/utils";

type FeatureParallaxLabels = {
  featureIntroEyebrow: string;
  featureIntroTitlePrefix: string;
  featureIntroTitleHighlight: string;
  featureIntroDescription: string;
  featureIntroMorphingTexts: readonly string[];
  featureVectorLabel: string;
  featureScriptLabel: string;
  featureAgentsLabel: string;
  featureBetterLabel: string;
  featureAnalysisLabel: string;
  featureTableFeature: string;
  featureTableHandles: string;
  featureTableValue: string;
  featureVectorHandle: string;
  featureVectorValue: string;
  featureScriptHandle: string;
  featureScriptValue: string;
  featureAgentsHandle: string;
  featureAgentsValue: string;
  featureBetterHandle: string;
  featureBetterValue: string;
  featureAnalysisHandle: string;
  featureAnalysisValue: string;
};

type FeatureParallaxSectionProps = {
  labels: FeatureParallaxLabels;
};

type FeatureRow = {
  label: string;
  handles: string;
  value: string;
  accentClassName: string;
};

function TableHeaderCell({ children }: PropsWithChildren) {
  return (
    <th
      scope="col"
      className="px-5 py-4 text-left text-[11px] font-medium uppercase tracking-[0.18em] text-black/42 dark:text-white/38"
    >
      {children}
    </th>
  );
}

function MobileLabel({ children }: PropsWithChildren) {
  return (
    <div className="mb-1 text-[10px] font-medium uppercase tracking-[0.16em] text-black/38 dark:text-white/34 lg:hidden">
      {children}
    </div>
  );
}

export function FeatureParallaxSection({
  labels,
}: FeatureParallaxSectionProps) {
  const rows: FeatureRow[] = [
    {
      label: labels.featureVectorLabel,
      handles: labels.featureVectorHandle,
      value: labels.featureVectorValue,
      accentClassName: "from-cyan-400/24 via-sky-400/10 to-transparent",
    },
    {
      label: labels.featureScriptLabel,
      handles: labels.featureScriptHandle,
      value: labels.featureScriptValue,
      accentClassName: "from-emerald-400/22 via-lime-400/10 to-transparent",
    },
    {
      label: labels.featureAgentsLabel,
      handles: labels.featureAgentsHandle,
      value: labels.featureAgentsValue,
      accentClassName: "from-violet-400/24 via-indigo-400/10 to-transparent",
    },
    {
      label: labels.featureBetterLabel,
      handles: labels.featureBetterHandle,
      value: labels.featureBetterValue,
      accentClassName: "from-amber-400/22 via-orange-400/10 to-transparent",
    },
    {
      label: labels.featureAnalysisLabel,
      handles: labels.featureAnalysisHandle,
      value: labels.featureAnalysisValue,
      accentClassName: "from-pink-400/24 via-fuchsia-400/10 to-transparent",
    },
  ];

  return (
    <section
      aria-labelledby="feature-table-heading"
      className="relative z-10 -mt-24 w-full px-4 pb-28 pt-0 lg:-mt-36 lg:px-8 lg:pb-36"
    >
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto mb-10 max-w-4xl text-center lg:mb-14">
          <div className="text-[11px] font-medium uppercase tracking-[0.22em] text-sky-500 dark:text-sky-300">
            {labels.featureIntroEyebrow}
          </div>
          <h2
            id="feature-table-heading"
            className="relative mt-5 overflow-visible pb-3 text-4xl font-bold tracking-tight text-black dark:text-white md:text-5xl md:leading-[1.06] lg:text-6xl lg:leading-[1.04]"
          >
            {labels.featureIntroTitlePrefix} {labels.featureIntroTitleHighlight}
          </h2>
          <div className="mx-auto mt-7 max-w-4xl">
            <p className="text-base font-medium text-black/62 dark:text-white/56 md:text-lg lg:text-xl">
              {labels.featureIntroDescription}
            </p>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-[34px] border border-black/8 bg-white/[0.6] shadow-[0_36px_90px_-58px_rgba(0,0,0,0.35)] backdrop-blur-2xl dark:border-white/10 dark:bg-black/[0.42]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_15%,rgba(34,211,238,0.14),transparent_25%),radial-gradient(circle_at_62%_78%,rgba(168,85,247,0.12),transparent_22%),linear-gradient(135deg,rgba(255,255,255,0.06),transparent_40%)] dark:bg-[radial-gradient(circle_at_70%_15%,rgba(34,211,238,0.16),transparent_25%),radial-gradient(circle_at_62%_78%,rgba(168,85,247,0.14),transparent_22%),linear-gradient(135deg,rgba(255,255,255,0.04),transparent_40%)]" />
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/45 to-transparent dark:via-white/12" />

          <div className="relative lg:hidden">
            {rows.map((row, index) => {
              return (
                <div
                  key={row.label}
                  className={cn(
                    "grid gap-5 px-5 py-5",
                    index !== rows.length - 1 &&
                      "border-b border-black/8 dark:border-white/10"
                  )}
                >
                  <div className="relative">
                    <div
                      className={cn(
                        "absolute inset-y-0 left-0 w-20 bg-gradient-to-r blur-2xl",
                        row.accentClassName
                      )}
                    />
                    <div className="relative text-lg font-bold tracking-[-0.02em] text-black dark:text-white">
                      {row.label}
                    </div>
                  </div>

                  <div>
                    <MobileLabel>{labels.featureTableHandles}</MobileLabel>
                    <p className="text-sm leading-7 text-black/62 dark:text-white/56">
                      {row.handles}
                    </p>
                  </div>

                  <div>
                    <MobileLabel>{labels.featureTableValue}</MobileLabel>
                    <p className="text-sm font-semibold leading-7 text-black/78 dark:text-white/72">
                      {row.value}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="relative hidden lg:block">
            <table className="w-full border-collapse">
              <caption className="sr-only">
                AI sales feature responsibilities and business value
              </caption>
              <thead>
                <tr className="border-b border-black/8 dark:border-white/10">
                  <TableHeaderCell>{labels.featureTableFeature}</TableHeaderCell>
                  <TableHeaderCell>{labels.featureTableHandles}</TableHeaderCell>
                  <TableHeaderCell>{labels.featureTableValue}</TableHeaderCell>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, index) => {
                  return (
                    <tr
                      key={row.label}
                      className={cn(
                        "align-top",
                        index !== rows.length - 1 &&
                          "border-b border-black/8 dark:border-white/10"
                      )}
                    >
                      <td className="w-[26%] px-5 py-5">
                        <div className="relative">
                          <div
                            className={cn(
                              "absolute inset-y-0 left-0 w-24 bg-gradient-to-r blur-2xl",
                              row.accentClassName
                            )}
                          />
                          <div className="relative text-lg font-bold tracking-[-0.02em] text-black dark:text-white">
                            {row.label}
                          </div>
                        </div>
                      </td>
                      <td className="w-[42%] px-5 py-5">
                        <p className="max-w-[48ch] text-sm leading-7 text-black/62 dark:text-white/56">
                          {row.handles}
                        </p>
                      </td>
                      <td className="w-[32%] px-5 py-5">
                        <p className="max-w-[34ch] text-sm font-semibold leading-7 text-black/78 dark:text-white/72">
                          {row.value}
                        </p>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}
