import React from "react";
import BudgetPlanner from "@/components/budget/BudgetPlanner";
import { Waves } from "@/components/ui/waves";

export default function Home() {
  return (
    <main className="relative w-full min-h-screen bg-[#000000] flex flex-col items-center justify-center overflow-x-hidden pt-12 md:pt-20">
      {/* Background Layer */}
      <div className="absolute inset-0 z-0">
        <Waves strokeColor="rgba(255, 255, 255, 0.15)" backgroundColor="#09090b" pointerSize={0.8} />
      </div>

      {/* Foreground Main Application */}
      <div className="relative z-10 w-full max-w-5xl mx-auto h-[90vh] md:h-[80vh] border border-zinc-800/60 p-2 md:p-6 bg-zinc-950/70 backdrop-blur-[12px] rounded-[30px] shadow-2xl overflow-hidden">
        <BudgetPlanner />
      </div>
    </main>
  );
}
