import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Sparkles,
  BarChart2,
  HelpCircle,
  TrendingUp,
  AlertCircle,
  RefreshCw,
  UserCheck,
  Target,
  CheckCircle2,
  AlertTriangle,
  Building2,
  RotateCcw,
  Layers,
} from "lucide-react";
import { useCompany } from "@/context/CompanyContext";
import { CompanyLogo } from "@/components/CompanyLogo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { SkillGapSimulatorItem } from "@/components/SkillGapSimulator";
import { CountUp } from "@/components/motion/CountUp";
import {
  loadCandidateProfile,
  getStoredAssessments,
  saveStoredAssessments,
} from "@/data/mockCandidateProfile";
import {
  evaluateTalentCheck,
  mapSkillNameToCategoryCode,
} from "@/lib/talentCheck";
import { SkillCategoryCode, SKILL_CATEGORY_NAMES } from "@/shared/types";
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
    selectedCompany,
    companySummary,
    skills,
    skillTopicsBySkillName,
    allCompaniesSummary,
    setSelectedCompanyById,
    isSkillsLoading,
    skillsError,
    refetchSkills,
  } = useCompany();
  const navigate = useNavigate();

  // Load active Candidate Profile
  const candidateProfile = useMemo(() => loadCandidateProfile(), []);

  // Candidate Self-Assessments per skill state
  const activeCompanyId = companySummary?.id || selectedCompany?.companyId || "1";
  const [assessments, setAssessments] = useState<Record<string, number>>(() => {
    return getStoredAssessments(activeCompanyId);
  });

  // Category filter state
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");

  // Reload stored assessments when company changes
  useEffect(() => {
    setAssessments(getStoredAssessments(activeCompanyId));
  }, [activeCompanyId]);

  // Guard against missing company
  useEffect(() => {
    if (!companySummary && !isSkillsLoading) {
      navigate("/", { replace: true });
    }
  }, [companySummary, isSkillsLoading, navigate]);

  // Handle skill level change
  const handleLevelChange = useCallback(
    (skillName: string, newLevel: number) => {
      setAssessments((prev) => {
        const next = { ...prev, [skillName]: newLevel };
        saveStoredAssessments(activeCompanyId, next);
        return next;
      });
    },
    [activeCompanyId]
  );

  // Reset assessments to candidate profile defaults
  const handleResetAssessments = useCallback(() => {
    const fresh: Record<string, number> = {};
    for (const skill of skills) {
      const catCode = mapSkillNameToCategoryCode(skill.name);
      const matched = candidateProfile.skills.find(
        (s) => s.skill_name.toLowerCase() === skill.name.toLowerCase() || s.category_code === catCode
      );
      fresh[skill.name] = matched?.level || Math.max(1, skill.score - 2);
    }
    setAssessments(fresh);
    saveStoredAssessments(activeCompanyId, fresh);
  }, [skills, candidateProfile, activeCompanyId]);

  // Evaluate deterministic Talent Check report
  const numericCompanyId = parseInt(activeCompanyId, 10) || 1;
  const talentCheckResult = useMemo(() => {
    return evaluateTalentCheck(
      candidateProfile,
      numericCompanyId,
      companySummary?.name || "Target Company",
      skills,
      assessments
    );
  }, [candidateProfile, numericCompanyId, companySummary?.name, skills, assessments]);

  // Derived counts
  const totalSkillsCount = skills.length;
  const metSkillsCount = useMemo(() => {
    return skills.filter((s) => {
      const candLvl = assessments[s.name] ?? Math.max(1, s.score - 2);
      return candLvl >= s.score;
    }).length;
  }, [skills, assessments]);
  const gapSkillsCount = totalSkillsCount - metSkillsCount;

  // Filter skills by selected RADIX category
  const filteredSkills = useMemo(() => {
    if (selectedCategory === "ALL") return skills;
    return skills.filter((s) => mapSkillNameToCategoryCode(s.name) === selectedCategory);
  }, [skills, selectedCategory]);

  // Distinct category codes present in current company skills
  const availableCategories = useMemo(() => {
    const set = new Set<SkillCategoryCode>();
    skills.forEach((s) => set.add(mapSkillNameToCategoryCode(s.name)));
    return Array.from(set);
  }, [skills]);

  if (skillsError) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="inline-flex p-3 rounded-none bg-destructive text-destructive-foreground border-2 border-foreground nb-shadow-sm">
          <AlertCircle className="h-8 w-8" />
        </div>
        <h2 className="text-xl font-bold text-foreground font-heading">
          Unable to load talent check intelligence
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

  const readinessScore = talentCheckResult.overall_readiness_score;
  const readinessTier = talentCheckResult.readiness_tier;

  return (
    <div className="min-h-full pb-20 bg-background">
      {/* Talent Check Hero Header */}
      <div className="bg-card border-b-[3px] border-foreground py-8 px-4 sm:px-6 nb-shadow-sm">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Top Row: Company Info + Quick Switcher + Candidate Context */}
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
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="text-xs font-bold font-mono text-[#4169E1] uppercase tracking-wider">
                    RADIX MODULE 04 · TALENT CHECK
                  </span>
                  <span className="text-[10px] font-mono font-bold bg-secondary px-2 py-0.5 rounded-sm border-2 border-foreground text-foreground">
                    {companySummary.name.toUpperCase()} BENCHMARK
                  </span>
                </div>
                <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-foreground leading-tight">
                  YOUR PATH TO THE COMPANY
                </h1>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-2xl font-medium">
                  Compare your structured candidate profile against {companySummary.name}'s competency expectations to calculate gaps, readiness score, and targeted progression milestones.
                </p>
              </div>
            </div>

            {/* Candidate Context Badge & Company Switcher */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2.5">
              {/* Active Candidate Badge */}
              <div className="flex items-center gap-2 bg-secondary px-3 py-1.5 rounded-sm border-2 border-foreground nb-shadow-sm">
                <UserCheck className="h-4 w-4 text-[#4169E1]" />
                <div className="text-left font-mono">
                  <div className="text-[10px] font-bold text-muted-foreground uppercase leading-none">
                    CANDIDATE PROFILE
                  </div>
                  <div className="text-xs font-bold text-foreground leading-tight">
                    {candidateProfile.name} (SVCE)
                  </div>
                </div>
              </div>

              {/* Quick Company Switcher Dropdown */}
              {allCompaniesSummary.length > 0 && (
                <div className="flex items-center gap-1.5 bg-card px-2.5 py-1 rounded-sm border-2 border-foreground nb-shadow-sm">
                  <Building2 className="h-4 w-4 text-foreground shrink-0" />
                  <label htmlFor="talent-check-company-switcher" className="sr-only">Select Company</label>
                  <select
                    id="talent-check-company-switcher"
                    aria-label="Select Target Company for Talent Check"
                    value={activeCompanyId}
                    onChange={(e) => setSelectedCompanyById(e.target.value)}
                    className="text-xs font-mono font-bold bg-transparent text-foreground focus:outline-none cursor-pointer pr-1"
                  >
                    {allCompaniesSummary.map((c) => (
                      <option key={c.id} value={c.id} className="bg-card text-foreground">
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* Overall Readiness & Talent Check KPI Dashboard Strip */}
          <div className="rounded-sm border-2 border-foreground bg-secondary p-5 nb-shadow-md space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b-2 border-foreground pb-3">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-foreground" />
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-foreground">
                  SKILL PROFILE OVERVIEW · TALENT CHECK READINESS ASSESSMENT
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono font-bold text-muted-foreground">
                  EVALUATION TIER:
                </span>
                <span
                  className={cn(
                    "text-xs font-mono font-extrabold px-2.5 py-0.5 rounded-sm border-2 border-foreground",
                    readinessTier === "Ready"
                      ? "bg-primary text-primary-foreground"
                      : readinessTier === "Needs Preparation"
                      ? "bg-[#4169E1] text-white"
                      : "bg-[#FF7657] text-foreground"
                  )}
                >
                  {readinessTier.toUpperCase()}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {/* KPI 1: Overall Readiness Score */}
              <div className="space-y-0.5">
                <div className="font-mono font-extrabold text-3xl sm:text-4xl text-foreground flex items-baseline gap-1">
                  <CountUp to={readinessScore} duration={0.6} />
                  <span className="text-lg font-bold">%</span>
                </div>
                <div className="text-xs text-muted-foreground font-bold">
                  Overall Candidate Readiness
                </div>
              </div>

              {/* KPI 2: Total Required Skills */}
              <div className="space-y-0.5 border-l-2 border-foreground pl-4">
                <div className="font-mono font-extrabold text-3xl sm:text-4xl text-foreground">
                  <CountUp to={totalSkillsCount} duration={0.6} />
                </div>
                <div className="text-xs text-muted-foreground font-bold">
                  Target Competencies
                </div>
              </div>

              {/* KPI 3: Target Met Competencies */}
              <div className="space-y-0.5 border-l-2 border-foreground pl-4">
                <div className="font-mono font-extrabold text-3xl sm:text-4xl text-primary flex items-center gap-1.5">
                  <CountUp to={metSkillsCount} duration={0.6} />
                  <CheckCircle2 className="h-5 w-5 text-foreground hidden sm:inline" />
                </div>
                <div className="text-xs text-muted-foreground font-bold">
                  Competencies Met (Gap = 0)
                </div>
              </div>

              {/* KPI 4: Priority Gaps */}
              <div className="space-y-0.5 border-l-2 border-foreground pl-4">
                <div className="font-mono font-extrabold text-3xl sm:text-4xl text-[#FF7657] flex items-center gap-1.5">
                  <CountUp to={gapSkillsCount} duration={0.6} />
                  {gapSkillsCount > 0 && <AlertTriangle className="h-5 w-5 text-[#FF7657] hidden sm:inline" />}
                </div>
                <div className="text-xs text-muted-foreground font-bold">
                  Gaps Requiring Progression
                </div>
              </div>
            </div>

            {/* Visual Readiness Progress Bar */}
            <div className="space-y-1 pt-1 font-mono">
              <div className="flex justify-between text-[11px] font-bold text-muted-foreground">
                <span>BENCHMARK READINESS: <strong className="text-foreground">{readinessScore}%</strong></span>
                <span>THRESHOLD: <strong className="text-[#4169E1]">80% FOR PLACEMENT CLEARANCE</strong></span>
              </div>
              <div className="relative h-3 w-full bg-card rounded-none overflow-hidden border-2 border-foreground">
                <div
                  className="absolute top-0 bottom-0 left-0 transition-all duration-300 bg-primary"
                  style={{ width: `${readinessScore}%` }}
                />
                {/* 80% Benchmark Marker */}
                <div
                  className="absolute top-0 bottom-0 w-1 bg-[#4169E1] z-10"
                  style={{ left: "80%" }}
                  title="Placement Readiness Threshold (80%)"
                />
              </div>
            </div>
          </div>

          {/* Priority Development Areas Banner */}
          {talentCheckResult.priority_gaps.length > 0 && (
            <div className="rounded-sm border-2 border-foreground bg-card p-4 space-y-3 nb-shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-foreground pb-2">
                <div className="flex items-center gap-2 text-xs font-bold text-foreground font-mono">
                  <Sparkles className="h-4 w-4 text-[#4169E1]" />
                  <span>PRIORITY DEVELOPMENT AREAS (TOP COMPETENCY GAPS):</span>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleResetAssessments}
                  className="h-7 text-[11px] font-mono font-bold gap-1.5"
                  title="Reset self-assessments to candidate profile defaults"
                >
                  <RotateCcw className="h-3 w-3" />
                  <span>Reset Assessments</span>
                </Button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {talentCheckResult.priority_gaps.map((desc, idx) => (
                  <div
                    key={idx}
                    className="rounded-sm border-2 border-foreground bg-secondary p-3 flex items-start gap-2.5 text-xs text-foreground"
                  >
                    <span className="font-mono font-extrabold text-foreground bg-[#FF7657] shrink-0 h-5 w-5 rounded-sm border border-foreground flex items-center justify-center text-[11px]">
                      #{idx + 1}
                    </span>
                    <span className="font-bold leading-snug">{desc}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Explanatory Box: "How Talent Check works" */}
          <div className="rounded-sm border-2 border-foreground bg-card p-4 flex items-start gap-3 text-xs text-foreground nb-shadow-sm">
            <HelpCircle className="h-4 w-4 text-[#4169E1] shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <span className="font-bold text-foreground font-mono uppercase text-[11px] block">
                HOW TALENT CHECK WORKS
              </span>
              <p className="leading-relaxed text-muted-foreground font-medium">
                Talent Check compares candidate proficiencies with {companySummary.name}'s benchmark expectation levels (1–10). Gaps are evaluated as <code className="font-mono bg-secondary px-1 py-0.5 border border-foreground text-foreground">max(0, target - candidate)</code>. Use the self-assessment buttons below to simulate competency level adjustments in real-time.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-8 space-y-10">
        {/* RADIX Categories Filter & Breakdown */}
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b-2 border-foreground">
            <h2 className="font-heading text-base font-bold text-foreground flex items-center gap-2">
              <Layers className="h-4 w-4 text-foreground" />
              <span>RADIX Competency Categories Filter</span>
            </h2>
            <span className="text-[11px] text-muted-foreground font-mono font-bold">
              {filteredSkills.length} of {skills.length} Competencies Displayed
            </span>
          </div>

          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => setSelectedCategory("ALL")}
              className={cn(
                "px-3 py-1 text-xs font-mono font-bold rounded-sm border-2 transition-all",
                selectedCategory === "ALL"
                  ? "bg-primary text-primary-foreground border-foreground nb-shadow-sm"
                  : "bg-card text-foreground border-foreground hover:bg-secondary"
              )}
            >
              ALL ({skills.length})
            </button>
            {availableCategories.map((code) => {
              const count = skills.filter((s) => mapSkillNameToCategoryCode(s.name) === code).length;
              return (
                <button
                  key={code}
                  onClick={() => setSelectedCategory(code)}
                  className={cn(
                    "px-3 py-1 text-xs font-mono font-bold rounded-sm border-2 transition-all",
                    selectedCategory === code
                      ? "bg-primary text-primary-foreground border-foreground nb-shadow-sm"
                      : "bg-card text-foreground border-foreground hover:bg-secondary"
                  )}
                >
                  {code} · {SKILL_CATEGORY_NAMES[code]} ({count})
                </button>
              );
            })}
          </div>
        </div>

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

        {/* Interactive Skill Gap Simulator & 10-Level Roadmaps */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b-2 border-foreground pb-2">
            <div>
              <h2 className="font-heading text-base sm:text-lg font-bold text-foreground flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                <span>SKILL GAP SIMULATOR ({filteredSkills.length} COMPETENCIES)</span>
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5 font-medium">
                Adjust candidate levels below. The overall readiness score, priority gaps, and 10-level roadmaps update instantly.
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
              {filteredSkills.map((skill, index) => {
                const candLvl = assessments[skill.name] ?? Math.max(1, skill.score - 2);
                return (
                  <SkillGapSimulatorItem
                    key={skill.id || index}
                    skill={skill}
                    index={index}
                    topics={skillTopicsBySkillName[skill.name]}
                    candidateLevel={candLvl}
                    onLevelChange={(lvl) => handleLevelChange(skill.name, lvl)}
                  />
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
