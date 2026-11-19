"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Archive, Eye, EyeOff, Pencil, Star, Trash2 } from "lucide-react";
import { deleteProductAction, setProductFlagsAction } from "@/actions/products";

type Props = {
  product: {
    id: string;
    name: string;
    isPublished: boolean;
    isArchived: boolean;
    isFeatured: boolean;
    isNewArrival: boolean;
  };
};

export function ProductRowActions({ product }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [confirming, setConfirming] = useState(false);

  function setFlags(flags: Parameters<typeof setProductFlagsAction>[1]) {
    startTransition(async () => {
      const result = await setProductFlagsAction(product.id, flags);
      if (result.ok) {
        toast.success(result.message ?? "Product updated.");
        router.refresh();
      } else {
        toast.error(result.error ?? "Could not update the product.");
      }
    });
  }

  function remove() {
    startTransition(async () => {
      const result = await deleteProductAction(product.id);
      if (result.ok) {
        toast.success(result.message ?? "Product deleted.");
        setConfirming(false);
        router.refresh();
      } else {
        toast.error(result.error ?? "Could not delete the product.");
        setConfirming(false);
      }
    });
  }

  const iconBtn =
    "grid h-8 w-8 place-items-center border border-line bg-white text-ash transition-colors hover:border-ink hover:text-ink disabled:opacity-40";

  return (
    <div className="flex items-center justify-end gap-1.5">
      <Link
        href={`/admin/products/${product.id}/edit`}
        className={iconBtn}
        aria-label={`Edit ${product.name}`}
        title="Edit"
      >
        <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
      </Link>

      <button
        type="button"
        onClick={() => setFlags({ isPublished: !product.isPublished })}
        disabled={pending}
        className={iconBtn}
        aria-label={product.isPublished ? "Unpublish" : "Publish"}
        title={product.isPublished ? "Move to draft" : "Publish"}
      >
        {product.isPublished ? (
          <EyeOff className="h-3.5 w-3.5" aria-hidden="true" />
        ) : (
          <Eye className="h-3.5 w-3.5" aria-hidden="true" />
        )}
      </button>

      <button
        type="button"
        onClick={() => setFlags({ isFeatured: !product.isFeatured })}
        disabled={pending}
        className={iconBtn}
        aria-label={product.isFeatured ? "Remove from featured" : "Mark as featured"}
        title={product.isFeatured ? "Unfeature" : "Feature"}
      >
        <Star
          className={product.isFeatured ? "h-3.5 w-3.5 text-gold" : "h-3.5 w-3.5"}
          aria-hidden="true"
        />
      </button>

      <button
        type="button"
        onClick={() => setFlags({ isArchived: !product.isArchived })}
        disabled={pending}
        className={iconBtn}
        aria-label={product.isArchived ? "Restore" : "Archive"}
        title={product.isArchived ? "Restore" : "Archive"}
      >
        <Archive className="h-3.5 w-3.5" aria-hidden="true" />
      </button>

      {confirming ? (
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={remove}
            disabled={pending}
            className="grid h-8 place-items-center bg-danger px-2.5 text-[10px] font-medium uppercase tracking-[0.1em] text-white transition-colors hover:bg-danger/90 disabled:opacity-50"
          >
            Delete
          </button>
          <button
            type="button"
            onClick={() => setConfirming(false)}
            disabled={pending}
            className="grid h-8 place-items-center border border-line bg-white px-2.5 text-[10px] font-medium uppercase tracking-[0.1em] text-ash transition-colors hover:border-ink hover:text-ink"
          >
            No
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setConfirming(true)}
          disabled={pending}
          className="grid h-8 w-8 place-items-center border border-line bg-white text-ash transition-colors hover:border-danger hover:text-danger disabled:opacity-40"
          aria-label={`Delete ${product.name}`}
          title="Delete"
        >
          <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
      )}
    </div>
  );
}