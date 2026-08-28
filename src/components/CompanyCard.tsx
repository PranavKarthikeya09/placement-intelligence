import React, { useMemo } from "react";
import { ArrowRight, MapPin, Users } from "lucide-react";
import { CompanySummary, isNullish, getPlacementCategory } from "@/lib/companyData";
import { CompanyLogo } from "@/components/CompanyLogo";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface CompanyCardProps {
  company: CompanySummary;
  index?: number;
  onSelect: (company: CompanySummary) => void;
}

export const CompanyCard = React.memo<CompanyCardProps>(({ company, index, onSelect }) => {
  const placementCategory = useMemo(() => getPlacementCategory(company), [company]);

  const formatValue = (val?: string) => {
    if (isNullish(val)) {
      return <span className="italic text-muted-foreground">Not specified</span>;
    }
    return val;
  };

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

  const signals = useMemo(() => {
    const isSuper = placementCategory === "Super Dream";
    const isDream = placementCategory === "Dream";
    const isStandard = placementCategory === "Standard";
    const empNum = parseInt((company.employeeSize || "").replace(/[^0-9]/g, ""), 10) || 1000;

    const desc = (company.shortDescription || "").toLowerCase();
    const ind = (company.industry || "").toLowerCase();
    const hasHighTech = desc.includes("ai") || desc.includes("cloud") || desc.includes("technology") || ind.includes("tech");
    const aiLevel = hasHighTech ? (isSuper || isDream ? 5 : 4) : isSuper ? 5 : isDream ? 4 : 3;

    const isGlobal = company.headquarters && !company.headquarters.toLowerCase().includes("india");
    const globalLevel = isGlobal || isSuper ? 5 : isDream ? 4 : empNum > 10000 ? 4 : 3;

    const learningLevel = isSuper ? 5 : isDream ? 4 : isStandard ? 4 : 3;

    return [
      { name: "AI", level: aiLevel, activeColor: "bg-primary" },
      { name: "GLOBAL", level: globalLevel, activeColor: "bg-[#4169E1]" },
      { name: "LEARNING", level: learningLevel, activeColor: "bg-foreground" },
    ];
  }, [company, placementCategory]);

  const indexNumber = typeof index === "number" ? String(index + 1).padStart(2, "0") : null;

  return (
    <div
      onClick={() => onSelect(company)}
      className="group relative flex flex-col justify-between rounded-sm border-2 border-foreground bg-card p-5 cursor-pointer nb-shadow-md nb-card-hover select-none"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect(company);
        }
      }}
    >
      <div className="space-y-3.5">
        {/* Top Meta Line */}
        <div className="flex items-center justify-between gap-2 pb-2 border-b-2 border-foreground">
          <div className="flex items-center gap-2.5">
            {indexNumber && (
              <span className="font-mono text-xs font-bold text-muted-foreground">
                {indexNumber}
              </span>
            )}
            <CompanyLogo
              name={company.name}
              shortName={company.shortName}
              logoUrl={company.logoUrl}
              websiteUrl={company.websiteUrl}
              category={placementCategory}
              size="sm"
              className="rounded-sm shrink-0"
            />
          </div>
          <Badge
            variant={getCategoryVariant(placementCategory) as any}
            className="font-bold text-[10px] uppercase tracking-wider"
          >
            {placementCategory}
          </Badge>
        </div>

        {/* Company Title */}
        <div>
          <h3 className="font-heading text-base font-bold text-foreground leading-snug group-hover:text-[#4169E1]">
            {company.name}
          </h3>
          <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5 font-medium">
            {company.shortName && company.shortName !== company.name ? `${company.shortName} · ` : ""}
            {company.industry || "Enterprise Services"}
          </p>
        </div>

        {/* Metadata */}
        <div className="space-y-1.5 text-xs text-muted-foreground pt-1 font-medium">
          <div className="flex items-center gap-2">
            <MapPin className="h-3 w-3 text-muted-foreground shrink-0" />
            <span className="truncate">{formatValue(company.headquarters)}</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-3 w-3 text-muted-foreground shrink-0" />
            <span className="truncate">{formatValue(company.employeeSize)}</span>
          </div>
        </div>

        {/* Intelligence Indicators */}
        <div className="rounded-sm border-2 border-foreground bg-secondary p-2.5 space-y-1.5">
          <div className="flex items-center justify-between text-[10px] font-mono font-bold uppercase tracking-wider text-muted-foreground">
            <span>INTELLIGENCE</span>
            <span>SIGNALS</span>
          </div>

          <div className="space-y-1 text-[11px]">
            {signals.map((sig) => (
              <div key={sig.name} className="flex items-center justify-between font-mono">
                <span className="text-foreground text-[10px] font-bold">{sig.name}</span>
                <div className="flex gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span
                      key={i}
                      className={cn(
                        "h-2 w-2 rounded-none border border-foreground",
                        i < sig.level ? sig.activeColor : "bg-card"
                      )}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer CTA */}
      <div className="mt-4 pt-3 border-t-2 border-foreground flex items-center justify-between text-xs font-bold text-foreground group-hover:text-[#4169E1]">
        <span>Explore Intelligence</span>
        <ArrowRight className="h-3.5 w-3.5 transition-transform duration-100 group-hover:translate-x-1" />
      </div>
    </div>
  );
});

CompanyCard.displayName = "CompanyCard";
