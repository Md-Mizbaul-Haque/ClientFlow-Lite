"use client";

import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import * as React from "react";

import { AppleIcon, GoogleIcon } from "@/components/brand-icons";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Divider } from "@/components/ui/divider";
import { Input } from "@/components/ui/input";

export default function LoginPage() {
  const [remember, setRemember] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-[28px] font-bold leading-tight text-neutral-900">Login to your account</h1>
        <p className="text-sm text-neutral-500">Welcome back — please enter your details.</p>
      </div>

      {/* Form — UI only, no backend */}
      <form
        className="flex flex-col gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          // UI only — frontend engineer mock
          alert("UI only: form data would be validated with zod and sent to /api/auth/login");
        }}
      >
        <Input label="Organisation Reference" requiredMark placeholder="Organisation reference" />
        <Input label="Email" requiredMark placeholder="Input your registered email" type="email" />
        <div className="flex flex-col gap-[6px]">
          <div className="flex items-center gap-1">
            <label className="text-sm font-medium text-neutral-700">Password</label>
            <span className="text-error text-sm">*</span>
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-border bg-white px-4 h-[56px] focus-within:border-primary focus-within:ring-1 focus-within:ring-primary">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Input your password"
              className="flex-1 bg-transparent text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none autofill:bg-white"
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
        </div>

        <div className="flex items-center justify-between py-1">
          <Checkbox checked={remember} onCheckedChange={setRemember} label="Remember Me" />
          <Link href="#" className="text-sm font-medium text-primary hover:text-primary-hover">
            Forgot Password
          </Link>
        </div>

        <Button type="submit" variant="primary">
          Login
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
        You’re new in here?{" "}
        <Link href="/signup" className="font-medium text-primary hover:text-primary-hover">
          Create Account
        </Link>
      </p>
    </div>
  );
}
