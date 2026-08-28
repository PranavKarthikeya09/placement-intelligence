import React, { useState, useMemo } from "react";
import { cn } from "@/lib/utils";

interface CompanyLogoProps {
  name: string;
  shortName?: string;
  logoUrl?: string;
  websiteUrl?: string;
  domain?: string;
  category?: string;
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
}

/**
 * Deterministically derives a polished 2-letter corporate monogram from company name.
 */
export function generateCompanyMonogram(name: string, shortName?: string): string {
  if (!name && !shortName) return "CO";

  const source = (shortName && shortName.length >= 2 && shortName.length <= 15 ? shortName : name).trim();

  const cleaned = source
    .replace(
      /\b(plc|inc|inc\.|llc|ltd|limited|private|pvt|corp|corporation|co|group|solutions|services|technologies|tech|holdings)\b/gi,
      ""
    )
    .replace(/[^\w\s]/g, " ")
    .trim();

  const words = cleaned.split(/\s+/).filter(Boolean);

  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase();
  }

  const single = words[0] || source.replace(/[^\w]/g, "");

  const uppers = single.match(/[A-Z]/g);
  if (uppers && uppers.length >= 2) {
    return (uppers[0] + uppers[1]).toUpperCase();
  }

  if (single.length >= 2) {
    return single.slice(0, 2).toUpperCase();
  }

  if (single.length === 1) {
    return (single + "C").toUpperCase();
  }

  return "CO";
}

function extractDomain(websiteUrl?: string, domain?: string): string | null {
  if (domain && domain.trim()) {
    return domain.replace(/^(https?:\/\/)?(www\.)?/, "").split("/")[0];
  }
  if (websiteUrl && websiteUrl.trim() && !websiteUrl.includes("example.com")) {
    try {
      const raw = websiteUrl.trim();
      const url = raw.startsWith("http") ? raw : `https://${raw}`;
      const parsed = new URL(url);
      const host = parsed.hostname.replace(/^www\./, "");
      return host || null;
    } catch {
      // Ignore URL parse error
    }
  }
  return null;
}

export const CompanyLogo: React.FC<CompanyLogoProps> = ({
  name,
  shortName,
  logoUrl,
  websiteUrl,
  domain,
  category,
  className,
  size = "md",
}) => {
  const [hierarchyStep, setHierarchyStep] = useState<number>(0);

  const logoDevKey = import.meta.env.VITE_LOGO_DEV_PUBLISHABLE_KEY;
  const cleanDomain = useMemo(
    () => extractDomain(websiteUrl, domain),
    [websiteUrl, domain]
  );

  const candidateUrls = useMemo(() => {
    const urls: string[] = [];

    if (logoDevKey && cleanDomain) {
      urls.push(`https://img.logo.dev/${cleanDomain}?token=${logoDevKey}&size=128`);
    }

    if (logoUrl && logoUrl.trim() && !logoUrl.includes("example.com")) {
      urls.push(logoUrl.trim());
    }

    if (cleanDomain) {
      urls.push(`https://www.google.com/s2/favicons?domain=${cleanDomain}&sz=128`);
    }

    return urls;
  }, [logoDevKey, cleanDomain, logoUrl]);

  const resolvedSrc = candidateUrls[hierarchyStep];

  const handleImageError = () => {
    setHierarchyStep((prev) => prev + 1);
  };

  const monogram = useMemo(
    () => generateCompanyMonogram(name, shortName),
    [name, shortName]
  );

  const sizeClasses = {
    sm: "w-9 h-9 text-[11px] rounded-sm",
    md: "w-11 h-11 text-xs rounded-sm",
    lg: "w-14 h-14 text-sm rounded-sm",
    xl: "w-16 h-16 text-base rounded-sm",
  };

  const catStyles = useMemo(() => {
    switch (category) {
      case "Super Dream":
        return {
          textColor: "text-primary-foreground",
          borderColor: "border-foreground",
          bgColor: "bg-primary",
        };
      case "Dream":
        return {
          textColor: "text-white",
          borderColor: "border-foreground",
          bgColor: "bg-[#4169E1]",
        };
      case "Standard":
        return {
          textColor: "text-secondary-foreground",
          borderColor: "border-foreground",
          bgColor: "bg-secondary",
        };
      case "Regular":
        return {
          textColor: "text-foreground",
          borderColor: "border-foreground",
          bgColor: "bg-card",
        };
      default:
        return {
          textColor: "text-foreground",
          borderColor: "border-foreground",
          bgColor: "bg-secondary",
        };
    }
  }, [category]);

  if (!resolvedSrc || hierarchyStep >= candidateUrls.length) {
    return (
      <div
        className={cn(
          "relative flex items-center justify-center font-heading font-bold uppercase tracking-wider select-none border-2 shrink-0 nb-shadow-sm",
          catStyles.bgColor,
          catStyles.borderColor,
          catStyles.textColor,
          sizeClasses[size],
          className
        )}
        role="img"
        aria-label={`${name} logo`}
      >
        <span>{monogram}</span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative flex items-center justify-center border-2 border-foreground bg-card p-1.5 overflow-hidden shrink-0 nb-shadow-sm",
        sizeClasses[size],
        className
      )}
    >
      <img
        src={resolvedSrc}
        alt={`${name} logo`}
        className="h-full w-full object-contain"
        onError={handleImageError}
        loading="lazy"
      />
    </div>
  );
};
