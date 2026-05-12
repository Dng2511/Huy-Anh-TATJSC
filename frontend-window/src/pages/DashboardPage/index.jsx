import { Button, Card, Col, Row, Statistic, Table, Tag, Typography } from 'antd'
import './DashboardPage.css'

const { Title, Text } = Typography

function DashboardPage({
  t,
  metrics,
  trackingVehicles,
  menuItems,
  pageMeta,
  formatCurrency,
  onNavigate,
}) {
  const dashboardCards = menuItems.filter((item) => item.key !== 'dashboard')

  return (
    <>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card className="metric-card">
              <Statistic
                title={'Tổng số đơn hôm nay'}
                value={metrics.totalOrdersToday}
              />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="metric-card">
              <Statistic
                title={'Xe đang hoạt động'}
                value={metrics.activeVehicles}
              />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="metric-card">
              <Statistic
                title={'Đơn đang giao'}
                value={metrics.deliveringOrders}
              />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="metric-card revenue-card">
              <Statistic
                title={'Doanh thu hôm nay'}
                value={formatCurrency(metrics.revenueToday)}
              />
          </Card>
        </Col>
      </Row>

      <Card className="module-card">
        <Title level={4}>{'Truy cập nhanh các trang chức năng'}</Title>
        <Row gutter={[16, 16]}>
          {dashboardCards.map((item) => (
            <Col xs={24} sm={12} xl={8} key={item.key}>
              <Card className="nav-card" hoverable>
                <Title level={5}>{pageMeta[item.key].title}</Title>
                <Text>{pageMeta[item.key].description}</Text>
                <div className="nav-card-footer">
                    <Button type="primary" onClick={() => onNavigate(item.key)}>
                      {'Mở trang'}
                    </Button>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      </Card>

      <Card
        className="module-card"
        title={'Tình hình giao vận gần nhất'}
      >
        <Table
          size="small"
          rowKey="key"
          dataSource={trackingVehicles}
          pagination={false}
          scroll={{ x: 620 }}
          columns={[
            { title: 'Xe', dataIndex: 'vehicle', width: 120 },
            { title: 'Vị trí', dataIndex: 'location', width: 160 },
            { title: 'ETA', dataIndex: 'eta', width: 120 },
              { title: 'Đơn hàng', dataIndex: 'shipment', width: 120 },
            {
              title: 'Trạng thái',
              dataIndex: 'status',
              render: (status) => (
                <Tag color={status.includes('Da') ? 'green' : 'blue'}>{status}</Tag>
              ),
            },
          ]}
        />
      </Card>
    </>
  )
}

export default DashboardPage
