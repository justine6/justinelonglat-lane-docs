# 📘 Jutellane Docs — Changelog

## v1.0.0-docs-stable — 2025-11-05

### 🚀 Highlights
- First **stable documentation release** with synchronized assets and responsive header layout.
- **Architecture diagrams** fully functional: `high-level.svg`, `service-flow.svg`, and `data-pipeline.svg`.
- **Header layout improved** — logo and site name left, navigation buttons aligned right.
- **CSS cache-busting** active across all HTML pages (`?v=YYYY-MM-DD-HH`).
- **Prebuilt bundle** workflow confirmed; all static assets (favicon, logo, diagrams) embedded in `.vercel/output/static/`.
- **404 page** updated for consistency and version tracking.

### 🧩 Technical Changes
- Implemented PowerShell automation to bump cache version automatically.
- Introduced `Sync-Static.ps1` to ensure public assets are copied before deploy.
- Cleaned up `.vercel/output` and verified fresh builds for every release.
- Enhanced `styles.css` for layout consistency and responsive design.

### 🔧 Next Steps
- Automate `Sync-Static.ps1` in GitHub Actions workflow.
- Add a build number or timestamp badge in footer.
- Start branch `v1.0.1-layout-refine` for visual polish and section styling.

---

**Release Maintainer:** Fnu Longla Justine Tekang  
**Date:** November 5, 2025  
**Deployment:** [jutellane-docs.vercel.app](https://jutellane-docs.vercel.app)
