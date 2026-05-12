import { Badge, Card, Progress, Table } from 'antd'

function VehiclesPage({ vehicles, vehicleStatusColor }) {
  return (
    <Card title={'Danh sách phương tiện'} className="module-card">
      <Table
        rowKey="key"
        dataSource={vehicles}
        pagination={{ pageSize: 5 }}
        scroll={{ x: 720 }}
        columns={[
          { title: 'Biển số', dataIndex: 'plate' },
          { title: 'Loại xe', dataIndex: 'type' },
          { title: 'Tải trọng', dataIndex: 'capacity' },
          {
            title: 'Trạng thái',
            dataIndex: 'status',
            render: (status) => <Badge color={vehicleStatusColor[status]} text={status} />,
          },
          {
            title: 'Nhiên liệu',
            dataIndex: 'fuel',
            render: (fuel) => <Progress percent={fuel} size="small" />,
          },
          { title: 'Tuyến hiện tại', dataIndex: 'route' },
        ]}
      />
    </Card>
  )
}

export default VehiclesPage
