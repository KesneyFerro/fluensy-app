"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

interface RouteProtectionProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  redirectTo?: string;
}

export function RouteProtection({
  children,
  requireAuth = true,
  redirectTo = "/login",
}: RouteProtectionProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (requireAuth && !user) {
        // User needs to be authenticated but isn't
        router.replace(redirectTo);
      } else if (!requireAuth && user) {
        // User is authenticated but shouldn't be
        router.replace("/");
      }
    }
  }, [user, loading, requireAuth, redirectTo, router]);

  // Show nothing while loading or if authentication requirements are not met
  if (loading || (requireAuth && !user) || (!requireAuth && user)) {
    return null;
  }

  return <>{children}</>;
}
