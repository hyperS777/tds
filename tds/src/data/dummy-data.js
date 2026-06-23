// ============================================
// TDS Dummy Data
// ============================================

// Avatar colors for drivers
const AVATAR_COLORS = [
  '#3b82f6', '#10b981', '#f59e0b', '#ef4444',
  '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'
];

// Truck models
export const trucks = [
  { id: 'TRK-001', model: 'Volvo FH16', capacity: 25000, weight: 8500, fuelTank: 400, currentFuel: 320, mileage: 3.2, year: 2023, plate: 'TX-4521-AB', health: { tires: 92, oil: 88, brakes: 95, engine: 97 } },
  { id: 'TRK-002', model: 'Scania R500', capacity: 22000, weight: 7800, fuelTank: 380, currentFuel: 95, mileage: 3.5, year: 2022, plate: 'TX-7834-CD', health: { tires: 78, oil: 65, brakes: 82, engine: 90 } },
  { id: 'TRK-003', model: 'MAN TGX', capacity: 24000, weight: 8200, fuelTank: 420, currentFuel: 350, mileage: 3.0, year: 2024, plate: 'TX-1256-EF', health: { tires: 96, oil: 92, brakes: 98, engine: 99 } },
  { id: 'TRK-004', model: 'DAF XF', capacity: 23000, weight: 7600, fuelTank: 390, currentFuel: 270, mileage: 3.4, year: 2023, plate: 'TX-9087-GH', health: { tires: 85, oil: 90, brakes: 75, engine: 88 } },
  { id: 'TRK-005', model: 'Mercedes Actros', capacity: 26000, weight: 8800, fuelTank: 450, currentFuel: 180, mileage: 2.8, year: 2024, plate: 'TX-3345-IJ', health: { tires: 90, oil: 85, brakes: 92, engine: 94 } },
  { id: 'TRK-006', model: 'Kenworth T680', capacity: 28000, weight: 9200, fuelTank: 500, currentFuel: 410, mileage: 2.6, year: 2023, plate: 'TX-6678-KL', health: { tires: 88, oil: 82, brakes: 90, engine: 93 } },
  { id: 'TRK-007', model: 'Peterbilt 579', capacity: 27000, weight: 9000, fuelTank: 480, currentFuel: 60, mileage: 2.7, year: 2022, plate: 'TX-2210-MN', health: { tires: 72, oil: 58, brakes: 68, engine: 80 } },
  { id: 'TRK-008', model: 'Iveco S-Way', capacity: 21000, weight: 7400, fuelTank: 360, currentFuel: 290, mileage: 3.6, year: 2024, plate: 'TX-5543-OP', health: { tires: 94, oil: 91, brakes: 96, engine: 98 } },
];

