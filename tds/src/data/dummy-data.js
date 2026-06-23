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
    id: 'DRV-001', name: 'Ahmad bin Ali', email: 'driver1@tds.com', phone: '+60 12-345 6789',
    avatar: null, avatarColor: AVATAR_COLORS[0], initials: 'AA',
    license: 'GDL 4521789', experience: 8, rating: 4.8,
    truckId: 'TRK-001', status: 'driving',
    currentPosition: { lat: 3.1390, lng: 101.6869 }, // Kuala Lumpur
    destination: { lat: 5.4164, lng: 100.3327 }, // Penang
    totalDeliveries: 342, onTimeRate: 94, restCompliance: 98,
    shiftStart: new Date(Date.now() - 5 * 3600000).toISOString(),
    drivingTime: 4.2, lastRest: new Date(Date.now() - 2.5 * 3600000).toISOString(),
    performanceScore: 92
  },
  {
    id: 'DRV-002', name: 'Siti Nurhaliza', email: 'driver2@tds.com', phone: '+60 13-456 7890',
    avatar: null, avatarColor: AVATAR_COLORS[1], initials: 'SN',
    license: 'GDL 8834562', experience: 5, rating: 4.6,
    truckId: 'TRK-002', status: 'delayed',
    currentPosition: { lat: 1.4927, lng: 103.7414 }, // Johor Bahru
    destination: { lat: 2.1896, lng: 102.2501 }, // Melaka
    totalDeliveries: 198, onTimeRate: 87, restCompliance: 92,
    shiftStart: new Date(Date.now() - 7 * 3600000).toISOString(),
    drivingTime: 5.8, lastRest: new Date(Date.now() - 4.5 * 3600000).toISOString(),
    performanceScore: 78
  },
  {
    id: 'DRV-003', name: 'Ravi Kumar', email: 'driver3@tds.com', phone: '+60 14-567 8901',
    avatar: null, avatarColor: AVATAR_COLORS[2], initials: 'RK',
    license: 'GDL 2267834', experience: 12, rating: 4.9,
    truckId: 'TRK-003', status: 'resting',
    currentPosition: { lat: 4.5975, lng: 101.0901 }, // Ipoh
    destination: { lat: 6.1248, lng: 100.3678 }, // Alor Setar
    totalDeliveries: 521, onTimeRate: 97, restCompliance: 100,
    shiftStart: new Date(Date.now() - 6 * 3600000).toISOString(),
    drivingTime: 3.8, lastRest: new Date(Date.now() - 0.3 * 3600000).toISOString(),
    performanceScore: 96
  },
  {
    id: 'DRV-004', name: 'Chong Wei', email: 'driver4@tds.com', phone: '+60 16-678 9012',
    avatar: null, avatarColor: AVATAR_COLORS[3], initials: 'CW',
    license: 'GDL 9945671', experience: 3, rating: 4.3,
    truckId: 'TRK-004', status: 'loading',
    currentPosition: { lat: 3.8024, lng: 103.3256 }, // Kuantan
    destination: { lat: 5.3117, lng: 103.1324 }, // Kuala Terengganu
    totalDeliveries: 87, onTimeRate: 82, restCompliance: 88,
    shiftStart: new Date(Date.now() - 2 * 3600000).toISOString(),
    drivingTime: 1.5, lastRest: new Date(Date.now() - 1.2 * 3600000).toISOString(),
    performanceScore: 71
  },
  {
    id: 'DRV-005', name: 'Farah Ann', email: 'driver5@tds.com', phone: '+60 17-789 0123',
    avatar: null, avatarColor: AVATAR_COLORS[4], initials: 'FA',
    license: 'GDL 6678234', experience: 7, rating: 4.7,
    truckId: 'TRK-005', status: 'driving',
    currentPosition: { lat: 2.7258, lng: 101.9424 }, // Seremban
    destination: { lat: 3.0733, lng: 101.5185 }, // Shah Alam
    totalDeliveries: 289, onTimeRate: 91, restCompliance: 95,
    shiftStart: new Date(Date.now() - 4 * 3600000).toISOString(),
    drivingTime: 3.5, lastRest: new Date(Date.now() - 3 * 3600000).toISOString(),
    performanceScore: 88
  },
  {
    id: 'DRV-006', name: 'Muthu Samy', email: 'driver6@tds.com', phone: '+60 19-890 1234',
    avatar: null, avatarColor: AVATAR_COLORS[5], initials: 'MS',
    license: 'GDL 3312897', experience: 10, rating: 4.5,
    truckId: 'TRK-006', status: 'driving',
    currentPosition: { lat: 1.4927, lng: 103.7414 }, // Johor Bahru
    destination: { lat: 3.1390, lng: 101.6869 }, // Kuala Lumpur
    totalDeliveries: 412, onTimeRate: 89, restCompliance: 93,
    shiftStart: new Date(Date.now() - 3 * 3600000).toISOString(),
    drivingTime: 2.8, lastRest: new Date(Date.now() - 2 * 3600000).toISOString(),
    performanceScore: 84
  },
  {
    id: 'DRV-007', name: 'Diana Wong', email: 'driver7@tds.com', phone: '+60 11-901 2345',
    avatar: null, avatarColor: AVATAR_COLORS[6], initials: 'DW',
    license: 'GDL 7756123', experience: 6, rating: 4.4,
    truckId: 'TRK-007', status: 'idle',
    currentPosition: { lat: 2.9909, lng: 101.7886 }, // Kajang
    destination: null,
    totalDeliveries: 234, onTimeRate: 86, restCompliance: 90,
    shiftStart: null,
    drivingTime: 0, lastRest: new Date(Date.now() - 8 * 3600000).toISOString(),
    performanceScore: 76
  },
  {
    id: 'DRV-008', name: 'Azizul Hasni', email: 'driver8@tds.com', phone: '+60 18-012 3456',
    avatar: null, avatarColor: AVATAR_COLORS[7], initials: 'AH',
    license: 'GDL 1189456', experience: 9, rating: 4.8,
    truckId: 'TRK-008', status: 'driving',
    currentPosition: { lat: 6.1248, lng: 100.3678 }, // Alor Setar
    destination: { lat: 5.4164, lng: 100.3327 }, // Penang
    totalDeliveries: 378, onTimeRate: 95, restCompliance: 97,
    shiftStart: new Date(Date.now() - 3.5 * 3600000).toISOString(),
    drivingTime: 3.2, lastRest: new Date(Date.now() - 1 * 3600000).toISOString(),
    performanceScore: 94
  }
];

