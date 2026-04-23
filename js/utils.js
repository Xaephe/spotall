// ============================================
// Utils — Yardımcı Fonksiyonlar
// ============================================

import { t } from './i18n.js';

/** Format milliseconds to human-readable duration */
export function formatDuration(ms) {
  const totalMinutes = Math.floor(ms / 60000);
  const totalHours = Math.floor(totalMinutes / 60);
  const totalDays = Math.floor(totalHours / 24);

  if (totalDays > 0) {
    return `${totalDays.toLocaleString()} ${t('days')}`;
  }
  if (totalHours > 0) {
    return `${totalHours.toLocaleString()} ${t('hours')}`;
  }
  return `${totalMinutes.toLocaleString()} ${t('minutes')}`;
}

/** Format duration for table cells (shorter) */
export function formatDurationShort(ms) {
  const totalMinutes = Math.floor(ms / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  if (hours > 0) {
    return `${hours}h ${mins}m`;
  }
  return `${mins}m`;
}

/** Format a number with locale separators */
export function formatNumber(n) {
  return n.toLocaleString();
}

/** Debounce a function */
export function debounce(fn, delay = 300) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

/** Show a toast notification */
export function showToast(message, type = 'info', duration = 4000) {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  
  const icons = {
    success: '✓',
    error: '✕',
    info: 'ℹ',
    warning: '⚠'
  };

  toast.innerHTML = `
    <span class="toast-icon">${icons[type] || icons.info}</span>
    <span class="toast-message">${message}</span>
  `;

  container.appendChild(toast);

  // Trigger animation
  requestAnimationFrame(() => {
    toast.classList.add('toast-enter');
  });

  setTimeout(() => {
    toast.classList.add('toast-exit');
    toast.addEventListener('animationend', () => toast.remove());
  }, duration);
}

/** Escape HTML special characters */
export function escapeHtml(str) {
  if (!str) return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

/** Sleep for ms */
export function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
