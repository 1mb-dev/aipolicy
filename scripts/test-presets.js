#!/usr/bin/env node
// Test that all preset template outputs are valid markdown.
// Generates every preset combination, writes to temp dir, runs markdownlint.
// Run: node scripts/test-presets.js

import { writeFileSync, mkdirSync, rmSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { execFileSync } from 'child_process';
import { PRESETS, generateAiPolicy, generateAgents, generateClaude } from '../public/lib/templates.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const tmpDir = join(root, '.tmp-test-presets');

// Extra test combinations that exercise freeform input + edge cases
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
  'permissive-symlink': {
    ...PRESETS.permissive,
    claude_handling: 'symlink',
  },
  'strict-prohibited': {
    ...PRESETS.strict,
    ai_usage: 'prohibited',
    ai_cicd: 'prohibited',
  },
};

const ALL = { ...PRESETS, ...EXTRA_COMBOS };

// Generate all combinations to temp dir
if (existsSync(tmpDir)) rmSync(tmpDir, { recursive: true });

let fileCount = 0;
for (const [name, opts] of Object.entries(ALL)) {
  const dir = join(tmpDir, name);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, 'AI_POLICY.md'), generateAiPolicy(opts));
  writeFileSync(join(dir, 'AGENTS.md'), generateAgents(opts));
  writeFileSync(join(dir, 'CLAUDE.md'), generateClaude(opts));
  fileCount += 3;
}

console.log(`Generated ${fileCount} files across ${Object.keys(ALL).length} combinations.`);

// Run markdownlint on all generated files
const mdlintBin = join(root, 'node_modules', '.bin', 'markdownlint-cli2');
try {
  execFileSync(mdlintBin, [`${tmpDir}/**/*.md`], { stdio: 'inherit' });
  console.log('All generated markdown passes lint.');
} catch (_e) {
  console.error('Markdown lint failures in generated output. Fix templates.');
  rmSync(tmpDir, { recursive: true });
  process.exit(1);
}

// Cleanup
rmSync(tmpDir, { recursive: true });
console.log(`Tested ${Object.keys(ALL).length} preset combinations -- all clean.`);
