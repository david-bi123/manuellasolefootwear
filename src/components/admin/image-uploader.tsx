"use client";

import { useRef, useState } from "react";
import { ArrowLeft, ArrowRight, ImagePlus, Link2, Loader2, Trash2, UploadCloud, X } from "lucide-react";
import { toast } from "sonner";
import { createSignatureAction } from "@/actions/settings";
import { cn } from "@/lib/utils";

export type UploadedImage = { url: string; publicId?: string; alt?: string };

export function ImageUploader({
  images,
  onChange,
  multiple = true,
  hint,
}: {
  images: UploadedImage[];
  onChange: (images: UploadedImage[]) => void;
  multiple?: boolean;
  hint?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [urlMode, setUrlMode] = useState(false);
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");

  async function upload(files: FileList | null) {
    if (!files?.length) return;
    setBusy(true);
    setError("");

    for (const file of Array.from(files)) {
      if (!file.type.startsWith("image/")) {
        setError("Only image files can be uploaded.");
        continue;
      }
      if (file.size > 8 * 1024 * 1024) {
        setError("Images must be 8 MB or smaller.");
        continue;
      }

      const signature = await createSignatureAction();
      if (!signature.ok || !signature.data) {
        setUrlMode(true);
        setError(signature.error ?? "Image hosting is not configured. Add the image URL instead.");
        break;
      }

      const { timestamp, signature: sign, apiKey, cloudName, folder } = signature.data;
      const formData = new FormData();
      formData.append("file", file);
      formData.append("api_key", apiKey);
      formData.append("timestamp", String(timestamp));
      formData.append("signature", sign);
      formData.append("folder", folder);

      try {
        const response = await fetch(
          `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`,
          { method: "POST", body: formData },
        );
        if (!response.ok) throw new Error("Upload failed");
        const data = (await response.json()) as { secure_url: string; public_id: string };
        const next = [...images, { url: data.secure_url, publicId: data.public_id, alt: file.name.replace(/\.[^.]+$/, "") }];
        onChange(multiple ? next : [next[next.length - 1]]);
      } catch {
        setError("The image could not be uploaded. Check your Cloudinary settings and try again.");
      }
    }

    setBusy(false);
    if (inputRef.current) inputRef.current.value = "";
  }

  function addUrl() {
    const cleaned = url.trim();
    if (!cleaned) return;
    try {
      const parsed = new URL(cleaned);
      const next = [...images, { url: parsed.toString(), alt: "" }];
      onChange(multiple ? next : [next[next.length - 1]]);
      setUrl("");
      setError("");
    } catch {
      setError("Enter a valid image URL.");
    }
  }

  function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= images.length) return;
    const next = [...images];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  }

  return (
    <div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {images.map((image, index) => (
          <figure key={`${image.url}-${index}`} className="group relative aspect-[4/5] overflow-hidden border border-line bg-cream">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={image.url} alt={image.alt || "Product image"} className="h-full w-full object-cover" />
            <div className="absolute inset-x-0 top-0 flex items-start justify-between bg-gradient-to-b from-ink/50 to-transparent p-2 opacity-0 transition-opacity group-hover:opacity-100">
              <span className="text-[9px] font-semibold uppercase tracking-[0.12em] text-ivory">
                {index + 1}
              </span>
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => move(index, -1)}
                  disabled={index === 0}
                  className="grid h-6 w-6 place-items-center rounded bg-ivory/90 text-ink transition-colors hover:bg-ivory disabled:opacity-40"
                  aria-label="Move image earlier"
                >
                  <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.8} aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => move(index, 1)}
                  disabled={index === images.length - 1}
                  className="grid h-6 w-6 place-items-center rounded bg-ivory/90 text-ink transition-colors hover:bg-ivory disabled:opacity-40"
                  aria-label="Move image later"
                >
                  <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.8} aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => onChange(images.filter((_, item) => item !== index))}
                  className="grid h-6 w-6 place-items-center bg-danger text-white"
                  aria-label="Remove image"
                >
                  <Trash2 className="h-3 w-3" aria-hidden="true" />
                </button>
              </div>
            </div>
            {index === 0 ? (
              <span className="absolute bottom-2 left-2 rounded bg-ink/90 px-2 py-1 text-[8.5px] font-semibold uppercase tracking-[0.14em] text-champagne backdrop-blur">
                Cover
              </span>
            ) : null}
          </figure>
        ))}

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={busy || (!multiple && images.length > 0)}
          className="flex aspect-[4/5] flex-col items-center justify-center gap-2 border border-dashed border-line-dark bg-white text-ash transition-colors hover:border-gold hover:text-gold-deep disabled:cursor-not-allowed disabled:opacity-50"
        >
          {busy ? (
            <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
          ) : (
            <ImagePlus className="h-5 w-5" strokeWidth={1.5} aria-hidden="true" />
          )}
          <span className="text-[9.5px] font-semibold uppercase tracking-[0.12em]">
            {busy ? "Uploading" : "Add image"}
          </span>
        </button>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple={multiple}
        className="hidden"
        onChange={(event) => upload(event.target.files)}
      />

      {error ? (
        <p className="mt-2.5 flex items-start gap-1.5 text-[11.5px] leading-relaxed text-danger" role="alert">
          <X className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          {error}
        </p>
      ) : null}

      {urlMode ? (
        <div className="mt-3 border border-line bg-cream/60 p-3">
          <p className="mb-2 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-ash">
            <Link2 className="h-3 w-3" aria-hidden="true" />
            Add by URL
          </p>
          <div className="flex gap-2">
            <input
              type="url"
              value={url}
              onChange={(event) => setUrl(event.target.value)}
              placeholder="https://…/image.jpg"
              className="admin-input h-9 text-[12.5px]"
            />
            <button
              type="button"
              onClick={addUrl}
              className="h-9 shrink-0 bg-ink px-3.5 text-[10px] font-medium uppercase tracking-[0.12em] text-ivory transition-colors hover:bg-gold-deep"
            >
              Add
            </button>
          </div>
        </div>
      ) : null}

      {hint ? <p className="mt-2.5 text-[11.5px] leading-relaxed text-ash-light">{hint}</p> : null}
      {images.length && !multiple ? (
        <p className="mt-2.5 text-[11.5px] text-ash-light">Remove the current image before adding another.</p>
      ) : null}
    </div>
  );
}
