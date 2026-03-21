// aipolicy -- UI logic: presets, tabs, zip, URL params, theme, clipboard
// Templates and preset definitions imported from lib/templates.js

'use strict';

import { PRESETS, LABELS, generateAiPolicy, generateAgents, generateClaude } from '../lib/templates.js';

// ============================================
// Utilities
// ============================================

function debounce(fn, ms) {
  let id;
  return (...args) => { clearTimeout(id); id = setTimeout(() => fn(...args), ms); };
}

// ============================================
// State
// ============================================

const state = {
  preset: 'standard',
  options: { ...PRESETS.standard },
  activeTab: 'policy',
  modified: false,
};

function getGeneratedFiles() {
  return {
    policy: generateAiPolicy(state.options),
    agents: generateAgents(state.options),
    claude: generateClaude(state.options),
  };
}

// ============================================
// Render
// ============================================

function renderPreview() {
  const files = getGeneratedFiles();
  const panels = {
    policy: document.getElementById('panel-policy'),
    agents: document.getElementById('panel-agents'),
    claude: document.getElementById('panel-claude'),
  };

  for (const [key, el] of Object.entries(panels)) {
    if (el) el.value = files[key];
  }
}

// Read current content from the textarea (includes user edits)
function getFileContent(key) {
  const panel = document.getElementById(`panel-${key}`);
  return panel ? panel.value : '';
}

function renderPresetCards() {
  const cards = document.querySelectorAll('.preset-card');
  for (const card of cards) {
    const isSelected = card.dataset.preset === state.preset;
    card.setAttribute('aria-checked', isSelected ? 'true' : 'false');
    card.setAttribute('tabindex', isSelected ? '0' : '-1');

    const label = card.querySelector('.preset-label');
    if (label) {
      const baseName = card.dataset.preset.charAt(0).toUpperCase() + card.dataset.preset.slice(1);
      label.textContent = (isSelected && state.modified) ? `${baseName} (modified)` : baseName;
    }
  }
}

const FILE_NAMES = { policy: 'AI_POLICY.md', agents: 'AGENTS.md', claude: 'CLAUDE.md' };

function renderTabs() {
  const tabMap = { policy: 'tab-policy', agents: 'tab-agents', claude: 'tab-claude' };
  const panelMap = { policy: 'panel-policy', agents: 'panel-agents', claude: 'panel-claude' };

  for (const [key, tabId] of Object.entries(tabMap)) {
    const tab = document.getElementById(tabId);
    const panel = document.getElementById(panelMap[key]);
    if (!tab || !panel) continue;

    const isActive = key === state.activeTab;
    tab.setAttribute('aria-selected', isActive ? 'true' : 'false');
    tab.setAttribute('tabindex', isActive ? '0' : '-1');
    panel.hidden = !isActive;
  }

  const copyBtn = document.querySelector('.copy-btn');
  if (copyBtn) {
    copyBtn.setAttribute('aria-label', `Copy ${FILE_NAMES[state.activeTab]} content`);
  }
}

function renderOptions() {
  for (const [key, value] of Object.entries(state.options)) {
    const el = document.querySelector(`[data-param="${key}"]`);
    if (el) el.value = value;
  }
}

function checkModified() {
  const base = PRESETS[state.preset];
  state.modified = Object.keys(base).some(k => state.options[k] !== base[k]);
}

function updateUrl() {
  const params = new URLSearchParams();
  params.set('preset', state.preset);

  const base = PRESETS[state.preset];
  for (const [key, value] of Object.entries(state.options)) {
    if (value !== base[key] && value !== '') {
      params.set(key, value);
    }
  }

  const qs = params.toString();
  const url = qs ? `${location.pathname}?${qs}` : location.pathname;
  history.replaceState(null, '', url);
}

function render() {
  renderPreview();
  renderPresetCards();
  renderTabs();
  updateUrl();
}

// ============================================
// Preset Switching
// ============================================

