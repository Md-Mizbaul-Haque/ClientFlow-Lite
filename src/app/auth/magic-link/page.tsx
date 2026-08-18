"use client";
import { ClientFlowIcon, IconContainer } from "@/components/icons";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";

import * as React from "react";
import Link from "next/link";

import { toast } from "sonner";
import { Brand } from "@/components/brand";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function MagicLinkPage() {
  return (
    <Suspense>
      <MagicLinkForm />
    </Suspense>
  );
}

function MagicLinkForm() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  const [email, setEmail] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [sent, setSent] = React.useState(false);
  const [devUrl, setDevUrl] = React.useState<string | null>(null);

  const errorMessages: Record<string, string> = {
    invalid: "That sign-in link is invalid. Request a new one below.",
    expired: "That sign-in link has expired or was already used. Request a new one below.",
    "no-client": "No client account matches that email. Contact your agency.",
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/auth/magic-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not send link");
      setSent(true);
      setDevUrl(data.devUrl ?? null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not send link");
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

      <div className="relative flex w-full max-w-md flex-col">
        <div className="mb-8 flex items-center justify-between">
          <Brand />
        </div>

        <Card className="border-border/60 bg-card/90 shadow-xl backdrop-blur">
          <CardHeader>
            <IconContainer variant="ring" boxSize={44} className="mb-2">
              <ClientFlowIcon name="mail" size={20} className="text-primary" />
            </IconContainer>
            <CardTitle className="text-2xl">Client sign in</CardTitle>
            <CardDescription>
              Enter the email your agency has on file. We&apos;ll email you a secure sign-in link.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && errorMessages[error] && (
              <Alert variant="destructive" className="mb-4">
                <AlertTitle>Link unavailable</AlertTitle>
                <AlertDescription>{errorMessages[error]}</AlertDescription>
              </Alert>
            )}

            {sent ? (
              <div className="flex flex-col items-center gap-3 py-4 text-center">
                <div className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex size-12 items-center justify-center rounded-full">
                  <ClientFlowIcon name="send" size={20} />
                </div>
                <h3 className="font-semibold">Check your inbox</h3>
                <p className="text-muted-foreground text-sm">
                  We sent a sign-in link to <span className="font-medium text-foreground">{email}</span>.
                  It expires in 10 minutes.
                </p>
                {devUrl && (
                  <div className="mt-2 w-full space-y-2">
                    <div className="bg-muted rounded-lg p-3 text-left">
                      <p className="text-muted-foreground mb-1 flex items-center gap-1.5 text-xs font-medium">
                        <ClientFlowIcon name="alert" size={14} /> Development mode
                      </p>
                      <p className="text-muted-foreground text-xs">
                        No SMTP is configured, so here&apos;s your one-time sign-in link:
                      </p>
                    </div>
                    <Button asChild variant="outline" className="w-full">
                      <a href={devUrl}>
                        <ClientFlowIcon name="link" size={16} />
                        Open sign-in link
                      </a>
                    </Button>
                  </div>
                )}
                <button
                  className="text-primary hover:underline text-sm"
                  onClick={() => {
                    setSent(false);
                    setDevUrl(null);
                  }}
                >
                  Use a different email
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <ClientFlowIcon name="mail" size={16} className="text-muted-foreground absolute top-1/2 left-3 -translate-y-1/2" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@company.com"
                      className="pl-9"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      autoComplete="email"
                    />
                  </div>
                </div>
                <Button type="submit" className="mt-1 w-full" disabled={loading}>
                  {loading ? <ClientFlowIcon name="loader" size={16} className="animate-spin" /> : <ClientFlowIcon name="send" size={16} />}
                  Send sign-in link
                </Button>
              </form>
            )}
          </CardContent>
        </Card>

        <Button variant="link" asChild className="mt-4 w-fit self-center">
          <Link href="/login">
            <ClientFlowIcon name="arrow-left" size={16} />
            Agency? Sign in with a password
          </Link>
        </Button>
      </div>
    </div>
  );
}
