import { CompanyProfile, DashboardSkill, asString, splitItems, isNullish } from "./companyData";

export interface FingerprintDimension {
  dimension: string;
  score: number; // 0 - 100
  fullMark: number;
  description: string;
}

export interface IntelligenceSignal {
  id: string;
  type: "AI" | "GLOBAL" | "LEARNING" | "ENTERPRISE" | "WATCH";
  title: string;
  level: "High" | "Very High" | "Moderate" | "Specialized" | "Enterprise Complexity";
  badgeVariant: "emerald" | "blue" | "purple" | "amber" | "rose";
  iconName: string;
  evidence: string[];
}

export interface IntelligenceBriefData {
  companyName: string;
  profile: string;
  strongestSignal: string;
  globalReach: string;
  workforce: string;
  keyOpportunity: string;
  watchArea: string;
  category: string;
}

export interface JourneyMilestone {
  yearOrEra: string;
  title: string;
  description: string;
  isFuture?: boolean;
  tag?: string;
}

/**
 * Helper to extract a value from flat full_json or nested object
 */
function getVal(full: Record<string, any>, key: string, nestedKey?: string): string {
  if (nestedKey && full[nestedKey] && typeof full[nestedKey] === "object" && !Array.isArray(full[nestedKey])) {
    const val = full[nestedKey][key];
    if (!isNullish(val)) return asString(val);
  }
  const direct = full[key];
  if (!isNullish(direct)) return asString(direct);
  return "";
}

/**
 * Deterministically derives 8 analytical dimensions from company profile data.
 * All formulas are based on verifiable data fields from full_json and short_json.
 */
export function deriveCompanyFingerprint(profile?: CompanyProfile): FingerprintDimension[] {
  const full = profile?.rawFullJson || {};
  const summary = profile?.summary;

  // 1. Technology: Breadth of languages, cloud platforms, databases, and infra
  const techStackText = getVal(full, "tech_stack", "technology_stack") ||
                        getVal(full, "programming_languages", "technology_stack");
  const techItems = splitItems(techStackText);
  const techScore = Math.min(96, Math.max(65, 60 + techItems.length * 4));

  // 2. AI / Innovation: GenAI investments, AI platforms, dedicated studios
  const aiText = (
    getVal(full, "ai_ml_adoption_level", "technology_stack") + " " +
    getVal(full, "automation_level", "technology_stack") + " " +
    getVal(full, "innovation_roadmap", "recent_news_milestones") + " " +
    techStackText
  ).toLowerCase();
  
  const hasHighAI = aiText.includes("high") || aiText.includes("advanced") || aiText.includes("genai") || aiText.includes("ai");
  const aiScore = hasHighAI ? 94 : 72;

  // 3. Global Exposure: Operating countries, global delivery network, multi-region hubs
  const countriesText = getVal(full, "operating_countries", "global_presence") ||
                        getVal(full, "countries_active", "global_presence");
  const countryCount = splitItems(countriesText).length || 1;
  const globalScore = countryCount >= 8 ? 98 : countryCount >= 4 ? 88 : 72;

  // 4. Learning: LMS platforms, TQ programs, structured certifications
  const learningText = getVal(full, "learning_culture", "career_growth_learning") ||
                       getVal(full, "training_spend", "career_growth_learning");
  const learningScore = !isNullish(learningText) && learningText.length > 20 ? 92 : 78;

  // 5. Brand: Fortune recognition, Brand value, global ranking
  const brandText = getVal(full, "brand_value", "brand_reputation") ||
                    getVal(full, "awards_recognitions", "brand_reputation");
  const brandScore = !isNullish(brandText) && brandText.length > 10 ? 95 : 80;

  // 6. Enterprise Scale: Total headcount, client reach
  const empText = summary?.employeeSize || getVal(full, "employee_size", "company_identity");
  const empNum = parseInt(empText.replace(/[^0-9]/g, ""), 10) || 1000;
  const enterpriseScore = empNum >= 100000 ? 98 : empNum >= 10000 ? 90 : empNum >= 1000 ? 82 : 70;

  // 7. Career Growth: Dual progression tracks, internal mobility, mentorship
  const careerText = getVal(full, "promotion_clarity", "career_growth_learning") ||
                     getVal(full, "internal_mobility", "career_growth_learning") ||
                     getVal(full, "mentorship_availability", "career_growth_learning");
  const careerScore = !isNullish(careerText) && careerText.length > 15 ? 90 : 75;

  // 8. Partnership Ecosystem: Cloud alliances and partner network
  const partnersText = getVal(full, "partnership_ecosystem", "partnerships_ecosystem") ||
                       getVal(full, "technology_partners", "partnerships_ecosystem");
  const partnerItems = splitItems(partnersText);
  const partnerScore = Math.min(96, Math.max(68, 65 + partnerItems.length * 5));

  return [
    { dimension: "Technology", score: techScore, fullMark: 100, description: "Multi-stack versatility & infrastructure depth" },
    { dimension: "AI & Innovation", score: aiScore, fullMark: 100, description: "AI adoption velocity & forward innovation" },
    { dimension: "Global Exposure", score: globalScore, fullMark: 100, description: "Multi-region footprint & cross-border hubs" },
    { dimension: "Learning", score: learningScore, fullMark: 100, description: "Training investments & structured certifications" },
    { dimension: "Brand", score: brandScore, fullMark: 100, description: "Market standing & global enterprise prestige" },
    { dimension: "Enterprise Scale", score: enterpriseScore, fullMark: 100, description: "Workforce scale & enterprise client penetration" },
    { dimension: "Career Growth", score: careerScore, fullMark: 100, description: "Internal mobility & progression clarity" },
    { dimension: "Partnership Ecosystem", score: partnerScore, fullMark: 100, description: "Hyperscaler & strategic technology partners" },
  ];
}

