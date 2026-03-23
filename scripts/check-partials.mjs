import fs from "fs";
import path from "path";
import process from "process";

const ROOT = process.cwd();
const PARTIALS_DIR = path.resolve(ROOT, "partials");
const PAGES_DIR = path.resolve(ROOT, "pages");
const PUBLIC_DIR = path.resolve(ROOT, "public");

const REQUIRED_PARTIALS = ["head.html", "header.html", "footer.html"];
const HERO_PARTIAL = path.resolve(PARTIALS_DIR, "heroes", "home.html");

const MARKERS = [
  { name: "HEAD", open: "<!-- PARTIAL:HEAD -->", close: "<!-- /PARTIAL:HEAD -->" },
  { name: "HEADER", open: "<!-- PARTIAL:HEADER -->", close: "<!-- /PARTIAL:HEADER -->" },
  { name: "FOOTER", open: "<!-- PARTIAL:FOOTER -->", close: "<!-- /PARTIAL:FOOTER -->" },
  { name: "HERO:HOME", open: "<!-- PARTIAL:HERO:HOME -->", close: "<!-- /PARTIAL:HERO:HOME -->" },
];

const EXCLUDED_HTML_FILES = new Set([
  // add exclusions here if ever needed
]);

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

function walkHtmlFiles(dir) {
  if (!fs.existsSync(dir)) return [];

  const results = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const full = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      results.push(...walkHtmlFiles(full));
      continue;
    }

    if (!entry.isFile()) continue;
    if (!entry.name.toLowerCase().endsWith(".html")) continue;
    if (entry.name.startsWith("_")) continue;
    if (entry.name.endsWith(".redirect.html")) continue;
    if (EXCLUDED_HTML_FILES.has(entry.name)) continue;

    results.push(full);
  }

  return results;
}

function relFromPages(file) {
  return path.relative(PAGES_DIR, file);
}

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

if (!fs.existsSync(PAGES_DIR)) {
  fail(
    `Missing required directory: /pages\n` +
      `This repo now expects source HTML templates to live here.`
  );
}
ok("Found /pages directory");

if (!fs.existsSync(PUBLIC_DIR)) {
  fail(
    `Missing required directory: /public\n` +
      `This repo expects generated static output HTML to live here.`
  );
}
ok("Found /public directory");

const sourceFiles = walkHtmlFiles(PAGES_DIR);

if (sourceFiles.length === 0) {
  warn("No page templates found under /pages.");
} else {
  ok(`Found ${sourceFiles.length} page HTML file(s) in /pages`);

  let markerFailures = 0;
  let outputFailures = 0;

  for (const sourceFile of sourceFiles) {
    const html = readUtf8(sourceFile);
    const rel = relFromPages(sourceFile);
    const relDisplay = path.relative(ROOT, sourceFile);
    const outputFile = path.join(PUBLIC_DIR, rel);

    for (const m of MARKERS) {
    const isHero = m.name === "HERO:HOME";
    const rel = relFromPages(sourceFile).replace(/\\/g, "/");
    const isRootIndex = rel.toLowerCase() === "index.html";
    if (isHero && !isRootIndex) continue;

      if (!hasMarkerBlock(html, m.open, m.close)) {
        markerFailures++;
        console.error(
          `✗ Missing marker block in ${relDisplay}: ${m.open} ... ${m.close}\n` +
            `   Fix: add both marker lines where you want ${m.name.toLowerCase()} injected.`
        );
      }
    }

    if (!fs.existsSync(outputFile)) {
      outputFailures++;
      console.error(
        `✗ Missing generated output for ${rel}\n` +
          `   Expected: ${path.relative(ROOT, outputFile)}`
      );
      continue;
    }

    const outputHtml = readUtf8(outputFile);
    const main = extractMain(outputHtml);

    if (main) {
      const hasSiteHeaderInMain =
        /<header\b[^>]*\bclass=["'][^"']*\bsite-header\b[^"']*["'][^>]*>/i.test(main);

      const hasSiteFooterInMain =
        /<footer\b[^>]*\bclass=["'][^"']*\bsite-footer\b[^"']*["'][^>]*>/i.test(main);

      if (hasSiteHeaderInMain) {
        warn(
          `Rogue layout <header class="site-header"> detected inside <main> in ${path.relative(
            ROOT,
            outputFile
          )} (can cause "header below hero").`
        );
      }

      if (hasSiteFooterInMain) {
        warn(
          `Rogue layout <footer class="site-footer"> detected inside <main> in ${path.relative(
            ROOT,
            outputFile
          )} (can cause missing or duplicated footer).`
        );
      }
    }
  }

  if (markerFailures > 0) {
    fail(
      `Marker validation failed in /pages: ${markerFailures} issue(s).\n` +
        `Add missing markers before injection.`
    );
  }

  if (outputFailures > 0) {
    fail(
      `Generated output validation failed: ${outputFailures} missing file(s) in /public.\n` +
        `Run the injector before validating.`
    );
  }

  ok("All required injection markers are present in page templates");
  ok("All expected generated output files exist in /public");
}

ok("All required partials are present and non-empty (and pages/public are validated)");