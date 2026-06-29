// ============================================
// TDS Command Palette (Ctrl+K)
// ============================================
import { store } from '../store.js';
import { router } from '../router.js';
import { icons } from './icons.js';

let paletteEl = null;
let isOpen = false;

const ROUTES = {
  supervisor: [
    { id: 'sup-dash', label: 'Dashboard', desc: 'Overview & live fleet map', icon: icons.dashboard(18), path: '/supervisor' },
    { id: 'sup-fleet', label: 'Fleet Management', desc: 'Drivers & deliveries', icon: icons.fleet(18), path: '/supervisor/fleet' },
    { id: 'sup-analytics', label: 'Analytics', desc: 'Performance & charts', icon: icons.analytics(18), path: '/supervisor/analytics' },
    { id: 'sup-settings', label: 'Settings', desc: 'Profile & preferences', icon: icons.settings(18), path: '/settings' },
  ],
  driver: [
    { id: 'drv-dash', label: 'My Dashboard', desc: 'Status & active delivery', icon: icons.dashboard(18), path: '/driver' },
    { id: 'drv-deliveries', label: 'My Deliveries', desc: 'Active, scheduled & history', icon: icons.deliveries(18), path: '/driver/deliveries' },
    { id: 'drv-route', label: 'Active Route', desc: 'Map & turn-by-turn', icon: icons.route(18), path: '/driver/route' },
    { id: 'drv-scan', label: 'Scan Receipt', desc: 'Confirm delivery', icon: icons.scan(18), path: '/driver/scan' },
    { id: 'drv-settings', label: 'Settings', desc: 'Profile & preferences', icon: icons.settings(18), path: '/settings' },
  ]
};

function getAllItems() {
  const auth = store.getState().auth;
  const role = auth.role || 'supervisor';
  const items = [];

  // Pages
  const pages = ROUTES[role] || ROUTES.supervisor;
  pages.forEach(p => items.push({ ...p, category: 'Pages', type: 'page' }));

  // Drivers (supervisor only)
  if (role === 'supervisor') {
    store.getState().drivers.forEach(d => {
      items.push({
        id: 'driver-' + d.id,
        label: d.name,
        desc: `${d.status} · ${d.email}`,
        icon: `<div class="avatar avatar-xs" style="background:${d.avatarColor};font-size:9px;width:22px;height:22px;">${d.initials}</div>`,
        category: 'Drivers',
        type: 'driver',
        data: d
      });
    });
  }

  // Deliveries
  const deliveries = role === 'driver'
    ? store.getDriverDeliveries(auth.user?.id)
    : store.getState().deliveries;
  deliveries.slice(0, 10).forEach(del => {
    items.push({
      id: 'del-' + del.id,
      label: del.id,
      desc: `${del.destination.name} · ${del.status}`,
      icon: icons.package(18),
      category: 'Deliveries',
      type: 'delivery',
      data: del
    });
  });

  // Quick actions
  items.push(
    { id: 'action-logout', label: 'Sign Out', desc: 'Log out of your account', icon: icons.logout(18), category: 'Actions', type: 'action', action: 'logout' },
    { id: 'action-theme', label: 'Toggle Theme', desc: 'Switch light/dark mode', icon: icons.moon(18), category: 'Actions', type: 'action', action: 'theme' }
  );

  return items;
}

function createPalette() {
  const el = document.createElement('div');
  el.className = 'command-palette-overlay';
  el.id = 'command-palette';
  el.innerHTML = `
    <div class="command-palette" role="dialog" aria-label="Command palette">
      <div class="command-palette-input-wrap">
        ${icons.search(18)}
        <input type="text" class="command-palette-input" id="cmd-input" placeholder="Search pages, drivers, deliveries…" autocomplete="off" spellcheck="false" />
        <kbd class="command-palette-kbd">ESC</kbd>
      </div>
      <div class="command-palette-results" id="cmd-results"></div>
      <div class="command-palette-footer">
        <span>${icons.arrowUp(12)} ${icons.arrowDown(12)} Navigate</span>
        <span>↵ Select</span>
        <span>ESC Close</span>
      </div>
    </div>
  `;
  document.body.appendChild(el);
  return el;
}

