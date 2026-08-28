import { describe, it, expect } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import App from "../App";
import {
  deriveCompanyFingerprint,
  deriveIntelligenceSignals,
  deriveIntelligenceBrief,
  deriveCompanyJourney,
} from "../lib/derivedIntelligence";
import {
  normalizeCompanySummary,
  normalizeCompanyProfile,
  normalizeDashboardSkills,
  getPlacementCategory,
  cleanMarkdownUrl,
  isNullish,
} from "../lib/companyData";

describe("SVCE Placement Intelligence Hub Test Suite", () => {
  it("normalizes real Supabase company summary row correctly", () => {
    const rawSupabaseRow = {
      company_id: "1",
      company_name: "Accenture plc",
      short_name: "Accenture",
      category: "Enterprise",
      headquarters: "Dublin, Ireland",
      employee_size: "740,000 employees",
      yoy_growth_rate: "3%",
      website_url: "https://www.accenture.com",
      linkedin_url: "https://www.linkedin.com/company/accenture",
      short_description: "Global professional services powerhouse",
    };

    const summary = normalizeCompanySummary(rawSupabaseRow);
    expect(summary.id).toBe("1");
    expect(summary.name).toBe("Accenture plc");
    expect(summary.category).toBe("Enterprise");
    expect(summary.headquarters).toBe("Dublin, Ireland");
    expect(summary.websiteUrl).toBe("https://www.accenture.com");
    expect(getPlacementCategory(summary)).toBe("Dream");
  });

  it("handles nullish values and markdown URLs correctly", () => {
    expect(isNullish(null)).toBe(true);
    expect(isNullish(undefined)).toBe(true);
    expect(isNullish("")).toBe(true);
    expect(isNullish("n/a")).toBe(true);
    expect(isNullish("none")).toBe(true);
    expect(isNullish("Valid Value")).toBe(false);

    expect(cleanMarkdownUrl("[https://example.com](https://example.com)")).toBe("https://example.com");
    expect(cleanMarkdownUrl("https://example.com")).toBe("https://example.com");
  });

  it("normalizes dashboard skills with Bloom and criticality mappings", () => {
    const rawSkills = [
      { skill_id: "1", skill_name: "Coding", required_level: 8 },
      { skill_id: "2", skill_name: "Networking", required_level: 3 },
      { skill_id: "3", skill_name: "Cloud", required_level: 6 },
    ];

    const skills = normalizeDashboardSkills(rawSkills);
    expect(skills).toHaveLength(3);
    expect(skills[0].name).toBe("Coding");
    expect(skills[0].score).toBe(8);
    expect(skills[0].bloom).toBe("EV");
    expect(skills[0].criticality).toBe("Critical");

    expect(skills[1].name).toBe("Cloud");
    expect(skills[1].score).toBe(6);
    expect(skills[1].bloom).toBe("AS");
    expect(skills[1].criticality).toBe("Important");

    expect(skills[2].name).toBe("Networking");
    expect(skills[2].score).toBe(3);
    expect(skills[2].bloom).toBe("AP");
    expect(skills[2].criticality).toBe("Baseline");
  });

  it("calculates deterministic derived intelligence metrics for Supabase profile", () => {
    const rawProfile = {
      name: "Accenture plc",
      category: "Enterprise",
      tech_stack: "SAP; Salesforce; AWS; Microsoft Azure; ServiceNow; Kubernetes; Python",
      ai_ml_adoption_level: "High",
      operating_countries: "United States; United Kingdom; India; Germany; France; Japan; Australia; Canada",
      employee_size: "740,000 employees",
      learning_culture: "Continuous TQ certifications and sponsored learning portals",
      training_spend: "$1B annual training investment",
      brand_value: "$220B market capitalization",
      top_customers: "90+ of Fortune Global 100",
      macro_risks: "Enterprise spending cycles and matrix complexity",
    };

    const profile = normalizeCompanyProfile(rawProfile, { name: "Accenture plc", category: "Enterprise" });

    // 1. Fingerprint test
    const dimensions = deriveCompanyFingerprint(profile);
    expect(dimensions).toHaveLength(8);
    dimensions.forEach((dim) => {
      expect(dim.score).toBeGreaterThan(0);
      expect(dim.score).toBeLessThanOrEqual(100);
    });

    // 2. Signals test
    const signals = deriveIntelligenceSignals(profile);
    expect(signals).toHaveLength(5);
    signals.forEach((sig) => {
      expect(sig.evidence.length).toBeGreaterThan(0);
    });

    // 3. Brief test
    const brief = deriveIntelligenceBrief(profile);
    expect(brief.companyName).toBe("Accenture plc");
    expect(brief.strongestSignal).toContain("SAP");

    // 4. Journey test
    const journey = deriveCompanyJourney(profile);
    expect(journey.length).toBeGreaterThanOrEqual(3);
  });

  it("renders the main portal hero, how the portal works modules, featured company, and compact filters", async () => {
    render(<App />);

    // Verify main college hero title
    const heading = await screen.findByText(
      /Sri Venkateswara College of Engineering Companies Research & Placement Analytics Portal/i
    );
    expect(heading).toBeInTheDocument();

    // Verify How The Portal Works modules
    expect(screen.getByText("HOW THE PORTAL WORKS")).toBeInTheDocument();
    expect(screen.getByText("COMPANY")).toBeInTheDocument();
    expect(screen.getByText("SKILLS")).toBeInTheDocument();
    expect(screen.getByText("PATH")).toBeInTheDocument();

    // Wait for companies to load and featured company spotlight to render
    await waitFor(() => {
      expect(screen.getByText("FEATURED COMPANY SPOTLIGHT")).toBeInTheDocument();
    }, { timeout: 15000 });

    // Verify 5 primary placement pills exist
    expect(screen.getByRole("button", { name: /^All/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^Super Dream/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^Dream/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^Standard/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^Regular/i })).toBeInTheDocument();

    // Verify secondary dropdown buttons exist
    expect(screen.getByRole("button", { name: /^Industry/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^Company Type/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^Location/i })).toBeInTheDocument();

    // Click Super Dream primary filter
    const superDreamBtn = screen.getByRole("button", { name: /^Super Dream/i });
    fireEvent.click(superDreamBtn);

    // Verify filter is active
    expect(superDreamBtn).toHaveClass("bg-primary", "text-primary-foreground");
  }, 30000);

  it("navigates to company intelligence on card click and renders sections", async () => {
    render(<App />);

    // Wait for companies to load and click on explore button
    const exploreBtns = await screen.findAllByRole("button", { name: /Explore Company Intelligence/i }, { timeout: 12000 });
    expect(exploreBtns.length).toBeGreaterThanOrEqual(1);
    fireEvent.click(exploreBtns[0]);

    // Should navigate and show Research Brief, Fingerprint, Signals, Journey, and 22 Sections
    await waitFor(() => {
      expect(screen.getByText(/RESEARCH BRIEF/i)).toBeInTheDocument();
      expect(screen.getByText("COMPANY FINGERPRINT")).toBeInTheDocument();
      expect(screen.getByText("INTELLIGENCE SIGNALS")).toBeInTheDocument();
      expect(screen.getByText(/COMPANY JOURNEY & STRATEGIC TRAJECTORY/i)).toBeInTheDocument();
      expect(screen.getByText("THE COMPANY")).toBeInTheDocument();
      expect(screen.getByText("WHAT THEY BUILD")).toBeInTheDocument();
      expect(screen.getByText("HOW THEY COMPETE")).toBeInTheDocument();
      expect(screen.getByText("WORKING THERE")).toBeInTheDocument();
      expect(screen.getByText("TRUST & REPUTATION")).toBeInTheDocument();
    }, { timeout: 12000 });
  }, 15000);

  it("navigates to skill intelligence and renders skill gap simulator", async () => {
    render(<App />);

    // Navigate to Skill Intelligence
    const skillElements = await screen.findAllByText(/Skill Intelligence/i, {}, { timeout: 12000 });
    expect(skillElements.length).toBeGreaterThanOrEqual(1);
    fireEvent.click(skillElements[0]);

    await waitFor(() => {
      expect(screen.getByText(/YOUR PATH TO THE COMPANY/i)).toBeInTheDocument();
      expect(screen.getByText(/SKILL PROFILE OVERVIEW/i)).toBeInTheDocument();
      expect(screen.getByText(/SKILL GAP SIMULATOR/i)).toBeInTheDocument();
    }, { timeout: 12000 });
  }, 15000);
});
