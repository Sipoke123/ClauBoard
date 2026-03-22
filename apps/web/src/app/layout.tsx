import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ClauBoard",
  description: "Visual control plane for AI coding agents",
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
