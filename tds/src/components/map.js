// ============================================
// TDS Map Component (Leaflet Wrapper)
// ============================================
import L from 'leaflet';
import 'leaflet-routing-machine';
import { store } from '../store.js';
import { getStatusInfo, formatHours, getFuelColor } from '../utils/helpers.js';

// Fix Leaflet default icon issue with bundlers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom truck icon using divIcon
function createTruckIcon(status) {
  return L.divIcon({
    className: '',
    html: `<div class="truck-marker ${status}" style="transform: scaleX(-1);">🚛</div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -20]
  });
}

// Geofence zone icon
function createGeofenceIcon(type) {
  const icons = { 'warehouse': '🏭', 'delivery': '📍', 'rest-stop': '🅿️' };
  return L.divIcon({
    className: '',
    html: `<div style="font-size: 20px; text-align: center;">${icons[type] || '📍'}</div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12]
  });
}

/**
 * Create the supervisor overview map
 */
export function createSupervisorMap(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return null;

  // Dark tile layer
  const darkTiles = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>',
    subdomains: 'abcd',
    maxZoom: 19
  });

  const map = L.map(containerId, {
    center: [4.2105, 101.9758], // Malaysia
    zoom: 6,
    layers: [darkTiles],
    zoomControl: true,
    attributionControl: true
  });

  // Move zoom control to bottom right
  map.zoomControl.setPosition('bottomright');

  const markers = {};
  const routeLines = {};

  function updateMarkers() {
    const drivers = store.getState().drivers;
    const trucks = store.getState().trucks;
    const delivs = store.getState().deliveries;

    drivers.forEach(driver => {
      if (!driver.currentPosition) return;

      const truck = trucks.find(t => t.id === driver.truckId);
      const activeDelivery = delivs.find(d => d.driverId === driver.id && ['in-progress', 'delayed'].includes(d.status));
      const statusInfo = getStatusInfo(driver.status);
      const fuelPct = truck ? Math.round((truck.currentFuel / truck.fuelTank) * 100) : 0;

      if (markers[driver.id]) {
        // Update position smoothly
        markers[driver.id].setLatLng([driver.currentPosition.lat, driver.currentPosition.lng]);
        markers[driver.id].setIcon(createTruckIcon(driver.status));
      } else {
        // Create marker
        markers[driver.id] = L.marker(
          [driver.currentPosition.lat, driver.currentPosition.lng],
          { icon: createTruckIcon(driver.status) }
        ).addTo(map);
      }

      // Update popup content
      const popupContent = `
        <div class="marker-popup">
          <div class="marker-popup-header">
            <div class="avatar avatar-sm" style="background: ${driver.avatarColor}; font-size: 10px; width: 28px; height: 28px;">${driver.initials}</div>
            <div>
              <div class="marker-popup-name">${driver.name}</div>
              <div class="marker-popup-status">
                <span class="badge badge-${statusInfo.color}" style="font-size: 9px; padding: 1px 6px;">${statusInfo.icon} ${statusInfo.label}</span>
              </div>
            </div>
          </div>
          <div class="marker-popup-details">
            <div class="marker-popup-detail">
              <span class="marker-popup-detail-label">Truck</span>
              <span class="marker-popup-detail-value">${truck?.model || '--'}</span>
            </div>
            <div class="marker-popup-detail">
              <span class="marker-popup-detail-label">Fuel</span>
              <span class="marker-popup-detail-value" style="color: ${getFuelColor(fuelPct)};">${fuelPct}%</span>
            </div>
            ${activeDelivery ? `
              <div class="marker-popup-detail" style="grid-column: 1 / -1;">
                <span class="marker-popup-detail-label">Delivery</span>
                <span class="marker-popup-detail-value">${activeDelivery.destination.name}</span>
              </div>
              <div class="marker-popup-detail">
                <span class="marker-popup-detail-label">ETA</span>
                <span class="marker-popup-detail-value">${formatHours((new Date(activeDelivery.eta).getTime() - Date.now()) / 3600000)}</span>
              </div>
              <div class="marker-popup-detail">
                <span class="marker-popup-detail-label">Progress</span>
                <span class="marker-popup-detail-value">${Math.round(activeDelivery.progress)}%</span>
              </div>
            ` : ''}
          </div>
          ${activeDelivery ? `
            <div style="margin-top: 8px;">
              <div class="progress-bar" style="height: 4px;">
                <div class="progress-bar-fill" style="width: ${activeDelivery.progress}%;"></div>
              </div>
            </div>
          ` : ''}
        </div>
      `;
      markers[driver.id].bindPopup(popupContent, { maxWidth: 280 });

      // Draw route line if driving
      if (driver.destination && (driver.status === 'driving' || driver.status === 'delayed')) {
        if (routeLines[driver.id]) {
          map.removeLayer(routeLines[driver.id]);
        }
        // Use Leaflet Routing Machine for realistic roads (no UI panel)
        routeLines[driver.id] = L.Routing.control({
          waypoints: [
            L.latLng(driver.currentPosition.lat, driver.currentPosition.lng),
            L.latLng(driver.destination.lat, driver.destination.lng)
          ],
          lineOptions: {
            styles: [{ color: driver.status === 'delayed' ? '#ef4444' : '#3b82f6', opacity: 0.8, weight: 4 }]
          },
          show: false,
          addWaypoints: false,
          routeWhileDragging: false,
          fitSelectedRoutes: false,
          showAlternatives: false,
          createMarker: () => null // Do not create default markers
        }).addTo(map);
      }
    });
  }

  // Initial render
  updateMarkers();

  // Subscribe to driver updates
  const unsub = store.subscribe('drivers', () => {
    updateMarkers();
  });

  return { map, markers, unsub, updateMarkers };
}

