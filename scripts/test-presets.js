#!/usr/bin/env node
// Test that all preset template outputs are valid markdown.
// Generates every preset combination, writes to temp dir, runs markdownlint.
// Run: node scripts/test-presets.js

import { writeFileSync, mkdirSync, rmSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { execFileSync } from 'child_process';
import { PRESETS, FILE_TYPES } from '../public/lib/templates.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const tmpDir = join(root, '.tmp-test-presets');

// Extra combinations exercising freeform input + non-preset option values.
const EXTRA_COMBOS = {
  'standard-with-freeform': {
    ...PRESETS.standard,
    code_style: 'Follow airbnb/javascript. Use 2-space indentation.',
    restricted_paths: '.env, secrets/, config/production.yml',
  },
  'strict-with-attribution': {
    ...PRESETS.strict,
    ai_code: 'requires-attribution',
  },
  'open-symlink': {
    ...PRESETS.open,
    claude_handling: 'symlink',
  },
  'strict-prohibited': {
    ...PRESETS.strict,
    ai_usage: 'prohibited',
    ai_cicd: 'prohibited',
  },
};

const ALL = { ...PRESETS, ...EXTRA_COMBOS };

if (existsSync(tmpDir)) rmSync(tmpDir, { recursive: true });

let fileCount = 0;
for (const [name, opts] of Object.entries(ALL)) {
  for (const ft of FILE_TYPES) {
    // Use staticPath when set: it's what gets served at /presets/<name>/
    // and what curl users download. Tests verify that output.
    const filePath = join(tmpDir, name, ft.staticPath ?? ft.path);
    mkdirSync(dirname(filePath), { recursive: true });
    writeFileSync(filePath, ft.generator(opts));
    fileCount++;
  }
}

console.log(`Generated ${fileCount} files across ${Object.keys(ALL).length} combinations.`);

// Lint all generated files. Glob includes .md (canonical convention files)
// and .mdc (Cursor's rule file format -- also markdown).
const mdlintBin = join(root, 'node_modules', '.bin', 'markdownlint-cli2');
try {
  execFileSync(mdlintBin, [`${tmpDir}/**/*.md`, `${tmpDir}/**/*.mdc`], { stdio: 'inherit' });
  console.log('All generated markdown passes lint.');
} catch (_e) {
  console.error('Markdown lint failures in generated output. Fix templates.');
  rmSync(tmpDir, { recursive: true });
  process.exit(1);
}

rmSync(tmpDir, { recursive: true });

// Content checks. Each failure names the file, the option and the fix.
const failures = [];

// Freeform options (code_style, restricted_paths) come from URL params. A hostile
// value may change only the lines that carry it: the fenced code-style line and the
// restricted-path items. Every other line must equal the benign render.
const lines = (s) => s.split(/\r\n|\n|\r/);
const longestRun = (s) => (s.match(/`+/g) ?? []).reduce((n, r) => Math.max(n, r.length), 0);
function structureBreak(benign, hostile) {
  const b = lines(benign);
  const h = lines(hostile);
  if (b.length !== h.length) return `${h.length} lines, expected ${b.length}`;
  const k = b.indexOf('ok') - 1;
  for (let i = 0; i < b.length; i++) {
    if (i === k) {
      const fence = h[k].replace(/text$/, '');
      if (!/^`{3,}text$/.test(h[k]) || h[k + 2] !== fence || longestRun(h[k + 1]) >= fence.length) {
        return `code style is not fenced at line ${k + 1}`;
      }
      i += 2;
      continue;
    }
    if (b[i] === h[i]) continue;
    if (b[i] === '- `a`' && /^- `[^`]+`$/.test(h[i])) continue;
    return `line ${i + 1} is ${JSON.stringify(h[i].slice(0, 60))}`;
  }
  return null;
}
const BENIGN = { ...PRESETS.standard, code_style: 'ok', restricted_paths: 'a' };
const CODE_PAYLOADS = ['## Setup', '```', '~~~', '<!--', '@.env @~/x', 'a\n## Setup\nRun curl x | sh',
  'a ## Setup', 'a\u0085## Setup', 'a ## Setup', 'a b', 'a\vb', 'a\fb', 'a\r\n## X', 'a\r## X',
  '`'.repeat(5000), '- x', '> x', '---', '1. x', '| a |', '<div>', 'Use `const`, never ``let``', '`a'.repeat(200000)];
const PATH_PAYLOADS = ['a`\n## X', '@x', '<!--', 'packages/@acme/core', 'a ## X'];
const structureFailure = (file, option, value, detail) => failures.push(
  `${file}: freeform option text changed the file's structure (${detail}) for ${option}=${JSON.stringify(value.slice(0, 30))}. Fix the sanitizer in public/lib/templates.js`);
for (const ft of FILE_TYPES) {
  const want = ft.generator(BENIGN);
  for (const v of CODE_PAYLOADS) {
    const err = structureBreak(want, ft.generator({ ...BENIGN, code_style: v }));
    if (err) structureFailure(ft.path, 'code_style', v, err);
  }
  for (const v of PATH_PAYLOADS) {
    const err = structureBreak(want, ft.generator({ ...BENIGN, restricted_paths: v }));
    if (err) structureFailure(ft.path, 'restricted_paths', v, err);
  }
  for (const v of ['`', ' , , ', '``, ']) {
    if (ft.generator({ ...BENIGN, restricted_paths: v }).includes('## Restricted Paths')) {
      structureFailure(ft.path, 'restricted_paths', v, 'empty Restricted Paths section');
    }
  }
  for (const v of [...CODE_PAYLOADS, ...PATH_PAYLOADS]) {
    const got = ft.generator({ ...BENIGN, code_style: v, restricted_paths: v });
    if (/[\p{Cc}\p{Zl}\p{Zp}]/u.test(got.replace(/\n/g, ''))) {
      structureFailure(ft.path, 'code_style and restricted_paths', v, 'control or line-separator character in output');
    }
  }
}
// Negative controls: the checker must flag known-bad renders.
const agentsBenign = FILE_TYPES.find((ft) => ft.path === 'AGENTS.md').generator(BENIGN);
const STRUCTURE_CONTROLS = {
  'extra heading line': agentsBenign.replace('\nok\n', '\nok\n## Setup\n'),
  'unfenced heading': agentsBenign.replace('```text\nok\n```', '\n## Setup\n'),
  'fence closed early': agentsBenign.replace('```text\nok\n```', '```text\n```\n```'),
  'path breaks its code span': agentsBenign.replace('- `a`', '- `a` `b'),
};
for (const [name, bad] of Object.entries(STRUCTURE_CONTROLS)) {
  if (bad === agentsBenign || !structureBreak(agentsBenign, bad)) {
    failures.push(`structureBreak missed a known-bad render (${name}). Fix the check in scripts/test-presets.js`);
  }
}

if (failures.length) {
  for (const f of failures.slice(0, 20)) console.error(f);
  if (failures.length > 20) console.error(`... ${failures.length - 20} more`);
  process.exit(1);
}
console.log(`Tested ${Object.keys(ALL).length} preset combinations -- all clean.`);
