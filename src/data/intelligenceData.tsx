import {
  CompanyProfile,
  IntelligenceSection,
  SectionField,
  titleCaseFromCode,
  cleanMarkdownUrl,
  isNullish,
} from "../lib/companyData";

export function buildIntelligenceSections(profile?: CompanyProfile): IntelligenceSection[] {
  const full = profile?.rawFullJson || {};

  // Helper to extract fields from nested section object OR flat full_json
  const getFields = (
    nestedKey: string,
    keyDefinitions: Record<string, { label: string; type?: SectionField["type"]; highlight?: boolean }>
  ): SectionField[] => {
    const nestedData = full[nestedKey];
    const isNested = nestedData && typeof nestedData === "object" && !Array.isArray(nestedData);
    const dataSource = isNested ? nestedData : full;

    const fields: SectionField[] = [];

    // Process defined keys
    for (const [key, def] of Object.entries(keyDefinitions)) {
      const val = dataSource[key];
      const hasVal = !isNullish(val);
      const displayVal = hasVal ? val : "Not Available";

      let fieldType: SectionField["type"] = def.type;
      if (!fieldType) {
        if (typeof val === "string" && (val.startsWith("http://") || val.startsWith("https://") || val.startsWith("["))) {
          fieldType = "url";
        } else if (Array.isArray(val) || (typeof val === "string" && val.includes(";"))) {
          fieldType = "list";
        } else {
          fieldType = "text";
        }
      }

      fields.push({
        label: def.label,
        value: displayVal,
        type: fieldType,
        highlight: def.highlight,
      });
    }

    // If nested object has other non-specified keys, include them as text
    if (isNested) {
      for (const [key, val] of Object.entries(nestedData)) {
        if (keyDefinitions[key]) continue;
        const cleanVal = typeof val === "string" ? cleanMarkdownUrl(val) : val;
        const isUrl = typeof cleanVal === "string" && (cleanVal.startsWith("http://") || cleanVal.startsWith("https://"));
        fields.push({
          label: titleCaseFromCode(key),
          value: !isNullish(val) ? val : "Not Available",
          type: isUrl ? "url" : "text",
        });
      }
    }

    return fields;
  };

  return [
    {
      id: "company-identity",
      title: "Company Identity",
      iconName: "Building2",
      description: "Corporate structure, founding background, legal entities, and ticker information",
      fields: getFields("company_identity", {
        legal_name: { label: "Legal Entity Name", type: "text" },
        name: { label: "Company Name", type: "text" },
        incorporation_date: { label: "Incorporation & History", type: "text" },
        incorporation_year: { label: "Incorporation Year", type: "badge" },
        company_maturity: { label: "Company Maturity", type: "badge" },
        stock_ticker: { label: "Stock Ticker & Exchange", type: "badge" },
        nature_of_company: { label: "Nature of Company", type: "badge" },
        global_headquarters: { label: "Global Headquarters", type: "text" },
        headquarters_address: { label: "Headquarters Address", type: "text" },
        india_corporate_hub: { label: "India Corporate Office", type: "text" },
        office_count: { label: "Total Office Count", type: "badge" },
        business_model: { label: "Business Model", type: "text" },
        primary_industry: { label: "Primary Industry", type: "badge" },
        category: { label: "Company Classification", type: "badge" },
      }),
    },
    {
      id: "overview-vision",
      title: "Overview & Vision",
      iconName: "Compass",
      description: "Mission, vision, core purpose, strategic focus, and global scale",
      fields: getFields("overview_vision", {
        overview_text: { label: "Executive Overview", type: "text" },
        core_purpose: { label: "Core Purpose", type: "text" },
        vision_statement: { label: "Vision Statement", type: "text" },
        mission_statement: { label: "Mission Statement", type: "text" },
        mission_clarity: { label: "Mission Clarity", type: "text" },
        strategic_focus_areas: { label: "Strategic Focus Areas", type: "list" },
        strategic_priorities: { label: "Strategic Priorities", type: "list" },
        focus_sectors: { label: "Focus Industry Sectors", type: "list" },
        operating_groups: { label: "Operating Groups", type: "list" },
        scale_summary: { label: "Global Scale & Reach", type: "text" },
      }),
    },
    {
      id: "leadership",
      title: "Leadership",
      iconName: "Users2",
      description: "Executive committee, chair, CEO, CTO, and management governance",
      fields: getFields("leadership", {
        ceo_name: { label: "Chief Executive Officer (CEO)", type: "text" },
        chair_and_ceo: { label: "Chair & Chief Executive Officer", type: "text" },
        ceo_linkedin_url: { label: "CEO LinkedIn Profile", type: "url" },
        key_leaders: { label: "Key Executive Leadership", type: "list" },
        board_members: { label: "Board of Directors", type: "list" },
        manager_quality: { label: "Management Quality", type: "text" },
        decision_maker_access: { label: "Decision Maker Access", type: "text" },
        chief_financial_officer: { label: "Chief Financial Officer", type: "text" },
        chief_technology_officer: { label: "Chief Technology & Innovation Officer", type: "text" },
        india_market_lead: { label: "India Market Leadership", type: "text" },
        leadership_governance: { label: "Governance Structure", type: "text" },
      }),
    },
    {
      id: "funding-financials",
      title: "Funding & Financials",
      iconName: "TrendingUp",
      description: "Revenues, operating margins, valuation, burn rate, and investment scale",
      fields: getFields("funding_financials", {
        annual_revenue: { label: "Annual Revenue", type: "badge" },
        annual_profit: { label: "Annual Profit", type: "text" },
        valuation: { label: "Enterprise Valuation / Market Cap", type: "badge" },
        profitability_status: { label: "Profitability Status", type: "badge" },
        yoy_growth_rate: { label: "YoY Revenue Growth", type: "badge" },
        operating_margin: { label: "Operating Margin", type: "text" },
        free_cash_flow: { label: "Free Cash Flow", type: "text" },
        total_capital_raised: { label: "Total Capital Raised", type: "text" },
        recent_funding_rounds: { label: "Recent Funding Rounds", type: "text" },
        burn_rate: { label: "Burn Rate", type: "text" },
        burn_multiplier: { label: "Burn Multiplier", type: "text" },
        runway_months: { label: "Financial Runway", type: "text" },
        ai_investment_commitment: { label: "Data & AI Investment Commitment", type: "text" },
        financial_credit_rating: { label: "Credit Rating", type: "badge" },
      }),
    },
    {
      id: "global-presence",
      title: "Global Presence",
      iconName: "Globe2",
      description: "Operating territories, major delivery networks, and regional development centers",
      fields: getFields("global_presence", {
        operating_countries: { label: "Operating Countries", type: "list" },
        countries_active: { label: "Active Countries Count", type: "badge" },
        office_locations: { label: "Major Office Hubs", type: "list" },
        key_global_delivery_centers: { label: "Key Global Delivery Centers", type: "list" },
        global_exposure: { label: "Global Exposure Quality", type: "text" },
        india_footprint_details: { label: "India Footprint & Scale", type: "text" },
        chennai_presence: { label: "Chennai Campus Presence", type: "text" },
      }),
    },
    {
      id: "products-services",
      title: "Products & Services",
      iconName: "Layers",
      description: "Core service practices, product offerings, proprietary platforms, and enterprise solutions",
      fields: getFields("products_services", {
        offerings_description: { label: "Core Enterprise Offerings", type: "text" },
        product_pipeline: { label: "Product & Service Pipeline", type: "text" },
        case_studies: { label: "Client Case Studies", type: "text" },
        pain_points_addressed: { label: "Enterprise Pain Points Addressed", type: "text" },
        work_impact: { label: "Client Transformation Impact", type: "text" },
        core_divisions: { label: "Core Business Divisions", type: "list" },
        flagship_platforms: { label: "Flagship Technology Platforms", type: "list" },
        key_offerings: { label: "Key Enterprise Solutions", type: "list" },
      }),
    },
    {
      id: "technology-stack",
      title: "Technology Stack",
      iconName: "Cpu",
      description: "Primary languages, cloud suites, automation level, and AI/ML architectures",
      fields: getFields("technology_stack", {
        tech_stack: { label: "Core Technology Stack", type: "list" },
        ai_ml_adoption_level: { label: "AI & ML Adoption Level", type: "badge" },
        automation_level: { label: "Automation Level", type: "text" },
        tech_adoption_rating: { label: "Tech Adoption Velocity", type: "text" },
        r_and_d_investment: { label: "R&D & Innovation Spending", type: "text" },
        tools_access: { label: "Developer Tools & Platforms", type: "list" },
        programming_languages: { label: "Programming Languages", type: "list" },
        cloud_platforms: { label: "Cloud Platforms", type: "list" },
        enterprise_ecosystems: { label: "Enterprise Ecosystems", type: "list" },
        ai_data_platforms: { label: "AI & Data Platforms", type: "list" },
        devops_infrastructure: { label: "DevOps & Infrastructure", type: "list" },
        databases: { label: "Databases & Storage", type: "list" },
      }),
    },
    {
      id: "partnerships-ecosystem",
      title: "Partnerships & Ecosystem",
      iconName: "Handshake",
      description: "Global cloud alliances, tech vendor networks, and ecosystem alliances",
      fields: getFields("partnerships_ecosystem", {
        partnership_ecosystem: { label: "Strategic Alliance Ecosystem", type: "list" },
        technology_partners: { label: "Technology Platform Partners", type: "list" },
        industry_associations: { label: "Industry & Standard Associations", type: "list" },
        network_strength: { label: "Partner Network Depth", type: "text" },
        premier_alliances: { label: "Premier Cloud Alliances", type: "list" },
        enterprise_partners: { label: "Strategic Enterprise Partners", type: "list" },
        academic_collaborations: { label: "Academic Research Collaborations", type: "list" },
      }),
    },
    {
      id: "competitive-landscape",
      title: "Competitive Landscape",
      iconName: "Swords",
      description: "Direct competitors, key differentiators, and market share position",
      fields: getFields("competitive_landscape", {
        key_competitors: { label: "Primary Market Competitors", type: "list" },
        primary_competitors: { label: "Competitor Benchmarks", type: "list" },
        competitive_advantages: { label: "Competitive Advantages", type: "text" },
        unique_differentiators: { label: "Unique Differentiators", type: "text" },
        key_differentiators: { label: "Strategic Moats", type: "text" },
        market_share_percentage: { label: "Market Share Estimate", type: "badge" },
        benchmark_vs_peers: { label: "Peer Comparison Rating", type: "text" },
      }),
    },
    {
      id: "market-opportunity",
      title: "Market Opportunity",
      iconName: "Rocket",
      description: "Total addressable market (TAM), SAM, SOM, and long-term industry catalysts",
      fields: getFields("market_opportunity", {
        tam: { label: "Total Addressable Market (TAM)", type: "badge" },
        sam: { label: "Serviceable Addressable Market (SAM)", type: "badge" },
        som: { label: "Serviceable Obtainable Market (SOM)", type: "badge" },
        future_projections: { label: "Industry Growth Projections", type: "text" },
        key_challenges_needs: { label: "Market Demand & Unmet Needs", type: "text" },
        addressable_market: { label: "Market Scope", type: "badge" },
        core_growth_drivers: { label: "Core Growth Drivers", type: "list" },
      }),
    },
    {
      id: "core-value-proposition-esg",
      title: "Core Value Proposition & ESG",
      iconName: "Leaf",
      description: "Sustainability commitments, net-zero initiatives, and ethical governance standards",
      fields: getFields("core_value_proposition_esg", {
        core_value_proposition: { label: "Core Value Proposition", type: "text" },
        esg_ratings: { label: "ESG Rating & Performance", type: "badge" },
        sustainability_csr: { label: "Sustainability & CSR Programs", type: "text" },
        carbon_footprint: { label: "Carbon Footprint & Net-Zero Target", type: "text" },
        ethical_standards: { label: "Ethical Operating Standards", type: "text" },
        ethical_sourcing: { label: "Ethical Sourcing & Supply Chain", type: "text" },
        diversity_metrics: { label: "Diversity & Inclusion Metrics", type: "text" },
      }),
    },
    {
      id: "culture-work-life",
      title: "Culture & Work Life",
      iconName: "Smile",
      description: "Organizational values, psychological safety, hybrid flexibility, and work hours",
      fields: getFields("culture_work_life", {
        core_values: { label: "Core Values", type: "list" },
        work_culture_summary: { label: "Work Culture & Environment", type: "text" },
        feedback_culture: { label: "Feedback & Appraisal Culture", type: "text" },
        psychological_safety: { label: "Psychological Safety & Support", type: "text" },
        flexibility_level: { label: "Workplace Flexibility", type: "badge" },
        remote_policy_details: { label: "Remote & Hybrid Work Policy", type: "text" },
        typical_hours: { label: "Typical Daily Working Hours", type: "text" },
        weekend_work: { label: "Weekend Work Frequency", type: "badge" },
        overtime_expectations: { label: "Overtime Expectations", type: "text" },
      }),
    },
    {
      id: "recent-news-milestones",
      title: "Recent News & Milestones",
      iconName: "Newspaper",
      description: "Major investment announcements, strategic partnerships, awards, and historical milestones",
      fields: getFields("recent_news_milestones", {
        recent_news: { label: "Recent Corporate News & Updates", type: "text" },
        history_timeline: { label: "Historical Evolution Timeline", type: "text" },
        innovation_roadmap: { label: "Forward Innovation Roadmap", type: "text" },
        awards_recognitions: { label: "Industry Awards & Recognition", type: "list" },
        event_participation: { label: "Global Tech Summit Participation", type: "text" },
      }),
    },
    {
      id: "sales-customer-metrics",
      title: "Sales & Customer Metrics",
      iconName: "BarChart3",
      description: "Customer scale, top enterprise accounts, sales motion, churn rate, and LTV",
      fields: getFields("sales_customer_metrics", {
        sales_motion: { label: "Primary Sales & Go-To-Market Motion", type: "badge" },
        top_customers: { label: "Top Customer Portfolio", type: "list" },
        client_quality: { label: "Client Enterprise Caliber", type: "text" },
        customer_testimonials: { label: "Customer Endorsements & NPS", type: "text" },
        revenue_mix: { label: "Revenue Breakdown by Division", type: "text" },
        churn_rate: { label: "Customer Churn Rate", type: "badge" },
        customer_acquisition_cost: { label: "Customer Acquisition Cost (CAC)", type: "text" },
        customer_lifetime_value: { label: "Customer Lifetime Value (LTV)", type: "text" },
        cac_ltv_ratio: { label: "CAC to LTV Ratio", type: "badge" },
        net_promoter_score: { label: "Net Promoter Score (NPS)", type: "badge" },
      }),
    },
    {
      id: "risk-compliance",
      title: "Risk & Compliance",
      iconName: "ShieldCheck",
      description: "Macroeconomic exposure, legal status, regulatory adherence, and cybersecurity posture",
      fields: getFields("risk_compliance", {
        macro_risks: { label: "Macroeconomic Risk Factors", type: "text" },
        geopolitical_risks: { label: "Geopolitical Risk Exposure", type: "text" },
        customer_concentration_risk: { label: "Customer Concentration Risk", type: "text" },
        supply_chain_dependencies: { label: "Supply Chain Dependencies", type: "text" },
        legal_issues: { label: "Legal & Regulatory Inquiries", type: "text" },
        regulatory_status: { label: "Regulatory Compliance Status", type: "badge" },
        cybersecurity_posture: { label: "Cybersecurity & InfoSec Posture", type: "text" },
        crisis_behavior: { label: "Crisis Management & Resilience", type: "text" },
      }),
    },
    {
      id: "work-location-commute",
      title: "Work Location & Commute",
      iconName: "Navigation",
      description: "Office locations, commute facilities, shuttle transit, and cab policy",
      fields: getFields("work_location_commute", {
        office_locations: { label: "Office Campus Locations", type: "list" },
        office_zone_type: { label: "Office Zone Type", type: "badge" },
        location_centrality: { label: "Location Centrality & Accessibility", type: "text" },
        cab_policy: { label: "Company Cab & Commute Policy", type: "text" },
        public_transport_access: { label: "Public Transit Connectivity", type: "text" },
        airport_commute_time: { label: "Airport Transit Time", type: "text" },
        relocation_support: { label: "Employee Relocation Assistance", type: "text" },
      }),
    },
    {
      id: "safety-wellbeing",
      title: "Safety & Wellbeing",
      iconName: "HeartPulse",
      description: "Campus security, emergency preparedness, medical benefits, and burnout protection",
      fields: getFields("safety_wellbeing", {
        area_safety: { label: "Surrounding Area Safety", type: "text" },
        infrastructure_safety: { label: "Campus Infrastructure Safety", type: "text" },
        safety_policies: { label: "Employee Safety Protocols", type: "text" },
        emergency_preparedness: { label: "Emergency Response & Helpline", type: "text" },
        health_support: { label: "Mental Health & Wellness Programs", type: "text" },
        family_health_insurance: { label: "Health Insurance Coverage", type: "text" },
        burnout_risk: { label: "Burnout Risk Assessment", type: "badge" },
      }),
    },
    {
      id: "career-growth-learning",
      title: "Career Growth & Learning",
      iconName: "GraduationCap",
      description: "Learning budget, mentorship, role progression clarity, and cross-functional exposure",
      fields: getFields("career_growth_learning", {
        learning_culture: { label: "Learning & Development Culture", type: "text" },
        training_spend: { label: "Annual Training Investment per Employee", type: "text" },
        mentorship_availability: { label: "Mentorship & Coaching Programs", type: "text" },
        onboarding_quality: { label: "New Hire Onboarding Quality", type: "text" },
        promotion_clarity: { label: "Promotion Criteria Clarity", type: "text" },
        internal_mobility: { label: "Internal Job Mobility & Transfers", type: "text" },
        early_ownership: { label: "Early Career Ownership & Autonomy", type: "text" },
        role_clarity: { label: "Job Role & Expectation Clarity", type: "text" },
        cross_functional_exposure: { label: "Cross-Functional Pod Exposure", type: "text" },
        skill_relevance: { label: "Future-Ready Skill Relevance", type: "text" },
        exit_opportunities: { label: "Alumni Exit Career Pathways", type: "text" },
      }),
    },
    {
      id: "brand-reputation",
      title: "Brand & Reputation",
      iconName: "Medal",
      description: "Industry brand standing, sentiment score, recognitions, and global awards",
      fields: getFields("brand_reputation", {
        brand_value: { label: "Brand Value & Global Ranking", type: "badge" },
        brand_sentiment_score: { label: "Market Sentiment Score", type: "badge" },
        awards_recognitions: { label: "Notable Industry Awards", type: "list" },
        external_recognition: { label: "External Benchmarks & Recognition", type: "text" },
        website_traffic_rank: { label: "Global Web Traffic Rank", type: "badge" },
        website_quality: { label: "Digital Presence Quality", type: "text" },
      }),
    },
    {
      id: "compensation-benefits",
      title: "Compensation & Benefits",
      iconName: "Gift",
      description: "Fixed/variable pay structure, bonuses, equity incentives, leaves, and retention tenure",
      fields: getFields("compensation_benefits", {
        fixed_vs_variable_pay: { label: "Compensation Structure (Fixed vs Variable)", type: "text" },
        bonus_predictability: { label: "Annual Bonus Predictability", type: "text" },
        esops_incentives: { label: "Equity & Stock Incentives (ESOPs/RSUs)", type: "text" },
        lifestyle_benefits: { label: "Lifestyle & Employee Perks", type: "list" },
        leave_policy: { label: "Annual Leave & Paid Time-Off", type: "text" },
        avg_retention_tenure: { label: "Average Employee Tenure", type: "badge" },
        employee_turnover: { label: "Employee Turnover Rate", type: "text" },
        layoff_history: { label: "Historical Workforce Stability", type: "text" },
      }),
    },
    {
      id: "digital-presence-ratings",
      title: "Digital Presence & Ratings",
      iconName: "Share2",
      description: "Glassdoor, Indeed, and Google ratings, social communities, and developer channels",
      fields: getFields("digital_presence_ratings", {
        glassdoor_rating: { label: "Glassdoor Overall Rating", type: "rating" },
        indeed_rating: { label: "Indeed Workplace Rating", type: "rating" },
        google_rating: { label: "Google Workspace Rating", type: "rating" },
        website_rating: { label: "Website User Experience Rating", type: "text" },
        social_media_followers: { label: "Social Media Followers Count", type: "badge" },
        website_url: { label: "Corporate Website", type: "url" },
        linkedin_url: { label: "LinkedIn Official Page", type: "url" },
        twitter_handle: { label: "Twitter / X Profile", type: "text" },
        facebook_url: { label: "Facebook Page", type: "url" },
        instagram_url: { label: "Instagram Channel", type: "url" },
        marketing_video_url: { label: "Company Showcase Video", type: "url" },
      }),
    },
    {
      id: "contact-information",
      title: "Contact Information",
      iconName: "Mail",
      description: "Corporate contact email, recruitment phone, campus relations, and headquarters address",
      fields: getFields("contact_information", {
        primary_contact_email: { label: "Corporate Contact Email", type: "text" },
        primary_phone_number: { label: "Corporate Contact Phone", type: "text" },
        contact_person_name: { label: "Campus / Talent Lead Name", type: "text" },
        contact_person_title: { label: "Talent Lead Designation", type: "text" },
        contact_person_email: { label: "Talent Lead Email", type: "text" },
        contact_person_phone: { label: "Talent Lead Phone", type: "text" },
        warm_intro_pathways: { label: "Networking & Alumni Pathways", type: "text" },
        website_url: { label: "Official Website", type: "url" },
        linkedin_url: { label: "LinkedIn Careers Profile", type: "url" },
      }),
    },
  ];
}
