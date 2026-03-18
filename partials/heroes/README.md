## Hero blocks (Frozen)

Hero sections are treated as canonical layout blocks.

- Canonical source lives in `partials/heroes/`
- Pages must include the matching hero marker block
- CI enforces that injected hero output stays aligned with canonical source
- Manual edits inside injected hero regions are not allowed

To change a hero:
1. Edit the canonical hero partial in `partials/heroes/`
2. Run the repo’s injection step (`npm run inject:partials`)
3. Run the repo’s validation step (`npm run check:partials`)
4. Commit both the canonical source and injected page output