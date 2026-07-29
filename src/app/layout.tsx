import type { Metadata, Viewport } from "next";
import Link from "next/link";
import { Fraunces, Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { KindlingProvider } from "@/lib/store";
import { SiteHeader } from "@/components/site-header";
import { Mark } from "@/components/logo";
import { Separator } from "@/components/ui/separator";
import { Toaster } from "@/components/ui/toast";
import { TooltipProvider } from "@/components/ui/tooltip";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
const display = Fraunces({
  variable: "--font-display",
  subsets: ["latin"],
  axes: ["SOFT", "WONK"],
});

export const metadata: Metadata = {
  title: "Kindling, find a project worth building",
  description:
    "A few plain questions, then project ideas shaped around real interests, real skill level and the time actually available. No account needed, and no idea ever repeats.",
  applicationName: "Kindling",
  openGraph: {
    title: "Kindling",
    description: "Find a project worth building.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#faf6f0" },
    { media: "(prefers-color-scheme: dark)", color: "#2a1d15" },
  ],
};

/** Applies the saved theme before first paint, so there is no light flash. */
const themeScript = `
(function () {
  try {
    var stored = localStorage.getItem("kindling.theme");
    var dark = stored ? stored === "dark" : matchMedia("(prefers-color-scheme: dark)").matches;
    document.documentElement.classList.toggle("dark", dark);
  } catch (e) {}
})();
`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${display.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="flex min-h-full flex-col bg-background">
        <KindlingProvider>
          <TooltipProvider>
            <Toaster>
              <SiteHeader />
              <main className="flex flex-1 flex-col">{children}</main>
              <footer className="mt-auto border-t border-border bg-card">
                <div className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 sm:py-12">
                  <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between sm:gap-10">
                    <div className="flex items-center gap-4">
                      <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-primary/10 ring-1 ring-primary/15 sm:size-16">
                        <Mark className="size-9 text-primary sm:size-10" />
                      </span>
                      <div className="flex flex-col gap-1">
                        <span className="font-heading text-xl font-semibold tracking-tight text-card-foreground sm:text-2xl">
                          Kindling
                        </span>
                        <span className="text-sm text-muted-foreground">
                          Find a project worth building.
                        </span>
                      </div>
                    </div>

                    <nav className="flex flex-wrap items-center gap-x-7 gap-y-3 text-sm font-medium sm:justify-end">
                      <Link
                        href="/"
                        className="rounded-md text-muted-foreground transition-colors outline-none hover:text-primary focus-visible:ring-[3px] focus-visible:ring-ring/50"
                      >
                        Start over
                      </Link>
                      <Link
                        href="/start"
                        className="rounded-md text-muted-foreground transition-colors outline-none hover:text-primary focus-visible:ring-[3px] focus-visible:ring-ring/50"
                      >
                        Questions
                      </Link>
                      <Link
                        href="/ideas"
                        className="rounded-md text-muted-foreground transition-colors outline-none hover:text-primary focus-visible:ring-[3px] focus-visible:ring-ring/50"
                      >
                        Ideas
                      </Link>
                      <Link
                        href="/library"
                        className="rounded-md text-muted-foreground transition-colors outline-none hover:text-primary focus-visible:ring-[3px] focus-visible:ring-ring/50"
                      >
                        Library
                      </Link>
                    </nav>
                  </div>

                  <Separator className="my-7 opacity-70 sm:my-8" />

                  <div className="flex flex-col gap-2 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-pretty">
                      Everything stays on this device. Nothing leaves it unless asked.
                    </p>
                    <p className="text-xs tracking-wide uppercase sm:text-right">
                      Built for vibe coders
                    </p>
                  </div>
                </div>
              </footer>
            </Toaster>
          </TooltipProvider>
        </KindlingProvider>
      </body>
    </html>
  );
}
