"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  FileText,
  FolderKanban,
  LayoutDashboard,
  LogOut,
  Menu,
  PanelLeft,
  Receipt,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { signOut } from "next-auth/react";
import { Brand } from "@/components/brand";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn, initials } from "@/lib/utils";

const NAV = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/proposals", label: "Proposals", icon: FileText },
  { href: "/admin/clients", label: "Clients", icon: Users },
  { href: "/admin/projects", label: "Projects", icon: FolderKanban },
  { href: "/admin/invoices", label: "Invoices", icon: Receipt },
];

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col gap-2 p-3">
      <div className="flex h-14 items-center px-2">
        <Brand />
      </div>
      <nav className="flex flex-1 flex-col gap-1">
        {NAV.map((item) => {
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "text-muted-foreground hover:bg-accent hover:text-accent-foreground flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                active && "bg-accent text-foreground"
              )}
            >
              <item.icon className={cn("size-4", active && "text-primary")} />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

export function AdminShell({
  name,
  email,
  children,
}: {
  name: string;
  email: string;
  children: React.ReactNode;
}) {
  const router = useRouter();

  async function handleLogout() {
    await signOut({ redirect: false });
    toast.success("Signed out");
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="min-h-svh w-full">
      <aside className="bg-sidebar border-border fixed inset-y-0 left-0 z-40 hidden w-64 border-r lg:block">
        <SidebarContent />
      </aside>

      <div className="lg:pl-64">
        <header className="bg-background/80 sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b px-4 backdrop-blur sm:px-6">
          <div className="flex items-center gap-3">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden">
                  <Menu className="size-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72 p-0">
                <SheetHeader className="border-b px-2 py-2">
                  <SheetTitle>
                    <Brand />
                  </SheetTitle>
                </SheetHeader>
                <SidebarContent onNavigate={() => {}} />
              </SheetContent>
            </Sheet>
            <span className="text-muted-foreground hidden items-center gap-1.5 text-xs font-medium sm:flex">
              <PanelLeft className="size-3.5" />
              Agency workspace
            </span>
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="focus-visible:ring-ring flex items-center gap-2 rounded-full outline-none focus-visible:ring-2">
                  <Avatar className="size-8">
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {initials(name)}
                    </AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <p className="text-sm font-medium">{name}</p>
                  <p className="text-muted-foreground text-xs font-normal">{email}</p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="destructive" onClick={handleLogout}>
                  <LogOut className="size-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8">{children}</main>
      </div>
    </div>
  );
}