"use client";

import { SignupForm } from "@/components/signup-form";
import { RouteProtection } from "@/components/route-protection";
import { usePathname } from "next/navigation";
import { useLanguage } from "@/contexts/LanguageContext";

export default function SignupPage() {
  const pathname = usePathname();
  const { currentLanguage } = useLanguage();

  // Extract current locale from pathname
  const pathParts = pathname?.split("/") || [];
  const currentLocale = pathParts[1] || currentLanguage;

  return (
    <RouteProtection requireAuth={false} redirectTo={`/${currentLocale}`}>
      <div className="grid min-h-svh lg:grid-cols-2">
        <div className="flex flex-col gap-4 p-6 md:p-10">
          <div className="flex justify-center gap-2 md:justify-start">
            <a
              href={`/${currentLocale}`}
              className="flex items-center gap-2 font-medium"
            >
              <img
                src="/fluensy_icon.svg"
                alt="Fluensy Logo"
                className="size-6 rounded-md"
              />
              FluenSy
            </a>
          </div>
          <div className="flex flex-1 items-center justify-center">
            <div className="w-full max-w-xs">
              <SignupForm />
            </div>
          </div>
        </div>
        <div className="bg-muted relative hidden lg:block">
          <img
            src="/placeholder.svg"
            alt="Signup background"
            className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
          />
        </div>
      </div>
    </RouteProtection>
  );
}
