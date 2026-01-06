# System Design — Part D

Four Sites, One Sustainable Platform

Part D is the operator’s view of the JustineLonglaT-Lane ecosystem.

Instead of one big monolithic site, the platform is intentionally split into
four focused surfaces:

- **Consulting site** — `justinelonglaT-lane.com`  
  Main marketing and portfolio surface, built with Next.js on Vercel.
- **Docs site** — `docs.justinelonglaT-lane.com`  
  Operational source of truth: tooling, pipelines, system design, and runbooks.
- **Blog site** — `blogs.justinelonglaT-lane.com`  
  Long-form deep dives, case studies, and technical storytelling.
- **GitHub Pages presence** — static mirrors and documentation exports  
  Low-friction way to host docs where engineers already live, and a natural
  backup surface.

The goal is not “four random websites”, but **one sustainable platform**:

- A single brand and story, with multiple entry points.
- Shared tooling and guardrails instead of copy-pasted scripts.
- CI/CD pipelines that keep each site healthy without manual heroics.

The remaining sections of Part D walk through this ecosystem from different
angles:

1. [Architecture](architecture.md) — how repos, hosting, and DNS fit together.
2. [Operations](operations.md) — day-to-day runbook for shipping changes.
3. [Multi-site coordination](multi-site-coordination.md) — how the four
   surfaces stay aligned.
4. [Content engine](content-engine.md) — how stories, case studies, and docs
   flow through the system.
5. [Automation toolkit](automation-toolkit.md) — scripts and pipelines powering
   the whole platform.
6. [Reliability guardrails](reliability-guardrails.md) — the safety rails that
   keep everything boring and predictable.

Together, these pages document **how one engineer can sustainably run a
professional-grade ecosystem** by combining good design, small tools, and
strong habits.

## Featured Writing & Thought Leadership

In addition to this documentation hub, I maintain a public engineering blog focused on **DevSecOps, CI/CD, observability, and production reliability**.

You can browse a curated index of key articles here:

👉 [Featured Writing & Thought Leadership](knowledge/featured-writing.md)
