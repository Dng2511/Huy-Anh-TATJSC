import { Card, Table, Pagination, Typography, Modal, Descriptions, message } from 'antd'
import { useEffect, useState } from 'react'
import auditApi from '../../services/Api/auditApi'

const { Title, Text } = Typography

const PAGE_SIZE = 8

export default function AuditLogsPage() {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [selected, setSelected] = useState(null)

  const fetchLogs = async (p = 1) => {
    setLoading(true)
    try {
      const data = await auditApi.getLogs({ page: p, limit: PAGE_SIZE })
      setLogs(data.items || [])
      setTotal(data.pagination?.totalItems || 0)
      setPage(p)
    } catch (err) {
      console.error('Error loading audit logs', err)
      message.error('Lỗi khi tải lịch sử thao tác')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLogs(1)
  }, [])

  const actionLabels = {
    create: 'Tạo',
    update: 'Cập nhật',
    delete: 'Xóa',
  }

  const resourceLabels = {
    users: 'Người dùng',
    orders: 'Đơn hàng',
    vehicles: 'Phương tiện',
    drivers: 'Tài xế',
    gates: 'Cửa khẩu',
    partners: 'Đối tác',
    audit: 'Lịch sử thao tác',
  }

  const columns = [
    { title: 'Thời gian', dataIndex: 'createdAt', key: 'createdAt', render: (v) => (v ? new Date(v).toLocaleString() : '-') },
    { title: 'Người thực hiện', key: 'actor', render: (_, record) => (record.actorName || record.userName || (record.user && (record.user.name || record.user.username)) || '-') },
    { title: 'Hành động', key: 'action', render: (_, record) => actionLabels[record.action] || record.action || '-' },
    { title: 'Tài nguyên', key: 'resource', render: (_, record) => {
      const resKey = record.resource || ''
      const label = resourceLabels[resKey] || resKey || '-'
      if (record.resourceTitle) return `${label} (${record.resourceTitle})`
      if (record.resourceId) return `${label} (${record.resourceId})`
      return label
    } },
  ]

  return (
    <Card className="module-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <Title level={4} style={{ margin: 0 }}>Lịch sử thao tác</Title>
        <Text type="secondary">Chỉ xem - không có nút thêm/xóa</Text>
      </div>

      <Table
        rowKey={(r) => r._id}
        dataSource={logs}
        columns={columns}
        loading={loading}
        pagination={false}
        onRow={(record) => ({
          onClick: () => setSelected(record),
        })}
      />

      <div style={{ marginTop: 12, textAlign: 'right' }}>
        <Pagination current={page} pageSize={PAGE_SIZE} total={total} onChange={(p) => fetchLogs(p)} />
      </div>

      <Modal
        title="Chi tiết bản ghi"
        visible={!!selected}
        onCancel={() => setSelected(null)}
        footer={null}
        width={800}
      >
        {selected && (
          <Descriptions column={1} bordered>
            <Descriptions.Item label="Thời gian">{new Date(selected.createdAt).toLocaleString()}</Descriptions.Item>
            <Descriptions.Item label="Người thực hiện">{selected.actorName || selected.userName}</Descriptions.Item>
            <Descriptions.Item label="Hành động">{actionLabels[selected.action] || selected.action}</Descriptions.Item>
            <Descriptions.Item label="Đường dẫn">{selected.path}</Descriptions.Item>
            <Descriptions.Item label="Tài nguyên">{(resourceLabels[selected.resource] || selected.resource) || '-'}{selected.resourceTitle ? ` / ${selected.resourceTitle}` : (selected.resourceId ? ` / ${selected.resourceId}` : '')}</Descriptions.Item>
            <Descriptions.Item label="Yêu cầu">{JSON.stringify(selected.requestBody || selected.params || selected.query || {}, null, 2)}</Descriptions.Item>
            <Descriptions.Item label="Phản hồi">{JSON.stringify(selected.responseBody || {}, null, 2)}</Descriptions.Item>
            <Descriptions.Item label="IP / UA">{selected.ip} / {selected.userAgent}</Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </Card>
  )
}
