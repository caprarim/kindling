import type { Metadata, Viewport } from "next";
import { Fraunces, Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { KindlingProvider } from "@/lib/store";
import { SiteHeader } from "@/components/site-header";
import { Mark } from "@/components/logo";
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
    "Answer a few questions and get project ideas shaped around what you're into, what you can do, and how much time you've got. No account needed, and you'll never see the same idea twice.",
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
                <div className="mx-auto flex w-full max-w-5xl flex-col gap-5 px-4 py-9 sm:flex-row sm:items-center sm:justify-between sm:gap-8">
                  <div className="flex items-center gap-2.5">
                    <Mark className="size-5 shrink-0 text-primary" />
                    <span className="font-heading text-base font-semibold tracking-tight text-card-foreground">
                      Kindling
                    </span>
                  </div>
                  <p className="max-w-sm text-sm/relaxed text-muted-foreground text-pretty sm:text-right">
                    Everything stays on your device. Nothing leaves it unless you ask it to.
                  </p>
                </div>
              </footer>
            </Toaster>
          </TooltipProvider>
        </KindlingProvider>
      </body>
    </html>
  );
}
