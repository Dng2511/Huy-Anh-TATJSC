import { Card, Col, Empty, Row, Table, Typography } from 'antd'
import { useEffect, useMemo, useRef, useState } from 'react'
import { CircleMarker, MapContainer, Popup, TileLayer } from 'react-leaflet'
import gateApi from '../../services/Api/gateApi'
import 'leaflet/dist/leaflet.css'
import './GatesPage.css'

const { Text, Title } = Typography

const DEFAULT_CENTER = [10.7769, 106.7009]

function GatesPage({ t }) {
  const [gates, setGates] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedGate, setSelectedGate] = useState(null)
  const markerRefs = useRef({})

  useEffect(() => {
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

  return (
    <Card className="module-card gates-page-card">
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <div className="gates-panel gates-table-panel">
            <Title level={4} className="gates-section-title">
              {t('gates.tableTitle', 'Danh sach cua khau')}
            </Title>
            <Table
              rowKey="_id"
              dataSource={gates}
              loading={loading}
              pagination={{ pageSize: 8 }}
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
                  title: t('gates.column.name', 'Ten cua khau'),
                  dataIndex: 'name',
                },
                {
                  title: t('gates.column.location', 'Location'),
                  dataIndex: 'location',
                },
              ]}
            />
          </div>
        </Col>

        <Col xs={24} lg={12}>
          <div className="gates-panel gates-map-panel">
            <Title level={4} className="gates-section-title">
              {t('gates.mapTitle', 'Ban do vi tri cua khau')}
            </Title>
            {gates.length ? (
              <MapContainer
                center={mapCenter}
                zoom={9}
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
                    <CircleMarker
                      key={gate._id}
                      ref={(el) => (markerRefs.current[gate._id] = el)}
                      center={[lat, lng]}
                      radius={isSelected ? 12 : 8}
                      pathOptions={{
                        color: isSelected ? '#0a6960' : '#0e6b63',
                        fillColor: isSelected ? '#faa500' : '#f5a524',
                        fillOpacity: isSelected ? 1 : 0.95,
                        weight: isSelected ? 3 : 2,
                      }}
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
                    </CircleMarker>
                  )
                })}
              </MapContainer>
            ) : (
              <div className="gates-empty-map">
                <Empty description={t('gates.emptyMap', 'Khong co du lieu vi tri cua khau')} />
              </div>
            )}
          </div>
        </Col>
      </Row>
    </Card>
  )
}

export default GatesPage
