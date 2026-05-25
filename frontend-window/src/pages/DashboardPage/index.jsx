import { Line } from '@ant-design/plots'
import { Alert, Button, Card, Col, Empty, Progress, Row, Segmented, Select, Spin, Statistic, Table, Tag, Typography } from 'antd'
import { useMemo, useState } from 'react'
import './DashboardPage.css'

const { Title, Text } = Typography

const MONTH_OPTIONS = [
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

const joinClasses = (...parts) => parts.filter(Boolean).join(' ')

const formatAxisCurrency = (value) => new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 0 }).format(Math.round(Number(value) || 0))

const normalizeChartData = (labels = [], revenueValues = [], profitValues = []) => labels.flatMap((label, index) => ([
  { monthLabel: label, seriesLabel: 'Doanh thu', value: Number(revenueValues[index]) || 0, series: 'Doanh thu' },
  { monthLabel: label, seriesLabel: 'Lợi nhuận', value: Number(profitValues[index]) || 0, series: 'Lợi nhuận' },
]))

function LineChartCard({ title, subtitle, labels, seriesList, valueFormatter, emptyText }) {
  const [selectedPoint, setSelectedPoint] = useState(null)
  const revenueValues = seriesList[0]?.values || []
  const profitValues = seriesList[1]?.values || []
  const chartData = useMemo(() => normalizeChartData(
    labels,
    revenueValues,
    profitValues,
  ), [labels, revenueValues, profitValues])

  const lineConfig = useMemo(() => ({
    data: chartData,
    xField: 'monthLabel',
    yField: 'value',
    seriesField: 'series',
    colorField: 'series',
    smooth: true,
    color: seriesList.map((s) => s?.color || '#0e6b63'),
    scale: {
      color: {
        range: seriesList.map((s) => s?.color || '#0e6b63'),
      },
    },
    lineStyle: (datum) => {
      const seriesLabel = typeof datum === 'string' ? datum : (datum?.series || datum?.seriesLabel || datum?.name)
      const series = seriesList.find((s) => s.label === seriesLabel)
      return { stroke: series?.color || '#0e6b63', lineWidth: 2 }
    },
    point: {
      size: 5,
      shape: 'circle',
      style: {
        stroke: '#ffffff',
        lineWidth: 2,
      },
    },
    tooltip: {
      title: (datum) => datum?.monthLabel || '',
      shared: true,
      items: [{ field: 'value' }],
    },
    axis: {
      x: {
        title: 'Kỳ thời gian',
        labelFormatter: (value) => value,
      },
      y: {
        title: seriesList[0]?.label === 'Doanh số' ? 'Số đơn' : 'Giá trị',
        labelFormatter: (value) => formatAxisCurrency(value),
      },
    },
    legend: false,
    interactions: [{ type: 'element-active' }],
    onReady: (plot) => {
      plot.on('element:click', (event) => {
        const datum = event?.data?.data || event?.data || event?.data?.datum
        if (!datum) return
        setSelectedPoint({
          monthLabel: datum.monthLabel,
          seriesLabel: datum.seriesLabel,
          value: datum.value,
        })
      })
    },
  }), [chartData, seriesList, valueFormatter])

  return (
    <Card className="dashboard-chart-card">
      <div className="dashboard-chart-header">
        <div>
          <Title level={5} className="dashboard-chart-title">{title}</Title>
          <Text className="dashboard-chart-subtitle">{subtitle}</Text>
        </div>
      </div>

      {labels.length === 0 ? (
        <Empty description={emptyText} />
      ) : (
        <div className="dashboard-line-chart-wrap">
          <Line {...lineConfig} />
          <div className="dashboard-chart-legend dashboard-chart-legend-below">
            {seriesList.map((series) => (
              <span key={series.label} className="dashboard-chart-legend-item">
                <span className="dashboard-chart-legend-dot" style={{ backgroundColor: series.color }} />
                {series.label}
              </span>
            ))}
          </div>
        </div>
      )}
    </Card>
  )
}

