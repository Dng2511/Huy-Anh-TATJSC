import { AutoComplete, Form, Input, Modal, Typography, message } from 'antd'
import { useEffect, useRef, useState } from 'react'
import { CircleMarker, MapContainer, TileLayer, useMap, useMapEvent } from 'react-leaflet'

const { Text } = Typography

function AddGateMapClickHandler({ onLocationSelect }) {
  useMapEvent('click', (e) => {
    onLocationSelect({
      lat: e.latlng.lat,
      lng: e.latlng.lng,
    })
  })
  return null
}

function AddGateMapAutoCenter({ location, zoom = 12 }) {
  const map = useMap()

  useEffect(() => {
    if (!location) return
    map.setView([location.lat, location.lng], zoom, { animate: true })
  }, [location, map, zoom])

  return null
}

function AddGateModal({
  open,
  onCancel,
  onCreate,
  submitting,
  gates,
  defaultCenter,
  defaultZoom,
}) {
  const [form] = Form.useForm()
  const [newGateLocation, setNewGateLocation] = useState(null)
  const [searchOptions, setSearchOptions] = useState([])
  const [searchLoading, setSearchLoading] = useState(false)
  const searchTimeoutRef = useRef(null)

  useEffect(() => {
    if (!open) return
    setNewGateLocation(null)
    setSearchOptions([])
    form.resetFields()
  }, [open, form])

  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [])

  const handleLocationSearch = (searchText) => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    if (!searchText.trim()) {
      setSearchOptions([])
      return
    }

    setSearchLoading(true)

    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchText)}&format=json&limit=5&countrycodes=vn`
        )
        const results = await response.json()

        setSearchOptions(
          results.map((result) => ({
            label: result.display_name,
            value: result.display_name,
            lat: parseFloat(result.lat),
            lng: parseFloat(result.lon),
          }))
        )
      } catch (error) {
        console.error('Error searching location:', error)
        message.error('Lỗi khi tìm kiếm địa chỉ')
      } finally {
        setSearchLoading(false)
      }
    }, 500)
  }

  const handleLocationSelect = (_value, option) => {
    const location = {
      lat: option.lat,
      lng: option.lng,
    }

    setNewGateLocation(location)
    form.setFieldsValue({ location: option.label })
  }

  const handleSubmit = (values) => {
    if (!newGateLocation) {
      message.error('Vui lòng chọn vị trí trên bản đồ')
      return
    }

    onCreate({
      name: values.name,
      location: values.location || values.name,
      locate: {
        lat: newGateLocation.lat,
        lng: newGateLocation.lng,
      },
    })
  }

  return (
    <Modal
      title="Thêm cửa khẩu mới"
      open={open}
      onCancel={onCancel}
      onOk={() => form.submit()}
      confirmLoading={submitting}
      width={1000}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        style={{ marginBottom: '20px' }}
      >
        <Form.Item
          name="name"
          label="Tên cửa khẩu"
          rules={[{ required: true, message: 'Vui lòng nhập tên cửa khẩu' }]}
        >
          <Input placeholder="Nhập tên cửa khẩu" />
        </Form.Item>
        <Form.Item
          name="location"
          label="Tìm kiếm địa điểm"
        >
          <AutoComplete
            placeholder="Nhập tên địa điểm (ví dụ: Hà Nội, Hải Phòng, ...)"
            options={searchOptions}
            onSearch={handleLocationSearch}
            onSelect={handleLocationSelect}
            loading={searchLoading}
          />
        </Form.Item>
      </Form>

      <div style={{ marginBottom: '16px' }}>
        <Text strong>Vị trí đã chọn: </Text>
        {newGateLocation ? (
          <Text>
            Latitude: {newGateLocation.lat.toFixed(6)}, Longitude: {newGateLocation.lng.toFixed(6)}
          </Text>
        ) : (
          <Text type="warning">Tìm kiếm địa điểm hoặc nhấp vào bản đồ để chọn vị trí</Text>
        )}
      </div>

      <div style={{ height: '400px', marginBottom: '16px', border: '1px solid #d9d9d9', borderRadius: '4px' }}>
        <MapContainer
          center={defaultCenter}
          zoom={defaultZoom}
          style={{ height: '100%' }}
          scrollWheelZoom
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <AddGateMapClickHandler onLocationSelect={setNewGateLocation} />
          <AddGateMapAutoCenter location={newGateLocation} />

          {newGateLocation && (
            <CircleMarker
              center={[newGateLocation.lat, newGateLocation.lng]}
              radius={8}
              pathOptions={{
                color: '#ff7a45',
                fillColor: '#ff7a45',
                fillOpacity: 0.8,
                weight: 2,
              }}
            />
          )}

          {gates.map((gate) => {
            const lat = Number(gate?.locate?.lat)
            const lng = Number(gate?.locate?.lng)
            if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null

            return (
              <CircleMarker
                key={gate._id}
                center={[lat, lng]}
                radius={6}
                pathOptions={{
                  color: '#0e6b63',
                  fillColor: '#f5a524',
                  fillOpacity: 0.6,
                  weight: 1,
                }}
              />
            )
          })}
        </MapContainer>
      </div>
    </Modal>
  )
}

export default AddGateModal
