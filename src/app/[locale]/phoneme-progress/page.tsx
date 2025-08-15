"use client";

import { RouteProtection } from "@/components/route-protection";
import PhonemeProgressDashboard from "@/components/PhonemeProgressDashboard";
import BottomNavigation from "@/components/BottomNavigation";
import { usePhonemeInitialization } from "@/hooks/usePhonemeEvaluation";

export default function PhonemeProgressPage() {
  // Initialize phonemes for the user
  usePhonemeInitialization();

  return (
    <RouteProtection>
      <div className="min-h-screen bg-gray-50">
        <PhonemeProgressDashboard />
        <BottomNavigation />
      </div>
    </RouteProtection>
  );
}
