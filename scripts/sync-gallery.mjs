#!/usr/bin/env node
/**
 * sync-gallery.mjs — ClearNest before/after gallery sync.
 *
 * Reads numbered job folders from `~/Documents/ClearNest/Before-After/`
 * (or any of the legacy aliases) and:
 *   1. Finds the `before.*` and `after.*` photos in each numbered folder.
 *   2. Converts HEIC (iPhone default) → JPEG via macOS `sips`.
 *   3. Resizes anything wider than 2400px to keep payloads sensible.
 *   4. Copies the final web-ready images to `public/gallery/{N}/`.
 *   5. Honors optional `meta.json` per folder (`{ "label", "category" }`).
 *   6. Regenerates `lib/before-after.ts` so the React gallery shows them.
 *
 * Usage:
 *   npm run sync-gallery
 *
 * Re-run anytime you add more cleaning photos. Idempotent — safe to run
 * over and over. The script does not delete photos in `public/gallery/`
 * that no longer have a source folder; pass `--prune` to clean those up.
 */

import { existsSync, mkdirSync, rmSync, readdirSync, readFileSync, statSync, writeFileSync, copyFileSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join, resolve, basename, extname } from "node:path";
import { execSync, spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const ROOT = resolve(dirname(__filename), "..");

const SOURCE_CANDIDATES = [
  join(homedir(), "Documents", "ClearNest", "Before-After"),
  // "Before:After" on disk = a folder the owner named "Before/After" in Finder
  // (macOS swaps "/" ↔ ":" between the Finder and POSIX layers).
  join(homedir(), "Documents", "ClearNest", "Before:After"),
  join(homedir(), "Documents", "ClearNest", "BeforeAfter"),
  join(homedir(), "Documents", "ClearNest", "before-after"),
  join(homedir(), "Documents", "ClearNest", "Before & After"),
  join(homedir(), "Documents", "ClearNest", "Before-and-After"),
];

const TARGET = join(ROOT, "public", "gallery");
const MANIFEST = join(ROOT, "lib", "before-after.ts");
const MAX_WIDTH = 2400;
const VALID_CATEGORIES = ["Kitchen", "Bathroom", "Bedroom", "Living", "Airbnb", "Other"];
const args = new Set(process.argv.slice(2));
const PRUNE = args.has("--prune");

// ---------- helpers ----------

function log(...a) { console.log("  ", ...a); }
function ok(...a) { console.log("✓ ", ...a); }
function warn(...a) { console.warn("⚠ ", ...a); }
function fail(...a) { console.error("✗ ", ...a); process.exit(1); }

/** Count how many numbered subfolders in `dir` contain a complete before+after pair. */
function countPairs(dir) {
  try {
    const numbered = readdirSync(dir).filter(
      (n) => /^\d+$/.test(n) && statSync(join(dir, n)).isDirectory()
    );
    let c = 0;
    for (const n of numbered) {
      const { before, after } = findPair(join(dir, n));
      if (before && after) c++;
    }
    return c;
  } catch {
    return 0;
  }
}

function findSource() {
  // Explicit override (used when the agent's sandboxed shell can't read
  // ~/Documents due to macOS TCC — it stages a readable copy and points here).
  const override = process.env.CLEARNEST_GALLERY_SRC;
  if (override && existsSync(override) && statSync(override).isDirectory()) return override;

  const existing = SOURCE_CANDIDATES.filter(
    (p) => existsSync(p) && statSync(p).isDirectory()
  );
  if (existing.length === 0) return null;

  // Prefer whichever existing candidate actually has photo pairs, so an empty
  // template folder never wins over the one the owner filled with photos.
  let best = existing[0];
  let bestCount = countPairs(existing[0]);
  for (const p of existing.slice(1)) {
    const c = countPairs(p);
    if (c > bestCount) {
      best = p;
      bestCount = c;
    }
  }
  return best;
}

function naturalSort(a, b) {
  return a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" });
}

function isImageExt(ext) {
  return [".jpg", ".jpeg", ".png", ".heic", ".heif", ".webp"].includes(ext.toLowerCase());
}

function listImages(dir) {
  return readdirSync(dir)
    .filter((f) => isImageExt(extname(f)))
    .map((f) => ({ name: f, lower: f.toLowerCase(), path: join(dir, f) }));
}

function findPair(dir) {
  const imgs = listImages(dir);
  const before = imgs.find((i) => i.lower.startsWith("before"));
  const after = imgs.find((i) => i.lower.startsWith("after"));
  return { before, after, all: imgs };
}

function readMeta(dir) {
  const p = join(dir, "meta.json");
  if (!existsSync(p)) return {};
  try {
    return JSON.parse(readFileSync(p, "utf8"));
  } catch (e) {
    warn(`meta.json in ${dir} is not valid JSON — ignoring (${e.message})`);
    return {};
  }
}

/** Convert HEIC/HEIF → JPEG with macOS sips; returns the new path. */
function heicToJpeg(srcPath, destPath) {
  const r = spawnSync("sips", ["-s", "format", "jpeg", srcPath, "--out", destPath], {
    encoding: "utf8",
  });
  if (r.status !== 0) {
    throw new Error(`sips HEIC→JPEG failed for ${srcPath}: ${r.stderr || r.stdout}`);
  }
  return destPath;
}

/** Resize an image in place using sips if it's wider than MAX_WIDTH. */
function maybeResize(path) {
  const dims = getDims(path);
  if (!dims) return dims;
  if (dims.width <= MAX_WIDTH) return dims;
  const r = spawnSync("sips", ["-Z", String(MAX_WIDTH), path], { encoding: "utf8" });
  if (r.status !== 0) {
    warn(`sips resize failed for ${path}: ${r.stderr || r.stdout}`);
    return dims;
  }
  return getDims(path) || dims;
}

function getDims(path) {
  const r = spawnSync("sips", ["-g", "pixelWidth", "-g", "pixelHeight", path], { encoding: "utf8" });
  if (r.status !== 0) return null;
  const w = r.stdout.match(/pixelWidth:\s*(\d+)/);
  const h = r.stdout.match(/pixelHeight:\s*(\d+)/);
  if (!w || !h) return null;
  return { width: Number(w[1]), height: Number(h[1]) };
}

function ensureCategory(c) {
  if (!c) return "Other";
  const norm = String(c).trim();
  const found = VALID_CATEGORIES.find((v) => v.toLowerCase() === norm.toLowerCase());
  return found ?? "Other";
}

function escapeStringForTS(s) {
  return s.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

// ---------- main ----------

function main() {
  console.log("\n  ClearNest — sync-gallery\n");

  const source = findSource();
  if (!source) {
    console.log("  No source folder found. Checked:");
    SOURCE_CANDIDATES.forEach((p) => console.log("    ·", p));
    console.log("\n  Create one (recommended path) and drop your photos in:");
    console.log("    mkdir -p ~/Documents/ClearNest/Before-After/1");
    console.log("    # then add before.jpg + after.jpg in 1/, 2/, ...");
    console.log("    npm run sync-gallery\n");
    console.log("  Nothing changed. Gallery still uses synthetic illustrations.\n");
    return;
  }
  ok(`Source: ${source}`);

  // Find every numbered folder.
  const numbered = readdirSync(source)
    .filter((name) => {
      const full = join(source, name);
      return statSync(full).isDirectory() && /^\d+$/.test(name);
    })
    .sort(naturalSort);

  if (numbered.length === 0) {
    warn(`No numbered subfolders (1, 2, 3, ...) found inside ${source}`);
    console.log("\n  Drop your photos like:");
    console.log("    Before-After/1/before.jpg + after.jpg");
    console.log("    Before-After/2/before.heic + after.heic\n");
    return;
  }
  log(`Found ${numbered.length} numbered job folder(s): ${numbered.join(", ")}\n`);

  // Clean target before writing.
  if (PRUNE && existsSync(TARGET)) {
    rmSync(TARGET, { recursive: true, force: true });
    log("Pruned old public/gallery/");
  }
  mkdirSync(TARGET, { recursive: true });

  const pairs = [];
  const skipped = [];

  for (const id of numbered) {
    const folder = join(source, id);
    const { before, after, all } = findPair(folder);

    if (!before || !after) {
      skipped.push({ id, reason: `missing ${[!before && "before", !after && "after"].filter(Boolean).join(" and ")} (saw: ${all.map((i) => i.name).join(", ") || "nothing"})` });
      continue;
    }

    const outDir = join(TARGET, id);
    mkdirSync(outDir, { recursive: true });

    let beforeOut, afterOut;
    try {
      beforeOut = prepareImage(before.path, outDir, "before");
      afterOut = prepareImage(after.path, outDir, "after");
    } catch (e) {
      skipped.push({ id, reason: e.message });
      continue;
    }

    const dims = getDims(afterOut) || getDims(beforeOut) || { width: 1600, height: 1200 };
    const meta = readMeta(folder);
    const label = meta.label || `Cleaning #${id}`;
    const category = ensureCategory(meta.category);
    const city = meta.city || null;
    if (meta.city && !LOCATION_SLUGS.includes(meta.city)) {
      warn(`#${id} meta.json city: "${meta.city}" is not a valid city slug from lib/locations.ts. Ignoring.`);
    }

    pairs.push({
      id,
      label,
      category,
      city: meta.city && LOCATION_SLUGS.includes(meta.city) ? meta.city : null,
      beforeSrc: `/gallery/${id}/${basename(beforeOut)}`,
      afterSrc: `/gallery/${id}/${basename(afterOut)}`,
      width: dims.width,
      height: dims.height,
    });

    ok(`#${id}  ${label}  (${category}) ${city ? `[${city}]` : ''} — ${dims.width}×${dims.height}`);
  }

  // Write manifest.
  writeManifest(pairs);
  console.log("");
  if (pairs.length > 0) {
    ok(`Manifest written: lib/before-after.ts  (${pairs.length} pair(s))`);
    ok(`Photos copied to: public/gallery/`);
    const withoutCity = pairs.filter(p => !p.city).length;
    if (withoutCity > 0) {
      console.log('')
      warn(`${withoutCity} photo pair(s) are missing a "city" in their meta.json.`);
      console.log(`   Add ' "city": "sandy-ut" ' to link photos to city pages for a huge conversion boost.`);
    }
  }
  if (skipped.length > 0) {
    console.log("");
    skipped.forEach((s) => warn(`Skipped #${s.id}: ${s.reason}`));
  }
  console.log("\n  Next step:  git add -A && git commit -m \"Add before/after photos\" && git push\n");
}

/** Copy + convert + resize a source image into outDir as `before.jpg` / `after.jpg`. */
function prepareImage(srcPath, outDir, kind /* "before" | "after" */) {
  const ext = extname(srcPath).toLowerCase();
  const isHeic = ext === ".heic" || ext === ".heif";
  const outName = `${kind}.jpg`;
  const outPath = join(outDir, outName);

  if (isHeic) {
    heicToJpeg(srcPath, outPath);
  } else if (ext === ".jpg" || ext === ".jpeg") {
    copyFileSync(srcPath, outPath);
  } else if (ext === ".png" || ext === ".webp") {
    // Convert to JPEG for consistent compression + smaller payloads.
    const tmp = outPath + ".src" + ext;
    copyFileSync(srcPath, tmp);
    const r = spawnSync("sips", ["-s", "format", "jpeg", tmp, "--out", outPath], { encoding: "utf8" });
    rmSync(tmp, { force: true });
    if (r.status !== 0) throw new Error(`sips ${ext}→jpeg failed: ${r.stderr || r.stdout}`);
  } else {
    throw new Error(`Unsupported image type: ${ext}`);
  }

  maybeResize(outPath);
  return outPath;
}

function writeManifest(pairs) {
  const header = `/**
 * Before / After gallery manifest.
 *
 * This file is **auto-generated** by \`scripts/sync-gallery.mjs\`.
 * DO NOT EDIT BY HAND — run the sync script.
 */
import type { LocationSlug } from "@/lib/locations";
export type Category = "Kitchen" | "Bathroom" | "Bedroom" | "Living" | "Airbnb" | "Other";

export interface BeforeAfterPair {
  id: string;
  label: string;
  category: Category;
  city: LocationSlug | null;
  beforeSrc: string;
  afterSrc: string;
  width: number;
  height: number;
}

`;

  const body = `export const BEFORE_AFTER_PAIRS: BeforeAfterPair[] = ${pairs.length === 0 ? "[]" : "[\n" + pairs
    .map((p) =>
      `  {
    id: "${escapeStringForTS(p.id)}",
    label: "${escapeStringForTS(p.label)}",
    category: "${p.category}",
    city: ${p.city ? `"${p.city}"` : "null"},
    beforeSrc: "${p.beforeSrc}",
    afterSrc: "${p.afterSrc}",
    width: ${p.width},
    height: ${p.height},
  },`
    )
    .join("\n") + "\n]"};

/** Whether to use the real-photo gallery or fall back to synthetic illustrations. */
export const HAS_REAL_PHOTOS = BEFORE_AFTER_PAIRS.length > 0;
`;

  writeFileSync(MANIFEST, header + body);
}

main();
