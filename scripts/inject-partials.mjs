import fs from "fs";
import path from "path";

const ROOT = process.cwd();
const PARTIALS = path.join(ROOT, "partials");
const PUBLIC = path.join(ROOT, "public");

const header = fs.readFileSync(path.join(PARTIALS, "header.html"), "utf8").trim();
const footer = fs.readFileSync(path.join(PARTIALS, "footer.html"), "utf8").trim();

const targets = fs
  .readdirSync(PUBLIC)
  .filter((f) => f.endsWith(".html"))
  .map((f) => path.join(PUBLIC, f));

function replaceBlock(html, tag, replacement) {
  const re = new RegExp(`<${tag}\\b[^>]*>[\\s\\S]*?<\\/${tag}>`, "i");
  if (!re.test(html)) return { html, changed: false };
  return { html: html.replace(re, replacement), changed: true };
}

let changedCount = 0;

for (const file of targets) {
  const before = fs.readFileSync(file, "utf8");
  let out = before;

  let r1 = replaceBlock(out, "header", header);
  out = r1.html;

  let r2 = replaceBlock(out, "footer", footer);
  out = r2.html;

  if (r1.changed || r2.changed) {
    fs.writeFileSync(file, out, "utf8");
    changedCount++;
  }
}

console.log(`inject-partials: updated ${changedCount}/${targets.length} html file(s)`);
