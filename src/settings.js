import { safeJsonParse } from './utils.js';

const KEY = 'neonpocket_settings_v1';

export function loadSettings() {
  const raw = localStorage.getItem(KEY);
  return {
    onscreenControls: true,
    postFX: true,
    ...safeJsonParse(raw, {}),
  };
}

export function saveSettings(s) {
  localStorage.setItem(KEY, JSON.stringify(s));
}
