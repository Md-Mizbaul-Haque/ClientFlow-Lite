"use client";

import { Check } from "lucide-react";
import Link from "next/link";
import * as React from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ApiError, putLogoFile, requestLogoUpload, updateAgency } from "@/lib/api";
import { type FieldErrors } from "@/lib/validation";

const steps = [
  { id: 1, title: "Workspace", desc: "Agency name & subdomain" },
  { id: 2, title: "Agency profile", desc: "Website, type & size" },
  { id: 3, title: "Branding", desc: "Logo & colors" },
  { id: 4, title: "Services", desc: "First service" },
];

const SERVICE_OPTIONS = [
  "Graphic Design Agency",
  "Webflow Agency",
  "Video Editing and Production Agency",
  "3D Rendering and Interior Design Agency",
  "Other (specify)",
];

const TEAM_SIZES = ["1-5", "6-20", "21-50", "50+"];

const MAX_LOGO_BYTES = 2 * 1024 * 1024;

const SCHEME_PREFIX = /^[a-z][a-z0-9+.-]*:\/\//i;

// The field renders a fixed https:// prefix and accepts a host, so a value pasted
// with a scheme is normalized rather than stored half-qualified.
function stripScheme(value: string): string {
  return value.trim().replace(SCHEME_PREFIX, "");
}

function normalizeWebsite(value: string): string | undefined {
  const host = stripScheme(value);
  return host === "" ? undefined : `https://${host}`;
}

