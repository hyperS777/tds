// ============================================
// TDS Breadcrumb Component
// ============================================
import { icons } from './icons.js';

const ROUTE_LABELS = {
  '/': 'Home',
  '/login': 'Sign In',
  '/supervisor': 'Dashboard',
  '/supervisor/fleet': 'Fleet Management',
  '/supervisor/driver': 'Driver Details',
  '/supervisor/analytics': 'Analytics',
  '/driver': 'My Dashboard',
  '/driver/deliveries': 'My Deliveries',
  '/driver/route': 'Active Route',
  '/driver/scan': 'Scan Receipt',
  '/settings': 'Settings',
  '/messages': 'Messages',
};

const ROUTE_ICONS = {
  '/supervisor': icons.dashboard(14),
  '/supervisor/fleet': icons.fleet(14),
  '/supervisor/driver': icons.user(14),
  '/supervisor/analytics': icons.analytics(14),
  '/driver': icons.dashboard(14),
  '/driver/deliveries': icons.deliveries(14),
  '/driver/route': icons.route(14),
  '/driver/scan': icons.scan(14),
  '/settings': icons.settings(14),
  '/messages': icons.messages(14),
};

export function renderBreadcrumb(path) {
  if (!path || path === '/' || path === '/login') return '';

  const parts = path.split('/').filter(Boolean);
  const crumbs = [];

  // Build breadcrumb trail
  let currentPath = '';
  for (let i = 0; i < parts.length; i++) {
    currentPath += '/' + parts[i];
    const label = ROUTE_LABELS[currentPath] || parts[i].charAt(0).toUpperCase() + parts[i].slice(1);
    const routeIcon = i === parts.length - 1 ? (ROUTE_ICONS[currentPath] || '') : '';
    const isLast = i === parts.length - 1;

    crumbs.push({
      label,
      path: currentPath,
      icon: routeIcon,
      isLast
    });
  }

  return `
    <nav class="breadcrumb" aria-label="Breadcrumb">
      ${crumbs.map((crumb, idx) => `
        ${idx > 0 ? `<span class="breadcrumb-sep">${icons.chevronRight(12)}</span>` : ''}
        ${crumb.isLast
          ? `<span class="breadcrumb-current">${crumb.icon} ${crumb.label}</span>`
          : `<a href="#${crumb.path}" class="breadcrumb-link">${crumb.label}</a>`
        }
      `).join('')}
    </nav>
  `;
}
