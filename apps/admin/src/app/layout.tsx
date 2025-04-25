import type React from "react";
import { TableStylesApplier } from "@ezpg/ui";
import "./globals.css";
import { Inter } from "next/font/google";
import { AuthProvider, ADMIN_AUTH_CONFIG } from "@ezpg/auth";
import { Providers } from "./providers";

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" className="font-smooth">
      <body className={inter.className}>
        <Providers>
          <TableStylesApplier />
          <AuthProvider config={ADMIN_AUTH_CONFIG}>{children}</AuthProvider>
        </Providers>
      </body>
    </html>
  );
}

export const metadata = {
  generator: "ezpg.dev",
};