export default function OnboardingPage() {
  const [current, setCurrent] = React.useState(1);
  const [brandColor, setBrandColor] = React.useState("#005EB8");
  const [website, setWebsite] = React.useState("");
  const [service, setService] = React.useState("");
  const [serviceDetail, setServiceDetail] = React.useState("");
  const [teamSize, setTeamSize] = React.useState("");
  const [logoPreview, setLogoPreview] = React.useState<string | null>(null);
  const [saving, setSaving] = React.useState(false);
  const [uploading, setUploading] = React.useState(false);
  const [formError, setFormError] = React.useState<string | null>(null);
  const [errors, setErrors] = React.useState<FieldErrors>({});

  function clearError(key: string) {
    setErrors((prev) => (prev[key] === undefined ? prev : { ...prev, [key]: undefined }));
  }

  async function handleProfileContinue() {
    if (saving) return;
    const fieldErrors: FieldErrors = {};
    if (service === "") fieldErrors.serviceType = "Select your agency type";
    if (service === "Other (specify)" && serviceDetail.trim() === "")
      fieldErrors.serviceDetail = "Describe your agency type";
    if (teamSize === "") fieldErrors.teamSize = "Select your team size";
    setErrors(fieldErrors);
    if (Object.values(fieldErrors).some(Boolean)) return;
    setSaving(true);
    setFormError(null);
    try {
      await updateAgency({
        website: normalizeWebsite(website),
        serviceType: service as "Graphic Design Agency" | "Webflow Agency" | "Video Editing and Production Agency" | "3D Rendering and Interior Design Agency" | "Other (specify)",
        serviceDetail: service === "Other (specify)" ? serviceDetail.trim() : undefined,
        teamSize: teamSize as "1-5" | "6-20" | "21-50" | "50+",
      });
      setCurrent(3);
    } catch (err) {
      if (err instanceof ApiError && err.status === 400) {
        setFormError(err.message);
      } else {
        setFormError(err instanceof Error ? err.message : "Could not save your agency profile");
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleLogoSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || uploading) return;
    if (file.size > MAX_LOGO_BYTES) {
      setFormError("Logo must be 2MB or smaller.");
      return;
    }
    setUploading(true);
    setFormError(null);
    try {
      const ticket = await requestLogoUpload(file.type, file.size);
      await putLogoFile(ticket.uploadUrl, file);
      await updateAgency({ logoKey: ticket.key });
      setLogoPreview(ticket.publicUrl);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Logo upload failed. Try again or skip this step.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="mx-auto max-w-[900px] px-6 py-10">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-neutral-900">Welcome to ClientFlow</h1>
          <p className="mt-2 text-sm text-neutral-500">Set up your workspace in 4 quick steps.</p>
        </div>

        {/* Stepper — Figma Component 7 style (Completed / In progress / Next) */}
        <div className="mb-8 flex items-center justify-center gap-2">
          {steps.map((s, idx) => {
            const isCompleted = s.id < current;
            const isActive = s.id === current;
            return (
              <React.Fragment key={s.id}>
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium ${
                      isCompleted
                        ? "bg-primary text-white"
                        : isActive
                          ? "bg-primary text-white ring-4 ring-primary-soft"
                          : "bg-white border border-border text-neutral-400"
                    }`}
                  >
                    {isCompleted ? <Check size={14} strokeWidth={3} aria-hidden="true" /> : s.id}
                  </div>
                  <div className="hidden sm:block text-left">
                    <p className={`text-sm font-medium ${isActive ? "text-neutral-900" : "text-neutral-500"}`}>{s.title}</p>
                    <p className="text-xs text-neutral-500">{s.desc}</p>
                  </div>
                </div>
                {idx < steps.length - 1 && (
                  <div className={`h-px w-12 sm:w-20 ${isCompleted ? "bg-primary" : "bg-border"}`} />
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Card */}
        <div className="rounded-lg border border-neutral-100 bg-white p-6 sm:p-8">
          {current === 1 && (
            <div className="flex flex-col gap-6">
              <h2 className="text-lg font-semibold text-neutral-900">Workspace details</h2>
              <Input label="Agency Name" requiredMark placeholder="e.g. DesignGuru Studio" />
              <div className="flex flex-col gap-2.5">
                <div className="flex items-center gap-0.5">
                  <label className="text-sm font-medium text-neutral-900">Subdomain</label>
                  <span className="text-error text-sm">*</span>
                </div>
                <div className="flex items-center gap-2.5 rounded-md border border-border bg-white px-5 h-11 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary">
                  <input placeholder="your-agency" className="flex-1 bg-transparent text-sm text-neutral-900 placeholder:text-neutral-500 focus:outline-none" />
                  <span className="text-sm text-neutral-500 whitespace-nowrap">.myclone.com</span>
                </div>
                <p className="text-xs text-neutral-500">You can add a custom domain later (CNAME).</p>
              </div>
              <div className="flex justify-between pt-2">
                <div />
                <Button onClick={() => setCurrent(2)}>Continue</Button>
              </div>
            </div>
          )}

          {current === 2 && (
            <div className="flex flex-col gap-6">
              <h2 className="text-lg font-semibold text-neutral-900">Agency profile</h2>
              {formError ? (
                <p role="alert" className="rounded-md border border-error bg-[#FDECEC] px-4 py-3 text-sm text-error">
                  {formError}
                </p>
              ) : null}
              <div className="flex flex-col gap-2.5">
                <div className="flex items-center gap-0.5">
                  <label className="text-sm font-medium text-neutral-900">Agency Website</label>
                </div>
                <div className={`flex items-center gap-0 rounded-md border bg-white pl-5 h-11 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary overflow-hidden ${errors.website ? "border-error" : "border-border"}`}>
                  <span className="shrink-0 text-sm text-neutral-500">https://</span>
                  <input
                    type="text"
                    inputMode="url"
                    placeholder="youragency.com"
                    aria-label="Agency website domain"
                    value={website}
                    onChange={(e) => { setWebsite(stripScheme(e.target.value)); clearError("website"); }}
                    className="h-full min-w-0 flex-1 bg-transparent px-1 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none"
                  />
                </div>
                {errors.website ? <p className="text-xs text-error">{errors.website}</p> : null}
              </div>

              <div className="flex flex-col gap-2.5">
                <div className="flex items-center gap-0.5">
                  <label className="text-sm font-medium text-neutral-900">What types of services do you offer?</label>
                  <span className="text-error text-sm">*</span>
                </div>
                <select
                  value={service}
                  aria-invalid={errors.serviceType !== undefined}
                  onChange={(e) => { setService(e.target.value); clearError("serviceType"); }}
                  className={`h-11 rounded-md border bg-white px-5 text-sm text-neutral-900 focus:border-primary focus:outline-none ${errors.serviceType ? "border-error" : "border-border"}`}
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
                <legend className="text-sm font-medium text-neutral-900">How many team members work in your agency?</legend>
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
                          className={`flex h-12 items-center gap-3 rounded-md border bg-white px-4 transition-colors ${
                            selected ? "border-primary bg-primary-soft/40" : "border-border"
                          }`}
                        >
                          <span
                            aria-hidden="true"
                            className={`h-4 w-4 shrink-0 rounded-full border transition-colors ${
                              selected ? "border-[5px] border-primary" : "border-neutral-400"
                            }`}
                          />
                          <span className="text-sm font-medium text-neutral-900">{o}</span>
                        </span>
                      </label>
                    );
                  })}
                </div>
              </fieldset>

              <div className="flex justify-between pt-2">
                <Button variant="secondary" onClick={() => setCurrent(1)} disabled={saving}>
                  Back
                </Button>
                <Button onClick={handleProfileContinue} disabled={saving}>
                  {saving ? "Saving…" : "Continue"}
                </Button>
              </div>
            </div>
          )}

          {current === 3 && (
            <div className="flex flex-col gap-6">
              <h2 className="text-lg font-semibold text-neutral-900">Branding</h2>
              {formError ? (
                <p role="alert" className="rounded-md border border-error bg-[#FDECEC] px-4 py-3 text-sm text-error">
                  {formError}
                </p>
              ) : null}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-neutral-900">Logo <span className="font-normal text-neutral-500">(optional)</span></label>
                <div className="flex items-center gap-4 rounded-md border border-dashed border-neutral-300 bg-neutral-50 p-4">
                  {logoPreview ? (
                    <img src={logoPreview} alt="Agency logo preview" className="h-12 w-12 rounded border border-border bg-white object-contain" />
                  ) : (
                    <div className="h-12 w-12 rounded bg-white border border-border flex items-center justify-center text-xs text-neutral-400">Logo</div>
                  )}
                  <div className="flex-1">
                    <p className="text-sm font-medium">Upload logo</p>
                     <p className="text-xs text-neutral-500">PNG, JPEG, or SVG up to 2MB. It appears in your portal header.</p>
                  </div>
                  <label className="cursor-pointer rounded-control border border-border bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50">
                    {uploading ? "Uploading…" : "Browse"}
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/svg+xml"
                      onChange={handleLogoSelect}
                      disabled={uploading}
                      className="sr-only"
                    />
                  </label>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-neutral-900">Brand Color</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={brandColor}
                    onChange={(e) => setBrandColor(e.target.value)}
                    className="h-10 w-10 rounded border border-border p-1"
                  />
                  <span className="text-sm font-mono text-neutral-700">{brandColor}</span>
                  <div className="h-8 flex-1 rounded-lg" style={{ background: brandColor }} />
                </div>
                <p className="text-xs text-neutral-500">Used for primary buttons, links, and portal header.</p>
              </div>
              <div className="flex justify-between pt-2">
                <Button variant="secondary" onClick={() => setCurrent(2)}>
                  Back
                </Button>
                <Button onClick={() => setCurrent(4)} disabled={uploading}>Continue</Button>
              </div>
            </div>
          )}

          {current === 4 && (
            <div className="flex flex-col gap-6">
              <h2 className="text-lg font-semibold text-neutral-900">Create your first service</h2>
              <Input label="Service Name" requiredMark placeholder='e.g. "Logo Design"' />
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-neutral-900">Pricing Model</label>
                <select className="h-11 rounded-md border border-border bg-white px-5 text-sm text-neutral-900 focus:border-primary focus:outline-none">
                  <option>One-time — $500 per request</option>
                  <option>Hourly pack — 10h @ $500</option>
                  <option>Recurring — $99/mo</option>
                  <option>Credit pack — 5 requests / month</option>
                </select>
              </div>
              <Input label="Description" placeholder="What does this service include?" />
              <div className="flex justify-between pt-2">
                <Button variant="secondary" onClick={() => setCurrent(3)}>
                  Back
                </Button>
                <Link href="/dashboard">
                  <Button>Finish & Go to Dashboard</Button>
                </Link>
              </div>
              <p className="text-center text-xs text-neutral-500">
                You can add more services and custom request forms later in Settings → Services.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-xs text-neutral-500">
          Step {current} of 4. Steps 2–3 save to your agency; the rest is UI only. On finish, data would POST to{" "}
          <code className="rounded bg-white px-1 py-0.5 border">/api/agencies/onboard</code>
        </p>
      </div>
    </div>
  );
}
