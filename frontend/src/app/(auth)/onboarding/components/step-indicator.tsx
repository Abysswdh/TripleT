"use client";

import { Check } from "lucide-react";

interface StepIndicatorProps {
  currentStep: number;
  totalSteps?: number;
}

const steps = [
  { step: 1, label: "Role" },
  { step: 2, label: "Details" },
  { step: 3, label: "Profile" },
  { step: 4, label: "Welcome" },
];

export function StepIndicator({ currentStep }: StepIndicatorProps) {
  return (
    <div className="mx-auto mb-8 w-full max-w-md">
      <div className="flex items-center justify-between">
        {steps.map((item, index) => {
          const isCompleted = currentStep > item.step;
          const isCurrent = currentStep === item.step;

          return (
            <div key={item.step} className="flex items-center">
              <div className="flex flex-col items-center">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-semibold transition-all duration-300 ${
                    isCompleted
                      ? "border-primary bg-primary text-white shadow-md shadow-primary/30"
                      : isCurrent
                      ? "border-primary bg-background text-primary ring-4 ring-primary/15"
                      : "border-border/60 bg-muted/40 text-muted-foreground"
                  }`}
                >
                  {isCompleted ? <Check className="h-4 w-4 stroke-[3]" /> : item.step}
                </div>
                <span
                  className={`mt-2 text-xs font-medium transition-colors ${
                    isCurrent
                      ? "text-primary font-semibold"
                      : isCompleted
                      ? "text-foreground"
                      : "text-muted-foreground"
                  }`}
                >
                  {item.label}
                </span>
              </div>

              {index < steps.length - 1 && (
                <div
                  className={`mx-2 mb-6 h-0.5 w-12 sm:w-16 transition-colors duration-300 ${
                    currentStep > item.step ? "bg-primary" : "bg-border/60"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
