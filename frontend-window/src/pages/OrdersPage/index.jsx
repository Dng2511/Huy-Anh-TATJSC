import { Badge, Card, Select, Table, Tag, Typography, message, Pagination, Col, Row, Button, Drawer, Descriptions, Modal } from 'antd'
import { ArrowRightOutlined } from '@ant-design/icons'; import { useEffect, useMemo, useRef, useState } from 'react'
import { CircleMarker, MapContainer, Marker, Polyline, Popup, TileLayer, useMap } from 'react-leaflet'
import formatLicensePlate from '../../utils/formatLicensePlate'
import { getGpsStatus, getMarkerColors } from '../../utils/gpsHelpers'
import { createGateSquareIcon, createVehicleIcon } from '../../utils/mapIcons'
import { fitMapToCoordinates } from '../../utils/mapHelpers'
import orderApi from '../../services/Api/orderApi'
import partnerApi from '../../services/Api/partnerApi'
import vehicleApi from '../../services/Api/vehicleApi'
import gateApi from '../../services/Api/gateApi'
import useBulkRowDelete from '../../hooks/useBulkRowDelete'
import BulkDeleteButton from '../../components/BulkDeleteButton'
import 'leaflet/dist/leaflet.css'
import './OrdersPage.css'
import CreateOrderModal from './CreateOrderModal'
import VehicleTimeline from './VehicleTimeline'

const { Text, Title } = Typography

const DEFAULT_CENTER = [21.0, 105.5]
const DEFAULT_ZOOM = 6
const SELECTED_ZOOM = 15

const orderStatusColor = {
  planned: '#faad14',
  waiting: '#faad14',
  running: '#1890ff',
  delivering: '#1890ff',
  unloading: '#18ff27',
  completed: '#52c41a',
  cancelled: '#f5222d',
}

const statusDisplayName = {
  planned: 'Kế hoạch',
  running: 'Đang đến lấy hàng',
  waiting: 'Đang chờ hàng',
  delivering: 'Đang giao hàng',
  unloading: 'Đang dỡ hàng',
  completed: 'Hoàn thành',
  cancelled: 'Hủy',
};

const monthOptions = [
  { value: 1, label: 'Tháng 1' },
  { value: 2, label: 'Tháng 2' },
  { value: 3, label: 'Tháng 3' },
  { value: 4, label: 'Tháng 4' },
  { value: 5, label: 'Tháng 5' },
  { value: 6, label: 'Tháng 6' },
  { value: 7, label: 'Tháng 7' },
  { value: 8, label: 'Tháng 8' },
  { value: 9, label: 'Tháng 9' },
  { value: 10, label: 'Tháng 10' },
  { value: 11, label: 'Tháng 11' },
  { value: 12, label: 'Tháng 12' },
]

const currentYear = new Date().getFullYear()
const yearOptions = Array.from({ length: currentYear - 2019 }, (_, index) => currentYear - index)

function getDisTance(lat1, lon1, lat2, lon2) {
  const R = 6371;

  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;

  const rLat1 = lat1 * Math.PI / 180;
  const rLat2 = lat2 * Math.PI / 180;

  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(rLat1) * Math.cos(rLat2) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.asin(Math.sqrt(a));

  return parseInt(R * c);
}

function formatArrivalTime(date) {
  const now = new Date();

  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  const time = date.toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
  });

  if (isToday) return `${time} hôm nay`;

  const day = date.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
  });

  return `${time} ${day}`;
}

function getEtaText(distanceKm, speed) {
  if (!speed || speed <= 5) return 'chưa xác định';

  const minutes = Math.round((distanceKm / speed) * 60);
  const totalTime = minutes + Math.floor(minutes / 720) * 180; // add 3 hours for every 12 hours of travel
  const arrival = new Date(Date.now() + totalTime * 60 * 1000);

  return formatArrivalTime(arrival);
}

function getWaitingDepartureTime(order) {
  if (!order.updatedAt) return 'chưa xác định';

  // ví dụ: sau khi waiting 2 tiếng thì dự kiến khởi hành
  const WAITING_HOURS = 2;

  const departure = new Date(order.updatedAt);
  departure.setHours(departure.getHours() + WAITING_HOURS);

  return formatArrivalTime(departure);
}

