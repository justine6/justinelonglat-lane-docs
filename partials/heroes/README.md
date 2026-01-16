## Hero blocks (Frozen)

Hero sections are treated as canonical layout blocks.

- Canonical source lives in `partials/heroes/`
- Pages must include a matching `PARTIAL:HERO_*` marker
- CI enforces exact match with canonical HTML
- Manual edits in pages are not allowed

To change a hero:
1. Edit the canonical hero partial
2. Run `node scripts/inject-heroes.mjs`
3. Commit the result
