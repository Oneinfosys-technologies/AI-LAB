'use client';

import { CBCManualCalculator } from "@/components/cbc/manual-calculator";

export default function CBCCalculatorPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">CBC Calculator</h1>
      <CBCManualCalculator />
    </div>
  );
} 