// ============================================
// TDS IndexedDB Database Layer
// ============================================
import { drivers as defaultDrivers, trucks as defaultTrucks, deliveries as defaultDeliveries, initialAlerts as defaultAlerts } from './dummy-data.js';

const DB_NAME = 'tds-fleet-db';
const DB_VERSION = 1;
const STORES = ['drivers', 'trucks', 'deliveries', 'alerts'];

class TDSDatabase {
  constructor() {
    this.db = null;
    this._ready = null;
  }

  /**
   * Open/create the database. Returns a promise that resolves when ready.
   */
  async open() {
    if (this.db) return this.db;
    if (this._ready) return this._ready;

    this._ready = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        // Create object stores if they don't exist
        STORES.forEach(storeName => {
          if (!db.objectStoreNames.contains(storeName)) {
            db.createObjectStore(storeName, { keyPath: 'id' });
          }
        });
      };

      request.onsuccess = (event) => {
        this.db = event.target.result;
        resolve(this.db);
      };

      request.onerror = (event) => {
        console.error('TDS Database error:', event.target.error);
        reject(event.target.error);
      };
    });

    return this._ready;
  }

  /**
   * Check if the database has been seeded with initial data
   */
  async isSeeded() {
    await this.open();
    const count = await this._count('drivers');
    return count > 0;
  }

  /**
   * Seed the database with default data from dummy-data.js
   */
  async seed() {
    await this.open();
    const seeded = await this.isSeeded();
    if (seeded) return false; // Already seeded

    // Deep clone to avoid reference issues
    const driversData = JSON.parse(JSON.stringify(defaultDrivers));
    const trucksData = JSON.parse(JSON.stringify(defaultTrucks));
    const deliveriesData = JSON.parse(JSON.stringify(defaultDeliveries));
    const alertsData = JSON.parse(JSON.stringify(defaultAlerts));

    await this._bulkPut('drivers', driversData);
    await this._bulkPut('trucks', trucksData);
    await this._bulkPut('deliveries', deliveriesData);
    await this._bulkPut('alerts', alertsData);

    console.log('%c[TDS DB] Database seeded with default data', 'color: #10b981;');
    return true;
  }

  /**
   * Reset the database to default data (clears everything and re-seeds)
   */
  async reset() {
    await this.open();
    for (const storeName of STORES) {
      await this._clear(storeName);
    }
    // Force re-seed
    const driversData = JSON.parse(JSON.stringify(defaultDrivers));
    const trucksData = JSON.parse(JSON.stringify(defaultTrucks));
    const deliveriesData = JSON.parse(JSON.stringify(defaultDeliveries));
    const alertsData = JSON.parse(JSON.stringify(defaultAlerts));

    await this._bulkPut('drivers', driversData);
    await this._bulkPut('trucks', trucksData);
    await this._bulkPut('deliveries', deliveriesData);
    await this._bulkPut('alerts', alertsData);

    console.log('%c[TDS DB] Database reset to defaults', 'color: #f59e0b;');
  }

  // ---- Generic CRUD Operations ----

  async getAll(storeName) {
    await this.open();
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction(storeName, 'readonly');
      const store = tx.objectStore(storeName);
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async get(storeName, id) {
    await this.open();
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction(storeName, 'readonly');
      const store = tx.objectStore(storeName);
      const request = store.get(id);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async put(storeName, data) {
    await this.open();
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      const request = store.put(data);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async delete(storeName, id) {
    await this.open();
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // ---- Internal Helpers ----

  _count(storeName) {
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction(storeName, 'readonly');
      const store = tx.objectStore(storeName);
      const request = store.count();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  _clear(storeName) {
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      const request = store.clear();
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  _bulkPut(storeName, items) {
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      items.forEach(item => store.put(item));
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }
}

// Singleton instance
export const db = new TDSDatabase();