function getOrderStatusText(order, gates, vehicles, speed) {
  const vehicle = vehicles.find(v => v._id === order.vehicle?._id);

  if (order.status === 'running') {
    const pickupGate = gates.find(g => g._id === order.pickup?._id);

    if (!vehicle?.tracking || !pickupGate?.locate) {
      return 'Đang đến điểm lấy hàng';
    }

    if (vehicle?.tracking?.liveStatus === 'Mất kết nối') {
      return 'Đang đến điểm lấy hàng, mất kết nối GPS';
    }

    const distance = getDisTance(
      vehicle.tracking.lat,
      vehicle.tracking.lng,
      pickupGate.locate.lat,
      pickupGate.locate.lng
    );

    const eta = getEtaText(distance, speed || 40);

    return `Đang đến lấy hàng, cách điểm lấy hàng ${distance} km, dự kiến đến điểm nhận vào \n${eta}`;
  }

  if (order.status === 'planned') {
    return 'Chưa khởi hành, dự kiến khởi hành vào ngày ' + formatArrivalTime(new Date(order.orderDate));
  }

  if (order.status === 'waiting') {
    return `Đang chờ hàng, dự kiến khởi hành \n${getWaitingDepartureTime(order)}`;
  }

  if (order.status === 'delivering') {
    const deliveryGate = gates.find(g => g._id === order.delivery?._id);

    if (!vehicle?.tracking || !deliveryGate?.locate) {
      return 'Đang giao hàng';
    }

    if (vehicle?.tracking?.liveStatus === 'Mất kết nối') {
      return 'Đang giao hàng, mất kết nối GPS';
    }

    const distance = getDisTance(
      vehicle.tracking.lat,
      vehicle.tracking.lng,
      deliveryGate.locate.lat,
      deliveryGate.locate.lng
    );

    const eta = getEtaText(distance, speed || 40);

    return `Đang giao hàng, cách điểm nhận hàng ${distance} km, dự kiến đến điểm giao vào \n${eta}`;
  }

  if (order.status === 'unloading') {
    return `Đang dỡ hàng, dự kiến hoàn thành vào \n${getWaitingDepartureTime(order)}`;
  }

  if (order.status === 'completed') {
    return 'Đã hoàn thành';
  }

  return statusDisplayName[order.status] || order.status;
}

// GPS helpers imported from src/utils/gpsHelpers

function OrderMapController({ coordinates, selectedOrder }) {
  const map = useMap()
  const hasSetInitialViewRef = useRef(false)

  useEffect(() => {
    // If an order is selected, fit to the coordinates (pickup/delivery from coordinates prop)
    if (selectedOrder && coordinates && coordinates.length >= 2) {
      const validCoordinates = coordinates.filter((c) => Number.isFinite(c.lat) && Number.isFinite(c.lng))
      if (validCoordinates.length >= 2) {
        map.fitBounds(validCoordinates.map((c) => [c.lat, c.lng]), { padding: [50, 50] })
      }
      return
    }

    // Otherwise fit to provided coordinates (vehicles + gates)
    if (hasSetInitialViewRef.current) return
    const validCoordinates = (coordinates || []).filter((c) => Number.isFinite(c.lat) && Number.isFinite(c.lng))
    fitMapToCoordinates(map, validCoordinates, { fallbackCenter: DEFAULT_CENTER, fallbackZoom: DEFAULT_ZOOM, singleZoom: SELECTED_ZOOM })
    hasSetInitialViewRef.current = true
  }, [map, selectedOrder, coordinates])

  return null
}

function OrderMapSizeController({ dependencies = [] }) {
  const map = useMap()

  useEffect(() => {
    const frameId = requestAnimationFrame(() => {
      map.invalidateSize()
    })

    return () => cancelAnimationFrame(frameId)
  }, [map, ...dependencies])

  return null
}

function OrdersPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [partners, setPartners] = useState([])
  const [partnersFull, setPartnersFull] = useState([])
  const [searchPartner, setSearchPartner] = useState(null)
  const [createModalVisible, setCreateModalVisible] = useState(false)
  const [createModalInitial, setCreateModalInitial] = useState(null)
  const [searchMonth, setSearchMonth] = useState(null)
  const [searchYear, setSearchYear] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(8)
  const [totalItems, setTotalItems] = useState(0)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [gates, setGates] = useState([])
  const [vehicles, setVehicles] = useState([])
  const [vehicleLocation, setVehicleLocation] = useState(null)
  const [routeCoords, setRouteCoords] = useState(null)
  const vehicleMarkerRefs = useRef({})
  const [averageSpeed, setAverageSpeed] = useState(40)

  const selectedOrderCoordinates = useMemo(() => {
    if (!selectedOrder) return []

    const coords = []
    const pickupGate = gates.find((g) => g._id === selectedOrder.pickup?._id)
    const deliveryGate = gates.find((g) => g._id === selectedOrder.delivery?._id)

    if (pickupGate?.locate?.lat && pickupGate?.locate?.lng) {
      coords.push({ lat: Number(pickupGate.locate.lat), lng: Number(pickupGate.locate.lng) })
    }
    if (deliveryGate?.locate?.lat && deliveryGate?.locate?.lng) {
      coords.push({ lat: Number(deliveryGate.locate.lat), lng: Number(deliveryGate.locate.lng) })
    }

    return coords
  }, [gates, selectedOrder])

  const allMapCoordinates = useMemo(() => {
    const coords = []

    gates.forEach((g) => {
      const lat = Number(g?.locate?.lat)
      const lng = Number(g?.locate?.lng)
      if (Number.isFinite(lat) && Number.isFinite(lng)) coords.push({ lat, lng })
    })

    vehicles.forEach((v) => {
      const lat = Number(v?.tracking?.lat)
      const lng = Number(v?.tracking?.lng)
      if (Number.isFinite(lat) && Number.isFinite(lng)) coords.push({ lat, lng })
    })

    return coords
  }, [gates, vehicles])

  const fetchGates = async () => {
    try {
      const response = await gateApi.getGates()
      const gateList = Array.isArray(response) ? response : response?.data || []
      setGates(gateList)
    } catch (error) {
      console.error('Error fetching gates:', error)
    }
  }

  const fetchPartners = async () => {
    try {
      const response = await partnerApi.getPartners()
      const list = Array.isArray(response) ? response : response?.data || []
      setPartnersFull(list)
    } catch (err) {
      console.error('Error fetching partners list:', err)
    }
  }

  const fetchVehicles = async () => {
    try {
      const response = await vehicleApi.getVehicles()
      const vehicleList = Array.isArray(response) ? response : response?.data || []
      setVehicles(vehicleList)
    } catch (error) {
      console.error('Error fetching vehicles:', error)
    }
  }

  const fetchVehicleLocation = async (vehicleId) => {
    if (!vehicleId) return
    try {
      const vehicles = await vehicleApi.getVehicles()
      const vehicleList = Array.isArray(vehicles) ? vehicles : vehicles?.data || []
      const vehicle = vehicleList.find((v) => v._id === vehicleId)
      if (vehicle) {
        setVehicleLocation({
          lat: Number(vehicle?.tracking?.lat),
          lng: Number(vehicle?.tracking?.lng),
          licensePlate: vehicle?.licensePlate,
        })
      }
    } catch (error) {
      console.error('Error fetching vehicle location:', error)
    }
  }

  const fetchRoute = async (pickupLocate, deliveryLocate) => {
    // Clear old route immediately while loading new one
    setRouteCoords(null)

    if (!pickupLocate || !deliveryLocate) {
      return
    }

    const lat1 = Number(pickupLocate.lat)
    const lng1 = Number(pickupLocate.lng)
    const lat2 = Number(deliveryLocate.lat)
    const lng2 = Number(deliveryLocate.lng)

    if (!Number.isFinite(lat1) || !Number.isFinite(lng1) || !Number.isFinite(lat2) || !Number.isFinite(lng2)) {
      return
    }

    try {
      const url = `https://router.project-osrm.org/route/v1/driving/${lng1},${lat1};${lng2},${lat2}?overview=full&geometries=geojson&annotations=true`
      const resp = await fetch(url)
      const data = await resp.json()
      if (data && data.routes && data.routes.length) {
        const coords = data.routes[0].geometry.coordinates.map((c) => [c[1], c[0]])
        setRouteCoords(coords)
        return
      }
    } catch (err) {
      console.error('Error fetching route from OSRM:', err)
    }

    // fallback: straight line
    setRouteCoords([
      [lat1, lng1],
      [lat2, lng2],
    ])
  }

  const fetchOrders = async (page = 1, partner = null, month = null, year = null) => {
    try {
      const params = {
        page,
        limit: pageSize,
        ...(partner && { partner }),
        ...(month && { month }),
        ...(year && { year }),
      }

      const response = await orderApi.getOrders(params)
      const data = response?.data || response || {}
      const itemsList = data?.items || []

      setOrders(itemsList)
      setTotalItems(data?.pagination?.totalItems || itemsList.length)
      setCurrentPage(page)

      // Extract unique partners for filter dropdown
      if (itemsList.length > 0) {
        const uniquePartners = [...new Set(itemsList.map((order) => order.partner?._id))]
          .map((id) => {
            const order = itemsList.find((o) => o.partner?._id === id)
            return {
              id,
              name: order.partner?.name,
            }
          })
        setPartners(uniquePartners)
      }
    } catch (error) {
      console.error('Error fetching orders:', error)
      message.error('Lỗi khi tải danh sách đơn hàng')
    } finally {
      setLoading(false)
    }
  }

  const {
    selectedRowKeys,
    rowSelection,
    handleDeleteSelected,
  } = useBulkRowDelete({
    deleteItems: (ids) => orderApi.deleteOrders(ids),
    onDeleted: async () => {
      setSelectedOrder(null)
      await fetchOrders(1, searchPartner, searchMonth, searchYear)
    },
    getEmptyMessage: () => 'Vui lòng chọn đơn hàng cần xóa',
    getConfirmMessage: () => 'Bạn có chắc chắn muốn xóa các đơn hàng đã chọn?',
    getErrorMessage: () => 'Lỗi khi xóa đơn hàng',
    setLoading,
    confirmTitle: 'Xác nhận xóa đơn hàng',
    confirmOkText: 'Xóa',
    confirmCancelText: 'Hủy',
  })

  const fetchAverageSpeed = async () => {
    try {
      const response = await vehicleApi.getAverageSpeed()
      const averageSpeedValue = response?.averageSpeed || 40
      setAverageSpeed(averageSpeedValue)
    } catch (error) {
      console.error('Error fetching average speed:', error)
    }
  }

  useEffect(() => {
    // initial load
    fetchOrders(currentPage, searchPartner, searchMonth, searchYear)
    fetchGates()
    fetchVehicles()
    fetchPartners()
    fetchAverageSpeed()
  }, [])

  // When an order is created elsewhere (CreateOrderModal via context), refresh list
  useEffect(() => {
    const handleOrderCreated = () => {
      fetchOrders(1, searchPartner, searchMonth, searchYear)
    }

    window.addEventListener('order:created', handleOrderCreated)
    return () => window.removeEventListener('order:created', handleOrderCreated)
  }, [searchPartner, searchMonth, searchYear])

  useEffect(() => {
    // Refresh vehicles periodically
    const intervalId = setInterval(() => {
      fetchVehicles()
      fetchOrders(currentPage, searchPartner, searchMonth, searchYear)
    }, 5000)

    return () => clearInterval(intervalId)
  }, [currentPage, searchPartner, searchMonth, searchYear])

  useEffect(() => {
    // when selected order changes, fetch route
    if (!selectedOrder) {
      setVehicleLocation(null)
      setRouteCoords(null)
      return
    }

    setVehicleLocation(null)

    // Find pickup and delivery gates from the gates array
    const pickupGate = gates.find((g) => g._id === selectedOrder.pickup?._id)
    const deliveryGate = gates.find((g) => g._id === selectedOrder.delivery?._id)

    if (pickupGate?.locate && deliveryGate?.locate) {
      fetchRoute(pickupGate.locate, deliveryGate.locate)
    } else {
      setRouteCoords(null)
    }
  }, [selectedOrder, gates])

  useEffect(() => {
    if (!selectedOrder?.vehicle?._id) return

    const intervalId = setInterval(() => {
      fetchVehicleLocation(selectedOrder.vehicle._id)
    }, 5000)

    return () => clearInterval(intervalId)
  }, [selectedOrder?.vehicle?._id])

  useEffect(() => {
    const selectedVehicleId = selectedOrder?.vehicle?._id

    Object.values(vehicleMarkerRefs.current).forEach((marker) => {
      marker?.closePopup?.()
    })

    if (!selectedVehicleId) return

    vehicleMarkerRefs.current[selectedVehicleId]?.openPopup?.()
  }, [selectedOrder?.vehicle?._id, vehicles])

  const handleFilterPartner = (value) => {
    setSearchPartner(value || null)
    fetchOrders(1, value || null, searchMonth, searchYear)
  }

  const handleFilterMonth = (value) => {
    setSearchMonth(value || null)
    fetchOrders(1, searchPartner, value || null, searchYear)
  }

  const handleFilterYear = (value) => {
    setSearchYear(value || null)
    fetchOrders(1, searchPartner, searchMonth, value || null)
  }

  const handlePageChange = (page) => {
    fetchOrders(page, searchPartner, searchMonth, searchYear)
  }

  const handleRowClick = (record) => {
    setSelectedOrder(record)
  }
  return (
    <Card className="module-card orders-page-card">
      <Row gutter={[16, 16]} align="stretch">
        <Col xs={24} lg={16}>
          <div className="orders-panel orders-table-panel">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <Title level={4} className="orders-section-title" style={{ margin: 0 }}>
                {'Danh sách đơn hàng'}
              </Title>
              <div>
                <Button type="primary" onClick={() => setCreateModalVisible(true)}>Tạo đơn mới</Button>
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '12px',
                }}
              >
                <div>
                  <Text style={{ display: 'block', marginBottom: '6px', fontWeight: 500 }}>
                    Khách hàng
                  </Text>
                  <Select
                    placeholder="Chọn khách hàng"
                    allowClear
                    value={searchPartner}
                    onChange={handleFilterPartner}
                    options={partners.map((p) => ({ label: p.name, value: p.id }))}
                    style={{ width: '100%' }}
                  />
                </div>

                <div>
                  <Text style={{ display: 'block', marginBottom: '6px', fontWeight: 500 }}>
                    Thời gian
                  </Text>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '12px' }}>
                    <Select
                      placeholder="Chọn tháng"
                      allowClear
                      value={searchMonth}
                      onChange={handleFilterMonth}
                      options={monthOptions}
                      style={{ width: '100%' }}
                    />

                    <Select
                      placeholder="Chọn năm"
                      allowClear
                      value={searchYear}
                      onChange={handleFilterYear}
                      options={yearOptions.map((year) => ({
                        value: year,
                        label: `${year}`,
                      }))}
                      style={{ width: '100%' }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <Table
              rowKey="_id"
              dataSource={orders}
              loading={loading}
              pagination={false}
              onRow={(record) => ({
                onClick: (event) => {
                  const target = event?.target
                  if (target?.closest?.('button, input, label, .ant-checkbox-wrapper, .ant-btn, .ant-dropdown-trigger')) {
                    return
                  }
                  handleRowClick(record)
                },
              })}
              rowSelection={rowSelection}
              rowClassName={(record) => (selectedOrder?._id === record._id ? 'selected-row' : '')}
              columns={[
                {
                  title: 'ID',
                  dataIndex: '_id',
                  width: 50,
                  render: (id) => id.slice(-6).toUpperCase(),
                },
                {
                  title: 'Tuyến',
                  width: 150,
                  render: (_, record) => (
                    <div className="flex flex-col gap-2">
                      <div className="font-medium">
                        {record.pickup?.name || '-'}
                      </div>

                      <div className="text-gray-500 text-sm flex items-center gap-1">
                        {record.delivery?.name || '-'}
                      </div>
                    </div>
                  ),
                },
                {
                  title: 'Trạng thái',
                  dataIndex: 'status',
                  width: 140,
                  render: (_, record) => (
                    <Tag
                      color={orderStatusColor[record.status]}
                      style={{ whiteSpace: 'pre-line' }}
                    >
                      {getOrderStatusText(record, gates, vehicles, averageSpeed)}
                    </Tag>
                  ),
                },
                {
                  title: 'Xe',
                  dataIndex: ['vehicle'],
                  width: 100,
                  render: (vehicle) => {
                    if (!vehicle) return '-'
                    return `${formatLicensePlate(vehicle.licensePlate)}`
                  },
                },
                {
                  title: 'Cuớc nhận',
                  dataIndex: 'cost',
                  width: 120,
                  render: (cost) => {
                    if (!Number.isFinite(Number(cost))) return '0'
                    return `${cost}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                  }
                },
                {
                  title: 'Hành động',
                  key: 'actions',
                  width: 100,
                  render: (_, record) => (
                    <Button size="small" onClick={() => {
                      setCreateModalInitial(record)
                      setCreateModalVisible(true)
                    }}>Xem chi tiết</Button>
                  ),
                },
              ]}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
              <div style={{ paddingTop: 60 }}>
                <BulkDeleteButton
                  selectedRowKeys={selectedRowKeys}
                  onClick={handleDeleteSelected}
                  label="Xóa đơn hàng"
                />
              </div>

              <Pagination
                current={currentPage}
                pageSize={pageSize}
                total={totalItems}
                onChange={handlePageChange}
                showTotal={(total) => `Tổng ${total} đơn hàng`}
              />
            </div>
          </div>
        </Col>

        <Col xs={24} lg={8}>
          <div className="orders-panel orders-map-panel">
            <Title level={4} className="orders-section-title">
              {'Bản đồ lộ trình'}
            </Title>
            <MapContainer
              center={DEFAULT_CENTER}
              zoom={DEFAULT_ZOOM}
              scrollWheelZoom
              className="orders-map"
              maxZoom={19}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              <OrderMapSizeController dependencies={[selectedOrder?._id, gates.length, vehicles.length]} />
              <OrderMapController
                coordinates={selectedOrder ? selectedOrderCoordinates : allMapCoordinates}
                selectedOrder={selectedOrder}
              />

              {/* All gates */}
              {gates.map((gate) => {
                const lat = Number(gate?.locate?.lat)
                const lng = Number(gate?.locate?.lng)
                if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null
                return (
                  <Marker key={gate._id} position={[lat, lng]} icon={createGateSquareIcon(false)}>
                    <Popup>
                      <div className="order-popup">
                        <Text strong>{gate.name}</Text>
                        <br />
                        <Text>{gate.location}</Text>
                      </div>
                    </Popup>
                  </Marker>
                )
              })}

              {/* All vehicles */}
              {vehicles.map((vehicle) => {
                const lat = Number(vehicle?.tracking?.lat)
                const lng = Number(vehicle?.tracking?.lng)
                if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null
                const isSelected = selectedOrder?.vehicle?._id === vehicle._id
                const markerColors = getMarkerColors(vehicle)
                const selectedColor = '#ff7a45'

                return (
                  <CircleMarker
                    key={vehicle._id}
                    ref={(marker) => {
                      if (marker) {
                        vehicleMarkerRefs.current[vehicle._id] = marker
                      } else {
                        delete vehicleMarkerRefs.current[vehicle._id]
                      }
                    }}
                    center={[lat, lng]}
                    radius={isSelected ? 12 : 8}
                    pathOptions={{
                      color: isSelected ? selectedColor : markerColors.stroke,
                      fillColor: isSelected ? selectedColor : markerColors.fill,
                      fillOpacity: isSelected ? 1 : 0.8,
                      weight: isSelected ? 3 : 2,
                    }}
                  >
                    <Popup>
                      <div className="order-popup">
                        <Text strong>{formatLicensePlate(vehicle.licensePlate)}</Text>
                        <br />
                        <Text>Người lái: {vehicle.driver?.name || 'Chưa xác định'}</Text>
                        <br />
                        <Text>GPS: {getGpsStatus(vehicle)}</Text>
                        <br />
                        <Text>Vĩ độ: {vehicle.tracking?.lat}</Text>
                        <br />
                        <Text>Kinh độ: {vehicle.tracking?.lng}</Text>
                        <br />
                        <Text>Tốc độ: {vehicle.tracking.speed} km/h</Text>
                        <br />
                        <Text>Địa chỉ: {vehicle.tracking.address}</Text>
                      </div>
                    </Popup>
                  </CircleMarker>
                )
              })}

              {/* Selected order overlays */}
              {selectedOrder && (() => {
                const pickupGate = gates.find((g) => g._id === selectedOrder.pickup?._id)
                const deliveryGate = gates.find((g) => g._id === selectedOrder.delivery?._id)

                if (!pickupGate?.locate || !deliveryGate?.locate) return null

                return (
                  <>
                    <Marker
                      position={[Number(pickupGate.locate.lat), Number(pickupGate.locate.lng)]}
                      icon={createGateSquareIcon(true)}
                    >
                      <Popup>
                        <div className="order-popup">
                          <Text strong>Lấy hàng</Text>
                          <br />
                          <Text>{selectedOrder.pickup.name}</Text>
                        </div>
                      </Popup>
                    </Marker>

                    <Marker
                      position={[Number(deliveryGate.locate.lat), Number(deliveryGate.locate.lng)]}
                      icon={createGateSquareIcon(true)}
                    >
                      <Popup>
                        <div className="order-popup">
                          <Text strong>Giao hàng</Text>
                          <br />
                          <Text>{selectedOrder.delivery.name}</Text>
                        </div>
                      </Popup>
                    </Marker>

                    {routeCoords && routeCoords.length ? (
                      <Polyline positions={routeCoords} color="#0066cc" weight={4} opacity={0.95} />
                    ) : (
                      <Polyline
                        positions={[
                          [Number(pickupGate.locate.lat), Number(pickupGate.locate.lng)],
                          [Number(deliveryGate.locate.lat), Number(deliveryGate.locate.lng)],
                        ]}
                        color="#0066cc"
                        weight={6}
                        opacity={1}
                      />
                    )}

                    {vehicleLocation && Number.isFinite(vehicleLocation.lat) && Number.isFinite(vehicleLocation.lng) && (
                      (() => {
                        const currentVehicle = vehicles.find((v) => v._id === selectedOrder?.vehicle?._id)
                        const isSelectedVehicle = Boolean(selectedOrder?.vehicle?._id)
                        const colors = currentVehicle ? getMarkerColors(currentVehicle) : { stroke: '#0958d9', fill: '#1677ff' }
                        if (isSelectedVehicle) {
                          return (
                            <CircleMarker
                              center={[vehicleLocation.lat, vehicleLocation.lng]}
                              radius={12}
                              pathOptions={{ color: '#ff7a45', fillColor: '#ff7a45', fillOpacity: 1, weight: 3 }}
                            >
                              <Popup>
                                <div className="order-popup">
                                  <Text strong>Xe</Text>
                                  <br />
                                  <Text>{vehicleLocation.licensePlate}</Text>
                                </div>
                              </Popup>
                            </CircleMarker>
                          )
                        }

                        return (
                          <CircleMarker
                            center={[vehicleLocation.lat, vehicleLocation.lng]}
                            radius={8}
                            pathOptions={{ color: colors.stroke, fillColor: colors.fill, fillOpacity: 0.8, weight: 2 }}
                          >
                            <Popup>
                              <div className="order-popup">
                                <Text strong>Xe</Text>
                                <br />
                                <Text>{vehicleLocation.licensePlate}</Text>
                              </div>
                            </Popup>
                          </CircleMarker>
                        )
                      })()
                    )}
                  </>
                )
              })()}
            </MapContainer>
          </div>
        </Col>
      </Row>

      <CreateOrderModal
        visible={createModalVisible}
        initialParams={createModalInitial}
        existingOrders={orders}
        onCancel={() => {
          setCreateModalVisible(false)
          setCreateModalInitial(null)
        }}
        onCreated={() => {
          setCreateModalVisible(false)
          setCreateModalInitial(null)
          fetchOrders(1, searchPartner, searchMonth, searchYear)
        }}
      />

      {createModalVisible && (
          <div className="timeline-panel">
              <VehicleTimeline
                  visible={createModalVisible}
                  vehicles={vehicles}
                  gates={gates}
              />
          </div>
      )}

    </Card>
  )
}

export default OrdersPage
