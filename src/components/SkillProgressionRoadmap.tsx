import React from "react";
import { Lock, Check, Target, CircleDot, Circle } from "lucide-react";
import { SkillRoadmapLevel } from "@/data/skillTopics";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { motion, useReducedMotion } from "framer-motion";

interface SkillProgressionRoadmapProps {
  levels: SkillRoadmapLevel[];
  targetLevel: number;
  currentLevel: number;
}

export const SkillProgressionRoadmap: React.FC<SkillProgressionRoadmapProps> = React.memo(
  ({ levels, targetLevel, currentLevel }) => {
    const shouldReduce = useReducedMotion();

    return (
      <div className="space-y-3 pt-1">
        <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-muted-foreground font-mono">
          <span>10-Level Competency Roadmap</span>
          <span>Target: Level {targetLevel} · Assessed: Level {currentLevel}</span>
        </div>

        {/* Stepper with connecting line */}
        <div className="relative pl-6 sm:pl-8 space-y-2 before:absolute before:left-2.5 sm:before:left-3.5 before:top-3 before:bottom-3 before:w-[3px] before:bg-foreground">
          {levels.map((lvl, idx) => {
            const isCompleted = lvl.level_number < currentLevel;
            const isCurrent = lvl.level_number === currentLevel;
            const isTarget = lvl.level_number === targetLevel;
            const isBetweenCurrentAndTarget =
              lvl.level_number > currentLevel && lvl.level_number <= targetLevel;
            const isBeyondScope = lvl.level_number > targetLevel;

            return (
              <motion.div
                key={lvl.level_number}
                className="relative group"
                initial={{ opacity: shouldReduce ? 1 : 0, y: shouldReduce ? 0 : 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: shouldReduce ? 0 : idx * 0.03, ease: "easeOut" }}
              >
                {/* Node icon marker */}
                <div
                  className={cn(
                    "absolute -left-6 sm:-left-8 top-2 h-5 w-5 sm:h-6 sm:w-6 rounded-none border-2 border-foreground flex items-center justify-center transition-all text-xs font-mono font-bold",
                    isCurrent
                      ? "bg-foreground text-background nb-shadow-sm z-10"
                      : isTarget
                      ? "bg-[#4169E1] text-white nb-shadow-sm z-10"
                      : isCompleted
                      ? "bg-primary text-primary-foreground"
                      : isBeyondScope
                      ? "bg-secondary text-muted-foreground"
                      : "bg-card text-foreground"
                  )}
                >
                  {isCurrent ? (
                    <CircleDot className="h-3.5 w-3.5" />
                  ) : isTarget ? (
                    <Target className="h-3.5 w-3.5" />
                  ) : isCompleted ? (
                    <Check className="h-3.5 w-3.5" />
                  ) : isBeyondScope ? (
                    <Lock className="h-3 w-3" />
                  ) : (
                    <Circle className="h-3 w-3" />
                  )}
                </div>

                {/* Level Content Item */}
                <div
                  className={cn(
                    "rounded-sm border-2 border-foreground p-3 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs",
                    isCurrent
                      ? "bg-card border-foreground text-foreground nb-shadow-sm font-bold"
                      : isTarget
                      ? "bg-[#4169E1]/10 border-foreground text-foreground nb-shadow-sm font-bold"
                      : isCompleted
                      ? "bg-primary/20 border-foreground text-foreground"
                      : isBetweenCurrentAndTarget
                      ? "bg-card border-foreground text-foreground"
                      : "bg-secondary/60 border-foreground/30 text-muted-foreground opacity-75"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={cn(
                        "font-mono font-bold text-xs px-2 py-0.5 rounded-sm border border-foreground shrink-0",
                        isCurrent
                          ? "bg-foreground text-background"
                          : isTarget
                          ? "bg-[#4169E1] text-white"
                          : isCompleted
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary text-foreground"
                      )}
                    >
                      L{lvl.level_number}
                    </span>

                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={cn(
                            "font-bold",
                            (isCurrent || isTarget) && "text-foreground font-extrabold"
                          )}
                        >
                          {lvl.topic}
                        </span>
                        {isCurrent && (
                          <Badge variant="outline" className="text-[10px] bg-secondary text-foreground font-bold font-mono">
                            Assessed Level
                          </Badge>
                        )}
                        {isTarget && (
                          <Badge variant="dream" className="text-[10px] font-bold font-mono">
                            Target Level
                          </Badge>
                        )}
                        {isCompleted && (
                          <span className="text-[10px] text-foreground font-bold flex items-center gap-0.5 font-mono">
                            <Check className="h-3 w-3 text-foreground" /> Mastered
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right Scope Status */}
                  <div className="shrink-0 flex items-center gap-1.5 self-end sm:self-center">
                    {isBeyondScope ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-mono font-bold text-muted-foreground">
                        <Lock className="h-3 w-3" />
                        Beyond scope
                      </span>
                    ) : isBetweenCurrentAndTarget ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-primary-foreground bg-primary px-2 py-0.5 rounded-sm border border-foreground">
                        Next Step
                      </span>
                    ) : null}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    );
  }
);

SkillProgressionRoadmap.displayName = "SkillProgressionRoadmap";
