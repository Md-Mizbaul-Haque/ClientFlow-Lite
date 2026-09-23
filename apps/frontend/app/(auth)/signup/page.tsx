"use client";

import { AccountInfoSchema } from "@repo/types";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import * as React from "react";

import { AppleIcon, GoogleIcon } from "@/components/brand-icons";
import { Button } from "@/components/ui/button";
import { Divider } from "@/components/ui/divider";
import { Input } from "@/components/ui/input";
import { register } from "@/lib/api";
import { saveSession } from "@/lib/session";
import { toFieldErrors, type FieldErrors } from "@/lib/validation";

export default function SignupPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = React.useState(false);
  const [agencyName, setAgencyName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [sending, setSending] = React.useState(false);
  const [formError, setFormError] = React.useState<string | null>(null);
  const [errors, setErrors] = React.useState<FieldErrors>({});

  function clearError(key: string) {
    setErrors((prev) => (prev[key] === undefined ? prev : { ...prev, [key]: undefined }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (sending) return;
    const parsed = AccountInfoSchema.safeParse({ agencyName, email, password });
    if (!parsed.success) {
      setErrors(toFieldErrors(parsed.error));
      return;
    }
    setErrors({});
    setSending(true);
    setFormError(null);
    try {
      const res = await register(parsed.data);
      // Keep a new account signed in across browser restarts — it has no
      // "remember me" control to ask with.
      saveSession(res.accessToken, true);
      // Agency profile (website, type, size, logo) is collected in onboarding.
      router.replace("/onboarding");
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-[28px] font-bold leading-tight text-neutral-900">
          Create your account
        </h1>
        <p className="text-sm text-neutral-500">
          Start your 14-day free trial. No card required.
        </p>
      </div>

      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        {formError ? (
          <p role="alert" className="rounded-md border border-error bg-[#FDECEC] px-4 py-3 text-sm text-error">
            {formError}
          </p>
        ) : null}
        <Input label="Agency Name" requiredMark placeholder="e.g. DesignGuru Studio" value={agencyName} error={errors.agencyName} onChange={(e) => { setAgencyName(e.target.value); clearError("agencyName"); }} />
        <Input label="Work Email" requiredMark placeholder="you@agency.com" type="email" value={email} error={errors.email} onChange={(e) => { setEmail(e.target.value); clearError("email"); }} />
        <div className="flex flex-col gap-2.5">
          <div className="flex items-center gap-0.5">
            <label className="text-sm font-medium text-neutral-900">Password</label>
            <span className="text-error text-sm">*</span>
          </div>
          <div className={`flex items-center gap-2.5 rounded-md border bg-white px-5 h-11 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary ${errors.password ? "border-error" : "border-border"}`}>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Create a strong password"
              value={password}
              aria-invalid={errors.password !== undefined}
              onChange={(e) => { setPassword(e.target.value); clearError("password"); }}
              className="flex-1 bg-transparent text-sm text-neutral-900 placeholder:text-neutral-500 focus:outline-none"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="text-neutral-500 hover:text-neutral-700 p-1"
              aria-label={showPassword ? "Hide password" : "Show password"}
              aria-pressed={showPassword}
            >
              {showPassword ? (
                <EyeOff size={20} aria-hidden="true" className="opacity-60" />
              ) : (
                <Eye size={20} aria-hidden="true" className="opacity-60" />
              )}
            </button>
          </div>
          <p className={`text-xs ${errors.password ? "text-error" : "text-neutral-500"}`}>
            {errors.password ?? "Must be at least 8 characters, including a number."}
          </p>
        </div>

        <Button type="submit" variant="primary" disabled={sending}>
          {sending ? "Creating account…" : "Create Account"}
        </Button>

        <Divider text="Or sign up with" />

        <div className="flex gap-4">
          <Button type="button" variant="social" size="social">
            <GoogleIcon />
            Google
          </Button>
          <Button type="button" variant="social" size="social">
            <AppleIcon />
            Apple
          </Button>
        </div>

        <p className="text-center text-xs text-neutral-500">
          By signing up you agree to our Terms and Conditions and Privacy Policy.
        </p>
      </form>

      <p className="text-center text-sm text-neutral-600">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-primary hover:text-primary-hover">
          Log in
        </Link>
      </p>
    </div>
  );
}
