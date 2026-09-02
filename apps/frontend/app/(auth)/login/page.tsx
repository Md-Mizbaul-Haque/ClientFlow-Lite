"use client";

import Link from "next/link";
import * as React from "react";

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
          <div className="flex items-center gap-2 rounded-lg border border-border bg-bg-input px-4 h-[56px] focus-within:border-primary focus-within:ring-1 focus-within:ring-primary">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Input your password"
              className="flex-1 bg-transparent text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="text-neutral-500 hover:text-neutral-700 p-1"
              aria-label="Toggle password"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="opacity-60">
                <path d="M10 4.5C3.5 4.5 1 10 1 10C1 10 3.5 15.5 10 15.5C16.5 15.5 19 10 19 10C19 10 16.5 4.5 10 4.5Z" stroke="currentColor" strokeWidth="1.5" />
                <circle cx="10" cy="10" r="3" stroke="currentColor" strokeWidth="1.5" />
              </svg>
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
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M21.5 12.2C21.5 11.4 21.4 10.6 21.2 9.9H12V14.4H17.3C17.1 15.5 16.4 16.4 15.4 17L15.4 17V19.9H18.6C20.4 18.2 21.5 15.4 21.5 12.2Z" fill="#4285F4" />
              <path d="M12 21.5C14.7 21.5 16.9 20.6 18.6 19.9L15.4 17C14.5 17.6 13.3 18 12 18C9.4 18 7.2 16.3 6.4 14H3V16.9C4.7 20.2 8.1 21.5 12 21.5Z" fill="#34A853" />
              <path d="M6.4 14C6.2 13.4 6.1 12.7 6.1 12C6.1 11.3 6.2 10.6 6.4 10V7.1H3C2.4 8.3 2 9.6 2 12C2 14.4 2.4 15.7 3 16.9L6.4 14Z" fill="#FBBC05" />
              <path d="M12 6C13.4 6 14.7 6.5 15.7 7.4L18.5 4.6C16.9 3.1 14.7 2 12 2C8.1 2 4.7 3.3 3 6.6L6.4 9.5C7.2 7.2 9.4 6 12 6Z" fill="#EA4335" />
            </svg>
            Google
          </Button>
          <Button type="button" variant="social" size="social">
            <svg width="20" height="22" viewBox="0 0 20 22" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path d="M10 0.5C10 0.5 12.5 0.5 14 1.5C15.5 2.5 16 4.5 16 6C16 7.5 15 9 13.5 10C15 10 17 8.5 17 5.5C17 5.5 16 2.5 13 1.5C12 1 10 0.5 10 0.5Z" />
              <path d="M3 8C3 8 3 13 6 16C7 17 8.5 18 10 18C11.5 18 13 17 14 16C17 13 17 8 17 8H3Z" />
            </svg>
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
