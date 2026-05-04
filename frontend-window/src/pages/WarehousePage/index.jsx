import { Card, Table, Tag } from 'antd'

function WarehousePage({ t, inventory }) {
  return (
    <Card title={t('warehouse.title', 'Quan ly kho hang')} className="module-card">
      <Table
        rowKey="key"
        dataSource={inventory}
        pagination={{ pageSize: 5 }}
        scroll={{ x: 760 }}
        columns={[
          { title: t('warehouse.column.warehouse', 'Kho'), dataIndex: 'warehouse', width: 170 },
          { title: 'SKU', dataIndex: 'sku', width: 100 },
          { title: t('warehouse.column.product', 'Hang hoa'), dataIndex: 'product', width: 160 },
          { title: t('warehouse.column.inbound', 'Nhap'), dataIndex: 'inbound', width: 90 },
          { title: t('warehouse.column.outbound', 'Xuat'), dataIndex: 'outbound', width: 90 },
          {
            title: t('warehouse.column.stock', 'Ton'),
            dataIndex: 'stock',
            width: 90,
            render: (stock) => <Tag color={stock > 50 ? 'green' : 'orange'}>{stock}</Tag>,
          },
          { title: t('warehouse.column.position', 'Vi tri'), dataIndex: 'position', width: 110 },
        ]}
      />
    </Card>
  )
}

export default WarehousePage
