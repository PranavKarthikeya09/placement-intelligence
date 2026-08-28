import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, FileQuestion } from "lucide-react";
import { Button } from "@/components/ui/button";

export const NotFound: React.FC = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-md w-full bg-card rounded-sm border-2 border-foreground p-8 nb-shadow-lg space-y-6">
        <div className="w-16 h-16 rounded-none bg-secondary text-foreground border-2 border-foreground flex items-center justify-center mx-auto nb-shadow-sm">
          <FileQuestion className="h-8 w-8 text-primary" />
        </div>

        <div className="space-y-2">
          <h1 className="font-heading text-4xl font-extrabold text-foreground">404</h1>
          <h2 className="font-heading text-lg font-bold text-foreground">
            Page Not Found
          </h2>
          <p className="text-sm text-muted-foreground font-medium">
            The page or resource you are looking for does not exist or has been moved.
          </p>
        </div>

        <div className="pt-2">
          <Button asChild className="w-full gap-2 font-bold">
            <Link to="/">
              <ArrowLeft className="h-4 w-4" />
              <span>Return to Placement Hub</span>
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};
