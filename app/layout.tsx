// app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import Script from "next/script";

export const metadata: Metadata = {
  title: "v0 App",
  description: "Created with v0",
  generator: "v0.dev",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        {/* GA4: gtag.js */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-8KSVRMVSDX"
          strategy="afterInteractive"
        />
        <Script id="ga4" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            // İlk sayfa yüklemesinde page_view
            gtag('config', 'G-8KSVRMVSDX', { send_page_view: true });
          `}
        </Script>
      </head>
      <body>{children}</body>
    </html>
  );
}

