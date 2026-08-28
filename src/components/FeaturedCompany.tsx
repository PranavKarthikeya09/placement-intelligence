import React, { useMemo } from "react";
import { ArrowRight, MapPin, Users, Globe2, Zap } from "lucide-react";
import { CompanySummary, CompanyProfile, getPlacementCategory } from "@/lib/companyData";
import { CompanyLogo } from "@/components/CompanyLogo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { deriveCompanyFingerprint } from "@/lib/derivedIntelligence";
import { motion, useReducedMotion } from "framer-motion";

interface FeaturedCompanyProps {
  company: CompanySummary;
  profile?: CompanyProfile;
  onExplore: (company: CompanySummary) => void;
}

export const FeaturedCompany: React.FC<FeaturedCompanyProps> = React.memo(
  ({ company, profile, onExplore }) => {
    const shouldReduce = useReducedMotion();
    const placementTier = useMemo(() => getPlacementCategory(company), [company]);

    const dimensions = useMemo(() => {
      if (profile && profile.summary?.id === company.id) {
        return deriveCompanyFingerprint(profile);
      }
      const empNum = parseInt((company.employeeSize || "").replace(/[^0-9]/g, ""), 10) || 1000;
      const isSuper = placementTier === "Super Dream";
      const isDream = placementTier === "Dream";

      return [
        { dimension: "Global Exposure", score: isSuper ? 96 : isDream ? 90 : empNum > 10000 ? 84 : 75, fullMark: 100, description: "Operating presence & international reach" },
        { dimension: "Technology & AI", score: isSuper ? 94 : isDream ? 88 : 78, fullMark: 100, description: "Applied tech stack & innovation velocity" },
        { dimension: "Learning & Growth", score: isSuper ? 92 : isDream ? 86 : 80, fullMark: 100, description: "Internal upskilling & progression clarity" },
        { dimension: "Enterprise Scale", score: empNum >= 100000 ? 98 : empNum >= 10000 ? 88 : 76, fullMark: 100, description: "Workforce scale & enterprise client footprint" },
      ];
    }, [profile, company, placementTier]);

    const getCategoryVariant = (cat: string) => {
      switch (cat) {
        case "Super Dream": return "super-dream";
        case "Dream": return "dream";
        case "Standard": return "standard";
        case "Regular": return "regular";
        default: return "dream";
      }
    };

    return (
      <motion.section
        initial={{ opacity: shouldReduce ? 1 : 0, y: shouldReduce ? 0 : 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-20px" }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="rounded-sm border-[3px] border-foreground bg-card p-6 sm:p-7 nb-shadow-lg space-y-6 relative select-none"
      >
        {/* Top Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b-2 border-foreground">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-foreground font-mono">
              FEATURED COMPANY SPOTLIGHT
            </span>
          </div>
          <span className="text-[11px] font-mono font-bold text-muted-foreground border-2 border-foreground px-2 py-0.5 rounded-sm bg-secondary">
            CAMPUS BENCHMARK
          </span>
        </div>

        {/* Main Info Body */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Left info */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-start gap-4">
              <CompanyLogo
                name={company.name}
                shortName={company.shortName}
                logoUrl={company.logoUrl}
                websiteUrl={company.websiteUrl}
                category={placementTier}
                size="lg"
                className="shrink-0 rounded-sm"
              />
              <div className="space-y-1">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h3 className="font-heading text-xl sm:text-2xl font-bold text-foreground leading-tight">
                    {company.name}
                  </h3>
                  <Badge
                    variant={getCategoryVariant(placementTier) as any}
                    className="text-[11px] font-bold uppercase tracking-wider"
                  >
                    {placementTier}
                  </Badge>
                </div>
                <p className="text-xs sm:text-sm font-medium text-muted-foreground">
                  {company.shortName} · {company.industry}
                </p>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-foreground leading-relaxed max-w-2xl font-medium">
              {company.shortDescription ||
                `${company.name} is an active campus recruitment partner offering structured technology roles, global operational engagement, and continuous professional development pathways.`}
            </p>

            {/* Key research signal tiles */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
              <div className="rounded-sm border-2 border-foreground bg-secondary p-2.5 space-y-0.5">
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground font-mono uppercase">
                  <MapPin className="h-3 w-3" />
                  <span>HQ</span>
                </div>
                <div className="text-xs font-bold text-foreground truncate" title={company.headquarters}>
                  {company.headquarters || "Global"}
                </div>
              </div>

              <div className="rounded-sm border-2 border-foreground bg-secondary p-2.5 space-y-0.5">
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground font-mono uppercase">
                  <Users className="h-3 w-3" />
                  <span>Scale</span>
                </div>
                <div className="text-xs font-bold text-foreground truncate">
                  {company.employeeSize || "Enterprise"}
                </div>
              </div>

              <div className="rounded-sm border-2 border-foreground bg-secondary p-2.5 space-y-0.5">
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#4169E1] font-mono uppercase">
                  <Globe2 className="h-3 w-3" />
                  <span>Global</span>
                </div>
                <div className="text-xs font-bold text-foreground truncate">
                  Multi-Region
                </div>
              </div>

              <div className="rounded-sm border-2 border-foreground bg-secondary p-2.5 space-y-0.5">
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-foreground font-mono uppercase">
                  <Zap className="h-3 w-3" />
                  <span>Tech</span>
                </div>
                <div className="text-xs font-bold text-foreground truncate">
                  Modern Stack
                </div>
              </div>
            </div>
          </div>

          {/* Right Signal Progress Strip */}
          <div className="lg:col-span-5 rounded-sm border-2 border-foreground bg-secondary p-4.5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b-2 border-foreground">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-muted-foreground">
                INTELLIGENCE SIGNALS
              </span>
              <span className="text-[11px] font-mono text-muted-foreground font-bold">Derived</span>
            </div>

            <div className="space-y-2.5 text-xs">
              {dimensions.slice(0, 4).map((dim, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between font-medium text-foreground">
                    <span className="text-xs text-foreground font-bold">{dim.dimension}</span>
                    <span className="font-mono font-bold text-foreground">{dim.score} / 100</span>
                  </div>
                  <div className="h-2 w-full bg-card rounded-none overflow-hidden border-2 border-foreground">
                    <motion.div
                      className="h-full rounded-none bg-primary"
                      initial={{ width: shouldReduce ? `${dim.score}%` : 0 }}
                      whileInView={{ width: `${dim.score}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.6, delay: idx * 0.08, ease: "easeOut" }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <Button
              onClick={() => onExplore(company)}
              className="w-full gap-2 font-bold text-xs h-10"
            >
              <span>Explore Company Intelligence</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </motion.section>
    );
  }
);

FeaturedCompany.displayName = "FeaturedCompany";
