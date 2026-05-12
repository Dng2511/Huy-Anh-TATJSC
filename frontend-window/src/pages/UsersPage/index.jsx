import { Badge, Button, Card, Space, Table, Tag } from 'antd'

function UsersPage({ users }) {
  return (
    <Card title={'Người dùng và phân quyền'} className="module-card">
      <Table
        rowKey="key"
        dataSource={users}
        pagination={{ pageSize: 5 }}
        scroll={{ x: 840 }}
        columns={[
          { title: 'Người dùng', dataIndex: 'name', width: 180 },
          {
            title: 'Vai trò',
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
          { title: 'Quyền truy cập', dataIndex: 'access', width: 320 },
          {
            title: 'Trạng thái',
            dataIndex: 'status',
            width: 140,
            render: (status) => (
              <Badge color={status === 'Hoat dong' ? 'green' : 'orange'} text={status} />
            ),
          },
          {
            title: 'Hành động',
            width: 180,
            render: () => (
              <Space>
                <Button size="small">Cấp quyền</Button>
                <Button size="small" danger>
                  Khóa
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
