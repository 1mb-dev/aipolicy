// aipolicy -- UI logic: presets, tabs, zip, URL params, theme, clipboard
// Templates and preset definitions imported from lib/templates.js

'use strict';

import { PRESETS, LABELS, generateAiPolicy, generateAgents, generateClaude, generateCopilot, generateCursor } from '../lib/templates.js';
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

function getGeneratedFiles() {
  return {
    policy: generateAiPolicy(state.options),
    agents: generateAgents(state.options),
    claude: generateClaude(state.options),
    copilot: generateCopilot(state.options),
    cursor: generateCursor(state.options),
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
    copilot: document.getElementById('panel-copilot'),
    cursor: document.getElementById('panel-cursor'),
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

const FILE_NAMES = {
  policy: 'AI_POLICY.md',
  agents: 'AGENTS.md',
  claude: 'CLAUDE.md',
  copilot: 'copilot-instructions.md',
  cursor: 'aipolicy.mdc',
};

function renderTabs() {
  const tabMap = {
    policy: 'tab-policy',
    agents: 'tab-agents',
    claude: 'tab-claude',
    copilot: 'tab-copilot',
    cursor: 'tab-cursor',
  };
  const panelMap = {
    policy: 'panel-policy',
    agents: 'panel-agents',
    claude: 'panel-claude',
    copilot: 'panel-copilot',
    cursor: 'panel-cursor',
  };

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
  const tabKeys = ['policy', 'agents', 'claude', 'copilot', 'cursor'];

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

function initDownload() {
  const btn = document.querySelector('.download-btn');
  const confirm = document.querySelector('.download-confirm');
  if (!btn) return;

  btn.addEventListener('click', () => {
    const zipFiles = [
      { name: 'AI_POLICY.md', content: getFileContent('policy') },
      { name: 'AGENTS.md', content: getFileContent('agents') },
      { name: 'CLAUDE.md', content: getFileContent('claude') },
      { name: '.github/copilot-instructions.md', content: getFileContent('copilot') },
      { name: '.cursor/rules/aipolicy.mdc', content: getFileContent('cursor') },
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
