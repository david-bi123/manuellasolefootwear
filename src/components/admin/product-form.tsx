"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Plus, Save, Trash2 } from "lucide-react";
import { saveProductAction } from "@/actions/products";
import { Button } from "@/components/ui/button";
import { Field, FieldError } from "@/components/ui/field";
import { ImageUploader, type UploadedImage } from "@/components/admin/image-uploader";
import type { ProductInput } from "@/lib/validators";

type CategoryOption = { id: string; name: string };

type VariantDraft = {
  _id?: string;
  size: string;
  colour: string;
  stockQuantity: string;
  costPrice: string;
  sellingPrice: string;
  salePrice: string;
  sku: string;
};

type Props = {
  productId?: string;
  categories: CategoryOption[];
  initial?: {
    name: string;
    description: string;
    sku: string;
    categoryId: string;
    gender: string;
    sizingSystem: "UK" | "EU";
    images: UploadedImage[];
    variants: {
      _id?: string;
      size: string;
      colour: string;
      stockQuantity: number;
      costPrice: number;
      sellingPrice: number;
      salePrice: number | null;
      sku: string;
    }[];
    isFeatured: boolean;
    isNewArrival: boolean;
    isPublished: boolean;
    lowStockThreshold: number;
  };
};

const EMPTY_VARIANT: VariantDraft = {
  size: "",
  colour: "",
  stockQuantity: "0",
  costPrice: "0",
  sellingPrice: "",
  salePrice: "",
  sku: "",
};

