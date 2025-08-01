"use client";

import { Dumbbell, Home, User } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { useTheme } from "@/contexts/ThemeContext";
import { useLanguage } from "@/contexts/LanguageContext";

export default function BottomNavigation() {
  const router = useRouter();
  const pathname = usePathname();
  const { theme } = useTheme();
  const { currentLanguage } = useLanguage();

  // Extract the current locale from pathname
  const pathParts = pathname?.split("/") || [];
  const currentLocale = pathParts[1] || currentLanguage;

  const isActive = (path: string) => {
    const fullPath = `/${currentLocale}${path === "/" ? "" : path}`;
    return pathname === fullPath;
  };

  const navigate = (path: string) => {
    const fullPath = `/${currentLocale}${path === "/" ? "" : path}`;
    router.push(fullPath);
  };

  const isDark = theme === "dark";

  // Helper function to get button styles
  const getButtonStyles = (path: string) => {
    const active = isActive(path);
    const baseStyles =
      "flex items-center justify-center p-3 rounded-lg transition-colors cursor-pointer";

    if (active) {
      const activeStyles = isDark
        ? "bg-gray-800 text-primary"
        : "bg-gray-100 text-primary";
      return `${baseStyles} ${activeStyles}`;
    }

    const hoverStyles = isDark
      ? "hover:bg-gray-800 text-gray-300"
      : "hover:bg-gray-100 text-gray-600";
    return `${baseStyles} ${hoverStyles}`;
  };

  const navigationBgStyles = isDark
    ? "bg-gray-900 border-gray-700"
    : "bg-white border-border";

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 border-t z-40 ${navigationBgStyles}`}
    >
      <div className="flex items-center justify-around py-4 px-4 max-w-md mx-auto">
        <button
          className={getButtonStyles("/exercise")}
          onClick={() => navigate("/exercise")}
        >
          <Dumbbell className="w-6 h-6" />
        </button>

        <button className={getButtonStyles("/")} onClick={() => navigate("/")}>
          <Home className="w-6 h-6" />
        </button>

        <button
          className={getButtonStyles("/profile")}
          onClick={() => navigate("/profile")}
        >
          <User className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
}
