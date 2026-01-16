/**
 * check-partials.mjs
 * ------------------
 * Guardrail script to verify that required HTML partials exist
 * AND that target HTML files contain the correct injection markers.
 *
 * Static output under /public remains the source of truth.
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

// Canonical partials
const REQUIRED_PARTIALS = ["header.html", "footer.html"];

// Optional-but-guarded hero partial (freeze workflow)
const HERO_PARTIAL = path.resolve(PARTIALS_DIR, "heroes", "home.html");

// Injection markers required in targets
const MARKERS = [
  { name: "HEADER", open: "<!-- PARTIAL:HEADER -->", close: "<!-- /PARTIAL:HEADER -->" },
  { name: "FOOTER", open: "<!-- PARTIAL:FOOTER -->", close: "<!-- /PARTIAL:FOOTER -->" },

  // Hero freeze (index.html only)
  { name: "HERO:HOME", open: "<!-- PARTIAL:HERO:HOME -->", close: "<!-- /PARTIAL:HERO:HOME -->" },
];

// Which public HTML files must contain markers
const TARGET_HTML_FILES = ["index.html", "toolkit.html"];

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

/**
 * Hero partial must be a fragment only.
 * Reject full-document wrappers and layout tags.
 */
function assertHeroPartialSafe(html) {
  const lower = html.toLowerCase();

  const forbidden = [
    "<!doctype",
    "<html",
    "<head",
    "<body",
    "</html",
    "</head",
    "</body",
    "<header",
    "<footer",
  ];

  const hit = forbidden.find((t) => lower.includes(t));
  if (hit) {
    fail(
      `Hero partial contains forbidden token: ${hit}\n` +
        `File: partials/heroes/home.html\n` +
        `Hero must be a fragment only (section/div etc.), not a full layout/document.`
    );
  }
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
// Checks: hero partial integrity (freeze workflow)
// ---------------------------------------------------------------------------

if (fs.existsSync(HERO_PARTIAL)) {
  const hero = readUtf8(HERO_PARTIAL).trim();
  if (!hero) {
    fail(
      `Hero partial exists but is empty:\n` +
        `File: partials/heroes/home.html\n` +
        `An empty hero can blank out the homepage section during injection.`
    );
  }
  assertHeroPartialSafe(hero);
  ok("Validated hero partial: partials/heroes/home.html");
} else {
  warn(
    `Hero partial not found at partials/heroes/home.html.\n` +
      `If you do not inject a hero, you may remove HERO markers from MARKERS.`
  );
}

// ---------------------------------------------------------------------------
// Checks: marker presence + layout regressions in target public files
// ---------------------------------------------------------------------------

if (!fs.existsSync(PUBLIC_DIR)) {
  fail(
    `Missing required directory: /public\n` +
      `This repo expects static output HTML to live here.`
  );
}
ok("Found /public directory");

// Build absolute paths for public html files that exist
const targets = TARGET_HTML_FILES.map((f) => path.join(PUBLIC_DIR, f)).filter((p) =>
  fs.existsSync(p)
);

if (targets.length === 0) {
  warn("No public HTML files found to validate markers.");
} else {
  ok(`Found ${targets.length} public HTML file(s) to validate markers`);

  let markerFailures = 0;

  for (const file of targets) {
    const html = readUtf8(file);
    const rel = path.relative(ROOT, file);

    // Marker presence (HERO is required only on index.html)
    for (const m of MARKERS) {
      const isHero = m.name === "HERO:HOME";
      const isIndex = path.basename(file).toLowerCase() === "index.html";
      if (isHero && !isIndex) continue;

      if (!hasMarkerBlock(html, m.open, m.close)) {
        markerFailures++;
        console.error(
          `✗ Missing marker block in ${rel}: ${m.open} ... ${m.close}\n` +
            `   Fix: add both marker lines where you want ${m.name.toLowerCase()} injected.`
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
        `Add missing markers before injection.`
    );
  }

  ok("All required injection markers are present in target HTML files");
}

// ---------------------------------------------------------------------------
// Success
// ---------------------------------------------------------------------------

ok("All required partials are present and non-empty (and markers validated)");
