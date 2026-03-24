import fs from "fs";
import path from "path";

const ROOT = process.cwd();
const PARTIALS_DIR = path.join(ROOT, "partials");
const PAGES_DIR = path.join(ROOT, "pages");
const PUBLIC_DIR = path.join(ROOT, "public");

const HEAD_PATH = path.join(PARTIALS_DIR, "head.html");
const HEADER_PATH = path.join(PARTIALS_DIR, "header.html");
const FOOTER_PATH = path.join(PARTIALS_DIR, "footer.html");
const HERO_HOME_PATH = path.join(PARTIALS_DIR, "heroes", "home.html");

const MIRROR_PUBLIC_PARTIALS = process.env.MIRROR_PUBLIC_PARTIALS === "1";
const PUBLIC_PARTIALS_DIR = path.join(PUBLIC_DIR, "_partials");

function toLF(s) {
  return s.replace(/\r\n/g, "\n");
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function readText(p) {
  return toLF(fs.readFileSync(p, "utf8")).trim() + "\n";
}

function ensurePartialsExist() {
  const missing = [];
  if (!fs.existsSync(PARTIALS_DIR)) missing.push("partials/ directory");
  if (!fs.existsSync(HEAD_PATH)) missing.push("partials/head.html");
  if (!fs.existsSync(HEADER_PATH)) missing.push("partials/header.html");
  if (!fs.existsSync(FOOTER_PATH)) missing.push("partials/footer.html");
  if (!fs.existsSync(HERO_HOME_PATH)) missing.push("partials/heroes/home.html");
  if (!fs.existsSync(PAGES_DIR)) missing.push("pages/ directory");

  if (missing.length) {
    console.error("inject-partials: missing required files:");
    for (const m of missing) console.error(" - " + m);
    process.exit(1);
  }
}

function hasMarker(html, name) {
  return (
    html.includes(`<!-- PARTIAL:${name} -->`) &&
    html.includes(`<!-- /PARTIAL:${name} -->`)
  );
}

function stripOwnMarkerBlock(content, name) {
  const open = `<!-- PARTIAL:${name} -->`;
  const close = `<!-- /PARTIAL:${name} -->`;

  let out = content.trim();

  if (out.startsWith(open)) {
    out = out.slice(open.length).trimStart();
  }
  if (out.endsWith(close)) {
    out = out.slice(0, out.length - close.length).trimEnd();
  }

  return out ? out + "\n" : "";
}

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

  const cleanedReplacement = stripOwnMarkerBlock(replacementHtml, name);

  const injected =
    `${open}\n` +
    `${cleanedReplacement}` +
    `${close}`;

  const out = before + injected + after;
  return { html: out, changed: out !== html, missing: false };
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

    results.push(full);
  }

  return results;
}

function relativeToPages(file) {
  return path.relative(PAGES_DIR, file);
}

ensurePartialsExist();

const headHtml = readText(HEAD_PATH);
const headerHtml = readText(HEADER_PATH);
const footerHtml = readText(FOOTER_PATH);
const heroHomeHtml = readText(HERO_HOME_PATH);

const sourceFiles = walkHtmlFiles(PAGES_DIR);

let changedCount = 0;
const diagnostics = [];

for (const sourceFile of sourceFiles) {
  const rel = relativeToPages(sourceFile).replace(/\\/g, "/");
  const outputFile = path.join(PUBLIC_DIR, rel);

  const before = toLF(fs.readFileSync(sourceFile, "utf8"));

  const hasHead = hasMarker(before, "HEAD");
  const hasHeader = hasMarker(before, "HEADER");
  const hasFooter = hasMarker(before, "FOOTER");
  const hasHeroHome = hasMarker(before, "HERO:HOME");

  if (!hasHead || !hasHeader || !hasFooter) {
    diagnostics.push({
      file: path.relative(ROOT, sourceFile),
      head: hasHead,
      header: hasHeader,
      footer: hasFooter,
      heroHome: hasHeroHome,
    });
  }

  let out = before;

  if (hasHead) out = replaceMarkerBlock(out, "HEAD", headHtml).html;
  if (hasHeader) out = replaceMarkerBlock(out, "HEADER", headerHtml).html;
  if (hasFooter) out = replaceMarkerBlock(out, "FOOTER", footerHtml).html;

  // inject hero only on root homepage
  if (rel.toLowerCase() === "index.html" && hasHeroHome) {
    out = replaceMarkerBlock(out, "HERO:HOME", heroHomeHtml).html;
  }

  ensureDir(path.dirname(outputFile));

  const existing = fs.existsSync(outputFile)
    ? toLF(fs.readFileSync(outputFile, "utf8"))
    : "";

  if (out !== existing) {
    fs.writeFileSync(outputFile, out, "utf8");
    changedCount++;
  }
}

console.log(`inject-partials: updated ${changedCount}/${sourceFiles.length} html file(s)`);

if (diagnostics.length) {
  console.log("\nDiagnostics (missing markers):");
  for (const d of diagnostics) {
    const hd = d.head ? "ok" : "MISSING";
    const h = d.header ? "ok" : "MISSING";
    const f = d.footer ? "ok" : "MISSING";
    const hero = d.heroHome ? "ok" : "n/a";
    console.log(` - ${d.file}: HEAD=${hd}; HEADER=${h}; FOOTER=${f}; HERO:HOME=${hero}`);
  }
}

if (MIRROR_PUBLIC_PARTIALS) {
  fs.mkdirSync(PUBLIC_PARTIALS_DIR, { recursive: true });

  fs.copyFileSync(HEAD_PATH, path.join(PUBLIC_PARTIALS_DIR, "head.html"));
  fs.copyFileSync(HEADER_PATH, path.join(PUBLIC_PARTIALS_DIR, "header.html"));
  fs.copyFileSync(FOOTER_PATH, path.join(PUBLIC_PARTIALS_DIR, "footer.html"));

  console.log("✓ Mirrored partials to public/_partials (MIRROR_PUBLIC_PARTIALS=1)");
}