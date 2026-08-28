import React, { useState, useEffect, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  User,
  GraduationCap,
  Briefcase,
  Award,
  Layers,
  Save,
  RotateCcw,
  Plus,
  Trash2,
  CheckCircle2,
  FileDown,
  Sparkles,
  Target,
} from "lucide-react";
import { RadixPageHeader } from "@/components/radix/RadixPageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  CandidateProfile,
  SkillCategoryCode,
  SKILL_CATEGORY_NAMES,
} from "@/shared/types";
import {
  loadCandidateProfile,
  saveCandidateProfile,
  DEFAULT_CANDIDATE_PROFILE,
} from "@/data/mockCandidateProfile";
import { saveProfileToBackend } from "@/lib/radixApi";
import { toast } from "sonner";

const ALL_CATEGORY_CODES: SkillCategoryCode[] = [
  "COD",
  "DSA",
  "OOD",
  "APTI",
  "COMM",
  "AI",
  "CLOUD",
  "SQL",
  "SWE",
  "SYSD",
  "NETW",
  "OS",
  "OTHER",
];

export const ProfileBuilder: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [profile, setProfile] = useState<CandidateProfile>(() => loadCandidateProfile());
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "unsaved">("saved");
  const [activeTab, setActiveTab] = useState<
    "basic" | "education" | "skills" | "experience" | "hackathons" | "certifications"
  >("basic");

  useEffect(() => {
    if (location.state?.importedFromResume) {
      const reloaded = loadCandidateProfile();
      setProfile(reloaded);
      setSaveStatus("saved");
      toast.success("Successfully imported structured credentials from parsed resume!");
    }
  }, [location.state]);

  const updateProfile = useCallback(
    (updater: (prev: CandidateProfile) => CandidateProfile) => {
      setProfile((prev) => {
        const next = updater(prev);
        setSaveStatus("unsaved");
        return next;
      });
    },
    []
  );

  const handleSave = async () => {
    setSaveStatus("saving");
    try {
      // 1. Save locally
      saveCandidateProfile(profile);
      // 2. Attempt backend persist if available
      try {
        await saveProfileToBackend(profile);
      } catch {
        // Backend optional fallback
      }
      setSaveStatus("saved");
      toast.success("Candidate Profile saved successfully!");
    } catch {
      toast.error("Failed to save profile.");
      setSaveStatus("unsaved");
    }
  };

  const handleReset = () => {
    if (window.confirm("Reset profile to default SVCE candidate baseline?")) {
      setProfile(DEFAULT_CANDIDATE_PROFILE);
      saveCandidateProfile(DEFAULT_CANDIDATE_PROFILE);
      setSaveStatus("saved");
      toast.info("Profile reset to baseline.");
    }
  };

  // Skill Helpers
  const handleAddSkill = () => {
    updateProfile((prev) => ({
      ...prev,
      skills: [
        ...prev.skills,
        {
          skill_name: "New Skill",
          category_code: "COD",
          level: 5,
          confidence: "high",
          evidence: "Proficiency demonstrated in academic coursework and projects",
        },
      ],
    }));
  };

  const handleRemoveSkill = (index: number) => {
    updateProfile((prev) => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== index),
    }));
  };

  // Education Helpers
  const handleAddEducation = () => {
    updateProfile((prev) => ({
      ...prev,
      education: [
        ...prev.education,
        {
          institution: "Sri Venkateswara College of Engineering",
          degree: "B.E.",
          field_of_study: "Computer Science & Engineering",
          start_date: "2022",
          end_date: "2026",
          gpa_or_percentage: "8.5 CGPA",
        },
      ],
    }));
  };

  const handleRemoveEducation = (index: number) => {
    updateProfile((prev) => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index),
    }));
  };

  // Internship Helpers
  const handleAddInternship = () => {
    updateProfile((prev) => ({
      ...prev,
      internships: [
        ...prev.internships,
        {
          company: "Company Name",
          role: "Software Engineering Intern",
          duration_months: 3,
          description: "Developed microservices and optimized backend query response times.",
          technologies: ["Python", "React", "PostgreSQL"],
        },
      ],
    }));
  };

  const handleRemoveInternship = (index: number) => {
    updateProfile((prev) => ({
      ...prev,
      internships: prev.internships.filter((_, i) => i !== index),
    }));
  };

  // Hackathon Helpers
  const handleAddHackathon = () => {
    updateProfile((prev) => ({
      ...prev,
      hackathons: [
        ...prev.hackathons,
        {
          title: "Hackathon / Competition",
          project_name: "Project Title",
          position_or_award: "Finalist",
          year: "2025",
          description: "Built full-stack prototype under 24-hour sprint deadline.",
        },
      ],
    }));
  };

  const handleRemoveHackathon = (index: number) => {
    updateProfile((prev) => ({
      ...prev,
      hackathons: prev.hackathons.filter((_, i) => i !== index),
    }));
  };

  // Certification Helpers
  const handleAddCertification = () => {
    updateProfile((prev) => ({
      ...prev,
      certifications: [
        ...prev.certifications,
        {
          name: "Certification Name",
          issuer: "Issuing Organization",
          issue_date: "2024",
          credential_id: "CERT-12345",
        },
      ],
    }));
  };

  const handleRemoveCertification = (index: number) => {
    updateProfile((prev) => ({
      ...prev,
      certifications: prev.certifications.filter((_, i) => i !== index),
    }));
  };

  return (
    <div className="min-h-full pb-20 bg-background">
      {/* Page Header */}
      <RadixPageHeader
        moduleNumber="03"
        moduleName="PROFILE BUILDER"
        title="CANONICAL CANDIDATE PROFILE"
        description="Maintain your structured engineering credentials, assessed competencies, internships, and hackathons used across Talent Check and Skill Matching."
        icon={User}
        actionContent={
          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Status Pill */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-sm border-2 border-foreground bg-card text-xs font-mono font-bold">
              {saveStatus === "saved" ? (
                <>
                  <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                  <span>Saved</span>
                </>
              ) : saveStatus === "saving" ? (
                <>
                  <Sparkles className="h-3.5 w-3.5 text-[#4169E1] animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <span className="h-2 w-2 rounded-full bg-[#FF7657]" />
                  <span className="text-[#FF7657]">Unsaved changes</span>
                </>
              )}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/radix/resume-parsing")}
              className="gap-1.5 font-bold text-xs"
            >
              <FileDown className="h-3.5 w-3.5" />
              <span>Import from Resume</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              className="font-bold text-xs"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </Button>

            <Button onClick={handleSave} size="sm" className="gap-1.5 font-bold text-xs">
              <Save className="h-3.5 w-3.5" />
              <span>Save Profile</span>
            </Button>
          </div>
        }
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-8 space-y-8">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 border-b-2 border-foreground pb-2">
          {[
            { id: "basic", label: "Basic Info", icon: User },
            { id: "skills", label: `Skills (${profile.skills.length})`, icon: Layers },
            { id: "education", label: `Education (${profile.education.length})`, icon: GraduationCap },
            { id: "experience", label: `Internships (${profile.internships.length})`, icon: Briefcase },
            { id: "hackathons", label: `Hackathons (${profile.hackathons.length})`, icon: Target },
            { id: "certifications", label: `Certifications (${profile.certifications.length})`, icon: Award },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-3.5 py-2 text-xs font-mono font-bold rounded-sm border-2 transition-all ${
                  isActive
                    ? "bg-primary text-primary-foreground border-foreground nb-shadow-sm -translate-y-0.5"
                    : "bg-card text-foreground border-foreground hover:bg-secondary"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* TAB 1: Basic Information */}
        {activeTab === "basic" && (
          <Card className="rounded-sm border-2 border-foreground bg-card nb-shadow-md">
            <CardHeader className="p-5 pb-3 bg-secondary border-b-2 border-foreground">
              <CardTitle className="text-base font-bold text-foreground font-heading">
                PERSONAL & CONTACT INFORMATION
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label htmlFor="basic-full-name-input" className="text-xs font-mono font-bold text-foreground">FULL NAME *</label>
                  <Input
                    id="basic-full-name-input"
                    aria-label="Full Name"
                    value={profile.name}
                    onChange={(e) => updateProfile((p) => ({ ...p, name: e.target.value }))}
                    className="border-2 border-foreground font-medium text-xs bg-background"
                  />
                </div>
                <div className="space-y-1">
                  <label htmlFor="basic-email-address-input" className="text-xs font-mono font-bold text-foreground">EMAIL ADDRESS *</label>
                  <Input
                    id="basic-email-address-input"
                    aria-label="Email Address"
                    value={profile.email}
                    onChange={(e) => updateProfile((p) => ({ ...p, email: e.target.value }))}
                    className="border-2 border-foreground font-medium text-xs bg-background"
                  />
                </div>
                <div className="space-y-1">
                  <label htmlFor="basic-phone-number-input" className="text-xs font-mono font-bold text-foreground">PHONE NUMBER</label>
                  <Input
                    id="basic-phone-number-input"
                    aria-label="Phone Number"
                    value={profile.phone || ""}
                    onChange={(e) => updateProfile((p) => ({ ...p, phone: e.target.value }))}
                    className="border-2 border-foreground font-medium text-xs bg-background"
                  />
                </div>
                <div className="space-y-1">
                  <label htmlFor="basic-location-input" className="text-xs font-mono font-bold text-foreground">LOCATION</label>
                  <Input
                    id="basic-location-input"
                    aria-label="Location"
                    value={profile.location || ""}
                    onChange={(e) => updateProfile((p) => ({ ...p, location: e.target.value }))}
                    className="border-2 border-foreground font-medium text-xs bg-background"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label htmlFor="basic-professional-headline-input" className="text-xs font-mono font-bold text-foreground">PROFESSIONAL HEADLINE</label>
                <Input
                  id="basic-professional-headline-input"
                  aria-label="Professional Headline"
                  value={profile.headline || ""}
                  onChange={(e) => updateProfile((p) => ({ ...p, headline: e.target.value }))}
                  placeholder="e.g. Final Year CSE Student · SDE Aspirant"
                  className="border-2 border-foreground font-medium text-xs bg-background"
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="basic-preferred-roles-input" className="text-xs font-mono font-bold text-foreground">
                  PREFERRED ROLES (COMMA SEPARATED)
                </label>
                <Input
                  id="basic-preferred-roles-input"
                  aria-label="Preferred Roles"
                  value={profile.preferred_roles?.join(", ") || ""}
                  onChange={(e) =>
                    updateProfile((p) => ({
                      ...p,
                      preferred_roles: e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
                    }))
                  }
                  className="border-2 border-foreground font-medium text-xs bg-background"
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* TAB 2: Skills Management */}
        {activeTab === "skills" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="font-heading text-base font-bold text-foreground">
                  CANDIDATE COMPETENCIES & PROFICIENCY LEVELS
                </h2>
                <p className="text-xs text-muted-foreground font-medium">
                  Self-assessed ratings (1-10) used for automated gap calculations and talent matching.
                </p>
              </div>
              <Button onClick={handleAddSkill} size="sm" className="gap-1.5 font-bold text-xs">
                <Plus className="h-3.5 w-3.5" />
                <span>Add Skill</span>
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {profile.skills.map((skill, idx) => (
                <Card
                  key={idx}
                  className="rounded-sm border-2 border-foreground bg-card p-4 space-y-3 nb-shadow-sm"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 space-y-2">
                      <div className="flex gap-2">
                        <label htmlFor={`skill-name-input-${idx}`} className="sr-only">Skill Name</label>
                        <Input
                          id={`skill-name-input-${idx}`}
                          aria-label="Skill Name"
                          value={skill.skill_name}
                          onChange={(e) =>
                            updateProfile((p) => {
                              const nextSkills = [...p.skills];
                              nextSkills[idx] = { ...nextSkills[idx], skill_name: e.target.value };
                              return { ...p, skills: nextSkills };
                            })
                          }
                          placeholder="Skill Name"
                          className="border-2 border-foreground font-bold text-xs h-8 bg-background flex-1"
                        />
                        <label htmlFor={`skill-category-select-${idx}`} className="sr-only">Skill Category</label>
                        <select
                          id={`skill-category-select-${idx}`}
                          aria-label="Skill Category"
                          value={skill.category_code}
                          onChange={(e) =>
                            updateProfile((p) => {
                              const nextSkills = [...p.skills];
                              nextSkills[idx] = {
                                ...nextSkills[idx],
                                category_code: e.target.value as SkillCategoryCode,
                              };
                              return { ...p, skills: nextSkills };
                            })
                          }
                          className="border-2 border-foreground font-mono font-bold text-xs px-2 rounded-sm bg-background text-foreground h-8"
                        >
                          {ALL_CATEGORY_CODES.map((code) => (
                            <option key={code} value={code}>
                              {code} ({SKILL_CATEGORY_NAMES[code]})
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Level Slider / Selector */}
                      <div className="space-y-1 font-mono">
                        <div className="flex justify-between text-[11px] font-bold">
                          <span>ASSESSED PROFICIENCY:</span>
                          <span className="text-foreground bg-primary px-1.5 py-0.5 rounded-sm border border-foreground">
                            Level {skill.level || 5} / 10
                          </span>
                        </div>
                        <input
                          type="range"
                          min={1}
                          max={10}
                          value={skill.level || 5}
                          onChange={(e) =>
                            updateProfile((p) => {
                              const nextSkills = [...p.skills];
                              nextSkills[idx] = {
                                ...nextSkills[idx],
                                level: parseInt(e.target.value, 10),
                              };
                              return { ...p, skills: nextSkills };
                            })
                          }
                          className="w-full cursor-pointer accent-primary"
                        />
                      </div>

                      {/* Evidence */}
                      <Input
                        value={skill.evidence || ""}
                        onChange={(e) =>
                          updateProfile((p) => {
                            const nextSkills = [...p.skills];
                            nextSkills[idx] = { ...nextSkills[idx], evidence: e.target.value };
                            return { ...p, skills: nextSkills };
                          })
                        }
                        placeholder="Evidence / proof snippet (e.g. 400+ LeetCode problems, capstone project)"
                        className="border-2 border-foreground text-[11px] font-mono h-8 bg-background"
                      />
                    </div>

                    <button
                      onClick={() => handleRemoveSkill(idx)}
                      className="p-1.5 text-muted-foreground hover:text-destructive transition-colors rounded-sm"
                      title="Remove skill"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: Education */}
        {activeTab === "education" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="font-heading text-base font-bold text-foreground">
                ACADEMIC CREDENTIALS
              </h2>
              <Button onClick={handleAddEducation} size="sm" className="gap-1.5 font-bold text-xs">
                <Plus className="h-3.5 w-3.5" />
                <span>Add Education</span>
              </Button>
            </div>

            <div className="space-y-3">
              {profile.education.map((edu, idx) => (
                <Card key={idx} className="rounded-sm border-2 border-foreground bg-card p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <span className="font-mono font-bold text-xs text-[#4169E1]">#{idx + 1} DEGREE</span>
                    <button
                      onClick={() => handleRemoveEducation(idx)}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Input
                      value={edu.degree}
                      onChange={(e) =>
                        updateProfile((p) => {
                          const n = [...p.education];
                          n[idx] = { ...n[idx], degree: e.target.value };
                          return { ...p, education: n };
                        })
                      }
                      placeholder="Degree (e.g. B.E.)"
                      className="border-2 border-foreground text-xs"
                    />
                    <Input
                      value={edu.institution}
                      onChange={(e) =>
                        updateProfile((p) => {
                          const n = [...p.education];
                          n[idx] = { ...n[idx], institution: e.target.value };
                          return { ...p, education: n };
                        })
                      }
                      placeholder="Institution (e.g. SVCE)"
                      className="border-2 border-foreground text-xs"
                    />
                    <Input
                      value={edu.field_of_study}
                      onChange={(e) =>
                        updateProfile((p) => {
                          const n = [...p.education];
                          n[idx] = { ...n[idx], field_of_study: e.target.value };
                          return { ...p, education: n };
                        })
                      }
                      placeholder="Field of Study (e.g. Computer Science & Engineering)"
                      className="border-2 border-foreground text-xs"
                    />
                    <Input
                      value={edu.gpa_or_percentage || ""}
                      onChange={(e) =>
                        updateProfile((p) => {
                          const n = [...p.education];
                          n[idx] = { ...n[idx], gpa_or_percentage: e.target.value };
                          return { ...p, education: n };
                        })
                      }
                      placeholder="GPA / Percentage (e.g. 8.85 CGPA)"
                      className="border-2 border-foreground text-xs font-mono"
                    />
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: Internships & Work Experience */}
        {activeTab === "experience" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="font-heading text-base font-bold text-foreground">
                INTERNSHIPS & PROFESSIONAL EXPERIENCE
              </h2>
              <Button onClick={handleAddInternship} size="sm" className="gap-1.5 font-bold text-xs">
                <Plus className="h-3.5 w-3.5" />
                <span>Add Internship</span>
              </Button>
            </div>

            <div className="space-y-3">
              {profile.internships.map((exp, idx) => (
                <Card key={idx} className="rounded-sm border-2 border-foreground bg-card p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <span className="font-mono font-bold text-xs text-primary">#{idx + 1} INTERNSHIP</span>
                    <button
                      onClick={() => handleRemoveInternship(idx)}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Input
                      value={exp.company}
                      onChange={(e) =>
                        updateProfile((p) => {
                          const n = [...p.internships];
                          n[idx] = { ...n[idx], company: e.target.value };
                          return { ...p, internships: n };
                        })
                      }
                      placeholder="Company"
                      className="border-2 border-foreground text-xs"
                    />
                    <Input
                      value={exp.role}
                      onChange={(e) =>
                        updateProfile((p) => {
                          const n = [...p.internships];
                          n[idx] = { ...n[idx], role: e.target.value };
                          return { ...p, internships: n };
                        })
                      }
                      placeholder="Role (e.g. SDE Intern)"
                      className="border-2 border-foreground text-xs"
                    />
                  </div>
                  <Input
                    value={exp.description || ""}
                    onChange={(e) =>
                      updateProfile((p) => {
                        const n = [...p.internships];
                        n[idx] = { ...n[idx], description: e.target.value };
                        return { ...p, internships: n };
                      })
                    }
                    placeholder="Key responsibilities and achievements..."
                    className="border-2 border-foreground text-xs"
                  />
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: Hackathons */}
        {activeTab === "hackathons" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="font-heading text-base font-bold text-foreground">
                HACKATHONS & COMPETITIVE PROJECTS
              </h2>
              <Button onClick={handleAddHackathon} size="sm" className="gap-1.5 font-bold text-xs">
                <Plus className="h-3.5 w-3.5" />
                <span>Add Hackathon</span>
              </Button>
            </div>

            <div className="space-y-3">
              {profile.hackathons.map((h, idx) => (
                <Card key={idx} className="rounded-sm border-2 border-foreground bg-card p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <span className="font-mono font-bold text-xs text-[#FF7657]">#{idx + 1} HACKATHON</span>
                    <button
                      onClick={() => handleRemoveHackathon(idx)}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Input
                      value={h.title}
                      onChange={(e) =>
                        updateProfile((p) => {
                          const n = [...p.hackathons];
                          n[idx] = { ...n[idx], title: e.target.value };
                          return { ...p, hackathons: n };
                        })
                      }
                      placeholder="Competition Title"
                      className="border-2 border-foreground text-xs"
                    />
                    <Input
                      value={h.position_or_award || ""}
                      onChange={(e) =>
                        updateProfile((p) => {
                          const n = [...p.hackathons];
                          n[idx] = { ...n[idx], position_or_award: e.target.value };
                          return { ...p, hackathons: n };
                        })
                      }
                      placeholder="Award (e.g. 1st Place / Finalist)"
                      className="border-2 border-foreground text-xs"
                    />
                  </div>
                  <Input
                    value={h.description || ""}
                    onChange={(e) =>
                      updateProfile((p) => {
                        const n = [...p.hackathons];
                        n[idx] = { ...n[idx], description: e.target.value };
                        return { ...p, hackathons: n };
                      })
                    }
                    placeholder="Project architecture and innovation description..."
                    className="border-2 border-foreground text-xs"
                  />
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* TAB 6: Certifications */}
        {activeTab === "certifications" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="font-heading text-base font-bold text-foreground">
                PROFESSIONAL CERTIFICATIONS
              </h2>
              <Button onClick={handleAddCertification} size="sm" className="gap-1.5 font-bold text-xs">
                <Plus className="h-3.5 w-3.5" />
                <span>Add Certification</span>
              </Button>
            </div>

            <div className="space-y-3">
              {profile.certifications.map((c, idx) => (
                <Card key={idx} className="rounded-sm border-2 border-foreground bg-card p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <span className="font-mono font-bold text-xs text-muted-foreground">#{idx + 1} CERTIFICATE</span>
                    <button
                      onClick={() => handleRemoveCertification(idx)}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Input
                      value={c.name}
                      onChange={(e) =>
                        updateProfile((p) => {
                          const n = [...p.certifications];
                          n[idx] = { ...n[idx], name: e.target.value };
                          return { ...p, certifications: n };
                        })
                      }
                      placeholder="Certification Name (e.g. AWS CCP)"
                      className="border-2 border-foreground text-xs"
                    />
                    <Input
                      value={c.issuer || ""}
                      onChange={(e) =>
                        updateProfile((p) => {
                          const n = [...p.certifications];
                          n[idx] = { ...n[idx], issuer: e.target.value };
                          return { ...p, certifications: n };
                        })
                      }
                      placeholder="Issuer (e.g. Amazon Web Services)"
                      className="border-2 border-foreground text-xs"
                    />
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
