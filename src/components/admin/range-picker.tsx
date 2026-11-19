"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { CalendarRange } from "lucide-react";
import { cn } from "@/lib/utils";
import { Segmented } from "@/components/admin/primitives";

const PRESETS = [
  { value: "today", label: "Today" },
  { value: "7d", label: "7 days" },
  { value: "30d", label: "30 days" },
  { value: "month", label: "Month" },
  { value: "all", label: "All time" },
  { value: "custom", label: "Custom" },
] as const;

export function RangePicker({
  preset,
  from,
  to,
  align = "end",
}: {
  preset: string;
  from?: string;
  to?: string;
  align?: "start" | "end";
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  function update(patch: Record<string, string | undefined>) {
    const next = new URLSearchParams(params.toString());
    for (const [key, value] of Object.entries(patch)) {
      if (value) next.set(key, value);
      else next.delete(key);
    }
    router.push(`${pathname}?${next.toString()}`, { scroll: false });
  }

  const isCustom = preset === "custom";

  return (
    <div className={cn("flex flex-wrap items-center gap-2.5", align === "end" && "justify-end")}>
      <Segmented
        size="sm"
        options={PRESETS.map((item) => ({ value: item.value, label: item.label }))}
        value={(PRESETS.some((item) => item.value === preset) ? preset : "30d") as (typeof PRESETS)[number]["value"]}
        onChange={(value) => {
          if (value === "custom") update({ preset: "custom" });
          else update({ preset: value, from: undefined, to: undefined });
        }}
      />

      {isCustom ? (
        <div className="flex items-center gap-2">
          <div className="relative">
            <CalendarRange
              className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ash-light"
              aria-hidden="true"
            />
            <input
              type="date"
              defaultValue={from ?? ""}
              max={to ?? undefined}
              onChange={(event) => update({ from: event.target.value || undefined })}
              className="admin-input h-8 w-[136px] pl-8 text-[12px]"
              aria-label="From date"
            />
          </div>
          <span className="text-ash-light" aria-hidden="true">
            –
          </span>
          <input
            type="date"
            defaultValue={to ?? ""}
            min={from ?? undefined}
            onChange={(event) => update({ to: event.target.value || undefined })}
            className="admin-input h-8 w-[136px] px-2.5 text-[12px]"
            aria-label="To date"
          />
        </div>
      ) : null}
    </div>
  );
}
