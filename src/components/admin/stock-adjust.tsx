"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { SlidersHorizontal } from "lucide-react";
import { adjustStockAction } from "@/actions/inventory";
import { Dialog, DialogContent, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { formatNumber } from "@/lib/format";

type Mode = "add" | "remove" | "set";

export function StockAdjustButton({
  productId,
  variantId,
  productName,
  variantLabel,
  stock,
}: {
  productId: string;
  variantId: string;
  productName: string;
  variantLabel: string;
  stock: number;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [mode, setMode] = useState<Mode>("add");
  const [quantity, setQuantity] = useState("1");
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  function submit() {
    setError("");
    const qty = Number(quantity);
    startTransition(async () => {
      const result = await adjustStockAction({
        productId,
        variantId,
        mode,
        quantity: qty,
        reason,
      });
      if (result.ok) {
        toast.success(result.message ?? "Stock updated.");
        setOpen(false);
        setReason("");
        setQuantity("1");
        router.refresh();
      } else {
        setError(result.error ?? "Could not update stock.");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          className="inline-flex h-8 items-center gap-1.5 border border-line bg-white px-2.5 text-[10px] font-medium uppercase tracking-[0.1em] text-ink transition-colors hover:border-ink"
        >
          <SlidersHorizontal className="h-3.5 w-3.5" aria-hidden="true" />
          Adjust
        </button>
      </DialogTrigger>
      <DialogContent
        title="Adjust stock"
        description={`${productName} — ${variantLabel}`}
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between border border-line bg-cream/60 px-4 py-2.5">
            <span className="text-[11px] uppercase tracking-[0.12em] text-ash">Current stock</span>
            <span className="font-display text-[22px] leading-none text-ink tabular-nums">
              {formatNumber(stock)}
            </span>
          </div>

          <div>
            <span className="admin-label">Adjustment type</span>
            <div className="grid grid-cols-3 gap-1.5">
              {(["add", "remove", "set"] as Mode[]).map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setMode(option)}
                  aria-pressed={mode === option}
                  className={
                    mode === option
                      ? "h-9 border border-ink bg-ink text-[11px] font-medium uppercase tracking-[0.1em] text-ivory"
                      : "h-9 border border-line bg-white text-[11px] font-medium uppercase tracking-[0.1em] text-ash transition-colors hover:border-ink hover:text-ink"
                  }
                >
                  {option === "add" ? "Add" : option === "remove" ? "Remove" : "Set to"}
                </button>
              ))}
            </div>
          </div>

          <Field
            label={mode === "set" ? "New quantity" : "Quantity"}
            htmlFor="quantity"
            error={error}
            required
          >
            <input
              id="quantity"
              type="number"
              min={0}
              value={quantity}
              onChange={(event) => setQuantity(event.target.value)}
              className="admin-input"
            />
          </Field>

          <Field label="Reason" htmlFor="reason" required>
            <input
              id="reason"
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              className="admin-input"
              placeholder="e.g. New stock delivery"
            />
          </Field>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={pending}>
            Cancel
          </Button>
          <Button variant="primary" loading={pending} onClick={submit}>
            Update stock
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}