# Security Policy

Thank you for taking the time to help keep the JustineLonglaT-Lane docs ecosystem secure.  
This repository powers a personal docs site and related automation, so protecting credentials,
infrastructure, and visitors is very important.

## Supported Versions

This project is maintained on a **best-effort** basis.  
Security fixes apply to the `main` branch and the most recent published deployment.

## Reporting a Vulnerability

If you believe you’ve found a security issue (leaked secret, misconfiguration, or
vulnerability in the docs tooling / workflows):

1. **Do not create a public GitHub issue or pull request with sensitive details.**
2. Email: **justinelongla@yahoo.com** with the subject line:  
   `SECURITY: justinelonlat-lane-docs`
3. Include a clear description and, if possible, steps to reproduce.
4. Do not attempt to exploit the issue beyond what is necessary to demonstrate it.

I will acknowledge your report as soon as possible and work on a fix or mitigation.

## Handling Secrets

- Secrets (API keys, tokens, personal access tokens, SSH keys) must **never** be committed.
- Use **GitHub Actions secrets** and local `.env` files (ignored by Git) for any credentials.
- If a secret is accidentally committed:
  - **Revoke/rotate it immediately** at the provider (GitHub, Vercel, AWS, etc.).
  - Open a private communication as described above.

## Dependencies & Automation

- Dependency updates for GitHub Actions and npm tooling are handled by **Dependabot**.
- PRs created by Dependabot must pass CI and be merged via pull request into `main`.

## Infrastructure Scope

This repo is primarily documentation and automation glue around:

- Vercel deploys
- GitHub Actions workflows
- Static docs site and diagrams

No production customer data is stored in this repository.

### In `SECURITY.md`

```md
## Automated Security Scanning

This repository uses GitHub CodeQL and `npm audit`:

- CodeQL runs on every push and pull request to `main`
- A scheduled weekly scan runs on Mondays at 03:00 UTC
- Dependency audits are run in CI for production dependencies

Please avoid committing any secrets (API keys, tokens, passwords).
