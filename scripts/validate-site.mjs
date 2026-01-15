#!/usr/bin/env node
/**
 * validate-site.mjs
 * - Validates internal links in built HTML (dist/) or repo root HTML.
 * - Flags missing targets, bad anchors, and accidental layout width drift.
 *
 * Usage:
 *   node scripts/validate-site.mjs --root dist
 *   node scripts/validate-site.mjs --root .
 */

import fs from "node:fs";
import path from "node:path";

const args = new Map();
for (let i = 2; i < process.argv.length; i += 2) {
  args.set(process.argv[i], process.argv[i + 1]);
}

const ROOT = path.resolve(args.get("--root") || "dist");
const MAX_ERRORS = Number(args.get("--max-errors") || 50);

// ---- helpers ----
function walk(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    else out.push(full);
  }
  return out;
}

function isHttp(href) {
  return /^https?:\/\//i.test(href);
}

function stripHashAndQuery(href) {
  return href.split("#")[0].split("?")[0];
}

function normalizePath(href, fromFile) {
  // Ignore mailto/tel/javascript
  if (!href || href.startsWith("mailto:") || href.startsWith("tel:") || href.startsWith("javascript:")) return null;

  // External is allowed
  if (isHttp(href)) return { kind: "external" };

  // Root-relative: "/docs.html"
  if (href.startsWith("/")) {
    const clean = stripHashAndQuery(href);
    return { kind: "file", target: path.join(ROOT, clean.replace(/^\//, "")) };
  }

  // Same-page anchor only: "#section"
  if (href.startsWith("#")) {
    return { kind: "anchor", anchor: href.slice(1) };
  }

  // Relative: "getting-started.html"
  const clean = stripHashAndQuery(href);
  return { kind: "file", target: path.resolve(path.dirname(fromFile), clean) };
}

function readFileSafe(p) {
  try {
    return fs.readFileSync(p, "utf8");
  } catch {
    return null;
  }
}

function extractLinks(html) {
  // Basic: href="..."
  const links = [];
  const re = /<a\b[^>]*\bhref\s*=\s*"(.*?)"/gi;
  let m;
  while ((m = re.exec(html)) !== null) links.push(m[1]);
  return links;
}

function extractIds(html) {
  // For anchor validation: id="..."
  const ids = new Set();
  const re = /\bid\s*=\s*"(.*?)"/gi;
  let m;
  while ((m = re.exec(html)) !== null) ids.add(m[1]);
  return ids;
}

function hasLayoutDrift(html) {
  // Guardrail: your centered layout should still use container + constrained max width.
  // Customize these to match your canonical classes/structure.
  const mustHaveAny = [
    /class="[^"]*\bcontainer\b[^"]*"/i,
    /class="[^"]*\bsite-header\b[^"]*"/i,
    /class="[^"]*\bsite-footer\b[^"]*"/i,
  ];

  // Also flag obvious “full-bleed drift” patterns (optional)
  const driftSignals = [
    /max-width:\s*none/i,
    /width:\s*100vw/i,
  ];

  const missingMustHave = mustHaveAny.some((r) => !r.test(html));
  const hasDriftSignal = driftSignals.some((r) => r.test(html));
  return missingMustHave || hasDriftSignal;
}

// ---- run ----
if (!fs.existsSync(ROOT)) {
  console.error(`❌ Root not found: ${ROOT}`);
  process.exit(2);
}

const allFiles = walk(ROOT);
const htmlFiles = allFiles.filter((f) => f.toLowerCase().endsWith(".html"));

if (htmlFiles.length === 0) {
  console.error(`❌ No HTML files found under: ${ROOT}`);
  process.exit(2);
}

let errors = 0;
const warn = [];
const anchorIndex = new Map(); // file -> ids

for (const file of htmlFiles) {
  const html = readFileSafe(file);
  if (!html) continue;
  anchorIndex.set(file, extractIds(html));

  if (hasLayoutDrift(html)) {
    warn.push(`⚠️  Layout guardrail triggered in: ${path.relative(ROOT, file)}`);
  }
}

for (const file of htmlFiles) {
  const html = readFileSafe(file);
  if (!html) continue;

  const links = extractLinks(html);
  const idsHere = anchorIndex.get(file) || new Set();

  for (const href of links) {
    const info = normalizePath(href, file);
    if (!info) continue;

    // External allowed
    if (info.kind === "external") continue;

    // Anchor-only
    if (info.kind === "anchor") {
      if (info.anchor && !idsHere.has(info.anchor)) {
        console.error(`❌ Missing anchor #${info.anchor} in ${path.relative(ROOT, file)} (href="${href}")`);
        errors++;
      }
      continue;
    }

    // File target (may also include anchor)
    const targetPath = info.target;

    // Handle directories: "/docs/" -> "/docs/index.html" (optional)
    let resolvedTarget = targetPath;
    if (fs.existsSync(targetPath) && fs.statSync(targetPath).isDirectory()) {
      resolvedTarget = path.join(targetPath, "index.html");
    }

    if (!fs.existsSync(resolvedTarget)) {
      console.error(
        `❌ Broken link target: ${path.relative(ROOT, file)} -> ${href} (missing ${path.relative(ROOT, resolvedTarget)})`
      );
      errors++;
      if (errors >= MAX_ERRORS) break;
      continue;
    }

    // If href includes "#anchor", validate it against target file
    const hash = href.includes("#") ? href.split("#")[1].split("?")[0] : "";
    if (hash) {
      const targetHtml = readFileSafe(resolvedTarget) ?? "";
      const targetIds = anchorIndex.get(resolvedTarget) || extractIds(targetHtml);
      if (!targetIds.has(hash)) {
        console.error(
          `❌ Broken anchor: ${path.relative(ROOT, file)} -> ${href} (no id="${hash}" in ${path.relative(
            ROOT,
            resolvedTarget
          )})`
        );
        errors++;
      }
    }

    if (errors >= MAX_ERRORS) break;
  }

  if (errors >= MAX_ERRORS) break;
}

for (const w of warn) console.log(w);

if (errors > 0) {
  console.error(`\n❌ Validation failed with ${errors} error(s).`);
  process.exit(1);
}

console.log("✅ Validation passed.");
