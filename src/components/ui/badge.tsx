import { cn } from "@/lib/utils";

const tones: Record<string, string> = {
  neutral: "bg-cream text-ash border-line",
  gold: "bg-gold-pale text-gold-deep border-gold/25",
  success: "bg-success/10 text-success border-success/20",
  warning: "bg-warning/10 text-warning border-warning/20",
  danger: "bg-danger/10 text-danger border-danger/20",
  ink: "bg-ink text-ivory border-ink",
  ivory: "bg-ivory/90 text-ink border-white/30",
};

export function Badge({
  children,
  tone = "neutral",
  className,
}: {
  children: React.ReactNode;
  tone?: keyof typeof tones;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 whitespace-nowrap rounded-full border px-2.5 py-0.5 text-[9px] font-semibold uppercase tracking-[0.14em] shadow-[0_1px_1px_rgba(18,25,22,0.04)]",
        tones[tone] ?? tones.neutral,
        className,
      )}
    >
      {children}
    </span>
  );
}

export function StatusDot({ tone }: { tone: "success" | "warning" | "danger" | "neutral" }) {
  const colors = {
    success: "bg-success",
    warning: "bg-warning",
    danger: "bg-danger",
    neutral: "bg-ash-light",
  };
  return <span className={cn("inline-block h-1.5 w-1.5 rounded-full", colors[tone])} aria-hidden="true" />;
}
