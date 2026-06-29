// ============================================
// TDS Reactive Store (with IndexedDB Persistence)
// ============================================
import { drivers, trucks, deliveries, initialAlerts } from './data/dummy-data.js';
import { generateId } from './utils/helpers.js';
import { db } from './data/database.js';

const AVATAR_COLORS = [
  '#3b82f6', '#10b981', '#f59e0b', '#ef4444',
  '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16',
  '#f97316', '#14b8a6', '#6366f1', '#e11d48'
];

class Store {
  constructor() {
    this.state = {
      auth: {
        isAuthenticated: false,
        user: null,
        role: null // 'supervisor' or 'driver'
      },
      drivers: [],
      trucks: [],
      deliveries: [],
      alerts: [],
      notifications: [],
      activityLog: [],
      ui: {
        sidebarOpen: true,
        activePage: '',
        theme: 'dark'
      }
    };
    this.subscribers = new Map();
    this.globalSubscribers = new Set();
    this._initialized = false;
  }

  /**
   * Initialize the store by loading data from IndexedDB.
   * Falls back to dummy data on first launch.
   */
  async init() {
    if (this._initialized) return;

    try {
      await db.open();
      await db.seed(); // Only seeds if DB is empty

      const [dbDrivers, dbTrucks, dbDeliveries, dbAlerts] = await Promise.all([
        db.getAll('drivers'),
        db.getAll('trucks'),
        db.getAll('deliveries'),
        db.getAll('alerts')
      ]);

      this.state.drivers = dbDrivers;
      this.state.trucks = dbTrucks;
      this.state.deliveries = dbDeliveries;
      this.state.alerts = dbAlerts;

      this._initialized = true;
      console.log('%c[TDS Store] Loaded from IndexedDB', 'color: #10b981;',
        `${dbDrivers.length} drivers, ${dbTrucks.length} trucks, ${dbDeliveries.length} deliveries`);
    } catch (err) {
      console.warn('[TDS Store] IndexedDB failed, falling back to dummy data:', err);
      this.state.drivers = JSON.parse(JSON.stringify(drivers));
      this.state.trucks = JSON.parse(JSON.stringify(trucks));
      this.state.deliveries = JSON.parse(JSON.stringify(deliveries));
      this.state.alerts = JSON.parse(JSON.stringify(initialAlerts));
      this._initialized = true;
    }
  }

  /**
   * Reset all data to defaults
   */
  async resetToDefaults() {
    try {
      await db.reset();
      const [dbDrivers, dbTrucks, dbDeliveries, dbAlerts] = await Promise.all([
        db.getAll('drivers'),
        db.getAll('trucks'),
        db.getAll('deliveries'),
        db.getAll('alerts')
      ]);
      this.state.drivers = dbDrivers;
      this.state.trucks = dbTrucks;
      this.state.deliveries = dbDeliveries;
      this.state.alerts = dbAlerts;

      this._notify('drivers');
      this._notify('trucks');
      this._notify('deliveries');
      this._notify('alerts');

      this.addNotification({
        type: 'success',
        title: 'Data Reset',
        message: 'All data has been reset to defaults.'
      });
    } catch (err) {
      console.error('[TDS Store] Reset failed:', err);
    }
  }

  getState() {
    return this.state;
  }

  // Subscribe to specific state path changes
  subscribe(key, callback) {
    if (!this.subscribers.has(key)) {
      this.subscribers.set(key, new Set());
    }
    this.subscribers.get(key).add(callback);
    return () => this.subscribers.get(key)?.delete(callback);
  }

  // Subscribe to all changes
  onAny(callback) {
    this.globalSubscribers.add(callback);
    return () => this.globalSubscribers.delete(callback);
  }

  // Notify subscribers
  _notify(key) {
    this.subscribers.get(key)?.forEach(cb => cb(this.state));
    this.globalSubscribers.forEach(cb => cb(this.state, key));
  }

  // ---- Persist helper ----
  async _persist(storeName, data) {
    try {
      await db.put(storeName, data);
    } catch (err) {
      console.warn(`[TDS Store] Persist failed for ${storeName}:`, err);
    }
  }

  async _persistDelete(storeName, id) {
    try {
      await db.delete(storeName, id);
    } catch (err) {
      console.warn(`[TDS Store] Persist delete failed for ${storeName}:`, err);
    }
  }

