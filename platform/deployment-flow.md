@
# JLT Platform — Deployment Flow Runbook

This document describes how each surface of the JLT-Lane platform is built,
validated, deployed, and verified.

This is the operational deployment runbook for the platform.

---

# 1. Main Site (Next.js — Vercel)

Repository:
- justinelonglat-lane (Next.js app)

## Local development
pnpm dev

## Build validation
pnpm build

## Git workflow
git status
git add .
git commit -m "describe change"
git push origin main

## Deployment
- Vercel automatically deploys from `main`
- Production deploy becomes active when status = Ready / Latest

## Post-deploy smoke test
Verify:
- Home page
- /services-solutions
- /projects
- /pricing
- /booking
- /availability
- /engineering-mesh
- Navbar links
- Theme toggle
- Contact page
- Stripe success / cancel pages (if changed)

---

# 2. Docs Site (Static Docs)

Repository:
- justinelonglat-lane-docs

## Inject partials
pnpm run inject:partials

## Validate partials
pnpm run check:partials

## Local preview (if applicable)
pnpm build
pnpm preview

## Git workflow
git status
git add .
git commit -m "update docs / header / runbooks / platform docs"
git push

## Post-deploy smoke test
Verify:
- /
- /README.html
- /architecture.html
- /runbooks.html
- /toolkit.html
- Header navigation links
- Footer links
- Theme toggle
- MeshHub external link
- Blog external link

---

# 3. Blog Site (Static Publishing)

Repository:
- justinelonglat-lane-blogs

## Validate partials and output
npm run partials:check
npm run validate:header
npm run verify:output

## Git workflow
git status
git add .
git commit -m "add post / update layout"
git push

## Post-deploy smoke test
Verify:
- /
- /posts/
- Individual post page
- Header links
- Footer links

---

# 4. Foundation Site (Next.js Multilingual)

Repository:
- nouvoayiti2075

## Local development
pnpm dev

## Build
pnpm build

## Git workflow
git status
git add .
git commit -m "update content / translations / join flow"
git push origin main

## Post-deploy smoke test
Verify:
- Locale routing
- /join page
- Form submission
- Email confirmation (Resend)
- Navigation across languages

---

# Deployment Principles

1. Build locally before pushing
2. Validate partials before pushing static sites
3. Use canonical domains for cross-site navigation
4. Smoke test after every production deployment
5. Fix navigation immediately if a link breaks
6. Commit platform documentation when routes change

---

# Quick Smoke Test Checklist

| Item | Check |
|-----|------|
| Build passes | ✓ |
| Deployment Ready | ✓ |
| Navbar links | ✓ |
| Footer links | ✓ |
| Theme toggle | ✓ |
| Docs links | ✓ |
| Blog links | ✓ |
| Booking links | ✓ |
| Stripe redirects | ✓ |
| Runbooks open | ✓ |

---

# Recovery Rule

If a deployment breaks:
1. Revert last commit
2. Push revert commit
3. Confirm Vercel redeploy
4. Re-run smoke tests
5. Document incident in runbooks (if significant)
'@ | Set-Content .\platform\deployment-flow.md