export function ProductForm({ productId, categories, initial }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const [name, setName] = useState(initial?.name ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [sku, setSku] = useState(initial?.sku ?? "");
  const [categoryId, setCategoryId] = useState(initial?.categoryId ?? categories[0]?.id ?? "");
  const [gender, setGender] = useState(initial?.gender ?? "Women");
  const [sizingSystem, setSizingSystem] = useState<"UK" | "EU">(initial?.sizingSystem ?? "EU");
  const [images, setImages] = useState<UploadedImage[]>(initial?.images ?? []);
  const [variants, setVariants] = useState<VariantDraft[]>(
    initial?.variants.length
      ? initial.variants.map((variant) => ({
          _id: variant._id,
          size: variant.size,
          colour: variant.colour,
          stockQuantity: String(variant.stockQuantity),
          costPrice: String(variant.costPrice),
          sellingPrice: String(variant.sellingPrice),
          salePrice: variant.salePrice === null ? "" : String(variant.salePrice),
          sku: variant.sku,
        }))
      : [{ ...EMPTY_VARIANT }],
  );
  const [isFeatured, setIsFeatured] = useState(initial?.isFeatured ?? false);
  const [isNewArrival, setIsNewArrival] = useState(initial?.isNewArrival ?? false);
  const [isPublished, setIsPublished] = useState(initial?.isPublished ?? true);
  const [lowStockThreshold, setLowStockThreshold] = useState(
    String(initial?.lowStockThreshold ?? 3),
  );

  function updateVariant(index: number, patch: Partial<VariantDraft>) {
    setVariants((current) =>
      current.map((variant, i) => (i === index ? { ...variant, ...patch } : variant)),
    );
  }

  function addVariant() {
    setVariants((current) => [...current, { ...EMPTY_VARIANT }]);
  }

  function removeVariant(index: number) {
    setVariants((current) =>
      current.length === 1 ? current : current.filter((_, i) => i !== index),
    );
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setFieldErrors({});

    const payload: ProductInput = {
      id: productId,
      name,
      description,
      sku,
      categoryId,
      gender: gender as ProductInput["gender"],
      sizingSystem,
      images: images.map((image) => ({
        url: image.url,
        publicId: image.publicId ?? "",
        alt: image.alt ?? "",
      })),
      variants: variants.map((variant) => ({
        _id: variant._id,
        size: variant.size,
        colour: variant.colour,
        stockQuantity: Number(variant.stockQuantity) || 0,
        costPrice: Number(variant.costPrice) || 0,
        sellingPrice: Number(variant.sellingPrice) || 0,
        salePrice: variant.salePrice === "" ? null : Number(variant.salePrice),
        sku: variant.sku,
      })),
      isFeatured,
      isNewArrival,
      isPublished,
      lowStockThreshold: Number(lowStockThreshold) || 0,
    };

    startTransition(async () => {
      const result = await saveProductAction(payload);
      if (result.ok) {
        toast.success(result.message ?? "Product saved.");
        router.push("/admin/products");
        router.refresh();
      } else {
        setError(result.error ?? "Could not save the product.");
        setFieldErrors(result.fieldErrors ?? {});
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    });
  }

  return (
    <form onSubmit={submit} className="space-y-5" noValidate>
      {error ? (
        <div
          role="alert"
          className="border border-danger/25 bg-danger/5 px-4 py-3 text-[12.5px] text-danger"
        >
          {error}
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1.5fr_1fr]">
        {/* Main column */}
        <div className="space-y-5">
          <section className="admin-card p-5 sm:p-6">
            <h3 className="mb-4 font-display text-[20px] text-ink">Details</h3>
            <div className="space-y-4">
              <Field label="Product name" htmlFor="name" error={fieldErrors.name} required>
                <input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="admin-input"
                  placeholder="e.g. Nude Patent Peep-Toe Heels"
                  required
                />
              </Field>

              <Field
                label="Description"
                htmlFor="description"
                error={fieldErrors.description}
                hint="Describe the style, materials and fit."
                required
              >
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="admin-input resize-y"
                  placeholder="A considered description of the pair…"
                  required
                />
              </Field>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field
                  label="SKU"
                  htmlFor="sku"
                  error={fieldErrors.sku}
                  hint="Leave blank to generate one automatically (e.g. MS-HEE-001)."
                >
                  <input
                    id="sku"
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    className="admin-input uppercase"
                    placeholder="Auto-generated"
                  />
                </Field>
                <Field label="Category" htmlFor="category" error={fieldErrors.categoryId} required>
                  <select
                    id="category"
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="admin-input"
                    required
                  >
                    {categories.length === 0 ? <option value="">No categories</option> : null}
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Gender" htmlFor="gender">
                  <select
                    id="gender"
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="admin-input"
                  >
                    <option value="Women">Women</option>
                    <option value="Men">Men</option>
                    <option value="Unisex">Unisex</option>
                  </select>
                </Field>
                <Field label="Sizing system" htmlFor="sizing">
                  <select
                    id="sizing"
                    value={sizingSystem}
                    onChange={(e) => setSizingSystem(e.target.value as "UK" | "EU")}
                    className="admin-input"
                  >
                    <option value="EU">EU</option>
                    <option value="UK">UK</option>
                  </select>
                </Field>
              </div>
            </div>
          </section>

          <section className="admin-card p-5 sm:p-6">
            <h3 className="mb-4 font-display text-[20px] text-ink">Images</h3>
            <ImageUploader
              images={images}
              onChange={setImages}
              hint="The first image is the cover. Add up to 8 images."
            />
            {fieldErrors.images ? <FieldError>{fieldErrors.images}</FieldError> : null}
          </section>

          <section className="admin-card p-5 sm:p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-display text-[20px] text-ink">Sizes &amp; colours</h3>
              <button
                type="button"
                onClick={addVariant}
                className="inline-flex h-8 items-center gap-1.5 border border-line bg-white px-3 text-[10px] font-medium uppercase tracking-[0.12em] text-ink transition-colors hover:border-ink"
              >
                <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                Add variant
              </button>
            </div>

            <div className="space-y-3">
              {variants.map((variant, index) => (
                <div key={index} className="border border-line bg-cream/40 p-3.5">
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
                    <label className="block">
                      <span className="admin-label">Size</span>
                      <input
                        value={variant.size}
                        onChange={(e) => updateVariant(index, { size: e.target.value })}
                        className="admin-input h-9 text-[13px]"
                        placeholder="38"
                      />
                    </label>
                    <label className="block">
                      <span className="admin-label">Colour</span>
                      <input
                        value={variant.colour}
                        onChange={(e) => updateVariant(index, { colour: e.target.value })}
                        className="admin-input h-9 text-[13px]"
                        placeholder="Nude"
                      />
                    </label>
                    <label className="block">
                      <span className="admin-label">Stock</span>
                      <input
                        type="number"
                        min={0}
                        value={variant.stockQuantity}
                        onChange={(e) => updateVariant(index, { stockQuantity: e.target.value })}
                        className="admin-input h-9 text-[13px]"
                      />
                    </label>
                    <label className="block">
                      <span className="admin-label">Cost</span>
                      <input
                        type="number"
                        min={0}
                        step="0.01"
                        value={variant.costPrice}
                        onChange={(e) => updateVariant(index, { costPrice: e.target.value })}
                        className="admin-input h-9 text-[13px]"
                      />
                    </label>
                    <label className="block">
                      <span className="admin-label">Price</span>
                      <input
                        type="number"
                        min={0}
                        step="0.01"
                        value={variant.sellingPrice}
                        onChange={(e) => updateVariant(index, { sellingPrice: e.target.value })}
                        className="admin-input h-9 text-[13px]"
                        placeholder="0.00"
                      />
                    </label>
                    <label className="block">
                      <span className="admin-label">Sale price</span>
                      <input
                        type="number"
                        min={0}
                        step="0.01"
                        value={variant.salePrice}
                        onChange={(e) => updateVariant(index, { salePrice: e.target.value })}
                        className="admin-input h-9 text-[13px]"
                        placeholder="—"
                      />
                    </label>
                  </div>
                  <div className="mt-2.5 flex items-end justify-between gap-3">
                    <label className="block flex-1">
                      <span className="admin-label">Variant SKU (optional)</span>
                      <input
                        value={variant.sku}
                        onChange={(e) => updateVariant(index, { sku: e.target.value })}
                        className="admin-input h-9 text-[13px]"
                        placeholder="Auto"
                      />
                    </label>
                    <button
                      type="button"
                      onClick={() => removeVariant(index)}
                      disabled={variants.length === 1}
                      className="grid h-9 w-9 shrink-0 place-items-center border border-line bg-white text-ash transition-colors hover:border-danger hover:text-danger disabled:opacity-40"
                      aria-label="Remove variant"
                    >
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            {fieldErrors.variants ? <FieldError>{fieldErrors.variants}</FieldError> : null}
          </section>
        </div>

        {/* Side column */}
        <div className="space-y-5">
          <section className="admin-card p-5">
            <h3 className="mb-4 font-display text-[20px] text-ink">Publishing</h3>
            <div className="space-y-3.5">
              <ToggleRow
                label="Published"
                hint="Visible on the storefront"
                checked={isPublished}
                onChange={setIsPublished}
              />
              <ToggleRow
                label="Featured"
                hint="Show on the home page edit"
                checked={isFeatured}
                onChange={setIsFeatured}
              />
              <ToggleRow
                label="New arrival"
                hint="Highlight as a new style"
                checked={isNewArrival}
                onChange={setIsNewArrival}
              />
            </div>
            <div className="mt-4 border-t border-line pt-4">
              <Field
                label="Low stock threshold"
                htmlFor="threshold"
                error={fieldErrors.lowStockThreshold}
                hint="Alert when stock reaches this level."
              >
                <input
                  id="threshold"
                  type="number"
                  min={0}
                  value={lowStockThreshold}
                  onChange={(e) => setLowStockThreshold(e.target.value)}
                  className="admin-input"
                />
              </Field>
            </div>
          </section>

          <section className="admin-card p-5">
            <div className="flex flex-col gap-2.5">
              <Button type="submit" loading={pending} className="h-11 w-full">
                <Save className="h-4 w-4" aria-hidden="true" />
                {productId ? "Save changes" : "Create product"}
              </Button>
              <Link
                href="/admin/products"
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

function ToggleRow({
  label,
  hint,
  checked,
  onChange,
}: {
  label: string;
  hint?: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <label className="flex items-start justify-between gap-3">
      <span className="min-w-0">
        <span className="block text-[13px] font-medium text-ink">{label}</span>
        {hint ? <span className="mt-0.5 block text-[11.5px] text-ash-light">{hint}</span> : null}
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors ${
          checked ? "bg-gold" : "bg-line-dark"
        }`}
      >
        <span
          className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${
            checked ? "translate-x-[18px]" : "translate-x-[3px]"
          }`}
        />
      </button>
    </label>
  );
}