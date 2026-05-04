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
              title={t('dashboard.metric.totalOrders', 'Tong so don hom nay')}
              value={metrics.totalOrdersToday}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="metric-card">
            <Statistic
              title={t('dashboard.metric.activeVehicles', 'Xe dang hoat dong')}
              value={metrics.activeVehicles}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="metric-card">
            <Statistic
              title={t('dashboard.metric.delivering', 'Don dang giao')}
              value={metrics.deliveringOrders}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="metric-card revenue-card">
            <Statistic
              title={t('dashboard.metric.revenue', 'Doanh thu hom nay')}
              value={formatCurrency(metrics.revenueToday)}
            />
          </Card>
        </Col>
      </Row>

      <Card className="module-card">
        <Title level={4}>{t('dashboard.quickAccess', 'Truy cap nhanh cac trang chuc nang')}</Title>
        <Row gutter={[16, 16]}>
          {dashboardCards.map((item) => (
            <Col xs={24} sm={12} xl={8} key={item.key}>
              <Card className="nav-card" hoverable>
                <Title level={5}>{pageMeta[item.key].title}</Title>
                <Text>{pageMeta[item.key].description}</Text>
                <div className="nav-card-footer">
                  <Button type="primary" onClick={() => onNavigate(item.key)}>
                    {t('dashboard.openPage', 'Mo trang')}
                  </Button>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      </Card>

      <Card
        className="module-card"
        title={t('dashboard.latestDelivery', 'Tinh hinh giao van gan nhat')}
      >
        <Table
          size="small"
          rowKey="key"
          dataSource={trackingVehicles}
          pagination={false}
          scroll={{ x: 620 }}
          columns={[
            { title: t('common.vehicle', 'Xe'), dataIndex: 'vehicle', width: 120 },
            { title: t('common.location', 'Vi tri'), dataIndex: 'location', width: 160 },
            { title: t('common.eta', 'ETA'), dataIndex: 'eta', width: 120 },
            { title: t('common.order', 'Don hang'), dataIndex: 'shipment', width: 120 },
            {
              title: t('common.status', 'Trang thai'),
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
