# Toolkit Guardrails

Guardrails are automated checks that protect the platform from accidental breakage
and enforce consistent structure across pages, layouts, and releases.

They act as the **policy layer** of the Automation Toolkit.

## Guardrails Included

| Guardrail | Purpose |
|-----------|---------|
| check-partials.mjs | Ensures header/footer partial markers exist and inject correctly |
| check-heroes.mjs | Ensures hero sections follow layout and structure rules |
| partials-guardrails.yml | CI workflow to enforce partial structure on pull requests |
| hero-guardrails.yml | CI workflow to enforce hero layout consistency |

## When Guardrails Run

Guardrails should run:

- Before merging pull requests
- Before tagging a release
- During CI builds
- After layout refactors

## Philosophy

Guardrails are not meant to block development — they exist to:

- Prevent broken navigation
- Prevent layout drift
- Prevent inconsistent page structure
- Keep releases reproducible
- Make the platform safe to evolve

Mental model:

Validate → Preview → Release → Deploy → Recover