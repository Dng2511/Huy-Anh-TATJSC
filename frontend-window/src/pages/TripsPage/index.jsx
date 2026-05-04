import { Card, Col, Row, Table, Timeline, Typography } from 'antd'
import './TripsPage.css'

const { Text } = Typography

function TripsPage({ t, trips }) {
  return (
    <Card title={t('trips.title', 'Phan cong chuyen di')} className="module-card">
      <Row gutter={[16, 16]}>
        <Col xs={24} xl={14}>
          <Table
            rowKey="key"
            dataSource={trips}
            pagination={false}
            scroll={{ x: 760 }}
            columns={[
              { title: t('trips.column.code', 'Ma chuyen'), dataIndex: 'key', width: 110 },
              { title: t('trips.column.route', 'Tuyen duong'), dataIndex: 'route', width: 220 },
              { title: t('common.vehicle', 'Xe'), dataIndex: 'vehicle', width: 120 },
              { title: t('trips.column.driver', 'Tai xe'), dataIndex: 'driver', width: 160 },
              {
                title: t('trips.column.orders', 'Don duoc gom'),
                dataIndex: 'orders',
                width: 170,
                render: (list) => <Text>{list.join(', ')}</Text>,
              },
            ]}
          />
        </Col>
        <Col xs={24} xl={10}>
          <Card className="side-note-card" title={t('trips.optimizeTitle', 'Toi uu tuyen duong')}>
            <Timeline
              items={trips.map((trip) => ({
                color: trip.status === 'Dang chay' ? 'blue' : 'green',
                children: (
                  <div>
                    <Text strong>{trip.key}</Text>
                    <br />
                    <Text>{trip.optimize}</Text>
                  </div>
                ),
              }))}
            />
          </Card>
        </Col>
      </Row>
    </Card>
  )
}

export default TripsPage
