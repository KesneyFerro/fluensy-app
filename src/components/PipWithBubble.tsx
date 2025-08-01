import Image from "next/image";
import React from "react";

export function PipWithBubble({ message }: { readonly message: string }) {
  return (
    <div className="flex items-center justify-center mb-6">
      <div className="relative flex items-center">
        <Image
          src="/penguin.png"
          alt="Pip the Penguin"
          width={64}
          height={64}
        />
        <div className="ml-4 bg-white dark:bg-gray-800 border border-blue-200 dark:border-blue-600 rounded-xl px-4 py-2 shadow text-base text-gray-800 dark:text-gray-200 max-w-xs">
          {message}
        </div>
      </div>
    </div>
  );
}
