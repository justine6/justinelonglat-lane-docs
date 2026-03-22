# JLT Platform — Change Log

This file tracks major platform changes, architecture decisions, navigation updates,
deployment changes, and structural improvements across the JLT-Lane ecosystem.

---

## 2026-03 — Services & Solutions + Platform Structure

### Added
- Services & Solutions page on Main Site (Next.js)
- Engagement Models section
- Core Offerings section
- Why JLT-Lane section
- How JLT-Lane Helps section
- CTA section for Contact and Booking

### Navigation / Routing
- Standardized navigation across Main, Docs, and Blog sites
- Fixed MeshHub external link
- Fixed Runbooks routing on Docs site
- Clarified `.html` vs folder routing for static docs
- Added canonical cross-site linking rules

### Theme / UI
- Identified hard-coded dark theme sections in Services & Solutions components
- Began refactoring components to support light/dark theme toggle
- Standardized section spacing and layout structure

### Platform Documentation (New)
Created `/platform` documentation folder with:

- `ecosystem-map.md` — canonical routes and surfaces
- `architecture-map.md` — platform structure and responsibilities
- `domains.md` — canonical domains
- `deployment-flow.md` — deployment runbooks per site
- `navigation-rules-cheat-sheet.md` — linking rules across sites
- `change-log.md` — platform evolution history

This establishes the Docs site as the **Platform Operating Manual** for JLT-Lane.

### Deployment
- Main site successfully deployed to Vercel (Production Ready)
- Docs site partial injection and validation confirmed working
- Navigation header successfully unified across docs pages

### Key Decisions
- Docs site = documentation + runbooks + platform operations
- Main site = services + projects + pricing + booking + engineering mesh
- Blog site = publishing platform
- Foundation site = Nouvo Ayiti 2075 mission and multilingual platform
- Cross-site navigation should use canonical domains
- Static docs should use explicit `.html` routes

---