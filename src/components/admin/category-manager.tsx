"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { FolderTree, Pencil, Plus, Tags, Trash2 } from "lucide-react";
import { deleteCategoryAction, saveCategoryAction } from "@/actions/categories";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Field } from "@/components/ui/field";
import { ImageUploader, type UploadedImage } from "@/components/admin/image-uploader";
import { Pill } from "@/components/admin/primitives";
import { formatNumber } from "@/lib/format";
import type { CategoryInput } from "@/lib/validators";

type CategoryRow = {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  gender: string;
  sortOrder: number;
  isActive: boolean;
  productCount: number;
};

type FormState = {
  id?: string;
  name: string;
  description: string;
  gender: "Men" | "Women" | "Unisex";
  sortOrder: string;
  isActive: boolean;
  image: UploadedImage[];
};

const EMPTY: FormState = {
  name: "",
  description: "",
  gender: "Unisex",
  sortOrder: "0",
  isActive: true,
  image: [],
};

export function CategoryManager({ categories }: { categories: CategoryRow[] }) {
  return (
    <div>
      <div className="flex items-center justify-between gap-3 border-b border-line p-4 sm:px-6">
        <div>
          <h3 className="font-display text-[20px] text-ink">All categories</h3>
          <p className="text-[12px] text-ash">{formatNumber(categories.length)} total</p>
        </div>
        <CategoryDialog categories={categories} />
      </div>

      {categories.length ? (
        <ul className="divide-y divide-line/70">
          {categories.map((category) => (
            <li key={category.id} className="flex items-center gap-4 px-4 py-3.5 sm:px-6">
              <div className="h-12 w-10 shrink-0 overflow-hidden border border-line bg-cream">
                {category.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={category.image} alt={category.name} className="h-full w-full object-cover" />
                ) : (
                  <div className="grid h-full place-items-center">
                    <Tags className="h-4 w-4 text-line-dark" aria-hidden="true" />
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate text-[13.5px] font-medium text-ink">{category.name}</p>
                  {category.isActive ? (
                    <Pill tone="success">Active</Pill>
                  ) : (
                    <Pill tone="neutral">Hidden</Pill>
                  )}
                </div>
                <p className="mt-0.5 text-[11.5px] text-ash-light">
                  /{category.slug} · {category.gender} · {formatNumber(category.productCount)} products
                  · order {category.sortOrder}
                </p>
              </div>
              <CategoryDialog categories={categories} category={category} />
            </li>
          ))}
        </ul>
      ) : (
        <div className="flex flex-col items-center px-6 py-14 text-center">
          <span className="grid h-12 w-12 place-items-center border border-line bg-cream text-gold-deep">
            <FolderTree className="h-5 w-5" strokeWidth={1.5} aria-hidden="true" />
          </span>
          <p className="mt-4 font-display text-[22px] text-ink">No categories yet</p>
          <p className="mt-1.5 max-w-sm text-[12.5px] leading-relaxed text-ash">
            Create a category to start organising the collection.
          </p>
          <div className="mt-5">
            <CategoryDialog categories={categories} />
          </div>
        </div>
      )}
    </div>
  );
}

function CategoryDialog({
  categories,
  category,
}: {
  categories: CategoryRow[];
  category?: CategoryRow;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [form, setForm] = useState<FormState>(
    category
      ? {
          id: category.id,
          name: category.name,
          description: category.description,
          gender: category.gender as FormState["gender"],
          sortOrder: String(category.sortOrder),
          isActive: category.isActive,
          image: category.image ? [{ url: category.image }] : [],
        }
      : EMPTY,
  );

  function openDialog() {
    setForm(
      category
        ? {
            id: category.id,
            name: category.name,
            description: category.description,
            gender: category.gender as FormState["gender"],
            sortOrder: String(category.sortOrder),
            isActive: category.isActive,
            image: category.image ? [{ url: category.image }] : [],
          }
        : { ...EMPTY, image: [] },
    );
    setError("");
    setOpen(true);
  }

  function save() {
    setError("");
    const payload: CategoryInput = {
      id: form.id,
      name: form.name,
      description: form.description,
      gender: form.gender,
      sortOrder: Number(form.sortOrder) || 0,
      isActive: form.isActive,
      image: form.image[0]?.url ?? "",
    };
    startTransition(async () => {
      const result = await saveCategoryAction(payload);
      if (result.ok) {
        toast.success(result.message ?? "Category saved.");
        setOpen(false);
        router.refresh();
      } else {
        setError(result.error ?? "Could not save the category.");
      }
    });
  }

  function remove() {
    if (!category) return;
    startTransition(async () => {
      const result = await deleteCategoryAction(category.id);
      if (result.ok) {
        toast.success(result.message ?? "Category deleted.");
        setOpen(false);
        router.refresh();
      } else {
        setError(result.error ?? "Could not delete the category.");
      }
    });
  }

  const trigger = category ? (
    <button
      type="button"
      onClick={openDialog}
      className="grid h-8 w-8 place-items-center border border-line bg-white text-ash transition-colors hover:border-ink hover:text-ink"
      aria-label={`Edit ${category.name}`}
    >
      <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
    </button>
  ) : (
    <Button onClick={openDialog} className="h-9">
      <Plus className="h-3.5 w-3.5" aria-hidden="true" />
      New category
    </Button>
  );

  return (
    <>
      {category ? (
        trigger
      ) : (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>{trigger}</DialogTrigger>
          <DialogContent
            title={form.id ? "Edit category" : "New category"}
            description="Categories group products in the storefront navigation."
          >
            <CategoryFields form={form} setForm={setForm} error={error} />
            <DialogFooter>
              {category ? (
                <Button
                  variant="danger"
                  onClick={remove}
                  loading={pending}
                  className="mr-auto"
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                  Delete
                </Button>
              ) : null}
              <Button variant="outline" onClick={() => setOpen(false)} disabled={pending}>
                Cancel
              </Button>
              <Button variant="primary" loading={pending} onClick={save}>
                {form.id ? "Save changes" : "Create category"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Edit dialog rendered separately so each row can open its own instance */}
      {category ? (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent title="Edit category" description={`/${category.slug}`}>
            <CategoryFields form={form} setForm={setForm} error={error} />
            <DialogFooter>
              <Button variant="danger" onClick={remove} loading={pending} className="mr-auto">
                <Trash2 className="h-4 w-4" aria-hidden="true" />
                Delete
              </Button>
              <Button variant="outline" onClick={() => setOpen(false)} disabled={pending}>
                Cancel
              </Button>
              <Button variant="primary" loading={pending} onClick={save}>
                Save changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      ) : null}
    </>
  );
}

function CategoryFields({
  form,
  setForm,
  error,
}: {
  form: FormState;
  setForm: (form: FormState) => void;
  error: string;
}) {
  return (
    <div className="space-y-4">
      {error ? (
        <div role="alert" className="border border-danger/25 bg-danger/5 px-3.5 py-2.5 text-[12px] text-danger">
          {error}
        </div>
      ) : null}

      <Field label="Name" htmlFor="cat-name" required>
        <input
          id="cat-name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="admin-input"
          placeholder="e.g. Heels"
        />
      </Field>

      <Field label="Description" htmlFor="cat-desc">
        <textarea
          id="cat-desc"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          rows={2}
          className="admin-input resize-none"
          placeholder="Short description (optional)"
        />
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Gender" htmlFor="cat-gender">
          <select
            id="cat-gender"
            value={form.gender}
            onChange={(e) => setForm({ ...form, gender: e.target.value as FormState["gender"] })}
            className="admin-input"
          >
            <option value="Women">Women</option>
            <option value="Men">Men</option>
            <option value="Unisex">Unisex</option>
          </select>
        </Field>
        <Field label="Sort order" htmlFor="cat-order">
          <input
            id="cat-order"
            type="number"
            min={0}
            value={form.sortOrder}
            onChange={(e) => setForm({ ...form, sortOrder: e.target.value })}
            className="admin-input"
          />
        </Field>
      </div>

      <label className="flex items-center gap-2.5">
        <input
          type="checkbox"
          checked={form.isActive}
          onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
          className="h-4 w-4 accent-[#175340]"
        />
        <span className="text-[13px] text-ink">Visible in storefront navigation</span>
      </label>

      <div>
        <span className="admin-label">Image (optional)</span>
        <ImageUploader images={form.image} onChange={(image) => setForm({ ...form, image })} multiple={false} />
      </div>
    </div>
  );
}