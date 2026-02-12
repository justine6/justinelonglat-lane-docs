import fs from "fs";
import path from "path";

const ROOT = process.cwd();
const PARTIALS_DIR = path.join(ROOT, "partials");
const PUBLIC_DIR = path.join(ROOT, "public");

const HEADER_PATH = path.join(PARTIALS_DIR, "header.html");
const FOOTER_PATH = path.join(PARTIALS_DIR, "footer.html");

// OFF by default. Enable only if you truly want the mirror.
const MIRROR_PUBLIC_PARTIALS = process.env.MIRROR_PUBLIC_PARTIALS === "1";
const PUBLIC_PARTIALS_DIR = path.join(PUBLIC_DIR, "_partials");

// ---------- helpers ----------
function fail(msg) {
  console.error(`✗ ${msg}`);
  process.exit(1);
}

// Normalize to LF to stop CRLF drift in injected files (in-memory only).
function toLF(s) {
  return s.replace(/\r\n/g, "\n");
}

// Preserve original file EOL when writing back.
function detectEol(s) {
  return s.includes("\r\n") ? "\r\n" : "\n";
}
function fromLF(s, eol) {
  return eol === "\r\n" ? s.replace(/\n/g, "\r\n") : s;
}

function readText(p) {
  return toLF(fs.readFileSync(p, "utf8")).trim() + "\n";
}

function getHtmlTargets(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.toLowerCase().endsWith(".html"))
    .map((f) => path.join(dir, f));
    
}

function hasMarker(html, name) {
  const openA = `<!-- PARTIAL:${name} -->`;  // space
  const openB = `<!-- PARTIAL:${name}-->`;   // no space
  const closeA = `<!-- /PARTIAL:${name} -->`;
  const closeB = `<!-- /PARTIAL:${name}-->`;

  const hasOpen = html.includes(openA) || html.includes(openB);
  const hasClose = html.includes(closeA) || html.includes(closeB);

  return hasOpen && hasClose;
}

/**
 * Replaces a marker block like:
 * <!-- PARTIAL:HEADER -->
 *   anything...
 * <!-- /PARTIAL:HEADER -->
 *
 * with:
 * <!-- PARTIAL:HEADER -->
 * ...replacement...
 * <!-- /PARTIAL:HEADER -->
 */
function replaceMarkerBlock(html, name, replacementHtml) {
  const openA = `<!-- PARTIAL:${name} -->`; // space
  const openB = `<!-- PARTIAL:${name}-->`;  // no space
  const closeA = `<!-- /PARTIAL:${name} -->`;
  const closeB = `<!-- /PARTIAL:${name}-->`;

  const open = html.includes(openA) ? openA : (html.includes(openB) ? openB : null);
  const close = html.includes(closeA) ? closeA : (html.includes(closeB) ? closeB : null);

  if (!open || !close) {
    return { html, changed: false, missing: true };
  }

  const start = html.indexOf(open);
  const end = html.indexOf(close);

  if (start === -1 || end === -1 || end < start) {
    return { html, changed: false, missing: true };
  }

  const before = html.slice(0, start);
  const after = html.slice(end + close.length);

  // Preserve the marker style found in the file (space vs no-space)
  const injected = `${open}\n${replacementHtml}${close}`;
  const out = before + injected + after;

  return { html: out, changed: out !== html, missing: false };
}

function ensurePartialsExist() {
  const missing = [];
  if (!fs.existsSync(PARTIALS_DIR)) missing.push("partials/ directory");
  if (!fs.existsSync(HEADER_PATH)) missing.push("partials/header.html");
  if (!fs.existsSync(FOOTER_PATH)) missing.push("partials/footer.html");

  if (missing.length) {
    console.error("inject-partials: missing required files:");
    for (const m of missing) console.error(" - " + m);
    process.exit(1);
  }
}

// ---------- run ----------
ensurePartialsExist();

const headerHtml = readText(HEADER_PATH);
const footerHtml = readText(FOOTER_PATH);

let targets = getHtmlTargets(PUBLIC_DIR);

// Ensure critical hub pages are always treated as targets
const REQUIRED_PAGES = ["index.html", "docs.html", "automation-toolkit.html"];

targets = Array.from(
  new Set([
    ...targets,
    ...REQUIRED_PAGES.map((p) => path.join(PUBLIC_DIR, p)),
  ])
).filter((p) => fs.existsSync(p)); // avoid crashing if a required page is missing

let changedCount = 0;
const diagnostics = [];

for (const file of targets) {
  const beforeRaw = fs.readFileSync(file, "utf8");
  const eol = detectEol(beforeRaw);

  // normalize to LF ONLY for marker operations + comparison
  const before = toLF(beforeRaw);

  const hasHeader = hasMarker(before, "HEADER");
  const hasFooter = hasMarker(before, "FOOTER");

  if (!hasHeader || !hasFooter) {
    diagnostics.push({
      file: path.relative(ROOT, file),
      header: hasHeader,
      footer: hasFooter,
    });
  }

  let out = before;

  if (hasHeader) out = replaceMarkerBlock(out, "HEADER", headerHtml).html;
  if (hasFooter) out = replaceMarkerBlock(out, "FOOTER", footerHtml).html;

  if (out !== before) {
    const outWithOriginalEol = fromLF(out, eol);
    fs.writeFileSync(file, outWithOriginalEol, "utf8");
    changedCount++;
  }
}

console.log(
  `inject-partials: updated ${changedCount}/${targets.length} html file(s)`
);

if (diagnostics.length) {
  console.log("\nDiagnostics (missing markers):");
  for (const d of diagnostics) {
    const h = d.header ? "ok" : "MISSING";
    const f = d.footer ? "ok" : "MISSING";
    console.log(` - ${d.file}: HEADER=${h}; FOOTER=${f}`);
  }
}

// Optional mirror (OFF by default)
if (MIRROR_PUBLIC_PARTIALS) {
  fs.mkdirSync(PUBLIC_PARTIALS_DIR, { recursive: true });

  fs.copyFileSync(HEADER_PATH, path.join(PUBLIC_PARTIALS_DIR, "header.html"));
  fs.copyFileSync(FOOTER_PATH, path.join(PUBLIC_PARTIALS_DIR, "footer.html"));

  console.log("✓ Mirrored partials to public/_partials (MIRROR_PUBLIC_PARTIALS=1)");
}
