"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col items-center justify-center p-6 text-center font-sans">
        <div className="max-w-md rounded-2xl border border-border bg-card p-6 shadow-lg">
          <h2 className="text-xl font-semibold mb-2 text-foreground">Something went wrong</h2>
          <p className="text-sm text-muted-foreground mb-6">
            {error.message || "An unexpected error occurred."}
          </p>
          <button
            type="button"
            onClick={() => reset()}
            className="rounded-full bg-primary px-5 py-2 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
