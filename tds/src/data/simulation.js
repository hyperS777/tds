// ============================================
// TDS Simulation Engine
// ============================================
import { store } from '../store.js';
import { routeWaypoints } from './dummy-data.js';
import { calculateFuelConsumption, haversineDistance } from '../utils/helpers.js';

let simulationInterval = null;
let tickCount = 0;

// Track waypoint indices for each driving driver
const waypointIndices = {};

export function startSimulation() {
  if (simulationInterval) return;

  // Initialize waypoint positions
  const drivers = store.getState().drivers;
  drivers.forEach(d => {
    if (d.status === 'driving' && routeWaypoints[d.id]) {
      const wp = routeWaypoints[d.id];
      const progress = store.getState().deliveries.find(del => del.driverId === d.id && del.status === 'in-progress')?.progress || 0;
      waypointIndices[d.id] = Math.floor((progress / 100) * (wp.length - 1));
    }
  });

  simulationInterval = setInterval(() => {
    tickCount++;
    simulateTruckMovement();
    simulateFuelConsumption();
    if (tickCount % 5 === 0) simulateStatusChanges();
    if (tickCount % 10 === 0) simulateAlerts();
    updateDeliveryProgress();
  }, 3000);
}

export function stopSimulation() {
  if (simulationInterval) {
    clearInterval(simulationInterval);
    simulationInterval = null;
  }
}

function simulateTruckMovement() {
  const drivers = store.getState().drivers;

  drivers.forEach(driver => {
    if (driver.status !== 'driving') return;

    const waypoints = routeWaypoints[driver.id];
    if (!waypoints) {
      // Small random movement for drivers without waypoints
      const jitter = () => (Math.random() - 0.5) * 0.02;
      store.updateDriver(driver.id, {
        currentPosition: {
          lat: driver.currentPosition.lat + jitter(),
          lng: driver.currentPosition.lng + jitter()
        }
      });
      return;
    }

    // Move to next waypoint
    const currentIdx = waypointIndices[driver.id] || 0;
    const nextIdx = Math.min(currentIdx + 1, waypoints.length - 1);
    waypointIndices[driver.id] = nextIdx;

    // Interpolate between waypoints for smoother movement
    const target = waypoints[nextIdx];
    const current = driver.currentPosition;

    const lerp = 0.3;
    const newLat = current.lat + (target.lat - current.lat) * lerp;
    const newLng = current.lng + (target.lng - current.lng) * lerp;

    store.updateDriver(driver.id, {
      currentPosition: { lat: newLat, lng: newLng }
    });

    // Check if near destination (geofence check)
    if (driver.destination) {
      const dist = haversineDistance(newLat, newLng, driver.destination.lat, driver.destination.lng);
      if (dist < 5) { // Within 5km - "arrived"
        // Don't auto-complete, just update progress
        const delivery = store.getState().deliveries.find(
          d => d.driverId === driver.id && d.status === 'in-progress'
        );
        if (delivery) {
          store.updateDelivery(delivery.id, { progress: 98 });
        }
      }
    }
  });
}

function simulateFuelConsumption() {
  const drivers = store.getState().drivers;
  const trucks = store.getState().trucks;

  drivers.forEach(driver => {
    if (driver.status !== 'driving') return;

    const truck = trucks.find(t => t.id === driver.truckId);
    if (!truck) return;

    // Consume fuel based on truck weight and mileage
    const consumption = calculateFuelConsumption(truck, 0.5); // ~0.5 km per tick
    const newFuel = Math.max(0, truck.currentFuel - consumption);

    store.updateTruck(truck.id, { currentFuel: newFuel });

    // Check fuel alerts
    const fuelPercentage = (newFuel / truck.fuelTank) * 100;
    if (fuelPercentage < 15 && fuelPercentage > 10) {
      // Only add if no recent fuel alert for this driver
      const existingAlert = store.getState().alerts.find(
        a => a.driverId === driver.id && a.type === 'fuel' && !a.dismissed &&
        (Date.now() - new Date(a.timestamp).getTime()) < 600000
      );
      if (!existingAlert) {
        store.addAlert({
          type: 'fuel',
          severity: 'medium',
          driverId: driver.id,
          title: 'Low Fuel Warning',
          message: `${driver.name}'s truck (${truck.id}) fuel at ${fuelPercentage.toFixed(1)}%. Recommend refueling soon.`
        });
      }
    }
  });
}

function simulateStatusChanges() {
  const drivers = store.getState().drivers;

  drivers.forEach(driver => {
    // Simulate rest compliance checks
    if (driver.status === 'driving' && driver.drivingTime > 4) {
      const existingAlert = store.getState().alerts.find(
        a => a.driverId === driver.id && a.type === 'rest' && !a.dismissed &&
        (Date.now() - new Date(a.timestamp).getTime()) < 1800000
      );
      if (!existingAlert) {
        store.addAlert({
          type: 'rest',
          severity: 'medium',
          driverId: driver.id,
          title: 'Rest Break Recommended',
          message: `${driver.name} has been driving for ${driver.drivingTime.toFixed(1)} hours. Consider a rest break.`
        });
      }
    }

    // Slowly increment driving time for active drivers
    if (driver.status === 'driving') {
      store.updateDriver(driver.id, {
        drivingTime: driver.drivingTime + 0.01
      });
    }
  });
}

function simulateAlerts() {
  // Random event generation (10% chance per tick)
  if (Math.random() > 0.9) {
    const drivers = store.getState().drivers.filter(d => d.status === 'driving');
    if (drivers.length === 0) return;

    const randomDriver = drivers[Math.floor(Math.random() * drivers.length)];
    const alertTypes = [
      {
        type: 'delay',
        severity: 'low',
        title: 'Slight Delay Detected',
        message: `${randomDriver.name} is running 5 minutes behind schedule due to traffic.`
      },
      {
        type: 'geofence',
        severity: 'low',
        title: 'Route Deviation Detected',
        message: `${randomDriver.name} briefly deviated from planned route — now back on track.`
      }
    ];

    const alert = alertTypes[Math.floor(Math.random() * alertTypes.length)];
    store.addAlert({
      ...alert,
      driverId: randomDriver.id,
      deliveryId: store.getState().deliveries.find(
        d => d.driverId === randomDriver.id && (d.status === 'in-progress' || d.status === 'delayed')
      )?.id || null
    });
  }
}

function updateDeliveryProgress() {
  const deliveries = store.getState().deliveries;

  deliveries.forEach(delivery => {
    if (delivery.status === 'in-progress' && delivery.progress < 95) {
      // Slowly increment progress
      const increment = 0.3 + Math.random() * 0.5;
      const newProgress = Math.min(95, delivery.progress + increment);
      store.updateDelivery(delivery.id, { progress: newProgress });
    }
  });
}
