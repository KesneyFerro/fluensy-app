"use client";

import { useAuth } from "@/contexts/AuthContext";
import { RouteProtection } from "@/components/route-protection";
import BottomNavigation from "@/components/BottomNavigation";
import MicrophoneButton from "@/components/MicrophoneButton";
import Image from "next/image";

export default function HomePage() {
  const { user } = useAuth();

  return (
    <RouteProtection>
      <div className="min-h-screen bg-background flex flex-col">
        {/* Main content area */}
        <main className="flex-1 pb-20 px-4">
          <div className="max-w-md mx-auto pt-8">
            <div className="text-center mb-8">
              <h1 className="text-2xl mb-2">
                Welcome, {user?.displayName || user?.email}
              </h1>
              <p className="text-muted-foreground">Hello world</p>
            </div>
            <div
              className="w-[500px] h-[500px] bg-center"
              style={{ backgroundImage: "url('/penguin.png')" }}
            />
          </div>
        </main>

        {/* Floating microphone button */}
        <MicrophoneButton />

        {/* Bottom navigation */}
        <BottomNavigation />
      </div>
    </RouteProtection>
  );
}