function initPresets() {
  const container = document.querySelector('.presets');
  const presetKeys = Object.keys(PRESETS);

  for (const card of container.querySelectorAll('.preset-card')) {
    card.addEventListener('click', () => {
      const preset = card.dataset.preset;
      if (!PRESETS[preset]) return;
      state.preset = preset;
      state.options = { ...PRESETS[preset] };
      state.modified = false;
      renderOptions();
      render();
    });
  }

  container.addEventListener('keydown', (e) => {
    const card = e.target.closest('.preset-card');
    if (!card) return;
    const currentIdx = presetKeys.indexOf(card.dataset.preset);
    let newIdx = -1;

    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') newIdx = (currentIdx + 1) % presetKeys.length;
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') newIdx = (currentIdx - 1 + presetKeys.length) % presetKeys.length;
    else if (e.key === 'Home') newIdx = 0;
    else if (e.key === 'End') newIdx = presetKeys.length - 1;

    if (newIdx >= 0) {
      e.preventDefault();
      const target = container.querySelector(`[data-preset="${presetKeys[newIdx]}"]`);
      target.click();
      target.focus();
    }
  });
}

// ============================================
// Tab Navigation
// ============================================

function initTabs() {
  const tabs = document.querySelectorAll('[role="tab"]');
  const tabKeys = ['policy', 'agents', 'claude'];

  for (const tab of tabs) {
    tab.addEventListener('click', () => {
      const key = tab.id.replace('tab-', '');
      state.activeTab = key;
      renderTabs();
    });

    tab.addEventListener('keydown', (e) => {
      const currentIdx = tabKeys.indexOf(state.activeTab);
      let newIdx = -1;

      if (e.key === 'ArrowRight') newIdx = (currentIdx + 1) % tabKeys.length;
      else if (e.key === 'ArrowLeft') newIdx = (currentIdx - 1 + tabKeys.length) % tabKeys.length;
      else if (e.key === 'Home') newIdx = 0;
      else if (e.key === 'End') newIdx = tabKeys.length - 1;

      if (newIdx >= 0) {
        e.preventDefault();
        state.activeTab = tabKeys[newIdx];
        renderTabs();
        document.getElementById(`tab-${tabKeys[newIdx]}`).focus();
      }
    });
  }
}

// ============================================
// Customize Panel
// ============================================

function initCustomize() {
  const toggle = document.querySelector('.customize-toggle');
  const panel = document.getElementById('customize-panel');
  if (!toggle || !panel) return;

  toggle.addEventListener('click', () => {
    const expanded = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', expanded ? 'false' : 'true');
    if (expanded) {
      // Set explicit height first so transition has a start value
      panel.style.maxHeight = panel.scrollHeight + 'px';
      requestAnimationFrame(() => { panel.style.maxHeight = ''; });
      panel.classList.remove('open');
    } else {
      panel.classList.add('open');
      panel.style.maxHeight = panel.scrollHeight + 'px';
    }
  });

  panel.addEventListener('transitionend', () => {
    if (panel.classList.contains('open')) {
      panel.style.maxHeight = 'none';
    }
  });

  // Listen for changes on all option inputs
  panel.addEventListener('change', (e) => {
    const param = e.target.dataset.param;
    if (!param) return;
    state.options[param] = e.target.value;
    checkModified();
    render();
  });

  const debouncedRender = debounce(() => { checkModified(); render(); }, 250);

  panel.addEventListener('input', (e) => {
    if (e.target.type !== 'text') return;
    const param = e.target.dataset.param;
    if (!param) return;
    state.options[param] = e.target.value;
    debouncedRender();
  });
}

// ============================================
// URL-as-Config (load from URL)
// ============================================

function loadFromUrl() {
  const params = new URLSearchParams(location.search);
  if (!params.has('preset')) return;

  let preset = params.get('preset');
  if (preset === 'permissive') preset = 'open';
  if (!PRESETS[preset]) return;

  state.preset = preset;
  state.options = { ...PRESETS[preset] };

  // Apply overrides
  const validParams = Object.keys(PRESETS.standard);
  for (const key of validParams) {
    if (params.has(key)) {
      const val = params.get(key);
      // Validate enum values
      if (LABELS[key]) {
        if (LABELS[key][val]) state.options[key] = val;
      } else {
        // Freeform text params
        state.options[key] = val;
      }
    }
  }

  checkModified();
  renderOptions();
}

