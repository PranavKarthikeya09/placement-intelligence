import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-sm border-2 border-foreground px-2 py-0.5 text-xs font-bold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 font-mono uppercase tracking-wider",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground",
        secondary: "bg-secondary text-secondary-foreground",
        destructive: "bg-destructive text-destructive-foreground",
        outline: "bg-card text-foreground",
        // Category Badges — Neo-Brutalist palette
        "super-dream": "bg-primary text-primary-foreground border-foreground",
        dream: "bg-[#4169E1] text-white border-foreground",
        standard: "bg-secondary text-secondary-foreground border-foreground",
        regular: "bg-card text-foreground border-foreground",
        // Solid Category Badges
        "super-dream-solid": "bg-primary text-primary-foreground border-foreground",
        "dream-solid": "bg-[#4169E1] text-white border-foreground",
        "standard-solid": "bg-secondary text-secondary-foreground border-foreground",
        "regular-solid": "bg-card text-foreground border-foreground",
        // Bloom Badges
        cu: "bg-secondary text-secondary-foreground border-foreground",
        ap: "bg-[#4169E1] text-white border-foreground",
        as: "bg-primary text-primary-foreground border-foreground",
        ev: "bg-destructive text-destructive-foreground border-foreground",
        cr: "bg-foreground text-background border-foreground",
        // Criticality Badges
        critical: "bg-destructive text-destructive-foreground border-foreground",
        important: "bg-[#4169E1] text-white border-foreground",
        baseline: "bg-secondary text-secondary-foreground border-foreground",
        // Special
        glow: "bg-foreground text-background border-foreground",
        navy: "bg-foreground text-background border-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