  // Auth methods
  login(user) {
    this.state.auth = { isAuthenticated: true, user, role: user.role };
    this._notify('auth');
  }

  logout() {
    this.state.auth = { isAuthenticated: false, user: null, role: null };
    this._notify('auth');
  }

  // ============================================
  // DRIVER CRUD
  // ============================================

  addDriver(driverData) {
    const id = generateId('DRV');
    const initials = driverData.name
      .split(' ')
      .map(w => w[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);

    const driver = {
      id,
      name: driverData.name,
      email: driverData.email,
      phone: driverData.phone || '',
      avatar: null,
      avatarColor: driverData.avatarColor || AVATAR_COLORS[this.state.drivers.length % AVATAR_COLORS.length],
      initials,
      license: driverData.license || '',
      experience: Number(driverData.experience) || 0,
      rating: 4.5,
      truckId: driverData.truckId || null,
      status: 'idle',
      currentPosition: { lat: 3.1390, lng: 101.6869 }, // Default to KL
      destination: null,
      totalDeliveries: 0,
      onTimeRate: 100,
      restCompliance: 100,
      shiftStart: null,
      drivingTime: 0,
      lastRest: new Date().toISOString(),
      performanceScore: 75
    };

    this.state.drivers.push(driver);
    this._persist('drivers', driver);
    this._notify('drivers');

    this.logActivity('driver', 'added', `Driver "${driver.name}" added to fleet`, { driverId: driver.id });
    this.addNotification({
      type: 'success',
      title: 'Driver Added',
      message: `${driver.name} has been added to the fleet.`
    });

    return driver;
  }

  updateDriver(driverId, updates) {
    const idx = this.state.drivers.findIndex(d => d.id === driverId);
    if (idx !== -1) {
      // If name changed, update initials
      if (updates.name && updates.name !== this.state.drivers[idx].name) {
        updates.initials = updates.name
          .split(' ')
          .map(w => w[0])
          .join('')
          .toUpperCase()
          .slice(0, 2);
      }

      const oldName = this.state.drivers[idx].name;
      this.state.drivers[idx] = { ...this.state.drivers[idx], ...updates };
      this._persist('drivers', this.state.drivers[idx]);
      this._notify('drivers');
      this.logActivity('driver', 'edited', `Driver "${this.state.drivers[idx].name}" updated`, { driverId: this.state.drivers[idx].id });
    }
  }

  removeDriver(driverId) {
    const driver = this.state.drivers.find(d => d.id === driverId);
    if (!driver) return false;

    // Unlink active deliveries
    this.state.deliveries.forEach((del, idx) => {
      if (del.driverId === driverId && !['completed'].includes(del.status)) {
        this.state.deliveries[idx] = { ...del, driverId: null, status: 'scheduled' };
        this._persist('deliveries', this.state.deliveries[idx]);
      }
    });

    // Remove driver
    this.state.drivers = this.state.drivers.filter(d => d.id !== driverId);
    this._persistDelete('drivers', driverId);
    this._notify('drivers');
    this._notify('deliveries');

    this.logActivity('driver', 'removed', `Driver "${driver.name}" removed from fleet`, { driverId });
    this.addNotification({
      type: 'warning',
      title: 'Driver Removed',
      message: `${driver.name} has been removed from the fleet.`
    });

    return true;
  }

  getDriver(driverId) {
    return this.state.drivers.find(d => d.id === driverId);
  }

  getDriverByEmail(email) {
    return this.state.drivers.find(d => d.email === email);
  }

  // ============================================
  // TRUCK CRUD
  // ============================================

  addTruck(truckData) {
    const id = generateId('TRK');
    const truck = {
      id,
      model: truckData.model,
      capacity: Number(truckData.capacity) || 20000,
      weight: Number(truckData.weight) || 8000,
      fuelTank: Number(truckData.fuelTank) || 400,
      currentFuel: Number(truckData.fuelTank) || 400, // Start full
      mileage: Number(truckData.mileage) || 3.0,
      year: Number(truckData.year) || new Date().getFullYear(),
      plate: truckData.plate || '',
      health: {
        tires: Number(truckData.healthTires) || 95,
        oil: Number(truckData.healthOil) || 95,
        brakes: Number(truckData.healthBrakes) || 95,
        engine: Number(truckData.healthEngine) || 95
      }
    };

    this.state.trucks.push(truck);
    this._persist('trucks', truck);
    this._notify('trucks');

    this.logActivity('truck', 'added', `Truck "${truck.model}" (${truck.plate}) added to fleet`, { truckId: truck.id });
    this.addNotification({
      type: 'success',
      title: 'Truck Added',
      message: `${truck.model} (${truck.plate}) has been added to the fleet.`
    });

    return truck;
  }

  updateTruck(truckId, updates) {
    const idx = this.state.trucks.findIndex(t => t.id === truckId);
    if (idx !== -1) {
      // Handle nested health object updates
      if (updates.healthTires != null || updates.healthOil != null || updates.healthBrakes != null || updates.healthEngine != null) {
        const currentHealth = this.state.trucks[idx].health || {};
        updates.health = {
          tires: updates.healthTires != null ? Number(updates.healthTires) : currentHealth.tires,
          oil: updates.healthOil != null ? Number(updates.healthOil) : currentHealth.oil,
          brakes: updates.healthBrakes != null ? Number(updates.healthBrakes) : currentHealth.brakes,
          engine: updates.healthEngine != null ? Number(updates.healthEngine) : currentHealth.engine
        };
        delete updates.healthTires;
        delete updates.healthOil;
        delete updates.healthBrakes;
        delete updates.healthEngine;
      }

      this.state.trucks[idx] = { ...this.state.trucks[idx], ...updates };
      this._persist('trucks', this.state.trucks[idx]);
      this._notify('trucks');
      this.logActivity('truck', 'edited', `Truck "${this.state.trucks[idx].model}" (${this.state.trucks[idx].plate}) updated`, { truckId: this.state.trucks[idx].id });
    }
  }

  removeTruck(truckId) {
    const truck = this.state.trucks.find(t => t.id === truckId);
    if (!truck) return false;

    // Unlink drivers assigned to this truck
    this.state.drivers.forEach((driver, idx) => {
      if (driver.truckId === truckId) {
        this.state.drivers[idx] = { ...driver, truckId: null };
        this._persist('drivers', this.state.drivers[idx]);
      }
    });

    // Remove truck
    this.state.trucks = this.state.trucks.filter(t => t.id !== truckId);
    this._persistDelete('trucks', truckId);
    this._notify('trucks');
    this._notify('drivers');

    this.logActivity('truck', 'removed', `Truck "${truck.model}" (${truck.plate}) removed from fleet`, { truckId });
    this.addNotification({
      type: 'warning',
      title: 'Truck Removed',
      message: `${truck.model} (${truck.plate}) has been removed from the fleet.`
    });

    return true;
  }

  getTruck(truckId) {
    return this.state.trucks.find(t => t.id === truckId);
  }

  // ============================================
  // DELIVERY METHODS
  // ============================================

  addDelivery(deliveryData) {
    const id = generateId('DEL');
    const delivery = {
      id,
      driverId: deliveryData.driverId || null,
      truckId: deliveryData.truckId || null,
      status: deliveryData.driverId ? 'scheduled' : 'scheduled',
      priority: deliveryData.priority || 'normal',
      origin: {
        name: deliveryData.originName || 'Warehouse',
        address: deliveryData.originAddress || '',
        lat: Number(deliveryData.originLat) || 3.1390,
        lng: Number(deliveryData.originLng) || 101.6869
      },
      destination: {
        name: deliveryData.destName || 'Destination',
        address: deliveryData.destAddress || '',
        lat: Number(deliveryData.destLat) || 5.4164,
        lng: Number(deliveryData.destLng) || 100.3327
      },
      package: {
        description: deliveryData.packageDesc || 'General Cargo',
        weight: Number(deliveryData.packageWeight) || 1000,
        units: Number(deliveryData.packageUnits) || 1
      },
      estimatedTime: Number(deliveryData.estimatedTime) || 4,
      actualTime: null,
      estimatedDistance: Number(deliveryData.estimatedDistance) || 200,
      departureTime: deliveryData.departureTime || new Date().toISOString(),
      eta: deliveryData.eta || new Date(Date.now() + (Number(deliveryData.estimatedTime) || 4) * 3600000).toISOString(),
      receiptCode: String(Math.floor(100000 + Math.random() * 900000)),
      receiptScanned: false,
      progress: 0,
      weather: deliveryData.weather || 'clear',
      notes: deliveryData.notes || '',
      completedTime: null
    };

    // If driver assigned, link the truck
    if (delivery.driverId) {
      const driver = this.state.drivers.find(d => d.id === delivery.driverId);
      if (driver?.truckId) {
        delivery.truckId = driver.truckId;
      }
    }

    this.state.deliveries.push(delivery);
    this._persist('deliveries', delivery);
    this._notify('deliveries');

    this.logActivity('delivery', 'created', `Delivery ${id} created — ${delivery.package.description} to ${delivery.destination.name}`, { deliveryId: id });
    this.addNotification({
      type: 'success',
      title: 'Delivery Created',
      message: `${id} scheduled to ${delivery.destination.name}`
    });

    return delivery;
  }

  cancelDelivery(deliveryId) {
    const idx = this.state.deliveries.findIndex(d => d.id === deliveryId);
    if (idx === -1) return false;

    const delivery = this.state.deliveries[idx];

    // Unlink driver
    if (delivery.driverId) {
      const driverIdx = this.state.drivers.findIndex(d => d.id === delivery.driverId);
      if (driverIdx !== -1 && this.state.drivers[driverIdx].status !== 'idle') {
        this.state.drivers[driverIdx] = { ...this.state.drivers[driverIdx], status: 'idle', destination: null };
        this._persist('drivers', this.state.drivers[driverIdx]);
        this._notify('drivers');
      }
    }

    this.state.deliveries[idx] = { ...delivery, status: 'cancelled', progress: 0 };
    this._persist('deliveries', this.state.deliveries[idx]);
    this._notify('deliveries');

    this.logActivity('delivery', 'cancelled', `Delivery ${deliveryId} cancelled`, { deliveryId });
    this.addNotification({
      type: 'warning',
      title: 'Delivery Cancelled',
      message: `${deliveryId} has been cancelled.`
    });

    return true;
  }

  updateDelivery(deliveryId, updates) {
    const idx = this.state.deliveries.findIndex(d => d.id === deliveryId);
    if (idx !== -1) {
      this.state.deliveries[idx] = { ...this.state.deliveries[idx], ...updates };
      this._persist('deliveries', this.state.deliveries[idx]);
      this._notify('deliveries');
    }
  }

  completeDelivery(deliveryId) {
    const idx = this.state.deliveries.findIndex(d => d.id === deliveryId);
    if (idx !== -1) {
      const delivery = this.state.deliveries[idx];
      const departureTime = new Date(delivery.departureTime).getTime();
      const actualHours = (Date.now() - departureTime) / 3600000;

      this.state.deliveries[idx] = {
        ...delivery,
        status: 'completed',
        progress: 100,
        actualTime: Math.round(actualHours * 10) / 10,
        completedTime: new Date().toISOString(),
        receiptScanned: true
      };
      this._persist('deliveries', this.state.deliveries[idx]);
      this._notify('deliveries');

      // Update driver status
      const driver = this.state.drivers.find(d => d.id === delivery.driverId);
      if (driver) {
        this.updateDriver(driver.id, {
          status: 'idle',
          totalDeliveries: driver.totalDeliveries + 1
        });
      }

      this.logActivity('delivery', 'completed', `Delivery ${delivery.id} completed at ${delivery.destination.name}`, { deliveryId });
      this.addNotification({
        type: 'success',
        title: 'Delivery Completed',
        message: `${delivery.id} delivered successfully to ${delivery.destination.name}`
      });
    }
  }

  getDriverDeliveries(driverId) {
    return this.state.deliveries.filter(d => d.driverId === driverId);
  }

  // ============================================
  // ALERT METHODS
  // ============================================

  addAlert(alertData) {
    const alert = {
      id: generateId('ALT'),
      timestamp: new Date().toISOString(),
      read: false,
      dismissed: false,
      actionTaken: null,
      ...alertData
    };
    this.state.alerts.unshift(alert);
    // Keep max 50 alerts
    if (this.state.alerts.length > 50) this.state.alerts.pop();
    this._persist('alerts', alert);
    this._notify('alerts');
    return alert;
  }

  dismissAlert(alertId) {
    const idx = this.state.alerts.findIndex(a => a.id === alertId);
    if (idx !== -1) {
      this.state.alerts[idx].dismissed = true;
      this._persist('alerts', this.state.alerts[idx]);
      this._notify('alerts');
    }
  }

  markAlertRead(alertId) {
    const idx = this.state.alerts.findIndex(a => a.id === alertId);
    if (idx !== -1) {
      this.state.alerts[idx].read = true;
      this._persist('alerts', this.state.alerts[idx]);
      this._notify('alerts');
    }
  }

  getUnreadAlertCount() {
    return this.state.alerts.filter(a => !a.read && !a.dismissed).length;
  }

  getActiveAlerts() {
    return this.state.alerts.filter(a => !a.dismissed);
  }

  // ============================================
  // NOTIFICATION METHODS (toast-style)
  // ============================================

  addNotification(notif) {
    const notification = {
      id: generateId('NOTIF'),
      timestamp: new Date().toISOString(),
      ...notif
    };
    this.state.notifications.push(notification);
    this._notify('notifications');
    // Auto-remove after 5 seconds
    setTimeout(() => this.removeNotification(notification.id), 5000);
    return notification;
  }

  removeNotification(notifId) {
    this.state.notifications = this.state.notifications.filter(n => n.id !== notifId);
    this._notify('notifications');
  }

  // ============================================
  // ACTIVITY LOG
  // ============================================

  logActivity(category, action, description, meta = {}) {
    const entry = {
      id: generateId('LOG'),
      timestamp: new Date().toISOString(),
      category, // 'driver' | 'truck' | 'delivery' | 'system'
      action,   // 'added' | 'edited' | 'removed' | 'created' | 'cancelled' | 'completed'
      description,
      meta
    };
    this.state.activityLog.unshift(entry);
    // Keep max 200 entries
    if (this.state.activityLog.length > 200) this.state.activityLog.pop();
    this._notify('activityLog');
    return entry;
  }

  getActivityLog(filter = 'all') {
    if (filter === 'all') return this.state.activityLog;
    return this.state.activityLog.filter(e => e.category === filter);
  }

  // ============================================
  // UI METHODS
  // ============================================

  setActivePage(page) {
    this.state.ui.activePage = page;
    this._notify('ui');
  }

  toggleSidebar() {
    this.state.ui.sidebarOpen = !this.state.ui.sidebarOpen;
    this._notify('ui');
  }

  // ============================================
  // STATS HELPERS
  // ============================================

  getStats() {
    const activeDrivers = this.state.drivers.filter(d => d.status !== 'idle').length;
    const totalDrivers = this.state.drivers.length;
    const activeDeliveries = this.state.deliveries.filter(d => ['in-progress', 'delayed', 'loading'].includes(d.status)).length;
    const completedToday = this.state.deliveries.filter(d => {
      if (d.status !== 'completed') return false;
      const ct = new Date(d.completedTime);
      const today = new Date();
      return ct.toDateString() === today.toDateString();
    }).length;

    const onTimeDeliveries = this.state.deliveries.filter(d => d.status === 'completed' && d.actualTime <= d.estimatedTime * 1.1);
    const totalCompleted = this.state.deliveries.filter(d => d.status === 'completed');
    const onTimeRate = totalCompleted.length > 0 ? Math.round((onTimeDeliveries.length / totalCompleted.length) * 100) : 0;

    const delayedCount = this.state.deliveries.filter(d => d.status === 'delayed').length;
    const urgentAlerts = this.state.alerts.filter(a => !a.dismissed && (a.severity === 'critical' || a.severity === 'high')).length;

    const truckCount = this.state.trucks.length;
    const avgFuel = truckCount > 0
      ? this.state.trucks.reduce((sum, t) => sum + (t.currentFuel / t.fuelTank * 100), 0) / truckCount
      : 0;

    return {
      activeDrivers,
      totalDrivers,
      activeDeliveries,
      completedToday,
      onTimeRate,
      delayedCount,
      urgentAlerts,
      avgFuelLevel: Math.round(avgFuel)
    };
  }
}

export const store = new Store();
