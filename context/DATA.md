# Leaply System Data Context

## 1. University Data Model
**Entity Type:** Educational Institution

### Basic Information
- id (string)
- name (string)
- website (string)
- founded_year (integer)
- region (string) — e.g., Asia, Europe, North America
- country (string)
- city_or_state (string)
- global_ranking (integer)
- subject_ranking (object) — { "Computer Science": 120, "Business": 80 }
- main_language (string)

### Academic Overview
- degree_levels (array of strings) — e.g., ["Undergraduate", "Graduate", "PhD"]
- main_fields (array of strings) — e.g., ["Engineering", "Economics", "Arts"]
- academic_orientation (string) — e.g., "Research-based", "Coursework-based"

### Admissions
- acceptance_rate (float)
- required_gpa (float)
- required_certificates (array of strings) — e.g., ["IELTS ≥ 6.5", "SAT"]
- required_documents (array of strings) — e.g., ["Transcript", "Recommendation Letter"]
- entrance_exams (array of strings) — optional field

### Tuition & Financial Aid
- tuition_range (object) — { "min": 15000, "max": 45000, "currency": "USD" }
- scholarships (array of strings) — e.g., ["Merit-based", "Need-based"]
- financial_support_policies (array of strings) — e.g., ["Assistantship", "Tuition waiver"]

### Student Demographics
- total_students (integer)
- international_student_ratio (float)

### Reputation & Outcomes
- employment_rate_after_graduation (float)
- notable_fields (array of strings) — optional, for branding context

### Living Environment
- living_cost_index (integer) — normalized cost of living score
- city_safety_score (integer)
- climate (string) — e.g., "Temperate", "Tropical", "Cold"

---

## 2. Learner Data Model
**Entity Type:** Individual User (Applicant)

### Personal Information
- full_name (string)
- birth_year (integer)
- nationality (string)
- target_degree_level (string)
- desired_major (string)
- gpa (float)
- transcript_file (string, optional)
- current_school (string)
- learner_summary (string) — brief self-description (academic strengths, direction, learning style)

### Language & Standardized Tests
- english_tests (object) — { "IELTS": 7.5, "TOEFL": null, "Duolingo": null }
- standardized_tests (object) — { "SAT": 1450, "ACT": null, "GRE": null, "GMAT": null }
- secondary_language (string)

### Activities & Achievements
- extracurriculars (array of strings)
- awards (array of strings)
- research_experience (array of strings)
- publications (array of strings)

### Work Experience
- internships (array of objects) — { "company": string, "role": string, "duration": string }
- jobs (array of objects) — { "company": string, "role": string, "duration": string }
- letters_of_recommendation (array of strings or files)

### Goals & Preferences
- career_goal (string)
- preferred_countries (array of strings)
- preferred_learning_style (string) — "Research-based" | "Coursework-based" | "Project-based"
- preferred_fields (array of strings) — ["STEM", "Business", "Arts"]
- lifestyle_preference (string) — "Urban" | "College Town"
- priorities (object) — { "low_tuition": true, "high_ranking": false, "career_opportunity": true }
- interested_in_part_time (boolean)
- interested_in_post_study_visa (boolean)

### Financial Profile
- annual_budget (number)
- scholarship_preference (string) — "Full", "Partial", "Tuition Support"
- self_funding_ratio (float)

### Application Materials
- cv_status (string) — "Not started" | "In progress" | "Complete"
- sop_status (string)
- portfolio_status (string)
- portfolio_link (string, optional)

---

## 3. Core Data Relationships
- `LearnerProfile` ↔ `University`: Many-to-Many (via "ApplicationTarget" table)
  - Fields: { learner_id, university_id, fit_score, application_status, deadline }
- `University` ↔ `Scholarship`: One-to-Many
- `LearnerProfile` ↔ `EssayIdea`: One-to-Many

---

## 4. Data Usage Summary
- **Matcher feature:** Uses University dataset + Learner profile to compute fit_score.
- **Dashboard feature:** Links LearnerProfile to selected universities and tracks progress.
- **Essay Assistant feature:** Uses LearnerProfile (summary + activities + goals) to generate ideas.
