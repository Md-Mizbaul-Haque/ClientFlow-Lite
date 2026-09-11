"use client";

import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import * as React from "react";

import { AppleIcon, GoogleIcon } from "@/components/brand-icons";
import { Button } from "@/components/ui/button";
import { Divider } from "@/components/ui/divider";
import { Input } from "@/components/ui/input";

export default function SignupPage() {
  const [showPassword, setShowPassword] = React.useState(false);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-[28px] font-bold leading-tight text-neutral-900">Create your account</h1>
        <p className="text-sm text-neutral-500">Start your 14-day free trial — no card required.</p>
      </div>

      <form
        className="flex flex-col gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          alert("UI only: signup would validate with zod and POST to /api/auth/register");
        }}
      >
        <Input label="Agency Name" requiredMark placeholder="e.g. DesignGuru Studio" />
        <Input label="Work Email" requiredMark placeholder="you@agency.com" type="email" />
        <div className="flex flex-col gap-[6px]">
          <div className="flex items-center gap-1">
            <label className="text-sm font-medium text-neutral-700">Password</label>
            <span className="text-error text-sm">*</span>
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-border bg-bg-input px-4 h-[56px] focus-within:border-primary focus-within:ring-1 focus-within:ring-primary">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Create a strong password"
              className="flex-1 bg-transparent text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none"
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
          <p className="text-xs text-neutral-500">Must be at least 8 characters, including a number.</p>
        </div>

        <p className="text-xs text-neutral-500">
          By creating an account, you agree to our{" "}
          <Link href="#" className="underline hover:text-neutral-700">
            Terms
          </Link>{" "}
          and{" "}
          <Link href="#" className="underline hover:text-neutral-700">
            Privacy Policy
          </Link>
          .
        </p>

        <Button type="submit" variant="primary">
          Create Account
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
