import { Button, Card, Flex, Input, Select, Space, Table, Tag, Typography } from 'antd'
import './OrdersPage.css'

const { Title, Text } = Typography

function OrdersPage({ statusFilter, setStatusFilter, filteredOrders, orderStatusColor }) {
  return (
    <Card className="module-card no-gap-card">
      <Flex justify="space-between" align="center" wrap="wrap" gap={12}>
        <div>
          <Title level={4}>{'Đơn vận chuyển'}</Title>
          <Text>{'Tạo, sửa, xóa và theo dõi trạng thái đơn hàng.'}</Text>
        </div>
        <Space wrap>
          <Input
            placeholder={'Tìm mã đơn / người nhận'}
            style={{ width: 220 }}
          />
          <Select
            value={statusFilter}
            style={{ width: 170 }}
            onChange={setStatusFilter}
            options={[
              { value: 'Tat ca', label: 'Tất cả trạng thái' },
              { value: 'Cho xu ly', label: 'Chờ xử lý' },
              { value: 'Dang van chuyen', label: 'Đang vận chuyển' },
              { value: 'Da giao', label: 'Đã giao' },
              { value: 'Huy', label: 'Hủy' },
            ]}
          />
          <Button type="primary">{'Thêm đơn'}</Button>
        </Space>
      </Flex>

      <Table
        className="table-spacer"
        rowKey="key"
        dataSource={filteredOrders}
        pagination={{ pageSize: 5 }}
        scroll={{ x: 1080 }}
        columns={[
          { title: 'Mã đơn', dataIndex: 'code', width: 110 },
          { title: 'Người gửi', dataIndex: 'sender', width: 170 },
          { title: 'Người nhận', dataIndex: 'receiver', width: 170 },
          { title: 'Địa chỉ giao', dataIndex: 'address', width: 180 },
          { title: 'Loại hàng', dataIndex: 'cargoType', width: 160 },
          { title: 'Trọng lượng', dataIndex: 'weight', width: 110 },
          { title: 'Kích thước', dataIndex: 'dimension', width: 160 },
          {
            title: 'Trạng thái',
            dataIndex: 'status',
            width: 150,
            render: (status) => <Tag color={orderStatusColor[status]}>{status}</Tag>,
          },
          { title: 'ETA', dataIndex: 'eta', width: 140 },
          {
            title: 'Thao tác',
            width: 180,
            render: () => (
              <Space>
                <Button size="small">{'Sửa'}</Button>
                <Button size="small" danger>
                  {'Xóa'}
                </Button>
              </Space>
            ),
          },
        ]}
      />
    </Card>
  )
}

export default OrdersPage
