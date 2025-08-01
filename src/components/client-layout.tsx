"use client";

import BottomNavigation from "@/components/BottomNavigation";
import { usePathname } from "next/navigation";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // Check if current path should hide navigation (locale-aware)
  const pathsToHide = ["/login", "/signup", "/complete-profile"];
  const hideNavigation = pathsToHide.some((path) => {
    // Remove locale prefix to check the actual path
    const pathWithoutLocale =
      pathname?.replace(/^\/[a-z]{2}(?=\/|$)/, "") || "";
    return pathWithoutLocale === path || pathname === path;
  });

  return (
    <>
      {children}
      {!hideNavigation && <BottomNavigation />}
    </>
  );
}
