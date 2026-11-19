import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/*  Page head                                                          */
/* ------------------------------------------------------------------ */

export function PageHead({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div className="min-w-0">
        <h2 className="font-display text-[26px] leading-tight tracking-[-0.01em] text-ink sm:text-[30px]">
          {title}
        </h2>
        {description ? (
          <p className="mt-1.5 max-w-2xl text-[13px] leading-relaxed text-ash">{description}</p>
        ) : null}
      </div>
      {children ? <div className="flex flex-wrap items-center gap-2.5">{children}</div> : null}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Cards                                                              */
/* ------------------------------------------------------------------ */

export function Card({
  children,
  className,
  pad = true,
  hover = false,
}: {
  children: React.ReactNode;
  className?: string;
  pad?: boolean;
  hover?: boolean;
}) {
  return (
    <section
      className={cn(
        "admin-card",
        hover && "admin-card-hover",
        pad && "p-5 sm:p-6",
        className,
      )}
    >
      {children}
    </section>
  );
}

export function CardHead({
  title,
  description,
  action,
  className,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mb-5 flex flex-wrap items-start justify-between gap-3", className)}>
      <div className="min-w-0">
        <h3 className="font-display text-[19px] leading-tight text-ink">{title}</h3>
        {description ? (
          <p className="mt-1 text-[12.5px] leading-relaxed text-ash">{description}</p>
        ) : null}
      </div>
      {action}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Stat card                                                          */
/* ------------------------------------------------------------------ */

const statTones: Record<string, { chip: string; glow: string }> = {
  neutral: { chip: "bg-cream text-ash", glow: "from-cream/60" },
  gold: { chip: "bg-gold-pale text-gold-deep", glow: "from-gold-pale/70" },
  success: { chip: "bg-success/10 text-success", glow: "from-success/10" },
  danger: { chip: "bg-danger/10 text-danger", glow: "from-danger/10" },
  ink: { chip: "bg-ink text-gold", glow: "from-ink/5" },
};

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  tone = "neutral",
  children,
}: {
  label: string;
  value: string;
  hint?: string;
  icon?: LucideIcon;
  tone?: keyof typeof statTones;
  children?: React.ReactNode;
}) {
  const palette = statTones[tone] ?? statTones.neutral;
  return (
    <section className="admin-card admin-card-hover group/stat relative overflow-hidden p-5">
      {/* soft accent glow in the corner */}
      <div
        className={cn(
          "pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-gradient-to-br to-transparent blur-2xl transition-opacity duration-500 group-hover/stat:opacity-100",
          palette.glow,
        )}
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-champagne/40 to-transparent"
        aria-hidden="true"
      />
      <div className="relative flex items-start justify-between gap-3">
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-ash">{label}</p>
        {Icon ? (
          <span
            className={cn(
              "grid h-9 w-9 shrink-0 place-items-center rounded-lg ring-1 ring-inset ring-black/[0.04] transition-transform duration-300 group-hover/stat:scale-110",
              palette.chip,
            )}
          >
            <Icon className="h-[18px] w-[18px]" strokeWidth={1.7} aria-hidden="true" />
          </span>
        ) : null}
      </div>
      <p className="relative mt-3.5 font-display text-[30px] leading-none tracking-tight text-ink tabular-nums">
        {value}
      </p>
      {hint ? <p className="relative mt-2 text-[11.5px] leading-snug text-ash-light">{hint}</p> : null}
      {children}
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Pills / badges                                                     */
/* ------------------------------------------------------------------ */

const pillTones: Record<string, string> = {
  neutral: "bg-cream text-ash border-line",
  gold: "bg-gold-pale text-gold-deep border-gold/20",
  success: "bg-success/10 text-success border-success/20",
  warning: "bg-warning/10 text-warning border-warning/20",
  danger: "bg-danger/10 text-danger border-danger/20",
  ink: "bg-ink text-ivory border-ink",
};

export function Pill({
  children,
  tone = "neutral",
  className,
  dot,
}: {
  children: React.ReactNode;
  tone?: keyof typeof pillTones;
  className?: string;
  dot?: boolean;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-0.5 text-[9.5px] font-semibold uppercase tracking-[0.08em]",
        pillTones[tone] ?? pillTones.neutral,
        className,
      )}
    >
      {dot ? <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" /> : null}
      {children}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  Table shell                                                        */
/* ------------------------------------------------------------------ */

export function TableShell({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("-mx-5 overflow-x-auto px-5 sm:-mx-6 sm:px-6", className)}>
      <table className="admin-table min-w-[640px]">{children}</table>
    </div>
  );
}

export function Th({ children, className }: { children?: React.ReactNode; className?: string }) {
  return <th className={className}>{children}</th>;
}

export function Td({
  children,
  className,
  colSpan,
}: {
  children?: React.ReactNode;
  className?: string;
  colSpan?: number;
}) {
  return (
    <td colSpan={colSpan} className={className}>
      {children}
    </td>
  );
}

/* ------------------------------------------------------------------ */
/*  Empty state                                                        */
/* ------------------------------------------------------------------ */

export function EmptyState({
  icon: Icon,
  title,
  body,
  action,
}: {
  icon?: LucideIcon;
  title: string;
  body?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center px-6 py-16 text-center">
      {Icon ? (
        <span className="relative grid h-14 w-14 place-items-center rounded-2xl border border-champagne/30 bg-gradient-to-b from-champagne-pale to-cream text-gold-deep shadow-[0_2px_8px_-2px_rgba(160,124,62,0.35)]">
          <Icon className="h-6 w-6" strokeWidth={1.5} aria-hidden="true" />
        </span>
      ) : null}
      <p className="mt-4 font-display text-[22px] text-ink">{title}</p>
      {body ? <p className="mt-1.5 max-w-sm text-[12.5px] leading-relaxed text-ash">{body}</p> : null}
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Buttons / links                                                    */
/* ------------------------------------------------------------------ */

export function AdminButtonLink({
  href,
  children,
  variant = "outline",
  size = "sm",
}: {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "outline" | "gold" | "danger";
  size?: "sm" | "md";
}) {
  const variants = {
    primary: "bg-ink text-ivory shadow-[0_1px_2px_rgba(18,25,22,0.12)] hover:bg-ink-soft",
    outline: "border border-line bg-white text-ink shadow-[0_1px_2px_rgba(18,25,22,0.04)] hover:border-line-dark hover:bg-cream/60",
    gold: "bg-gold text-white shadow-[0_1px_2px_rgba(23, 83, 64,0.25)] hover:bg-gold-deep",
    danger: "border border-danger/25 bg-danger/5 text-danger hover:bg-danger hover:text-white",
  } as const;
  const sizes = {
    sm: "h-9 px-4 text-[10px] uppercase tracking-[0.13em]",
    md: "h-11 px-6 text-[10.5px] uppercase tracking-[0.13em]",
  } as const;
  return (
    <a
      href={href}
      className={`inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-medium transition-all ${variants[variant]} ${sizes[size]}`}
    >
      {children}
    </a>
  );
}

/* ------------------------------------------------------------------ */
/*  Filter field wrappers                                              */
/* ------------------------------------------------------------------ */

export function FilterField({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={`block ${className ?? ""}`}>
      <span className="mb-1.5 block text-[9.5px] font-semibold uppercase tracking-[0.12em] text-ash-light">
        {label}
      </span>
      {children}
    </label>
  );
}

export function SearchInput({
  value,
  onChange,
  placeholder,
  className,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}) {
  return (
    <div className={`relative ${className ?? ""}`}>
      <svg
        className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ash-light"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.3-4.3" />
      </svg>
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder ?? "Search"}
        className="admin-input h-10 pl-9 text-[13px]"
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Toggle switch (client)                                             */
/* ------------------------------------------------------------------ */

export function Switch({
  checked,
  onChange,
  label,
  disabled,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
        checked ? "bg-gold" : "bg-line-dark"
      }`}
    >
      <span
        className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${
          checked ? "translate-x-[18px]" : "translate-x-[3px]"
        }`}
      />
    </button>
  );
}

/* ------------------------------------------------------------------ */
/*  Segmented control (client)                                         */
/* ------------------------------------------------------------------ */

export function Segmented<T extends string>({
  options,
  value,
  onChange,
  size = "md",
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
  size?: "sm" | "md";
}) {
  return (
    <div className="inline-flex rounded-lg border border-line bg-cream/70 p-0.5">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          aria-pressed={value === option.value}
          className={`rounded-md font-medium transition-colors ${
            size === "sm" ? "px-2.5 py-1.5 text-[10px] uppercase tracking-[0.1em]" : "px-3.5 py-2 text-[11px]"
          } ${
            value === option.value
              ? "bg-ink text-ivory shadow-sm"
              : "text-ash hover:bg-white hover:text-ink"
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
