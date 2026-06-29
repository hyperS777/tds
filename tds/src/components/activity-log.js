// ============================================
// TDS Activity Log Component
// ============================================
import { store } from '../store.js';
import { formatRelativeTime } from '../utils/helpers.js';

const CATEGORY_ICONS = {
  driver: '👤',
  truck: '🚛',
  delivery: '📦',
  system: '⚙️'
};

const CATEGORY_COLORS = {
  driver: 'var(--color-primary)',
  truck: 'var(--color-warning)',
  delivery: 'var(--color-success)',
  system: 'var(--color-info)'
};

const ACTION_BADGES = {
  added: { label: 'Added', color: 'success' },
  created: { label: 'Created', color: 'success' },
  edited: { label: 'Edited', color: 'primary' },
  removed: { label: 'Removed', color: 'danger' },
  cancelled: { label: 'Cancelled', color: 'danger' },
  completed: { label: 'Completed', color: 'success' }
};

/**
 * Render an activity log into a container
 * @param {HTMLElement} container
 * @param {string} filter - 'all' | 'driver' | 'truck' | 'delivery'
 */
export function renderActivityLog(container, filter = 'all') {
  const entries = store.getActivityLog(filter);

  if (entries.length === 0) {
    container.innerHTML = `
      <div class="empty-state" style="padding: 48px 24px;">
        <div class="empty-state-icon">📋</div>
        <div class="empty-state-title">No Activity Yet</div>
        <div class="empty-state-text">Actions like adding, editing, or removing drivers and trucks will appear here.</div>
      </div>
    `;
    return;
  }

  // Group entries by date
  const grouped = {};
  entries.forEach(entry => {
    const date = new Date(entry.timestamp);
    const key = date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(entry);
  });

  let html = '<div class="activity-log">';

  for (const [dateLabel, items] of Object.entries(grouped)) {
    html += `<div class="activity-log-date">${dateLabel}</div>`;
    html += '<div class="activity-log-group">';

    items.forEach(entry => {
      const icon = CATEGORY_ICONS[entry.category] || '⚡';
      const color = CATEGORY_COLORS[entry.category] || 'var(--color-text-muted)';
      const actionBadge = ACTION_BADGES[entry.action] || { label: entry.action, color: 'neutral' };
      const time = new Date(entry.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

      html += `
        <div class="activity-log-entry">
          <div class="activity-log-icon" style="background: ${color}15; color: ${color};">
            ${icon}
          </div>
          <div class="activity-log-content">
            <div class="activity-log-text">${entry.description}</div>
            <div class="activity-log-meta">
              <span class="badge badge-${actionBadge.color}" style="font-size: 9px; padding: 2px 6px;">${actionBadge.label}</span>
              <span class="activity-log-time">${time}</span>
              <span class="activity-log-relative">${formatRelativeTime(entry.timestamp)}</span>
            </div>
          </div>
        </div>
      `;
    });

    html += '</div>';
  }

  html += '</div>';
  container.innerHTML = html;
}
