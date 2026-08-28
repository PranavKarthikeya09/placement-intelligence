import React from "react";
import { SkillCategoryCode, SKILL_CATEGORY_NAMES } from "@/shared/types";
import { cn } from "@/lib/utils";

interface CategoryBadgeProps {
  code: SkillCategoryCode | string;
  showLabel?: boolean;
  className?: string;
  size?: "sm" | "md";
}

export const CategoryBadge: React.FC<CategoryBadgeProps> = ({
  code,
  showLabel = false,
  className,
  size = "sm",
}) => {
  const categoryCode = (code as SkillCategoryCode) || "OTHER";
  const fullName = SKILL_CATEGORY_NAMES[categoryCode] || code;

  return (
    <span
      className={cn(
        "inline-flex items-center font-mono font-bold rounded-sm border-2 border-foreground bg-card text-foreground transition-colors",
        size === "sm" ? "text-[10px] px-1.5 py-0.5" : "text-xs px-2 py-1",
        className
      )}
      title={`RADIX Category: ${fullName} (${categoryCode})`}
    >
      <span>{categoryCode}</span>
      {showLabel && <span className="ml-1 text-muted-foreground">· {fullName}</span>}
    </span>
  );
};
