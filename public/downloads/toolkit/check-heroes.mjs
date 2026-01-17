import fs from "fs";
import path from "path";
import process from "process";

const ROOT = process.cwd();
const PARTIALS = path.join(ROOT, "partials", "heroes");

const HERO_MAP = {
  "HERO:HOME": "home.html",
};

function fail(msg) {
  console.error(`✗ ${msg}`);
  process.exit(1);
}

function ok(msg) {
  console.log(`✓ ${msg}`);
}

function read(p) {
  return fs.readFileSync(p, "utf8");
}

function extractMarkerBlock(html, name) {
  const open = `<!-- PARTIAL:${name} -->`;
  const close = `<!-- /PARTIAL:${name} -->`;

  const start = html.indexOf(open);
  const end = html.indexOf(close);

  if (start === -1 || end === -1 || end < start) return null;

  const inner = html.slice(start + open.length, end).trim();
  return inner;
}

const targetFile = path.join(PUBLIC, "index.html");
if (!fs.existsSync(targetFile)) fail(`Missing public/index.html`);

const page = read(targetFile);

for (const [marker, partialFile] of Object.entries(HERO_MAP)) {
  const partialPath = path.join(PARTIALS, partialFile);
  if (!fs.existsSync(partialPath)) fail(`Missing hero partial: ${partialPath}`);

  const canonical = read(partialPath).trim();
  if (!canonical) fail(`Hero partial is empty: ${partialPath}`);

  const current = extractMarkerBlock(page, marker);
  if (!current) fail(`Missing marker block in index.html: ${marker}`);

  if (current.trim() !== canonical) {
    fail(
      `Hero drift detected for ${marker}\n` +
      `Fix: run node scripts/inject-heroes.mjs and commit the result.`
    );
  }

  ok(`Hero frozen: ${marker} matches ${partialFile}`);
}

ok("All hero blocks are frozen and match canonical snippets");
