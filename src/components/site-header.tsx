"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookmarkIcon, LogOutIcon, UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Wordmark } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { AuthDialog } from "@/components/auth-dialog";
import { useKindling } from "@/lib/store";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  const { saved, session, signOut } = useKindling();
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-14 w-full max-w-5xl items-center gap-3 px-4">
        <Link href="/" className="rounded-md outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50">
          <Wordmark />
        </Link>

        <div className="flex-1" />

        <Button
          variant={pathname === "/library" ? "secondary" : "ghost"}
          size="sm"
          render={<Link href="/library" />}
        >
          <BookmarkIcon data-icon="inline-start" />
          Saved
          {saved.length ? (
            <Badge variant="secondary" className={cn(pathname === "/library" && "bg-background")}>
              {saved.length}
            </Badge>
          ) : null}
        </Button>

        <ThemeToggle />

        {session?.user ? (
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button variant="ghost" size="icon" aria-label="Account">
                  <UserIcon />
                </Button>
              }
            />
            <DropdownMenuContent align="end">
              <DropdownMenuLabel className="max-w-56 truncate">{session.user.email}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem onClick={() => void signOut()}>
                  <LogOutIcon />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <AuthDialog>
            <Button variant="outline" size="sm">
              Sign in
            </Button>
          </AuthDialog>
        )}
      </div>
    </header>
  );
}
