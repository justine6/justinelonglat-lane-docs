@'
# JLT Platform — Domains

This file lists the canonical domains used across the ecosystem.

---

## Canonical public domains

### Main Site
- `https://justinelonglat-lane.com`

### Docs Site
- `https://docs.justinelonglat-lane.com`

### Blog Site
- `https://blogs.justinelonglat-lane.com`

### Consulting Surface
- `https://consulting.justinelonglat-lane.com`

### Foundation Site
- `https://foundation.nouvoayiti2075.com`

---

## Domain usage rules

### Main Site
Use for:
- services
- projects
- pricing
- booking-related internal routes
- engineering mesh
- public consulting funnel

### Docs Site
Use for:
- reference pages
- architecture docs
- runbooks
- toolkit and static documentation

### Blog Site
Use for:
- posts
- publishing archive
- blog landing pages

### Consulting Surface
Use for:
- consulting-specific absolute links when needed
- success redirects for booking/payment flows if intentionally centralized there

### Foundation Site
Use for:
- Nouvo Ayiti mission pages
- multilingual community and join flows

---

## Rules
1. Use canonical domains in cross-site navigation
2. Do not point static docs navigation to a relative path when the intention is to leave the docs site
3. Do not point main-site routes to `.html` pages unless intentionally linking into Docs
4. Use absolute URLs for cross-surface CTA safety
5. Keep runtime code links and documentation links aligned

---

## Operational reminder
When changing a domain, update:
- runtime link registry
- header partials
- footer partials
- platform docs in `/platform`
- any deployment/environment references
'@ | Set-Content .\platform\domains.md