import React, { useState, useMemo } from "react";
import {
  ChevronDown,
  ChevronUp,
  Sliders,
  Sparkles,
  ArrowRight,
  Check,
} from "lucide-react";
import { DashboardSkill } from "@/lib/companyData";
import { getRoadmapForSkill, SkillRoadmapLevel } from "@/data/skillTopics";
import { SkillProgressionRoadmap } from "@/components/SkillProgressionRoadmap";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { mapSkillNameToCategoryCode } from "@/lib/talentCheck";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

interface SkillGapSimulatorItemProps {
  skill: DashboardSkill;
  index: number;
  topics?: SkillRoadmapLevel[];
  initialCurrentLevel?: number;
  candidateLevel?: number;
  onLevelChange?: (newLevel: number) => void;
}

export const SkillGapSimulatorItem: React.FC<SkillGapSimulatorItemProps> = React.memo(
  ({
    skill,
    index,
    topics,
    initialCurrentLevel = 4,
    candidateLevel: controlledLevel,
    onLevelChange,
  }) => {
    const shouldReduce = useReducedMotion();

    // Support both controlled and uncontrolled state
    const [localLevel, setLocalLevel] = useState<number>(() => {
      return Math.max(1, Math.min(10, controlledLevel ?? initialCurrentLevel));
    });
    const [isExpanded, setIsExpanded] = useState<boolean>(index < 2);

    const currentLevel = controlledLevel !== undefined ? controlledLevel : localLevel;

    const handleLevelSelect = (lvl: number) => {
      const clamped = Math.max(1, Math.min(10, lvl));
      setLocalLevel(clamped);
      if (onLevelChange) {
        onLevelChange(clamped);
      }
    };

    const roadmapLevels = useMemo(() => {
      if (topics && topics.length > 0) {
        return topics;
      }
      return getRoadmapForSkill(skill.name);
    }, [topics, skill.name]);

    // Calculate gap: gap = max(0, targetLevel - currentLevel). Never negative!
    const targetLevel = skill.score;
    const gap = Math.max(0, targetLevel - currentLevel);
    const categoryCode = mapSkillNameToCategoryCode(skill.name);

    // Filter recommended next steps (levels between currentLevel and targetLevel)
    const recommendedNext = useMemo(() => {
      return roadmapLevels.filter(
        (lvl) => lvl.level_number > currentLevel && lvl.level_number <= targetLevel
      );
    }, [roadmapLevels, currentLevel, targetLevel]);

    return (
      <motion.div
        initial={{ opacity: shouldReduce ? 1 : 0, y: shouldReduce ? 0 : 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-15px" }}
        transition={{ duration: 0.35, delay: Math.min(index * 0.05, 0.3), ease: "easeOut" }}
      >
        <Card className="rounded-sm border-2 border-foreground bg-card overflow-hidden nb-shadow-md">
          <CardHeader className="p-5 pb-4 bg-secondary border-b-2 border-foreground space-y-4">
            {/* Top Title & Badges */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-mono font-bold text-muted-foreground">
                    #{String(index + 1).padStart(2, "0")}
                  </span>
                  <CardTitle className="text-base font-bold text-foreground font-heading">
                    {skill.name}
                  </CardTitle>
                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-sm bg-card border border-foreground text-foreground">
                    {categoryCode}
                  </span>
                  <Badge
                    variant={skill.bloom.toLowerCase() as any}
                    className="text-[10px] font-bold px-2 py-0.5"
                  >
                    {skill.bloom} · {skill.bloomLabel}
                  </Badge>
                  <Badge
                    variant={
                      skill.criticality === "Critical"
                        ? "critical"
                        : skill.criticality === "Important"
                        ? "important"
                        : "baseline"
                    }
                    className="text-[10px]"
                  >
                    {skill.criticality}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground font-medium">{skill.description}</p>
              </div>

              {/* Target vs Gap Indicator */}
              <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-1 shrink-0">
                <div className="flex items-center gap-1.5 font-mono">
                  <span className="text-xs text-muted-foreground font-bold">Target:</span>
                  <span className="text-xs font-bold text-foreground bg-card px-2 py-0.5 rounded-sm border-2 border-foreground nb-shadow-sm">
                    Level {targetLevel} / 10
                  </span>
                </div>
                <div className="text-xs font-mono font-bold">
                  {gap === 0 ? (
                    <span className="text-primary-foreground bg-primary px-2 py-0.5 rounded-sm border-2 border-foreground inline-flex items-center gap-1 text-[11px]">
                      <Check className="h-3 w-3" /> Target Met
                    </span>
                  ) : (
                    <span className="text-foreground bg-[#FF7657] px-2 py-0.5 rounded-sm border-2 border-foreground text-[11px]">
                      Gap: {gap} {gap === 1 ? "level" : "levels"}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Interactive Self-Assessment Level Selector */}
            <div className="rounded-sm border-2 border-foreground bg-card p-3.5 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-foreground font-mono">
                  <Sliders className="h-3.5 w-3.5 text-[#4169E1]" />
                  <span>SELF-ASSESSMENT:</span>
                  <span className="text-foreground bg-primary px-1.5 py-0.5 rounded-sm border border-foreground font-bold">
                    Level {currentLevel}
                  </span>
                </div>
                <span className="text-[11px] text-muted-foreground font-mono font-bold">
                  Select your estimated proficiency
                </span>
              </div>

              {/* 10 Level Buttons Selector */}
              <div className="grid grid-cols-10 gap-1 sm:gap-1.5">
                {Array.from({ length: 10 }).map((_, i) => {
                  const lvlNum = i + 1;
                  const isSelected = lvlNum === currentLevel;
                  const isTarget = lvlNum === targetLevel;

                  return (
                    <button
                      key={lvlNum}
                      type="button"
                      onClick={() => handleLevelSelect(lvlNum)}
                      className={cn(
                        "h-8 rounded-sm text-xs font-mono font-bold transition-all duration-100 relative flex items-center justify-center border-2",
                        isSelected
                          ? "bg-primary text-primary-foreground border-foreground nb-shadow-sm -translate-y-0.5"
                          : lvlNum <= currentLevel
                          ? "bg-secondary text-foreground border-foreground hover:bg-primary/30"
                          : "bg-card text-muted-foreground border-foreground/40 hover:border-foreground hover:text-foreground"
                      )}
                      title={`Set candidate self-assessment to Level ${lvlNum}`}
                    >
                      <span>{lvlNum}</span>
                      {isTarget && (
                        <span className="absolute -top-1 -right-1 h-2 w-2 rounded-none bg-[#FF7657] border border-foreground" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Visual Comparative Progress Bar */}
              <div className="space-y-1 pt-1 font-mono">
                <div className="flex justify-between text-[11px] font-bold text-muted-foreground">
                  <span>
                    YOUR LEVEL: <strong className="text-foreground">{currentLevel}</strong>
                  </span>
                  <span>
                    GAP: <strong className={gap > 0 ? "text-[#FF7657]" : "text-foreground"}>{gap} LEVELS</strong>
                  </span>
                  <span>
                    TARGET: <strong className="text-[#4169E1]">{targetLevel}</strong>
                  </span>
                </div>
                <div className="relative h-3 w-full bg-secondary rounded-none overflow-hidden border-2 border-foreground">
                  {/* Current level bar */}
                  <div
                    className="absolute top-0 bottom-0 left-0 transition-all duration-300 bg-primary"
                    style={{ width: `${currentLevel * 10}%` }}
                  />
                  {/* Target marker line */}
                  <div
                    className="absolute top-0 bottom-0 w-1.5 bg-foreground z-10"
                    style={{ left: `calc(${targetLevel * 10}% - 3px)` }}
                    title={`Target: Level ${targetLevel}`}
                  />
                </div>
              </div>
            </div>

            {/* Recommended Next Steps */}
            {recommendedNext.length > 0 && (
              <div className="rounded-sm border-2 border-foreground bg-card p-3.5 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-foreground font-mono">
                  <Sparkles className="h-3.5 w-3.5 text-[#4169E1]" />
                  <span>RECOMMENDED NEXT MILESTONES TO CLOSE GAP:</span>
                </div>
                <div className="space-y-1.5">
                  {recommendedNext.map((step) => (
                    <div
                      key={step.level_number}
                      className="flex items-start gap-2 text-xs text-foreground bg-secondary rounded-sm p-2 border-2 border-foreground"
                    >
                      <span className="font-mono font-bold text-primary-foreground bg-primary shrink-0 px-1.5 py-0.5 rounded-sm border border-foreground text-[10px]">
                        Level {step.level_number}
                      </span>
                      <ArrowRight className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-0.5" />
                      <span className="font-bold">{step.topic}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardHeader>

          {/* Expandable Connected 10-Level Roadmap */}
          <CardContent className="p-0">
            <div className="px-5 py-2.5 bg-card flex items-center justify-between border-b-2 border-foreground">
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex items-center gap-2 text-xs font-bold text-foreground hover:text-[#4169E1] transition-colors py-1 w-full text-left font-mono"
              >
                <span>{isExpanded ? "Collapse 10-Level Progression Roadmap" : "Expand 10-Level Progression Roadmap"}</span>
                {isExpanded ? (
                  <ChevronUp className="h-3.5 w-3.5 shrink-0" />
                ) : (
                  <ChevronDown className="h-3.5 w-3.5 shrink-0" />
                )}
              </button>
              <span className="text-[10px] text-muted-foreground shrink-0 font-mono font-bold">
                10 Levels
              </span>
            </div>

            <AnimatePresence initial={false}>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: shouldReduce ? 0 : 0.25, ease: "easeInOut" }}
                  className="overflow-hidden"
                >
                  <div className="p-5 bg-secondary">
                    <SkillProgressionRoadmap
                      levels={roadmapLevels}
                      targetLevel={targetLevel}
                      currentLevel={currentLevel}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </motion.div>
    );
  }
);

SkillGapSimulatorItem.displayName = "SkillGapSimulatorItem";
