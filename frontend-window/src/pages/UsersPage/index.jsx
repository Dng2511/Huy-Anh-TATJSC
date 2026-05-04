import { Badge, Button, Card, Space, Table, Tag } from 'antd'

function UsersPage({ t, users }) {
  return (
    <Card title={t('users.title', 'Nguoi dung va phan quyen')} className="module-card">
      <Table
        rowKey="key"
        dataSource={users}
        pagination={{ pageSize: 5 }}
        scroll={{ x: 840 }}
        columns={[
          { title: t('users.column.user', 'Nguoi dung'), dataIndex: 'name', width: 180 },
          {
            title: t('users.column.role', 'Vai tro'),
            dataIndex: 'role',
            width: 150,
            render: (role) => {
              const roleColor =
                role === 'Admin'
                  ? 'red'
                  : role === 'Dieu phoi van tai'
                    ? 'blue'
                    : role === 'Tai xe'
                      ? 'green'
                      : 'geekblue'
              return <Tag color={roleColor}>{role}</Tag>
            },
          },
          { title: t('users.column.access', 'Quyen truy cap'), dataIndex: 'access', width: 320 },
          {
            title: t('common.status', 'Trang thai'),
            dataIndex: 'status',
            width: 140,
            render: (status) => (
              <Badge color={status === 'Hoat dong' ? 'green' : 'orange'} text={status} />
            ),
          },
          {
            title: t('users.column.action', 'Hanh dong'),
            width: 180,
            render: () => (
              <Space>
                <Button size="small">{t('users.action.grant', 'Cap quyen')}</Button>
                <Button size="small" danger>
                  {t('users.action.lock', 'Khoa')}
                </Button>
              </Space>
            ),
          },
        ]}
      />
    </Card>
  )
}

export default UsersPage
