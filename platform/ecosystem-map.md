@'
# JLT Platform — Ecosystem Map

This file defines the canonical surfaces across the JLT-Lane ecosystem.

---

## Main Site (Next.js)
Canonical domain: `https://justinelonglat-lane.com`

### Main routes
- `/`
- `/about`
- `/projects`
- `/pricing`
- `/booking`
- `/availability`
- `/contact`
- `/engineering-mesh`
- `/services-solutions`
- `/blog`
- `/files`
- `/readme`

### Notes
- App Router / Next.js routes do not use `.html`
- Internal navigation should use route paths like `/services-solutions`
- Shared CTAs may point to absolute canonical URLs when cross-site safety matters

---

## Docs Site (Static)
Canonical domain: `https://docs.justinelonglat-lane.com`

### Docs routes
- `/`
- `/README.html`
- `/architecture.html`
- `/runbooks.html`
- `/toolkit.html`
- `/automation-toolkit.html`
- `/observability-architecture.html`
- `/platform-rules.html`
- `/mesh-governance.html`
- `/sitemap.html`

### Notes
- Static docs pages should use explicit `.html` routes
- Do not assume folder-style routing unless a matching `index.html` exists
- Example: use `/runbooks.html`, not `/runbooks/`, unless `/runbooks/index.html` exists

---

## Blog Site (Static)
Canonical domain: `https://blogs.justinelonglat-lane.com`

### Blog routes
- `/`
- `/posts/`
- `/posts/<slug>/`

### Notes
- Cross-site navigation from Docs or Main should use the canonical blog domain when intended to leave the local site
- Keep blog links explicit when linking from static docs

---

## Foundation Site
Canonical domain: `https://foundation.nouvoayiti2075.com`

### Typical routes
- `/`
- `/join`
- `/projects`
- `/blog`

---

## Shared external services

### Scheduling
- Cal.com intro scheduling
- Cal.com hire-me scheduling

### Payments
- Stripe checkout / portal / webhook
- Membership success / cancel pages on main site

---

## Canonical linking rules
1. Next.js app routes use clean paths without `.html`
2. Static docs routes use explicit `.html`
3. Cross-site links use full canonical `https://...` URLs
4. Do not mix local relative links and canonical cross-site URLs unintentionally
5. Navigation should be explicit about whether the destination is same-site or cross-site
'@ | Set-Content .\platform\ecosystem-map.md