// ============================================
// Copy to Clipboard
// ============================================

function initCopy() {
  const btn = document.querySelector('.copy-btn');
  const label = btn?.querySelector('.copy-label');
  const status = document.getElementById('copy-status');
  if (!btn || !label) return;

  btn.addEventListener('click', async () => {
    const content = getFileContent(state.activeTab);

    try {
      await navigator.clipboard.writeText(content);
      label.textContent = 'Copied';
      btn.classList.add('copied');
      if (status) status.textContent = 'File content copied to clipboard';
      setTimeout(() => {
        label.textContent = 'Copy';
        btn.classList.remove('copied');
        if (status) status.textContent = '';
      }, 1500);
    } catch (_e) {
      // Fallback: select text in the active panel
      const panel = document.getElementById(`panel-${state.activeTab}`);
      if (panel) {
        panel.select();
        label.textContent = 'Select all + copy manually';
        setTimeout(() => { label.textContent = 'Copy'; }, 3000);
      }
    }
  });
}

// ============================================
// ZIP Download
// ============================================

function createZip(files) {
  // Manual ZIP construction: stored (no compression) entries
  // Structure: [local file header + data] * N + central directory + EOCD

  const encoder = new TextEncoder();
  const entries = files.map(f => ({
    name: encoder.encode(f.name),
    data: encoder.encode(f.content),
  }));

  // CRC-32 lookup table
  const crcTable = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let j = 0; j < 8; j++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    crcTable[i] = c;
  }
  function crc32(data) {
    let crc = 0xFFFFFFFF;
    for (let i = 0; i < data.length; i++) crc = crcTable[(crc ^ data[i]) & 0xFF] ^ (crc >>> 8);
    return (crc ^ 0xFFFFFFFF) >>> 0;
  }

  // Calculate total size
  let localSize = 0;
  for (const e of entries) localSize += 30 + e.name.length + e.data.length;
  let cdSize = 0;
  for (const e of entries) cdSize += 46 + e.name.length;
  const eocdSize = 22;
  const totalSize = localSize + cdSize + eocdSize;

  const buf = new ArrayBuffer(totalSize);
  const view = new DataView(buf);
  let offset = 0;
  const offsets = [];

  // Local file headers + data
  for (const e of entries) {
    const crc = crc32(e.data);
    offsets.push({ offset, crc, size: e.data.length, nameLen: e.name.length });

    view.setUint32(offset, 0x04034B50, true); // signature
    view.setUint16(offset + 4, 20, true);      // version needed
    view.setUint16(offset + 6, 0, true);       // flags
    view.setUint16(offset + 8, 0, true);       // compression (stored)
    view.setUint16(offset + 10, 0, true);      // mod time
    view.setUint16(offset + 12, 0, true);      // mod date
    view.setUint32(offset + 14, crc, true);    // crc-32
    view.setUint32(offset + 18, e.data.length, true); // compressed size
    view.setUint32(offset + 22, e.data.length, true); // uncompressed size
    view.setUint16(offset + 26, e.name.length, true); // filename length
    view.setUint16(offset + 28, 0, true);      // extra field length
    offset += 30;

    new Uint8Array(buf, offset, e.name.length).set(e.name);
    offset += e.name.length;

    new Uint8Array(buf, offset, e.data.length).set(e.data);
    offset += e.data.length;
  }

  // Central directory
  const cdOffset = offset;
  for (let i = 0; i < entries.length; i++) {
    const e = entries[i];
    const o = offsets[i];

    view.setUint32(offset, 0x02014B50, true); // signature
    view.setUint16(offset + 4, 20, true);      // version made by
    view.setUint16(offset + 6, 20, true);      // version needed
    view.setUint16(offset + 8, 0, true);       // flags
    view.setUint16(offset + 10, 0, true);      // compression
    view.setUint16(offset + 12, 0, true);      // mod time
    view.setUint16(offset + 14, 0, true);      // mod date
    view.setUint32(offset + 16, o.crc, true);  // crc-32
    view.setUint32(offset + 20, o.size, true); // compressed size
    view.setUint32(offset + 24, o.size, true); // uncompressed size
    view.setUint16(offset + 28, o.nameLen, true); // filename length
    view.setUint16(offset + 30, 0, true);      // extra field length
    view.setUint16(offset + 32, 0, true);      // comment length
    view.setUint16(offset + 34, 0, true);      // disk number start
    view.setUint16(offset + 36, 0, true);      // internal file attributes
    view.setUint32(offset + 38, 0, true);      // external file attributes
    view.setUint32(offset + 42, o.offset, true); // local header offset
    offset += 46;

    new Uint8Array(buf, offset, e.name.length).set(e.name);
    offset += e.name.length;
  }

  // End of central directory record
  view.setUint32(offset, 0x06054B50, true);    // signature
  view.setUint16(offset + 4, 0, true);         // disk number
  view.setUint16(offset + 6, 0, true);         // cd disk number
  view.setUint16(offset + 8, entries.length, true);  // cd entries on disk
  view.setUint16(offset + 10, entries.length, true); // cd entries total
  view.setUint32(offset + 12, offset - cdOffset, true); // cd size
  view.setUint32(offset + 16, cdOffset, true); // cd offset
  view.setUint16(offset + 20, 0, true);        // comment length

  return new Blob([buf], { type: 'application/zip' });
}

