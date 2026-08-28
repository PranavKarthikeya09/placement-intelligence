import React, { useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Sparkles,
  BarChart2,
  HelpCircle,
  TrendingUp,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { useCompany } from "@/context/CompanyContext";
import { CompanyLogo } from "@/components/CompanyLogo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { SkillGapSimulatorItem } from "@/components/SkillGapSimulator";
import { CountUp } from "@/components/motion/CountUp";
import { cn } from "@/lib/utils";

const BLOOM_DETAILS = [
  {
    code: "CU",
    name: "Conceptual Understanding",
    range: "1–2",
    bgClass: "bg-secondary border-foreground text-foreground",
    description: "Foundational definitions, syntax comprehension, and terminology recall",
  },
  {
    code: "AP",
    name: "Applied Problem Solving",
    range: "3–4",
    bgClass: "bg-[#4169E1]/10 border-foreground text-foreground",
    description: "Standard algorithmic recipes, common patterns, and practical execution",
  },
  {
    code: "AS",
    name: "Analytical Synthesis",
    range: "5–6",
    bgClass: "bg-primary/20 border-foreground text-foreground",
    description: "Multi-layered logic, edge cases debugging, and architectural trade-offs",
  },
  {
    code: "EV",
    name: "Evaluation & Optimization",
    range: "7–8",
    bgClass: "bg-destructive/15 border-foreground text-foreground",
    description: "Performance profiling, concurrency management, and system resilience",
  },
  {
    code: "CR",
    name: "Creative Architecture",
    range: "9–10",
    bgClass: "bg-card border-foreground text-foreground",
    description: "Enterprise scale blueprints, high-throughput innovation, and leadership",
  },
];

const CRITICALITY_DETAILS = [
  {
    type: "Critical",
    range: "Level ≥ 7",
    colorClass: "bg-destructive/15 border-foreground text-foreground",
    badgeVariant: "critical",
    description: "Pivotal knockout competencies required for standard technical screening rounds",
  },
  {
    type: "Important",
    range: "Level 5–6",
    colorClass: "bg-[#4169E1]/10 border-foreground text-foreground",
    badgeVariant: "important",
    description: "Core functional foundations regularly evaluated during technical interviews",
  },
  {
    type: "Baseline",
    range: "Level < 5",
    colorClass: "bg-secondary border-foreground text-foreground",
    badgeVariant: "baseline",
    description: "General conceptual readiness expected of all graduating engineering candidates",
  },
];

export const SkillIntelligence: React.FC = () => {
  const {
    companySummary,
    skills,
    skillTopicsBySkillName,
    isSkillsLoading,
    skillsError,
    refetchSkills,
  } = useCompany();
  const navigate = useNavigate();

  // Guard against missing company
  useEffect(() => {
    if (!companySummary && !isSkillsLoading) {
      navigate("/", { replace: true });
    }
  }, [companySummary, isSkillsLoading, navigate]);

  // Derive dynamic metrics for Skill Profile Overview
  const skillProfileStats = useMemo(() => {
    const total = skills.length;
    const critical = skills.filter((s) => s.criticality === "Critical").length;
    const important = skills.filter((s) => s.criticality === "Important").length;
    const baseline = skills.filter((s) => s.criticality === "Baseline").length;

    return { total, critical, important, baseline };
  }, [skills]);

  if (skillsError) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="inline-flex p-3 rounded-none bg-destructive text-destructive-foreground border-2 border-foreground nb-shadow-sm">
          <AlertCircle className="h-8 w-8" />
        </div>
        <h2 className="text-xl font-bold text-foreground font-heading">
          Unable to load skill intelligence
        </h2>
        <p className="text-sm text-muted-foreground max-w-md mx-auto font-medium">
          We encountered an issue retrieving placement skill benchmarks from Supabase.
        </p>
        <div className="flex justify-center gap-3">
          <Button onClick={() => refetchSkills()} variant="outline" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            <span>Retry Loading Skills</span>
          </Button>
          <Button onClick={() => navigate("/")} variant="secondary">
            Back to Directory
          </Button>
        </div>
      </div>
    );
  }

  if (!companySummary && isSkillsLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-6">
        <Skeleton className="h-28 w-full rounded-sm" />
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-sm" />
          ))}
        </div>
      </div>
    );
  }

  if (!companySummary) {
    return null;
  }

  return (
    <div className="min-h-full pb-20 bg-background">
      {/* Skill Intelligence Hero Header */}
      <div className="bg-card border-b-[3px] border-foreground py-8 px-4 sm:px-6 nb-shadow-sm">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <CompanyLogo
                name={companySummary.name}
                shortName={companySummary.shortName}
                logoUrl={companySummary.logoUrl}
                websiteUrl={companySummary.websiteUrl}
                category={companySummary.category}
                size="lg"
                className="shrink-0"
              />
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold font-mono text-[#4169E1] uppercase tracking-wider">
                    {companySummary.name} · SKILL ROADMAP
                  </span>
                  <span className="text-[10px] font-mono font-bold bg-secondary px-2 py-0.5 rounded-sm border-2 border-foreground text-foreground">
                    {skills.length} REQUIRED SKILLS
                  </span>
                </div>
                <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-foreground leading-tight">
                  YOUR PATH TO THE COMPANY
                </h1>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-2xl font-medium">
                  Understand what this company expects and map the path toward the required proficiency.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold bg-secondary text-foreground border-2 border-foreground px-3 py-1 rounded-sm nb-shadow-sm">
                SELF-ASSESSMENT CALIBRATION
              </span>
            </div>
          </div>

          {/* Compact Overview Strip: SKILL PROFILE */}
          <div className="rounded-sm border-2 border-foreground bg-secondary p-4 nb-shadow-md">
            <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-muted-foreground mb-2.5">
              SKILL PROFILE OVERVIEW
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="space-y-0.5">
                <div className="font-mono font-extrabold text-2xl sm:text-3xl text-foreground">
                  <CountUp to={skillProfileStats.total} duration={0.7} />
                </div>
                <div className="text-xs text-muted-foreground font-bold">
                  Required Skills
                </div>
              </div>

              <div className="space-y-0.5 border-l-2 border-foreground pl-4">
                <div className="font-mono font-extrabold text-2xl sm:text-3xl text-destructive">
                  <CountUp to={skillProfileStats.critical} duration={0.7} />
                </div>
                <div className="text-xs text-muted-foreground font-bold">
                  Critical Priority
                </div>
              </div>

              <div className="space-y-0.5 border-l-2 border-foreground pl-4">
                <div className="font-mono font-extrabold text-2xl sm:text-3xl text-[#4169E1]">
                  <CountUp to={skillProfileStats.important} duration={0.7} />
                </div>
                <div className="text-xs text-muted-foreground font-bold">
                  Important Priority
                </div>
              </div>

              <div className="space-y-0.5 border-l-2 border-foreground pl-4">
                <div className="font-mono font-extrabold text-2xl sm:text-3xl text-foreground">
                  <CountUp to={skillProfileStats.baseline} duration={0.7} />
                </div>
                <div className="text-xs text-muted-foreground font-bold">
                  Baseline Priority
                </div>
              </div>
            </div>
          </div>

          {/* Contextual Box: "Why these skills?" */}
          <div className="rounded-sm border-2 border-foreground bg-card p-4 flex items-start gap-3 text-xs text-foreground nb-shadow-sm">
            <HelpCircle className="h-4 w-4 text-[#4169E1] shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <span className="font-bold text-foreground font-mono uppercase text-[11px] block">
                WHY THESE SKILLS?
              </span>
              <p className="leading-relaxed text-muted-foreground font-medium">
                The displayed requirements reflect {companySummary.name}'s configured skill profile in the portal dataset. Use the interactive gap simulator below to assess your current readiness and identify high-priority topic milestones to close any gaps.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-8 space-y-10">
        {/* Bloom's Taxonomy Scale Reference */}
        <div className="space-y-3">
          <div className="flex items-center justify-between pb-2 border-b-2 border-foreground">
            <h2 className="font-heading text-base font-bold text-foreground flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-foreground" />
              <span>Bloom's Taxonomy Competency Calibration</span>
            </h2>
            <span className="text-[11px] text-muted-foreground font-mono font-bold">5-Tier Evaluation Scale</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {BLOOM_DETAILS.map((bloom) => (
              <div
                key={bloom.code}
                className={cn(
                  "rounded-sm border-2 border-foreground p-3.5 flex flex-col justify-between space-y-2 bg-card nb-shadow-sm nb-card-hover select-none",
                  bloom.bgClass
                )}
              >
                <div>
                  <div className="flex items-center justify-between mb-1 font-mono">
                    <span className="font-extrabold text-sm tracking-wider">
                      {bloom.code}
                    </span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-sm bg-card border border-foreground">
                      Levels {bloom.range}
                    </span>
                  </div>
                  <div className="font-heading font-bold text-xs leading-snug text-foreground">
                    {bloom.name}
                  </div>
                </div>
                <p className="text-[11px] text-muted-foreground leading-tight font-medium">
                  {bloom.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Criticality Classification Tiers */}
        <div className="space-y-3">
          <div className="flex items-center justify-between pb-2 border-b-2 border-foreground">
            <h2 className="font-heading text-base font-bold text-foreground flex items-center gap-2">
              <BarChart2 className="h-4 w-4 text-foreground" />
              <span>Preparation Criticality Tiers</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {CRITICALITY_DETAILS.map((crit) => (
              <div
                key={crit.type}
                className={cn(
                  "rounded-sm border-2 border-foreground p-4 flex flex-col justify-between space-y-2 bg-card nb-shadow-sm nb-card-hover select-none",
                  crit.colorClass
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="font-heading font-bold text-sm">
                    {crit.type} Priority
                  </span>
                  <Badge variant={crit.badgeVariant as any} className="text-[10px]">
                    {crit.range}
                  </Badge>
                </div>
                <p className="text-xs leading-relaxed text-foreground font-medium">
                  {crit.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Interactive Skill Gap Simulator & 12 Skill Breakdown */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b-2 border-foreground pb-2">
            <div>
              <h2 className="font-heading text-base sm:text-lg font-bold text-foreground flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                <span>SKILL GAP SIMULATOR ({skills.length} SKILLS)</span>
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5 font-medium">
                Interact with the self-assessment controls below to calculate your level gap and view dynamic topic recommendations
              </p>
            </div>
            <span className="text-[11px] text-muted-foreground font-mono font-bold">
              Sorted by Target Level (Descending)
            </span>
          </div>

          {isSkillsLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-44 w-full rounded-sm" />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {skills.map((skill, index) => (
                <SkillGapSimulatorItem
                  key={skill.id || index}
                  skill={skill}
                  index={index}
                  topics={skillTopicsBySkillName[skill.name]}
                  initialCurrentLevel={Math.max(1, skill.score - 2)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
