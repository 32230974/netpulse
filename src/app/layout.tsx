import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/context/ThemeContext";

export const metadata: Metadata = {
  title: "NetPulse — Smart ISP Management",
  description: "AI-powered Internet Service Provider management platform. Manage customers, subscriptions, billing, and support with intelligent automation.",
  keywords: ["ISP", "internet service provider", "management", "AI", "billing", "subscriptions"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className="antialiased">
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
