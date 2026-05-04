import { Badge, Card, Progress, Table } from 'antd'

function VehiclesPage({ t, vehicles, vehicleStatusColor }) {
  return (
    <Card title={t('vehicles.title', 'Danh sach phuong tien')} className="module-card">
      <Table
        rowKey="key"
        dataSource={vehicles}
        pagination={{ pageSize: 5 }}
        scroll={{ x: 720 }}
        columns={[
          { title: t('vehicles.column.plate', 'Bien so'), dataIndex: 'plate' },
          { title: t('vehicles.column.type', 'Loai xe'), dataIndex: 'type' },
          { title: t('vehicles.column.capacity', 'Tai trong'), dataIndex: 'capacity' },
          {
            title: t('common.status', 'Trang thai'),
            dataIndex: 'status',
            render: (status) => <Badge color={vehicleStatusColor[status]} text={status} />,
          },
          {
            title: t('vehicles.column.fuel', 'Nhien lieu'),
            dataIndex: 'fuel',
            render: (fuel) => <Progress percent={fuel} size="small" />,
          },
          { title: t('vehicles.column.route', 'Tuyen hien tai'), dataIndex: 'route' },
        ]}
      />
    </Card>
  )
}

export default VehiclesPage
