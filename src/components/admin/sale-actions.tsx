"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Ban, RotateCcw, Wallet } from "lucide-react";
import { cancelSaleAction, returnSaleAction, updatePaymentStatusAction } from "@/actions/sales";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Dialog, DialogContent, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { formatMoney } from "@/lib/format";

type SaleItemLite = {
  id: string;
  productName: string;
  variantLabel: string;
  quantity: number;
  returnedQuantity: number;
};

type Props = {
  sale: {
    id: string;
    saleStatus: string;
    paymentStatus: string;
    amountPaid: number;
    outstanding: number;
    items: SaleItemLite[];
  };
};

export function SaleActions({ sale }: Props) {
  return (
    <div className="space-y-2.5">
      <PaymentDialog sale={sale} />
      <ReturnDialog sale={sale} />
      <CancelDialog sale={sale} />
    </div>
  );
}

function PaymentDialog({ sale }: { sale: Props["sale"] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [status, setStatus] = useState<string>(sale.paymentStatus);
  const [amount, setAmount] = useState(String(sale.amountPaid || ""));
  const [error, setError] = useState("");

  function save() {
    setError("");
    startTransition(async () => {
      const result = await updatePaymentStatusAction(
        sale.id,
        status as "Paid" | "Partially Paid" | "Pending",
        status === "Partially Paid" ? Number(amount) || undefined : undefined,
      );
      if (result.ok) {
        toast.success(result.message ?? "Payment updated.");
        setOpen(false);
        router.refresh();
      } else {
        setError(result.error ?? "Could not update payment.");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full justify-start">
          <Wallet className="h-4 w-4" aria-hidden="true" />
          Update payment
        </Button>
      </DialogTrigger>
      <DialogContent title="Update payment" description={`Outstanding: ${formatMoney(sale.outstanding)}`}>
        <div className="space-y-4">
          {error ? (
            <div role="alert" className="border border-danger/25 bg-danger/5 px-3.5 py-2.5 text-[12px] text-danger">
              {error}
            </div>
          ) : null}
          <Field label="Payment status" htmlFor="pay-status">
            <select
              id="pay-status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="admin-input"
            >
              <option value="Paid">Paid</option>
              <option value="Partially Paid">Partially Paid</option>
              <option value="Pending">Pending</option>
            </select>
          </Field>
          {status === "Partially Paid" ? (
            <Field label="Amount paid" htmlFor="pay-amount">
              <input
                id="pay-amount"
                type="number"
                min={0}
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="admin-input"
              />
            </Field>
          ) : null}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={pending}>
            Cancel
          </Button>
          <Button variant="primary" loading={pending} onClick={save}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ReturnDialog({ sale }: { sale: Props["sale"] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  const returnable = sale.items.filter((item) => item.quantity - item.returnedQuantity > 0);

  function save() {
    setError("");
    const items = returnable
      .map((item) => ({ itemId: item.id, quantity: quantities[item.id] ?? 0 }))
      .filter((entry) => entry.quantity > 0);
    if (items.length === 0) {
      setError("Select at least one item to return.");
      return;
    }
    startTransition(async () => {
      const result = await returnSaleAction(sale.id, items, reason);
      if (result.ok) {
        toast.success(result.message ?? "Return recorded.");
        setOpen(false);
        setQuantities({});
        setReason("");
        router.refresh();
      } else {
        setError(result.error ?? "Could not record the return.");
      }
    });
  }

  if (returnable.length === 0) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full justify-start">
          <RotateCcw className="h-4 w-4" aria-hidden="true" />
          Record a return
        </Button>
      </DialogTrigger>
      <DialogContent title="Record a return" description="Returned stock is added back to inventory.">
        <div className="space-y-4">
          {error ? (
            <div role="alert" className="border border-danger/25 bg-danger/5 px-3.5 py-2.5 text-[12px] text-danger">
              {error}
            </div>
          ) : null}
          <div className="space-y-2">
            {returnable.map((item) => {
              const remaining = item.quantity - item.returnedQuantity;
              return (
                <div key={item.id} className="flex items-center justify-between gap-3 border border-line bg-cream/40 px-3.5 py-2.5">
                  <div className="min-w-0">
                    <p className="truncate text-[13px] font-medium text-ink">{item.productName}</p>
                    <p className="text-[11px] text-ash-light">
                      {item.variantLabel} · {remaining} available
                    </p>
                  </div>
                  <input
                    type="number"
                    min={0}
                    max={remaining}
                    value={quantities[item.id] ?? 0}
                    onChange={(e) =>
                      setQuantities((current) => ({
                        ...current,
                        [item.id]: Math.min(remaining, Math.max(0, Number(e.target.value) || 0)),
                      }))
                    }
                    className="admin-input h-9 w-20 text-[13px]"
                  />
                </div>
              );
            })}
          </div>
          <Field label="Reason" htmlFor="return-reason">
            <input
              id="return-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="admin-input"
              placeholder="e.g. Wrong size"
            />
          </Field>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={pending}>
            Cancel
          </Button>
          <Button variant="primary" loading={pending} onClick={save}>
            Record return
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function CancelDialog({ sale }: { sale: Props["sale"] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  function confirm() {
    setError("");
    startTransition(async () => {
      const result = await cancelSaleAction(sale.id, reason);
      if (result.ok) {
        toast.success(result.message ?? "Sale cancelled.");
        setOpen(false);
        setReason("");
        router.refresh();
      } else {
        setError(result.error ?? "Could not cancel the sale.");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="danger" className="w-full justify-start">
          <Ban className="h-4 w-4" aria-hidden="true" />
          Cancel sale
        </Button>
      </DialogTrigger>
      <DialogContent
        title="Cancel this sale"
        description="All items are returned to stock. This cannot be undone."
      >
        <div className="space-y-4">
          {error ? (
            <div role="alert" className="border border-danger/25 bg-danger/5 px-3.5 py-2.5 text-[12px] text-danger">
              {error}
            </div>
          ) : null}
          <Field label="Reason" htmlFor="cancel-reason" required>
            <input
              id="cancel-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="admin-input"
              placeholder="Why is this sale being cancelled?"
            />
          </Field>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={pending}>
            Keep sale
          </Button>
          <Button variant="danger" loading={pending} onClick={confirm}>
            Cancel sale
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}