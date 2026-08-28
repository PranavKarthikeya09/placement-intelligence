import React from "react";
import { Zap, Globe, GraduationCap, Building2, AlertTriangle, Check } from "lucide-react";
import { IntelligenceSignal } from "@/lib/derivedIntelligence";

interface IntelligenceSignalsProps {
  signals: IntelligenceSignal[];
}

export const IntelligenceSignals: React.FC<IntelligenceSignalsProps> = React.memo(
  ({ signals }) => {
    const getIcon = (type: IntelligenceSignal["type"]) => {
      switch (type) {
        case "AI": return Zap;
        case "GLOBAL": return Globe;
        case "LEARNING": return GraduationCap;
        case "ENTERPRISE": return Building2;
        case "WATCH": return AlertTriangle;
        default: return Zap;
      }
    };

    const getIndicatorCategory = (type: IntelligenceSignal["type"]) => {
      switch (type) {
        case "AI": return "TECHNOLOGY";
        case "GLOBAL": return "GLOBAL REACH";
        case "LEARNING": return "LEARNING & GROWTH";
        case "ENTERPRISE": return "SCALE";
        case "WATCH": return "WATCH";
        default: return "INDICATOR";
      }
    };

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between pb-2 border-b-2 border-foreground">
          <div>
            <h2 className="font-heading text-base sm:text-lg font-bold text-foreground flex items-center gap-2">
              <Zap className="h-4 w-4 text-primary" />
              <span>INTELLIGENCE SIGNALS</span>
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Portal-derived research indicators synthesized from verified company data
            </p>
          </div>
          <div className="text-[11px] font-mono font-bold text-muted-foreground bg-secondary px-2.5 py-1 rounded-sm border-2 border-foreground">
            SVCE INDICATOR
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {signals.map((signal) => {
            const Icon = getIcon(signal.type);
            const categoryName = getIndicatorCategory(signal.type);

            return (
              <div
                key={signal.id}
                className="rounded-sm border-2 border-foreground bg-card nb-shadow-sm flex flex-col justify-between overflow-hidden"
              >
                <div className="p-4 border-b-2 border-foreground bg-secondary flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded-sm bg-card border-2 border-foreground text-foreground shrink-0">
                      <Icon className="h-3.5 w-3.5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground font-mono block">
                        {categoryName}
                      </span>
                      <h3 className="font-heading text-xs sm:text-sm font-bold text-foreground">
                        {signal.title}
                      </h3>
                    </div>
                  </div>

                  <span className="px-2 py-0.5 rounded-sm text-[11px] font-mono font-bold bg-card text-foreground border-2 border-foreground">
                    {signal.level}
                  </span>
                </div>

                <div className="p-4 space-y-2 flex-1">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground font-mono mb-1.5">
                    Supporting Evidence
                  </div>
                  <ul className="space-y-1.5">
                    {signal.evidence.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs text-foreground leading-relaxed">
                        <Check className="h-3 w-3 text-primary shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
);

IntelligenceSignals.displayName = "IntelligenceSignals";