// Route waypoints for simulation (intermediate points)
export const routeWaypoints = {
  'DRV-001': [
    { lat: 3.1390, lng: 101.6869 }, // KL
    { lat: 3.7333, lng: 101.5333 },
    { lat: 4.2333, lng: 101.3000 },
    { lat: 4.5975, lng: 101.0901 }, // Ipoh
    { lat: 4.9000, lng: 100.8000 },
    { lat: 5.4164, lng: 100.3327 }  // Penang
  ],
  'DRV-002': [
    { lat: 1.4927, lng: 103.7414 }, // JB
    { lat: 1.8000, lng: 103.3000 },
    { lat: 2.1896, lng: 102.2501 }  // Melaka
  ],
  'DRV-005': [
    { lat: 2.7258, lng: 101.9424 }, // Seremban
    { lat: 2.9000, lng: 101.8000 },
    { lat: 3.0733, lng: 101.5185 }  // Shah Alam
  ],
  'DRV-006': [
    { lat: 1.4927, lng: 103.7414 }, // JB
    { lat: 2.0000, lng: 103.0000 },
    { lat: 2.5000, lng: 102.5000 },
    { lat: 2.8000, lng: 102.0000 },
    { lat: 3.1390, lng: 101.6869 }  // KL
  ],
  'DRV-008': [
    { lat: 6.1248, lng: 100.3678 }, // Alor Setar
    { lat: 5.8000, lng: 100.4000 },
    { lat: 5.4164, lng: 100.3327 }  // Penang
  ]
};

