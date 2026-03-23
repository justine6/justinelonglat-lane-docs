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
## v1.2.0 — Docs Pipeline Refactor (2026-03-22)

### Summary
Refactored the documentation site to use a proper static build pipeline with shared layout partials and generated output.

### Key Changes
- Introduced /pages as source of truth
- Introduced /public as generated site output
- Implemented partial injection system (head, header, footer, hero)
- Added platform documentation section (/platform)
- Added validation guardrails (check-partials, inject-partials)
- Standardized navigation across Docs platform
- Created ecosystem, architecture, domains, deployment, and navigation documentation

### Impact
- Deterministic documentation builds
- Safer layout management
- Clear platform documentation structure
- Docs site now functions as platform documentation hub
---
## v1.4.1 — Platform Architecture Gallery
**Release date:** 2026

### Added
- Platform architecture diagram gallery
- Platform control flow diagram
- Entitlement-based access control architecture
- Request lifecycle diagram
- Toolkit API process flow diagram
- Observability & operations loop diagram
- Deployment guardrails diagram

### Updated
- Architecture page reorganized into platform lifecycle order:
  - Platform overview
  - Access & request flow
  - Toolkit & delivery
  - Operations & reliability

### Notes
This release formalizes the JLT Platform Engineering Model and documents
the full platform lifecycle from identity and access control to deployment
guardrails and reliability improvement loops.