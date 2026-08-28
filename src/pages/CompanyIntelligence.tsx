import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  ExternalLink,
  Globe,
  Building2,
  Compass,
  Users2,
  TrendingUp,
  Globe2,
  Layers,
  Cpu,
  Handshake,
  Swords,
  Rocket,
  Leaf,
  Smile,
  Newspaper,
  BarChart3,
  ShieldCheck,
  Navigation,
  HeartPulse,
  GraduationCap,
  Medal,
  Gift,
  Share2,
  Mail,
  Linkedin,
  Layers3,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { useCompany } from "@/context/CompanyContext";
import { buildIntelligenceSections } from "@/data/intelligenceData";
import { CompanyLogo } from "@/components/CompanyLogo";
import { FieldRow } from "@/components/IntelligenceFieldRenderer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cleanMarkdownUrl, IntelligenceSection } from "@/lib/companyData";
import { cn } from "@/lib/utils";
import {
  deriveCompanyFingerprint,
  deriveIntelligenceSignals,
  deriveIntelligenceBrief,
  deriveCompanyJourney,
  deriveTopSkills,
} from "@/lib/derivedIntelligence";
import { IntelligenceBrief } from "@/components/IntelligenceBrief";
import { CompanyFingerprint } from "@/components/CompanyFingerprint";
import { IntelligenceSignals } from "@/components/IntelligenceSignals";
import { CompanyJourney } from "@/components/CompanyJourney";
import { CompanySkillBridge } from "@/components/CompanySkillBridge";
import { motion, useReducedMotion } from "framer-motion";

// Icon mapping dictionary
const ICON_MAP: Record<string, React.ElementType> = {
  Building2,
  Compass,
  Users2,
  TrendingUp,
  Globe2,
  Layers,
  Cpu,
  Handshake,
  Swords,
  Rocket,
  Leaf,
  Smile,
  Newspaper,
  BarChart3,
  ShieldCheck,
  Navigation,
  HeartPulse,
  GraduationCap,
  Medal,
  Gift,
  Share2,
  Mail,
};

// Conceptual Section Categories Grouping
const SECTION_CATEGORIES = [
  {
    name: "THE COMPANY",
    description: "Corporate structure, leadership, global reach & financials",
    sectionIds: [
      "company-identity",
      "overview-vision",
      "leadership",
      "funding-financials",
      "global-presence",
    ],
  },
  {
    name: "WHAT THEY BUILD",
    description: "Enterprise products, technology stack, ecosystem & ESG",
    sectionIds: [
      "products-services",
      "technology-stack",
      "partnerships-ecosystem",
      "core-value-proposition-esg",
    ],
  },
  {
    name: "HOW THEY COMPETE",
    description: "Competitive differentiators, market size & client reach",
    sectionIds: [
      "competitive-landscape",
      "market-opportunity",
      "sales-customer-metrics",
      "recent-news-milestones",
    ],
  },
  {
    name: "WORKING THERE",
    description: "Workplace culture, commute, career progression & benefits",
    sectionIds: [
      "culture-work-life",
      "work-location-commute",
      "safety-wellbeing",
      "career-growth-learning",
      "compensation-benefits",
    ],
  },
  {
    name: "TRUST & REPUTATION",
    description: "Reputation rankings, digital sentiment, risk & contact channels",
    sectionIds: [
      "brand-reputation",
      "digital-presence-ratings",
      "risk-compliance",
      "contact-information",
    ],
  },
];

// Memoized Section Card Component
interface SectionCardProps {
  section: IntelligenceSection;
  index: number;
}