// Deliveries
const now = Date.now();
export const deliveries = [
  // Active deliveries
  {
    id: 'DEL-1001', driverId: 'DRV-001', truckId: 'TRK-001',
    status: 'in-progress', priority: 'high',
    origin: { name: 'KL Distribution Center', address: 'Bukit Jalil, Kuala Lumpur', lat: 3.1390, lng: 101.6869 },
    destination: { name: 'Bayan Lepas Warehouse', address: 'Bayan Lepas, Penang', lat: 5.4164, lng: 100.3327 },
    package: { description: 'Electronics - Server Equipment', weight: 4200, units: 24 },
    estimatedTime: 4.5, actualTime: null, estimatedDistance: 350,
    departureTime: new Date(now - 3 * 3600000).toISOString(),
    eta: new Date(now + 1.5 * 3600000).toISOString(),
    receiptCode: '482916', receiptScanned: false,
    progress: 67, weather: 'clear',
    notes: 'Fragile items - handle with care'
  },
  {
    id: 'DEL-1002', driverId: 'DRV-002', truckId: 'TRK-002',
    status: 'delayed', priority: 'critical',
    origin: { name: 'JB Hub', address: 'Pasir Gudang, Johor Bahru', lat: 1.4927, lng: 103.7414 },
    destination: { name: 'Ayer Keroh Depot', address: 'Ayer Keroh, Melaka', lat: 2.1896, lng: 102.2501 },
    package: { description: 'Medical Supplies - Temperature Sensitive', weight: 1800, units: 48 },
    estimatedTime: 2.5, actualTime: null, estimatedDistance: 210,
    departureTime: new Date(now - 3.5 * 3600000).toISOString(),
    eta: new Date(now + 0.5 * 3600000).toISOString(),
    receiptCode: '739251', receiptScanned: false,
    progress: 45, weather: 'rain',
    notes: 'URGENT: Temperature sensitive - maintain cold chain'
  },
  {
    id: 'DEL-1003', driverId: 'DRV-003', truckId: 'TRK-003',
    status: 'in-progress', priority: 'normal',
    origin: { name: 'Ipoh Central', address: 'Jelapang, Ipoh', lat: 4.5975, lng: 101.0901 },
    destination: { name: 'Alor Setar Distribution', address: 'Anak Bukit, Alor Setar', lat: 6.1248, lng: 100.3678 },
    package: { description: 'Auto Parts - Mixed Cargo', weight: 8500, units: 120 },
    estimatedTime: 2.5, actualTime: null, estimatedDistance: 230,
    departureTime: new Date(now - 1.5 * 3600000).toISOString(),
    eta: new Date(now + 1.0 * 3600000).toISOString(),
    receiptCode: '156847', receiptScanned: false,
    progress: 55, weather: 'clear',
    notes: 'Driver taking scheduled rest break'
  },
  {
    id: 'DEL-1004', driverId: 'DRV-004', truckId: 'TRK-004',
    status: 'loading', priority: 'normal',
    origin: { name: 'Kuantan Port', address: 'Pelabuhan Kuantan, Pahang', lat: 3.8024, lng: 103.3256 },
    destination: { name: 'KT Center', address: 'Kuala Nerus, Terengganu', lat: 5.3117, lng: 103.1324 },
    package: { description: 'Furniture - Residential', weight: 6200, units: 35 },
    estimatedTime: 3.0, actualTime: null, estimatedDistance: 220,
    departureTime: null,
    eta: new Date(now + 4 * 3600000).toISOString(),
    receiptCode: '863724', receiptScanned: false,
    progress: 0, weather: 'cloudy',
    notes: 'Loading at dock 7'
  },
  {
    id: 'DEL-1005', driverId: 'DRV-005', truckId: 'TRK-005',
    status: 'in-progress', priority: 'high',
    origin: { name: 'Seremban Hub', address: 'Senawang, Seremban', lat: 2.7258, lng: 101.9424 },
    destination: { name: 'Shah Alam Fulfillment', address: 'Seksyen 15, Shah Alam', lat: 3.0733, lng: 101.5185 },
    package: { description: 'Retail Goods - Mixed Merchandise', weight: 12000, units: 200 },
    estimatedTime: 1.5, actualTime: null, estimatedDistance: 60,
    departureTime: new Date(now - 0.5 * 3600000).toISOString(),
    eta: new Date(now + 1.0 * 3600000).toISOString(),
    receiptCode: '294618', receiptScanned: false,
    progress: 38, weather: 'clear',
    notes: 'Short haul'
  },
  {
    id: 'DEL-1006', driverId: 'DRV-006', truckId: 'TRK-006',
    status: 'in-progress', priority: 'normal',
    origin: { name: 'JB Terminal', address: 'Senai, Johor', lat: 1.4927, lng: 103.7414 },
    destination: { name: 'KL Mega Center', address: 'Sungai Besi, KL', lat: 3.1390, lng: 101.6869 },
    package: { description: 'Industrial Equipment', weight: 18000, units: 8 },
    estimatedTime: 4.0, actualTime: null, estimatedDistance: 330,
    departureTime: new Date(now - 2.5 * 3600000).toISOString(),
    eta: new Date(now + 1.5 * 3600000).toISOString(),
    receiptCode: '571039', receiptScanned: false,
    progress: 60, weather: 'clear',
    notes: 'Heavy load - reduced speed advisory'
  },
  {
    id: 'DEL-1007', driverId: 'DRV-008', truckId: 'TRK-008',
    status: 'in-progress', priority: 'high',
    origin: { name: 'Alor Setar Cargo', address: 'Merga, Kedah', lat: 6.1248, lng: 100.3678 },
    destination: { name: 'Penang Distribution', address: 'Prai, Penang', lat: 5.4164, lng: 100.3327 },
    package: { description: 'Fresh Produce - Perishable', weight: 5500, units: 80 },
    estimatedTime: 2.0, actualTime: null, estimatedDistance: 110,
    departureTime: new Date(now - 1.5 * 3600000).toISOString(),
    eta: new Date(now + 0.5 * 3600000).toISOString(),
    receiptCode: '845267', receiptScanned: false,
    progress: 72, weather: 'partly-cloudy',
    notes: 'Perishable - maintain refrigeration'
  },

  // Completed deliveries (history)
  {
    id: 'DEL-0991', driverId: 'DRV-001', truckId: 'TRK-001',
    status: 'completed', priority: 'normal',
    origin: { name: 'JB Depot', address: 'JB City, Johor', lat: 1.4927, lng: 103.7414 },
    destination: { name: 'KL Distribution Center', address: 'Bukit Jalil, Kuala Lumpur', lat: 3.1390, lng: 101.6869 },
    package: { description: 'Consumer Electronics', weight: 3800, units: 50 },
    estimatedTime: 4.5, actualTime: 4.3, estimatedDistance: 330,
    departureTime: new Date(now - 28 * 3600000).toISOString(),
    completedTime: new Date(now - 23.7 * 3600000).toISOString(),
    receiptCode: '328471', receiptScanned: true,
    progress: 100, weather: 'clear', notes: ''
  },
  {
    id: 'DEL-0992', driverId: 'DRV-002', truckId: 'TRK-002',
    status: 'completed', priority: 'high',
    origin: { name: 'Penang Port', address: 'Butterworth, Penang', lat: 5.3991, lng: 100.3638 },
    destination: { name: 'Ipoh Hub', address: 'Ipoh, Perak', lat: 4.5975, lng: 101.0901 },
    package: { description: 'Imported Machinery', weight: 9200, units: 6 },
    estimatedTime: 2.0, actualTime: 2.4, estimatedDistance: 160,
    departureTime: new Date(now - 20 * 3600000).toISOString(),
    completedTime: new Date(now - 17.6 * 3600000).toISOString(),
    receiptCode: '917346', receiptScanned: true,
    progress: 100, weather: 'rain', notes: 'Delayed due to traffic'
  },
  {
    id: 'DEL-0993', driverId: 'DRV-003', truckId: 'TRK-003',
    status: 'completed', priority: 'normal',
    origin: { name: 'Kuantan Warehouse', address: 'Kuantan, Pahang', lat: 3.8024, lng: 103.3256 },
    destination: { name: 'KL Central', address: 'KL, Malaysia', lat: 3.1390, lng: 101.6869 },
    package: { description: 'Building Materials', weight: 15000, units: 200 },
    estimatedTime: 3.5, actualTime: 3.4, estimatedDistance: 250,
    departureTime: new Date(now - 15 * 3600000).toISOString(),
    completedTime: new Date(now - 11.6 * 3600000).toISOString(),
    receiptCode: '462815', receiptScanned: true,
    progress: 100, weather: 'clear', notes: ''
  },
  {
    id: 'DEL-0994', driverId: 'DRV-005', truckId: 'TRK-005',
    status: 'completed', priority: 'critical',
    origin: { name: 'Shah Alam', address: 'Shah Alam, Selangor', lat: 3.0733, lng: 101.5185 },
    destination: { name: 'JB Hub', address: 'Pasir Gudang, Johor Bahru', lat: 1.4927, lng: 103.7414 },
    package: { description: 'Pharmaceuticals', weight: 800, units: 150 },
    estimatedTime: 4.0, actualTime: 3.8, estimatedDistance: 320,
    departureTime: new Date(now - 10 * 3600000).toISOString(),
    completedTime: new Date(now - 6.2 * 3600000).toISOString(),
    receiptCode: '735928', receiptScanned: true,
    progress: 100, weather: 'clear', notes: ''
  },
  {
    id: 'DEL-0995', driverId: 'DRV-006', truckId: 'TRK-006',
    status: 'completed', priority: 'normal',
    origin: { name: 'Melaka Hub', address: 'Ayer Keroh, Melaka', lat: 2.1896, lng: 102.2501 },
    destination: { name: 'Seremban Terminal', address: 'Seremban, N.S.', lat: 2.7258, lng: 101.9424 },
    package: { description: 'Food Products', weight: 7500, units: 300 },
    estimatedTime: 1.5, actualTime: 1.6, estimatedDistance: 80,
    departureTime: new Date(now - 24 * 3600000).toISOString(),
    completedTime: new Date(now - 22.4 * 3600000).toISOString(),
    receiptCode: '184627', receiptScanned: true,
    progress: 100, weather: 'clear', notes: ''
  },
  {
    id: 'DEL-0996', driverId: 'DRV-008', truckId: 'TRK-008',
    status: 'completed', priority: 'high',
    origin: { name: 'Klang Port', address: 'Port Klang, Selangor', lat: 3.0333, lng: 101.3667 },
    destination: { name: 'Penang Cargo', address: 'Bayan Lepas, Penang', lat: 5.4164, lng: 100.3327 },
    package: { description: 'Automotive Parts', weight: 6800, units: 45 },
    estimatedTime: 4.5, actualTime: 4.2, estimatedDistance: 350,
    departureTime: new Date(now - 30 * 3600000).toISOString(),
    completedTime: new Date(now - 25.8 * 3600000).toISOString(),
    receiptCode: '529614', receiptScanned: true,
    progress: 100, weather: 'partly-cloudy', notes: ''
  },
  {
    id: 'DEL-0997', driverId: 'DRV-001', truckId: 'TRK-001',
    status: 'completed', priority: 'normal',
    origin: { name: 'Cameron Highlands', address: 'Cameron, Pahang', lat: 4.4721, lng: 101.3801 },
    destination: { name: 'KL Distribution Center', address: 'Bukit Jalil, Kuala Lumpur', lat: 3.1390, lng: 101.6869 },
    package: { description: 'Agricultural Products', weight: 11000, units: 500 },
    estimatedTime: 3.0, actualTime: 2.8, estimatedDistance: 200,
    departureTime: new Date(now - 48 * 3600000).toISOString(),
    completedTime: new Date(now - 45.2 * 3600000).toISOString(),
    receiptCode: '673142', receiptScanned: true,
    progress: 100, weather: 'clear', notes: ''
  },
  {
    id: 'DEL-0998', driverId: 'DRV-004', truckId: 'TRK-004',
    status: 'completed', priority: 'high',
    origin: { name: 'Alor Setar Hub', address: 'Merga, Kedah', lat: 6.1248, lng: 100.3678 },
    destination: { name: 'Ipoh Terminal', address: 'Jelapang, Ipoh', lat: 4.5975, lng: 101.0901 },
    package: { description: 'Tech Hardware', weight: 4500, units: 30 },
    estimatedTime: 2.5, actualTime: 3.0, estimatedDistance: 230,
    departureTime: new Date(now - 18 * 3600000).toISOString(),
    completedTime: new Date(now - 15.0 * 3600000).toISOString(),
    receiptCode: '348971', receiptScanned: true,
    progress: 100, weather: 'rain', notes: 'Delayed due to heavy rain'
  },

  // Scheduled deliveries
  {
    id: 'DEL-1008', driverId: 'DRV-007', truckId: 'TRK-007',
    status: 'scheduled', priority: 'normal',
    origin: { name: 'Kajang Distribution', address: 'Kajang, Selangor', lat: 2.9909, lng: 101.7886 },
    destination: { name: 'Melaka Hub', address: 'Ayer Keroh, Melaka', lat: 2.1896, lng: 102.2501 },
    package: { description: 'Automotive Components', weight: 7800, units: 60 },
    estimatedTime: 2.0, actualTime: null, estimatedDistance: 130,
    departureTime: null,
    eta: new Date(now + 8 * 3600000).toISOString(),
    receiptCode: '419582', receiptScanned: false,
    progress: 0, weather: 'cloudy', notes: 'Scheduled for tomorrow morning'
  },
  {
    id: 'DEL-1009', driverId: 'DRV-001', truckId: 'TRK-001',
    status: 'scheduled', priority: 'high',
    origin: { name: 'Bayan Lepas Warehouse', address: 'Bayan Lepas, Penang', lat: 5.4164, lng: 100.3327 },
    destination: { name: 'Alor Setar Cargo', address: 'Merga, Kedah', lat: 6.1248, lng: 100.3678 },
    package: { description: 'Construction Materials', weight: 14000, units: 80 },
    estimatedTime: 2.5, actualTime: null, estimatedDistance: 120,
    departureTime: null,
    eta: new Date(now + 12 * 3600000).toISOString(),
    receiptCode: '627345', receiptScanned: false,
    progress: 0, weather: 'clear', notes: 'After current delivery completion'
  }
];

