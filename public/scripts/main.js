// aipolicy -- UI logic: presets, tabs, zip, URL params, theme, clipboard
// Templates and preset definitions imported from lib/templates.js

'use strict';

import { PRESETS, LABELS, FILE_TYPES, inertOptions } from '../lib/templates.js';
import { createZip } from '../lib/zip.js';

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

const TAB_KEYS = FILE_TYPES.map((f) => f.key);
const FILE_NAMES = Object.fromEntries(FILE_TYPES.map((f) => [f.key, f.path.split('/').pop()]));

function tabParts(key) {
  const tab = document.getElementById(`tab-${key}`);
  const panel = document.getElementById(`panel-${key}`);
  if (!tab || !panel) throw new Error(`index.html has no tab-${key} or panel-${key} for file type "${key}"`);
  return { tab, panel };
}

// ============================================
// Render
// ============================================

function renderPreview() {
  for (const f of FILE_TYPES) {
    tabParts(f.key).panel.value = f.generator(state.options);
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

function renderTabs() {
  for (const key of TAB_KEYS) {
    const { tab, panel } = tabParts(key);

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

const INERT_NOTES = {
  prohibited: 'Usage policy is Prohibited. Only AI in CI/CD and Training data opt-out change the files. Other settings keep their values.',
  attribution: 'AI-generated code is Requires attribution, so the trailer is required. AI disclosure has no effect.',
};

function renderInert() {
  const inert = inertOptions(state.options);
  for (const el of document.querySelectorAll('[data-param]')) {
    const off = inert.includes(el.dataset.param);
    el.disabled = off;
    const ids = (el.getAttribute('aria-describedby') ?? '').split(' ').filter((id) => id && id !== 'inert-note');
    if (off) ids.push('inert-note');
    el.setAttribute('aria-describedby', ids.join(' '));
  }
  const note = document.getElementById('inert-note');
  const text = inert.length === 0 ? '' : INERT_NOTES[state.options.ai_usage === 'prohibited' ? 'prohibited' : 'attribution'];
  note.hidden = inert.length === 0;
  // role=status: an identical rewrite can re-announce
  if (note.textContent !== text) note.textContent = text;
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
  renderInert();
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

  for (const tab of tabs) {
    tab.addEventListener('click', () => {
      const key = tab.id.replace('tab-', '');
      state.activeTab = key;
      renderTabs();
    });

    tab.addEventListener('keydown', (e) => {
      const currentIdx = TAB_KEYS.indexOf(state.activeTab);
      let newIdx = -1;

      if (e.key === 'ArrowRight') newIdx = (currentIdx + 1) % TAB_KEYS.length;
      else if (e.key === 'ArrowLeft') newIdx = (currentIdx - 1 + TAB_KEYS.length) % TAB_KEYS.length;
      else if (e.key === 'Home') newIdx = 0;
      else if (e.key === 'End') newIdx = TAB_KEYS.length - 1;

      if (newIdx >= 0) {
        e.preventDefault();
        state.activeTab = TAB_KEYS[newIdx];
        renderTabs();
        document.getElementById(`tab-${TAB_KEYS[newIdx]}`).focus();
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

function initDownload() {
  const btn = document.querySelector('.download-btn');
  const confirm = document.querySelector('.download-confirm');
  if (!btn) return;

  btn.addEventListener('click', () => {
    const zipFiles = FILE_TYPES.map((f) => ({ name: f.path, content: getFileContent(f.key) }));

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
        confirm.textContent = `${zipFiles.length} files downloaded`;
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
  syncThemeColor(value);
}

// Exactly one theme-color meta matches: the chosen theme's, or the OS-driven pair on auto.
function syncThemeColor(value) {
  for (const meta of document.querySelectorAll('meta[name="theme-color"]')) {
    if (meta.dataset.media === undefined) meta.dataset.media = meta.getAttribute('media');
    const scheme = meta.dataset.media.includes('dark') ? 'dark' : 'light';
    meta.setAttribute('media', value === 'auto' ? meta.dataset.media : (scheme === value ? 'all' : 'not all'));
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
