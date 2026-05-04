import { Badge, Card, Table, Tag } from 'antd'

function DriversPage({ t, drivers, driverStatusColor }) {
  return (
    <Card title={t('drivers.title', 'Danh sach tai xe')} className="module-card">
      <Table
        rowKey="key"
        dataSource={drivers}
        pagination={{ pageSize: 5 }}
        scroll={{ x: 780 }}
        columns={[
          { title: t('drivers.column.name', 'Tai xe'), dataIndex: 'name' },
          { title: t('drivers.column.license', 'Bang lai'), dataIndex: 'license' },
          { title: t('drivers.column.phone', 'So dien thoai'), dataIndex: 'phone' },
          { title: t('drivers.column.schedule', 'Lich trinh'), dataIndex: 'schedule' },
          {
            title: t('common.status', 'Trang thai'),
            dataIndex: 'status',
            render: (status) => <Badge color={driverStatusColor[status]} text={status} />,
          },
          {
            title: t('drivers.column.performance', 'Hieu suat'),
            dataIndex: 'score',
            render: (score) => <Tag color={score > 90 ? 'green' : 'gold'}>{score}%</Tag>,
          },
        ]}
      />
    </Card>
  )
}

export default DriversPage