// Geofence zones
export const geofences = [
  { id: 'GF-001', name: 'KL Distribution Center', type: 'warehouse', lat: 3.1390, lng: 101.6869, radius: 500 },
  { id: 'GF-002', name: 'Bayan Lepas Warehouse', type: 'warehouse', lat: 5.4164, lng: 100.3327, radius: 500 },
  { id: 'GF-003', name: 'JB Hub', type: 'warehouse', lat: 1.4927, lng: 103.7414, radius: 400 },
  { id: 'GF-004', name: 'Ayer Keroh Depot', type: 'delivery', lat: 2.1896, lng: 102.2501, radius: 300 },
  { id: 'GF-005', name: 'Ipoh Central', type: 'warehouse', lat: 4.5975, lng: 101.0901, radius: 500 },
  { id: 'GF-006', name: 'Alor Setar Distribution', type: 'delivery', lat: 6.1248, lng: 100.3678, radius: 300 },
  { id: 'GF-007', name: 'Kuantan Port', type: 'warehouse', lat: 3.8024, lng: 103.3256, radius: 600 },
  { id: 'GF-008', name: 'KT Center', type: 'delivery', lat: 5.3117, lng: 103.1324, radius: 400 },
  { id: 'GF-009', name: 'Tapah Rest Stop', type: 'rest-stop', lat: 4.2000, lng: 101.2500, radius: 200 },
  { id: 'GF-010', name: 'Ayer Keroh Rest Area', type: 'rest-stop', lat: 2.3000, lng: 102.2000, radius: 200 },
  { id: 'GF-011', name: 'Seremban Hub', type: 'warehouse', lat: 2.7258, lng: 101.9424, radius: 500 },
  { id: 'GF-012', name: 'Shah Alam Fulfillment', type: 'warehouse', lat: 3.0733, lng: 101.5185, radius: 500 },
  { id: 'GF-013', name: 'Kajang Distribution', type: 'delivery', lat: 2.9909, lng: 101.7886, radius: 500 }
];

