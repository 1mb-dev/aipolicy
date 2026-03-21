#!/usr/bin/env node
// Generate static preset files for CLI downloads (curl/wget)
// Run: node scripts/generate-presets.js
// Output: public/presets/{permissive,standard,strict}/{AI_POLICY,AGENTS,CLAUDE}.md

import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { PRESETS, generateAiPolicy, generateAgents, generateClaude } from '../public/lib/templates.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

for (const [name, opts] of Object.entries(PRESETS)) {
  const dir = join(root, 'public', 'presets', name);
  mkdirSync(dir, { recursive: true });

  writeFileSync(join(dir, 'AI_POLICY.md'), generateAiPolicy(opts));
  writeFileSync(join(dir, 'AGENTS.md'), generateAgents(opts));
  writeFileSync(join(dir, 'CLAUDE.md'), generateClaude(opts));

  console.log(`Generated public/presets/${name}/`);
}

console.log('Done.');
