"use client";

import BottomNavigation from "@/components/BottomNavigation";
import { usePathname } from "next/navigation";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const hideNavigation = ["/login", "/signup", "/complete-profile"].includes(
    pathname
  );

  return (
    <>
      {children}
      {!hideNavigation && <BottomNavigation />}
    </>
  );
}
