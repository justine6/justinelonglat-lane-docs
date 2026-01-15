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
  Injects the contents of these partials into HTML pages at the marked locations.

- `scripts/check-partials.mjs`  
  Fails fast if:
  - a required partial is missing or empty
  - required injection markers are missing
  - a header/footer is manually duplicated inside `<main>`

This guarantees:
- one layout
- one navigation
- one footer
- no silent divergence between pages or environments

---

## Correct workflow for changes

1. Edit **only**:
   - `partials/header.html`
   - `partials/footer.html`

2. Run:
   ```bash
   node scripts/check-partials.mjs
   node scripts/inject-partials.mjs


## Partial Injection (Frozen)

`scripts/inject-partials.mjs` is a **layout enforcement tool**, not a general-purpose build script.

It exists to guarantee that **every published HTML page uses the canonical
header and footer defined in `/partials`.**

This script is intentionally treated as **frozen infrastructure**.

---

### What this script does

- Scans target HTML files under `/public`
- Replaces content between:
  - `<!-- PARTIAL:HEADER --> … <!-- /PARTIAL:HEADER -->`
  - `<!-- PARTIAL:FOOTER --> … <!-- /PARTIAL:FOOTER -->`
- Injects the exact contents of:
  - `partials/header.html`
  - `partials/footer.html`

No transformation.  
No conditional logic.  
No layout decisions.

---

### What this script does *not* do

- It does **not** generate pages
- It does **not** build HTML
- It does **not** manage routing
- It does **not** tolerate drift

If a page does not contain valid PARTIAL markers, injection is skipped
and `check-partials.mjs` will fail.

---

### Why this is frozen

Header/footer drift is one of the most expensive classes of regressions in
static sites:

- broken navigation
- misaligned hero sections
- duplicated headers
- preview vs production mismatch

Freezing this script ensures:

- one header
- one footer
- one injection rule
- zero surprises

---

### Correct workflow

1. Edit **only**:
   - `partials/header.html`
   - `partials/footer.html`
2. Run:
   ```bash
   node scripts/inject-partials.mjs
   node scripts/check-partials.mjs
### Partials guardrails (CI)

PRs and main pushes run a guardrail workflow that:
- validates partials exist + are non-empty
- validates injection markers exist
- runs injection and fails if it produces a diff

If CI fails, run locally:
```bash
node scripts/check-partials.mjs
node scripts/inject-partials.mjs

---

## 4) Optional: Run on the branch you’re actively using too

If your main work happens on `fix/css-single-source`, add it to workflow `push.branches`:

```yaml
push:
  branches: [ main, fix/css-single-source ]
