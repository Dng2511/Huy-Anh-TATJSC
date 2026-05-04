export const orderStatusColor = {
  'Cho xu ly': 'gold',
  'Dang van chuyen': 'processing',
  'Da giao': 'success',
  Huy: 'error',
}

export const vehicleStatusColor = {
  'San sang': 'green',
  'Dang hoat dong': 'blue',
  'Bao tri': 'orange',
}

export const driverStatusColor = {
  'San sang': 'green',
  'Dang lai xe': 'blue',
  'Nghi ca': 'orange',
}

export const orders = [
  {
    key: 'DH-1001',
    code: 'DH-1001',
    sender: 'Cong ty Minh Long',
    receiver: 'Sieu thi Hoa Binh',
    address: 'KCN Tan Binh, TP.HCM',
    cargoType: 'Linh kien dien tu',
    dimension: '2.2m x 1.6m x 1.4m',
    weight: '1200 kg',
    status: 'Cho xu ly',
    eta: '17:30 16/03/2026',
  },
  {
    key: 'DH-1002',
    code: 'DH-1002',
    sender: 'Kho Thu Duc',
    receiver: 'Nha may Son Ha',
    address: 'Quan 9, TP.HCM',
    cargoType: 'Vat lieu xay dung',
    dimension: '4.8m x 2.1m x 2.2m',
    weight: '5700 kg',
    status: 'Dang van chuyen',
    eta: '18:45 16/03/2026',
  },
  {
    key: 'DH-1003',
    code: 'DH-1003',
    sender: 'Cong ty VietFoods',
    receiver: 'Kho Da Nang',
    address: 'Lien Chieu, Da Nang',
    cargoType: 'Thuc pham dong lanh',
    dimension: '3.2m x 1.8m x 1.9m',
    weight: '2400 kg',
    status: 'Da giao',
    eta: '09:15 16/03/2026',
  },
  {
    key: 'DH-1004',
    code: 'DH-1004',
    sender: 'Noi that BlueHome',
    receiver: 'Showroom Binh Duong',
    address: 'Thu Dau Mot, Binh Duong',
    cargoType: 'Noi that go',
    dimension: '2.5m x 1.7m x 1.5m',
    weight: '1500 kg',
    status: 'Huy',
    eta: '-',
  },
]

export const vehicles = [
  {
    key: 'VH-01',
    plate: '51H-824.19',
    type: 'Xe tai',
    capacity: '8 tan',
    status: 'Dang hoat dong',
    fuel: 72,
    route: 'TP.HCM -> Binh Duong',
  },
  {
    key: 'VH-02',
    plate: '50C-112.68',
    type: 'Xe container',
    capacity: '25 tan',
    status: 'San sang',
    fuel: 91,
    route: 'Ben xe Mien Dong',
  },
  {
    key: 'VH-03',
    plate: '43F-902.31',
    type: 'Xe van',
    capacity: '1.5 tan',
    status: 'Bao tri',
    fuel: 38,
    route: 'Xuong bao duong Q7',
  },
]

export const drivers = [
  {
    key: 'DR-01',
    name: 'Nguyen Van Toan',
    license: 'FC',
    phone: '0903 121 889',
    status: 'Dang lai xe',
    schedule: '06:00 - 18:00',
    score: 96,
  },
  {
    key: 'DR-02',
    name: 'Tran Huu Phuc',
    license: 'C',
    phone: '0978 456 882',
    status: 'San sang',
    schedule: '08:00 - 17:00',
    score: 91,
  },
  {
    key: 'DR-03',
    name: 'Le Thi My',
    license: 'B2',
    phone: '0935 764 110',
    status: 'Nghi ca',
    schedule: 'Nghi den 18/03',
    score: 88,
  },
]

export const trips = [
  {
    key: 'TRIP-01',
    route: 'TP.HCM -> Binh Duong -> Dong Nai',
    vehicle: '51H-824.19',
    driver: 'Nguyen Van Toan',
    orders: ['DH-1002', 'DH-1005', 'DH-1010'],
    optimize: 'Gom don theo cum KCN, giam 13% quang duong rong',
    status: 'Dang chay',
  },
  {
    key: 'TRIP-02',
    route: 'Da Nang -> Hue',
    vehicle: '43F-902.31',
    driver: 'Tran Huu Phuc',
    orders: ['DH-1091', 'DH-1093'],
    optimize: 'Toi uu theo gio cao diem, tranh QL1A luc tan tam',
    status: 'Len lich',
  },
]

export const trackingVehicles = [
  {
    key: 'GPS-01',
    vehicle: '51H-824.19',
    location: '10.824N, 106.689E',
    eta: '34 phut',
    shipment: 'DH-1002',
    status: 'Dang van chuyen',
    history: 'Ben Cat -> Thu Duc -> KCN Song Than',
  },
  {
    key: 'GPS-02',
    vehicle: '50C-112.68',
    location: '10.788N, 106.731E',
    eta: '1 gio 10 phut',
    shipment: 'DH-1044',
    status: 'Cho xuat ben',
    history: 'Kho Tong -> Vanh Dai 3 -> QL13',
  },
  {
    key: 'GPS-03',
    vehicle: '43F-902.31',
    location: '16.061N, 108.232E',
    eta: 'Da den noi',
    shipment: 'DH-1093',
    status: 'Da giao',
    history: 'Hai Chau -> Cam Le -> Lien Chieu',
  },
]