// Drivers
export const drivers = [
  {
    id: 'DRV-001', name: 'Marcus Johnson', email: 'driver1@tds.com', phone: '+1 (555) 234-5678',
    avatar: null, avatarColor: AVATAR_COLORS[0], initials: 'MJ',
    license: 'CDL-A 4521789', experience: 8, rating: 4.8,
    truckId: 'TRK-001', status: 'driving',
    currentPosition: { lat: 34.0522, lng: -118.2437 }, // Los Angeles
    destination: { lat: 36.1699, lng: -115.1398 }, // Las Vegas
    totalDeliveries: 342, onTimeRate: 94, restCompliance: 98,
    shiftStart: new Date(Date.now() - 5 * 3600000).toISOString(),
    drivingTime: 4.2, lastRest: new Date(Date.now() - 2.5 * 3600000).toISOString(),
    performanceScore: 92
  },
  {
    id: 'DRV-002', name: 'Sarah Chen', email: 'driver2@tds.com', phone: '+1 (555) 345-6789',
    avatar: null, avatarColor: AVATAR_COLORS[1], initials: 'SC',
    license: 'CDL-A 8834562', experience: 5, rating: 4.6,
    truckId: 'TRK-002', status: 'delayed',
    currentPosition: { lat: 37.7749, lng: -122.4194 }, // San Francisco
    destination: { lat: 38.5816, lng: -121.4944 }, // Sacramento
    totalDeliveries: 198, onTimeRate: 87, restCompliance: 92,
    shiftStart: new Date(Date.now() - 7 * 3600000).toISOString(),
    drivingTime: 5.8, lastRest: new Date(Date.now() - 4.5 * 3600000).toISOString(),
    performanceScore: 78
  },
  {
    id: 'DRV-003', name: 'Roberto Martinez', email: 'driver3@tds.com', phone: '+1 (555) 456-7890',
    avatar: null, avatarColor: AVATAR_COLORS[2], initials: 'RM',
    license: 'CDL-A 2267834', experience: 12, rating: 4.9,
    truckId: 'TRK-003', status: 'resting',
    currentPosition: { lat: 33.4484, lng: -112.0740 }, // Phoenix
    destination: { lat: 32.2226, lng: -110.9747 }, // Tucson
    totalDeliveries: 521, onTimeRate: 97, restCompliance: 100,
    shiftStart: new Date(Date.now() - 6 * 3600000).toISOString(),
    drivingTime: 3.8, lastRest: new Date(Date.now() - 0.3 * 3600000).toISOString(),
    performanceScore: 96
  },
  {
    id: 'DRV-004', name: 'James Williams', email: 'driver4@tds.com', phone: '+1 (555) 567-8901',
    avatar: null, avatarColor: AVATAR_COLORS[3], initials: 'JW',
    license: 'CDL-A 9945671', experience: 3, rating: 4.3,
    truckId: 'TRK-004', status: 'loading',
    currentPosition: { lat: 47.6062, lng: -122.3321 }, // Seattle
    destination: { lat: 45.5152, lng: -122.6784 }, // Portland
    totalDeliveries: 87, onTimeRate: 82, restCompliance: 88,
    shiftStart: new Date(Date.now() - 2 * 3600000).toISOString(),
    drivingTime: 1.5, lastRest: new Date(Date.now() - 1.2 * 3600000).toISOString(),
    performanceScore: 71
  },
  {
    id: 'DRV-005', name: 'Aisha Patel', email: 'driver5@tds.com', phone: '+1 (555) 678-9012',
    avatar: null, avatarColor: AVATAR_COLORS[4], initials: 'AP',
    license: 'CDL-A 6678234', experience: 7, rating: 4.7,
    truckId: 'TRK-005', status: 'driving',
    currentPosition: { lat: 39.7392, lng: -104.9903 }, // Denver
    destination: { lat: 41.2565, lng: -95.9345 }, // Omaha
    totalDeliveries: 289, onTimeRate: 91, restCompliance: 95,
    shiftStart: new Date(Date.now() - 4 * 3600000).toISOString(),
    drivingTime: 3.5, lastRest: new Date(Date.now() - 3 * 3600000).toISOString(),
    performanceScore: 88
  },
  {
    id: 'DRV-006', name: 'Tommy O\'Brien', email: 'driver6@tds.com', phone: '+1 (555) 789-0123',
    avatar: null, avatarColor: AVATAR_COLORS[5], initials: 'TO',
    license: 'CDL-A 3312897', experience: 10, rating: 4.5,
    truckId: 'TRK-006', status: 'driving',
    currentPosition: { lat: 29.7604, lng: -95.3698 }, // Houston
    destination: { lat: 32.7767, lng: -96.7970 }, // Dallas
    totalDeliveries: 412, onTimeRate: 89, restCompliance: 93,
    shiftStart: new Date(Date.now() - 3 * 3600000).toISOString(),
    drivingTime: 2.8, lastRest: new Date(Date.now() - 2 * 3600000).toISOString(),
    performanceScore: 84
  },
  {
    id: 'DRV-007', name: 'Nina Kowalski', email: 'driver7@tds.com', phone: '+1 (555) 890-1234',
    avatar: null, avatarColor: AVATAR_COLORS[6], initials: 'NK',
    license: 'CDL-A 7756123', experience: 6, rating: 4.4,
    truckId: 'TRK-007', status: 'idle',
    currentPosition: { lat: 41.8781, lng: -87.6298 }, // Chicago
    destination: null,
    totalDeliveries: 234, onTimeRate: 86, restCompliance: 90,
    shiftStart: null,
    drivingTime: 0, lastRest: new Date(Date.now() - 8 * 3600000).toISOString(),
    performanceScore: 76
  },
  {
    id: 'DRV-008', name: 'Derek Chang', email: 'driver8@tds.com', phone: '+1 (555) 901-2345',
    avatar: null, avatarColor: AVATAR_COLORS[7], initials: 'DC',
    license: 'CDL-A 1189456', experience: 9, rating: 4.8,
    truckId: 'TRK-008', status: 'driving',
    currentPosition: { lat: 25.7617, lng: -80.1918 }, // Miami
    destination: { lat: 28.5383, lng: -81.3792 }, // Orlando
    totalDeliveries: 378, onTimeRate: 95, restCompliance: 97,
    shiftStart: new Date(Date.now() - 3.5 * 3600000).toISOString(),
    drivingTime: 3.2, lastRest: new Date(Date.now() - 1 * 3600000).toISOString(),
    performanceScore: 94
  }
];

