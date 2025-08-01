"use client";

import { useEffect } from "react";

interface HtmlLangProviderProps {
  locale: string;
  children: React.ReactNode;
}

export default function HtmlLangProvider({
  locale,
  children,
}: HtmlLangProviderProps) {
  useEffect(() => {
    // Set the lang attribute on the html element
    document.documentElement.lang = locale;
  }, [locale]);

  return <>{children}</>;
}
