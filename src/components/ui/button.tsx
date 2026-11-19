import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export const buttonVariants = cva(
  "group/btn inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-champagne-deep disabled:cursor-not-allowed disabled:opacity-50 active:translate-y-px",
  {
    variants: {
      variant: {
        primary:
          "bg-ink text-ivory shadow-[0_1px_2px_rgba(18,25,22,0.12)] hover:bg-ink-soft hover:shadow-[0_6px_16px_-6px_rgba(18,25,22,0.45)]",
        outline:
          "border border-line bg-white text-ink shadow-[0_1px_2px_rgba(18,25,22,0.04)] hover:border-line-dark hover:bg-cream/60",
        gold: "bg-gold text-white shadow-[0_1px_2px_rgba(23, 83, 64,0.25)] hover:bg-gold-deep hover:shadow-[0_6px_16px_-6px_rgba(23, 83, 64,0.5)]",
        light: "bg-ivory text-ink shadow-[0_1px_2px_rgba(18,25,22,0.05)] hover:bg-cream",
        ghost: "text-ink hover:bg-cream",
        link: "text-ink underline-offset-4 hover:text-gold-deep hover:underline p-0 h-auto",
        danger:
          "bg-danger text-white shadow-[0_1px_2px_rgba(163,52,43,0.25)] hover:bg-danger/90 hover:shadow-[0_6px_16px_-6px_rgba(163,52,43,0.5)]",
        whatsapp: "bg-[#175340] text-white hover:bg-[#0e3a2c]",
      },
      size: {
        xs: "h-8 px-3 text-[9.5px] uppercase tracking-[0.12em]",
        sm: "h-9 px-4 text-[10px] uppercase tracking-[0.13em]",
        md: "h-11 px-5 text-[10.5px] uppercase tracking-[0.13em]",
        lg: "h-[52px] px-8 text-[11px] uppercase tracking-[0.16em]",
        icon: "h-10 w-10",
        none: "",
      },
      shape: {
        square: "rounded-md",
        pill: "rounded-full",
      },
    },
    defaultVariants: { variant: "primary", size: "md", shape: "square" },
  },
);

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & { loading?: boolean };

export function Button({
  className,
  variant,
  size,
  shape,
  loading,
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(buttonVariants({ variant, size, shape }), className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
      {children}
    </button>
  );
}