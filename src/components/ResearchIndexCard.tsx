import React from "react";
import { CountUp } from "@/components/motion/CountUp";

interface ResearchIndexCardProps {
  companiesCount: number;
  skillsCount?: number;
  dimensionsCount?: number;
}

export const ResearchIndexCard: React.FC<ResearchIndexCardProps> = ({
  companiesCount,
  skillsCount = 12,
  dimensionsCount = 22,
}) => {
  return (
    <div className="border-2 border-foreground rounded-sm p-5 bg-card space-y-4 nb-shadow-lg select-none">
      <div className="flex items-center justify-between pb-2 border-b-2 border-foreground">
        <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-muted-foreground">
          PLACEMENT RESEARCH INDEX
        </span>
        <span className="text-[10px] font-mono text-muted-foreground border-2 border-foreground px-2 py-0.5 rounded-sm bg-secondary font-bold">
          LIVE
        </span>
      </div>

      <div className="space-y-3 font-mono">
        <div className="flex items-baseline justify-between">
          <span className="text-3xl font-bold text-foreground">
            <CountUp to={companiesCount || 118} duration={0.8} />
          </span>
          <span className="text-xs text-muted-foreground font-bold">
            COMPANIES INDEXED
          </span>
        </div>

        <div className="h-[2px] bg-foreground" />

        <div className="flex items-baseline justify-between">
          <span className="text-3xl font-bold text-primary">
            <CountUp to={skillsCount} suffix="+" duration={0.8} />
          </span>
          <span className="text-xs text-muted-foreground font-bold">
            SKILL PROFILES
          </span>
        </div>

        <div className="h-[2px] bg-foreground" />

        <div className="flex items-baseline justify-between">
          <span className="text-3xl font-bold text-[#4169E1]">
            <CountUp to={dimensionsCount} duration={0.8} />
          </span>
          <span className="text-xs text-muted-foreground font-bold">
            INTELLIGENCE DIMENSIONS
          </span>
        </div>
      </div>
    </div>
  );
};