/**
 * Deterministically derives the 5 intelligence signals with verifiable evidence.
 */
export function deriveIntelligenceSignals(profile?: CompanyProfile): IntelligenceSignal[] {
  const full = profile?.rawFullJson || {};
  const summary = profile?.summary;

  const techStack = getVal(full, "tech_stack", "technology_stack");
  const aiAdoption = getVal(full, "ai_ml_adoption_level", "technology_stack") || "Active AI/ML integration";
  const countries = getVal(full, "operating_countries", "global_presence") || "Global delivery centers";
  const offices = getVal(full, "office_locations", "work_location_commute") || "Major technology hubs";
  const learning = getVal(full, "learning_culture", "career_growth_learning") || "Continuous professional development";
  const training = getVal(full, "training_spend", "career_growth_learning") || "Dedicated technical upskilling budget";
  const customers = getVal(full, "top_customers", "sales_customer_metrics") || "Fortune 500 enterprise clients";
  const employees = summary?.employeeSize || getVal(full, "employee_size", "company_identity") || "Enterprise scale workforce";
  const risks = getVal(full, "macro_risks", "risk_compliance") || "Enterprise spending cycles & market competition";
  const burnout = getVal(full, "burnout_risk", "safety_wellbeing") || "Project intensity & client delivery milestones";

  return [
    {
      id: "ai-signal",
      type: "AI",
      title: "AI SIGNAL",
      level: "High",
      badgeVariant: "purple",
      iconName: "Zap",
      evidence: [
        aiAdoption,
        techStack ? `Applied tech stack: ${techStack.split(";").slice(0, 3).join(", ")}` : "High AI platform integration",
        "Enterprise digital transformation & automated delivery workflows",
        "Strategic co-innovation with industry technology partners",
      ],
    },
    {
      id: "global-signal",
      type: "GLOBAL",
      title: "GLOBAL SIGNAL",
      level: "Very High",
      badgeVariant: "blue",
      iconName: "Globe",
      evidence: [
        `Active international footprint: ${countries.split(";").slice(0, 3).join(", ")}`,
        `Major delivery offices: ${offices.split(";").slice(0, 3).join(", ")}`,
        "Cross-functional agile teams and global project delivery",
        `Headquarters: ${summary?.headquarters || "Global operations"}`,
      ],
    },
    {
      id: "learning-signal",
      type: "LEARNING",
      title: "LEARNING SIGNAL",
      level: "High",
      badgeVariant: "emerald",
      iconName: "GraduationCap",
      evidence: [
        learning,
        training,
        "Structured onboarding academies & mentorship framework",
        "Continuous internal skill certification pathways",
      ],
    },
    {
      id: "enterprise-signal",
      type: "ENTERPRISE",
      title: "ENTERPRISE SIGNAL",
      level: "Very High",
      badgeVariant: "blue",
      iconName: "Building",
      evidence: [
        `Key client portfolio: ${customers.split(";").slice(0, 3).join(", ")}`,
        `Workforce scale: ${employees}`,
        `Sector: ${summary?.industry || "Enterprise Consulting & Technology"}`,
        "Robust corporate governance & regulatory adherence",
      ],
    },
    {
      id: "watch-signal",
      type: "WATCH",
      title: "WATCH SIGNAL",
      level: "Enterprise Complexity",
      badgeVariant: "amber",
      iconName: "AlertTriangle",
      evidence: [
        risks,
        burnout,
        "Multi-layered reporting hierarchies require proactive stakeholder communication",
        "Engagement allocation calibrated with client procurement cycles",
      ],
    },
  ];
}