function renderResults(items, query) {
  const resultsEl = document.getElementById('cmd-results');
  if (!resultsEl) return;

  if (items.length === 0) {
    resultsEl.innerHTML = `
      <div class="command-palette-empty">
        ${icons.search(32)}
        <p>No results for "${query}"</p>
      </div>
    `;
    return;
  }

  // Group by category
  const groups = {};
  items.forEach(item => {
    if (!groups[item.category]) groups[item.category] = [];
    groups[item.category].push(item);
  });

  let html = '';
  let idx = 0;
  for (const [category, groupItems] of Object.entries(groups)) {
    html += `<div class="command-palette-group-label">${category}</div>`;
    groupItems.forEach(item => {
      html += `
        <button class="command-palette-item" data-idx="${idx}" data-id="${item.id}" data-type="${item.type}">
          <span class="command-palette-item-icon">${item.icon}</span>
          <span class="command-palette-item-content">
            <span class="command-palette-item-label">${item.label}</span>
            <span class="command-palette-item-desc">${item.desc}</span>
          </span>
          <span class="command-palette-item-shortcut">↵</span>
        </button>
      `;
      idx++;
    });
  }
  resultsEl.innerHTML = html;
}

function executeItem(item) {
  close();
  if (!item) return;

  if (item.type === 'page') {
    router.navigate(item.path);
  } else if (item.type === 'driver') {
    router.navigate('/supervisor/driver/' + item.data.id);
  } else if (item.type === 'delivery') {
    // Navigate to fleet page for deliveries
    const auth = store.getState().auth;
    if (auth.role === 'supervisor') {
      router.navigate('/supervisor/fleet');
    } else {
      router.navigate('/driver/deliveries');
    }
  } else if (item.type === 'action') {
    if (item.action === 'logout') {
      store.logout();
      router.navigate('/login');
    } else if (item.action === 'theme') {
      toggleTheme();
    }
  }
}

function toggleTheme() {
  const html = document.documentElement;
  const current = html.getAttribute('data-theme');
  const next = current === 'light' ? 'dark' : 'light';
  html.setAttribute('data-theme', next);
  store.getState().ui.theme = next;
  localStorage.setItem('tds-theme', next);
}

export function open() {
  if (isOpen) return;
  if (!paletteEl) paletteEl = createPalette();

  isOpen = true;
  paletteEl.classList.add('active');
  const input = document.getElementById('cmd-input');
  if (input) {
    input.value = '';
    input.focus();
  }

  const allItems = getAllItems();
  renderResults(allItems, '');

  // Input listener
  let selectedIdx = 0;
  let filteredItems = allItems;

  const handleInput = () => {
    const q = input.value.toLowerCase().trim();
    filteredItems = q
      ? allItems.filter(i => i.label.toLowerCase().includes(q) || i.desc.toLowerCase().includes(q))
      : allItems;
    selectedIdx = 0;
    renderResults(filteredItems, q);
    highlightItem(selectedIdx);
  };

  const handleKeydown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      selectedIdx = Math.min(selectedIdx + 1, filteredItems.length - 1);
      highlightItem(selectedIdx);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      selectedIdx = Math.max(selectedIdx - 1, 0);
      highlightItem(selectedIdx);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      executeItem(filteredItems[selectedIdx]);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      close();
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === paletteEl) close();
  };

  const handleItemClick = (e) => {
    const btn = e.target.closest('.command-palette-item');
    if (btn) {
      const idx = parseInt(btn.dataset.idx);
      executeItem(filteredItems[idx]);
    }
  };

  input.addEventListener('input', handleInput);
  paletteEl.addEventListener('keydown', handleKeydown);
  paletteEl.addEventListener('click', handleOverlayClick);
  document.getElementById('cmd-results')?.addEventListener('click', handleItemClick);

  // Store cleanup refs
  paletteEl._cleanup = () => {
    input.removeEventListener('input', handleInput);
    paletteEl.removeEventListener('keydown', handleKeydown);
    paletteEl.removeEventListener('click', handleOverlayClick);
    document.getElementById('cmd-results')?.removeEventListener('click', handleItemClick);
  };

  highlightItem(0);
}

function highlightItem(idx) {
  const results = document.getElementById('cmd-results');
  if (!results) return;
  results.querySelectorAll('.command-palette-item').forEach((el, i) => {
    el.classList.toggle('active', i === idx);
    if (i === idx) el.scrollIntoView({ block: 'nearest' });
  });
}

export function close() {
  if (!isOpen) return;
  isOpen = false;
  if (paletteEl) {
    paletteEl._cleanup?.();
    paletteEl.classList.remove('active');
  }
}

export function toggle() {
  isOpen ? close() : open();
}

// Global keyboard shortcut
export function initCommandPalette() {
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      toggle();
    }
  });
}
