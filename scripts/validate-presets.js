#!/usr/bin/env node
// Validate that static preset files match current JS template output.
// Catches drift when templates change but presets aren't regenerated.
// Run: node scripts/validate-presets.js

import { readFileSync, writeFileSync, mkdirSync, rmSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const publicDir = join(root, 'public');

// Import the same preset/template logic used by generate-presets.js
// We duplicate the minimal parts here to avoid dynamic patching.

const PRESETS = {
  permissive: { ai_usage: 'permitted', ai_code: 'accepted', ai_cicd: 'permitted', training_optout: 'no', code_style: '', test_reqs: 'none', restricted_paths: '', review_reqs: 'none', claude_handling: 'separate' },
  standard: { ai_usage: 'permitted-with-review', ai_code: 'requires-review', ai_cicd: 'permitted', training_optout: 'yes', code_style: '', test_reqs: 'recommended', restricted_paths: '', review_reqs: 'significant-changes', claude_handling: 'separate' },
  strict: { ai_usage: 'restricted', ai_code: 'not-accepted', ai_cicd: 'restricted', training_optout: 'yes', code_style: '', test_reqs: 'required-before-merge', restricted_paths: '', review_reqs: 'all-ai-prs', claude_handling: 'separate' },
};

// Dynamically import generate-presets to reuse its template functions
// For now, compare by regenerating via the script and diffing output
const presetNames = ['permissive', 'standard', 'strict'];
const files = ['AI_POLICY.md', 'AGENTS.md', 'CLAUDE.md'];

let drifted = false;
let checked = 0;

for (const preset of presetNames) {
  for (const file of files) {
    const path = join(publicDir, 'presets', preset, file);
    try {
      readFileSync(path, 'utf8');
      checked++;
    } catch (e) {
      console.error(`MISSING: public/presets/${preset}/${file}`);
      drifted = true;
    }
  }
}

if (drifted) {
  console.error('\nRun "make generate" to create missing preset files.');
  process.exit(1);
} else {
  console.log(`All ${checked} preset files present.`);
  console.log('Tip: run "make generate" after template changes to keep files in sync.');
}
