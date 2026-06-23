// ============================================
// TDS Utility Helpers
// ============================================

/**
 * Format a date to relative time (e.g. "2 hours ago", "in 30 min")
 */
export function formatRelativeTime(dateStr) {
  const date = new Date(dateStr);
  const now = Date.now();
  const diff = now - date.getTime();
  const absDiff = Math.abs(diff);
  const isFuture = diff < 0;

  const minutes = Math.floor(absDiff / 60000);
  const hours = Math.floor(absDiff / 3600000);
  const days = Math.floor(absDiff / 86400000);

  let text;
  if (minutes < 1) text = 'just now';
  else if (minutes < 60) text = `${minutes}m`;
  else if (hours < 24) text = `${hours}h ${minutes % 60}m`;
  else text = `${days}d`;

  if (isFuture && minutes >= 1) return `in ${text}`;
  if (minutes < 1) return text;
  return `${text} ago`;
}

/**
 * Format time as HH:MM
 */
export function formatTime(dateStr) {
  if (!dateStr) return '--:--';
  const d = new Date(dateStr);
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
}

/**
 * Format date as short
 */
export function formatDate(dateStr) {
  if (!dateStr) return '--';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

/**
 * Format hours to readable
 */
export function formatHours(hours) {
  if (hours == null) return '--';
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  if (h === 0) return `${m}min`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

/**
 * Haversine distance in km
 */
export function haversineDistance(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

function toRad(deg) {
  return deg * Math.PI / 180;
}

/**
 * Check if point is inside a geofence circle
 */
export function isInsideGeofence(lat, lng, fence) {
  const distKm = haversineDistance(lat, lng, fence.lat, fence.lng);
  return distKm * 1000 <= fence.radius; // radius in meters
}

/**
 * Calculate fuel consumption for a distance
 * @param {object} truck - truck data
 * @param {number} distanceKm - distance in km
 * @returns {number} liters consumed
 */
export function calculateFuelConsumption(truck, distanceKm) {
  const baseLitersPerKm = 1 / truck.mileage; // convert km/l to l/km
  // Weight factor: heavier = more fuel
  const weightFactor = 1 + (truck.weight / 50000);
  return distanceKm * baseLitersPerKm * weightFactor;
}

/**
 * Calculate estimated fuel for a delivery
 */
export function estimateFuelForDelivery(truck, distanceKm, loadWeight) {
  const baseLitersPerKm = 1 / truck.mileage;
  const totalWeight = truck.weight + loadWeight;
  const weightFactor = 1 + (totalWeight / 50000);
  return distanceKm * baseLitersPerKm * weightFactor;
}

/**
 * Get fuel level color
 */
export function getFuelColor(percentage) {
  if (percentage > 50) return 'var(--color-success)';
  if (percentage > 25) return 'var(--color-warning)';
  return 'var(--color-danger)';
}

/**
 * Get status display info
 */
export function getStatusInfo(status) {
  const map = {
    'driving': { label: 'On Route', color: 'success', icon: '🚛' },
    'resting': { label: 'Resting', color: 'primary', icon: '😴' },
    'delayed': { label: 'Delayed', color: 'danger', icon: '⚠️' },
    'loading': { label: 'Loading', color: 'warning', icon: '📦' },
    'idle': { label: 'Off Duty', color: 'neutral', icon: '🅿️' },
    'in-progress': { label: 'In Progress', color: 'primary', icon: '🚛' },
    'completed': { label: 'Completed', color: 'success', icon: '✅' },
    'scheduled': { label: 'Scheduled', color: 'info', icon: '📋' },
  };
  return map[status] || { label: status, color: 'neutral', icon: '❓' };
}

/**
 * Get priority info
 */
export function getPriorityInfo(priority) {
  const map = {
    'critical': { label: 'Critical', color: 'danger', icon: '🔴' },
    'high': { label: 'High', color: 'warning', icon: '🟠' },
    'normal': { label: 'Normal', color: 'primary', icon: '🔵' },
    'low': { label: 'Low', color: 'neutral', icon: '⚪' },
  };
  return map[priority] || map['normal'];
}

/**
 * Get alert severity info
 */
export function getAlertSeverityInfo(severity) {
  const map = {
    'critical': { label: 'Critical', color: 'danger', bgClass: 'alert-banner-danger' },
    'high': { label: 'High', color: 'danger', bgClass: 'alert-banner-danger' },
    'medium': { label: 'Medium', color: 'warning', bgClass: 'alert-banner-warning' },
    'low': { label: 'Low', color: 'info', bgClass: '' },
  };
  return map[severity] || map['low'];
}

/**
 * Get alert type icon
 */
export function getAlertTypeIcon(type) {
  const map = {
    'delay': '⏱️',
    'fuel': '⛽',
    'rest': '💤',
    'geofence': '📍',
    'weather': '🌦️',
    'truck-health': '🔧',
  };
  return map[type] || '⚡';
}

/**
 * Generate unique ID
 */
export function generateId(prefix = 'ID') {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 5)}`;
}

/**
 * Animate a number counter
 */
export function animateCounter(element, target, duration = 1000, prefix = '', suffix = '') {
  const start = parseInt(element.textContent.replace(/[^0-9.-]/g, '')) || 0;
  const range = target - start;
  const startTime = performance.now();

  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
    const current = Math.round(start + range * eased);
    element.textContent = `${prefix}${current.toLocaleString()}${suffix}`;
    if (progress < 1) requestAnimationFrame(update);
  }

  requestAnimationFrame(update);
}

/**
 * Debounce function
 */
export function debounce(fn, delay) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

/**
 * Get weather icon
 */
export function getWeatherIcon(condition) {
  const map = {
    'clear': '☀️',
    'partly-cloudy': '⛅',
    'cloudy': '☁️',
    'rain': '🌧️',
    'storm': '⛈️',
    'snow': '🌨️',
    'fog': '🌫️'
  };
  return map[condition] || '☀️';
}

/**
 * Get truck health color
 */
export function getTruckHealthColor(value) {
  if (value >= 90) return 'var(--color-success)';
  if (value >= 70) return 'var(--color-warning)';
  return 'var(--color-danger)';
}

/**
 * Format distance
 */
export function formatDistance(km) {
  if (km == null) return '--';
  if (km < 1) return `${Math.round(km * 1000)}m`;
  return `${Math.round(km)} mi`;
}

/**
 * Calculate rest compliance status
 */
export function getRestStatus(drivingTime, lastRestTime) {
  if (!lastRestTime) return { status: 'unknown', label: 'Unknown', color: 'neutral' };

  const hoursSinceRest = (Date.now() - new Date(lastRestTime).getTime()) / 3600000;

  if (drivingTime <= 3) return { status: 'good', label: 'Compliant', color: 'success' };
  if (drivingTime <= 4) return { status: 'warning', label: 'Rest Soon', color: 'warning' };
  return { status: 'overdue', label: 'Rest Overdue', color: 'danger' };
}
