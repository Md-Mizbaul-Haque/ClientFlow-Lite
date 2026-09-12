"use client";

import type { ServiceType, TeamSize } from "@repo/types";
import { AccountInfoSchema, RegisterSchema } from "@repo/types";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import * as React from "react";

import { AppleIcon, GoogleIcon } from "@/components/brand-icons";
import { Button } from "@/components/ui/button";
import { Divider } from "@/components/ui/divider";
import { Input } from "@/components/ui/input";
import { register, saveSession } from "@/lib/api";
import { toFieldErrors, type FieldErrors } from "@/lib/validation";

const Step1Schema = AccountInfoSchema;

const SERVICE_OPTIONS = [
  "Graphic Design Agency",
  "Webflow Agency",
  "Video Editing and Production Agency",
  "3D Rendering and Interior Design Agency",
  "Other (specify)",
];

const TEAM_SIZES = ["1-5", "6-20", "21-50", "50+"];

export default function SignupPage() {
  const router = useRouter();
  const [step, setStep] = React.useState<1 | 2>(1);
  const [showPassword, setShowPassword] = React.useState(false);
  const [agencyName, setAgencyName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [website, setWebsite] = React.useState("");
  const [service, setService] = React.useState("");
  const [serviceDetail, setServiceDetail] = React.useState("");
  const [teamSize, setTeamSize] = React.useState("");
  const [sending, setSending] = React.useState(false);
  const [formError, setFormError] = React.useState<string | null>(null);
  const [errors, setErrors] = React.useState<FieldErrors>({});

  function clearError(key: string) {
    setErrors((prev) => (prev[key] === undefined ? prev : { ...prev, [key]: undefined }));
  }

  function handleStep1(e: React.FormEvent) {
    e.preventDefault();
    const parsed = Step1Schema.safeParse({ agencyName, email, password });
    if (!parsed.success) {
      setErrors(toFieldErrors(parsed.error));
      return;
    }
    setErrors({});
    setFormError(null);
    setStep(2);
  }

  async function handleContinue(e: React.FormEvent) {
    e.preventDefault();
    if (sending) return;
    const parsed = RegisterSchema.safeParse({
      agencyName,
      email,
      password,
      website: website === "" ? undefined : website,
      serviceType: (service === "" ? undefined : service) as ServiceType | undefined,
      serviceDetail: serviceDetail === "" ? undefined : serviceDetail,
      teamSize: (teamSize === "" ? undefined : teamSize) as TeamSize | undefined,
    });
    const fieldErrors: FieldErrors = parsed.success ? {} : toFieldErrors(parsed.error);
    if (service === "") fieldErrors.serviceType = "Select your agency type";
    if (teamSize === "") fieldErrors.teamSize = "Select your team size";
    setErrors(fieldErrors);
    if (Object.values(fieldErrors).some(Boolean) || !parsed.success) return;
    setSending(true);
    setFormError(null);
    try {
      const res = await register(parsed.data);
      saveSession(res.token);
      router.push("/dashboard");
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
          {step === 1 ? "Create your account" : "Tell us about your agency"}
        </h1>
        <p className="text-sm text-neutral-500">
          {step === 1 ? "Start your 14-day free trial — no card required." : "We're almost there."}
        </p>
      </div>

      {step === 1 ? (
        <form className="flex flex-col gap-4" onSubmit={handleStep1}>
          <Input label="Agency Name" requiredMark placeholder="e.g. DesignGuru Studio" value={agencyName} error={errors.agencyName} onChange={(e) => { setAgencyName(e.target.value); clearError("agencyName"); }} />
          <Input label="Work Email" requiredMark placeholder="you@agency.com" type="email" value={email} error={errors.email} onChange={(e) => { setEmail(e.target.value); clearError("email"); }} />
          <div className="flex flex-col gap-[6px]">
            <div className="flex items-center gap-1">
              <label className="text-sm font-medium text-neutral-700">Password</label>
              <span className="text-error text-sm">*</span>
            </div>
            <div className={`flex items-center gap-2 rounded-lg border bg-bg-input px-4 h-[56px] focus-within:border-primary focus-within:ring-1 focus-within:ring-primary ${errors.password ? "border-error" : "border-border"}`}>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Create a strong password"
                value={password}
                aria-invalid={errors.password !== undefined}
                onChange={(e) => { setPassword(e.target.value); clearError("password"); }}
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
            <p className={`text-xs ${errors.password ? "text-error" : "text-neutral-500"}`}>
              {errors.password ?? "Must be at least 8 characters, including a number."}
            </p>
          </div>

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
      ) : (
        <form className="flex flex-col gap-4" onSubmit={handleContinue}>
          {formError ? (
            <p role="alert" className="rounded-lg border border-error bg-[#FDECEC] px-4 py-3 text-sm text-error">
              {formError}
            </p>
          ) : null}
          <div className="flex flex-col gap-[6px]">
            <div className="flex items-center gap-1">
              <label className="text-sm font-medium text-neutral-700">Agency Website</label>
            </div>
            <div className={`flex items-center gap-0 rounded-lg border bg-white pl-4 h-[56px] focus-within:border-primary focus-within:ring-1 focus-within:ring-primary overflow-hidden ${errors.website ? "border-error" : "border-border"}`}>
              <span className="shrink-0 text-sm text-neutral-400">http://</span>
              <input
                type="text"
                inputMode="url"
                placeholder="youragency.com"
                aria-label="Agency website domain"
                aria-invalid={errors.website !== undefined}
                value={website}
                onChange={(e) => { setWebsite(e.target.value); clearError("website"); }}
                className="h-full min-w-0 flex-1 bg-transparent px-1 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none"
              />
            </div>
            {errors.website ? <p className="text-xs text-error">{errors.website}</p> : null}
          </div>

          <div className="flex flex-col gap-[6px]">
            <div className="flex items-center gap-1">
              <label className="text-sm font-medium text-neutral-700">What types of services do you offer?!</label>
              <span className="text-error text-sm">*</span>
            </div>
            <select
              value={service}
              aria-invalid={errors.serviceType !== undefined}
              onChange={(e) => { setService(e.target.value); clearError("serviceType"); }}
              className={`h-[56px] rounded-lg border bg-bg-input px-4 text-sm text-neutral-900 focus:border-primary focus:outline-none ${errors.serviceType ? "border-error" : "border-border"}`}
            >
              <option value="">Select your agency type</option>
              {SERVICE_OPTIONS.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
            {errors.serviceType ? <p className="text-xs text-error">{errors.serviceType}</p> : null}
          </div>

          {service === "Other (specify)" ? (
            <Input label="Please specify" placeholder="e.g. SEO Agency" value={serviceDetail} error={errors.serviceDetail} onChange={(e) => { setServiceDetail(e.target.value); clearError("serviceDetail"); }} />
          ) : null}

          <fieldset className="flex flex-col gap-4">
            <legend className="text-sm font-medium text-neutral-700">How many team members work in your agency?</legend>
            {errors.teamSize ? <p className="text-xs text-error">{errors.teamSize}</p> : null}
            <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Team size">
              {TEAM_SIZES.map((o) => {
                const selected = teamSize === o;
                return (
                  <label key={o} className="cursor-pointer">
                    <input
                      type="radio"
                      name="team-size"
                      value={o}
                      checked={selected}
                      onChange={() => { setTeamSize(o); clearError("teamSize"); }}
                      className="sr-only"
                    />
                    <span
                      className={`flex h-[48px] items-center gap-3 rounded-lg border bg-white px-4 transition-colors ${
                        selected ? "border-primary bg-primary-soft/40" : "border-border"
                      }`}
                    >
                      <span
                        aria-hidden="true"
                        className={`h-4 w-4 shrink-0 rounded-full border transition-colors ${
                          selected ? "border-[5px] border-primary" : "border-border-strong"
                        }`}
                      />
                      <span className="text-sm font-medium text-neutral-700">{o}</span>
                    </span>
                  </label>
                );
              })}
            </div>
          </fieldset>

          <div className="flex gap-3">
            <Button type="button" variant="secondary" onClick={() => setStep(1)} disabled={sending}>
              Back
            </Button>
            <div className="flex-1">
              <Button type="submit" variant="primary" disabled={sending}>
                {sending ? "Creating account…" : "Continue"}
              </Button>
            </div>
          </div>

          <p className="text-center text-xs text-neutral-500">
            By signing up you agree to our{" "}
            <Link href="#" className="underline hover:text-neutral-700">
              Terms and Conditions
            </Link>{" "}
            and{" "}
            <Link href="#" className="underline hover:text-neutral-700">
              Privacy Policy
            </Link>
          </p>
        </form>
      )}

      <p className="text-center text-sm text-neutral-600">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-primary hover:text-primary-hover">
          Log in
        </Link>
      </p>
    </div>
  );
}
