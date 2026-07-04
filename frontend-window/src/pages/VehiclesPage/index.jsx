import { Button, Badge, Card, Col, Empty, Form, Input, InputNumber, Modal, Row, Select, Table, Typography, message } from 'antd'
import { useEffect, useRef, useState } from 'react'
import { CircleMarker, MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet'
import formatLicensePlate from '../../utils/formatLicensePlate'
import { getGpsStatus, getMarkerColors } from '../../utils/gpsHelpers'
import { createGateSquareIcon } from '../../utils/mapIcons'
import { fitMapToCoordinates, DEFAULT_CENTER, DEFAULT_ZOOM } from '../../utils/mapHelpers'
import driverApi from '../../services/Api/driverApi'
import gateApi from '../../services/Api/gateApi'
import vehicleApi from '../../services/Api/vehicleApi'
import useBulkRowDelete from '../../hooks/useBulkRowDelete'
import BulkDeleteButton from '../../components/BulkDeleteButton'
import 'leaflet/dist/leaflet.css'
import './VehiclesPage.css'

const { Text, Title } = Typography

// Center roughly over Northern Vietnam (show Hanoi and surrounding region)
const SELECTED_VEHICLE_ZOOM = 15

const vehicleStatusColor = {
  idle: '#52c41a',
  running: '#faad14',
}

const gpsStatusColor = {
  live: '#1890ff',
  offline: '#8c8c8c',
}

// gate icon imported from src/utils/mapIcons

// formatLicensePlate is imported from src/utils/formatLicensePlate

// GPS helpers imported from src/utils/gpsHelpers

function VehicleMapController({ vehicles, gates, selectedVehicle }) {
  const map = useMap()
  const hasSetInitialViewRef = useRef(false)

  useEffect(() => {
    if (hasSetInitialViewRef.current) return

    const validCoordinates = [
      ...vehicles.map((vehicle) => ({ lat: Number(vehicle?.tracking?.lat), lng: Number(vehicle?.tracking?.lng) })),
      ...gates.map((gate) => ({ lat: Number(gate?.locate?.lat), lng: Number(gate?.locate?.lng) })),
    ].filter((coordinate) => Number.isFinite(coordinate.lat) && Number.isFinite(coordinate.lng))

    fitMapToCoordinates(map, validCoordinates, { fallbackCenter: DEFAULT_CENTER, fallbackZoom: DEFAULT_ZOOM, singleZoom: SELECTED_VEHICLE_ZOOM })
    hasSetInitialViewRef.current = true
  }, [gates, map, vehicles])

  useEffect(() => {
    if (!selectedVehicle) return

    const lat = Number(selectedVehicle?.tracking?.lat)
    const lng = Number(selectedVehicle?.tracking?.lng)

    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return

    map.flyTo([lat, lng], SELECTED_VEHICLE_ZOOM, {
      animate: true,
      duration: 0.9,
    })
  }, [map, selectedVehicle])

  return null
}

function VehiclesPage() {
  const [vehicles, setVehicles] = useState([])
  const [gates, setGates] = useState([])
  const [drivers, setDrivers] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedVehicle, setSelectedVehicle] = useState(null)
  const [updatingVehicleId, setUpdatingVehicleId] = useState(null)
  const markerRefs = useRef({})

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [creatingVehicle, setCreatingVehicle] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [editingVehicleId, setEditingVehicleId] = useState(null);
  const [addForm] = Form.useForm();

  const getVehicleDriverId = (vehicle) => vehicle?.driver?._id || vehicle?.driver || null

  const fetchGates = async () => {
    try {
      const response = await gateApi.getGates()
      const gateList = Array.isArray(response) ? response : response?.data || []
      setGates(gateList)
    } catch (error) {
      console.error('Error fetching gates:', error)
    }
  }

  const fetchDrivers = async () => {
    try {
      const response = await driverApi.getDrivers()
      const driverList = Array.isArray(response) ? response : response?.data || []
      setDrivers(driverList)
    } catch (error) {
      console.error('Error fetching drivers:', error)
      message.error('Lỗi khi tải danh sách tài xế')
    }
  }

  const fetchVehicles = async () => {
    try {
      const response = await vehicleApi.getVehicles()
      const vehicleList = Array.isArray(response) ? response : response?.data || []
      setVehicles(vehicleList)
    } catch (error) {
      console.error('Error fetching vehicles:', error)
      message.error('Lỗi khi tải danh sách phương tiện')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const fetchAll = async () => {
      await Promise.all([fetchVehicles(), fetchGates(), fetchDrivers()])
    }

    fetchAll()
  }, [])

  useEffect(() => {
    const intervalId = setInterval(() => {
      fetchVehicles()
    }, 5000)

    return () => clearInterval(intervalId)
  }, [])

  const {
    selectedRowKeys,
    rowSelection,
    handleDeleteSelected,
  } = useBulkRowDelete({
    deleteItems: (ids) => vehicleApi.deleteVehicles(ids),
    onDeleted: async () => {
      setSelectedVehicle(null)
      await fetchVehicles()
    },
    getEmptyMessage: () => 'Vui lòng chọn phương tiện cần xóa',
    getConfirmMessage: () => 'Bạn có chắc chắn muốn xóa những phương tiện này?',
    getErrorMessage: () => 'Lỗi khi xóa phương tiện',
    setLoading,
    confirmTitle: 'Xác nhận xóa phương tiện',
    confirmOkText: 'Xóa',
    confirmCancelText: 'Hủy',
  })

  const handleAddVehicle = () => {
    setModalMode('create');
    setEditingVehicleId(null);

    addForm.setFieldsValue({
      licensePlate: '',
      fuelRate: 0,
    });

    setIsAddModalOpen(true);
  };

  const handleEditVehicle = (record) => {
    setModalMode('edit');
    setEditingVehicleId(record._id);

    addForm.setFieldsValue({
      licensePlate: record.licensePlate,
      fuelRate: record.fuelRate,
    });

    setIsAddModalOpen(true);
  };

  const handleCloseAddModal = () => {
    setIsAddModalOpen(false);
    setModalMode('create');
    setEditingVehicleId(null);
    addForm.resetFields();
  };

  const handleSubmitVehicle = async () => {
    try {
      const values = await addForm.validateFields();

      setCreatingVehicle(true);

      const payload = {
        licensePlate: values.licensePlate,
        fuelRate: Number(values.fuelRate) || 0,
      };

      if (modalMode === 'edit' && editingVehicleId) {
        await vehicleApi.updateVehicle(editingVehicleId, payload);
        message.success('Cập nhật phương tiện thành công');
      } else {
        await vehicleApi.createVehicle(payload);
        message.success('Thêm phương tiện thành công');
      }

      handleCloseAddModal();
      await fetchVehicles();
    } catch (error) {
      if (error?.errorFields) return;

      console.error('Error saving vehicle:', error);
      message.error(
        modalMode === 'edit'
          ? 'Lỗi khi cập nhật phương tiện'
          : 'Lỗi khi thêm phương tiện'
      );
    } finally {
      setCreatingVehicle(false);
    }
  };

  const handleChangeVehicleDriver = (vehicle, nextDriverId) => {
    const currentDriverId = getVehicleDriverId(vehicle)
    const normalizedNextDriverId = nextDriverId || null

    if (String(normalizedNextDriverId || '') === String(currentDriverId || '')) {
      return
    }

    const conflictingVehicle = normalizedNextDriverId
      ? vehicles.find((item) => String(getVehicleDriverId(item) || '') === String(normalizedNextDriverId) && item._id !== vehicle._id)
      : null

    Modal.confirm({
      title: 'Xác nhận thay đổi tài xế',
      content: conflictingVehicle
        ? `Tài xế này đang được gán cho xe ${formatLicensePlate(conflictingVehicle.licensePlate)}. Khi tiếp tục, hệ thống có thể đổi 2 tài xế cho nhau. Bạn có chắc chắn muốn đổi?`
        : 'Bạn có muốn thay đổi tài xế cho phương tiện này?',
      okText: 'Đổi',
      cancelText: 'Hủy',
      onOk: async () => {
        setUpdatingVehicleId(vehicle._id)
        try {
          await vehicleApi.updateVehicle(vehicle._id, { driver: normalizedNextDriverId })
          message.success('Đã cập nhật tài xế cho phương tiện')
          await fetchVehicles()
        } catch (error) {
          console.error('Error updating vehicle driver:', error)
          message.error('Lỗi khi cập nhật tài xế cho phương tiện')
        } finally {
          setUpdatingVehicleId(null)
        }
      },
    })
  }

  return (
    <Card className="module-card vehicles-page-card">
      <Row gutter={[16, 16]} align="stretch">
        <Col xs={24} lg={12}>
          <div className="vehicles-panel vehicles-table-panel">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <Title level={4} className="vehicles-section-title" style={{ margin: 0 }}>
                {'Danh sách phương tiện'}
              </Title>
              <Button type="primary" onClick={handleAddVehicle}>
                + Thêm phương tiện
              </Button>
            </div>
            <Table
              rowKey="_id"
              dataSource={vehicles}
              loading={loading}
              pagination={{ pageSize: 8 }}
              rowSelection={rowSelection}
              rowClassName={(record) => (selectedVehicle?._id === record._id ? 'selected-row' : '')}
              onRow={(record) => ({
                onClick: () => {
                  setSelectedVehicle(record)
                  // Open marker popup
                  setTimeout(() => {
                    if (markerRefs.current[record._id]) {
                      markerRefs.current[record._id].openPopup()
                    }
                  }, 0)
                },
                style: { cursor: 'pointer' },
              })}
              columns={[
                {
                  title: 'Biển số',
                  dataIndex: 'licensePlate',
                  width: 100,
                  render: (licensePlate) => formatLicensePlate(licensePlate),
                },
                {
                  title: 'Tài xế',
                  key: 'driver',
                  width: 180,
                  render: (_, record) => (
                    <div onClick={(event) => event.stopPropagation()}>
                      <Select
                        size="small"
                        style={{ width: '100%' }}
                        value={getVehicleDriverId(record) || undefined}
                        key={`${record._id}-${getVehicleDriverId(record) || 'none'}`}
                        placeholder="Chọn tài xế"
                        allowClear
                        showSearch
                        optionFilterProp="label"
                        loading={updatingVehicleId === record._id}
                        disabled={updatingVehicleId === record._id}
                        options={drivers.map((driver) => ({
                          value: driver._id,
                          label: driver.name,
                        }))}
                        onSelect={(value) => handleChangeVehicleDriver(record, value)}
                        onClear={() => handleChangeVehicleDriver(record, null)}
                      />
                    </div>
                  ),
                },
                {
                  title: 'Địa chỉ GPS',
                  dataIndex: ['tracking', 'address'],
                  width: 200,
                  render: (address) => address || '-',
                },
                {
                  title: 'Trạng thái',
                  dataIndex: 'status',
                  width: 90,
                  render: (status) => <Badge color={vehicleStatusColor[status]} text={status == 'idle' ? 'Trống' : 'Có đơn'} />,
                },
                {
                  title: 'Phí nhiên liệu (L/100km)', 
                  dataIndex: 'fuelRate', 
                  width: 90, 
                },
                {
                  title: 'Tốc độ GPS',
                  dataIndex: ['tracking', 'liveStatus'],
                  width: 80,
                  render: (_, record) => getGpsStatus(record),
                },
                {
                  title: 'Hành động',
                  key: 'actions',
                  render: (_, record) => (
                    <Button size="small" onClick={() => handleEditVehicle(record)}>
                      {'Sửa'}
                    </Button>
                  ),
                },
              ]}
              scroll={{ x: 900 }}
            />
            <BulkDeleteButton
              selectedRowKeys={selectedRowKeys}
              onClick={handleDeleteSelected}
              label="Xóa phương tiện"
            />
          </div>
        </Col>

        <Col xs={24} lg={12}>
          <div className="vehicles-panel vehicles-map-panel">
            <Title level={4} className="vehicles-section-title">
              {'Bản đồ vị trí phương tiện'}
            </Title>
            {vehicles.length ? (
              <MapContainer
                center={DEFAULT_CENTER}
                zoom={DEFAULT_ZOOM}
                scrollWheelZoom
                className="vehicles-map"
                maxZoom={19}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                <VehicleMapController vehicles={vehicles} gates={gates} selectedVehicle={selectedVehicle} />

                {gates.map((gate) => {
                  const lat = Number(gate?.locate?.lat)
                  const lng = Number(gate?.locate?.lng)
                  const isSelectedGate = false

                  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null

                  return (
                    <Marker
                      key={gate._id}
                      position={[lat, lng]}
                      icon={createGateSquareIcon(isSelectedGate)}
                    >
                      <Popup>
                        <div className="vehicle-popup">
                          <Text strong>{gate.name}</Text>
                          <br />
                          <Text>{gate.location}</Text>
                        </div>
                      </Popup>
                    </Marker>
                  )
                })}

                {vehicles.map((vehicle) => {
                  const lat = Number(vehicle?.tracking?.lat)
                  const lng = Number(vehicle?.tracking?.lng)
                  const isSelected = selectedVehicle?._id === vehicle._id

                  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null

                  const markerColors = getMarkerColors(vehicle)
                  const selectedColor = '#ff7a45'

                  return (
                    <CircleMarker
                      key={vehicle._id}
                      ref={(el) => (markerRefs.current[vehicle._id] = el)}
                      center={[lat, lng]}
                      radius={isSelected ? 12 : 8}
                      pathOptions={{
                        color: isSelected ? selectedColor : markerColors.stroke,
                        fillColor: isSelected ? selectedColor : markerColors.fill,
                        fillOpacity: isSelected ? 1 : 0.8,
                        weight: isSelected ? 3 : 2,
                      }}
                      eventHandlers={{
                        click: () => {
                          setSelectedVehicle(vehicle)
                          setTimeout(() => {
                            if (markerRefs.current[vehicle._id]) {
                              markerRefs.current[vehicle._id].openPopup()
                            }
                          }, 0)
                        },
                      }}
                    >
                      <Popup>
                        <div className="vehicle-popup">
                          <Text strong>{formatLicensePlate(vehicle.licensePlate)}</Text>
                          <br />
                          <Text>Người lái: {vehicle.tracking?.driverName || 'Chưa xác định'}</Text>
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
                          <br />
                          <Text>Trạng thái: {vehicle.status}</Text>
                        </div>
                      </Popup>
                    </CircleMarker>
                  )
                })}
              </MapContainer>
            ) : (
              <div className="vehicles-empty-map">
                <Empty description={'Không có dữ liệu vị trí phương tiện'} />
              </div>
            )}
          </div>
        </Col>
      </Row>
      <Modal
        title={modalMode === 'edit' ? 'Chỉnh sửa phương tiện' : 'Thêm phương tiện'}
        open={isAddModalOpen}
        onOk={handleSubmitVehicle}
        onCancel={handleCloseAddModal}
        okText={modalMode === 'edit' ? 'Cập nhật' : 'Lưu'}
        cancelText="Hủy"
        confirmLoading={creatingVehicle}
        destroyOnHidden
      >
        <Form form={addForm} layout="vertical">
          <Form.Item
            label="Biển số xe"
            name="licensePlate"
            rules={[
              { required: true, message: 'Vui lòng nhập biển số xe' },
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Mức tiêu hao nhiên liệu (L/100km)"
            name="fuelRate"
            rules={[
              { required: true, message: 'Vui lòng nhập mức tiêu hao nhiên liệu' },
            ]}
          >
            <InputNumber
              min={0}
              step={0.1}
              precision={1}
              style={{ width: '100%' }}
            />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  )
}

export default VehiclesPage
