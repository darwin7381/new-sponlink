'use client';

import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { SessionProvider } from "next-auth/react";
import { ReactNode } from "react";
// import { LanguageProvider } from "@/contexts/LanguageContext";
import { AuthProvider } from "@/components/auth/AuthProvider";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider defaultTheme="system" storageKey="blockmeet-theme">
        <AuthProvider>
          {children}
        </AuthProvider>
      </ThemeProvider>
    </SessionProvider>
  );
} 