/**
 * Create a driver's route map
 */
export function createDriverDetailsMap(containerId, driverId) {
  const container = document.getElementById(containerId);
  if (!container) return null;

  const driver = store.getDriver(driverId);
  if (!driver) return null;

  const darkTiles = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; OSM &copy; CARTO',
    subdomains: 'abcd',
    maxZoom: 19
  });

  const map = L.map(containerId, {
    layers: [darkTiles],
    zoomControl: true
  });

  map.zoomControl.setPosition('bottomright');

  const deliveries = store.getState().deliveries;
  const activeDelivery = deliveries.find(d => d.driverId === driverId && ['in-progress', 'delayed', 'loading'].includes(d.status));

  if (activeDelivery) {
    // Origin marker
    L.marker([activeDelivery.origin.lat, activeDelivery.origin.lng], {
      icon: L.divIcon({
        className: '',
        html: '<div style="font-size: 24px;">🏭</div>',
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      })
    }).addTo(map).bindPopup(`<b>Origin:</b> ${activeDelivery.origin.name}`);

    // Destination marker
    L.marker([activeDelivery.destination.lat, activeDelivery.destination.lng], {
      icon: L.divIcon({
        className: '',
        html: '<div style="font-size: 24px;">📍</div>',
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      })
    }).addTo(map).bindPopup(`<b>Destination:</b> ${activeDelivery.destination.name}`);

    // Use Leaflet Routing Machine for realistic roads (no UI panel)
    L.Routing.control({
      waypoints: [
        L.latLng(activeDelivery.origin.lat, activeDelivery.origin.lng),
        L.latLng(activeDelivery.destination.lat, activeDelivery.destination.lng)
      ],
      lineOptions: {
        styles: [{ color: '#3b82f6', opacity: 0.8, weight: 4 }]
      },
      show: false,
      addWaypoints: false,
      routeWhileDragging: false,
      fitSelectedRoutes: true,
      showAlternatives: false,
      createMarker: () => null // Do not create default markers
    }).addTo(map);

    // Current position marker (truck)
    const truckMarker = L.marker(
      [driver.currentPosition.lat, driver.currentPosition.lng],
      { icon: createTruckIcon(driver.status) }
    ).addTo(map);

    // Fit bounds
    const bounds = L.latLngBounds([
      [activeDelivery.origin.lat, activeDelivery.origin.lng],
      [activeDelivery.destination.lat, activeDelivery.destination.lng]
    ]);
    map.fitBounds(bounds, { padding: [50, 50] });

    // Update truck position
    const unsub = store.subscribe('drivers', () => {
      const updatedDriver = store.getDriver(driverId);
      if (updatedDriver?.currentPosition) {
        truckMarker.setLatLng([updatedDriver.currentPosition.lat, updatedDriver.currentPosition.lng]);
      }
    });

    return { map, unsub };
  } else {
    // No active delivery, just show driver position
    map.setView([driver.currentPosition.lat, driver.currentPosition.lng], 10);
    L.marker(
      [driver.currentPosition.lat, driver.currentPosition.lng],
      { icon: createTruckIcon(driver.status) }
    ).addTo(map);

    return { map, unsub: () => {} };
  }
}
