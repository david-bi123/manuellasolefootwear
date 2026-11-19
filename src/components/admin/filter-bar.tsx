"use client";

import { useRef } from "react";
import { Search, SlidersHorizontal } from "lucide-react";

type FieldOption = { value: string; label: string };

type FieldDef =
  | {
      name: string;
      label?: string;
      type: "search";
      placeholder?: string;
      defaultValue?: string;
    }
  | {
      name: string;
      label: string;
      type: "select";
      defaultValue?: string;
      options: FieldOption[];
    }
  | {
      name: string;
      label: string;
      type: "date";
      defaultValue?: string;
    };

/**
 * Filter bar that submits a GET form to `action`, preserving any hidden inputs.
 * Works without client-side state so it stays fast and accessible.
 */
export function AdminFilterBar({
  action,
  fields,
  hidden,
}: {
  action: string;
  fields: FieldDef[];
  hidden?: Record<string, string | undefined>;
}) {
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form ref={formRef} action={action} method="get" className="flex flex-wrap items-end gap-3">
      {hidden
        ? Object.entries(hidden).map(([key, value]) =>
            value ? <input key={key} type="hidden" name={key} value={value} /> : null,
          )
        : null}

      {fields.map((field) => {
        const key = `${field.name}-${field.label ?? ""}`;

        if (field.type === "search") {
          return (
            <div key={key} className="min-w-[200px] flex-1">
              <div className="relative">
                <Search
                  className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ash-light"
                  aria-hidden="true"
                />
                <input
                  type="search"
                  name={field.name}
                  defaultValue={field.defaultValue ?? ""}
                  placeholder={field.placeholder ?? "Search"}
                  className="admin-input h-10 pl-9 text-[13px]"
                />
              </div>
            </div>
          );
        }

        if (field.type === "select") {
          return (
            <label key={key} className="block">
              <span className="mb-1.5 block text-[9.5px] font-semibold uppercase tracking-[0.12em] text-ash-light">
                {field.label}
              </span>
              <select
                name={field.name}
                defaultValue={field.defaultValue ?? ""}
                className="admin-input h-10 min-w-[140px] text-[13px]"
              >
                {field.options.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          );
        }

        return (
          <label key={key} className="block">
            <span className="mb-1.5 block text-[9.5px] font-semibold uppercase tracking-[0.12em] text-ash-light">
              {field.label}
            </span>
            <input
              type="date"
              name={field.name}
              defaultValue={field.defaultValue ?? ""}
              className="admin-input h-10 text-[13px]"
            />
          </label>
        );
      })}

      <div className="flex items-center gap-2">
        <button
          type="submit"
          className="inline-flex h-10 items-center gap-2 bg-ink px-4 text-[10px] font-medium uppercase tracking-[0.14em] text-ivory transition-colors hover:bg-gold-deep"
        >
          <SlidersHorizontal className="h-3.5 w-3.5" aria-hidden="true" />
          Apply
        </button>
        <a
          href={action}
          className="inline-flex h-10 items-center border border-line bg-white px-4 text-[10px] font-medium uppercase tracking-[0.14em] text-ash transition-colors hover:border-ink hover:text-ink"
        >
          Reset
        </a>
      </div>
    </form>
  );
}