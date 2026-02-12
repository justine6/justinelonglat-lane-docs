// scripts/partials.js
/* eslint-disable no-console */
const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();
const PUBLIC_DIR = path.join(ROOT, "public");
const PARTIALS_DIR = path.join(PUBLIC_DIR, "_partials");

const HEADER_PATH = path.join(PARTIALS_DIR, "header.html");
const FOOTER_PATH = path.join(PARTIALS_DIR, "footer.html"); // optional

function readIfExists(p) {
  try {
    return fs.readFileSync(p, "utf8");
  } catch {
    return "";
  }
}

const HEADER_HTML = readIfExists(HEADER_PATH).trim();
const FOOTER_HTML = readIfExists(FOOTER_PATH).trim();

if (!HEADER_HTML) {
  console.warn(
    `[partials] WARN: Missing or empty header partial: ${path.relative(ROOT, HEADER_PATH)}`
  );
}

function walk(dir) {
  const out = [];
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);

    // Skip partials folder and any common junk
    if (ent.isDirectory()) {
      if (ent.name === "_partials") continue;
      if (ent.name === "assets") {
        // still walk assets? usually not needed; keep as skip
        // Comment this out if you keep html under assets.
        continue;
      }
      out.push(...walk(p));
      continue;
    }

    if (ent.isFile() && ent.name.toLowerCase().endsWith(".html")) {
      out.push(p);
    }
  }
  return out;
}

// Markers make the injection idempotent (no duplicates)
const HEADER_START = "<!-- PARTIAL:HEADER:START -->";
const HEADER_END = "<!-- PARTIAL:HEADER:END -->";
const FOOTER_START = "<!-- PARTIAL:FOOTER:START -->";
const FOOTER_END = "<!-- PARTIAL:FOOTER:END -->";

function stripInjected(html) {
  // Remove previously injected blocks if present
  html = html.replace(
    new RegExp(`${HEADER_START}[\\s\\S]*?${HEADER_END}\\s*`, "g"),
    ""
  );
  html = html.replace(
    new RegExp(`${FOOTER_START}[\\s\\S]*?${FOOTER_END}\\s*`, "g"),
    ""
  );
  return html;
}

function inject(html) {
  let out = stripInjected(html);

  // Inject HEADER right after <body ...> if possible; else before first visible content
  if (HEADER_HTML) {
    const headerBlock = `${HEADER_START}\n${HEADER_HTML}\n${HEADER_END}\n`;

    const bodyOpen = out.match(/<body\b[^>]*>/i);
    if (bodyOpen) {
      const idx = bodyOpen.index + bodyOpen[0].length;
      out = out.slice(0, idx) + "\n" + headerBlock + out.slice(idx);
    } else {
      // No <body> tag: prepend header
      out = headerBlock + out;
    }
  }

  // Inject FOOTER right before </body> if present
  if (FOOTER_HTML) {
    const footerBlock = `\n${FOOTER_START}\n${FOOTER_HTML}\n${FOOTER_END}\n`;
    const bodyClose = out.match(/<\/body>/i);
    if (bodyClose) {
      const idx = bodyClose.index;
      out = out.slice(0, idx) + footerBlock + out.slice(idx);
    } else {
      // No </body>: append footer
      out = out + footerBlock;
    }
  }

  return out;
}

function main() {
  if (!fs.existsSync(PUBLIC_DIR)) {
    console.error(`[partials] ERROR: Missing public dir: ${path.relative(ROOT, PUBLIC_DIR)}`);
    process.exit(1);
  }

  const files = walk(PUBLIC_DIR);

  if (!files.length) {
    console.warn("[partials] WARN: No .html files found under /public");
    return;
  }

  let changed = 0;

  for (const file of files) {
    const rel = path.relative(ROOT, file);

    // Skip generated backup pages if you want
    if (rel.includes(".bak")) continue;

    const original = fs.readFileSync(file, "utf8");
    const updated = inject(original);

    if (updated !== original) {
      fs.writeFileSync(file, updated, "utf8");
      changed++;
      console.log(`[partials] updated: ${rel}`);
    }
  }

  console.log(`[partials] done. files scanned=${files.length}, files updated=${changed}`);
}

main();
