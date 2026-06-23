// ============================================
// TDS Alert Components (Toasts, Modals)
// ============================================
import { store } from '../store.js';

/**
 * Show a toast notification
 */
export function showToast(type, title, message) {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const icons = {
    success: '✅',
    warning: '⚠️',
    danger: '🚨',
    info: 'ℹ️'
  };

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <span class="toast-icon">${icons[type] || 'ℹ️'}</span>
    <div class="toast-content">
      <div class="toast-title">${title}</div>
      <div class="toast-message">${message}</div>
    </div>
    <button class="toast-close" aria-label="Close">✕</button>
  `;

  container.appendChild(toast);

  // Close button
  toast.querySelector('.toast-close')?.addEventListener('click', () => {
    toast.classList.add('toast-exit');
    setTimeout(() => toast.remove(), 300);
  });

  // Auto-remove
  setTimeout(() => {
    if (toast.parentNode) {
      toast.classList.add('toast-exit');
      setTimeout(() => toast.remove(), 300);
    }
  }, 5000);
}

/**
 * Show a modal dialog
 */
export function showModal(options = {}) {
  const overlay = document.getElementById('modal-overlay');
  if (!overlay) return;

  const { title, body, actions = [], onClose } = options;

  overlay.innerHTML = `
    <div class="modal">
      <div class="modal-header">
        <h3 class="modal-title">${title || ''}</h3>
        <button class="modal-close" id="modal-close-btn" aria-label="Close modal">✕</button>
      </div>
      <div class="modal-body">${body || ''}</div>
      ${actions.length > 0 ? `
        <div class="modal-footer">
          ${actions.map((action, i) => `
            <button class="btn ${action.class || 'btn-ghost'}" data-action-idx="${i}">
              ${action.label}
            </button>
          `).join('')}
        </div>
      ` : ''}
    </div>
  `;

  overlay.classList.add('active');

  const closeModal = () => {
    overlay.classList.remove('active');
    overlay.innerHTML = '';
    if (onClose) onClose();
  };

  overlay.querySelector('#modal-close-btn')?.addEventListener('click', closeModal);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeModal();
  });

  // Action buttons
  actions.forEach((action, i) => {
    overlay.querySelector(`[data-action-idx="${i}"]`)?.addEventListener('click', () => {
      if (action.handler) action.handler();
      if (action.closeOnClick !== false) closeModal();
    });
  });

  return closeModal;
}

/**
 * Show call driver dialog
 */
export function showCallDialog(driver) {
  showModal({
    title: `📞 Call ${driver.name}`,
    body: `
      <div style="text-align: center; padding: 16px 0;">
        <div class="avatar avatar-xl" style="background: ${driver.avatarColor}; margin: 0 auto 16px;">
          ${driver.initials}
        </div>
        <div style="font-size: 18px; font-weight: 700; margin-bottom: 4px;">${driver.name}</div>
        <div style="color: var(--color-text-muted); font-size: 14px; margin-bottom: 16px;">${driver.phone}</div>
        <div style="font-size: 48px; margin: 16px 0; animation: pulse 1.5s ease-in-out infinite;">📞</div>
        <div style="color: var(--color-success); font-weight: 600;">Calling...</div>
        <div style="color: var(--color-text-muted); font-size: 12px; margin-top: 8px;">(Demo - No actual call made)</div>
      </div>
    `,
    actions: [
      { label: '📱 End Call', class: 'btn btn-danger', handler: () => {
        showToast('info', 'Call Ended', `Call with ${driver.name} ended.`);
      }}
    ]
  });
}

/**
 * Initialize toast listener for store notifications
 */
export function initToastListener() {
  return store.subscribe('notifications', (state) => {
    const notifs = state.notifications;
    if (notifs.length > 0) {
      const latest = notifs[notifs.length - 1];
      showToast(latest.type || 'info', latest.title, latest.message);
    }
  });
}