// Route waypoints for simulation (intermediate points)
export const routeWaypoints = {
  'DRV-001': [
    { lat: 34.0522, lng: -118.2437 },
    { lat: 34.2, lng: -117.8 },
    { lat: 34.6, lng: -117.2 },
    { lat: 34.9, lng: -116.5 },
    { lat: 35.2, lng: -116.0 },
    { lat: 35.6, lng: -115.8 },
    { lat: 36.0, lng: -115.3 },
    { lat: 36.1699, lng: -115.1398 }
  ],
  'DRV-002': [
    { lat: 37.7749, lng: -122.4194 },
    { lat: 37.85, lng: -122.25 },
    { lat: 37.95, lng: -122.05 },
    { lat: 38.1, lng: -121.9 },
    { lat: 38.3, lng: -121.7 },
    { lat: 38.5816, lng: -121.4944 }
  ],
  'DRV-005': [
    { lat: 39.7392, lng: -104.9903 },
    { lat: 40.0, lng: -104.5 },
    { lat: 40.3, lng: -103.8 },
    { lat: 40.5, lng: -102.5 },
    { lat: 40.7, lng: -101.0 },
    { lat: 40.9, lng: -99.5 },
    { lat: 41.0, lng: -98.0 },
    { lat: 41.1, lng: -97.0 },
    { lat: 41.2565, lng: -95.9345 }
  ],
  'DRV-006': [
    { lat: 29.7604, lng: -95.3698 },
    { lat: 30.2, lng: -95.5 },
    { lat: 30.8, lng: -95.8 },
    { lat: 31.3, lng: -96.2 },
    { lat: 31.8, lng: -96.5 },
    { lat: 32.3, lng: -96.7 },
    { lat: 32.7767, lng: -96.7970 }
  ],
  'DRV-008': [
    { lat: 25.7617, lng: -80.1918 },
    { lat: 26.1, lng: -80.2 },
    { lat: 26.6, lng: -80.3 },
    { lat: 27.0, lng: -80.5 },
    { lat: 27.5, lng: -80.8 },
    { lat: 28.0, lng: -81.1 },
    { lat: 28.5383, lng: -81.3792 }
  ]
};

