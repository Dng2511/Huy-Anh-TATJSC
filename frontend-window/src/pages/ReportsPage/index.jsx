import { Card, Descriptions, Progress, Space, Typography } from 'antd'
import './ReportsPage.css'

const { Text } = Typography

function ReportsPage({ t, metrics, formatCurrency }) {
  return (
    <Card title={t('reports.title', 'Bao cao va thong ke')} className="module-card reports-card">
      <Space direction="vertical" size={16} style={{ width: '100%' }}>
        <Descriptions bordered column={1} size="small" className="reports-descriptions">
          <Descriptions.Item label={t('reports.metric.orders', 'So don trong ngay')}>
            {metrics.totalOrdersToday}
          </Descriptions.Item>
          <Descriptions.Item label={t('reports.metric.revenue', 'Doanh thu hom nay')}>
            {formatCurrency(metrics.revenueToday)}
          </Descriptions.Item>
          <Descriptions.Item label={t('reports.metric.activeTrips', 'So chuyen xe dang chay')}>
            {metrics.activeTrips}
          </Descriptions.Item>
        </Descriptions>
        <div className="reports-metric-block">
          <Text strong className="reports-metric-label">
            {t('reports.metric.driverPerformance', 'Hieu suat tai xe trung binh')}
          </Text>
          <Progress percent={metrics.avgDriverPerformance} />
        </div>
        <div className="reports-metric-block">
          <Text strong className="reports-metric-label">
            {t('reports.metric.costRate', 'Ti le chi phi van hanh')}
          </Text>
          <Progress percent={metrics.operationCostRate} status="active" />
        </div>
      </Space>
    </Card>
  )
}

export default ReportsPage
