"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogClose = DialogPrimitive.Close;

export function DialogContent({
  children,
  className,
  title,
  description,
  hideClose,
}: {
  children: React.ReactNode;
  className?: string;
  title: string;
  description?: string;
  hideClose?: boolean;
}) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-ink/55 backdrop-blur-[3px] data-[state=open]:animate-in data-[state=closed]:animate-out" />
      <DialogPrimitive.Content
        className={cn(
          "fixed left-1/2 top-1/2 z-50 max-h-[92vh] w-[calc(100vw-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl border border-line bg-ivory p-6 shadow-editorial focus:outline-none sm:p-8",
          className,
        )}
      >
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-[3px] rounded-t-2xl bg-gradient-to-r from-gold-deep via-champagne to-gold-deep"
          aria-hidden="true"
        />
        <DialogPrimitive.Title className="font-display text-2xl text-ink">
          {title}
        </DialogPrimitive.Title>
        {description ? (
          <DialogPrimitive.Description className="mt-1.5 text-sm leading-relaxed text-ash">
            {description}
          </DialogPrimitive.Description>
        ) : null}
        {!hideClose ? (
          <DialogPrimitive.Close
            className="absolute right-4 top-4 grid h-9 w-9 place-items-center text-ash transition-colors hover:bg-cream hover:text-ink"
            aria-label="Close dialog"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </DialogPrimitive.Close>
        ) : null}
        <div className="mt-6">{children}</div>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}

export function DialogFooter({ children }: { children: React.ReactNode }) {
  return <div className="mt-7 flex flex-wrap justify-end gap-3">{children}</div>;
}
