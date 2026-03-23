import type { Metadata } from "next";
import "./globals.css";

const siteUrl = "https://clauboard.dev";

export const metadata: Metadata = {
  title: {
    default: "ClauBoard — Visual Control Plane for AI Coding Agents",
    template: "%s | ClauBoard",
  },
  description:
    "Open-source dashboard to launch, monitor, and coordinate multiple Claude Code agents. Workflow canvas, pipelines, live events, interactive messaging. Free and self-hosted.",
  metadataBase: new URL(siteUrl),
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: "ClauBoard",
    title: "ClauBoard — Visual Control Plane for AI Coding Agents",
    description:
      "Open-source dashboard to launch, monitor, and coordinate multiple Claude Code agents. Workflow canvas, pipelines, live events, interactive messaging.",
    url: siteUrl,
    images: [{ url: "/dark.png", width: 1280, height: 800, alt: "ClauBoard dashboard showing agent workflow canvas" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "ClauBoard — Visual Control Plane for AI Coding Agents",
    description:
      "Open-source dashboard for Claude Code agents. Workflow canvas, pipelines, live events.",
    images: ["/dark.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
  keywords: [
    "Claude Code",
    "AI agents",
    "agent dashboard",
    "coding agents",
    "Claude Code dashboard",
    "AI workflow",
    "agent orchestration",
    "open source",
    "developer tools",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('clauboard-theme');var d=document.documentElement;if(t==='light'){d.className='light'}else{d.className='dark'}}catch(e){document.documentElement.className='dark'}})()`,
          }}
        />
      </head>
      <body className="bg-background text-foreground min-h-screen antialiased">
        {children}
      </body>
    </html>
  );
}
