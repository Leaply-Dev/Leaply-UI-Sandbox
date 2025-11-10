# Leaply - International Education Platform

A modern UI prototype for Leaply, a platform that helps students discover universities, manage applications, and navigate the international education journey. Features a clean, nature-inspired design.

## 📦 Current Status

This is a **UI prototype/sandbox** with core pages implemented:

### Pages Implemented
- **Landing Page** (`index.html`) - Hero, features showcase, featured universities, testimonials
- **Search/Explore Page** (`search.html`) - University and scholarship search with tabs and filtering
- **Student Dashboard** (`profile.html`) - Profile management, target universities, requirements tracking, admission probability
- **About Page** (`about.html`) - Company info, team, values
- **Contact Page** (`contact.html`) - Contact form and support info

### Key Features
- Responsive design (mobile-first approach)
- Interactive search and filtering
- Tab-based navigation for universities/scholarships
- Student profile with multiple sections (Overview, Profile, Universities, Requirements)
- Admission probability assessment UI
- Requirements checklist per university
- Progress tracking visualization
- Form validation
- Mobile navigation menu
- Smooth scrolling and animations
- Bookmark functionality
- Testimonials carousel

### Design System
- **Color Palette**: 
  - Primary Green: #8dc641
  - Secondary Green: #dae122
  - Accent Green: #3bb64b
  - Dark Green: #016839
- **Typography**: Inter font family with clean hierarchy
- **Spacing**: Consistent CSS custom properties
- **Components**: Cards, buttons, forms, tabs, progress trackers
- **Shadows**: Soft shadows with green tints

### Navigation Structure
Consistent across all pages:
- Home
- Explore (search page)
- About
- Contact  
- Dashboard (profile page)

### Tech Stack
- Pure HTML5, CSS3, JavaScript (ES6+)
- No frameworks or build tools
- Client-side only (no backend)
- localStorage for future data persistence

## 🚧 Planned Features (Not Yet Implemented)

Based on `DESIGN_IDEA.md` and `FUNCTIONALITY.md`:
1. **Onboarding Flow** - User profile setup wizard
2. **Essay & Self-Discovery Assistant** - Interactive question flow and AI-powered suggestions
3. **Application Roadmap** - Timeline visualization with deadline tracking
4. **Mentor Matching** - Connect students with university alumni
5. **University Detail Pages** - Dedicated pages for each institution
6. **Mock Data Layer** - JSON-based university/scholarship database

## 🎯 Development Guidelines

When adding new features:
- Maintain consistent navigation structure
- Use existing CSS custom properties
- Follow mobile-first responsive approach
- Keep JavaScript modular and well-commented
- Use localStorage for data persistence (when needed)
- Ensure accessibility (semantic HTML, ARIA labels)
- Test on mobile devices

## Usage
Open `index.html` in a web browser to start. No build process required - uses vanilla HTML, CSS, and JavaScript.
