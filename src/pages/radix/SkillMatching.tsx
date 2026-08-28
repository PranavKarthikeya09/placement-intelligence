import React, { useState, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  GitCompare,
  CheckCircle2,
  AlertTriangle,
  User,
  Briefcase,
  BookOpen,
  Zap,
} from "lucide-react";
import { RadixPageHeader } from "@/components/radix/RadixPageHeader";
import { CategoryBadge } from "@/components/radix/CategoryBadge";
import { ConfidenceBadge } from "@/components/radix/ConfidenceBadge";
import {
  LoadingState,
  ErrorState,
} from "@/components/radix/RadixFeedbackStates";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CountUp } from "@/components/motion/CountUp";
import { loadCandidateProfile } from "@/data/mockCandidateProfile";
import { runSkillMatchApi } from "@/lib/radixApi";
import {
  CandidateProfile,
  JDAnalysisResult,
  SkillMatchResponse,
  MatchedSkillDetail,
  MissingSkillDetail,
} from "@/shared/types";
import { cn } from "@/lib/utils";

const SAMPLE_MATCH_JDS: { id: string; title: string; company: string; jd: JDAnalysisResult }[] = [
  {
    id: "jd_google_sde2",
    title: "Software Engineer II (Backend)",
    company: "Google",
    jd: {
      id: "jd_google_sde2",
      source: {
        source_type: "raw_text",
        processed_at: new Date().toISOString(),
      },
      company: {
        company_name: "Google LLC",
        location: "Bengaluru, India",
      },
      role: {
        job_title: "Software Engineer II (Backend Systems)",
        experience_level: "Mid-Senior Level",
        employment_type: "Full-time",
      },
      extracted_skills: [
        { skill_name: "Data Structures & Algorithms", category_code: "DSA", confidence: "high", level: 9, evidence: "LeetCode hard" },
        { skill_name: "Coding & Problem Solving", category_code: "COD", confidence: "high", level: 9, evidence: "Python / C++" },
        { skill_name: "System Design & Architecture", category_code: "SYSD", confidence: "high", level: 8, evidence: "Microservices" },
        { skill_name: "Operating Systems", category_code: "OS", confidence: "high", level: 7, evidence: "Linux" },
        { skill_name: "Cloud Infrastructure", category_code: "CLOUD", confidence: "medium", level: 8, evidence: "GCP / AWS" },
        { skill_name: "AI Native Engineering", category_code: "AI", confidence: "medium", level: 8, evidence: "RAG" },
      ],
      key_responsibilities: [
        "Architect distributed microservices and optimize query execution plans",
        "Design scalable algorithms and concurrency pipelines",
      ],
      minimum_qualifications: ["B.E. in Computer Science", "Strong command of DSA and System Design"],
    },
  },
  {
    id: "jd_msft_cloud",
    title: "Cloud Software Engineer",
    company: "Microsoft",
    jd: {
      id: "jd_msft_cloud",
      source: {
        source_type: "raw_text",
        processed_at: new Date().toISOString(),
      },
      company: {
        company_name: "Microsoft Corporation",
        location: "Bengaluru, India",
      },
      role: {
        job_title: "Cloud Software Engineer",
        experience_level: "Mid-Senior Level",
        employment_type: "Full-time",
      },
      extracted_skills: [
        { skill_name: "Cloud Fundamentals (AWS/Azure)", category_code: "CLOUD", confidence: "high", level: 8, evidence: "Azure" },
        { skill_name: "Object-Oriented Programming", category_code: "OOD", confidence: "high", level: 8, evidence: "Design patterns" },
        { skill_name: "Software Engineering & Testing", category_code: "SWE", confidence: "high", level: 8, evidence: "CI/CD" },
        { skill_name: "SQL & Databases", category_code: "SQL", confidence: "high", level: 7, evidence: "PostgreSQL" },
        { skill_name: "Data Structures & Algorithms", category_code: "DSA", confidence: "high", level: 8, evidence: "Algorithms" },
      ],
      key_responsibilities: ["Develop serverless microservices", "Deploy resilient Azure pipelines"],
      minimum_qualifications: ["Experience with AWS/Azure, Docker, Kubernetes"],
    },
  },
];

