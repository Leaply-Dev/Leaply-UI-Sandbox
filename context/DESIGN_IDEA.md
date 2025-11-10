# **Leaply MVP — Screen Specification (Refined)**

## **1. Onboarding / Profile Setup**

**Purpose:** Collect foundational data to personalize recommendations and initialize the user’s profile.
**Core value:** Acts as the entry point for the recommendation engine and Persona Lab insights.

**Main components:**

* Basic Info Form: name, GPA, English score (IELTS/TOEFL), intended major, target country, budget range.
* Optional preferences: learning style, target ranking, scholarship interest.
* “Continue” button.

**Primary flow:**
User completes form → data stored in profile → redirects to **Dashboard** with personalized suggestions.

**Data I/O:**

* **Input:** user academic + personal info.
* **Output:** structured user_profile JSON (basis for matching + persona insights).

---

## **2. University & Scholarship Matcher**

**Purpose:** Suggest universities and scholarships aligned with the user’s background and goals.
**Core value:** Saves research time via fit-based recommendations.

**Main components:**

* Filters: major, country, tuition range, ranking, scholarship availability.
* Search bar.
* University cards: name, location, tuition, acceptance rate, Fit %.
* “View details” and “Add to Dashboard” buttons.

**Primary flow:**
User sets filters → AI updates matches → user adds universities to personal dashboard.

**Data I/O:**

* **Input:** filter values + user_profile.
* **Output:** ranked list of universities with `fit_score`.

---

## **3. University Detail View**

**Purpose:** Display comprehensive data for each university.
**Core value:** Transparent decision-making for shortlist management.

**Main components:**

* Overview: ranking, tuition, location, acceptance rate.
* Requirements: GPA, language, major eligibility.
* Support & costs: scholarships, living expenses.
* “Add to Dashboard” button.

**Primary flow:**
User opens detail → explores → adds university to **Application Dashboard**.

**Data I/O:**

* **Input:** university_id.
* **Output:** university_detail JSON.

---

## **4. Application Dashboard**

**Purpose:** Track all target universities and manage application workflow.
**Core value:** Centralized goal and progress management.

**Main components:**

* Sidebar: university list (added targets).
* Main panel: selected university summary (fit %, deadline, requirements).
* Progress tracker: “Not Started / In Progress / Done”.
* Notes & reminders (optional).

**Primary flow:**
User updates application stage → progress autosaves → can view completion rate overview.

**Data I/O:**

* **Input:** university_id, progress_state.
* **Output:** dashboard_state JSON (university list + progress info).

---

## **5. Persona Lab / MyLeap**

**Purpose:** Act as an intelligent companion for self-discovery, essay ideation, and profile improvement.
**Core value:** Personalized reflection and storytelling — turning profile data into essay insights and growth roadmap.

**Main components:**

* Question prompts (about goals, motivation, challenges, values).
* Textbox for user responses.
* “Generate Insights” button → AI returns reflections or essay ideas.
* Tabs (future extensions):

  * **Essay Builder** — assist with drafts and editing.
  * **Profile Coach** — suggest strengths, highlight achievements.
  * **Self Discovery Map** — visualize personal growth themes.

**Primary flow:**
User answers prompts → AI processes → returns insight cards (idea + rationale).

**Data I/O:**

* **Input:** user text responses, user_profile.
* **Output:** insight_set JSON (themes, essay ideas, improvement suggestions).

---

## **6. Global Navigation / Layout**

**Purpose:** Provide minimal, intuitive navigation across the platform.
**Core value:** Easy context switching between discovery, management, and self-growth spaces.

**Main components:**

* Logo (Leaply)
* Nav links:

  * **Matcher**
  * **Dashboard**
  * **Persona Lab / MyLeap**
  * **Profile**
* User avatar dropdown (settings, logout).

**Data I/O:**
UI navigation only — no backend interaction.