export const inventory = [
  {
    key: 'WH-01',
    warehouse: 'Kho Tong Thu Duc',
    sku: 'LKDT-8921',
    product: 'Linh kien module',
    inbound: 480,
    outbound: 320,
    stock: 160,
    position: 'A2-03-14',
  },
  {
    key: 'WH-02',
    warehouse: 'Kho Da Nang',
    sku: 'VLXD-1129',
    product: 'Thanh thep hop',
    inbound: 930,
    outbound: 575,
    stock: 355,
    position: 'B1-09-02',
  },
  {
    key: 'WH-03',
    warehouse: 'Kho Mien Tay',
    sku: 'TPDL-6742',
    product: 'Dong lanh ca vien',
    inbound: 260,
    outbound: 240,
    stock: 20,
    position: 'C4-LANH-08',
  },
]

export const costRows = [
  {
    key: 'COST-01',
    trip: 'TRIP-01',
    fuel: 4800000,
    toll: 950000,
    shippingFee: 12600000,
    driverCost: 1800000,
  },
  {
    key: 'COST-02',
    trip: 'TRIP-02',
    fuel: 2600000,
    toll: 420000,
    shippingFee: 6800000,
    driverCost: 1450000,
  },
]

export const invoices = [
  {
    key: 'INV-01',
    invoiceNo: 'INV-2026-0316-01',
    customer: 'Sieu thi Hoa Binh',
    amount: 4850000,
    payment: 'Da thanh toan',
    channel: 'Chuyen khoan',
    date: '16/03/2026',
  },
  {
    key: 'INV-02',
    invoiceNo: 'INV-2026-0316-02',
    customer: 'Nha may Son Ha',
    amount: 9200000,
    payment: 'Cho thanh toan',
    channel: 'Cong no 30 ngay',
    date: '16/03/2026',
  },
  {
    key: 'INV-03',
    invoiceNo: 'INV-2026-0315-09',
    customer: 'BlueHome',
    amount: 3150000,
    payment: 'Da hoan tien',
    channel: 'Vi dien tu',
    date: '15/03/2026',
  },
]

export const users = [
  {
    key: 'USR-01',
    name: 'Hoang Minh Quan',
    role: 'Admin',
    access: 'Toan quyen cau hinh + phan quyen',
    status: 'Hoat dong',
  },
  {
    key: 'USR-02',
    name: 'Nguyen Thuy Linh',
    role: 'Dieu phoi van tai',
    access: 'Quan ly don, xe, phan cong chuyen',
    status: 'Hoat dong',
  },
  {
    key: 'USR-03',
    name: 'Pham Van Tien',
    role: 'Tai xe',
    access: 'Xem lich trinh va cap nhat giao hang',
    status: 'Dang nghi phep',
  },
  {
    key: 'USR-04',
    name: 'Cong ty Son Ha',
    role: 'Khach hang',
    access: 'Theo doi don hang va lich su thanh toan',
    status: 'Hoat dong',
  },
]

export const metrics = {
  totalOrdersToday: 52,
  activeVehicles: 17,
  deliveringOrders: 29,
  revenueToday: 142700000,
  activeTrips: 14,
  avgDriverPerformance: 92,
  operationCostRate: 64,
}

export const mapMarkers = [
  { id: 'M1', left: '16%', top: '36%', vehicle: '51H-824.19' },
  { id: 'M2', left: '43%', top: '57%', vehicle: '50C-112.68' },
  { id: 'M3', left: '73%', top: '33%', vehicle: '43F-902.31' },
]

export const pageMeta = {
  dashboard: {
    title: 'Dashboard',
    description: 'Tong quan KPI va dieu huong nhanh den tung module.',
  },
  orders: {
    title: 'Quan ly don van chuyen',
    description: 'Theo doi va thao tac voi danh sach don hang.',
  },
  vehicles: {
    title: 'Quan ly phuong tien',
    description: 'Thong tin xe, tai trong va tinh trang khai thac.',
  },
  drivers: {
    title: 'Quan ly tai xe',
    description: 'Nhan su lai xe, bang lai va lich trinh.',
  },
  trips: {
    title: 'Phan cong chuyen di',
    description: 'Gan don cho xe va tai xe, theo doi toi uu tuyen.',
  },
  tracking: {
    title: 'Theo doi van chuyen',
    description: 'Theo doi vi tri GPS, ETA va lich su di chuyen.',
  },
  warehouse: {
    title: 'Quan ly kho hang',
    description: 'Nhap xuat ton va vi tri luu tru hang hoa.',
  },
  costs: {
    title: 'Quan ly chi phi',
    description: 'Tong hop nhien lieu, cau duong va chi phi tai xe.',
  },
  billing: {
    title: 'Thanh toan va hoa don',
    description: 'Hoa don, thanh toan va lich su giao dich.',
  },
  reports: {
    title: 'Bao cao va thong ke',
    description: 'Phan tich hieu suat, doanh thu va chi phi van hanh.',
  },
  users: {
    title: 'Nguoi dung va phan quyen',
    description: 'Quan ly vai tro Admin, Dieu phoi, Tai xe, Khach hang.',
  },
}

export const menuItems = [
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'orders', label: 'Don van chuyen' },
  { key: 'vehicles', label: 'Phuong tien' },
  { key: 'drivers', label: 'Tai xe' },
  { key: 'trips', label: 'Phan cong chuyen' },
  { key: 'tracking', label: 'Tracking GPS' },
  { key: 'warehouse', label: 'Kho hang' },
  { key: 'costs', label: 'Chi phi' },
  { key: 'billing', label: 'Thanh toan' },
  { key: 'reports', label: 'Bao cao' },
  { key: 'users', label: 'Nguoi dung' },
]

export const formatCurrency = (value) =>
  `${new Intl.NumberFormat('vi-VN').format(value)} VND`
