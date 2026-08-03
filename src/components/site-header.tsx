"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  BookmarkIcon,
  CloudCheckIcon,
  CopyIcon,
  CheckIcon,
  EyeIcon,
  EyeOffIcon,
  FlameIcon,
  LightbulbIcon,
  LogOutIcon,
  MenuIcon,
  SparklesIcon,
  UserIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Spinner } from "@/components/ui/spinner";
import { Wordmark } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { useKindling } from "@/lib/store";
import { formatCode } from "@/lib/api";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  const { saved, token, syncing, signOut } = useKindling();
  const rawPathname = usePathname();
  const pathname = rawPathname ?? "";
  const [showCode, setShowCode] = useState(false);
  const [copied, setCopied] = useState(false);

  const navItems = [
    {
      href: "/start",
      label: "Spark Idea",
      icon: SparklesIcon,
      active: pathname === "/" || pathname === "/start",
    },
    {
      href: "/ideas",
      label: "Ideas",
      icon: LightbulbIcon,
      active: pathname === "/ideas",
    },
    {
      href: "/library",
      label: "Saved",
      icon: BookmarkIcon,
      active: pathname === "/library",
      badge: saved.length > 0 ? saved.length : null,
    },
  ];

  const handleCopyCode = () => {
    if (!token) return;
    navigator.clipboard.writeText(formatCode(token));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/50 bg-background/80 backdrop-blur-xl transition-all duration-200 dark:bg-background/70 shadow-xs">
      {/* Ember glow line at top edge */}
      <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-amber-500/50 dark:via-amber-400/40 to-transparent pointer-events-none" />

      <div className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between gap-3 px-4 sm:px-6">
        {/* Brand / Logo */}
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="group flex items-center gap-2 rounded-xl transition-all outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
          >
            <div className="relative flex items-center justify-center transition-transform duration-300 group-hover:scale-105">
              <Wordmark />
            </div>
            <span className="hidden md:inline-flex items-center rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold text-amber-700 dark:text-amber-300 ring-1 ring-amber-500/20 tracking-wider uppercase">
              vibe
            </span>
          </Link>
        </div>

        {/* Center Navigation Links (Desktop) */}
        <nav className="hidden sm:flex items-center gap-1 rounded-full border border-border/60 bg-muted/40 p-1.5 backdrop-blur-md shadow-2xs">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium transition-all duration-200 outline-none focus-visible:ring-[2px] focus-visible:ring-ring",
                  item.active
                    ? "bg-background text-foreground shadow-xs font-semibold ring-1 ring-border/80"
                    : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                )}
              >
                <Icon className={cn("size-3.5", item.active ? "text-amber-600 dark:text-amber-400" : "text-muted-foreground")} />
                <span>{item.label}</span>
                {item.badge !== null && item.badge !== undefined && (
                  <span
                    className={cn(
                      "ml-0.5 rounded-full px-1.5 py-0.2 text-[10px] font-bold tabular-nums transition-colors",
                      item.active
                        ? "bg-amber-500/20 text-amber-700 dark:text-amber-300"
                        : "bg-muted-foreground/15 text-muted-foreground"
                    )}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          {/* Quick CTA Button (Desktop) */}
          <Button
            variant="default"
            size="sm"
            className="hidden md:inline-flex h-8 gap-1.5 rounded-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-medium shadow-xs shadow-amber-500/20 transition-all duration-200 border-none px-3.5 text-xs"
            render={<Link href="/start" />}
          >
            <FlameIcon className="size-3.5" />
            <span>New Spark</span>
          </Button>

          {/* Theme Toggle */}
          <div className="rounded-full border border-border/40 p-0.5 transition-colors hover:border-border">
            <ThemeToggle />
          </div>

          {/* User Account / Sync Dropdown */}
          {token ? (
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Account"
                    className="relative size-9 rounded-full border border-border/40 hover:border-border hover:bg-muted/60 transition-all"
                  >
                    {syncing ? (
                      <Spinner className="size-4 text-amber-600 dark:text-amber-400" />
                    ) : (
                      <div className="relative flex items-center justify-center">
                        <UserIcon className="size-4 text-foreground/80" />
                        <span className="absolute -top-0.5 -right-0.5 size-2 rounded-full bg-emerald-500 ring-2 ring-background" />
                      </div>
                    )}
                  </Button>
                }
              />
              <DropdownMenuContent align="end" className="w-72 max-w-[calc(100vw-2rem)] p-2 rounded-xl backdrop-blur-xl bg-popover/95 border-border/80 shadow-lg">
                <DropdownMenuLabel className="flex items-center gap-2 p-2 font-normal text-xs text-muted-foreground">
                  <CloudCheckIcon className="size-4 text-emerald-500" />
                  <span className="font-medium text-foreground">
                    {syncing ? "Syncing with cloud…" : "Synced to cloud"}
                  </span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="my-1 opacity-60" />
                <DropdownMenuGroup>
                  <DropdownMenuItem
                    closeOnClick={false}
                    onClick={() => setShowCode((v) => !v)}
                    className="flex items-center gap-2.5 rounded-lg py-2 cursor-pointer"
                  >
                    {showCode ? <EyeOffIcon className="size-4 text-amber-500" /> : <EyeIcon className="size-4 text-muted-foreground" />}
                    <span className="text-xs font-medium">
                      {showCode ? "Hide recovery code" : "Show recovery code"}
                    </span>
                  </DropdownMenuItem>
                  {showCode ? (
                    <div className="px-2 py-2 my-1 rounded-lg bg-muted/60 border border-border/50">
                      <div className="flex items-center justify-between gap-1 mb-1.5">
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Recovery Key</span>
                        <button
                          type="button"
                          onClick={handleCopyCode}
                          className="flex items-center gap-1 text-[10px] text-amber-600 dark:text-amber-400 hover:underline font-medium"
                        >
                          {copied ? (
                            <>
                              <CheckIcon className="size-3 text-emerald-500" />
                              Copied
                            </>
                          ) : (
                            <>
                              <CopyIcon className="size-3" />
                              Copy
                            </>
                          )}
                        </button>
                      </div>
                      <code className="block rounded-md bg-background/80 p-2 font-mono text-[11px] text-foreground break-all select-all border border-border/40">
                        {formatCode(token)}
                      </code>
                    </div>
                  ) : null}
                  <DropdownMenuItem
                    onClick={() => void signOut()}
                    className="flex items-center gap-2.5 rounded-lg py-2 text-destructive focus:text-destructive cursor-pointer"
                  >
                    <LogOutIcon className="size-4" />
                    <span className="text-xs font-medium">Forget this device</span>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : null}

          {/* Mobile Menu Trigger (Sheet) */}
          <Sheet>
            <SheetTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  className="sm:hidden size-9 rounded-full border border-border/40"
                  aria-label="Open menu"
                >
                  <MenuIcon className="size-4" />
                </Button>
              }
            />
            <SheetContent side="right" className="w-[280px] p-0 flex flex-col justify-between border-l border-border bg-background/95 backdrop-blur-2xl">
              <div>
                <SheetHeader className="border-b border-border/50 p-4 text-left">
                  <SheetTitle className="flex items-center gap-2">
                    <Wordmark />
                  </SheetTitle>
                </SheetHeader>
                <div className="flex flex-col gap-1 p-3">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <SheetClose
                        key={item.href}
                        render={
                          <Link
                            href={item.href}
                            className={cn(
                              "flex items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all",
                              item.active
                                ? "bg-amber-500/10 text-amber-700 dark:text-amber-300 font-semibold"
                                : "text-muted-foreground hover:bg-muted hover:text-foreground"
                            )}
                          >
                            <div className="flex items-center gap-2.5">
                              <Icon className="size-4" />
                              <span>{item.label}</span>
                            </div>
                            {item.badge !== null && item.badge !== undefined && (
                              <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-xs font-bold text-amber-700 dark:text-amber-300">
                                {item.badge}
                              </span>
                            )}
                          </Link>
                        }
                      />
                    );
                  })}
                </div>
              </div>

              <div className="p-4 border-t border-border/50 flex flex-col gap-3 bg-muted/30">
                <Button
                  variant="default"
                  size="default"
                  className="w-full gap-2 rounded-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-medium shadow-xs text-xs py-2"
                  render={<Link href="/start" />}
                >
                  <FlameIcon className="size-4" />
                  <span>Start New Spark</span>
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}