export function evaluateSkillMatchClient(
  candidate: CandidateProfile,
  jd: JDAnalysisResult
): SkillMatchResponse {
  const candSkills = candidate?.skills || [];
  const jdSkills = jd?.extracted_skills || [];

  const matched: MatchedSkillDetail[] = [];
  const missing: MissingSkillDetail[] = [];

  let totalJdLevel = 0;
  let matchedLevel = 0;

  for (const jSkill of jdSkills) {
    const reqLvl = jSkill.level || 6;
    totalJdLevel += reqLvl;

    const matchingCandSkill = candSkills.find(
      (c) =>
        c.skill_name && jSkill.skill_name && (
          c.skill_name.toLowerCase().includes(jSkill.skill_name.toLowerCase()) ||
          jSkill.skill_name.toLowerCase().includes(c.skill_name.toLowerCase()) ||
          c.category_code === jSkill.category_code
        )
    );

    if (matchingCandSkill && (matchingCandSkill.level || 5) >= reqLvl - 2) {
      const candLvl = matchingCandSkill.level || 5;
      matchedLevel += Math.min(candLvl, reqLvl);
      matched.push({
        candidate_skill: matchingCandSkill,
        jd_skill: jSkill,
        match_confidence: "exact",
        score_contribution: Math.round((Math.min(candLvl, reqLvl) / reqLvl) * 100) / 100,
      });
    } else {
      missing.push({
        jd_skill: jSkill,
        category_code: jSkill.category_code,
        criticality: reqLvl >= 8 ? "high" : "medium",
        suggested_learning_topic: `Proficiency Level ${reqLvl} advanced roadmap in ${jSkill.skill_name}`,
      });
    }
  }

  const score = Math.min(100, Math.max(0, Math.round((matchedLevel / (totalJdLevel || 1)) * 100)));

  return {
    candidate_id: candidate?.id || "cand_01",
    jd_id: jd?.id || "jd_01",
    job_title: jd?.role?.job_title || "Software Engineer",
    company_name: jd?.company?.company_name || "Company",
    overall_match_score: score,
    matched_skills: matched,
    missing_skills: missing,
    matched_count: matched.length,
    missing_count: missing.length,
    recommendations: [
      `Target preparation in top missing areas: ${missing.slice(0, 2).map((m) => m.jd_skill.skill_name).join(", ") || "Maintain current level"}`,
      "Review 10-level progression roadmaps in Talent Check module",
      `Highlighted strengths in ${matched.slice(0, 2).map((m) => m.candidate_skill.skill_name).join(" and ")}`,
    ],
    matched_at: new Date().toISOString(),
  };
}

