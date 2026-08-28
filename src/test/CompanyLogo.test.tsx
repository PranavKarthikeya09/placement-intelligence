import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { CompanyLogo, generateCompanyMonogram } from "../components/CompanyLogo";

describe("CompanyLogo Monogram and Fallback Test Suite", () => {
  it("generates deterministic 2-letter corporate monograms", () => {
    // 2-word companies
    expect(generateCompanyMonogram("Fractal Analytics Private Limited", "Fractal Analytics")).toBe("FA");
    expect(generateCompanyMonogram("Oracle India Private Limited", "Oracle India")).toBe("OI");
    expect(generateCompanyMonogram("Goldman Sachs", "Goldman Sachs")).toBe("GS");
    expect(generateCompanyMonogram("Morgan Stanley", "Morgan Stanley")).toBe("MS");
    expect(generateCompanyMonogram("Tata Consultancy Services", "TCS")).toBe("TC");
    expect(generateCompanyMonogram("Cisco Systems Inc.", "Cisco Systems")).toBe("CS");

    // Single-word companies
    expect(generateCompanyMonogram("Accenture plc", "Accenture")).toBe("AC");
    expect(generateCompanyMonogram("Google LLC", "Google")).toBe("GO");
    expect(generateCompanyMonogram("Apple Inc.", "Apple")).toBe("AP");
    expect(generateCompanyMonogram("Infosys Limited", "Infosys")).toBe("IN");
    expect(generateCompanyMonogram("Wipro Ltd", "Wipro")).toBe("WI");

    // CamelCase / Acronym companies
    expect(generateCompanyMonogram("SpaceX", "SpaceX")).toBe("SX");
    expect(generateCompanyMonogram("PayPal", "PayPal")).toBe("PP");
  });

  it("renders refined 2-letter monogram when no logo URL is provided", () => {
    render(
      <CompanyLogo
        name="Fractal Analytics"
        shortName="Fractal Analytics"
        category="Super Dream"
      />
    );

    // Monogram text should be visible
    expect(screen.getByText("FA")).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "Fractal Analytics logo" })).toBeInTheDocument();
  });

  it("renders company logo image when valid logoUrl is provided", () => {
    render(
      <CompanyLogo
        name="Google LLC"
        logoUrl="https://example-logo.com/google.png"
      />
    );

    const img = screen.getByRole("img", { name: "Google LLC logo" });
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute("src", "https://example-logo.com/google.png");
  });
});
