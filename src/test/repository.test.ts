import { describe, it, expect } from "vitest";
import {
  getCompanySummaries,
  getCompanyProfile,
  getCompanySkills,
} from "../lib/companyRepository";

describe("Company Repository Tests", () => {
  it("getCompanySummaries fetches and normalizes all companies", async () => {
    const summaries = await getCompanySummaries();
    expect(summaries).toBeDefined();
    expect(summaries.length).toBeGreaterThanOrEqual(100);
    console.log(`Fetched ${summaries.length} company summaries from repository.`);

    const first = summaries[0];
    expect(first.id).toBeDefined();
    expect(first.name).toBeDefined();
    expect(first.category).toBeDefined();
    
    const categories = Array.from(new Set(summaries.map((s) => s.category)));
    const industries = Array.from(new Set(summaries.map((s) => s.industry)));
    const locations = Array.from(new Set(summaries.map((s) => s.headquarters)));
    console.log("Distinct categories:", categories);
    console.log("Distinct industries count:", industries.length, industries.slice(0, 10));
    console.log("Distinct locations count:", locations.length, locations.slice(0, 10));
  }, 15000);

  it("getCompanyProfile fetches and normalizes company_json for company_id 1", async () => {
    const profile = await getCompanyProfile(1);
    expect(profile).not.toBeNull();
    expect(profile?.summary.name).toBe("Accenture plc");
    expect(profile?.rawFullJson).toBeDefined();
    console.log("Fetched company profile keys:", Object.keys(profile?.rawFullJson || {}));
  }, 15000);

  it("getCompanySkills fetches skills and 10-level topics for company_id 1", async () => {
    const skillsRes = await getCompanySkills(1);
    expect(skillsRes.skills).toBeDefined();
    expect(skillsRes.skills.length).toBeGreaterThan(0);
    console.log(`Fetched ${skillsRes.skills.length} skills for company 1:`, skillsRes.skills.map((s) => s.name));

    const firstSkillName = skillsRes.skills[0].name;
    const roadmap = skillsRes.topicsBySkillName[firstSkillName];
    expect(roadmap).toBeDefined();
    expect(roadmap.length).toBe(10);
    console.log(`Sample 10-level roadmap for ${firstSkillName}:`, roadmap.slice(0, 3));
  }, 15000);
});