function DashboardPage({
  summary,
  loading,
  view,
  year,
  month,
  availableYears,
  menuItems,
  pageMeta,
  formatCurrency,
  onNavigate,
  onChangeView,
  onChangeYear,
  onChangeMonth,
}) {
  const dashboardCards = menuItems.filter((item) => item.key !== 'dashboard')
  const orders = summary?.orders || {}
  const fees = summary?.fees || {}
  const profit = summary?.profit || {}
  const vehicles = summary?.vehicles || {}
  const chart = summary?.chart || { labels: [], revenueSeries: [], salesSeries: [], profitSeries: [] }
  const recentOrders = summary?.recentOrders || []
  const profitMargin = Number(profit.margin) || 0
  const periodLabel = summary?.periodLabel || 'Thời gian hiện tại'

  const yearMonthOptions = MONTH_OPTIONS.map((item) => ({
    value: `${year}-${String(item.value).padStart(2, '0')}`,
    label: item.label,
  }))

  const revenueCards = [
    {
      title: 'Doanh thu',
      value: formatCurrency(orders.revenue),
      suffix: `${orders.totalOrders || 0} đơn`,
      tone: 'revenue',
    },
    {
      title: 'Doanh số',
      value: orders.totalOrders || 0,
      suffix: 'Số đơn theo kỳ đang chọn',
      tone: 'orders',
    },
    {
      title: 'Lợi nhuận',
      value: formatCurrency(profit.value),
      suffix: `${profitMargin.toFixed(1)}% biên lợi nhuận`,
      tone: 'profit',
    },
    {
      title: 'Tổng phí',
      value: formatCurrency(fees.totalFee),
      suffix: `${formatCurrency(fees.totalDieselFee)} phí diesel`,
      tone: 'cost',
    },
  ]

  if (loading && !summary) {
    return (
      <div className="dashboard-loading">
        <Spin size="large" />
      </div>
    )
  }

  if (!summary) {
    return <Alert type="error" message="Không tải được dữ liệu dashboard" showIcon />
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-hero">
        <div className="dashboard-hero-copy">
          <Tag color="green" className="dashboard-hero-tag">{periodLabel}</Tag>
          <Title level={2} className="dashboard-title">Bảng điều khiển doanh thu</Title>
          <Text className="dashboard-subtitle">
            Doanh thu = tiền đơn + tiền đền bù x số ngày chờ. Doanh số hiển thị theo số đơn trong kỳ đã chọn.
          </Text>
        </div>

        <div className="dashboard-filter-stack">
          <Segmented
            value={view}
            onChange={onChangeView}
            options={[
              { label: 'Theo năm', value: 'year' },
              { label: 'Theo tháng', value: 'month' },
            ]}
          />

          {view === 'year' ? (
            <Select
              value={year}
              onChange={onChangeYear}
              options={availableYears.map((item) => ({ value: item, label: `Năm ${item}` }))}
              className="dashboard-period-select"
            />
          ) : (
            <div className="dashboard-month-picker">
              <Select
                value={year}
                onChange={onChangeYear}
                options={availableYears.map((item) => ({ value: item, label: `Năm ${item}` }))}
              />
              <Select value={month} onChange={onChangeMonth} options={yearMonthOptions} />
            </div>
          )}
        </div>
      </div>

      <Row gutter={[16, 16]}>
        {revenueCards.map((item) => (
          <Col xs={24} sm={12} xl={6} key={item.title}>
            <Card className={joinClasses('dashboard-stat-card', `dashboard-${item.tone}`)}>
              <Statistic title={item.title} value={item.value} />
              <Text className="dashboard-card-suffix">{item.suffix}</Text>
            </Card>
          </Col>
        ))}
      </Row>

      <Row gutter={[16, 16]} className="dashboard-section-row">
        <Col xs={24}>
          <LineChartCard
            title="Biểu đồ doanh thu và lợi nhuận"
            labels={chart.labels || []}
            seriesList={[
              { label: 'Doanh thu', color: '#0e6b63', values: chart.revenueSeries || [] },
              { label: 'Lợi nhuận', color: '#1677ff', values: chart.profitSeries || [] },
            ]}
            valueFormatter={formatCurrency}
            emptyText="Chưa có dữ liệu doanh thu và lợi nhuận"
          />
        </Col>
      </Row>

      <Row gutter={[16, 16]} className="dashboard-section-row">
        <Col xs={24} xl={14}>
          <Card className="module-card dashboard-breakdown-card" title="Cấu phần lợi nhuận">
            <Row gutter={[12, 12]}>
              <Col xs={24} md={12}>
                <Card className="dashboard-inner-card">
                  <Statistic title="Doanh thu gốc từ đơn" value={formatCurrency(orders.baseRevenue)} />
                  <Text className="dashboard-inner-caption">Tổng tiền đơn trước khi cộng đền bù.</Text>
                </Card>
              </Col>
              <Col xs={24} md={12}>
                <Card className="dashboard-inner-card">
                  <Statistic title="Tiền đền bù chờ hàng" value={formatCurrency(orders.waitingRevenue)} />
                  <Text className="dashboard-inner-caption">Đền bù nhân theo số ngày chờ thực tế.</Text>
                </Card>
              </Col>
            </Row>

            <div className="dashboard-progress-block">
              <div className="dashboard-progress-header">
                <Text strong>Lợi nhuận / doanh thu</Text>
                <Text>{profitMargin.toFixed(1)}%</Text>
              </div>
              <Progress percent={Math.max(0, Math.min(100, profitMargin))} strokeColor="#0e6b63" />
            </div>
          </Card>
        </Col>

        <Col xs={24} xl={10}>
          <Card className="module-card dashboard-breakdown-card" title="Trạng thái và đội xe">
            <div className="dashboard-status-list">
              {[
                { key: 'completed', label: 'Hoàn thành', color: '#1677ff' },
                { key: 'delivering', label: 'Đang giao', color: '#722ed1' },
                { key: 'waiting', label: 'Chờ hàng', color: '#faad14' },
                { key: 'running', label: 'Đang chạy', color: '#13c2c2' },
                { key: 'planned', label: 'Kế hoạch', color: '#8c8c8c' },
                { key: 'cancelled', label: 'Hủy', color: '#ff4d4f' },
              ].map((item) => (
                <div key={item.key} className="dashboard-status-item">
                  <div className="dashboard-status-label">
                    <span className="dashboard-status-dot" style={{ backgroundColor: item.color }} />
                    <span>{item.label}</span>
                  </div>
                  <Tag color={item.color}>{orders.statusBreakdown?.[item.key] || 0}</Tag>
                </div>
              ))}
            </div>

            <div className="dashboard-vehicle-summary">
              <div>
                <Text type="secondary">Tổng xe</Text>
                <Title level={4}>{vehicles.total || 0}</Title>
              </div>
              <div>
                <Text type="secondary">Đang chạy</Text>
                <Title level={4}>{vehicles.running || 0}</Title>
              </div>
              <div>
                <Text type="secondary">Bảo trì</Text>
                <Title level={4}>{vehicles.maintenance || 0}</Title>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      <Card className="module-card" title="5 đơn gần nhất trong kỳ">
        <Table
          size="small"
          rowKey="id"
          dataSource={recentOrders}
          pagination={false}
          scroll={{ x: 1020 }}
          locale={{ emptyText: <Empty description="Chưa có đơn hàng trong kỳ này" /> }}
          columns={[
            {
              title: 'Ngày đơn',
              dataIndex: 'orderDate',
              width: 140,
              render: (value) => (value ? new Date(value).toLocaleDateString('vi-VN') : '-'),
            },
            { title: 'Xe', dataIndex: 'vehicleLabel', width: 130 },
            { title: 'Tuyến', dataIndex: 'route', width: 220 },
            { title: 'Đối tác', dataIndex: 'partnerName', width: 180 },
            {
              title: 'Tiền đơn',
              dataIndex: 'baseCost',
              width: 140,
              render: (value) => formatCurrency(value),
            },
            {
              title: 'Đền bù',
              dataIndex: 'waitingCost',
              width: 140,
              render: (value, record) => `${formatCurrency(value)} x ${record.waitingDays || 0} ngày`,
            },
            {
              title: 'Doanh thu',
              dataIndex: 'revenue',
              width: 150,
              render: (value) => formatCurrency(value),
            },
            {
              title: 'Trạng thái',
              dataIndex: 'status',
              width: 140,
              render: (status) => (
                <Tag color={status === 'completed' ? 'green' : status === 'cancelled' ? 'red' : 'blue'}>
                  {status}
                </Tag>
              ),
            },
          ]}
        />
      </Card>

      <Card className="module-card">
        <Title level={4}>Truy cập nhanh các trang chức năng</Title>
        <Row gutter={[16, 16]}>
          {dashboardCards.map((item) => (
            <Col xs={24} sm={12} xl={8} key={item.key}>
              <Card className="nav-card" hoverable>
                <Title level={5}>{pageMeta[item.key].title}</Title>
                <Text>{pageMeta[item.key].description}</Text>
                <div className="nav-card-footer">
                  <Button type="primary" onClick={() => onNavigate(item.key)}>
                    Mở trang
                  </Button>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      </Card>
    </div>
  )
}

export default DashboardPage