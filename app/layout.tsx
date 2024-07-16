import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { ReactNode } from "react";

import "./globals.css";
import CReactQueryProvider from "@/providers/CReactQueryProvider";

export const metadata: Metadata = {
  title: "aIQ",
  description:
    "aIQ - Where artificial intelligence meets intellectual curiosity.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <ClerkProvider afterSignOutUrl="/">
      <html lang="en">
        <head>
          <link
            href="https://api.fontshare.com/v2/css?f[]=satoshi@300,301,400,401,500,501,700,701&display=swap"
            rel="stylesheet"
          />
          <link
            rel="apple-touch-icon"
            sizes="180x180"
            href="/favicons/apple-touch-icon.png"
          />
          <link
            rel="icon"
            type="image/png"
            sizes="32x32"
            href="/favicons/favicon-32x32.png"
          />
          <link
            rel="icon"
            type="image/png"
            sizes="16x16"
            href="/favicons/favicon-16x16.png"
          />
          <link rel="manifest" href="/favicons/site.webmanifest" />
          <link rel="shortcut icon" href="/favicon.ico" />
          <meta
            name="viewport"
            content="height=device-height, width=device-width, initial-scale=1.0, minimum-scale=1.0, maximum-scale=1.0, user-scalable=no, target-densitydpi=device-dpi"
          />
        </head>
        <body>
          <CReactQueryProvider>
            <div className="m-auto xl:max-w-[1440px] 2xl:max-w-[1920px]">
              {children}
            </div>
          </CReactQueryProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
