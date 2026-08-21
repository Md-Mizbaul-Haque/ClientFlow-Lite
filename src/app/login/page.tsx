"use client";
import { ClientFlowIcon, IconContainer } from "@/components/icons";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

import * as React from "react";
import Link from "next/link";

import { toast } from "sonner";
import { AuthMarketingPanel } from "@/components/auth-marketing-panel";
import { Brand } from "@/components/brand";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });
      if (res?.error) {
        throw new Error("Invalid email or password");
      }
      toast.success("Welcome back");
      router.push("/admin/dashboard");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Login failed");
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
                <ClientFlowIcon
                  name="shield"
                  size={20}
                  className="text-primary"
                />
              </IconContainer>
              <CardTitle className="text-2xl">Agency sign in</CardTitle>
              <CardDescription>
                Access the admin dashboard to manage proposals, clients, and
                projects.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <ClientFlowIcon
                      name="mail"
                      size={16}
                      className="text-muted-foreground absolute top-1/2 left-3 -translate-y-1/2"
                    />
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
                    <ClientFlowIcon
                      name="key"
                      size={16}
                      className="text-muted-foreground absolute top-1/2 left-3 -translate-y-1/2"
                    />
                    <Input
                      id="password"
                      type="password"
                      placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢"
                      className="pl-9"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      autoComplete="current-password"
                    />
                  </div>
                </div>
                <Button
                  type="submit"
                  className="mt-1 w-full"
                  disabled={loading}
                >
                  {loading ? (
                    <ClientFlowIcon
                      name="loader"
                      size={16}
                      className="animate-spin"
                    />
                  ) : (
                    <ClientFlowIcon name="sparkles" size={16} />
                  )}
                  Sign in
                </Button>
              </form>

              <div className="my-5 flex items-center gap-3">
                <Separator className="flex-1" />
                <span className="text-muted-foreground text-xs">or</span>
                <Separator className="flex-1" />
              </div>

              <Button variant="outline" asChild className="w-full">
                <Link href="/auth/magic-link">
                  <ClientFlowIcon name="arrow-right" size={16} />
                  Client? Sign in with a magic link
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        <AuthMarketingPanel />
      </div>
    </div>
  );
}
