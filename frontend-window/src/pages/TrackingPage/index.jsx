import { Card, Col, Row, Table, Tag } from 'antd'
import './TrackingPage.css'

function TrackingPage({ t, mapMarkers, trackingVehicles }) {
  return (
    <Card title={t('tracking.title', 'Tracking GPS')} className="module-card">
      <Row gutter={[16, 16]}>
        <Col xs={24} xl={14}>
          <div className="mock-map" role="img" aria-label={t('tracking.mapAria', 'Ban do vi tri xe')}>
            <div className="map-grid"></div>
            {mapMarkers.map((marker) => (
              <div
                key={marker.id}
                className="map-marker"
                style={{ left: marker.left, top: marker.top }}
              >
                <span>{marker.vehicle}</span>
              </div>
            ))}
            <div className="map-caption">
              {t(
                'tracking.mapCaption',
                'GPS mock map - ban co the thay bang API ban do that sau',
              )}
            </div>
          </div>
        </Col>
        <Col xs={24} xl={10}>
          <Table
            size="small"
            rowKey="key"
            dataSource={trackingVehicles}
            pagination={false}
            scroll={{ x: 640 }}
            columns={[
              { title: t('common.vehicle', 'Xe'), dataIndex: 'vehicle', width: 105 },
              { title: t('common.location', 'Vi tri'), dataIndex: 'location', width: 130 },
              { title: t('common.eta', 'ETA'), dataIndex: 'eta', width: 100 },
              { title: t('common.order', 'Don hang'), dataIndex: 'shipment', width: 100 },
              {
                title: t('common.status', 'Trang thai'),
                dataIndex: 'status',
                width: 130,
                render: (status) => (
                  <Tag color={status.includes('Da') ? 'green' : 'blue'}>{status}</Tag>
                ),
              },
            ]}
          />
        </Col>
      </Row>
    </Card>
  )
}

export default TrackingPage
