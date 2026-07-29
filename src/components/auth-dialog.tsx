"use client";

import { useState } from "react";
import { MailIcon, SparklesIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Spinner } from "@/components/ui/spinner";
import { useKindling } from "@/lib/store";
import { supabase } from "@/lib/supabase";

/**
 * Signing in is always optional and never blocks anything. The dialog says so
 * out loud, because the fear it answers is "will I lose what I just made?".
 */
export function AuthDialog({
  children,
  open,
  onOpenChange,
}: {
  children?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const { saved, seenCount, cloudEnabled } = useKindling();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [message, setMessage] = useState("");

  async function send(e: React.FormEvent) {
    e.preventDefault();
    const sb = supabase();
    if (!sb) return;
    setStatus("sending");
    const { error } = await sb.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: typeof window !== "undefined" ? window.location.origin : undefined },
    });
    if (error) {
      setStatus("error");
      setMessage(error.message);
      return;
    }
    setStatus("sent");
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {children ? <DialogTrigger render={children as React.ReactElement} /> : null}
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Keep your ideas on every device</DialogTitle>
          <DialogDescription>
            You&rsquo;ve saved {saved.length} {saved.length === 1 ? "idea" : "ideas"} and seen{" "}
            {seenCount}. An account carries all of it across — nothing is lost, and nothing is
            re-shown.
          </DialogDescription>
        </DialogHeader>

        {!cloudEnabled ? (
          <Alert>
            <SparklesIcon />
            <AlertTitle>Accounts aren&rsquo;t switched on yet</AlertTitle>
            <AlertDescription>
              Kindling works fully without one — your ideas are saved on this device right now. Add
              a Supabase URL and anon key to <code>.env.local</code> to turn on cross-device sync.
            </AlertDescription>
          </Alert>
        ) : status === "sent" ? (
          <Alert>
            <MailIcon />
            <AlertTitle>Check your email</AlertTitle>
            <AlertDescription>
              We sent a sign-in link to {email}. Open it on any device and your library follows you.
            </AlertDescription>
          </Alert>
        ) : (
          <form onSubmit={send}>
            <FieldGroup>
              <Field data-invalid={status === "error" ? true : undefined}>
                <FieldLabel htmlFor="auth-email">Email</FieldLabel>
                <Input
                  id="auth-email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={email}
                  aria-invalid={status === "error" ? true : undefined}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <FieldDescription>
                  {status === "error" ? message : "No password. We email you a one-time link."}
                </FieldDescription>
              </Field>
              <Button type="submit" disabled={status === "sending" || !email}>
                {status === "sending" ? <Spinner data-icon="inline-start" /> : null}
                Send me a link
              </Button>
            </FieldGroup>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
