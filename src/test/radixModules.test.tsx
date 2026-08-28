import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { CategoryBadge } from "../components/radix/CategoryBadge";
import { ConfidenceBadge } from "../components/radix/ConfidenceBadge";
import { RadixPageHeader } from "../components/radix/RadixPageHeader";
import {
  LoadingState,
  EmptyState,
  ErrorState,
} from "../components/radix/RadixFeedbackStates";
import { JDAnalytics } from "../pages/radix/JDAnalytics";
import { ResumeParsing } from "../pages/radix/ResumeParsing";
import { ProfileBuilder } from "../pages/radix/ProfileBuilder";
import { SkillMatching } from "../pages/radix/SkillMatching";
import { FileCode2 } from "lucide-react";

const renderWithRouter = (ui: React.ReactElement) => {
  return render(<BrowserRouter>{ui}</BrowserRouter>);
};

describe("RADIX Frontend Modules Suite", () => {
  describe("Shared Components", () => {
    it("renders CategoryBadge with canonical code and optional label", () => {
      render(<CategoryBadge code="DSA" showLabel />);
      expect(screen.getByText("DSA")).toBeInTheDocument();
      expect(screen.getByText(/Data Structures & Algorithms/i)).toBeInTheDocument();
    });

    it("renders ConfidenceBadge with high/medium styling", () => {
      render(<ConfidenceBadge confidence="high" />);
      expect(screen.getByText(/HIGH CONF./i)).toBeInTheDocument();
    });

    it("renders RadixPageHeader with title and module badge", () => {
      render(
        <RadixPageHeader
          moduleNumber="01"
          moduleName="JD ANALYTICS"
          title="Job Description Analysis"
          description="Test description"
          icon={FileCode2}
        />
      );
      expect(screen.getByText(/MODULE 01 · JD ANALYTICS/i)).toBeInTheDocument();
      expect(screen.getByText("Job Description Analysis")).toBeInTheDocument();
    });

    it("renders LoadingState, EmptyState, and ErrorState cleanly", () => {
      const { rerender } = render(<LoadingState title="Loading Test" />);
      expect(screen.getByText("Loading Test")).toBeInTheDocument();

      rerender(<EmptyState title="Empty Test" message="No records found" />);
      expect(screen.getByText("Empty Test")).toBeInTheDocument();

      rerender(<ErrorState title="Error Test" message="Network error occurred" />);
      expect(screen.getByText("Error Test")).toBeInTheDocument();
    });
  });

  describe("Module 1: JD Analytics UI", () => {
    it("renders JD input area, quick samples, and analyze button", () => {
      renderWithRouter(<JDAnalytics />);
      expect(screen.getByText(/PASTE JOB DESCRIPTION/i)).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /Analyze Job Description/i })
      ).toBeInTheDocument();

      // Quick sample buttons exist
      expect(screen.getByRole("button", { name: /Google/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /Microsoft/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /Oracle/i })).toBeInTheDocument();
    });

    it("loads sample text when quick sample button is clicked", () => {
      renderWithRouter(<JDAnalytics />);
      const googleBtn = screen.getByRole("button", { name: /Google/i });
      fireEvent.click(googleBtn);

      const textarea = screen.getByPlaceholderText(/Paste complete Job Description/i) as HTMLTextAreaElement;
      expect(textarea.value).toContain("Google LLC");
    });
  });

  describe("Module 2: Resume Parsing UI", () => {
    it("renders resume upload dropzone, sample button, and parse action", () => {
      renderWithRouter(<ResumeParsing />);
      expect(screen.getByText(/UPLOAD RESUME OR PASTE TEXT/i)).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /Load Sample Resume/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /Parse Resume Document/i })).toBeInTheDocument();
    });

    it("populates sample resume on sample button click", () => {
      renderWithRouter(<ResumeParsing />);
      const sampleBtn = screen.getByRole("button", { name: /Load Sample Resume/i });
      fireEvent.click(sampleBtn);

      const textarea = screen.getByPlaceholderText(/Paste plain text resume content/i) as HTMLTextAreaElement;
      expect(textarea.value).toContain("Alex Chen");
    });
  });

  describe("Module 3: Profile Builder UI", () => {
    it("renders candidate profile tabs and basic information fields", () => {
      renderWithRouter(<ProfileBuilder />);
      expect(screen.getByText(/CANONICAL CANDIDATE PROFILE/i)).toBeInTheDocument();
      expect(screen.getByText(/PERSONAL & CONTACT INFORMATION/i)).toBeInTheDocument();
      expect(screen.getByText(/Save Profile/i)).toBeInTheDocument();
      expect(screen.getByText(/Import from Resume/i)).toBeInTheDocument();
    });

    it("switches tabs and allows adding new skills", () => {
      renderWithRouter(<ProfileBuilder />);
      const skillsTab = screen.getByRole("button", { name: /Skills/i });
      fireEvent.click(skillsTab);

      expect(screen.getByText(/CANDIDATE COMPETENCIES & PROFICIENCY LEVELS/i)).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /Add Skill/i })).toBeInTheDocument();
    });
  });

  describe("Module 5: Skill Matching UI", () => {
    it("renders candidate summary, target JD selector, and match button", () => {
      renderWithRouter(<SkillMatching />);
      expect(screen.getByText(/ACTIVE CANDIDATE/i)).toBeInTheDocument();
      expect(screen.getAllByText(/TARGET JOB DESCRIPTION/i).length).toBeGreaterThanOrEqual(1);

      expect(screen.getByText(/TALENT FIT EVALUATION/i)).toBeInTheDocument();
      expect(screen.getAllByText(/MATCH SCORE/i).length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText(/MATCHED COMPETENCIES/i)).toBeInTheDocument();
    });
  });
});
