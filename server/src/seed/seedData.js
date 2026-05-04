export const seedData = {
  orders: [
    {
      code: 'DH-1001',
      sender: 'Cong ty Minh Long',
      receiver: 'Sieu thi Hoa Binh',
      address: 'KCN Tan Binh, TP.HCM',
      cargoType: 'Linh kien dien tu',
      dimension: '2.2m x 1.6m x 1.4m',
      weight: '1200 kg',
      status: 'Cho xu ly',
      eta: '17:30 16/03/2026'
    },
    {
      code: 'DH-1002',
      sender: 'Kho Thu Duc',
      receiver: 'Nha may Son Ha',
      address: 'Quan 9, TP.HCM',
      cargoType: 'Vat lieu xay dung',
      dimension: '4.8m x 2.1m x 2.2m',
      weight: '5700 kg',
      status: 'Dang van chuyen',
      eta: '18:45 16/03/2026'
    },
    {
      code: 'DH-1003',
      sender: 'Cong ty VietFoods',
      receiver: 'Kho Da Nang',
      address: 'Lien Chieu, Da Nang',
      cargoType: 'Thuc pham dong lanh',
      dimension: '3.2m x 1.8m x 1.9m',
      weight: '2400 kg',
      status: 'Da giao',
      eta: '09:15 16/03/2026'
    }
  ],
  vehicles: [
    {
      plate: '51H-824.19',
      type: 'Xe tai',
      capacity: '8 tan',
      status: 'Dang hoat dong',
      fuel: 72,
      route: 'TP.HCM -> Binh Duong'
    },
    {
      plate: '50C-112.68',
      type: 'Xe container',
      capacity: '25 tan',
      status: 'San sang',
      fuel: 91,
      route: 'Ben xe Mien Dong'
    }
  ],
  drivers: [
    {
      name: 'Nguyen Van Toan',
      license: 'FC',
      phone: '0903 121 889',
      status: 'Dang lai xe',
      schedule: '06:00 - 18:00',
      score: 96
    },
    {
      name: 'Tran Huu Phuc',
      license: 'C',
      phone: '0978 456 882',
      status: 'San sang',
      schedule: '08:00 - 17:00',
      score: 91
    }
  ],
  trips: [
    {
      route: 'TP.HCM -> Binh Duong -> Dong Nai',
      vehicle: '51H-824.19',
      driver: 'Nguyen Van Toan',
      orders: ['DH-1002', 'DH-1005', 'DH-1010'],
      optimize: 'Gom don theo cum KCN, giam 13% quang duong rong',
      status: 'Dang chay'
    }
  ],
  tracking: [
    {
      vehicle: '51H-824.19',
      location: '10.824N, 106.689E',
      eta: '34 phut',
      shipment: 'DH-1002',
      status: 'Dang van chuyen',
      history: 'Ben Cat -> Thu Duc -> KCN Song Than'
    }
  ],
  inventory: [
    {
      warehouse: 'Kho Tong Thu Duc',
      sku: 'LKDT-8921',
      product: 'Linh kien module',
      inbound: 480,
      outbound: 320,
      stock: 160,
      position: 'A2-03-14'
    }
  ],
  costs: [
    {
      trip: 'TRIP-01',
      fuel: 4800000,
      toll: 950000,
      shippingFee: 12600000,
      driverCost: 1800000
    }
  ],
  invoices: [
    {
      invoiceNo: 'INV-2026-0316-01',
      customer: 'Sieu thi Hoa Binh',
      amount: 4850000,
      payment: 'Da thanh toan',
      channel: 'Chuyen khoan',
      date: '16/03/2026'
    }
  ],
  users: [
    {
      name: 'Hoang Minh Quan',
      role: 'Admin',
      access: 'Toan quyen cau hinh + phan quyen',
      status: 'Hoat dong'
    },
    {
      name: 'Nguyen Thuy Linh',
      role: 'Dieu phoi van tai',
      access: 'Quan ly don, xe, phan cong chuyen',
      status: 'Hoat dong'
    }
  ],
  metrics: [
    {
      totalOrdersToday: 52,
      activeVehicles: 17,
      deliveringOrders: 29,
      revenueToday: 142700000,
      activeTrips: 14,
      avgDriverPerformance: 92,
      operationCostRate: 64
    }
  ]
}
