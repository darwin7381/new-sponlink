import "./globals.css";
import { Providers } from "@/components/Providers";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { AuthProvider } from "@/components/auth/AuthProvider";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ComparePanel from "@/components/comparison/ComparePanel";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "BlockMeet - Connecting Events and Sponsors",
  description: "The ultimate platform for event organizers and sponsors to connect and collaborate",
  icons: {
    icon: [
      { url: "https://img.blockmeet.io/square-dark-logo.png" },
    ],
    apple: [
      { url: "https://img.blockmeet.io/square-dark-logo.png" },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} pt-16`}>
        <Providers>
          <AuthProvider>
            <Header />
            <main className="min-h-[calc(100vh-theme(spacing.16)-theme(spacing.24))]">
              {children}
            </main>
            <Footer />
            <ComparePanel />
            <Toaster />
          </AuthProvider>
        </Providers>
      </body>
    </html>
  );
}
