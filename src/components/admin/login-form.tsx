"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import { toast } from "sonner";
import { loginAction } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Field, FieldError } from "@/components/ui/field";

export function LoginForm({ next, paused = false }: { next?: string; paused?: boolean }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setFieldErrors({});

    const formData = new FormData();
    formData.set("email", email);
    formData.set("password", password);

    const result = await loginAction(undefined, formData);
    if (result.ok) {
      toast.success("Welcome back.");
      router.replace(next && next.startsWith("/admin") ? next : "/admin/dashboard");
      router.refresh();
      return;
    }

    setLoading(false);
    setError(result.error ?? "Sign-in failed.");
    setFieldErrors(result.fieldErrors ?? {});
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      <div>
        <span className="inline-flex items-center gap-2 rounded-full border border-champagne/40 bg-champagne-pale px-3.5 py-1.5 text-[9.5px] font-semibold uppercase tracking-[0.18em] text-champagne-deep">
          <span className="h-1.5 w-1.5 rounded-full bg-champagne-deep" aria-hidden="true" />
          {paused ? "Super admin access" : "Team access"}
        </span>
        <h1 className="mt-5 font-display text-[38px] leading-tight tracking-[-0.01em] text-ink">
          Sign in<span className="text-champagne-deep">.</span>
        </h1>
        <p className="mt-2 text-[13px] leading-relaxed text-ash">
          {paused
            ? "The site is paused. Only a super admin can sign in until hosting is renewed."
            : "Use the email address your invitation was sent to."}
        </p>
      </div>

      {error ? (
        <div
          role="alert"
          className="rounded-lg border border-danger/25 bg-danger/5 px-4 py-3 text-[12.5px] leading-relaxed text-danger"
        >
          {error}
        </div>
      ) : null}

      <div className="space-y-4">
        <Field label="Email address" htmlFor="email" error={fieldErrors.email} required>
          <div className="relative">
            <Mail
              className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ash-light"
              aria-hidden="true"
            />
            <input
              id="email"
              name="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="admin-input h-11 pl-10"
              placeholder="you@manuellasole.com"
              autoComplete="username"
              required
            />
          </div>
        </Field>

        <Field label="Password" htmlFor="password" error={fieldErrors.password} required>
          <div className="relative">
            <Lock
              className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ash-light"
              aria-hidden="true"
            />
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="admin-input h-11 pl-10 pr-11"
              placeholder="Your password"
              autoComplete="current-password"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              className="absolute right-2.5 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-md text-ash-light transition-colors hover:bg-cream hover:text-ink"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Eye className="h-4 w-4" aria-hidden="true" />
              )}
            </button>
          </div>
        </Field>
      </div>

      <Button type="submit" loading={loading} size="lg" className="btn-sheen w-full">
        {paused ? "Sign in as super admin" : "Sign in to dashboard"}
      </Button>

      <FieldError>{fieldErrors.form}</FieldError>

      <p className="border-t border-line pt-4 text-center text-[10.5px] leading-relaxed text-ash-light">
        {paused
          ? "Only Samtech Labs super admins can sign in while the site is paused."
          : "Access is by invitation only. If you have not received an invitation, contact the owner of the account."}
      </p>
    </form>
  );
}
