import { Button, Card, Col, Empty, Row, Table, Typography, message } from 'antd'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Marker, MapContainer, Popup, TileLayer } from 'react-leaflet'
import { createGateSquareIcon } from '../../utils/mapIcons'
import { fitMapToCoordinates, DEFAULT_CENTER, DEFAULT_ZOOM } from '../../utils/mapHelpers'
import gateApi from '../../services/Api/gateApi'
import useBulkRowDelete from '../../hooks/useBulkRowDelete'
import BulkDeleteButton from '../../components/BulkDeleteButton'
import AddGateModal from './AddGateModal'
import 'leaflet/dist/leaflet.css'
import './GatesPage.css'

const { Text, Title } = Typography

// Center roughly over Northern Vietnam (show Hanoi and surrounding region)

// gate icon imported from src/utils/mapIcons

function GatesPage() {
  const [gates, setGates] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedGate, setSelectedGate] = useState(null)
  const markerRefs = useRef({})
  const mapRef = useRef(null)

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const fetchGates = async () => {
    try {
      const response = await gateApi.getGates()
      const gateList = Array.isArray(response) ? response : response?.data || []
      setGates(gateList)
    } catch (error) {
      console.error('Error fetching gates:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchGates()
  }, [])

  const mapCenter = useMemo(() => {
    if (!gates.length) return DEFAULT_CENTER

    const validCoordinates = gates.filter((gate) => {
      const lat = Number(gate?.locate?.lat)
      const lng = Number(gate?.locate?.lng)
      return Number.isFinite(lat) && Number.isFinite(lng)
    })

    if (!validCoordinates.length) return DEFAULT_CENTER

    const totals = validCoordinates.reduce(
      (accumulator, gate) => ({
        lat: accumulator.lat + Number(gate.locate.lat),
        lng: accumulator.lng + Number(gate.locate.lng),
      }),
      { lat: 0, lng: 0 },
    )

    return [totals.lat / validCoordinates.length, totals.lng / validCoordinates.length]
  }, [gates])

  // Keep map view sensible: when gates change, fit bounds to markers; otherwise show northern VN
  useEffect(() => {
    if (!mapRef.current) return

    const validCoordinates = gates
      .map((g) => ({ lat: Number(g?.locate?.lat), lng: Number(g?.locate?.lng) }))
      .filter((c) => Number.isFinite(c.lat) && Number.isFinite(c.lng))

    fitMapToCoordinates(mapRef.current, validCoordinates, { fallbackCenter: DEFAULT_CENTER, fallbackZoom: DEFAULT_ZOOM, singleZoom: 12 })
  }, [gates])

  // Handle add gate modal
  const handleOpenAddModal = () => {
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
  }

  const handleAddGate = async (gateData) => {
    setSubmitting(true)
    try {
      await gateApi.createGate(gateData)
      message.success('Thêm cửa khẩu thành công')
      handleCloseModal()

      // Refresh gates list
      const response = await gateApi.getGates()
      const gateList = Array.isArray(response) ? response : response?.data || []
      setGates(gateList)
    } catch (error) {
      console.error('Error creating gate:', error)
      message.error('Lỗi khi thêm cửa khẩu')
    } finally {
      setSubmitting(false)
    }
  }

  const {
    selectedRowKeys,
    rowSelection,
    handleDeleteSelected,
  } = useBulkRowDelete({
    deleteItems: (ids) => gateApi.deleteGates(ids),
    onDeleted: async () => {
      setSelectedGate(null)
      await fetchGates()
    },
    getEmptyMessage: () => 'Vui lòng chọn cửa khẩu cần xóa',
    getConfirmMessage: () =>
      'Việc xóa cửa khẩu sẽ xóa cả giá cước của đối tác đang sử dụng chúng. Bạn có chắc chắn muốn xóa những cửa khẩu này?',
    getErrorMessage: () => 'Lỗi khi xóa cửa khẩu',
    setLoading,
    confirmTitle: 'Xác nhận xóa cửa khẩu',
    confirmOkText: 'Xóa',
    confirmCancelText: 'Hủy',
  })

  return (
    <Card className="module-card gates-page-card">
      <Row gutter={[16, 16]} align="stretch">
        <Col xs={24} lg={12}>
          <div className="gates-panel gates-table-panel">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <Title level={4} className="gates-section-title" style={{ margin: 0 }}>
                {'Danh sách cửa khẩu'}
              </Title>
              <Button type="primary" onClick={handleOpenAddModal}>
                + Thêm cửa khẩu
              </Button>
            </div>
            <Table
              rowKey="_id"
              dataSource={gates}
              loading={loading}
              pagination={{ pageSize: 8 }}
              rowSelection={rowSelection}
              rowClassName={(record) => (selectedGate?._id === record._id ? 'selected-row' : '')}
              onRow={(record) => ({
                onClick: () => {
                  setSelectedGate(record)
                  // Mở popup của marker tương ứng
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
                  title: 'Tên cửa khẩu',
                  dataIndex: 'name',
                },
                {
                  title: 'Vị trí',
                  dataIndex: 'location',
                },
              ]}
            />
            <BulkDeleteButton
              selectedRowKeys={selectedRowKeys}
              onClick={handleDeleteSelected}
              label="Xóa cửa khẩu"
            />
          </div>
        </Col>

        <Col xs={24} lg={12}>
          <div className="gates-panel gates-map-panel">
            <Title level={4} className="gates-section-title">
              {'Bản đồ vị trí cửa khẩu'}
            </Title>
            {gates.length ? (
              <MapContainer
                center={mapCenter}
                zoom={DEFAULT_ZOOM}
                whenCreated={(map) => (mapRef.current = map)}
                scrollWheelZoom
                className="gates-map"
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {gates.map((gate) => {
                  const lat = Number(gate?.locate?.lat)
                  const lng = Number(gate?.locate?.lng)
                  const isSelected = selectedGate?._id === gate._id

                  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null

                  return (
                    <Marker
                      key={gate._id}
                      ref={(el) => (markerRefs.current[gate._id] = el)}
                      position={[lat, lng]}
                      icon={createGateSquareIcon(isSelected)}
                      eventHandlers={{
                        click: () => {
                          setSelectedGate(gate)
                        },
                      }}
                    >
                      <Popup>
                        <div className="gate-popup">
                          <Text strong>{gate.name}</Text>
                          <br />
                          <Text>{gate.location}</Text>
                        </div>
                      </Popup>
                    </Marker>
                  )
                })}
              </MapContainer>
            ) : (
              <div className="gates-empty-map">
                <Empty description={'Không có dữ liệu vị trí cửa khẩu'} />
              </div>
            )}
          </div>
        </Col>
      </Row>

      <AddGateModal
        open={isModalOpen}
        onCancel={handleCloseModal}
        onCreate={handleAddGate}
        submitting={submitting}
        gates={gates}
        defaultCenter={DEFAULT_CENTER}
        defaultZoom={DEFAULT_ZOOM}
      />
    </Card>
  )
}

export default GatesPage
