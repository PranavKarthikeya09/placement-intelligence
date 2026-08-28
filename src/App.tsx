import React, { Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CompanyProvider } from "@/context/CompanyContext";
import { AppLayout } from "@/components/AppLayout";
import { Index } from "@/pages/Index";
import { CompanyIntelligence } from "@/pages/CompanyIntelligence";
import { SkillIntelligence } from "@/pages/SkillIntelligence";
import { NotFound } from "@/pages/NotFound";
import { ThemeProvider } from "@/context/ThemeContext";

// React Query Client configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster richColors position="top-right" />
          <CompanyProvider>
            <BrowserRouter>
              <Suspense
                fallback={
                  <div className="flex h-screen w-screen items-center justify-center bg-background">
                    <div className="flex flex-col items-center gap-3 p-6 rounded-sm border-2 border-foreground bg-card nb-shadow-md">
                      <div className="h-8 w-8 animate-spin rounded-none border-4 border-foreground border-t-primary" />
                      <span className="text-sm font-bold font-mono text-foreground">
                        Loading SVCE Placement Portal...
                      </span>
                    </div>
                  </div>
                }
              >
                <Routes>
                  <Route path="/" element={<Index />} />

                  <Route path="/company" element={<AppLayout />}>
                    <Route index element={<Navigate to="intelligence" replace />} />
                    <Route path="intelligence" element={<CompanyIntelligence />} />
                    <Route path="skills" element={<SkillIntelligence />} />
                  </Route>

                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </BrowserRouter>
          </CompanyProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
};

export default App;
