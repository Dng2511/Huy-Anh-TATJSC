import { Card, Table, Pagination, Typography, Tag, Modal, Descriptions, message } from 'antd'
import { useEffect, useState } from 'react'
import auditApi from '../../services/Api/auditApi'
import './auditLogsPage.css'

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
    partners: 'Khách hàng',
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
    }},
    {
      title: 'Trạng thái',
      key: 'success',
      render: (_, record) => (
        <Tag color={record.success ? 'success' : 'error'}>
          {record.success ? 'Thành công' : 'Thất bại'}
        </Tag>
      ),
    }
  ]

  const parseJsonValue = (value) => {
  if (!value) return {}

  if (typeof value === 'object') {
    return value
  }

  try {
    return JSON.parse(value)
  } catch {
    return value
  }
}

  const renderJson = (value) => {
    const parsedValue = parseJsonValue(value)

    return (
      <pre
        style={{
          margin: 0,
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
          maxHeight: 300,
          overflow: 'auto',
        }}
      >
        {typeof parsedValue === 'string'
          ? parsedValue
          : JSON.stringify(parsedValue, null, 2)}
      </pre>
    )
  }

  return (
    <Card className="module-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <Title level={4} style={{ margin: 0 }}>Lịch sử thao tác</Title>
      </div>

      <Table
        rowKey={(record) => record._id}
        dataSource={logs}
        columns={columns}
        loading={loading}
        pagination={false}
        onRow={(record) => ({
          onClick: () => setSelected(record),
          style: {
            cursor: 'pointer',
          },
        })}
      />

      <div style={{ marginTop: 12, textAlign: 'right' }}>
        <Pagination current={page} pageSize={PAGE_SIZE} total={total} onChange={(p) => fetchLogs(p)} />
      </div>

      <Modal
        title="Chi tiết bản ghi"
        open={!!selected}
        onCancel={() => setSelected(null)}
        footer={null}
        width={850}
        destroyOnClose
      >
        {selected && (
          <Descriptions column={1} bordered size="small">
            <Descriptions.Item label="Thời gian">
              {selected.createdAt
                ? new Date(selected.createdAt).toLocaleString('vi-VN')
                : '-'}
            </Descriptions.Item>

            <Descriptions.Item label="Người thực hiện">
              {selected.actorName ||
                selected.userName ||
                selected.user?.name ||
                selected.user?.username ||
                '-'}
            </Descriptions.Item>

            <Descriptions.Item label="Hành động">
              {actionLabels[selected.action] || selected.action || '-'}
            </Descriptions.Item>

            <Descriptions.Item label="Phương thức">
              <Tag>{selected.method || '-'}</Tag>
            </Descriptions.Item>

            <Descriptions.Item label="Đường dẫn">
              {selected.path || '-'}
            </Descriptions.Item>

            <Descriptions.Item label="Tài nguyên">
              {resourceLabels[selected.resource] || selected.resource || '-'}

              {(selected.resourceTitle || selected.resourceId) && (
                <>
                  {' / '}
                  {selected.resourceTitle || selected.resourceId}
                </>
              )}
            </Descriptions.Item>

            <Descriptions.Item label="Trạng thái">
              <Tag color={selected.success ? 'success' : 'error'}>
                {selected.success ? 'Thành công' : 'Thất bại'}
              </Tag>

              {selected.statusCode ? (
                <Text style={{ marginLeft: 8 }}>
                  HTTP {selected.statusCode}
                </Text>
              ) : null}
            </Descriptions.Item>

            <Descriptions.Item label="Dữ liệu yêu cầu">
              {renderJson(selected.requestBody)}
            </Descriptions.Item>

            <Descriptions.Item label="Tham số đường dẫn">
              {renderJson(selected.params)}
            </Descriptions.Item>

            <Descriptions.Item label="Tham số truy vấn">
              {renderJson(selected.query)}
            </Descriptions.Item>

            <Descriptions.Item label="Phản hồi">
              {renderJson(selected.responseBody)}
            </Descriptions.Item>

            <Descriptions.Item label="Địa chỉ IP">
              {selected.ip || '-'}
            </Descriptions.Item>

            <Descriptions.Item label="Thiết bị / Trình duyệt">
              <Text style={{ wordBreak: 'break-word' }}>
                {selected.userAgent || '-'}
              </Text>
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </Card>
  )
}
