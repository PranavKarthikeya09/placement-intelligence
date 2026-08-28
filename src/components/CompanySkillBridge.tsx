import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Target, Check } from "lucide-react";
import { DashboardSkill } from "@/lib/companyData";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface CompanySkillBridgeProps {
  topSkills: DashboardSkill[];
  companyName: string;
}

export const CompanySkillBridge: React.FC<CompanySkillBridgeProps> = React.memo(
  ({ topSkills, companyName }) => {
    return (
      <div className="rounded-sm border-2 border-foreground bg-card p-5 sm:p-6 space-y-4 nb-shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b-2 border-foreground">
          <div>
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-primary" />
              <h2 className="font-heading text-base sm:text-lg font-bold text-foreground">
                WHAT DOES {companyName.toUpperCase()} EXPECT?
              </h2>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5 font-medium">
              Placement readiness benchmark matrix calibrated across key technical competencies
            </p>
          </div>

          <Button
            size="sm"
            className="gap-2 self-start sm:self-auto text-xs font-bold"
            asChild
          >
            <Link to="/company/skills">
              <span>Explore Skill Intelligence</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {topSkills.map((skill) => (
            <div
              key={skill.id}
              className="rounded-sm border-2 border-foreground bg-secondary p-3 flex flex-col justify-between space-y-2 hover:bg-card transition-colors duration-100 nb-shadow-sm nb-card-hover"
            >
              <div>
                <div className="flex items-center justify-between gap-1 mb-1">
                  <Badge variant={skill.bloom.toLowerCase() as any} className="text-[10px] px-1.5 py-0 font-bold">
                    {skill.bloom}
                  </Badge>
                  <span className="font-mono font-bold text-xs text-primary">
                    Level {skill.score}/10
                  </span>
                </div>
                <div className="font-heading font-bold text-xs text-foreground leading-tight">
                  {skill.name}
                </div>
              </div>
              <div className="flex items-center gap-1 text-[10px] font-mono text-muted-foreground font-bold">
                <Check className="h-3 w-3 text-foreground shrink-0" />
                <span className="truncate">{skill.criticality} Priority</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
);

CompanySkillBridge.displayName = "CompanySkillBridge";
