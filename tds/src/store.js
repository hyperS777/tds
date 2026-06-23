// ============================================
// TDS Reactive Store
// ============================================
import { drivers, trucks, deliveries, initialAlerts } from './data/dummy-data.js';
import { generateId } from './utils/helpers.js';

class Store {
  constructor() {
    this.state = {
      auth: {
        isAuthenticated: false,
        user: null,
        role: null // 'supervisor' or 'driver'
      },
      drivers: JSON.parse(JSON.stringify(drivers)),
      trucks: JSON.parse(JSON.stringify(trucks)),
      deliveries: JSON.parse(JSON.stringify(deliveries)),
      alerts: JSON.parse(JSON.stringify(initialAlerts)),
      notifications: [],
      ui: {
        sidebarOpen: true,
        activePage: '',
        theme: 'dark'
      }
    };
    this.subscribers = new Map();
    this.globalSubscribers = new Set();
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

  // Auth methods
  login(user) {
    this.state.auth = { isAuthenticated: true, user, role: user.role };
    this._notify('auth');
  }

  logout() {
    this.state.auth = { isAuthenticated: false, user: null, role: null };
    this._notify('auth');
  }

  // Driver methods
  updateDriver(driverId, updates) {
    const idx = this.state.drivers.findIndex(d => d.id === driverId);
    if (idx !== -1) {
      this.state.drivers[idx] = { ...this.state.drivers[idx], ...updates };
      this._notify('drivers');
    }
  }

  getDriver(driverId) {
    return this.state.drivers.find(d => d.id === driverId);
  }

  getDriverByEmail(email) {
    return this.state.drivers.find(d => d.email === email);
  }

  // Truck methods
  updateTruck(truckId, updates) {
    const idx = this.state.trucks.findIndex(t => t.id === truckId);
    if (idx !== -1) {
      this.state.trucks[idx] = { ...this.state.trucks[idx], ...updates };
      this._notify('trucks');
    }
  }

  getTruck(truckId) {
    return this.state.trucks.find(t => t.id === truckId);
  }

  // Delivery methods
  updateDelivery(deliveryId, updates) {
    const idx = this.state.deliveries.findIndex(d => d.id === deliveryId);
    if (idx !== -1) {
      this.state.deliveries[idx] = { ...this.state.deliveries[idx], ...updates };
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
      this._notify('deliveries');

      // Update driver status
      const driver = this.state.drivers.find(d => d.id === delivery.driverId);
      if (driver) {
        this.updateDriver(driver.id, {
          status: 'idle',
          totalDeliveries: driver.totalDeliveries + 1
        });
      }

      // Add success notification
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

  // Alert methods
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
    this._notify('alerts');
    return alert;
  }

  dismissAlert(alertId) {
    const idx = this.state.alerts.findIndex(a => a.id === alertId);
    if (idx !== -1) {
      this.state.alerts[idx].dismissed = true;
      this._notify('alerts');
    }
  }

  markAlertRead(alertId) {
    const idx = this.state.alerts.findIndex(a => a.id === alertId);
    if (idx !== -1) {
      this.state.alerts[idx].read = true;
      this._notify('alerts');
    }
  }

  getUnreadAlertCount() {
    return this.state.alerts.filter(a => !a.read && !a.dismissed).length;
  }

  getActiveAlerts() {
    return this.state.alerts.filter(a => !a.dismissed);
  }

  // Notification methods (toast-style)
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

  // UI methods
  setActivePage(page) {
    this.state.ui.activePage = page;
    this._notify('ui');
  }

  toggleSidebar() {
    this.state.ui.sidebarOpen = !this.state.ui.sidebarOpen;
    this._notify('ui');
  }

  // Stats helpers
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

    const avgFuel = this.state.trucks.reduce((sum, t) => sum + (t.currentFuel / t.fuelTank * 100), 0) / this.state.trucks.length;

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
