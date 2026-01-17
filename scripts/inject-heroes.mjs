/**
 * inject-heroes.mjs
 * -----------------
 * Injects canonical hero fragments into public pages.
 * Currently supports: Home hero -> public/index.html
 */

import fs from "fs";
import path from "path";
import process from "process";

const ROOT = process.cwd();
const PARTIALS_DIR = path.join(ROOT, "partials", "heroes");
const PUBLIC_DIR = path.join(ROOT, "public");

const HERO_PARTIAL = path.join(PARTIALS_DIR, "home.html");
const TARGET = path.join(PUBLIC_DIR, "index.html");

const MARKER = {
  name: "HERO:HOME",
  open: "<!-- PARTIAL:HERO:HOME -->",
  close: "<!-- /PARTIAL:HERO:HOME -->",
};

function fail(msg) {
  console.error(`✗ ${msg}`);
  process.exit(1);
}

function ok(msg) {
  console.log(`✓ ${msg}`);
}

function readUtf8(p) {
  return fs.readFileSync(p, "utf8");
}

function writeUtf8(p, s) {
  fs.writeFileSync(p, s, "utf8");
}

function assertHeroFragmentSafe(html) {
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

function replaceMarkerBlock(page, open, close, replacementInner) {
  const start = page.indexOf(open);
  const end = page.indexOf(close);

  if (start === -1 || end === -1 || end < start) return null;

  const before = page.slice(0, start + open.length);
  const after = page.slice(end);

  // Keep a clean newline structure around injected fragment
  const injected = `\n${replacementInner.trim()}\n`;

  return `${before}${injected}${after}`;
}

// ---- validations ----
if (!fs.existsSync(TARGET)) fail(`Missing target: public/index.html`);
if (!fs.existsSync(HERO_PARTIAL)) fail(`Missing hero partial: partials/heroes/home.html`);

const hero = readUtf8(HERO_PARTIAL).trim();
if (!hero) fail(`Hero partial is empty: partials/heroes/home.html`);
assertHeroFragmentSafe(hero);

const page = readUtf8(TARGET);

if (!page.includes(MARKER.open) || !page.includes(MARKER.close)) {
  fail(
    `Missing marker block in public/index.html: ${MARKER.open} ... ${MARKER.close}\n` +
      `Fix: add both marker lines where you want the hero injected.`
  );
}

const updated = replaceMarkerBlock(page, MARKER.open, MARKER.close, hero);
if (!updated) fail(`Could not replace marker block in public/index.html`);

if (updated !== page) {
  writeUtf8(TARGET, updated);
  ok("Injected home hero into public/index.html");
} else {
  ok("Home hero already up to date (no changes needed)");
}

ok("Done.");