// Deliveries
const now = Date.now();
export const deliveries = [
  // Active deliveries
  {
    id: 'DEL-1001', driverId: 'DRV-001', truckId: 'TRK-001',
    status: 'in-progress', priority: 'high',
    origin: { name: 'LA Distribution Center', address: '1200 Industrial Blvd, Los Angeles, CA', lat: 34.0522, lng: -118.2437 },
    destination: { name: 'Vegas Warehouse', address: '4500 Logistics Ave, Las Vegas, NV', lat: 36.1699, lng: -115.1398 },
    package: { description: 'Electronics - Server Equipment', weight: 4200, units: 24 },
    estimatedTime: 4.5, actualTime: null, estimatedDistance: 270,
    departureTime: new Date(now - 3 * 3600000).toISOString(),
    eta: new Date(now + 1.5 * 3600000).toISOString(),
    receiptCode: '482916', receiptScanned: false,
    progress: 67, weather: 'clear',
    notes: 'Fragile items - handle with care'
  },
  {
    id: 'DEL-1002', driverId: 'DRV-002', truckId: 'TRK-002',
    status: 'delayed', priority: 'critical',
    origin: { name: 'Bay Area Hub', address: '800 Tech Park Dr, San Francisco, CA', lat: 37.7749, lng: -122.4194 },
    destination: { name: 'Sacramento Depot', address: '2200 Capital Way, Sacramento, CA', lat: 38.5816, lng: -121.4944 },
    package: { description: 'Medical Supplies - Temperature Sensitive', weight: 1800, units: 48 },
    estimatedTime: 2.0, actualTime: null, estimatedDistance: 88,
    departureTime: new Date(now - 3.5 * 3600000).toISOString(),
    eta: new Date(now + 0.5 * 3600000).toISOString(),
    receiptCode: '739251', receiptScanned: false,
    progress: 45, weather: 'rain',
    notes: 'URGENT: Temperature sensitive - maintain cold chain'
  },
  {
    id: 'DEL-1003', driverId: 'DRV-003', truckId: 'TRK-003',
    status: 'in-progress', priority: 'normal',
    origin: { name: 'Phoenix Central', address: '3100 Desert Rd, Phoenix, AZ', lat: 33.4484, lng: -112.0740 },
    destination: { name: 'Tucson Distribution', address: '1500 Sonoran Way, Tucson, AZ', lat: 32.2226, lng: -110.9747 },
    package: { description: 'Auto Parts - Mixed Cargo', weight: 8500, units: 120 },
    estimatedTime: 2.0, actualTime: null, estimatedDistance: 115,
    departureTime: new Date(now - 1.5 * 3600000).toISOString(),
    eta: new Date(now + 0.5 * 3600000).toISOString(),
    receiptCode: '156847', receiptScanned: false,
    progress: 55, weather: 'clear',
    notes: 'Driver taking scheduled rest break'
  },
  {
    id: 'DEL-1004', driverId: 'DRV-004', truckId: 'TRK-004',
    status: 'loading', priority: 'normal',
    origin: { name: 'Seattle Port Terminal', address: '900 Harbor Ave, Seattle, WA', lat: 47.6062, lng: -122.3321 },
    destination: { name: 'Portland Center', address: '700 Columbia St, Portland, OR', lat: 45.5152, lng: -122.6784 },
    package: { description: 'Furniture - Residential', weight: 6200, units: 35 },
    estimatedTime: 3.0, actualTime: null, estimatedDistance: 174,
    departureTime: null,
    eta: new Date(now + 4 * 3600000).toISOString(),
    receiptCode: '863724', receiptScanned: false,
    progress: 0, weather: 'cloudy',
    notes: 'Loading at dock 7'
  },
  {
    id: 'DEL-1005', driverId: 'DRV-005', truckId: 'TRK-005',
    status: 'in-progress', priority: 'high',
    origin: { name: 'Denver Logistics Hub', address: '5500 Rockies Blvd, Denver, CO', lat: 39.7392, lng: -104.9903 },
    destination: { name: 'Omaha Fulfillment', address: '3200 Plains Dr, Omaha, NE', lat: 41.2565, lng: -95.9345 },
    package: { description: 'Retail Goods - Mixed Merchandise', weight: 12000, units: 200 },
    estimatedTime: 8.0, actualTime: null, estimatedDistance: 540,
    departureTime: new Date(now - 3.5 * 3600000).toISOString(),
    eta: new Date(now + 4.5 * 3600000).toISOString(),
    receiptCode: '294618', receiptScanned: false,
    progress: 38, weather: 'clear',
    notes: 'Long haul - ensure rest stops'
  },
  {
    id: 'DEL-1006', driverId: 'DRV-006', truckId: 'TRK-006',
    status: 'in-progress', priority: 'normal',
    origin: { name: 'Houston Terminal', address: '8800 Gulf Fwy, Houston, TX', lat: 29.7604, lng: -95.3698 },
    destination: { name: 'Dallas Mega Center', address: '4400 Commerce St, Dallas, TX', lat: 32.7767, lng: -96.7970 },
    package: { description: 'Industrial Equipment', weight: 18000, units: 8 },
    estimatedTime: 4.0, actualTime: null, estimatedDistance: 240,
    departureTime: new Date(now - 2.5 * 3600000).toISOString(),
    eta: new Date(now + 1.5 * 3600000).toISOString(),
    receiptCode: '571039', receiptScanned: false,
    progress: 60, weather: 'clear',
    notes: 'Heavy load - reduced speed advisory'
  },
  {
    id: 'DEL-1007', driverId: 'DRV-008', truckId: 'TRK-008',
    status: 'in-progress', priority: 'high',
    origin: { name: 'Miami Cargo Port', address: '1000 Ocean Dr, Miami, FL', lat: 25.7617, lng: -80.1918 },
    destination: { name: 'Orlando Distribution', address: '6200 Theme Park Blvd, Orlando, FL', lat: 28.5383, lng: -81.3792 },
    package: { description: 'Fresh Produce - Perishable', weight: 5500, units: 80 },
    estimatedTime: 4.0, actualTime: null, estimatedDistance: 236,
    departureTime: new Date(now - 3 * 3600000).toISOString(),
    eta: new Date(now + 1 * 3600000).toISOString(),
    receiptCode: '845267', receiptScanned: false,
    progress: 72, weather: 'partly-cloudy',
    notes: 'Perishable - maintain refrigeration'
  },

  // Completed deliveries (history)
  {
    id: 'DEL-0991', driverId: 'DRV-001', truckId: 'TRK-001',
    status: 'completed', priority: 'normal',
    origin: { name: 'San Diego Depot', address: '200 Harbor Dr, San Diego, CA', lat: 32.7157, lng: -117.1611 },
    destination: { name: 'LA Distribution Center', address: '1200 Industrial Blvd, Los Angeles, CA', lat: 34.0522, lng: -118.2437 },
    package: { description: 'Consumer Electronics', weight: 3800, units: 50 },
    estimatedTime: 2.5, actualTime: 2.3, estimatedDistance: 120,
    departureTime: new Date(now - 28 * 3600000).toISOString(),
    completedTime: new Date(now - 25.7 * 3600000).toISOString(),
    receiptCode: '328471', receiptScanned: true,
    progress: 100, weather: 'clear', notes: ''
  },
  {
    id: 'DEL-0992', driverId: 'DRV-002', truckId: 'TRK-002',
    status: 'completed', priority: 'high',
    origin: { name: 'Oakland Port', address: '530 Water St, Oakland, CA', lat: 37.7956, lng: -122.2785 },
    destination: { name: 'Bay Area Hub', address: '800 Tech Park Dr, San Francisco, CA', lat: 37.7749, lng: -122.4194 },
    package: { description: 'Imported Machinery', weight: 9200, units: 6 },
    estimatedTime: 1.0, actualTime: 1.4, estimatedDistance: 15,
    departureTime: new Date(now - 20 * 3600000).toISOString(),
    completedTime: new Date(now - 18.6 * 3600000).toISOString(),
    receiptCode: '917346', receiptScanned: true,
    progress: 100, weather: 'rain', notes: 'Delayed due to traffic'
  },
  {
    id: 'DEL-0993', driverId: 'DRV-003', truckId: 'TRK-003',
    status: 'completed', priority: 'normal',
    origin: { name: 'Flagstaff Warehouse', address: '100 Route 66, Flagstaff, AZ', lat: 35.1983, lng: -111.6513 },
    destination: { name: 'Phoenix Central', address: '3100 Desert Rd, Phoenix, AZ', lat: 33.4484, lng: -112.0740 },
    package: { description: 'Building Materials', weight: 15000, units: 200 },
    estimatedTime: 2.5, actualTime: 2.4, estimatedDistance: 145,
    departureTime: new Date(now - 15 * 3600000).toISOString(),
    completedTime: new Date(now - 12.6 * 3600000).toISOString(),
    receiptCode: '462815', receiptScanned: true,
    progress: 100, weather: 'clear', notes: ''
  },
  {
    id: 'DEL-0994', driverId: 'DRV-005', truckId: 'TRK-005',
    status: 'completed', priority: 'critical',
    origin: { name: 'Colorado Springs', address: '400 Pikes Peak Ave', lat: 38.8339, lng: -104.8214 },
    destination: { name: 'Denver Logistics Hub', address: '5500 Rockies Blvd, Denver, CO', lat: 39.7392, lng: -104.9903 },
    package: { description: 'Pharmaceuticals', weight: 800, units: 150 },
    estimatedTime: 1.5, actualTime: 1.3, estimatedDistance: 70,
    departureTime: new Date(now - 10 * 3600000).toISOString(),
    completedTime: new Date(now - 8.7 * 3600000).toISOString(),
    receiptCode: '735928', receiptScanned: true,
    progress: 100, weather: 'clear', notes: ''
  },
  {
    id: 'DEL-0995', driverId: 'DRV-006', truckId: 'TRK-006',
    status: 'completed', priority: 'normal',
    origin: { name: 'San Antonio Hub', address: '1900 Alamo Blvd, San Antonio, TX', lat: 29.4241, lng: -98.4936 },
    destination: { name: 'Houston Terminal', address: '8800 Gulf Fwy, Houston, TX', lat: 29.7604, lng: -95.3698 },
    package: { description: 'Food Products', weight: 7500, units: 300 },
    estimatedTime: 3.0, actualTime: 3.2, estimatedDistance: 200,
    departureTime: new Date(now - 24 * 3600000).toISOString(),
    completedTime: new Date(now - 20.8 * 3600000).toISOString(),
    receiptCode: '184627', receiptScanned: true,
    progress: 100, weather: 'clear', notes: ''
  },
  {
    id: 'DEL-0996', driverId: 'DRV-008', truckId: 'TRK-008',
    status: 'completed', priority: 'high',
    origin: { name: 'Jacksonville Port', address: '2100 Maritime Way, Jacksonville, FL', lat: 30.3322, lng: -81.6557 },
    destination: { name: 'Miami Cargo Port', address: '1000 Ocean Dr, Miami, FL', lat: 25.7617, lng: -80.1918 },
    package: { description: 'Automotive Parts', weight: 6800, units: 45 },
    estimatedTime: 5.5, actualTime: 5.2, estimatedDistance: 345,
    departureTime: new Date(now - 30 * 3600000).toISOString(),
    completedTime: new Date(now - 24.8 * 3600000).toISOString(),
    receiptCode: '529614', receiptScanned: true,
    progress: 100, weather: 'partly-cloudy', notes: ''
  },
  {
    id: 'DEL-0997', driverId: 'DRV-001', truckId: 'TRK-001',
    status: 'completed', priority: 'normal',
    origin: { name: 'Bakersfield Stop', address: '600 Central Ave, Bakersfield, CA', lat: 35.3733, lng: -119.0187 },
    destination: { name: 'LA Distribution Center', address: '1200 Industrial Blvd, Los Angeles, CA', lat: 34.0522, lng: -118.2437 },
    package: { description: 'Agricultural Products', weight: 11000, units: 500 },
    estimatedTime: 2.0, actualTime: 1.8, estimatedDistance: 112,
    departureTime: new Date(now - 48 * 3600000).toISOString(),
    completedTime: new Date(now - 46.2 * 3600000).toISOString(),
    receiptCode: '673142', receiptScanned: true,
    progress: 100, weather: 'clear', notes: ''
  },
  {
    id: 'DEL-0998', driverId: 'DRV-004', truckId: 'TRK-004',
    status: 'completed', priority: 'high',
    origin: { name: 'Vancouver BC Terminal', address: '500 Waterfront Rd, Vancouver, WA', lat: 45.6387, lng: -122.6615 },
    destination: { name: 'Seattle Port Terminal', address: '900 Harbor Ave, Seattle, WA', lat: 47.6062, lng: -122.3321 },
    package: { description: 'Tech Hardware', weight: 4500, units: 30 },
    estimatedTime: 3.0, actualTime: 3.5, estimatedDistance: 165,
    departureTime: new Date(now - 18 * 3600000).toISOString(),
    completedTime: new Date(now - 14.5 * 3600000).toISOString(),
    receiptCode: '348971', receiptScanned: true,
    progress: 100, weather: 'rain', notes: 'Delayed due to heavy rain'
  },

  // Scheduled deliveries
  {
    id: 'DEL-1008', driverId: 'DRV-007', truckId: 'TRK-007',
    status: 'scheduled', priority: 'normal',
    origin: { name: 'Chicago Distribution', address: '4000 Lakeshore Dr, Chicago, IL', lat: 41.8781, lng: -87.6298 },
    destination: { name: 'Detroit Motor Hub', address: '2800 Ford Ave, Detroit, MI', lat: 42.3314, lng: -83.0458 },
    package: { description: 'Automotive Components', weight: 7800, units: 60 },
    estimatedTime: 5.0, actualTime: null, estimatedDistance: 282,
    departureTime: null,
    eta: new Date(now + 8 * 3600000).toISOString(),
    receiptCode: '419582', receiptScanned: false,
    progress: 0, weather: 'cloudy', notes: 'Scheduled for tomorrow morning'
  },
  {
    id: 'DEL-1009', driverId: 'DRV-001', truckId: 'TRK-001',
    status: 'scheduled', priority: 'high',
    origin: { name: 'Vegas Warehouse', address: '4500 Logistics Ave, Las Vegas, NV', lat: 36.1699, lng: -115.1398 },
    destination: { name: 'Salt Lake Depot', address: '1300 Temple Ave, Salt Lake City, UT', lat: 40.7608, lng: -111.8910 },
    package: { description: 'Construction Materials', weight: 14000, units: 80 },
    estimatedTime: 6.5, actualTime: null, estimatedDistance: 420,
    departureTime: null,
    eta: new Date(now + 12 * 3600000).toISOString(),
    receiptCode: '627345', receiptScanned: false,
    progress: 0, weather: 'clear', notes: 'After current delivery completion'
  }
];

