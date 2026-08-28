import React from "react";
import { LucideIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface RadixPageHeaderProps {
  moduleNumber: string;
  moduleName: string;
  title: string;
  description: string;
  icon: LucideIcon;
  badgeText?: string;
  actionContent?: React.ReactNode;
  className?: string;
}

export const RadixPageHeader: React.FC<RadixPageHeaderProps> = ({
  moduleNumber,
  moduleName,
  title,
  description,
  icon: Icon,
  badgeText = "RADIX TALENT MATCH",
  actionContent,
  className,
}) => {
  return (
    <div
      className={cn(
        "bg-card border-b-[3px] border-foreground py-7 px-4 sm:px-6 nb-shadow-sm",
        className
      )}
    >
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="h-12 w-12 rounded-sm bg-primary text-primary-foreground flex items-center justify-center shrink-0 border-2 border-foreground nb-shadow-sm">
            <Icon className="h-6 w-6" />
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-mono font-bold text-[#4169E1] uppercase tracking-wider">
                MODULE {moduleNumber} · {moduleName}
              </span>
              <Badge variant="outline" className="text-[10px] uppercase font-mono font-bold">
                {badgeText}
              </Badge>
            </div>
            <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-foreground leading-tight">
              {title}
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-3xl font-medium">
              {description}
            </p>
          </div>
        </div>

        {actionContent && <div className="shrink-0 flex items-center gap-2.5">{actionContent}</div>}
      </div>
    </div>
  );
};
