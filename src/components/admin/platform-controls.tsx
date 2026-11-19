"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { PauseCircle, PlayCircle } from "lucide-react";
import { setSiteStatusAction } from "@/actions/platform";
import { Button } from "@/components/ui/button";
import { Field, Hint } from "@/components/ui/field";

export function PlatformControls({
  paused,
  pausedAt,
  pausedReason,
}: {
  paused: boolean;
  pausedAt: string | null;
  pausedReason: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [reason, setReason] = useState(pausedReason);
  const [confirming, setConfirming] = useState(false);

  function update(nextPaused: boolean) {
    startTransition(async () => {
      const result = await setSiteStatusAction({ paused: nextPaused, reason });
      if (result.ok) {
        toast.success(result.message ?? "Site status updated.");
        setConfirming(false);
        router.refresh();
      } else {
        toast.error(result.error ?? "Could not update the site status.");
      }
    });
  }

  if (paused) {
    return (
      <div className="space-y-4">
        <div className="border border-danger/20 bg-danger/5 px-4 py-3 text-[12.5px] leading-relaxed text-danger">
          This site is currently paused. Visitors see the hosting-renewal notice.
          {pausedAt ? (
            <span className="mt-1 block text-[11.5px] text-danger/70">
              Paused {new Date(pausedAt).toLocaleString("en-GB")}
            </span>
          ) : null}
        </div>

        <Field label="Public notice message" htmlFor="paused-reason">
          <textarea
            id="paused-reason"
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            rows={3}
            maxLength={500}
            className="admin-input resize-none"
            placeholder="Shown to visitors while the site is paused."
          />
        </Field>

        <Button variant="primary" loading={pending} onClick={() => update(true)} className="h-11">
          Update notice
        </Button>

        <div className="border-t border-line pt-4">
          <Button
            variant="whatsapp"
            loading={pending}
            onClick={() => update(false)}
            className="h-11 w-full"
          >
            <PlayCircle className="h-4 w-4" aria-hidden="true" />
            Resume website
          </Button>
          <Hint>Resuming makes the storefront live to the public again immediately.</Hint>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="border border-success/20 bg-success/5 px-4 py-3 text-[12.5px] leading-relaxed text-success">
        This site is live and serving customers.
      </div>

      <Field
        label="Notice message (used when pausing)"
        htmlFor="pause-reason"
        hint="Shown to visitors if you pause the site. Leave blank to use the default message."
      >
        <textarea
          id="pause-reason"
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          rows={3}
          maxLength={500}
          className="admin-input resize-none"
          placeholder="e.g. Hosting subscription unpaid — please contact the developer to renew."
        />
      </Field>

      {!confirming ? (
        <Button variant="danger" onClick={() => setConfirming(true)} className="h-11 w-full">
          <PauseCircle className="h-4 w-4" aria-hidden="true" />
          Pause website
        </Button>
      ) : (
        <div className="border border-danger/25 bg-danger/5 p-4">
          <p className="text-[12.5px] font-medium text-danger">
            Pause the website? Customers will no longer be able to browse or order until you resume
            it. Only super admins will be able to sign in.
          </p>
          <div className="mt-3 flex gap-2.5">
            <Button
              variant="danger"
              loading={pending}
              onClick={() => update(true)}
              className="h-10"
            >
              Yes, pause now
            </Button>
            <Button
              variant="outline"
              onClick={() => setConfirming(false)}
              className="h-10"
              disabled={pending}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}