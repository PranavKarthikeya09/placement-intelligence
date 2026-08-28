import React from "react";
import { SkillConfidence } from "@/shared/types";
import { cn } from "@/lib/utils";

interface ConfidenceBadgeProps {
  confidence?: SkillConfidence | string;
  className?: string;
}

export const ConfidenceBadge: React.FC<ConfidenceBadgeProps> = ({
  confidence = "medium",
  className,
}) => {
  const isHigh = confidence === "high";
  const isMedium = confidence === "medium";

  return (
    <span
      className={cn(
        "inline-flex items-center text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-sm border-2 border-foreground uppercase",
        isHigh
          ? "bg-primary text-primary-foreground"
          : isMedium
          ? "bg-[#4169E1] text-white"
          : "bg-secondary text-foreground",
        className
      )}
      title={`Model Extraction Confidence: ${confidence}`}
    >
      {confidence} Conf.
    </span>
  );
};