// Alerts
export const initialAlerts = [
  {
    id: 'ALT-001', type: 'delay', severity: 'high',
    driverId: 'DRV-002', deliveryId: 'DEL-1002',
    title: 'Delivery Significantly Delayed',
    message: 'Siti Nurhaliza is 45 minutes behind schedule on DEL-1002 (Medical Supplies to Melaka). Heavy rain on PLUS highway.',
    timestamp: new Date(now - 0.5 * 3600000).toISOString(),
    read: false, dismissed: false, actionTaken: null
  },
  {
    id: 'ALT-002', type: 'fuel', severity: 'critical',
    driverId: 'DRV-007', deliveryId: null,
    title: 'Critical Fuel Level',
    message: 'Diana Wong\'s truck (TRK-007) fuel at 12.5% — below safe threshold. Nearest fuel station: 8 miles.',
    timestamp: new Date(now - 1 * 3600000).toISOString(),
    read: false, dismissed: false, actionTaken: null
  },
  {
    id: 'ALT-003', type: 'rest', severity: 'medium',
    driverId: 'DRV-002', deliveryId: 'DEL-1002',
    title: 'Rest Break Overdue',
    message: 'Siti Nurhaliza has been driving for 5.8 hours without a proper rest break. Mandatory rest required after 4 hours.',
    timestamp: new Date(now - 0.3 * 3600000).toISOString(),
    read: false, dismissed: false, actionTaken: null
  },
  {
    id: 'ALT-004', type: 'fuel', severity: 'medium',
    driverId: 'DRV-002', deliveryId: 'DEL-1002',
    title: 'Low Fuel Warning',
    message: 'Siti Nurhaliza\'s truck (TRK-002) fuel at 25% — recommend refueling at next available station.',
    timestamp: new Date(now - 2 * 3600000).toISOString(),
    read: true, dismissed: false, actionTaken: null
  },
  {
    id: 'ALT-005', type: 'geofence', severity: 'low',
    driverId: 'DRV-003', deliveryId: 'DEL-1003',
    title: 'Driver Entered Rest Zone',
    message: 'Ravi Kumar entered the scheduled rest area near Ipoh. Rest timer started.',
    timestamp: new Date(now - 0.3 * 3600000).toISOString(),
    read: true, dismissed: false, actionTaken: null
  },
  {
    id: 'ALT-006', type: 'delay', severity: 'low',
    driverId: 'DRV-004', deliveryId: 'DEL-1004',
    title: 'Loading Taking Longer Than Expected',
    message: 'Chong Wei has been loading at Kuantan Port for 45 minutes (expected: 30 min).',
    timestamp: new Date(now - 0.8 * 3600000).toISOString(),
    read: true, dismissed: false, actionTaken: null
  }
];

// Weather data per region
export const weatherData = {
  'Kuala Lumpur': { condition: 'clear', temp: 32, icon: '☀️', impact: 0 },
  'Penang': { condition: 'clear', temp: 31, icon: '☀️', impact: 0 },
  'Johor Bahru': { condition: 'rain', temp: 28, icon: '🌧️', impact: 15 },
  'Melaka': { condition: 'rain', temp: 29, icon: '🌧️', impact: 15 },
  'Ipoh': { condition: 'clear', temp: 33, icon: '☀️', impact: 0 },
  'Alor Setar': { condition: 'clear', temp: 34, icon: '☀️', impact: 0 },
  'Kuantan': { condition: 'cloudy', temp: 30, icon: '☁️', impact: 5 },
  'Kuala Terengganu': { condition: 'cloudy', temp: 29, icon: '☁️', impact: 5 },
  'Seremban': { condition: 'clear', temp: 31, icon: '☀️', impact: 0 },
  'Shah Alam': { condition: 'clear', temp: 32, icon: '☀️', impact: 0 },
  'Kajang': { condition: 'partly-cloudy', temp: 31, icon: '⛅', impact: 3 }
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
