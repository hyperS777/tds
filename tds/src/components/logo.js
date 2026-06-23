// ============================================
// TDS Logo SVG Component
// Clean, minimal truck + route icon
// ============================================

/**
 * Returns an inline SVG logo for TDS.
 * @param {number} size - Width/height in px (default 24)
 * @param {string} className - Optional CSS class
 */
export function logoSVG(size = 24, className = '') {
  return `<svg class="${className}" width="${size}" height="${size}" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="tds-logo-grad" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stop-color="#2d9d92"/>
        <stop offset="100%" stop-color="#3da86a"/>
      </linearGradient>
    </defs>
    <!-- Truck body -->
    <path d="M4 32V18a2 2 0 0 1 2-2h18v16H4z" fill="url(#tds-logo-grad)" opacity="0.9"/>
    <!-- Cabin -->
    <path d="M24 16h6l6 8v8H24V16z" fill="url(#tds-logo-grad)"/>
    <!-- Windshield -->
    <path d="M26 18h4l4.5 6H26V18z" fill="#141517" opacity="0.6"/>
    <!-- Wheels -->
    <circle cx="12" cy="34" r="4" fill="#141517" stroke="url(#tds-logo-grad)" stroke-width="2.5"/>
    <circle cx="32" cy="34" r="4" fill="#141517" stroke="url(#tds-logo-grad)" stroke-width="2.5"/>
    <!-- Route dots (subtle) -->
    <circle cx="8" cy="10" r="1.5" fill="#2d9d92" opacity="0.5"/>
    <circle cx="14" cy="8" r="1" fill="#3da86a" opacity="0.4"/>
    <circle cx="20" cy="10" r="1.5" fill="#2d9d92" opacity="0.3"/>
  </svg>`;
}

/**
 * Returns the full logo mark with text.
 * @param {number} iconSize - Icon size
 * @param {boolean} clickable - If true, wraps in anchor to login
 */
export function logoMark(iconSize = 24, clickable = false) {
  const inner = `
    <div class="tds-logo-icon">${logoSVG(iconSize)}</div>
    <span class="tds-logo-text">TDS</span>
  `;

  if (clickable) {
    return `<a href="#/login" class="tds-logo-mark" aria-label="Go to sign in">${inner}</a>`;
  }
  return `<div class="tds-logo-mark">${inner}</div>`;
}
