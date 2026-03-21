#!/usr/bin/env node
// Validate that static preset files match current template output.
// Catches drift when templates change but presets aren't regenerated.
// Run: node scripts/validate-presets.js

import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { PRESETS, generateAiPolicy, generateAgents, generateClaude } from '../public/lib/templates.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const publicDir = join(root, 'public');

const generators = {
  'AI_POLICY.md': generateAiPolicy,
  'AGENTS.md': generateAgents,
  'CLAUDE.md': generateClaude,
};

let drifted = false;
let checked = 0;

for (const [preset, opts] of Object.entries(PRESETS)) {
  for (const [file, gen] of Object.entries(generators)) {
    const path = join(publicDir, 'presets', preset, file);
    const expected = gen(opts);

    try {
      const actual = readFileSync(path, 'utf8');
      if (actual !== expected) {
        console.error(`DRIFT: public/presets/${preset}/${file} does not match template output`);
        drifted = true;
      }
      checked++;
    } catch (_e) {
      console.error(`MISSING: public/presets/${preset}/${file}`);
      drifted = true;
    }
  }
}

if (drifted) {
  console.error('\nRun "make generate" to update preset files.');
  process.exit(1);
} else {
  console.log(`All ${checked} preset files match template output.`);
}
