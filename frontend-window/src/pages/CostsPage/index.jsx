import { Card, Table } from 'antd'

function CostsPage({ t, costRows, formatCurrency }) {
  return (
    <Card title={t('costs.title', 'Quan ly chi phi')} className="module-card">
      <Table
        rowKey="key"
        dataSource={costRows}
        pagination={{ pageSize: 5 }}
        scroll={{ x: 760 }}
        columns={[
          { title: t('costs.column.trip', 'Chuyen'), dataIndex: 'trip', width: 100 },
          {
            title: t('costs.column.fuel', 'Nhien lieu'),
            dataIndex: 'fuel',
            width: 130,
            render: (value) => formatCurrency(value),
          },
          {
            title: t('costs.column.toll', 'Cau duong'),
            dataIndex: 'toll',
            width: 130,
            render: (value) => formatCurrency(value),
          },
          {
            title: t('costs.column.shippingFee', 'Phi van chuyen'),
            dataIndex: 'shippingFee',
            width: 150,
            render: (value) => formatCurrency(value),
          },
          {
            title: t('costs.column.driverCost', 'Chi phi tai xe'),
            dataIndex: 'driverCost',
            width: 150,
            render: (value) => formatCurrency(value),
          },
        ]}
      />
    </Card>
  )
}

export default CostsPage
