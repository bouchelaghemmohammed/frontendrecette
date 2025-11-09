/**
 * Usage:
 *  cd frontend
 *  node scripts/check-imports-exports.js
 *
 * Enhanced: ignores import paths that are only dots ('.', '..', '...') and skips non-relative imports.
 * Heuristic only — catches many default/named export mismatches and missing files.
 */
import fs from "fs";
import path from "path";

const SRC = path.join(process.cwd(), "src");

function walk(dir) {
  const out = [];
  for (const f of fs.readdirSync(dir)) {
    const fp = path.join(dir, f);
    const stat = fs.statSync(fp);
    if (stat.isDirectory()) {
      out.push(...walk(fp));
    } else if (/\.(js|jsx|ts|tsx)$/.test(f)) {
      out.push(fp);
    }
  }
  return out;
}

function read(file) {
  try {
    return fs.readFileSync(file, "utf8");
  } catch {
    return null;
  }
}

function resolveImport(fromFile, impPath) {
  // Ignore non-relative imports (node_modules) and ignore impPaths that are only dots like '.' '..' '...'
  if (!impPath.startsWith(".")) return null;
  if (/^\.+$/.test(impPath)) return null;

  const base = path.dirname(fromFile);
  const tryPaths = [
    path.resolve(base, impPath),
    path.resolve(base, impPath + ".js"),
    path.resolve(base, impPath + ".jsx"),
    path.resolve(base, impPath + ".ts"),
    path.resolve(base, impPath + ".tsx"),
    path.resolve(base, impPath, "index.js"),
    path.resolve(base, impPath, "index.jsx")
  ];
  for (const p of tryPaths) {
    if (fs.existsSync(p) && fs.statSync(p).isFile()) return p;
  }
  return null;
}

function parseImports(content) {
  const regex = /import\s+((?:[\w*\s{},]+)\s+from\s+)?["']([^"']+)["'];?/g;
  const results = [];
  let m;
  while ((m = regex.exec(content)) !== null) {
    const importClause = m[1] || "";
    const impPath = m[2];
    results.push({ importClause: importClause.trim(), impPath });
  }
  return results;
}

const files = walk(SRC);
const issues = [];

for (const file of files) {
  const content = read(file);
  if (!content) continue;
  const imports = parseImports(content);
  for (const imp of imports) {
    // Skip non-relative imports
    if (!imp.impPath.startsWith(".")) continue;
    // Skip imports that are only dots ('.', '..', '...')
    if (/^\.+$/.test(imp.impPath)) continue;

    const target = resolveImport(file, imp.impPath);
    if (!target) {
      issues.push({ type: "missing-file", from: path.relative(process.cwd(), file), import: imp.impPath });
      continue;
    }
    const targetContent = read(target);
    if (!targetContent) {
      issues.push({ type: "cannot-read", file: target });
      continue;
    }
    // Heuristics: default vs named import checks
    const defaultImportMatch = /^import\s+([A-Za-z0-9_$]+)\s+from/.test(imp.importClause);
    const namedImportMatch = /import\s+{([^}]+)}/.test(imp.importClause);
    const hasDefaultExport = /export\s+default\s+/m.test(targetContent);
    const namedImports = [];
    const namedMatch = imp.importClause.match(/import\s+{([^}]+)}/);
    if (namedMatch) {
      namedMatch[1].split(",").forEach(s => namedImports.push(s.trim().split(/\s+as\s+/)[0]));
    }
    if (defaultImportMatch && !hasDefaultExport) {
      issues.push({
        type: "default-missing",
        from: path.relative(process.cwd(), file),
        import: imp.impPath,
        target: path.relative(process.cwd(), target)
      });
    }
    if (namedImports.length) {
      for (const n of namedImports) {
        const namedRegex = new RegExp(`export\\s+(?:const|function|class|let|var)\\s+${n}\\b|export\\s*{[^}]*\\b${n}\\b`, "m");
        if (!namedRegex.test(targetContent)) {
          issues.push({
            type: "named-missing",
            from: path.relative(process.cwd(), file),
            import: imp.impPath,
            target: path.relative(process.cwd(), target),
            symbol: n
          });
        }
      }
    }
  }
}

// Print results
if (issues.length === 0) {
  console.log("No obvious import/export mismatches detected by heuristic.");
  process.exit(0);
}

console.log("Potential problems detected:");
for (const it of issues) {
  if (it.type === "missing-file") {
    console.log(`- Missing target file: ${it.from} imports "${it.import}" (target file not found)`);
  } else if (it.type === "default-missing") {
    console.log(`- Default export missing: ${it.from} imports default from "${it.import}" -> target ${it.target} has no 'export default'`);
  } else if (it.type === "named-missing") {
    console.log(`- Named export missing: ${it.from} imports { ${it.symbol} } from "${it.import}" -> target ${it.target} has no export of '${it.symbol}'`);
  } else {
    console.log("- Other issue: ", it);
  }
}
process.exit(0);