"use client";

import { AuthProvider } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import ClientLayout from "@/components/client-layout";
import HtmlLangProvider from "@/components/html-lang-provider";
import { use } from "react";

interface LocaleLayoutProps {
  readonly children: React.ReactNode;
  readonly params: Promise<{ locale: string }>;
}

export default function LocaleLayout({ children, params }: LocaleLayoutProps) {
  const { locale } = use(params);

  return (
    <HtmlLangProvider locale={locale}>
      <ThemeProvider>
        <AuthProvider>
          <LanguageProvider>
            <ClientLayout>{children}</ClientLayout>
          </LanguageProvider>
        </AuthProvider>
      </ThemeProvider>
    </HtmlLangProvider>
  );
}
