/**
 * check-partials.mjs
 * ------------------
 * Guardrail script to verify that required HTML partials exist
 * AND that target HTML files contain the correct injection markers.
 *
 * WHY THIS EXISTS
 * ---------------
 * This repository treats header/footer partials as shared,
 * canonical layout fragments. Missing/empty partials or missing
 * injection markers can silently break multiple pages at once.
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

const ROOT = process.cwd();
const PARTIALS_DIR = path.resolve(ROOT, "partials");
const PUBLIC_DIR = path.resolve(ROOT, "public");

const REQUIRED_PARTIALS = ["header.html", "footer.html"];

const MARKERS = [
  { name: "HEADER", open: "<!-- PARTIAL:HEADER -->", close: "<!-- /PARTIAL:HEADER -->" },
  { name: "FOOTER", open: "<!-- PARTIAL:FOOTER -->", close: "<!-- /PARTIAL:FOOTER -->" },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function fail(message) {
  console.error(`✗ ${message}`);
  process.exit(1);
}

function warn(message) {
  console.warn(`⚠ ${message}`);
}

function ok(message) {
  console.log(`✓ ${message}`);
}

function readUtf8(p) {
  return fs.readFileSync(p, "utf8");
}

function listPublicHtmlFiles() {
  if (!fs.existsSync(PUBLIC_DIR)) return [];
  return fs
    .readdirSync(PUBLIC_DIR)
    .filter((f) => f.toLowerCase().endsWith(".html"))
    .map((f) => path.join(PUBLIC_DIR, f));
}

function hasMarkerBlock(html, open, close) {
  const start = html.indexOf(open);
  const end = html.indexOf(close);
  return start !== -1 && end !== -1 && end > start;
}

function extractMain(html) {
  const lower = html.toLowerCase();
  const start = lower.indexOf("<main");
  if (start === -1) return null;

  const startClose = lower.indexOf(">", start);
  if (startClose === -1) return null;

  const end = lower.indexOf("</main>", startClose);
  if (end === -1) return null;

  return html.slice(startClose + 1, end);
}

// ---------------------------------------------------------------------------
// Checks: partials existence + non-empty
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
    fail(`Missing required partial: ${file}\nExpected at: ${fullPath}`);
  }

  const contents = readUtf8(fullPath).trim();

  if (!contents) {
    fail(
      `Partial exists but is empty: ${file}\n` +
      `Empty partials can cause silent layout failures.`
    );
  }

  ok(`Validated partial: ${file}`);
}

// ---------------------------------------------------------------------------
// Checks: PARTIAL markers + layout regressions
// ---------------------------------------------------------------------------

const targets = listPublicHtmlFiles();

if (targets.length === 0) {
  warn("No public HTML files found to validate markers.");
} else {
  ok(`Found ${targets.length} public HTML file(s) to validate markers`);

  let markerFailures = 0;

  for (const file of targets) {
    const html = readUtf8(file);
    const rel = path.relative(ROOT, file);

    // Marker presence
    for (const m of MARKERS) {
      if (!hasMarkerBlock(html, m.open, m.close)) {
        markerFailures++;
        console.error(
          `✗ Missing marker block in ${rel}: ${m.open} ... ${m.close}\n` +
          `  Fix: add both marker lines where you want ${m.name.toLowerCase()} injected.`
        );
      }
    }

    // Detect *layout* header/footer incorrectly placed inside <main>
    const main = extractMain(html);
    if (main) {
      const hasSiteHeaderInMain =
        /<header\b[^>]*\bclass=["'][^"']*\bsite-header\b[^"']*["'][^>]*>/i.test(main);

      const hasSiteFooterInMain =
        /<footer\b[^>]*\bclass=["'][^"']*\bsite-footer\b[^"']*["'][^>]*>/i.test(main);

      if (hasSiteHeaderInMain) {
        warn(
          `Rogue layout <header class="site-header"> detected inside <main> in ${rel} ` +
          `(can cause "header below hero").`
        );
      }

      if (hasSiteFooterInMain) {
        warn(
          `Rogue layout <footer class="site-footer"> detected inside <main> in ${rel} ` +
          `(can cause missing or duplicated footer).`
        );
      }
    }
  }

  if (markerFailures > 0) {
    fail(
      `Marker validation failed: ${markerFailures} issue(s).\n` +
      `Add missing PARTIAL markers before injection.`
    );
  }

  ok("All required PARTIAL markers are present");
}

// ---------------------------------------------------------------------------
// Success
// ---------------------------------------------------------------------------

ok("All required partials are present and non-empty (and markers validated)");
