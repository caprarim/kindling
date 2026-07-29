import { cn } from "@/lib/utils";

/** The Kindling mark — the same flame as the app icon, drawn inline. */
export function Mark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 512 512"
      aria-hidden
      className={cn("size-8", className)}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="kindling-flame" x1="256" y1="70" x2="256" y2="366" gradientUnits="userSpaceOnUse">
          <stop stopColor="var(--ember-glow)" />
          <stop offset="0.45" stopColor="var(--ember-hot)" />
          <stop offset="1" stopColor="var(--ember-mid)" />
        </linearGradient>
      </defs>
      <g stroke="currentColor" strokeLinecap="round" strokeWidth="30" opacity="0.4">
        <path d="M150 428 L362 386" />
        <path d="M150 386 L362 428" />
      </g>
      <path
        d="M256 66 C 256 118, 244 150, 236 172 C 227 197, 240 214, 258 209 C 278 203, 291 176, 288 132 C 322 168, 344 205, 344 250 C 344 316, 305 358, 256 358 C 207 358, 168 316, 168 250 C 168 176, 226 116, 256 66 Z"
        fill="url(#kindling-flame)"
      />
      <path
        d="M258 206 C 258 206, 214 250, 214 292 C 214 328, 233 348, 257 348 C 281 348, 300 328, 300 292 C 300 250, 258 206, 258 206 Z"
        fill="var(--ember-glow)"
        opacity="0.85"
      />
    </svg>
  );
}

export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={cn("flex items-center gap-2", className)}>
      <Mark className="size-7 text-primary" />
      <span className="font-heading text-lg font-semibold tracking-tight">Kindling</span>
    </span>
  );
}
