import { Button, Card, Flex, Input, Select, Space, Table, Tag, Typography } from 'antd'
import './OrdersPage.css'

const { Title, Text } = Typography

function OrdersPage({ t, statusFilter, setStatusFilter, filteredOrders, orderStatusColor }) {
  return (
    <Card className="module-card no-gap-card">
      <Flex justify="space-between" align="center" wrap="wrap" gap={12}>
        <div>
          <Title level={4}>{t('orders.title', 'Don van chuyen')}</Title>
          <Text>{t('orders.description', 'Tao, sua, xoa va theo doi trang thai don hang.')}</Text>
        </div>
        <Space wrap>
          <Input
            placeholder={t('orders.searchPlaceholder', 'Tim ma don / nguoi nhan')}
            style={{ width: 220 }}
          />
          <Select
            value={statusFilter}
            style={{ width: 170 }}
            onChange={setStatusFilter}
            options={[
              { value: 'Tat ca', label: t('orders.filter.allLabel', 'Tat ca trang thai') },
              { value: 'Cho xu ly', label: t('status.pending', 'Cho xu ly') },
              { value: 'Dang van chuyen', label: t('status.inTransit', 'Dang van chuyen') },
              { value: 'Da giao', label: t('status.delivered', 'Da giao') },
              { value: 'Huy', label: t('status.cancelled', 'Huy') },
            ]}
          />
          <Button type="primary">{t('orders.addOrder', 'Them don')}</Button>
        </Space>
      </Flex>

      <Table
        className="table-spacer"
        rowKey="key"
        dataSource={filteredOrders}
        pagination={{ pageSize: 5 }}
        scroll={{ x: 1080 }}
        columns={[
          { title: t('orders.column.code', 'Ma don'), dataIndex: 'code', width: 110 },
          { title: t('orders.column.sender', 'Nguoi gui'), dataIndex: 'sender', width: 170 },
          { title: t('orders.column.receiver', 'Nguoi nhan'), dataIndex: 'receiver', width: 170 },
          { title: t('orders.column.address', 'Dia chi giao'), dataIndex: 'address', width: 180 },
          { title: t('orders.column.cargo', 'Loai hang'), dataIndex: 'cargoType', width: 160 },
          { title: t('orders.column.weight', 'Trong luong'), dataIndex: 'weight', width: 110 },
          { title: t('orders.column.dimension', 'Kich thuoc'), dataIndex: 'dimension', width: 160 },
          {
            title: t('common.status', 'Trang thai'),
            dataIndex: 'status',
            width: 150,
            render: (status) => <Tag color={orderStatusColor[status]}>{status}</Tag>,
          },
          { title: t('common.eta', 'ETA'), dataIndex: 'eta', width: 140 },
          {
            title: t('orders.column.action', 'Thao tac'),
            width: 180,
            render: () => (
              <Space>
                <Button size="small">{t('action.edit', 'Sua')}</Button>
                <Button size="small" danger>
                  {t('action.delete', 'Xoa')}
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
