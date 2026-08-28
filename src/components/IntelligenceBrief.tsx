import React from "react";
import { FileText, Users, Zap, AlertCircle, Compass, LucideIcon } from "lucide-react";
import { IntelligenceBriefData } from "@/lib/derivedIntelligence";
import { motion, useReducedMotion, type Variants } from "framer-motion";

interface IntelligenceBriefProps {
  brief: IntelligenceBriefData;
}

interface BriefDimensionCardProps {
  icon: LucideIcon;
  iconColor: string;
  label: string;
  content: string;
  variants: Variants;
}

const BriefDimensionCard: React.FC<BriefDimensionCardProps> = ({
  icon: Icon,
  iconColor,
  label,
  content,
  variants,
}) => {
  return (
    <motion.div
      variants={variants}
      className="rounded-sm border-2 border-foreground bg-secondary p-3.5 space-y-1 nb-shadow-sm select-none"
    >
      <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground font-mono">
        <Icon className={`h-3 w-3 ${iconColor}`} />
        <span>{label}</span>
      </div>
      <p className="text-xs font-bold text-foreground leading-relaxed">
        {content}
      </p>
    </motion.div>
  );
};

export const IntelligenceBrief: React.FC<IntelligenceBriefProps> = React.memo(({ brief }) => {
  const shouldReduce = useReducedMotion();

  const containerVariants: Variants = {
    hidden: { opacity: shouldReduce ? 1 : 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: shouldReduce ? 0 : 0.08,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: shouldReduce ? 1 : 0, y: shouldReduce ? 0 : 8 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.35, ease: "easeOut" },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-20px" }}
      className="rounded-sm border-2 border-foreground bg-card p-5 sm:p-6 space-y-4 nb-shadow-md"
    >
      {/* Header */}
      <motion.div
        variants={itemVariants}
        className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b-2 border-foreground"
      >
        <div className="flex items-center gap-2">
          <div className="flex h-5 w-5 items-center justify-center rounded-sm bg-secondary text-foreground border-2 border-foreground">
            <FileText className="h-3 w-3" />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-foreground font-mono">
            {brief.companyName} — RESEARCH BRIEF
          </span>
        </div>
        <div className="flex items-center gap-2 text-[11px] font-mono text-muted-foreground font-bold">
          <span>PORTAL DOSSIER</span>
          <span>·</span>
          <span>{brief.category}</span>
        </div>
      </motion.div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <BriefDimensionCard icon={Compass} iconColor="text-foreground" label="PROFILE" content={brief.profile} variants={itemVariants} />
        <BriefDimensionCard icon={Users} iconColor="text-[#4169E1]" label="SCALE" content={`${brief.workforce} across ${brief.globalReach || "global operations"}`} variants={itemVariants} />
        <BriefDimensionCard icon={Zap} iconColor="text-foreground" label="OPPORTUNITY" content={brief.keyOpportunity || brief.strongestSignal} variants={itemVariants} />
        <BriefDimensionCard icon={AlertCircle} iconColor="text-[#FF7657]" label="WATCH" content={brief.watchArea || "Enterprise matrix navigation and continuous technical certification standards"} variants={itemVariants} />
      </div>
    </motion.div>
  );
});

IntelligenceBrief.displayName = "IntelligenceBrief";
