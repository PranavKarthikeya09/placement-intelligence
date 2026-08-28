import React from "react";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { cn } from "@/lib/utils";

interface ThemeToggleProps {
  className?: string;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ className }) => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={cn(
        "relative inline-flex items-center justify-center h-8 w-8 rounded-sm border-2 border-foreground bg-card text-foreground hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring select-none nb-shadow-sm hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0_hsl(var(--nb-shadow-color))] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none transition-all duration-100",
        className
      )}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      <Sun
        className={cn(
          "h-4 w-4 transition-all duration-150 motion-reduce:transition-none absolute text-foreground",
          isDark ? "scale-0 rotate-90 opacity-0" : "scale-100 rotate-0 opacity-100"
        )}
      />
      <Moon
        className={cn(
          "h-4 w-4 transition-all duration-150 motion-reduce:transition-none absolute text-foreground",
          isDark ? "scale-100 rotate-0 opacity-100" : "scale-0 -rotate-90 opacity-0"
        )}
      />
      <span className="sr-only">{isDark ? "Light mode" : "Dark mode"}</span>
    </button>
  );
};
