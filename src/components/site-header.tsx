"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { BookmarkIcon, CloudCheckIcon, EyeIcon, LogOutIcon, UserIcon } from "lucide-react";
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
import { Spinner } from "@/components/ui/spinner";
import { Wordmark } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { useKindling } from "@/lib/store";
import { formatCode } from "@/lib/api";

export function SiteHeader() {
  const { saved, token, syncing, signOut } = useKindling();
  const pathname = usePathname();
  const [showCode, setShowCode] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background">
      <div className="mx-auto flex h-14 w-full max-w-5xl items-center gap-2 px-4 sm:gap-3">
        <Link
          href="/"
          className="rounded-md outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
        >
          <Wordmark />
        </Link>

        <div className="flex-1" />

        <Button
          variant={pathname === "/library" ? "secondary" : "ghost"}
          size="sm"
          render={<Link href="/library" />}
        >
          <BookmarkIcon data-icon="inline-start" />
          <span className="hidden sm:inline">Saved</span>
          {saved.length ? (
            <span className="text-muted-foreground tabular-nums">{saved.length}</span>
          ) : null}
        </Button>

        <ThemeToggle />

        {token ? (
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button variant="ghost" size="icon" aria-label="Account">
                  {syncing ? <Spinner /> : <UserIcon />}
                </Button>
              }
            />
            <DropdownMenuContent align="end" className="w-72 max-w-[calc(100vw-2rem)]">
              <DropdownMenuLabel className="flex items-center gap-2 font-normal text-muted-foreground">
                <CloudCheckIcon className="size-3.5" />
                {syncing ? "Syncing…" : "Saved on the server"}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem closeOnClick={false} onClick={() => setShowCode((v) => !v)}>
                  <EyeIcon />
                  {showCode ? "Hide my code" : "Show my recovery code"}
                </DropdownMenuItem>
                {showCode ? (
                  <p className="px-2 py-1.5">
                    <code className="block rounded-md bg-muted p-2 font-mono text-xs break-all select-all">
                      {formatCode(token)}
                    </code>
                  </p>
                ) : null}
                <DropdownMenuItem onClick={() => void signOut()}>
                  <LogOutIcon />
                  Forget this device
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : null}
      </div>
    </header>
  );
}
