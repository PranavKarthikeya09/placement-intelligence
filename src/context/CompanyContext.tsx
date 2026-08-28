import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { useQuery } from "@tanstack/react-query";
import {
  CompanySummary,
  CompanyProfile,
  DashboardSkill,
} from "@/lib/companyData";
import {
  getCompanySummaries,
  getCompanyProfile,
  getCompanySkills,
} from "@/lib/companyRepository";
import { SkillRoadmapLevel } from "@/data/skillTopics";

const STORAGE_KEY = "selected-company";

export interface SelectedCompanyStorage {
  companyId: string;
  companyName: string;
  logoUrl?: string;
}

interface CompanyContextType {
  selectedCompany: SelectedCompanyStorage | null;
  companySummary: CompanySummary | null;
  companyProfile: CompanyProfile | null;
  skills: DashboardSkill[];
  skillTopicsBySkillName: Record<string, SkillRoadmapLevel[]>;
  allCompaniesSummary: CompanySummary[];
  setSelectedCompanyById: (companyId: string) => boolean;
  clearSelectedCompany: () => void;
  isLoading: boolean;
  isProfileLoading: boolean;
  isSkillsLoading: boolean;
  isError: boolean;
  profileError: Error | null;
  skillsError: Error | null;
  refetchCompanies: () => void;
  refetchProfile: () => void;
  refetchSkills: () => void;
}

const CompanyContext = createContext<CompanyContextType | undefined>(undefined);

export const CompanyProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // 1. Fetch all company summaries via React Query
  const {
    data: allCompanies = [],
    isLoading: isCompaniesLoading,
    isError: isCompaniesError,
    refetch: refetchCompanies,
  } = useQuery({
    queryKey: ["companies"],
    queryFn: getCompanySummaries,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
    retry: 1,
    refetchOnWindowFocus: false,
  });

  // 2. Initial selected company from localStorage
  const [selectedCompany, setSelectedCompany] = useState<SelectedCompanyStorage | null>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.companyId) {
          return {
            companyId: String(parsed.companyId),
            companyName: parsed.companyName || "",
            logoUrl: parsed.logoUrl,
          };
        }
      }
    } catch {
      // Storage error
    }
    return null;
  });

  // Auto-select first company once companies load ONLY IF no selection exists in state OR storage
  useEffect(() => {
    if (allCompanies.length > 0) {
      if (!selectedCompany) {
        try {
          const stored = localStorage.getItem(STORAGE_KEY);
          if (stored) {
            const parsed = JSON.parse(stored);
            if (parsed && parsed.companyId) {
              const matched = allCompanies.find((c) => String(c.id) === String(parsed.companyId));
              setSelectedCompany({
                companyId: String(parsed.companyId),
                companyName: matched ? matched.name : parsed.companyName || "",
                logoUrl: matched ? matched.logoUrl : parsed.logoUrl,
              });
              return;
            }
          }
        } catch {
          // Safe storage read
        }

        // Only default to first company if genuinely nothing was stored
        const first = allCompanies[0];
        const initial: SelectedCompanyStorage = {
          companyId: String(first.id),
          companyName: first.name,
          logoUrl: first.logoUrl,
        };
        setSelectedCompany(initial);
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
        } catch {
          // Safe localStorage write
        }
      }
    }
  }, [selectedCompany, allCompanies]);

  const activeCompanyId = selectedCompany?.companyId;

  // 3. Fetch selected company profile via React Query
  const {
    data: companyProfile = null,
    isLoading: isProfileLoading,
    error: profileError,
    refetch: refetchProfile,
  } = useQuery({
    queryKey: ["company-profile", activeCompanyId],
    queryFn: () => (activeCompanyId ? getCompanyProfile(activeCompanyId) : null),
    enabled: !!activeCompanyId,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
    retry: 1,
    refetchOnWindowFocus: false,
  });

  // 4. Fetch selected company skills via React Query
  const {
    data: skillsData,
    isLoading: isSkillsLoading,
    error: skillsError,
    refetch: refetchSkills,
  } = useQuery({
    queryKey: ["company-skills", activeCompanyId],
    queryFn: () => (activeCompanyId ? getCompanySkills(activeCompanyId) : { skills: [], topicsBySkillName: {} }),
    enabled: !!activeCompanyId,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
    retry: 1,
    refetchOnWindowFocus: false,
  });

  // 5. Active company summary from allCompanies or companyProfile
  const companySummary = useMemo(() => {
    if (companyProfile?.summary) return companyProfile.summary;
    if (!activeCompanyId) return null;
    return allCompanies.find((c) => String(c.id) === String(activeCompanyId)) || null;
  }, [companyProfile, activeCompanyId, allCompanies]);

  const skills = useMemo(() => {
    return skillsData?.skills || [];
  }, [skillsData]);

  const skillTopicsBySkillName = useMemo(() => {
    return skillsData?.topicsBySkillName || {};
  }, [skillsData]);

  // Set selected company by ID
  const setSelectedCompanyById = useCallback(
    (companyId: string): boolean => {
      const idStr = String(companyId);
      const found = allCompanies.find((c) => String(c.id) === idStr);
      const newSelected: SelectedCompanyStorage = {
        companyId: idStr,
        companyName: found ? found.name : selectedCompany?.companyName || "",
        logoUrl: found ? found.logoUrl : selectedCompany?.logoUrl,
      };
      setSelectedCompany(newSelected);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newSelected));
      } catch {
        // Safe localStorage write
      }
      return true;
    },
    [allCompanies, selectedCompany]
  );

  const clearSelectedCompany = useCallback(() => {
    setSelectedCompany(null);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Safe localStorage remove
    }
  }, []);

  return (
    <CompanyContext.Provider
      value={{
        selectedCompany,
        companySummary,
        companyProfile,
        skills,
        skillTopicsBySkillName,
        allCompaniesSummary: allCompanies,
        setSelectedCompanyById,
        clearSelectedCompany,
        isLoading: isCompaniesLoading,
        isProfileLoading,
        isSkillsLoading,
        isError: isCompaniesError,
        profileError: profileError as Error | null,
        skillsError: skillsError as Error | null,
        refetchCompanies,
        refetchProfile,
        refetchSkills,
      }}
    >
      {children}
    </CompanyContext.Provider>
  );
};

export function useCompany(): CompanyContextType {
  const context = useContext(CompanyContext);
  if (!context) {
    throw new Error("useCompany must be used within a CompanyProvider");
  }
  return context;
}