const IntelligenceSectionCard = React.memo<SectionCardProps>(({ section, index }) => {
  const shouldReduce = useReducedMotion();
  const IconComponent = ICON_MAP[section.iconName] || Building2;
  const sectionNumber = String(index + 1).padStart(2, "0");

  return (
    <div id={`section-${index}`} className="scroll-mt-36">
      <motion.div
        initial={{ opacity: shouldReduce ? 1 : 0, y: shouldReduce ? 0 : 8 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-15px" }}
        transition={{ duration: 0.35, ease: "easeOut" }}
      >
        <Card className="rounded-sm border-2 border-foreground bg-card overflow-hidden nb-shadow-md">
          <CardHeader className="bg-secondary border-b-2 border-foreground py-3.5 px-5 flex flex-row items-center justify-between space-y-0">
            <div className="flex items-center gap-3">
              <span className="font-mono font-bold text-xs text-primary-foreground bg-primary px-2 py-0.5 rounded-sm border border-foreground">
                {sectionNumber}
              </span>
              <div className="p-1.5 rounded-sm bg-card border-2 border-foreground text-foreground">
                <IconComponent className="h-3.5 w-3.5" />
              </div>
              <div>
                <CardTitle className="text-xs sm:text-sm font-bold text-foreground font-heading uppercase tracking-wide">
                  {section.title}
                </CardTitle>
                {section.description && (
                  <p className="text-[11px] text-muted-foreground mt-0.5 font-medium">
                    {section.description}
                  </p>
                )}
              </div>
            </div>
            <span className="text-[10px] font-mono font-bold bg-card text-foreground border-2 border-foreground px-2 py-0.5 rounded-sm">
              {section.fields.length} {section.fields.length === 1 ? "SIGNAL" : "SIGNALS"}
            </span>
          </CardHeader>
          <CardContent className="p-5">
            <dl className="space-y-0">
              {section.fields.map((field, idx) => (
                <FieldRow
                  key={idx}
                  field={field}
                  isLast={idx === section.fields.length - 1}
                />
              ))}
            </dl>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
});

IntelligenceSectionCard.displayName = "IntelligenceSectionCard";

export const CompanyIntelligence: React.FC = () => {
  const {
    companyProfile,
    companySummary,
    skills,
    isProfileLoading,
    profileError,
    refetchProfile,
  } = useCompany();
  const navigate = useNavigate();

  const [activeTabIdx, setActiveTabIdx] = useState(0);
  const isProgrammaticScrollRef = useRef(false);
  const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tabsContainerRef = useRef<HTMLDivElement>(null);
  const tabButtonRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // Guard against missing company
  useEffect(() => {
    if (!companySummary && !companyProfile && !isProfileLoading) {
      navigate("/", { replace: true });
    }
  }, [companySummary, companyProfile, isProfileLoading, navigate]);

  // Memoize sections schema (All 22 sections)
  const sections = useMemo(() => {
    return buildIntelligenceSections(companyProfile || undefined);
  }, [companyProfile]);

  // Memoize derived intelligence data
  const fingerprintDimensions = useMemo(() => {
    return deriveCompanyFingerprint(companyProfile || undefined);
  }, [companyProfile]);

  const intelligenceSignals = useMemo(() => {
    return deriveIntelligenceSignals(companyProfile || undefined);
  }, [companyProfile]);

  const intelligenceBrief = useMemo(() => {
    return deriveIntelligenceBrief(companyProfile || undefined);
  }, [companyProfile]);

  const companyJourney = useMemo(() => {
    return deriveCompanyJourney(companyProfile || undefined);
  }, [companyProfile]);

  const topSkills = useMemo(() => {
    return deriveTopSkills(skills, 5);
  }, [skills]);

  // Map each category to its sections
  const categorizedSections = useMemo(() => {
    return SECTION_CATEGORIES.map((category) => {
      const catSections = sections.filter((s) => category.sectionIds.includes(s.id));
      return {
        ...category,
        sections: catSections,
      };
    });
  }, [sections]);

  // Helper to center the active tab button in the horizontal tabs container
  const centerTabHorizontally = useCallback((idx: number) => {
    const tabBtn = tabButtonRefs.current[idx];
    const container = tabsContainerRef.current;
    if (tabBtn && container) {
      const btnLeft = tabBtn.offsetLeft;
      const btnWidth = tabBtn.offsetWidth;
      const containerWidth = container.offsetWidth;
      const targetScrollLeft = btnLeft - containerWidth / 2 + btnWidth / 2;
      container.scrollTo({
        left: Math.max(0, targetScrollLeft),
        behavior: "smooth",
      });
    }
  }, []);

  // Programmatic tab click scroll-to-section handler
  const scrollToSection = useCallback((idx: number) => {
    isProgrammaticScrollRef.current = true;
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    setActiveTabIdx(idx);
    centerTabHorizontally(idx);

    const el = document.getElementById(`section-${idx}`);
    if (el) {
      const stickyHeader = document.querySelector(".sticky") as HTMLElement | null;
      const stickyHeight = stickyHeader ? stickyHeader.offsetHeight : 110;
      const topPos = el.getBoundingClientRect().top + window.pageYOffset - stickyHeight - 16;

      window.scrollTo({
        top: Math.max(0, topPos),
        behavior: "smooth",
      });
    }

    scrollTimeoutRef.current = setTimeout(() => {
      isProgrammaticScrollRef.current = false;
    }, 800);
  }, [centerTabHorizontally]);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  // Scroll-spy effect
  useEffect(() => {
    const handleScroll = () => {
      if (isProgrammaticScrollRef.current) return;

      const sectionElements = sections.map((_, idx) =>
        document.getElementById(`section-${idx}`)
      );

      const stickyHeader = document.querySelector(".sticky") as HTMLElement | null;
      const stickyHeight = stickyHeader ? stickyHeader.offsetHeight : 110;
      const scrollPos = window.scrollY + stickyHeight + 40;

      for (let i = sectionElements.length - 1; i >= 0; i--) {
        const el = sectionElements[i];
        if (el && el.offsetTop <= scrollPos) {
          setActiveTabIdx((prev) => {
            if (prev !== i) {
              centerTabHorizontally(i);
              return i;
            }
            return prev;
          });
          break;
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [sections, centerTabHorizontally]);

  if (profileError) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="inline-flex p-3 rounded-none bg-destructive text-destructive-foreground border-2 border-foreground nb-shadow-sm">
          <AlertCircle className="h-8 w-8" />
        </div>
        <h2 className="text-xl font-bold text-foreground font-heading">
          Unable to load company intelligence
        </h2>
        <p className="text-sm text-muted-foreground max-w-md mx-auto font-medium">
          We encountered an error retrieving company research profiles from Supabase.
        </p>
        <div className="flex justify-center gap-3">
          <Button onClick={() => refetchProfile()} variant="outline" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            <span>Retry</span>
          </Button>
          <Button onClick={() => navigate("/")} variant="secondary">
            Back to Directory
          </Button>
        </div>
      </div>
    );
  }

  if (!companySummary && isProfileLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-6">
        <Skeleton className="h-28 w-full rounded-sm" />
        <Skeleton className="h-64 w-full rounded-sm" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Skeleton className="h-48 rounded-sm" />
          <Skeleton className="h-48 rounded-sm" />
          <Skeleton className="h-48 rounded-sm" />
        </div>
      </div>
    );
  }

  if (!companySummary) {
    return null;
  }

  const websiteUrl = cleanMarkdownUrl(companySummary.websiteUrl);
  const linkedinUrl = cleanMarkdownUrl(companySummary.linkedinUrl);

  const getCategoryVariant = (cat: string) => {
    switch (cat) {
      case "Super Dream":
        return "super-dream";
      case "Dream":
        return "dream";
      case "Standard":
        return "standard";
      case "Regular":
        return "regular";
      default:
        return "dream";
    }
  };

  return (
    <div className="min-h-full pb-20 bg-background">
      {/* Sticky Company Info Header */}
      <div className="sticky top-13 z-20 bg-card border-b-[3px] border-foreground nb-shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3">
          {/* Left info */}
          <div className="flex items-center gap-3">
            <CompanyLogo
              name={companySummary.name}
              shortName={companySummary.shortName}
              logoUrl={companySummary.logoUrl}
              websiteUrl={companySummary.websiteUrl}
              category={companySummary.category}
              size="md"
            />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-heading text-base sm:text-lg font-bold text-foreground leading-tight">
                  {companySummary.name}
                </h1>
                <Badge
                  variant={getCategoryVariant(companySummary.category) as any}
                  className="text-[10px] uppercase font-bold"
                >
                  {companySummary.category}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5 font-medium">
                {companySummary.industry} · {companySummary.headquarters} · {companySummary.employeeSize}
              </p>
            </div>
          </div>

          {/* Right external links */}
          <div className="flex items-center gap-2">
            {websiteUrl && (
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 text-xs font-bold bg-card text-foreground hover:bg-secondary h-8"
                asChild
              >
                <a href={websiteUrl} target="_blank" rel="noopener noreferrer">
                  <Globe className="h-3.5 w-3.5" />
                  <span>Website</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </Button>
            )}

            {linkedinUrl && (
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 text-xs font-bold bg-card text-foreground hover:bg-secondary h-8"
                asChild
              >
                <a href={linkedinUrl} target="_blank" rel="noopener noreferrer">
                  <Linkedin className="h-3.5 w-3.5 text-[#0A66C2]" />
                  <span>LinkedIn</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </Button>
            )}
          </div>
        </div>

        {/* Sticky Section Tabs Bar */}
        <div
          ref={tabsContainerRef}
          className="border-t-2 border-foreground overflow-x-auto no-scrollbar scroll-smooth bg-card"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center gap-1.5 py-1.5 min-w-max">
            {sections.map((section, idx) => {
              const isActive = activeTabIdx === idx;
              const IconComponent = ICON_MAP[section.iconName] || Building2;
              const sectionNumber = String(idx + 1).padStart(2, "0");

              return (
                <button
                  key={section.id}
                  ref={(el) => (tabButtonRefs.current[idx] = el)}
                  onClick={() => scrollToSection(idx)}
                  className={cn(
                    "flex items-center gap-1.5 px-2.5 py-1 rounded-sm text-xs whitespace-nowrap border-2 font-bold transition-all duration-100",
                    isActive
                      ? "bg-primary text-primary-foreground border-foreground nb-shadow-sm -translate-y-0.5"
                      : "text-muted-foreground border-transparent hover:bg-secondary hover:text-foreground hover:border-foreground"
                  )}
                >
                  <IconComponent
                    className={cn(
                      "h-3 w-3 shrink-0",
                      isActive ? "text-primary-foreground" : "text-muted-foreground"
                    )}
                  />
                  <span className="font-mono text-[10px]">{sectionNumber}</span>
                  <span>{section.title}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-8 space-y-10">
        {/* 1. Intelligence Brief */}
        <IntelligenceBrief brief={intelligenceBrief} />

        {/* 2. Company Fingerprint Radar Chart */}
        <CompanyFingerprint
          dimensions={fingerprintDimensions}
          companyName={companySummary.name}
        />

        {/* 3. Derived Intelligence Signals */}
        <IntelligenceSignals signals={intelligenceSignals} />

        {/* 4. Company Journey & Strategic Milestones */}
        <CompanyJourney
          milestones={companyJourney}
          companyName={companySummary.name}
        />

        {/* 5. Company DNA + Skill Connection */}
        <CompanySkillBridge
          topSkills={topSkills}
          companyName={companySummary.name}
        />

        {/* 6. All 22 Intelligence Sections Grouped under 5 Conceptual Headers */}
        <div className="space-y-10 pt-2">
          <div className="flex items-center justify-between pb-2 border-b-2 border-foreground">
            <div>
              <h2 className="font-heading text-lg font-bold text-foreground flex items-center gap-2">
                <Layers3 className="h-4 w-4 text-primary" />
                <span>COMPREHENSIVE RESEARCH DIRECTORY (22 SECTIONS)</span>
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5 font-medium">
                Structured organizational intelligence categorized across 5 strategic operational domains
              </p>
            </div>
            <span className="text-[11px] font-mono font-bold text-foreground bg-secondary px-2.5 py-1 rounded-sm border-2 border-foreground">
              22 SECTIONS
            </span>
          </div>

          {categorizedSections.map((category) => (
            <section key={category.name} className="space-y-4">
              {/* Category Header */}
              <div className="flex items-center justify-between bg-secondary px-4 py-2.5 rounded-sm border-2 border-foreground nb-shadow-sm">
                <div>
                  <h3 className="font-heading text-xs sm:text-sm font-bold text-foreground tracking-wide uppercase">
                    {category.name}
                  </h3>
                  <p className="text-[11px] text-muted-foreground font-medium">
                    {category.description}
                  </p>
                </div>
                <span className="text-[10px] font-bold font-mono text-foreground bg-card px-2 py-0.5 rounded-sm border-2 border-foreground">
                  {category.sections.length} Sections
                </span>
              </div>

              {/* Sections under this category */}
              <div className="space-y-5">
                {category.sections.map((section) => {
                  const globalIdx = sections.findIndex((s) => s.id === section.id);
                  return (
                    <IntelligenceSectionCard
                      key={section.id}
                      section={section}
                      index={globalIdx >= 0 ? globalIdx : 0}
                    />
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
};