// Geofence zones
export const geofences = [
  { id: 'GF-001', name: 'LA Distribution Center', type: 'warehouse', lat: 34.0522, lng: -118.2437, radius: 500 },
  { id: 'GF-002', name: 'Vegas Warehouse', type: 'warehouse', lat: 36.1699, lng: -115.1398, radius: 500 },
  { id: 'GF-003', name: 'Bay Area Hub', type: 'warehouse', lat: 37.7749, lng: -122.4194, radius: 400 },
  { id: 'GF-004', name: 'Sacramento Depot', type: 'delivery', lat: 38.5816, lng: -121.4944, radius: 300 },
  { id: 'GF-005', name: 'Phoenix Central', type: 'warehouse', lat: 33.4484, lng: -112.0740, radius: 500 },
  { id: 'GF-006', name: 'Tucson Distribution', type: 'delivery', lat: 32.2226, lng: -110.9747, radius: 300 },
  { id: 'GF-007', name: 'Seattle Port Terminal', type: 'warehouse', lat: 47.6062, lng: -122.3321, radius: 600 },
  { id: 'GF-008', name: 'Portland Center', type: 'delivery', lat: 45.5152, lng: -122.6784, radius: 400 },
  { id: 'GF-009', name: 'Baker Rest Stop', type: 'rest-stop', lat: 35.2650, lng: -116.0730, radius: 200 },
  { id: 'GF-010', name: 'Barstow Rest Area', type: 'rest-stop', lat: 34.8958, lng: -117.0173, radius: 200 },
  { id: 'GF-011', name: 'Denver Logistics Hub', type: 'warehouse', lat: 39.7392, lng: -104.9903, radius: 500 },
  { id: 'GF-012', name: 'Houston Terminal', type: 'warehouse', lat: 29.7604, lng: -95.3698, radius: 500 },
  { id: 'GF-013', name: 'Dallas Mega Center', type: 'delivery', lat: 32.7767, lng: -96.7970, radius: 500 },
  { id: 'GF-014', name: 'Chicago Distribution', type: 'warehouse', lat: 41.8781, lng: -87.6298, radius: 500 },
  { id: 'GF-015', name: 'Miami Cargo Port', type: 'warehouse', lat: 25.7617, lng: -80.1918, radius: 500 },
  { id: 'GF-016', name: 'Orlando Distribution', type: 'delivery', lat: 28.5383, lng: -81.3792, radius: 400 },
];

