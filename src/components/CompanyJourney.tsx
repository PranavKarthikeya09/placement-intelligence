import React from "react";
import { History, Milestone, Compass } from "lucide-react";
import { JourneyMilestone } from "@/lib/derivedIntelligence";
import { cn } from "@/lib/utils";
import { motion, useReducedMotion } from "framer-motion";

interface CompanyJourneyProps {
  milestones: JourneyMilestone[];
  companyName: string;
}

export const CompanyJourney: React.FC<CompanyJourneyProps> = React.memo(
  ({ milestones, companyName }) => {
    const shouldReduce = useReducedMotion();

    return (
      <div className="rounded-sm border-2 border-foreground bg-card p-5 sm:p-6 space-y-6 nb-shadow-md">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b-2 border-foreground">
          <div>
            <div className="flex items-center gap-2">
              <History className="h-4 w-4 text-primary" />
              <h2 className="font-heading text-base sm:text-lg font-bold text-foreground">
                COMPANY JOURNEY & STRATEGIC TRAJECTORY
              </h2>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5 font-medium">
              Chronological milestones and recorded timeline for {companyName}
            </p>
          </div>
          <div className="text-[11px] font-mono font-bold text-muted-foreground bg-secondary px-2.5 py-1 rounded-sm border-2 border-foreground">
            RESEARCH CHRONOLOGY
          </div>
        </div>

        {/* Timeline */}
        <div className="relative pl-6 sm:pl-8 space-y-5 before:absolute before:left-2 sm:before:left-3 before:top-3 before:bottom-3 before:w-[3px] before:bg-foreground">
          {milestones.map((item, idx) => {
            const isLast = idx === milestones.length - 1;
            const isFuture = item.isFuture;

            return (
              <motion.div
                key={idx}
                className="relative group"
                initial={{ opacity: shouldReduce ? 1 : 0, y: shouldReduce ? 0 : 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-15px" }}
                transition={{ duration: 0.35, delay: idx * 0.06, ease: "easeOut" }}
              >
                <div
                  className={cn(
                    "absolute -left-6 sm:-left-8 top-1.5 h-5 w-5 sm:h-6 sm:w-6 rounded-none border-2 border-foreground flex items-center justify-center",
                    isFuture
                      ? "bg-[#4169E1] text-white"
                      : isLast
                      ? "bg-primary text-primary-foreground"
                      : "bg-card text-foreground"
                  )}
                >
                  {isFuture ? (
                    <Compass className="h-3 w-3" />
                  ) : (
                    <Milestone className="h-3 w-3" />
                  )}
                </div>

                <div
                  className={cn(
                    "rounded-sm border-2 border-foreground p-4 space-y-1.5",
                    isFuture
                      ? "bg-[#4169E1]/10"
                      : "bg-secondary"
                  )}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          "font-mono font-bold text-xs px-2 py-0.5 rounded-sm border-2 border-foreground",
                          isFuture
                            ? "bg-[#4169E1] text-white"
                            : "bg-primary text-primary-foreground"
                        )}
                      >
                        {item.yearOrEra}
                      </span>
                      <h3 className="font-heading text-xs sm:text-sm font-bold text-foreground">
                        {item.title}
                      </h3>
                    </div>

                    {item.tag && (
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-sm bg-card border-2 border-foreground text-foreground">
                        {item.tag}
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-foreground leading-relaxed font-normal">
                    {item.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    );
  }
);

CompanyJourney.displayName = "CompanyJourney";
