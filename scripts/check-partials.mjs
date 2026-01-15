/**
 * check-partials.mjs
 * ------------------
 * Guardrail script to verify that required HTML partials exist
 * before running injection or publishing static pages.
 *
 * WHY THIS EXISTS
 * ---------------
 * This repository treats header/footer partials as shared,
 * canonical layout fragments. Missing or renamed partials can
 * silently break multiple pages at once.
 *
 * This script fails fast when expected partials are missing,
 * preventing:
 *  - broken builds
 *  - half-injected HTML
 *  - preview/production drift
 *
 * WHEN TO USE
 * -----------
 * - Before running `inject-partials.mjs`
 * - Before tagging a release
 * - After refactoring layout or folder structure
 *
 * DESIGN NOTES
 * ------------
 * - Node.js is OPTIONAL in this repo.
 * - This script is a guardrail, not a build requirement.
 * - Static output under /public remains the source of truth.
 *
 * Safe to remove or ignore if partials are not in use.
 */

import fs from "fs";
import path from "path";
import process from "process";

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

const PARTIALS_DIR = path.resolve(process.cwd(), "partials");

const REQUIRED_PARTIALS = [
  "header.html",
  "footer.html",
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function fail(message) {
  console.error(`✗ ${message}`);
  process.exit(1);
}

function ok(message) {
  console.log(`✓ ${message}`);
}

// ---------------------------------------------------------------------------
// Checks
// ---------------------------------------------------------------------------

if (!fs.existsSync(PARTIALS_DIR)) {
  fail(
    `Missing required directory: /partials\n` +
    `This repo expects shared layout partials to live here.`
  );
}

ok("Found /partials directory");

for (const file of REQUIRED_PARTIALS) {
  const fullPath = path.join(PARTIALS_DIR, file);

  if (!fs.existsSync(fullPath)) {
    fail(
      `Missing required partial: ${file}\n` +
      `Expected at: ${fullPath}`
    );
  }

  const contents = fs.readFileSync(fullPath, "utf8").trim();

  if (!contents) {
    fail(
      `Partial exists but is empty: ${file}\n` +
      `Empty partials can cause silent layout failures.`
    );
  }

  ok(`Validated partial: ${file}`);
}

// ---------------------------------------------------------------------------
// Success
// ---------------------------------------------------------------------------

ok("All required partials are present and non-empty");
