import { Dumbbell, Home, User } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";

export default function BottomNavigation() {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-border z-40">
      <div className="flex items-center justify-around py-4 px-4 max-w-md mx-auto">
        <button
          className={`flex items-center justify-center p-3 rounded-lg transition-colors ${
            pathname === "/exercise"
              ? "bg-gray-100 text-primary"
              : "hover:bg-gray-100 text-gray-600"
          }`}
          onClick={() => router.push("/exercise")}
        >
          <Dumbbell className="w-6 h-6" />
        </button>

        <button
          className={`flex items-center justify-center p-3 rounded-lg transition-colors ${
            pathname === "/"
              ? "bg-gray-100 text-primary"
              : "hover:bg-gray-100 text-gray-600"
          }`}
          onClick={() => router.push("/")}
        >
          <Home className="w-6 h-6" />
        </button>

        <button
          className={`flex items-center justify-center p-3 rounded-lg transition-colors ${
            pathname === "/profile"
              ? "bg-gray-100 text-primary"
              : "hover:bg-gray-100 text-gray-600"
          }`}
          onClick={() => router.push("/profile")}
        >
          <User className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
}
