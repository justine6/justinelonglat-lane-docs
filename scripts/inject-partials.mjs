import fs from "fs";
import path from "path";

const ROOT = process.cwd();
const PARTIALS_DIR = path.join(ROOT, "partials");
const PUBLIC_DIR = path.join(ROOT, "public");

const HEADER_PATH = path.join(PARTIALS_DIR, "header.html");
const FOOTER_PATH = path.join(PARTIALS_DIR, "footer.html");

function readText(p) {
  return fs.readFileSync(p, "utf8").trim() + "\n";
}

function getHtmlTargets(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.toLowerCase().endsWith(".html"))
    .map((f) => path.join(dir, f));
}

/**
 * Replaces a marker block like:
 * <!-- PARTIAL:HEADER -->
 *   anything...
 * <!-- /PARTIAL:HEADER -->
 *
 * with the marker + replacement + closing marker, so markers remain stable.
 */
function replaceMarkerBlock(html, name, replacementHtml) {
  const open = `<!-- PARTIAL:${name} -->`;
  const close = `<!-- /PARTIAL:${name} -->`;

  const start = html.indexOf(open);
  const end = html.indexOf(close);

  if (start === -1 || end === -1 || end < start) {
    return { html, changed: false, missing: true };
  }

  const before = html.slice(0, start);
  const after = html.slice(end + close.length);

  const injected =
    `${open}\n` +
    `${replacementHtml}` +
    `${close}`;

  return {
    html: before + injected + after,
    changed: true,
    missing: false,
  };
}

function hasMarker(html, name) {
  return (
    html.includes(`<!-- PARTIAL:${name} -->`) &&
    html.includes(`<!-- /PARTIAL:${name} -->`)
  );
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

ensurePartialsExist();

const headerHtml = readText(HEADER_PATH);
const footerHtml = readText(FOOTER_PATH);

const targets = getHtmlTargets(PUBLIC_DIR);

let changedCount = 0;
const diagnostics = [];

for (const file of targets) {
  const before = fs.readFileSync(file, "utf8");

  // Track missing markers (useful to know why a file wasn't updated)
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

  // Only inject where markers exist (bulletproof + predictable)
  if (hasHeader) {
    const r = replaceMarkerBlock(out, "HEADER", headerHtml);
    out = r.html;
  }

  if (hasFooter) {
    const r = replaceMarkerBlock(out, "FOOTER", footerHtml);
    out = r.html;
  }

  if (out !== before) {
    fs.writeFileSync(file, out, "utf8");
    changedCount++;
  }
}

console.log(`inject-partials: updated ${changedCount}/${targets.length} html file(s)`);

if (diagnostics.length) {
  console.log("\nDiagnostics (missing markers):");
  for (const d of diagnostics) {
    const h = d.header ? "ok" : "MISSING";
    const f = d.footer ? "ok" : "MISSING";
    console.log(` - ${d.file}: HEADER=${h}; FOOTER=${f}`);
  }
}
