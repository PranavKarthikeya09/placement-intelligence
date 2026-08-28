import { cn } from "@/lib/utils";

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-nb-pulse rounded-sm border-2 border-foreground/20 bg-secondary", className)}
      {...props}
    />
  );
}

export { Skeleton };
