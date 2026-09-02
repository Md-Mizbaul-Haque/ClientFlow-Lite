"use client";

import Link from "next/link";
import * as React from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const steps = [
  { id: 1, title: "Workspace", desc: "Agency name & subdomain" },
  { id: 2, title: "Branding", desc: "Logo & colors" },
  { id: 3, title: "Services", desc: "First service" },
];

export default function OnboardingPage() {
  const [current, setCurrent] = React.useState(1);
  const [brandColor, setBrandColor] = React.useState("#005EB8");

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="mx-auto max-w-[900px] px-6 py-10">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-neutral-900">Welcome to ClientFlow</h1>
          <p className="mt-2 text-sm text-neutral-500">Set up your workspace in 3 quick steps — Figma 720 layout, now as wizard.</p>
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
                    {isCompleted ? "✓" : s.id}
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
        <div className="rounded-xl border border-border bg-white p-6 sm:p-8 shadow-sm">
          {current === 1 && (
            <div className="flex flex-col gap-6">
              <h2 className="text-lg font-semibold text-neutral-900">Workspace details</h2>
              <Input label="Agency Name" requiredMark placeholder="e.g. DesignGuru Studio" />
              <div className="flex flex-col gap-[6px]">
                <div className="flex items-center gap-1">
                  <label className="text-sm font-medium text-neutral-700">Subdomain</label>
                  <span className="text-error text-sm">*</span>
                </div>
                <div className="flex items-center gap-2 rounded-lg border border-border bg-bg-input px-4 h-[56px] focus-within:border-primary focus-within:ring-1 focus-within:ring-primary">
                  <input placeholder="your-agency" className="flex-1 bg-transparent text-sm placeholder:text-neutral-400 focus:outline-none" />
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
              <h2 className="text-lg font-semibold text-neutral-900">Branding</h2>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-neutral-700">Logo</label>
                <div className="flex items-center gap-4 rounded-lg border border-dashed border-border bg-neutral-50 p-4">
                  <div className="h-12 w-12 rounded bg-white border border-border flex items-center justify-center text-xs text-neutral-400">Logo</div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Upload logo</p>
                    <p className="text-xs text-neutral-500">PNG, SVG up to 2MB — will appear in your portal header.</p>
                  </div>
                  <Button variant="secondary">Browse</Button>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-neutral-700">Brand Color</label>
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
                <Button variant="secondary" onClick={() => setCurrent(1)}>
                  Back
                </Button>
                <Button onClick={() => setCurrent(3)}>Continue</Button>
              </div>
            </div>
          )}

          {current === 3 && (
            <div className="flex flex-col gap-6">
              <h2 className="text-lg font-semibold text-neutral-900">Create your first service</h2>
              <Input label="Service Name" requiredMark placeholder='e.g. "Logo Design"' />
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-neutral-700">Pricing Model</label>
                <select className="h-[56px] rounded-lg border border-border bg-bg-input px-4 text-sm focus:border-primary focus:outline-none">
                  <option>One-time — $500 per request</option>
                  <option>Hourly pack — 10h @ $500</option>
                  <option>Recurring — $99/mo</option>
                  <option>Credit pack — 5 requests / month</option>
                </select>
              </div>
              <Input label="Description" placeholder="What does this service include?" />
              <div className="flex justify-between pt-2">
                <Button variant="secondary" onClick={() => setCurrent(2)}>
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
          Step {current} of 3 — UI only, no backend yet. On finish, data would POST to{" "}
          <code className="rounded bg-white px-1 py-0.5 border">/api/agencies/onboard</code>
        </p>
      </div>
    </div>
  );
}
