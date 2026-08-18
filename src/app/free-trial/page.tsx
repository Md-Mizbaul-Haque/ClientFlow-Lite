"use client";
import { ClientFlowIcon, IconContainer } from "@/components/icons";
import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

import { toast } from "sonner";
import { AuthMarketingPanel } from "@/components/auth-marketing-panel";
import { Brand } from "@/components/brand";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { TRIAL_DAYS } from "@/lib/pricing";

export default function FreeTrialPage() {
  const router = useRouter();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirm, setConfirm] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      if (password !== confirm) {
        throw new Error("Passwords do not match");
      }

      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(data?.error ?? "Could not create your account");
      }

      const signInRes = await signIn("credentials", { email, password, redirect: false });
      if (signInRes?.error) {
        router.push("/login");
        toast.success("Account created â€” sign in to continue");
        return;
      }

      toast.success(`Welcome aboard, ${data?.name ?? "friend"} â€” your trial starts now`);
      router.push("/admin/dashboard");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-svh flex-col items-center justify-center p-4">
      <div className="bg-primary/10 pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 h-96 w-[42rem] -translate-x-1/2 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute -bottom-52 right-0 h-96 w-96 rounded-full bg-accent/20 blur-3xl" />
      </div>

      <div className="relative flex w-full max-w-5xl flex-col gap-12 lg:flex-row lg:items-center">
        <div className="flex w-full max-w-md flex-col">
          <div className="mb-8">
            <Brand />
          </div>

          <Card className="border-border/60 bg-card/90 shadow-xl backdrop-blur">
            <CardHeader>
              <IconContainer variant="ring" boxSize={44} className="mb-2">
                <ClientFlowIcon name="rocket" size={20} className="text-primary" />
              </IconContainer>
              <CardTitle className="text-2xl">Start your {TRIAL_DAYS} days free trial now</CardTitle>
              <CardDescription>
                Create your workspace in under a minute. No credit card required.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="email">Work email</Label>
                  <div className="relative">
                    <ClientFlowIcon name="mail" size={16} className="text-muted-foreground absolute top-1/2 left-3 -translate-y-1/2" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@agency.com"
                      className="pl-9"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      autoComplete="email"
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <ClientFlowIcon name="key" size={16} className="text-muted-foreground absolute top-1/2 left-3 -translate-y-1/2" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="At least 8 characters"
                      className="pl-9"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={8}
                      autoComplete="new-password"
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="confirm">Confirm password</Label>
                  <div className="relative">
                    <ClientFlowIcon name="key" size={16} className="text-muted-foreground absolute top-1/2 left-3 -translate-y-1/2" />
                    <Input
                      id="confirm"
                      type="password"
                      placeholder="Repeat your password"
                      className="pl-9"
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      required
                      minLength={8}
                      autoComplete="new-password"
                    />
                  </div>
                </div>
                <Button type="submit" className="mt-1 w-full" disabled={loading}>
                  {loading ? (
                    <ClientFlowIcon name="loader" size={16} className="animate-spin" />
                  ) : (
                    <ClientFlowIcon name="sparkles" size={16} />
                  )}
                  Start free trial
                </Button>
              </form>

              <ul className="text-muted-foreground mt-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs">
                {["No credit card required", "Cancel anytime", `${TRIAL_DAYS} days full access`].map(
                  (t) => (
                    <li key={t} className="flex items-center gap-1">
                      <ClientFlowIcon name="check-circle" size={14} className="text-primary" />
                      {t}
                    </li>
                  )
                )}
              </ul>

              <div className="my-5 flex items-center gap-3">
                <Separator className="flex-1" />
                <span className="text-muted-foreground text-xs">or</span>
                <Separator className="flex-1" />
              </div>

              <Button variant="outline" asChild className="w-full">
                <Link href="/login">
                  <ClientFlowIcon name="arrow-right" size={16} />
                  Already a customer? Sign in
                </Link>
              </Button>
              <Button variant="ghost" asChild size="sm" className="mt-2 w-full text-xs">
                <Link href="/auth/magic-link">Client? Sign in with a magic link</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        <AuthMarketingPanel variant="signup" />
      </div>
    </div>
  );
}
