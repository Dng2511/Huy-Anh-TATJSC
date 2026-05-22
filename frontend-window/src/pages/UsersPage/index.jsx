import React, { useEffect, useMemo, useState } from 'react'
import { Button, Card, Flex, Form, Input, Modal, Pagination, Select, Table, Tag, message } from 'antd'
import userApi from '../../services/Api/userApi'
import useBulkRowDelete from '../../hooks/useBulkRowDelete'
import BulkDeleteButton from '../../components/BulkDeleteButton'

const PAGE_SIZE = 8

function UsersPage() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState('create')
  const [editingUser, setEditingUser] = useState(null)
  const [saving, setSaving] = useState(false)
  const [form] = Form.useForm()

  const fetchUsers = async (page = 1, nextSearch = search, nextRole = roleFilter) => {
    setLoading(true)
    try {
      const response = await userApi.getUsers({
        page,
        limit: PAGE_SIZE,
        ...(nextSearch ? { search: nextSearch } : {}),
        ...(nextRole ? { role: nextRole } : {}),
      })

      const data = response?.data || response || {}
      setUsers(data.items || [])
      setTotalItems(data.pagination?.totalItems || 0)
      setCurrentPage(data.pagination?.page || page)
    } catch (error) {
      console.error('Error fetching users:', error)
      message.error('Lỗi khi tải danh sách người dùng')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers(1)
  }, [])

  const openCreateModal = () => {
    setModalMode('create')
    setEditingUser(null)
    form.resetFields()
    form.setFieldsValue({ role: 'user' })
    setIsModalOpen(true)
  }

  const openEditModal = (record) => {
    setModalMode('edit')
    setEditingUser(record)
    form.setFieldsValue({
      name: record.name,
      username: record.username,
      password: '',
      role: record.role || 'user',
    })
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingUser(null)
    form.resetFields()
  }

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      setSaving(true)

      const payload = {
        name: values.name,
        username: values.username,
        role: values.role,
      }

      if (values.password?.trim()) {
        payload.password = values.password
      }

      if (modalMode === 'edit' && editingUser?._id) {
        await userApi.updateUser(editingUser._id, payload)
        message.success('Cập nhật tài khoản thành công')
      } else {
        await userApi.createUser({ ...payload, password: values.password })
        message.success('Thêm tài khoản thành công')
      }

      closeModal()
      await fetchUsers(currentPage)
    } catch (error) {
      if (error?.errorFields) {
        return
      }

      console.error('Error saving user:', error)
      message.error(modalMode === 'edit' ? 'Lỗi khi cập nhật tài khoản' : 'Lỗi khi thêm tài khoản')
    } finally {
      setSaving(false)
    }
  }

  const { selectedRowKeys, rowSelection, handleDeleteSelected } = useBulkRowDelete({
    deleteItems: (ids) => userApi.deleteUsers(ids),
    onDeleted: async () => {
      const nextPage = users.length === 1 && currentPage > 1 ? currentPage - 1 : currentPage
      await fetchUsers(nextPage)
    },
    getEmptyMessage: () => 'Vui lòng chọn tài khoản cần xóa',
    getConfirmMessage: () => 'Bạn có chắc chắn muốn xóa các tài khoản đã chọn?',
    getErrorMessage: () => 'Lỗi khi xóa tài khoản',
    setLoading,
    confirmTitle: 'Xác nhận xóa tài khoản',
    confirmOkText: 'Xóa',
    confirmCancelText: 'Hủy',
  })

  const handlePageChange = (page) => {
    fetchUsers(page)
  }

  const roleOptions = useMemo(() => ([
    { label: 'Tất cả vai trò', value: null },
    { label: 'Admin', value: 'admin' },
    { label: 'User', value: 'user' },
  ]), [])

  return (
    <Card className="module-card">
      <Flex justify="space-between" align="center" wrap="wrap" gap={12} style={{ marginBottom: 16 }}>
        <h2 style={{ margin: 0 }}>Danh sách người dùng</h2>
        <Button type="primary" onClick={openCreateModal}>
          Thêm tài khoản
        </Button>
      </Flex>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12, marginBottom: 16 }}>
        <Input
          placeholder="Tìm theo tên hoặc username"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          onPressEnter={() => fetchUsers(1, search, roleFilter)}
          allowClear
        />
        <Select
          value={roleFilter}
          onChange={(value) => {
            setRoleFilter(value)
            fetchUsers(1, search, value)
          }}
          options={roleOptions}
        />
        <Button onClick={() => fetchUsers(1, search, roleFilter)}>
          Tìm kiếm
        </Button>
      </div>

      <Table
        rowKey="_id"
        dataSource={users}
        loading={loading}
        pagination={false}
        rowSelection={rowSelection}
        columns={[
          {
            title: 'Họ tên',
            dataIndex: 'name',
          },
          {
            title: 'Username',
            dataIndex: 'username',
          },
          {
            title: 'Vai trò',
            dataIndex: 'role',
            render: (role) => (
              <Tag color={role === 'admin' ? 'red' : 'blue'}>
                {role === 'admin' ? 'Admin' : 'User'}
              </Tag>
            ),
          },
          {
            title: 'Hành động',
            key: 'actions',
            render: (_, record) => (
              <Button size="small" onClick={() => openEditModal(record)}>
                Sửa
              </Button>
            ),
          },
        ]}
      />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, gap: 12, flexWrap: 'wrap' }}>
        <div style={{ paddingTop: 60 }}>
          <BulkDeleteButton
            selectedRowKeys={selectedRowKeys}
            onClick={handleDeleteSelected}
            label="Xóa tài khoản"
          />
        </div>

        <Pagination
          current={currentPage}
          pageSize={PAGE_SIZE}
          total={totalItems}
          onChange={handlePageChange}
          showTotal={(total) => `Tổng ${total} tài khoản`}
        />
      </div>

      <Modal
        title={modalMode === 'edit' ? 'Chỉnh sửa tài khoản' : 'Thêm tài khoản mới'}
        open={isModalOpen}
        onOk={handleSubmit}
        onCancel={closeModal}
        okText={modalMode === 'edit' ? 'Cập nhật' : 'Lưu'}
        cancelText="Hủy"
        confirmLoading={saving}
        destroyOnHidden
      >
        <Form form={form} layout="vertical" autoComplete="off">
          <Form.Item
            label="Họ tên"
            name="name"
            rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Username"
            name="username"
            rules={[{ required: true, message: 'Vui lòng nhập username' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label={modalMode === 'edit' ? 'Mật khẩu mới' : 'Mật khẩu'}
            name="password"
            rules={modalMode === 'edit' ? [] : [{ required: true, message: 'Vui lòng nhập mật khẩu' }]}
            extra={modalMode === 'edit' ? 'Để trống nếu không đổi mật khẩu' : undefined}
          >
            <Input.Password autoComplete="new-password" />
          </Form.Item>

          <Form.Item
            label="Vai trò"
            name="role"
            rules={[{ required: true, message: 'Vui lòng chọn vai trò' }]}
          >
            <Select
              options={[
                { label: 'Admin', value: 'admin' },
                { label: 'User', value: 'user' },
              ]}
            />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  )
}

export default UsersPage