// Alerts
export const initialAlerts = [
  {
    id: 'ALT-001', type: 'delay', severity: 'high',
    driverId: 'DRV-002', deliveryId: 'DEL-1002',
    title: 'Delivery Significantly Delayed',
    message: 'Sarah Chen is 45 minutes behind schedule on DEL-1002 (Medical Supplies to Sacramento). Heavy rain on I-80.',
    timestamp: new Date(now - 0.5 * 3600000).toISOString(),
    read: false, dismissed: false, actionTaken: null
  },
  {
    id: 'ALT-002', type: 'fuel', severity: 'critical',
    driverId: 'DRV-007', deliveryId: null,
    title: 'Critical Fuel Level',
    message: 'Nina Kowalski\'s truck (TRK-007) fuel at 12.5% — below safe threshold. Nearest fuel station: 8 miles.',
    timestamp: new Date(now - 1 * 3600000).toISOString(),
    read: false, dismissed: false, actionTaken: null
  },
  {
    id: 'ALT-003', type: 'rest', severity: 'medium',
    driverId: 'DRV-002', deliveryId: 'DEL-1002',
    title: 'Rest Break Overdue',
    message: 'Sarah Chen has been driving for 5.8 hours without a proper rest break. Mandatory rest required after 4 hours.',
    timestamp: new Date(now - 0.3 * 3600000).toISOString(),
    read: false, dismissed: false, actionTaken: null
  },
  {
    id: 'ALT-004', type: 'fuel', severity: 'medium',
    driverId: 'DRV-002', deliveryId: 'DEL-1002',
    title: 'Low Fuel Warning',
    message: 'Sarah Chen\'s truck (TRK-002) fuel at 25% — recommend refueling at next available station.',
    timestamp: new Date(now - 2 * 3600000).toISOString(),
    read: true, dismissed: false, actionTaken: null
  },
  {
    id: 'ALT-005', type: 'geofence', severity: 'low',
    driverId: 'DRV-003', deliveryId: 'DEL-1003',
    title: 'Driver Entered Rest Zone',
    message: 'Roberto Martinez entered the scheduled rest area near Phoenix. Rest timer started.',
    timestamp: new Date(now - 0.3 * 3600000).toISOString(),
    read: true, dismissed: false, actionTaken: null
  },
  {
    id: 'ALT-006', type: 'delay', severity: 'low',
    driverId: 'DRV-004', deliveryId: 'DEL-1004',
    title: 'Loading Taking Longer Than Expected',
    message: 'James Williams has been loading at Seattle Port Terminal for 45 minutes (expected: 30 min).',
    timestamp: new Date(now - 0.8 * 3600000).toISOString(),
    read: true, dismissed: false, actionTaken: null
  }
];

