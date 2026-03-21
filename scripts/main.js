// aipolicy -- templates, presets, tabs, zip, URL params, theme, clipboard
// Phase 2+ will populate this module. Wired up in Phase 1 for structure.

'use strict';

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
  } catch (e) {
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
    } catch (e) {
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
});
