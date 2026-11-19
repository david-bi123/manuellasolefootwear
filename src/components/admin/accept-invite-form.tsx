"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, CheckCircle2, Eye, EyeOff, Lock, User } from "lucide-react";
import { toast } from "sonner";
import { acceptInviteAction } from "@/actions/team";
import { Button } from "@/components/ui/button";
import { Field, FieldError } from "@/components/ui/field";
import { ROLE_LABELS } from "@/lib/roles";
import { formatDateTime } from "@/lib/format";

export function AcceptInviteForm({
  token,
  name,
  email,
  role,
  expiresAt,
}: {
  token: string;
  name: string;
  email: string;
  role: "owner" | "admin" | "staff";
  expiresAt: string;
}) {
  const router = useRouter();
  const [fullName, setFullName] = useState(name);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [done, setDone] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setFieldErrors({});

    const result = await acceptInviteAction({ token, name: fullName, password, confirmPassword });
    if (result.ok) {
      setDone(true);
      toast.success("Your account is ready.");
      return;
    }

    setLoading(false);
    setError(result.error ?? "The invitation could not be accepted.");
    setFieldErrors(result.fieldErrors ?? {});
  }

  if (done) {
    return (
      <div className="text-center">
        <span className="mx-auto grid h-12 w-12 place-items-center border border-success/25 bg-success/10 text-success">
          <CheckCircle2 className="h-5 w-5" strokeWidth={1.6} aria-hidden="true" />
        </span>
        <h1 className="mt-5 font-display text-[30px] text-ink">You are in.</h1>
        <p className="mt-2 text-[13px] leading-relaxed text-ash">
          Your account for <span className="font-medium text-ink">{email}</span> is ready. Sign in
          with the password you just created.
        </p>
        <Button
          className="mt-7 h-12 w-full"
          onClick={() => router.push("/admin/login")}
        >
          Continue to sign in
          <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      <div>
        <p className="text-[10px] uppercase tracking-[0.22em] text-gold-deep">Invitation</p>
        <h1 className="mt-3 font-display text-[34px] leading-tight text-ink">Set up your account</h1>
        <p className="mt-2 text-[12.5px] leading-relaxed text-ash">
          You have been invited as{" "}
          <span className="font-medium text-ink">{ROLE_LABELS[role]}</span> for{" "}
          <span className="font-medium text-ink">{email}</span>. This link expires{" "}
          {formatDateTime(expiresAt)}.
        </p>
      </div>

      {error ? (
        <div
          role="alert"
          className="border border-danger/25 bg-danger/5 px-3.5 py-2.5 text-[12px] leading-relaxed text-danger"
        >
          {error}
        </div>
      ) : null}

      <Field label="Full name" htmlFor="name" error={fieldErrors.name} required>
        <div className="relative">
          <User
            className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ash-light"
            aria-hidden="true"
          />
          <input
            id="name"
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
            className="admin-input h-11 pl-9"
            placeholder="Your name"
            autoComplete="name"
            required
          />
        </div>
      </Field>

      <Field label="Password" htmlFor="password" error={fieldErrors.password} required>
        <div className="relative">
          <Lock
            className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ash-light"
            aria-hidden="true"
          />
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="admin-input h-11 px-9"
            placeholder="At least 8 characters"
            autoComplete="new-password"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword((value) => !value)}
            className="absolute right-2.5 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center text-ash-light transition-colors hover:text-ink"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? (
              <EyeOff className="h-3.5 w-3.5" aria-hidden="true" />
            ) : (
              <Eye className="h-3.5 w-3.5" aria-hidden="true" />
            )}
          </button>
        </div>
      </Field>

      <Field
        label="Confirm password"
        htmlFor="confirmPassword"
        error={fieldErrors.confirmPassword}
        required
      >
        <input
          id="confirmPassword"
          type={showPassword ? "text" : "password"}
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          className="admin-input h-11"
          placeholder="Repeat your password"
          autoComplete="new-password"
          required
        />
      </Field>

      <Button type="submit" loading={loading} className="h-12 w-full">
        Create my account
      </Button>

      <FieldError>{fieldErrors.form}</FieldError>

      <p className="border-t border-line pt-4 text-center text-[10.5px] leading-relaxed text-ash-light">
        Already have an account?{" "}
        <Link href="/admin/login" className="text-ink underline underline-offset-4 hover:text-gold-deep">
          Sign in
        </Link>
      </p>
    </form>
  );
}
