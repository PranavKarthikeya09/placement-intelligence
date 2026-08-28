import React from "react";
import { Loader2, AlertCircle, Inbox, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface LoadingStateProps {
  title?: string;
  message?: string;
  className?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  title = "Analyzing Data...",
  message = "Processing input through RADIX intelligence models.",
  className,
}) => (
  <div
    className={cn(
      "rounded-sm border-2 border-foreground bg-card p-10 text-center space-y-4 nb-shadow-md",
      className
    )}
  >
    <div className="inline-flex p-3 rounded-none bg-primary text-primary-foreground border-2 border-foreground nb-shadow-sm">
      <Loader2 className="h-6 w-6 animate-spin" />
    </div>
    <div className="space-y-1">
      <h3 className="text-base font-bold text-foreground font-heading">{title}</h3>
      <p className="text-xs text-muted-foreground max-w-md mx-auto font-medium">{message}</p>
    </div>
  </div>
);

interface EmptyStateProps {
  title: string;
  message: string;
  actionText?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  message,
  actionText,
  onAction,
  className,
}) => (
  <div
    className={cn(
      "rounded-sm border-2 border-foreground bg-card p-10 text-center space-y-4 nb-shadow-sm",
      className
    )}
  >
    <div className="inline-flex p-3 rounded-none bg-secondary text-foreground border-2 border-foreground">
      <Inbox className="h-6 w-6 text-muted-foreground" />
    </div>
    <div className="space-y-1">
      <h3 className="text-base font-bold text-foreground font-heading">{title}</h3>
      <p className="text-xs text-muted-foreground max-w-md mx-auto font-medium">{message}</p>
    </div>
    {actionText && onAction && (
      <Button onClick={onAction} variant="outline" size="sm" className="font-bold">
        {actionText}
      </Button>
    )}
  </div>
);

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = "Request Failed",
  message,
  onRetry,
  className,
}) => (
  <div
    className={cn(
      "rounded-sm border-2 border-foreground bg-destructive/10 p-6 space-y-3 nb-shadow-sm",
      className
    )}
  >
    <div className="flex items-start gap-3">
      <div className="p-2 rounded-none bg-destructive text-destructive-foreground border-2 border-foreground shrink-0">
        <AlertCircle className="h-5 w-5" />
      </div>
      <div className="space-y-1 flex-1">
        <h4 className="text-sm font-bold text-foreground font-heading">{title}</h4>
        <p className="text-xs text-muted-foreground font-medium">{message}</p>
      </div>
      {onRetry && (
        <Button onClick={onRetry} variant="outline" size="sm" className="gap-1.5 shrink-0">
          <RefreshCw className="h-3.5 w-3.5" />
          <span>Retry</span>
        </Button>
      )}
    </div>
  </div>
);
