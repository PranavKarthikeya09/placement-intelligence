import React from "react";
import { ArrowRight, Building2, Cpu, Milestone } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCompany } from "@/context/CompanyContext";
import { CompanySummary } from "@/lib/companyData";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import { cn } from "@/lib/utils";

interface PlacementIntelligenceIntroProps {
  featuredCompany?: CompanySummary | null;
}

export const PlacementIntelligenceIntro: React.FC<PlacementIntelligenceIntroProps> = React.memo(
  ({ featuredCompany }) => {
    const navigate = useNavigate();
    const { setSelectedCompanyById } = useCompany();
    const shouldReduce = useReducedMotion();

    const handleNavigateToIntelligence = () => {
      if (!featuredCompany) return;
      setSelectedCompanyById(featuredCompany.id);
      navigate("/company/intelligence");
    };

    const handleNavigateToSkills = () => {
      if (!featuredCompany) return;
      setSelectedCompanyById(featuredCompany.id);
      navigate("/company/skills");
    };

    const handleNavigateToPathways = () => {
      if (!featuredCompany) return;
      setSelectedCompanyById(featuredCompany.id);
      navigate("/company/skills");
    };

    const isReady = !!featuredCompany;

    const containerVariants: Variants = {
      hidden: { opacity: shouldReduce ? 1 : 0 },
      visible: {
        opacity: 1,
        transition: {
          staggerChildren: shouldReduce ? 0 : 0.1,
        },
      },
    };

    const itemVariants: Variants = {
      hidden: { opacity: shouldReduce ? 1 : 0, y: shouldReduce ? 0 : 10 },
      visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.35, ease: "easeOut" },
      },
    };

    const cards = [
      {
        num: "01",
        title: "COMPANY",
        desc: "Research the organization.",
        cta: "Explore Company Intelligence",
        icon: Building2,
        onClick: handleNavigateToIntelligence,
        hoverColor: "group-hover:text-foreground group-hover:border-foreground",
      },
      {
        num: "02",
        title: "SKILLS",
        desc: "Understand what it expects.",
        cta: "Explore Expected Skills",
        icon: Cpu,
        onClick: handleNavigateToSkills,
        hoverColor: "group-hover:text-[#4169E1] group-hover:border-[#4169E1]",
      },
      {
        num: "03",
        title: "PATH",
        desc: "Identify what to work on next.",
        cta: "Simulate Skill Pathways",
        icon: Milestone,
        onClick: handleNavigateToPathways,
        hoverColor: "group-hover:text-foreground group-hover:border-foreground",
      },
    ];

    return (
      <section className="space-y-4">
        {/* Intro Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 pb-2 border-b-2 border-foreground">
          <div>
            <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-muted-foreground">
              FRAMEWORK
            </div>
            <h2 className="font-heading text-lg font-bold text-foreground tracking-tight mt-0.5">
              HOW THE PORTAL WORKS
            </h2>
          </div>
          <div className="text-[11px] font-mono text-muted-foreground font-bold">
            RAW DATA → SIGNAL → INSIGHT → DECISION
          </div>
        </div>

        {/* 3 Module Blocks */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-20px" }}
        >
          {cards.map((card) => {
            const Icon = card.icon;
            return (
              <motion.div
                key={card.num}
                variants={itemVariants}
                onClick={card.onClick}
                className={cn(
                  "group rounded-sm border-2 border-foreground bg-card p-5 sm:p-6 min-h-[195px] sm:min-h-[205px] flex flex-col justify-between select-none nb-shadow-md nb-card-hover",
                  isReady
                    ? "cursor-pointer"
                    : "opacity-60 cursor-not-allowed"
                )}
                role="button"
                tabIndex={isReady ? 0 : -1}
                aria-disabled={!isReady}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && isReady) {
                    e.preventDefault();
                    card.onClick();
                  }
                }}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-xs text-muted-foreground">
                      {card.num}
                    </span>
                    <div className={cn("p-1.5 rounded-sm bg-secondary text-foreground border-2 border-foreground", card.hoverColor)}>
                      <Icon className="h-4 w-4" />
                    </div>
                  </div>
                  <div className="mt-5 space-y-1.5">
                    <h3 className={cn("font-heading text-sm font-bold text-foreground tracking-wide", card.hoverColor)}>
                      {card.title}
                    </h3>
                    <p className="text-xs text-muted-foreground leading-relaxed font-medium">
                      {card.desc}
                    </p>
                  </div>
                </div>

                <div className={cn("mt-6 flex items-center justify-between text-xs font-bold text-foreground", card.hoverColor)}>
                  <span>{card.cta}</span>
                  <ArrowRight className="h-3.5 w-3.5 transition-transform duration-100 group-hover:translate-x-1" />
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </section>
    );
  }
);

PlacementIntelligenceIntro.displayName = "PlacementIntelligenceIntro";
