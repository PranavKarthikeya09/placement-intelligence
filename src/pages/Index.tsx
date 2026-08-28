import React, { useState, useMemo, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  X,
  Building2,
  RefreshCw,
  LayoutGrid,
  AlertCircle,
  Briefcase,
  Layers,
  MapPin,
  RotateCcw,
} from "lucide-react";
import { useCompany } from "@/context/CompanyContext";
import { CompanySummary, getPlacementCategory } from "@/lib/companyData";
import { CompanyCard } from "@/components/CompanyCard";
import { PlacementIntelligenceIntro } from "@/components/PlacementIntelligenceIntro";
import { FeaturedCompany } from "@/components/FeaturedCompany";
import { SearchableFilterDropdown, FilterOption } from "@/components/SearchableFilterDropdown";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { cn } from "@/lib/utils";
import { SplitText } from "@/components/motion/SplitText";
import { ResearchIndexCard } from "@/components/ResearchIndexCard";

const PLACEMENT_TIERS = ["All", "Super Dream", "Dream", "Standard", "Regular"] as const;
type PlacementTierFilter = (typeof PLACEMENT_TIERS)[number];

export const Index: React.FC = () => {
  const {
    allCompaniesSummary,
    setSelectedCompanyById,
    isLoading,
    isError,
    refetchCompanies,
    companyProfile,
  } = useCompany();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  // Primary Placement Tier Filter
  const [selectedPlacementTier, setSelectedPlacementTier] = useState<PlacementTierFilter>("All");

  // Secondary Filters
  const [selectedIndustry, setSelectedIndustry] = useState<string>("All");
  const [selectedCompanyType, setSelectedCompanyType] = useState<string>("All");
  const [selectedLocation, setSelectedLocation] = useState<string>("All");

  // Debounce search by 200ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery.trim().toLowerCase());
    }, 200);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Handle company selection
  const handleSelectCompany = (company: CompanySummary) => {
    setSelectedCompanyById(company.id);
    navigate("/company/intelligence");
  };

  // 1. Dynamic Counts for Primary Placement Tiers
  const placementTierCounts = useMemo(() => {
    const counts: Record<string, number> = {
      All: allCompaniesSummary.length,
      "Super Dream": 0,
      Dream: 0,
      Standard: 0,
      Regular: 0,
    };

    allCompaniesSummary.forEach((c) => {
      const tier = getPlacementCategory(c);
      if (counts[tier] !== undefined) {
        counts[tier] += 1;
      }
    });

    return counts;
  }, [allCompaniesSummary]);

  // 2. Dynamic Industry Options with Counts
  const industryOptions: FilterOption[] = useMemo(() => {
    const map = new Map<string, number>();

    allCompaniesSummary.forEach((c) => {
      const ind = c.industry?.trim();
      if (ind) {
        map.set(ind, (map.get(ind) || 0) + 1);
      }
      const cat = c.category?.trim();
      if (cat && cat !== ind && !PLACEMENT_TIERS.includes(cat as any)) {
        map.set(cat, (map.get(cat) || 0) + 1);
      }
    });

    return Array.from(map.entries())
      .map(([value, count]) => ({ label: value, value, count }))
      .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
  }, [allCompaniesSummary]);

  // 3. Dynamic Company Type Options with Counts
  const companyTypeOptions: FilterOption[] = useMemo(() => {
    const map = new Map<string, number>();

    allCompaniesSummary.forEach((c) => {
      const raw = c.category?.trim();
      if (raw && !PLACEMENT_TIERS.includes(raw as any)) {
        map.set(raw, (map.get(raw) || 0) + 1);
      }
    });

    return Array.from(map.entries())
      .map(([value, count]) => ({ label: value, value, count }))
      .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
  }, [allCompaniesSummary]);

  // 4. Dynamic Location Options with Counts
  const locationOptions: FilterOption[] = useMemo(() => {
    const map = new Map<string, number>();

    allCompaniesSummary.forEach((c) => {
      const hq = c.headquarters?.trim();
      if (hq) {
        let cleanLoc = hq;
        if (hq.includes(",")) {
          const parts = hq.split(",").map((p) => p.trim());
          cleanLoc = parts[parts.length - 1] || hq;
          if (cleanLoc.toLowerCase() === "india" && parts.length > 1) {
            cleanLoc = parts[0] + ", India";
          } else if (cleanLoc.toLowerCase().includes("usa") && parts.length > 1) {
            cleanLoc = parts[0] + ", USA";
          }
        }
        map.set(cleanLoc, (map.get(cleanLoc) || 0) + 1);
      }
    });

    return Array.from(map.entries())
      .map(([value, count]) => ({ label: value, value, count }))
      .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
  }, [allCompaniesSummary]);

  // Combined Filter Execution
  const filteredCompanies = useMemo(() => {
    return allCompaniesSummary.filter((company) => {
      if (selectedPlacementTier !== "All") {
        const tier = getPlacementCategory(company);
        if (tier !== selectedPlacementTier) return false;
      }

      if (selectedIndustry !== "All") {
        const indTarget = selectedIndustry.toLowerCase();
        const indMatch =
          company.industry?.toLowerCase().includes(indTarget) ||
          company.category?.toLowerCase().includes(indTarget) ||
          company.shortDescription?.toLowerCase().includes(indTarget);
        if (!indMatch) return false;
      }

      if (selectedCompanyType !== "All") {
        const typeTarget = selectedCompanyType.toLowerCase();
        const typeMatch = company.category?.toLowerCase().includes(typeTarget);
        if (!typeMatch) return false;
      }

      if (selectedLocation !== "All") {
        const locTarget = selectedLocation.toLowerCase();
        const locMatch = company.headquarters?.toLowerCase().includes(locTarget);
        if (!locMatch) return false;
      }

      if (!debouncedQuery) return true;

      const searchable = [
        company.name,
        company.shortName,
        company.industry,
        company.category,
        company.headquarters,
        company.shortDescription,
        getPlacementCategory(company),
        "c++", "java", "python", "dsa", "sql", "cloud", "aws", "azure", "ai", "genai", "consulting", "fintech",
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchable.includes(debouncedQuery);
    });
  }, [
    allCompaniesSummary,
    selectedPlacementTier,
    selectedIndustry,
    selectedCompanyType,
    selectedLocation,
    debouncedQuery,
  ]);

  const hasActiveFilters =
    selectedPlacementTier !== "All" ||
    selectedIndustry !== "All" ||
    selectedCompanyType !== "All" ||
    selectedLocation !== "All" ||
    Boolean(searchQuery);

  const handleResetAllFilters = () => {
    setSelectedPlacementTier("All");
    setSelectedIndustry("All");
    setSelectedCompanyType("All");
    setSelectedLocation("All");
    setSearchQuery("");
  };

  const [featuredCompany, setFeaturedCompany] = useState<CompanySummary | null>(null);
  const isSelectedRef = useRef(false);

  useEffect(() => {
    if (allCompaniesSummary.length > 0 && !isSelectedRef.current) {
      isSelectedRef.current = true;
      const randomIndex = Math.floor(Math.random() * allCompaniesSummary.length);
      setFeaturedCompany(allCompaniesSummary[randomIndex]);
    }
  }, [allCompaniesSummary]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header / Hero Section */}
      <section className="bg-card border-b-[3px] border-foreground py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Titles & Search */}
          <div className="lg:col-span-8 space-y-5">
            {/* Small Product Identifier & Metadata + Theme Toggle */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-3">
                <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-sm bg-secondary border-2 border-foreground text-[11px] font-mono font-bold text-foreground nb-shadow-sm">
                  <span className="h-2 w-2 rounded-none bg-primary" />
                  <span>SVCE · INTELLIGENCE PLATFORM</span>
                </div>
                <span className="text-[11px] font-mono font-bold text-muted-foreground">
                  PLACEMENT RESEARCH / 2026
                </span>
              </div>
              <ThemeToggle />
            </div>

            {/* Hero Titles */}
            <div className="space-y-2">
              <h1 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-extrabold text-foreground tracking-tight leading-snug max-w-3xl">
                <SplitText text="Sri Venkateswara College of Engineering Companies Research & Placement Analytics Portal" />
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground font-medium max-w-2xl">
                Your strategic edge for campus placements
              </p>
            </div>

            {/* Prominent Search Bar */}
            <div className="pt-1 max-w-2xl">
              <div className="relative flex items-center">
                <Search className="absolute left-3.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search companies, skills, technologies..."
                  className="w-full h-11 pl-10 pr-10 rounded-sm border-2 border-foreground bg-card text-sm font-medium text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:shadow-[3px_3px_0_hsl(var(--nb-shadow-color))] nb-shadow-sm transition-all"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 p-1 rounded-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                    aria-label="Clear search"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Editorial Research Index */}
          <div className="lg:col-span-4">
            <ResearchIndexCard
              companiesCount={allCompaniesSummary.length || 118}
              skillsCount={12}
              dimensionsCount={22}
            />
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
        {/* Section A: How The Portal Works */}
        <PlacementIntelligenceIntro featuredCompany={featuredCompany} />

        {/* Section B: Featured Company Spotlight */}
        {featuredCompany && !hasActiveFilters && (
          <FeaturedCompany
            company={featuredCompany}
            profile={companyProfile || undefined}
            onExplore={handleSelectCompany}
          />
        )}

        {/* Section C: Company Explorer & Compact Filter Controls */}
        <div className="space-y-5">
          {/* Explorer Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b-2 border-foreground">
            <div>
              <h2 className="font-heading text-lg font-bold text-foreground flex items-center gap-2">
                <LayoutGrid className="h-4 w-4 text-primary" />
                <span>COMPANY EXPLORER</span>
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Explore placement partner profiles, structure, scale and derived intelligence signals
              </p>
            </div>

            <div className="text-xs font-bold text-muted-foreground font-mono">
              Showing <span className="text-foreground">{filteredCompanies.length}</span> of{" "}
              <span className="text-foreground">{allCompaniesSummary.length}</span> companies
            </div>
          </div>

          {/* Primary Placement Tier Filter Pills */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              {PLACEMENT_TIERS.map((tier) => {
                const isSelected = selectedPlacementTier === tier;
                const count = placementTierCounts[tier] || 0;

                return (
                  <button
                    key={tier}
                    type="button"
                    onClick={() => setSelectedPlacementTier(tier)}
                    className={cn(
                      "inline-flex items-center gap-2 px-3.5 py-1.5 rounded-sm text-xs font-bold border-2 select-none transition-all duration-100",
                      isSelected
                        ? "bg-primary text-primary-foreground border-foreground nb-shadow-sm -translate-y-0.5"
                        : "bg-card text-foreground border-foreground nb-shadow-sm hover:bg-secondary hover:translate-x-[1px] hover:translate-y-[1px]"
                    )}
                  >
                    <span>{tier}</span>
                    <span
                      className={cn(
                        "px-1.5 py-0.2 rounded-sm text-[10px] font-bold font-mono border",
                        isSelected
                          ? "bg-primary-foreground text-primary border-transparent"
                          : "bg-secondary text-foreground border-foreground"
                      )}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Secondary Compact Filters Toolbar: Industry, Company Type, Location */}
            <div className="flex flex-wrap items-center gap-2.5 pt-1">
              <SearchableFilterDropdown
                label="Industry"
                value={selectedIndustry}
                options={industryOptions}
                onChange={setSelectedIndustry}
                placeholder="Search industries..."
                allLabel="All Industries"
                icon={Briefcase}
              />

              <SearchableFilterDropdown
                label="Company Type"
                value={selectedCompanyType}
                options={companyTypeOptions}
                onChange={setSelectedCompanyType}
                placeholder="Search company types..."
                allLabel="All Company Types"
                icon={Layers}
              />

              <SearchableFilterDropdown
                label="Location"
                value={selectedLocation}
                options={locationOptions}
                onChange={setSelectedLocation}
                placeholder="Search locations..."
                allLabel="All Locations"
                icon={MapPin}
              />

              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={handleResetAllFilters}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-sm text-xs font-bold text-destructive hover:bg-destructive/10 border-2 border-destructive transition-colors"
                >
                  <RotateCcw className="h-3 w-3" />
                  <span>Reset filters</span>
                </button>
              )}
            </div>
          </div>

          {/* Error State */}
          {isError ? (
            <div className="flex flex-col items-center justify-center p-12 text-center bg-card rounded-sm border-2 border-destructive nb-shadow-md space-y-3">
              <AlertCircle className="h-10 w-10 text-destructive" />
              <h3 className="font-heading text-lg font-bold text-foreground">
                Unable to load companies
              </h3>
              <p className="text-sm text-muted-foreground max-w-md">
                We encountered an issue connecting to the live Supabase database.
              </p>
              <Button onClick={() => refetchCompanies()} variant="outline" size="sm" className="gap-2">
                <RefreshCw className="h-3.5 w-3.5" />
                <span>Retry Connection</span>
              </Button>
            </div>
          ) : isLoading ? (
            /* Loading State Grid Skeleton */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="rounded-sm border-2 border-foreground bg-card p-5 space-y-4 nb-shadow-md"
                >
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-sm" />
                    <div className="space-y-1.5 flex-1">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </div>
                  <Skeleton className="h-12 w-full" />
                  <div className="pt-2 border-t-2 border-foreground flex justify-between">
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredCompanies.length === 0 ? (
            /* Empty State */
            <div className="flex flex-col items-center justify-center p-12 text-center bg-card rounded-sm border-2 border-foreground nb-shadow-md space-y-3">
              <div className="p-3 bg-secondary rounded-none border-2 border-foreground text-foreground">
                <Building2 className="h-8 w-8" />
              </div>
              <h3 className="font-heading text-base font-bold text-foreground">
                No matching companies found
              </h3>
              <p className="text-xs text-muted-foreground max-w-sm">
                We couldn't find any companies matching your search filters. Try clearing your filters or choosing another category.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={handleResetAllFilters}
              >
                Clear all filters
              </Button>
            </div>
          ) : (
            /* Clean Company Grid */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredCompanies.map((company) => (
                <CompanyCard
                  key={company.id}
                  company={company}
                  onSelect={handleSelectCompany}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t-[3px] border-foreground bg-card py-6 px-4 sm:px-6 lg:px-8 mt-16">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground font-mono font-bold">
          <div>
            SVCE PLACEMENT INTELLIGENCE HUB · DEPARTMENT OF PLACEMENT & TRAINING
          </div>
          <div>CAMPUS RECRUITMENT CALIBRATION SUITE 2026</div>
        </div>
      </footer>
    </div>
  );
};
