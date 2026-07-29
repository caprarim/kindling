"use client";

import { useState } from "react";
import { CheckIcon, CopyIcon, KeyRoundIcon, ShieldIcon, TriangleAlertIcon } from "lucide-react";
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
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import { useKindling } from "@/lib/store";
import { formatCode } from "@/lib/api";

/**
 * Accounts have no email and no password — the server mints a recovery code and
 * only ever stores its hash. The code is both the sign-in credential and the
 * way onto a second device, so the screen that shows it has to be emphatic.
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
  const { saved, seenCount, cloudEnabled, createNewAccount, signInWithCode } = useKindling();
  const [busy, setBusy] = useState<"create" | "signin" | null>(null);
  const [error, setError] = useState("");
  const [newCode, setNewCode] = useState("");
  const [copied, setCopied] = useState(false);
  const [code, setCode] = useState("");

  async function create() {
    setBusy("create");
    setError("");
    try {
      setNewCode(await createNewAccount());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't create an account.");
    } finally {
      setBusy(null);
    }
  }

  async function signIn(e: React.FormEvent) {
    e.preventDefault();
    setBusy("signin");
    setError("");
    try {
      await signInWithCode(code.trim());
      onOpenChange?.(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't sign in.");
    } finally {
      setBusy(null);
    }
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(newCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard blocked — the code is on screen to copy by hand.
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {children ? <DialogTrigger render={children as React.ReactElement} /> : null}
      <DialogContent className="sm:max-w-md">
        {newCode ? (
          <>
            <DialogHeader>
              <DialogTitle>Save this code somewhere</DialogTitle>
              <DialogDescription>
                It&rsquo;s the only way back into this account. Only a one-way hash of it is ever
                stored, so it genuinely cannot be recovered later.
              </DialogDescription>
            </DialogHeader>

            <div className="flex flex-col gap-3">
              <code className="rounded-lg border border-border bg-muted p-4 text-center font-mono text-sm tracking-wider break-all select-all">
                {formatCode(newCode)}
              </code>
              <Button variant="outline" onClick={copy}>
                {copied ? <CheckIcon data-icon="inline-start" /> : <CopyIcon data-icon="inline-start" />}
                {copied ? "Copied" : "Copy code"}
              </Button>
              <Alert>
                <TriangleAlertIcon />
                <AlertTitle>Lose it and the library is gone</AlertTitle>
                <AlertDescription>
                  Paste it into a password manager. Entering it on another device brings your saved
                  ideas, and the record of what you&rsquo;ve been shown, with you.
                </AlertDescription>
              </Alert>
              <Button onClick={() => onOpenChange?.(false)}>I&rsquo;ve saved it</Button>
            </div>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Keep your ideas on every device</DialogTitle>
              <DialogDescription>
                You&rsquo;ve saved {saved.length} {saved.length === 1 ? "idea" : "ideas"} and seen{" "}
                {seenCount}. An account moves all of it onto the server. Nothing is lost, and
                nothing gets re-shown.
              </DialogDescription>
            </DialogHeader>

            {!cloudEnabled ? (
              <Alert>
                <ShieldIcon />
                <AlertTitle>Accounts aren&rsquo;t switched on yet</AlertTitle>
                <AlertDescription>
                  Kindling works fully without one. Set <code>NEXT_PUBLIC_KINDLING_API</code> to a
                  deployed Kindling API to turn on cross-device sync.
                </AlertDescription>
              </Alert>
            ) : (
              <div className="flex flex-col gap-4">
                {error ? (
                  <Alert>
                    <TriangleAlertIcon />
                    <AlertTitle>{error}</AlertTitle>
                  </Alert>
                ) : null}

                <Button onClick={create} disabled={busy !== null}>
                  {busy === "create" ? <Spinner data-icon="inline-start" /> : null}
                  Create an account
                </Button>
                <p className="-mt-2 text-sm text-muted-foreground">
                  No email, no password. You get one code to keep.
                </p>

                <Separator />

                <form onSubmit={signIn}>
                  <FieldGroup>
                    <Field data-invalid={error ? true : undefined}>
                      <FieldLabel htmlFor="recovery-code">Already have a code?</FieldLabel>
                      <Input
                        id="recovery-code"
                        value={code}
                        autoComplete="one-time-code"
                        placeholder="XXXX-XXXX-XXXX-XXXX-XXXX-XXXX-XXXX-XXXX"
                        aria-invalid={error ? true : undefined}
                        onChange={(e) => setCode(e.target.value)}
                      />
                      <FieldDescription>
                        Spacing and capitals don&rsquo;t matter.
                      </FieldDescription>
                    </Field>
                    <Button type="submit" variant="outline" disabled={busy !== null || !code.trim()}>
                      {busy === "signin" ? (
                        <Spinner data-icon="inline-start" />
                      ) : (
                        <KeyRoundIcon data-icon="inline-start" />
                      )}
                      Sign in with code
                    </Button>
                  </FieldGroup>
                </form>
              </div>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
