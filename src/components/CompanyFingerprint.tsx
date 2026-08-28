import React from "react";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { FingerprintDimension } from "@/lib/derivedIntelligence";
import { Info, Activity } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { useTheme } from "@/context/ThemeContext";

interface CompanyFingerprintProps {
  dimensions: FingerprintDimension[];
  companyName: string;
}

export const CompanyFingerprint: React.FC<CompanyFingerprintProps> = React.memo(
  ({ dimensions, companyName }) => {
    const shouldReduce = useReducedMotion();
    const { theme } = useTheme();
    const isDark = theme === "dark";

    const CustomTooltip = ({ active, payload }: any) => {
      if (active && payload && payload.length) {
        const data = payload[0].payload as FingerprintDimension;
        return (
          <div className="rounded-sm border-2 border-foreground bg-card p-2.5 nb-shadow-sm text-xs space-y-1">
            <div className="font-bold text-foreground">{data.dimension}</div>
            <div className="text-foreground font-mono">
              Score: <span className="font-bold text-[#4169E1]">{data.score}</span> / 100
            </div>
            <div className="text-[11px] text-muted-foreground">{data.description}</div>
          </div>
        );
      }
      return null;
    };

    return (
      <div className="rounded-sm border-2 border-foreground bg-card p-5 sm:p-6 space-y-5 nb-shadow-md">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b-2 border-foreground">
          <div>
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" />
              <h2 className="font-heading text-base sm:text-lg font-bold text-foreground">
                COMPANY FINGERPRINT
              </h2>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5 font-medium">
              Multidimensional capability and structural footprint derived from portal dataset
            </p>
          </div>
          <div className="text-[11px] font-mono font-bold text-muted-foreground px-2.5 py-1 rounded-sm bg-secondary border-2 border-foreground">
            DERIVED FROM INTELLIGENCE DATA
          </div>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-7 h-72 sm:h-80 w-full relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="75%" data={dimensions}>
                <PolarGrid stroke={isDark ? "#555" : "#171717"} strokeWidth={1} strokeDasharray="none" />
                <PolarAngleAxis
                  dataKey="dimension"
                  tick={{ fill: isDark ? "#FFFDF8" : "#171717", fontSize: 11, fontWeight: 700 }}
                />
                <PolarRadiusAxis
                  angle={30}
                  domain={[0, 100]}
                  tick={{ fill: isDark ? "#AAA" : "#6E685E", fontSize: 9 }}
                  axisLine={false}
                />
                <Radar
                  name={companyName}
                  dataKey="score"
                  stroke={isDark ? "#B7F34A" : "#171717"}
                  fill="#B7F34A"
                  fillOpacity={isDark ? 0.3 : 0.35}
                  strokeWidth={3}
                  isAnimationActive={!shouldReduce}
                  animationDuration={700}
                  animationEasing="ease-out"
                  dot={{ r: 4, fill: "#B7F34A", strokeWidth: 2, stroke: isDark ? "#FFFDF8" : "#171717" }}
                />
                <Tooltip content={<CustomTooltip />} />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* Dimension cards */}
          <div className="lg:col-span-5 space-y-2">
            <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground font-mono">
              Dimension Breakdown
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-1.5">
              {dimensions.map((dim, idx) => (
                <div
                  key={dim.dimension}
                  className="flex items-center justify-between p-2 rounded-sm border-2 border-foreground bg-secondary hover:bg-card transition-colors"
                >
                  <div className="space-y-0.5 pr-2">
                    <div className="text-xs font-bold text-foreground">
                      {dim.dimension}
                    </div>
                    <div className="text-[10px] text-muted-foreground truncate max-w-[200px] font-medium">
                      {dim.description}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="w-14 h-2 rounded-none bg-card overflow-hidden hidden sm:block border-2 border-foreground">
                      <motion.div
                        className="h-full rounded-none bg-primary"
                        initial={{ width: shouldReduce ? `${dim.score}%` : 0 }}
                        whileInView={{ width: `${dim.score}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: idx * 0.05, ease: "easeOut" }}
                      />
                    </div>
                    <span className="font-mono font-bold text-xs text-foreground">
                      {dim.score}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="flex items-center gap-2 text-[11px] text-muted-foreground bg-secondary rounded-sm p-2.5 border-2 border-foreground font-mono">
          <Info className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
          <span>
            DERIVED FROM COMPANY INTELLIGENCE DATA · Calculated deterministically from verified company profile fields. Not an official company ranking.
          </span>
        </div>
      </div>
    );
  }
);

CompanyFingerprint.displayName = "CompanyFingerprint";
