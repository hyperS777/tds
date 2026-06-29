// ============================================
// TDS Skeleton Loading Component
// ============================================

/**
 * Creates a skeleton placeholder with given dimensions.
 * @param {string} type - 'line' | 'circle' | 'rect' | 'card' | 'stat' | 'chart' | 'table-row'
 * @param {object} opts - { width, height, count, className }
 */
export function skeleton(type, opts = {}) {
  const { width, height, count = 1, className = '' } = opts;

  switch (type) {
    case 'line':
      return Array(count).fill(0).map((_, i) => `
        <div class="skeleton skeleton-line ${className}" style="width: ${width || (90 - i * 15 + '%')}; height: ${height || '14px'}; animation-delay: ${i * 0.1}s;"></div>
      `).join('');

    case 'circle':
      return `<div class="skeleton skeleton-circle ${className}" style="width: ${width || '40px'}; height: ${height || width || '40px'};"></div>`;

    case 'rect':
      return `<div class="skeleton skeleton-rect ${className}" style="width: ${width || '100%'}; height: ${height || '120px'};"></div>`;

    case 'stat':
      return `
        <div class="card stat-card-container skeleton-stat">
          <div class="skeleton skeleton-circle" style="width: 44px; height: 44px;"></div>
          <div style="flex: 1;">
            <div class="skeleton skeleton-line" style="width: 60%; height: 24px; margin-bottom: 8px;"></div>
            <div class="skeleton skeleton-line" style="width: 80%; height: 12px; margin-bottom: 4px;"></div>
            <div class="skeleton skeleton-line" style="width: 50%; height: 10px;"></div>
          </div>
        </div>
      `;

    case 'card':
      return `
        <div class="card skeleton-card ${className}">
          <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px;">
            <div class="skeleton skeleton-circle" style="width: 40px; height: 40px;"></div>
            <div style="flex: 1;">
              <div class="skeleton skeleton-line" style="width: 60%; height: 14px; margin-bottom: 6px;"></div>
              <div class="skeleton skeleton-line" style="width: 40%; height: 10px;"></div>
            </div>
          </div>
          <div class="skeleton skeleton-line" style="width: 100%; height: 10px; margin-bottom: 6px;"></div>
          <div class="skeleton skeleton-line" style="width: 85%; height: 10px; margin-bottom: 6px;"></div>
          <div class="skeleton skeleton-rect" style="width: 100%; height: 4px; margin-top: 12px; border-radius: 999px;"></div>
        </div>
      `;

    case 'chart':
      return `
        <div class="card skeleton-chart ${className}">
          <div style="display: flex; justify-content: space-between; margin-bottom: 16px;">
            <div class="skeleton skeleton-line" style="width: 120px; height: 16px;"></div>
            <div class="skeleton skeleton-line" style="width: 60px; height: 20px; border-radius: 999px;"></div>
          </div>
          <div class="skeleton skeleton-rect" style="width: 100%; height: ${height || '200px'};"></div>
        </div>
      `;

    case 'table-row':
      return Array(count).fill(0).map((_, i) => `
        <tr class="skeleton-table-row" style="animation-delay: ${i * 0.08}s;">
          <td><div class="skeleton skeleton-line" style="width: 70px; height: 12px;"></div></td>
          <td>
            <div style="display: flex; align-items: center; gap: 8px;">
              <div class="skeleton skeleton-circle" style="width: 28px; height: 28px;"></div>
              <div class="skeleton skeleton-line" style="width: 80px; height: 12px;"></div>
            </div>
          </td>
          <td><div class="skeleton skeleton-line" style="width: 100px; height: 12px;"></div></td>
          <td><div class="skeleton skeleton-line" style="width: 60px; height: 20px; border-radius: 999px;"></div></td>
          <td>
            <div style="display: flex; align-items: center; gap: 8px;">
              <div class="skeleton skeleton-rect" style="width: 80px; height: 4px; border-radius: 999px;"></div>
              <div class="skeleton skeleton-line" style="width: 30px; height: 10px;"></div>
            </div>
          </td>
          <td><div class="skeleton skeleton-line" style="width: 50px; height: 12px;"></div></td>
        </tr>
      `).join('');

    case 'map':
      return `
        <div class="skeleton skeleton-rect skeleton-map ${className}" style="width: 100%; height: ${height || '400px'};">
          <div class="skeleton-map-inner">
            ${icons?.mapPin?.(32) || ''}
          </div>
        </div>
      `;

    default:
      return `<div class="skeleton skeleton-line ${className}" style="width: ${width || '100%'}; height: ${height || '14px'};"></div>`;
  }
}

/**
 * Renders a full skeleton dashboard layout for initial page load.
 */
export function skeletonDashboard() {
  return `
    <div class="stats-grid stagger-children">
      ${skeleton('stat')}${skeleton('stat')}${skeleton('stat')}${skeleton('stat')}
    </div>
    <div class="dashboard-grid" style="margin-top: 24px;">
      ${skeleton('chart', { height: '350px', className: 'dashboard-map-card' })}
      ${skeleton('chart', { height: '350px' })}
    </div>
    <div class="card" style="margin-top: 24px;">
      <div style="padding: 16px 20px; display: flex; justify-content: space-between;">
        <div class="skeleton skeleton-line" style="width: 140px; height: 16px;"></div>
        <div class="skeleton skeleton-line" style="width: 70px; height: 24px; border-radius: 999px;"></div>
      </div>
      <table class="table"><tbody>${skeleton('table-row', { count: 4 })}</tbody></table>
    </div>
  `;
}

/**
 * Renders skeleton cards for fleet page.
 */
export function skeletonFleetCards(count = 6) {
  return Array(count).fill(skeleton('card')).join('');
}
