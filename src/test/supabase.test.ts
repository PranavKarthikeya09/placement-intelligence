import { describe, it, expect } from "vitest";
import { supabase } from "../lib/supabase";

describe("Live Supabase Integration Smoke Test", () => {
  it("fetches companies count and sample row from Supabase", async () => {
    const { data, error } = await supabase
      .from("companies")
      .select("company_id, name, short_name, category, headquarters_address, employee_size, website_url")
      .limit(5);

    expect(error).toBeNull();
    expect(data).toBeDefined();
    expect(data!.length).toBeGreaterThan(0);
    console.log("Sample companies from Supabase:", data);
  });

  it("fetches company_json sample from Supabase", async () => {
    const { data, error } = await supabase
      .from("company_json")
      .select("company_id, short_json, full_json")
      .limit(1);

    expect(error).toBeNull();
    expect(data).toBeDefined();
    expect(data!.length).toBeGreaterThan(0);
    console.log("Sample company_json keys:", Object.keys(data![0].full_json || {}));
  });

  it("fetches company_skill_levels and skill_set_master from Supabase", async () => {
    const { data, error } = await supabase
      .from("company_skill_levels")
      .select("id, company_id, skill_set_id, required_level")
      .limit(5);

    expect(error).toBeNull();
    expect(data).toBeDefined();
    console.log("Sample skill levels:", data);
  });
});
