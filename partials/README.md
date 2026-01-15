# Layout Partials (Header & Footer)

This folder contains the **single source of truth** for the site’s header and footer.

These partials are intentionally frozen and enforced to prevent layout drift across pages.

---

## What lives here

- `header.html` — canonical site header
- `footer.html` — canonical site footer

These files are **not** page templates.  
They are injected into final HTML files at build time.

---

## How this works

Two scripts enforce consistency:

- `scripts/inject-partials.mjs`  
  Replaces `<header>` and `<footer>` blocks in HTML pages with the contents of these partials.

- `scripts/check-partials.mjs`  
  Fails if any page’s header or footer differs from these files.

This guarantees:
- one layout
- one navigation
- one footer
- no silent divergence

---

## Correct workflow for changes

1. Edit **only** `partials/header.html` or `partials/footer.html`
2. Run:
   ```bash
   node scripts/inject-partials.mjs
   node scripts/check-partials.mjs
