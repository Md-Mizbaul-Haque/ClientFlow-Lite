"use client";

import { LoginSchema } from "@repo/types";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import * as React from "react";

import { AppleIcon, GoogleIcon } from "@/components/brand-icons";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Divider } from "@/components/ui/divider";
import { Input } from "@/components/ui/input";
import { login } from "@/lib/api";
import { saveSession } from "@/lib/session";
import { toFieldErrors, type FieldErrors } from "@/lib/validation";

export default function LoginPage() {
  const router = useRouter();
  const [remember, setRemember] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [sending, setSending] = React.useState(false);
  const [formError, setFormError] = React.useState<string | null>(null);
  const [errors, setErrors] = React.useState<FieldErrors>({});

  function clearError(key: string) {
    setErrors((prev) => (prev[key] === undefined ? prev : { ...prev, [key]: undefined }));
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (sending) return;
    const parsed = LoginSchema.safeParse({ email, password });
    if (!parsed.success) {
      setErrors(toFieldErrors(parsed.error));
      return;
    }
    setErrors({});
    setSending(true);
    setFormError(null);
    try {
      const res = await login(parsed.data, remember);
      saveSession(res.accessToken, remember);
      // replace, not push: the login form must not be one back-button press away
      // from an authenticated portal.
      router.replace("/dashboard");
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-[28px] font-bold leading-tight text-neutral-900">Login to your account</h1>
        <p className="text-sm text-neutral-500">Welcome back. Please enter your details.</p>
      </div>

      {/* Form */}
      <form className="flex flex-col gap-4" onSubmit={handleLogin}>
        {formError ? (
          <p role="alert" className="rounded-md border border-error bg-[#FDECEC] px-4 py-3 text-sm text-error">
            {formError}
          </p>
        ) : null}
        <Input label="Email" requiredMark placeholder="Input your registered email" type="email" value={email} error={errors.email} onChange={(e) => { setEmail(e.target.value); clearError("email"); }} />
        <div className="flex flex-col gap-2.5">
          <div className="flex items-center gap-0.5">
            <label className="text-sm font-medium text-neutral-900">Password</label>
            <span className="text-error text-sm">*</span>
          </div>
          <div className={`flex items-center gap-2.5 rounded-md border bg-white px-5 h-11 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary ${errors.password ? "border-error" : "border-border"}`}>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Input your password"
              value={password}
              aria-invalid={errors.password !== undefined}
              onChange={(e) => { setPassword(e.target.value); clearError("password"); }}
              className="flex-1 bg-transparent text-sm text-neutral-900 placeholder:text-neutral-500 focus:outline-none autofill:bg-white"
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
          {errors.password ? <p className="text-xs text-error">{errors.password}</p> : null}
        </div>

        <div className="flex items-center justify-between py-1">
          <Checkbox checked={remember} onCheckedChange={setRemember} label="Remember Me" />
          <Link href="#" className="text-sm font-medium text-primary hover:text-primary-hover">
            Forgot Password
          </Link>
        </div>

        <Button type="submit" variant="primary" disabled={sending}>
          {sending ? "Logging in…" : "Login"}
        </Button>

        <Divider text="Or login with" />

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
      </form> 

      <p className="text-center text-sm text-neutral-600">
        You’re new here?{" "}
        <Link href="/signup" className="font-medium text-primary hover:text-primary-hover">
          Create Account
        </Link>
      </p>
    </div>
  );
}