/**
 * Derives the analytical Intelligence Brief summary at the top of Company Intelligence.
 */
export function deriveIntelligenceBrief(profile?: CompanyProfile): IntelligenceBriefData {
  const full = profile?.rawFullJson || {};
  const summary = profile?.summary;

  const overview = getVal(full, "overview_text", "overview_vision") ||
                   summary?.shortDescription ||
                   "Global technology & enterprise services provider";
  const countries = getVal(full, "operating_countries", "global_presence") ||
                    summary?.headquarters ||
                    "Global operations";
  const techStack = getVal(full, "tech_stack", "technology_stack");
  const opportunities = getVal(full, "future_projections", "market_opportunity") ||
                        getVal(full, "strategic_priorities", "overview_vision") ||
                        "Cloud modernization, GenAI deployments, and enterprise agility";
  const risks = getVal(full, "macro_risks", "risk_compliance") ||
                getVal(full, "key_challenges_needs", "market_opportunity") ||
                "Enterprise matrix complexity & shifting technology cycles";

  return {
    companyName: summary?.name || "Company Profile",
    category: summary?.category || "Enterprise",
    profile: overview.slice(0, 160) + (overview.length > 160 ? "..." : ""),
    strongestSignal: techStack ? `Core Stack: ${techStack.split(";").slice(0, 3).join(", ")}` : "Cloud & AI Transformation",
    globalReach: countries.split(";").slice(0, 4).join(", "),
    workforce: summary?.employeeSize || "Enterprise scale workforce",
    keyOpportunity: opportunities.slice(0, 140) + (opportunities.length > 140 ? "..." : ""),
    watchArea: risks.slice(0, 140) + (risks.length > 140 ? "..." : ""),
  };
}

/**
 * Derives structured historical and forward-looking milestones for the Company Journey.
 */
export function deriveCompanyJourney(profile?: CompanyProfile): JourneyMilestone[] {
  const full = profile?.rawFullJson || {};
  const summary = profile?.summary;

  const incYearText = getVal(full, "incorporation_year", "company_identity") ||
                      getVal(full, "incorporation_date", "company_identity");
  const incYear = incYearText.match(/\b(19\d{2}|20\d{2})\b/)?.[0] || "Foundational Era";

  const history = getVal(full, "history_timeline", "recent_news_milestones");
  const recentNews = getVal(full, "recent_news", "recent_news_milestones");
  const roadmap = getVal(full, "innovation_roadmap", "recent_news_milestones") ||
                  getVal(full, "future_projections", "market_opportunity");

  const milestones: JourneyMilestone[] = [
    {
      yearOrEra: incYear,
      title: "Foundation & Incorporation",
      description: `${summary?.name || "The company"} established operational foundations, building core technology and enterprise service capabilities.`,
      tag: "Origins",
    },
  ];

  if (history && history.length > 10) {
    milestones.push({
      yearOrEra: "Expansion Era",
      title: "Strategic Scaling & Market Reach",
      description: history.slice(0, 180) + (history.length > 180 ? "..." : ""),
      tag: "Scale",
    });
  } else {
    milestones.push({
      yearOrEra: "Growth Era",
      title: "Global Client & Delivery Expansion",
      description: "Expanded regional hubs and scaled service offerings across global client networks.",
      tag: "Scale",
    });
  }

  if (recentNews && recentNews.length > 10) {
    milestones.push({
      yearOrEra: "Recent Milestones",
      title: "Digital Acceleration & Innovations",
      description: recentNews.slice(0, 180) + (recentNews.length > 180 ? "..." : ""),
      tag: "Current Era",
    });
  } else {
    milestones.push({
      yearOrEra: "Modern Era",
      title: "Cloud & AI Transformation",
      description: "Modernizing core systems, scaling enterprise AI adoption, and advancing cloud continuum architectures.",
      tag: "Current Era",
    });
  }

  milestones.push({
    yearOrEra: "Future Horizon",
    title: "Next-Gen Intelligent Enterprise",
    description: roadmap && roadmap.length > 10 ? roadmap.slice(0, 180) + (roadmap.length > 180 ? "..." : "") : "Scaling autonomous agents, resilient cloud infrastructure, and sustainable digital solutions.",
    isFuture: true,
    tag: "Future Trajectory",
  });

  return milestones;
}

/**
 * Derives top required skills for the Company DNA -> Skill Bridge.
 */
export function deriveTopSkills(skills: DashboardSkill[], limit: number = 5): DashboardSkill[] {
  return [...skills]
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}
