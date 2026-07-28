"use client";

import { Construction } from "lucide-react";

export default function PlaceholderPage({ title, description }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6">
      <div className="h-20 w-20 bg-violet-100 text-violet-700 rounded-full flex items-center justify-center mb-6">
        <Construction size={40} />
      </div>
      <h1 className="text-3xl font-bold text-zinc-900 mb-2">{title}</h1>
      <p className="text-zinc-500 max-w-md">{description}</p>
    </div>
  );
}
