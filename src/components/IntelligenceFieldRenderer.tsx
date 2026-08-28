import React from "react";
import { ExternalLink, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  SectionField,
  cleanMarkdownUrl,
  isNullish,
  splitItems,
} from "@/lib/companyData";
import { cn } from "@/lib/utils";

interface FieldRowProps {
  field: SectionField;
  isLast?: boolean;
}

export const FieldRow: React.FC<FieldRowProps> = ({ field, isLast = false }) => {
  const { label, value, type } = field;

  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row py-3.5 sm:items-baseline gap-1 sm:gap-4 transition-colors",
        !isLast && "border-b-2 border-foreground/20"
      )}
    >
      <dt className="text-xs sm:text-sm font-bold text-muted-foreground sm:w-1/3 shrink-0">
        {label}
      </dt>
      <dd className="text-sm sm:w-2/3 text-foreground font-normal">
        {renderFieldValue(value, type)}
      </dd>
    </div>
  );
};

export function renderFieldValue(value: unknown, type?: SectionField["type"]): React.ReactNode {
  if (isNullish(value)) {
    return (
      <Badge variant="outline" className="text-xs text-muted-foreground font-bold">
        Not Available
      </Badge>
    );
  }

  if (type === "url" || (typeof value === "string" && (value.startsWith("http") || value.startsWith("[")))) {
    const rawStr = String(value);
    const cleanUrl = cleanMarkdownUrl(rawStr);
    
    const mdMatch = rawStr.match(/\[([^\]]+)\]\(([^)]+)\)/);
    const displayLabel = mdMatch ? mdMatch[1] : cleanUrl.replace(/^https?:\/\/(www\.)?/, "");

    return (
      <a
        href={cleanUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 text-[#4169E1] hover:underline font-bold break-all text-sm group"
      >
        <span>{displayLabel}</span>
        <ExternalLink className="h-3.5 w-3.5 shrink-0 opacity-70 group-hover:opacity-100 transition-opacity" />
      </a>
    );
  }

  if (type === "rating" || (typeof value === "string" && /^[0-5](\.[0-9])?\s*\/\s*5(\.0)?/.test(value.trim()))) {
    const strVal = String(value).trim();
    const scoreMatch = strVal.match(/^([0-5](?:\.[0-9])?)/);
    const num = scoreMatch ? parseFloat(scoreMatch[1]) : 4.0;
    const note = strVal.replace(/^[0-5](\.[0-9])?\s*\/\s*5(\.0)?/, "").trim();

    return (
      <div className="flex flex-wrap items-center gap-2">
        <div className="inline-flex items-center gap-1 bg-primary text-primary-foreground border-2 border-foreground px-2 py-0.5 rounded-sm font-bold text-xs">
          <Star className="h-3.5 w-3.5 fill-current text-current" />
          <span>{num.toFixed(1)} / 5.0</span>
        </div>
        {note && <span className="text-xs text-muted-foreground">{note}</span>}
      </div>
    );
  }

  if (type === "badge") {
    const str = String(value).trim();
    return (
      <Badge variant="secondary" className="font-bold text-xs">
        {str}
      </Badge>
    );
  }

  if (type === "list" || Array.isArray(value) || (typeof value === "string" && (value.includes(";") || value.includes("•") || value.includes("\n")))) {
    const items = splitItems(value);
    if (items.length <= 1 && !Array.isArray(value)) {
      return <span>{items[0] || String(value)}</span>;
    }

    const isShortChips = items.every((item) => item.length < 35);

    if (isShortChips) {
      return (
        <div className="flex flex-wrap gap-1.5 py-0.5">
          {items.map((item, idx) => (
            <span
              key={idx}
              className="inline-flex items-center px-2.5 py-0.5 rounded-sm text-xs font-bold bg-secondary text-foreground border-2 border-foreground"
            >
              {item}
            </span>
          ))}
        </div>
      );
    }

    return (
      <ul className="space-y-1.5 list-disc list-outside pl-4 text-foreground leading-relaxed text-sm">
        {items.map((item, idx) => (
          <li key={idx} className="pl-0.5">
            {item}
          </li>
        ))}
      </ul>
    );
  }

  const textStr = String(value);
  return <p className="text-foreground leading-relaxed break-words">{textStr}</p>;
}