function initDownload() {
  const btn = document.querySelector('.download-btn');
  const confirm = document.querySelector('.download-confirm');
  if (!btn) return;

  btn.addEventListener('click', () => {
    const zipFiles = [
      { name: 'AI_POLICY.md', content: getFileContent('policy') },
      { name: 'AGENTS.md', content: getFileContent('agents') },
      { name: 'CLAUDE.md', content: getFileContent('claude') },
    ];

    try {
      const blob = createZip(zipFiles);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const presetName = state.modified ? 'custom' : state.preset;
      a.href = url;
      a.download = `aipolicy-${presetName}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      if (confirm) {
        confirm.textContent = '3 files downloaded';
        confirm.classList.add('visible');
        setTimeout(() => {
          confirm.classList.remove('visible');
          confirm.textContent = '';
        }, 2000);
      }
    } catch (_e) {
      // Blob API unavailable -- fall back to copy buttons
      btn.style.display = 'none';
    }
  });
}

// ============================================
// Init Preview
// ============================================

function initPreview() {
  loadFromUrl();
  renderOptions();
  render();
}

// ============================================
// Theme Toggle
// ============================================

function initTheme() {
  const toggle = document.querySelector('.theme-toggle');
  if (!toggle) return;

  let stored = 'auto';
  try {
    const val = localStorage.getItem('aipolicy-theme');
    if (val === 'light' || val === 'dark' || val === 'auto') stored = val;
  } catch (_e) {
    // localStorage unavailable (private browsing) -- default to auto
  }

  applyTheme(stored);
  updateToggleState(toggle, stored);

  toggle.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-theme-value]');
    if (!btn) return;
    const value = btn.dataset.themeValue;
    applyTheme(value);
    updateToggleState(toggle, value);
    try {
      if (value === 'auto') {
        localStorage.removeItem('aipolicy-theme');
      } else {
        localStorage.setItem('aipolicy-theme', value);
      }
    } catch (_e) {
      // localStorage unavailable -- theme still applied for this session
    }
  });
}

function applyTheme(value) {
  if (value === 'auto') {
    document.documentElement.removeAttribute('data-theme');
  } else {
    document.documentElement.setAttribute('data-theme', value);
  }
}

function updateToggleState(toggle, active) {
  for (const btn of toggle.querySelectorAll('button')) {
    btn.setAttribute('aria-pressed', btn.dataset.themeValue === active ? 'true' : 'false');
  }
}

// ============================================
// Init
// ============================================

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initPresets();
  initTabs();
  initCustomize();
  initCopy();
  initDownload();
  initPreview();
});