// Weather data per region
export const weatherData = {
  'Los Angeles': { condition: 'clear', temp: 78, icon: '☀️', impact: 0 },
  'Las Vegas': { condition: 'clear', temp: 95, icon: '☀️', impact: 0 },
  'San Francisco': { condition: 'rain', temp: 58, icon: '🌧️', impact: 15 },
  'Sacramento': { condition: 'rain', temp: 62, icon: '🌧️', impact: 15 },
  'Phoenix': { condition: 'clear', temp: 102, icon: '☀️', impact: 0 },
  'Tucson': { condition: 'clear', temp: 98, icon: '☀️', impact: 0 },
  'Seattle': { condition: 'cloudy', temp: 55, icon: '☁️', impact: 5 },
  'Portland': { condition: 'cloudy', temp: 58, icon: '☁️', impact: 5 },
  'Denver': { condition: 'clear', temp: 72, icon: '☀️', impact: 0 },
  'Omaha': { condition: 'clear', temp: 80, icon: '☀️', impact: 0 },
  'Houston': { condition: 'clear', temp: 88, icon: '☀️', impact: 0 },
  'Dallas': { condition: 'clear', temp: 92, icon: '☀️', impact: 0 },
  'Chicago': { condition: 'cloudy', temp: 65, icon: '☁️', impact: 5 },
  'Miami': { condition: 'partly-cloudy', temp: 85, icon: '⛅', impact: 3 },
  'Orlando': { condition: 'partly-cloudy', temp: 83, icon: '⛅', impact: 3 }
};

// Supervisor credentials
export const supervisorCredentials = {
  email: 'admin@tds.com',
  password: 'demo123',
  name: 'Alex Rodriguez',
  role: 'supervisor',
  initials: 'AR',
  avatarColor: '#3b82f6'
};

// Driver credentials (any driver email + demo123)
export const driverPasswords = 'demo123';