export const SkillMatching: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [candidate] = useState<CandidateProfile>(() => loadCandidateProfile());
  const [selectedJd, setSelectedJd] = useState<JDAnalysisResult>(() => {
    if (location.state?.preloadedJd) {
      return location.state.preloadedJd;
    }
    return SAMPLE_MATCH_JDS[0].jd;
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [backendResult, setBackendResult] = useState<SkillMatchResponse | null>(null);

  const matchResult = useMemo<SkillMatchResponse>(() => {
    if (backendResult) return backendResult;
    return evaluateSkillMatchClient(candidate, selectedJd);
  }, [backendResult, candidate, selectedJd]);

  const handleRunMatch = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // 1. Try real backend endpoint
      const response = await runSkillMatchApi({
        candidate_id: candidate.id,
        jd_id: selectedJd.id || "jd_default",
      });
      setBackendResult(response);
    } catch {
      // Fallback deterministic client matching adapter
      const clientEval = evaluateSkillMatchClient(candidate, selectedJd);
      setBackendResult(clientEval);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-full pb-20 bg-background">
      {/* Page Header */}
      <RadixPageHeader
        moduleNumber="05"
        moduleName="SKILL MATCHING"
        title="CANDIDATE TO JOB DESCRIPTION MATCHING ENGINE"
        description="Cross-reference structured candidate competencies against specific Job Description requirements to generate match scores, matched skills, and priority missing areas."
        icon={GitCompare}
        actionContent={
          <Button onClick={handleRunMatch} disabled={isLoading} className="gap-2 font-bold">
            <Zap className="h-4 w-4" />
            <span>{isLoading ? "Matching Skills..." : "Re-Calculate Match"}</span>
          </Button>
        }
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-8 space-y-8">
        {/* Top Control Bar: Candidate & JD Selectors */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Candidate Card */}
          <Card className="rounded-sm border-2 border-foreground bg-card p-4 space-y-3 nb-shadow-sm">
            <div className="flex items-center justify-between border-b-2 border-foreground pb-2">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-[#4169E1]" />
                <span className="text-xs font-mono font-bold text-foreground">ACTIVE CANDIDATE</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/radix/profile-builder")}
                className="h-6 text-[10px] font-mono font-bold"
              >
                Edit Profile
              </Button>
            </div>

            <div className="space-y-1">
              <div className="text-sm font-bold text-foreground font-heading">{candidate.name}</div>
              <div className="text-xs text-muted-foreground">{candidate.headline}</div>
              <div className="flex items-center gap-2 text-[11px] font-mono text-muted-foreground pt-1">
                <span>{candidate.skills.length} Assessed Skills</span>
                <span>•</span>
                <span>{candidate.education[0]?.degree || "B.E. CSE"}</span>
              </div>
            </div>
          </Card>

          {/* JD Card & Selector */}
          <Card className="rounded-sm border-2 border-foreground bg-card p-4 space-y-3 nb-shadow-sm">
            <div className="flex items-center justify-between border-b-2 border-foreground pb-2">
              <div className="flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-primary" />
                <span className="text-xs font-mono font-bold text-foreground">TARGET JOB DESCRIPTION</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/radix/jd-analytics")}
                className="h-6 text-[10px] font-mono font-bold"
              >
                Paste New JD
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <label htmlFor="target-jd-select-input" className="sr-only">Target Job Description</label>
              <select
                id="target-jd-select-input"
                aria-label="Target Job Description"
                value={selectedJd.id || "jd_google_sde2"}
                onChange={(e) => {
                  const found = SAMPLE_MATCH_JDS.find((s) => s.id === e.target.value);
                  if (found) setSelectedJd(found.jd);
                }}
                className="w-full text-xs font-mono font-bold border-2 border-foreground rounded-sm p-2 bg-background text-foreground"
              >
                {SAMPLE_MATCH_JDS.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.company}: {s.title} ({s.jd.extracted_skills?.length || 0} skills)
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2 text-[11px] font-mono text-muted-foreground">
              <span>Company: {selectedJd.company?.company_name}</span>
              <span>•</span>
              <span>{selectedJd.extracted_skills?.length || 0} Required Skills</span>
            </div>
          </Card>
        </div>

        {/* State Displays */}
        {isLoading && (
          <LoadingState
            title="Calculating Skill Match..."
            message="Evaluating semantic similarity, proficiency levels, and weighted category alignment."
          />
        )}

        {error && (
          <ErrorState title="Skill Match Failed" message={error} onRetry={handleRunMatch} />
        )}

        {/* Match Output Dashboard */}
        {matchResult && !isLoading && (
          <div className="space-y-6">
            {/* KPI Summary Card */}
            <Card className="rounded-sm border-2 border-foreground bg-card nb-shadow-md overflow-hidden">
              <CardHeader className="p-5 pb-4 bg-secondary border-b-2 border-foreground">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <span className="text-xs font-mono font-bold text-[#4169E1] uppercase">
                      TALENT FIT EVALUATION
                    </span>
                    <CardTitle className="text-xl sm:text-2xl font-extrabold text-foreground font-heading">
                      MATCH RESULTS: {candidate.name} ↔ {selectedJd.role?.job_title || "Target Role"}
                    </CardTitle>
                  </div>

                  {/* Prominent Match Score */}
                  <div className="flex items-center gap-3 bg-card p-3 rounded-sm border-2 border-foreground nb-shadow-sm shrink-0">
                    <div className="font-mono font-extrabold text-4xl sm:text-5xl text-foreground flex items-baseline gap-1">
                      <CountUp to={matchResult.overall_match_score} duration={0.6} />
                      <span className="text-xl font-bold">%</span>
                    </div>
                    <div className="text-left font-mono">
                      <div className="text-[10px] text-muted-foreground font-bold uppercase">
                        MATCH SCORE
                      </div>
                      <Badge
                        className={cn(
                          "text-[10px] font-mono font-bold mt-0.5",
                          matchResult.overall_match_score >= 80
                            ? "bg-primary text-primary-foreground"
                            : matchResult.overall_match_score >= 60
                            ? "bg-[#4169E1] text-white"
                            : "bg-[#FF7657] text-foreground"
                        )}
                      >
                        {matchResult.overall_match_score >= 80
                          ? "STRONG MATCH"
                          : matchResult.overall_match_score >= 60
                          ? "MODERATE MATCH"
                          : "GAP IDENTIFIED"}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-5 space-y-6">
                {/* Matched vs Missing Skills Breakdown */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Matched Skills */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between pb-1.5 border-b-2 border-foreground">
                      <div className="flex items-center gap-2 text-xs font-bold font-mono text-foreground">
                        <CheckCircle2 className="h-4 w-4 text-primary" />
                        <span>MATCHED COMPETENCIES ({(matchResult.matched_skills || []).length})</span>
                      </div>
                      <span className="text-[10px] font-mono font-bold text-muted-foreground">
                        Candidate ↔ JD
                      </span>
                    </div>

                    <div className="space-y-2">
                      {(matchResult.matched_skills || []).map((m: MatchedSkillDetail, idx: number) => (
                        <div
                          key={idx}
                          className="rounded-sm border-2 border-foreground bg-secondary p-3 space-y-1.5"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-bold text-xs text-foreground font-heading">
                              {m.candidate_skill?.skill_name || "Candidate Skill"}
                            </span>
                            <CategoryBadge code={m.candidate_skill?.category_code || "OTHER"} />
                          </div>
                          <div className="flex items-center justify-between text-[11px] font-mono text-muted-foreground">
                            <span>Mapped to JD: <strong>{m.jd_skill?.skill_name || "JD Skill"}</strong></span>
                            <ConfidenceBadge confidence={m.candidate_skill?.confidence || "high"} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Missing Skills / Gaps */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between pb-1.5 border-b-2 border-foreground">
                      <div className="flex items-center gap-2 text-xs font-bold font-mono text-foreground">
                        <AlertTriangle className="h-4 w-4 text-[#FF7657]" />
                        <span>MISSING JD COMPETENCIES ({(matchResult.missing_skills || []).length})</span>
                      </div>
                      <span className="text-[10px] font-mono font-bold text-muted-foreground">
                        Preparation Required
                      </span>
                    </div>

                    <div className="space-y-2">
                      {(matchResult.missing_skills || []).length > 0 ? (
                        (matchResult.missing_skills || []).map((miss: MissingSkillDetail, idx: number) => (
                          <div
                            key={idx}
                            className="rounded-sm border-2 border-foreground bg-secondary p-3 space-y-1.5"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className="font-bold text-xs text-foreground font-heading">
                                {miss.jd_skill?.skill_name || "Missing Skill"}
                              </span>
                              <div className="flex items-center gap-1.5">
                                <CategoryBadge code={miss.category_code || "OTHER"} />
                                <Badge
                                  variant={miss.criticality === "high" ? "critical" : "important"}
                                  className="text-[9px]"
                                >
                                  {miss.criticality}
                                </Badge>
                              </div>
                            </div>
                            <div className="text-[11px] text-muted-foreground font-mono">
                              Suggested Roadmap: {miss.suggested_learning_topic}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="p-4 text-center text-xs font-mono font-bold text-primary bg-secondary rounded-sm border-2 border-foreground">
                          ✓ All JD skill requirements satisfied!
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Recommendations Banner */}
                {(matchResult.recommendations || []).length > 0 && (
                  <div className="rounded-sm border-2 border-foreground bg-secondary p-4 space-y-2.5">
                    <div className="flex items-center gap-2 text-xs font-bold font-mono text-foreground border-b-2 border-foreground pb-1.5">
                      <BookOpen className="h-4 w-4 text-[#4169E1]" />
                      <span>STRATEGIC PLACEMENT RECOMMENDATIONS</span>
                    </div>
                    <ul className="space-y-1.5 text-xs text-foreground font-medium">
                      {(matchResult.recommendations || []).map((rec: string, i: number) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-[#4169E1] font-bold mt-0.5">•</span>
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};
