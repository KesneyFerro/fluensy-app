import Image from "next/image";
import React from "react";

export function PipWithBubble({ message }: { message: string }) {
  return (
    <div className="flex items-center justify-center mb-6">
      <div className="relative flex items-center">
        <Image
          src="/penguin.png"
          alt="Pip the Penguin"
          width={64}
          height={64}
        />
        <div className="ml-4 bg-white border border-blue-200 rounded-xl px-4 py-2 shadow text-base text-gray-800 max-w-xs">
          {message}
        </div>
      </div>
    </div>
  );
}
