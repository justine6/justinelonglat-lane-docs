@'
# JLT Platform — Architecture Map

This file describes the major architectural surfaces of the JLT-Lane ecosystem and how they relate to one another.

---

## Core surfaces

### 1. Main Site
**Stack:** Next.js  
**Purpose:** public-facing consulting platform, service funnel, pricing, booking, projects, engineering mesh

Key responsibilities:
- brand surface
- service positioning
- project showcase
- pricing and monetization
- booking and onboarding
- membership entry points

---

### 2. Docs Site
**Stack:** static HTML/CSS/JS  
**Purpose:** operational documentation, architecture pages, runbooks, toolkit, reference material

Key responsibilities:
- architecture communication
- implementation reference
- runbooks and troubleshooting
- automation guidance
- static documentation stability

---

### 3. Blog Site
**Stack:** static publishing surface  
**Purpose:** thought leadership, post archives, publishing platform

Key responsibilities:
- long-form publishing
- article archive
- platform storytelling
- SEO content surface

---

### 4. Foundation Site
**Stack:** Next.js multilingual site  
**Purpose:** Nouvo Ayiti 2075 initiative, multilingual content, mission and join flow

Key responsibilities:
- mission storytelling
- multilingual presentation
- community engagement
- join/contact flow

---

## Shared support layers

### Navigation layer
Navigation links connect all major public surfaces:
- Main
- Docs
- Blog
- Engineering Mesh
- Foundation

### Payment layer
Stripe supports:
- checkout
- payment flows
- membership support
- related callbacks and success pages

### Scheduling layer
Cal.com supports:
- intro call booking
- hire-me / consultation flow

### Content layer
Public assets and documentation support:
- brochures
- resume
- project images
- diagrams
- platform visuals

---

## Conceptual flow

Content and authority flow:
Blog / Docs / Engineering Mesh
→ trust and credibility
→ Services / Projects / Pricing
→ Booking / Contact
→ Stripe / Membership

---

## Platform principle
The ecosystem is not a single website. It is a coordinated multi-surface platform made of:
- one main application surface
- one documentation surface
- one publishing surface
- one mission/foundation surface
- supporting payment and scheduling services

Each surface should preserve:
- canonical routing
- clear ownership
- explicit navigation behavior
- stable cross-site linking
'@ | Set-Content .\platform\architecture-map.md