# Jutellane Docs
A lightweight documentation site for Jutellane Solutions—covering tooling, pipelines, and practices.  
Built with **Nuxt 4**, **Vite**, and **Tailwind CSS**.

## Requirements
- Node.js ≥ 18.20
- pnpm ≥ 8
- Git

## Quick Start
\\\ash
pnpm install
pnpm dev
pnpm build
pnpm preview
\\\

## Available Scripts
| Script | Description |
|---|---|
| \pnpm dev\ | Start Nuxt dev server |
| \pnpm build\ | Production build |
| \pnpm preview\ | Preview built site |

## Project Structure
\\\
components/ (TopBar.vue, Footer.vue)
layouts/default.vue
pages/index.vue
pages/guide/(getting-started.vue, tooling-setup.vue, ci-cd-pipelines.vue)
assets/css/tailwind.css
nuxt.config.ts
\\\

## Styling
Tailwind CSS + @tailwindcss/typography. Ensure:
\\\	s
export default defineNuxtConfig({
  css: ['~/assets/css/tailwind.css'],
})
\\\

## Environment Variables
\\\
NITRO_PRESET=vercel
BASE_URL=https://docs.jutellane.com
\\\

## CI/CD
GitHub Actions build on push/PR; Vercel auto-deploys from \main\.

## Deployment
- Vercel (recommended): Link repo → Deploy.
- Manual: \pnpm build && node .output/server/index.mjs\

## Troubleshooting
- Port busy → run with another port: \pnpm dev -- --port 3001\
- \pnpm approve-builds\ if you see “Ignored build scripts”
- Windows: avoid \+\ in filenames

## Contributing
Branch → change → PR.

## License
MIT © Jutellane Solutions
