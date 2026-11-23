// This repository's own AI_POLICY.md and AGENTS.md: exact output of the Standard preset.
// generate-presets.js writes them; validate-presets.js fails when they drift.
import { PRESETS, FILE_TYPES } from '../public/lib/templates.js';

export const ROOT_OPTS = PRESETS.standard;
export const ROOT_FILES = FILE_TYPES.filter((ft) => ft.path === 'AI_POLICY.md' || ft.path === 'AGENTS.md');
