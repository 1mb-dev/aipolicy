// Cross-platform ZIP extraction test.
// Generates a ZIP via the actual production code path (public/lib/zip.js),
// extracts with the system `unzip`, and asserts the extracted tree matches
// the file list passed in. Catches regressions where the ZIP writer emits
// bytes the host platform's unzip can't parse, or fails to create nested
// directories from filenames containing '/'.

import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { PRESETS, FILE_TYPES } from '../public/lib/templates.js';
import { createZip } from '../public/lib/zip.js';

const tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'aipolicy-zip-'));

try {
  // 1. Generate ZIP for the 'standard' preset using the real code path.
  const opts = PRESETS.standard;
  const files = FILE_TYPES.map(t => ({ name: t.path, content: t.generator(opts) }));
  const blob = createZip(files);
  const bytes = Buffer.from(await blob.arrayBuffer());
  const zipPath = path.join(tmpRoot, 'aipolicy-standard.zip');
  fs.writeFileSync(zipPath, bytes);

  // 2. Validate the ZIP structure with `unzip -t` before extracting.
  // This rejects malformed ZIPs (bad CRC, wrong offsets, etc.) before
  // we trust the extracted tree.
  execFileSync('unzip', ['-t', zipPath], { stdio: 'pipe' });

  // 3. Extract into a clean directory.
  const extractDir = path.join(tmpRoot, 'extracted');
  fs.mkdirSync(extractDir);
  execFileSync('unzip', ['-q', zipPath, '-d', extractDir], { stdio: 'pipe' });

  // 4. Assert each expected file exists at its expected nested path and
  // matches the regenerated template byte-for-byte.
  for (const ft of FILE_TYPES) {
    const extracted = path.join(extractDir, ft.path);
    if (!fs.existsSync(extracted)) {
      throw new Error(`Expected file not extracted: ${ft.path}`);
    }
    const got = fs.readFileSync(extracted, 'utf8');
    const want = ft.generator(opts);
    if (got !== want) {
      throw new Error(`Extracted content mismatch for ${ft.path}`);
    }
  }

  // 5. Assert directory structure: nested paths must have produced real dirs.
  const nestedDirs = ['.github', '.cursor', path.join('.cursor', 'rules')];
  for (const d of nestedDirs) {
    const full = path.join(extractDir, d);
    if (!fs.existsSync(full) || !fs.statSync(full).isDirectory()) {
      throw new Error(`Expected directory not created from nested filename: ${d}`);
    }
  }

  console.log(`ZIP extraction test passed (${FILE_TYPES.length} files, ${nestedDirs.length} nested dirs verified).`);
} finally {
  fs.rmSync(tmpRoot, { recursive: true, force: true });
}
