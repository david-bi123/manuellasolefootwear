"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Plus, Save, Trash2 } from "lucide-react";
import { createSaleAction } from "@/actions/sales";
import { PAYMENT_METHODS, PAYMENT_STATUSES } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Field, FieldError } from "@/components/ui/field";
import { formatMoney } from "@/lib/format";
import type { SaleInput } from "@/lib/validators";

type ProductOption = {
  id: string;
  name: string;
  sku: string;
  sizingSystem: string;
  categoryName: string;
  image: string;
  variants: {
    id: string;
    size: string;
    colour: string;
    stockQuantity: number;
    sellingPrice: number;
    listPrice: number;
    costPrice: number;
    sku: string;
  }[];
};

type LineItem = {
  key: string;
  productId: string;
  variantId: string;
  quantity: number;
};

export function SaleForm({ products }: { products: ProductOption[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [items, setItems] = useState<LineItem[]>([]);
  const [discount, setDiscount] = useState("0");
  const [paymentMethod, setPaymentMethod] = useState<string>("Mobile Money");
  const [paymentStatus, setPaymentStatus] = useState<string>("Paid");
  const [amountPaid, setAmountPaid] = useState("");
  const [notes, setNotes] = useState("");

  const availableProducts = useMemo(
    () => products.filter((product) => product.variants.some((variant) => variant.stockQuantity > 0)),
    [products],
  );

  // Resolve each line to its product + variant for pricing and totals.
  const lines = useMemo(() => {
    return items.map((item) => {
      const product = products.find((p) => p.id === item.productId);
      const variant = product?.variants.find((v) => v.id === item.variantId);
      return {
        ...item,
        product,
        variant,
        unitPrice: variant?.sellingPrice ?? 0,
        maxStock: variant?.stockQuantity ?? 0,
      };
    });
  }, [items, products]);

  const subtotal = lines.reduce((sum, line) => sum + line.unitPrice * line.quantity, 0);
  const discountValue = Math.min(Math.max(0, Number(discount) || 0), subtotal);
  const total = Math.max(0, subtotal - discountValue);

  function addLine(productId?: string) {
    const product =
      availableProducts.find((p) => p.id === productId) ?? availableProducts[0];
    if (!product) return;
    const variant = product.variants.find((v) => v.stockQuantity > 0);
    if (!variant) return;
    setItems((current) => [
      ...current,
      {
        key: `${product.id}-${variant.id}-${Date.now()}-${current.length}`,
        productId: product.id,
        variantId: variant.id,
        quantity: 1,
      },
    ]);
  }

  function updateLine(key: string, patch: Partial<LineItem>) {
    setItems((current) =>
      current.map((item) => (item.key === key ? { ...item, ...patch } : item)),
    );
  }

  function onProductChange(key: string, productId: string) {
    const product = products.find((p) => p.id === productId);
    const variant = product?.variants.find((v) => v.stockQuantity > 0);
    updateLine(key, {
      productId,
      variantId: variant?.id ?? "",
      quantity: 1,
    });
  }

  function removeLine(key: string) {
    setItems((current) => current.filter((item) => item.key !== key));
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setFieldErrors({});

    if (items.length === 0) {
      setError("Add at least one product to the sale.");
      return;
    }

    const payload: SaleInput = {
      customerName,
      customerPhone,
      items: items.map((item) => ({
        productId: item.productId,
        variantId: item.variantId,
        quantity: item.quantity,
      })),
      discount: Number(discount) || 0,
      paymentMethod: paymentMethod as SaleInput["paymentMethod"],
      paymentStatus: paymentStatus as SaleInput["paymentStatus"],
      amountPaid: paymentStatus === "Partially Paid" ? Number(amountPaid) || undefined : undefined,
      notes,
    };

    startTransition(async () => {
      const result = await createSaleAction(payload);
      if (result.ok) {
        toast.success(result.message ?? "Sale recorded.");
        if (result.data?.id) {
          router.push(`/admin/sales/${result.data.id}`);
        } else {
          router.push("/admin/sales");
        }
        router.refresh();
      } else {
        setError(result.error ?? "Could not record the sale.");
        setFieldErrors(result.fieldErrors ?? {});
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    });
  }

  return (
    <form onSubmit={submit} className="space-y-5" noValidate>
      {error ? (
        <div role="alert" className="border border-danger/25 bg-danger/5 px-4 py-3 text-[12.5px] text-danger">
          {error}
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1.6fr_1fr]">
        <div className="space-y-5">
          <section className="admin-card p-5 sm:p-6">
            <h3 className="mb-4 font-display text-[20px] text-ink">Customer</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Name" htmlFor="customer" error={fieldErrors.customerName}>
                <input
                  id="customer"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="admin-input"
                  placeholder="Walk-in customer"
                />
              </Field>
              <Field label="Phone" htmlFor="phone" error={fieldErrors.customerPhone}>
                <input
                  id="phone"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="admin-input"
                  placeholder="024 000 0000"
                />
              </Field>
            </div>
          </section>

          <section className="admin-card p-5 sm:p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-display text-[20px] text-ink">Items</h3>
              <button
                type="button"
                onClick={() => addLine()}
                disabled={availableProducts.length === 0}
                className="inline-flex h-8 items-center gap-1.5 border border-line bg-white px-3 text-[10px] font-medium uppercase tracking-[0.12em] text-ink transition-colors hover:border-ink disabled:opacity-40"
              >
                <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                Add item
              </button>
            </div>

            {items.length === 0 ? (
              <div className="border border-dashed border-line-dark bg-cream/40 px-4 py-10 text-center">
                <p className="text-[12.5px] text-ash">
                  No items yet. Add a product to begin the sale.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {lines.map((line) => (
                  <div key={line.key} className="border border-line bg-cream/40 p-3.5">
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_auto_auto_auto] sm:items-end">
                      <Field label="Product">
                        <select
                          value={line.productId}
                          onChange={(e) => onProductChange(line.key, e.target.value)}
                          className="admin-input h-9 text-[13px]"
                        >
                          {availableProducts.map((product) => (
                            <option key={product.id} value={product.id}>
                              {product.name} ({product.sku})
                            </option>
                          ))}
                        </select>
                      </Field>

                      <Field label="Variant">
                        <select
                          value={line.variantId}
                          onChange={(e) =>
                            updateLine(line.key, {
                              variantId: e.target.value,
                              quantity: 1,
                            })
                          }
                          className="admin-input h-9 min-w-[130px] text-[13px]"
                        >
                          {line.product?.variants.map((variant) => (
                            <option key={variant.id} value={variant.id} disabled={variant.stockQuantity === 0}>
                              {variant.size} · {variant.colour} ({variant.stockQuantity})
                            </option>
                          ))}
                        </select>
                      </Field>

                      <Field label="Qty" error={line.quantity > line.maxStock ? "Exceeds stock" : undefined}>
                        <input
                          type="number"
                          min={1}
                          max={line.maxStock || 1}
                          value={line.quantity}
                          onChange={(e) =>
                            updateLine(line.key, { quantity: Number(e.target.value) || 1 })
                          }
                          className="admin-input h-9 w-20 text-[13px]"
                        />
                      </Field>

                      <div className="flex items-end gap-2">
                        <span className="whitespace-nowrap pb-2.5 text-[13px] font-medium tabular-nums text-ink">
                          {formatMoney(line.unitPrice * line.quantity)}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeLine(line.key)}
                          className="grid h-9 w-9 shrink-0 place-items-center border border-line bg-white text-ash transition-colors hover:border-danger hover:text-danger"
                          aria-label="Remove item"
                        >
                          <Trash2 className="h-4 w-4" aria-hidden="true" />
                        </button>
                      </div>
                    </div>
                    {line.variant ? (
                      <p className="mt-2 text-[11px] text-ash-light">
                        {formatMoney(line.unitPrice)} each · {line.maxStock} in stock
                      </p>
                    ) : null}
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        <div className="space-y-5">
          <section className="admin-card p-5">
            <h3 className="mb-4 font-display text-[20px] text-ink">Summary</h3>
            <dl className="space-y-2.5 text-[13px]">
              <div className="flex items-center justify-between">
                <dt className="text-ash">Subtotal</dt>
                <dd className="font-medium tabular-nums text-ink">{formatMoney(subtotal)}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-ash">Discount</dt>
                <dd>
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    value={discount}
                    onChange={(e) => setDiscount(e.target.value)}
                    className="admin-input h-8 w-24 text-right text-[13px]"
                  />
                </dd>
              </div>
              <div className="flex items-center justify-between border-t border-line pt-2.5">
                <dt className="font-medium text-ink">Total</dt>
                <dd className="font-display text-[26px] leading-none tabular-nums text-ink">
                  {formatMoney(total)}
                </dd>
              </div>
            </dl>
          </section>

          <section className="admin-card p-5">
            <h3 className="mb-4 font-display text-[20px] text-ink">Payment</h3>
            <div className="space-y-4">
              <Field label="Method" htmlFor="method">
                <select
                  id="method"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="admin-input"
                >
                  {PAYMENT_METHODS.map((method) => (
                    <option key={method} value={method}>
                      {method}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Status" htmlFor="status">
                <select
                  id="status"
                  value={paymentStatus}
                  onChange={(e) => setPaymentStatus(e.target.value)}
                  className="admin-input"
                >
                  {PAYMENT_STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </Field>

              {paymentStatus === "Partially Paid" ? (
                <Field
                  label="Amount paid"
                  htmlFor="amount"
                  error={fieldErrors.amountPaid}
                  hint={`Outstanding: ${formatMoney(Math.max(0, total - (Number(amountPaid) || 0)))}`}
                >
                  <input
                    id="amount"
                    type="number"
                    min={0}
                    step="0.01"
                    value={amountPaid}
                    onChange={(e) => setAmountPaid(e.target.value)}
                    className="admin-input"
                    placeholder="0.00"
                  />
                </Field>
              ) : null}

              <Field label="Notes" htmlFor="notes" error={fieldErrors.notes}>
                <textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  className="admin-input resize-none"
                  placeholder="Optional note"
                />
              </Field>
            </div>
          </section>

          <section className="admin-card p-5">
            <div className="flex flex-col gap-2.5">
              <Button type="submit" loading={pending} className="h-11 w-full">
                <Save className="h-4 w-4" aria-hidden="true" />
                Record sale
              </Button>
              <Link
                href="/admin/sales"
                className="inline-flex h-11 items-center justify-center border border-line bg-white px-6 text-[11px] uppercase tracking-[0.14em] text-ash transition-colors hover:border-ink hover:text-ink"
              >
                Cancel
              </Link>
            </div>
          </section>
        </div>
      </div>
    </form>
  );
}