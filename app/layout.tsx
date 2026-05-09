import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Analytics } from "@vercel/analytics/react";

import { ThemeProvider } from "@/components/theme-provider";
import { WorkspaceProvider } from "@/components/whatsapp/workspace-provider";
import { SITE_URL } from "@/lib/site-config";

import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "WhatsApp Visualizer",
    template: "%s | WhatsApp Visualizer"
  },
  description: "Analyze WhatsApp exports privately in your browser with deterministic, local-first insights.",
  openGraph: {
    title: "WhatsApp Visualizer",
    description: "Deterministic, local-first WhatsApp analytics in your browser.",
    url: SITE_URL,
    siteName: "WhatsApp Visualizer",
    type: "website",
    images: [
      {
        url: "/og-image.svg",
        width: 1200,
        height: 630,
        alt: "WhatsApp Visualizer"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "WhatsApp Visualizer",
    description: "Deterministic, local-first WhatsApp analytics in your browser.",
    images: ["/og-image.svg"]
  },
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
    shortcut: ["/favicon.svg"]
  }
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <WorkspaceProvider>{children}</WorkspaceProvider>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
