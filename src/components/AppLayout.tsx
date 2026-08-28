import React, { useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate, Link } from "react-router-dom";
import {
  FileText,
  GraduationCap,
  ArrowLeft,
  Menu,
  X,
  ChevronRight,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { useCompany } from "@/context/CompanyContext";
import { CompanyLogo } from "@/components/CompanyLogo";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/ThemeToggle";
import { cn } from "@/lib/utils";

export const AppLayout: React.FC = () => {
  const { companySummary, allCompaniesSummary } = useCompany();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const isSkills = location.pathname.includes("/company/skills");
  const isIntelligence = location.pathname.includes("/company/intelligence");

  const navItems = [
    {
      num: "01",
      title: "Company Intelligence",
      href: "/company/intelligence",
      icon: FileText,
      active: isIntelligence,
      badge: "22 Sections",
    },
    {
      num: "02",
      title: "Skill Intelligence",
      href: "/company/skills",
      icon: GraduationCap,
      active: isSkills,
      badge: "12 Skills",
    },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row text-foreground">
      {/* Mobile Drawer Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-foreground/60 z-40 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Neo-Brutalist Sidebar */}
      <aside
        className={cn(
          "fixed top-0 bottom-0 left-0 z-50 flex flex-col bg-card border-r-[3px] border-foreground md:static",
          isCollapsed ? "w-16" : "w-64",
          mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-4 border-b-2 border-foreground">
          <Link
            to="/"
            className="flex items-center gap-2.5 overflow-hidden group focus:outline-none"
            onClick={() => setMobileOpen(false)}
          >
            <div className="h-8 w-8 rounded-sm bg-primary text-primary-foreground flex items-center justify-center shrink-0 font-heading font-bold text-xs border-2 border-foreground nb-shadow-sm">
              SV
            </div>
            {!isCollapsed && (
              <div className="flex flex-col truncate">
                <span className="font-heading text-xs font-bold text-foreground tracking-tight leading-tight">
                  SVCE INTELLIGENCE
                </span>
                <span className="text-[10px] font-mono text-muted-foreground uppercase">
                  RESEARCH PORTAL
                </span>
              </div>
            )}
          </Link>

          <div className="flex items-center">
            {/* Collapse toggle on desktop */}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="hidden md:flex p-1 text-muted-foreground hover:text-foreground rounded-sm border border-transparent hover:border-foreground"
              aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {isCollapsed ? (
                <PanelLeftOpen className="h-3.5 w-3.5" />
              ) : (
                <PanelLeftClose className="h-3.5 w-3.5" />
              )}
            </button>

            {/* Mobile close */}
            <button
              onClick={() => setMobileOpen(false)}
              className="md:hidden p-1.5 text-muted-foreground hover:text-foreground rounded-sm"
              aria-label="Close Sidebar"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Selected Company Mini Context Panel */}
        {companySummary && (
          <div className="p-3 border-b-2 border-foreground bg-secondary">
            <div className="flex items-center gap-2.5">
              <CompanyLogo
                name={companySummary.name}
                shortName={companySummary.shortName}
                logoUrl={companySummary.logoUrl}
                websiteUrl={companySummary.websiteUrl}
                category={companySummary.category}
                size="sm"
              />
              {!isCollapsed && (
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-bold text-foreground truncate">
                    {companySummary.name}
                  </span>
                  <Badge
                    variant="outline"
                    className="w-fit text-[9px] px-1 py-0 text-muted-foreground uppercase font-mono mt-0.5"
                  >
                    {companySummary.category}
                  </Badge>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Navigation Items */}
        <div className="flex-1 py-4 px-2 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.href}
                to={item.href}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-sm text-xs font-bold transition-all duration-100 select-none border-2",
                    isActive
                      ? "bg-primary text-primary-foreground border-foreground nb-shadow-sm"
                      : "text-muted-foreground border-transparent hover:bg-secondary hover:text-foreground hover:border-foreground"
                  )
                }
              >
                <Icon className="h-4 w-4 shrink-0" />
                {!isCollapsed && (
                  <div className="flex flex-1 items-center justify-between truncate">
                    <span className="truncate">{item.title}</span>
                    <span
                      className={cn(
                        "text-[10px] font-mono",
                        item.active ? "text-primary-foreground/80" : "text-muted-foreground"
                      )}
                    >
                      {item.badge}
                    </span>
                  </div>
                )}
              </NavLink>
            );
          })}
        </div>

        {/* Sidebar Footer */}
        <div className="p-3 border-t-2 border-foreground space-y-2 bg-card">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/")}
            className={cn(
              "w-full justify-start gap-2 text-xs font-bold h-8",
              isCollapsed && "justify-center px-0"
            )}
          >
            <ArrowLeft className="h-3.5 w-3.5 shrink-0" />
            {!isCollapsed && <span>All Companies</span>}
          </Button>

          {!isCollapsed && (
            <div className="pt-1.5 px-1 text-[10px] font-mono text-muted-foreground flex justify-between border-t-2 border-foreground">
              <span>{allCompaniesSummary.length || 118} COMPANIES</span>
              <span>SVCE 2026</span>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content Layout */}
      <div className="flex-1 flex flex-col min-w-0 bg-background">
        {/* Top Header Bar */}
        <header className="sticky top-0 z-30 flex items-center justify-between h-13 px-4 sm:px-6 bg-card border-b-[3px] border-foreground">
          {/* Left: Mobile trigger & Breadcrumbs */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="md:hidden p-1.5 text-muted-foreground hover:text-foreground rounded-sm border-2 border-transparent hover:border-foreground"
              aria-label="Open Sidebar"
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* Breadcrumb Navigation */}
            <nav className="flex items-center gap-1.5 text-xs text-muted-foreground truncate font-mono">
              <Link
                to="/"
                className="hover:text-foreground font-bold hidden sm:inline"
              >
                Portal
              </Link>
              <ChevronRight className="h-3 w-3 text-muted-foreground hidden sm:inline shrink-0" />
              <span className="font-bold text-foreground truncate">
                {companySummary?.name || "Company"}
              </span>
              <ChevronRight className="h-3 w-3 text-muted-foreground shrink-0" />
              <span className="text-primary font-bold truncate">
                {isSkills ? "Skill Intelligence" : "Company Intelligence"}
              </span>
            </nav>
          </div>

          {/* Right Header Metadata + Theme Toggle */}
          <div className="flex items-center gap-2.5">
            <div className="hidden sm:flex items-center gap-2 text-[11px] font-mono font-bold text-muted-foreground px-2.5 py-1 rounded-sm border-2 border-foreground bg-secondary">
              <span>SVCE PLACEMENT INTELLIGENCE</span>
            </div>
            {companySummary?.category && (
              <Badge variant={companySummary.category.toLowerCase().replace(/\s+/g, "-") as any} className="text-[10px]">
                {companySummary.category}
              </Badge>
            )}
            <ThemeToggle />
          </div>
        </header>

        {/* Child Routes Outlet */}
        <main className="flex-1 min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
