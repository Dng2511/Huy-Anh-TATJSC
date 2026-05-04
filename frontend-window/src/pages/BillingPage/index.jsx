import { Card, Table, Tag } from 'antd'

function BillingPage({ t, invoices, formatCurrency }) {
  return (
    <Card title={t('billing.title', 'Thanh toan va hoa don')} className="module-card">
      <Table
        rowKey="key"
        dataSource={invoices}
        pagination={{ pageSize: 5 }}
        scroll={{ x: 800 }}
        columns={[
          { title: t('billing.column.invoiceNo', 'So hoa don'), dataIndex: 'invoiceNo', width: 170 },
          { title: t('billing.column.customer', 'Khach hang'), dataIndex: 'customer', width: 150 },
          {
            title: t('billing.column.amount', 'Gia tri'),
            dataIndex: 'amount',
            width: 140,
            render: (value) => formatCurrency(value),
          },
          {
            title: t('billing.column.payment', 'Thanh toan'),
            dataIndex: 'payment',
            width: 130,
            render: (status) => (
              <Tag
                color={
                  status === 'Da thanh toan'
                    ? 'green'
                    : status === 'Cho thanh toan'
                      ? 'gold'
                      : 'red'
                }
              >
                {status}
              </Tag>
            ),
          },
          { title: t('billing.column.channel', 'Kenh'), dataIndex: 'channel', width: 130 },
          { title: t('billing.column.date', 'Ngay'), dataIndex: 'date', width: 100 },
        ]}
      />
    </Card>
  )
}

export default BillingPage
