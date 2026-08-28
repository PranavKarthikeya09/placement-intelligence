import React, { useState, useRef, useEffect, useMemo } from "react";
import { ChevronDown, Search, X, Check, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface FilterOption {
  label: string;
  value: string;
  count?: number;
}

interface SearchableFilterDropdownProps {
  label: string;
  value: string;
  options: FilterOption[];
  onChange: (value: string) => void;
  placeholder?: string;
  allLabel?: string;
  icon?: LucideIcon;
  className?: string;
}

export const SearchableFilterDropdown: React.FC<SearchableFilterDropdownProps> = ({
  label,
  value,
  options,
  onChange,
  placeholder = "Search...",
  allLabel = "All",
  icon: Icon,
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const filteredOptions = useMemo(() => {
    if (!searchQuery.trim()) return options;
    const q = searchQuery.toLowerCase().trim();
    return options.filter(
      (opt) =>
        opt.label.toLowerCase().includes(q) || opt.value.toLowerCase().includes(q)
    );
  }, [options, searchQuery]);

  const isFiltered = Boolean(value && value !== "All");

  const selectedOption = useMemo(() => {
    return options.find((opt) => opt.value === value);
  }, [options, value]);

  const handleSelect = (val: string) => {
    onChange(val);
    setIsOpen(false);
    setSearchQuery("");
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange("All");
    setSearchQuery("");
  };

  return (
    <div className={cn("relative inline-block text-left", className)} ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-xs font-bold border-2 select-none transition-all duration-100",
          isFiltered
            ? "bg-primary text-primary-foreground border-foreground nb-shadow-sm"
            : "bg-card text-foreground border-foreground nb-shadow-sm hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0_hsl(var(--nb-shadow-color))]"
        )}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        {Icon && <Icon className="h-3.5 w-3.5 shrink-0" />}
        <span className="truncate max-w-[140px] sm:max-w-[180px]">
          {isFiltered ? (
            <>
              <span className="text-primary-foreground/70 font-normal mr-1">{label}:</span>
              <strong className="font-bold">{selectedOption?.label || value}</strong>
            </>
          ) : (
            label
          )}
        </span>

        {isFiltered ? (
          <span
            onClick={handleClear}
            className="p-0.5 ml-0.5 rounded-sm hover:bg-primary-foreground/20 transition-colors"
            title={`Clear ${label} filter`}
            role="button"
          >
            <X className="h-3 w-3" />
          </span>
        ) : (
          <ChevronDown
            className={cn(
              "h-3.5 w-3.5 text-muted-foreground transition-transform duration-100 shrink-0",
              isOpen && "transform rotate-180"
            )}
          />
        )}
      </button>

      {/* Popover Dropdown */}
      {isOpen && (
        <div className="absolute left-0 mt-2 w-64 sm:w-72 rounded-sm border-2 border-foreground bg-popover text-popover-foreground nb-shadow-md z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
          {/* Search Input */}
          <div className="p-2 border-b-2 border-foreground bg-secondary">
            <div className="relative flex items-center">
              <Search className="absolute left-2.5 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={placeholder}
                className="w-full h-8 pl-8 pr-7 rounded-sm border-2 border-foreground bg-card text-xs font-medium text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2 p-0.5 text-muted-foreground hover:text-foreground rounded-sm"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
          </div>

          {/* Options List */}
          <div className="max-h-60 overflow-y-auto p-1.5 space-y-0.5 text-xs">
            <button
              type="button"
              onClick={() => handleSelect("All")}
              className={cn(
                "w-full flex items-center justify-between px-2.5 py-2 rounded-sm text-left font-bold border-2",
                !isFiltered
                  ? "bg-primary text-primary-foreground border-foreground"
                  : "text-foreground hover:bg-secondary border-transparent hover:border-foreground"
              )}
            >
              <span>{allLabel}</span>
              {!isFiltered && <Check className="h-3.5 w-3.5 shrink-0" />}
            </button>

            {filteredOptions.length === 0 ? (
              <div className="py-4 text-center text-xs text-muted-foreground font-bold">
                No matching results found
              </div>
            ) : (
              filteredOptions.map((opt) => {
                const isSelected = value === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => handleSelect(opt.value)}
                    className={cn(
                      "w-full flex items-center justify-between px-2.5 py-2 rounded-sm text-left group border-2",
                      isSelected
                        ? "bg-primary text-primary-foreground font-bold border-foreground"
                        : "text-foreground hover:bg-secondary font-medium border-transparent hover:border-foreground"
                    )}
                  >
                    <span className="truncate pr-2">{opt.label}</span>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {typeof opt.count === "number" && (
                        <span className={cn("font-mono text-[10px]", isSelected ? "text-primary-foreground/80" : "text-muted-foreground")}>
                          {opt.count}
                        </span>
                      )}
                      {isSelected && (
                        <Check className="h-3.5 w-3.5 shrink-0" />
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};
