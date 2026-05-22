import { Button, Card, Flex, Table, Input, Modal, Form, Space, message } from 'antd'
import React from 'react'
import driverApi from '../../services/Api/driverApi'
import useBulkRowDelete from '../../hooks/useBulkRowDelete'
import BulkDeleteButton from '../../components/BulkDeleteButton'

function DriversPage() {
  const [drivers, setDrivers] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false);
  const [creatingDriver, setCreatingDriver] = React.useState(false);
  const [modalMode, setModalMode] = React.useState('create');
  const [editingDriverId, setEditingDriverId] = React.useState(null);
  const [addForm] = Form.useForm();

  const fetchDrivers = async () => {
    try {
      const data = await driverApi.getDrivers();
      setDrivers(data);
    } catch (error) {
      console.error('Error fetching drivers:', error);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchDrivers();
  }, []);

  const handleAddDriver = () => {
    setModalMode('create');
    setEditingDriverId(null);
    addForm.setFieldsValue({
      name: '',
      licenseNumber: '',
      phone: '',
    });
    setIsAddModalOpen(true);
  };

  const handleEditDriver = (record) => {
    setModalMode('edit');
    setEditingDriverId(record._id);
    addForm.setFieldsValue({
      name: record.name,
      licenseNumber: record.licenseNumber,
      phone: record.phone,
    });
    setIsAddModalOpen(true);
  };

  const handleCloseAddModal = () => {
    setIsAddModalOpen(false);
    setModalMode('create');
    setEditingDriverId(null);
    addForm.resetFields();
  };

  const handleSubmitDriver = async () => {
    try {
      const values = await addForm.validateFields();
      setCreatingDriver(true);
      if (modalMode === 'edit' && editingDriverId) {
        await driverApi.updateDriver(editingDriverId, values);
        message.success('Cập nhật tài xế thành công');
      } else {
        await driverApi.createDriver(values);
        message.success('Thêm tài xế thành công');
      }
      handleCloseAddModal();
      await fetchDrivers();
    } catch (error) {
      if (error?.errorFields) return;
      console.error('Error saving driver:', error);
      message.error(modalMode === 'edit' ? 'Lỗi khi cập nhật tài xế' : 'Lỗi khi thêm tài xế');
    } finally {
      setCreatingDriver(false);
    }
  };

  const {
    selectedRowKeys,
    rowSelection,
    handleDeleteSelected,
  } = useBulkRowDelete({
    deleteItems: (ids) => driverApi.deleteDrivers(ids),
    onDeleted: fetchDrivers,
    getEmptyMessage: () => 'Vui lòng chọn tài xế cần xóa',
    getConfirmMessage: () => 'Bạn có chắc chắn muốn xóa những tài xế này?',
    getErrorMessage: () => 'Lỗi khi xóa tài xế',
    setLoading,
    confirmTitle: 'Xác nhận xóa tài xế',
    confirmOkText: 'Xóa',
    confirmCancelText: 'Hủy',
  });


  return (
    <Card className="module-card">
      <Flex justify="space-between" align="center" wrap="wrap" gap={12} style={{ marginBottom: 16 }}>
        <h2 style={{ margin: 0 }}>{'Danh sách tài xế'}</h2>
        <Button 
          type="primary" 
          onClick={handleAddDriver}
        >
          {'Thêm tài xế'}
        </Button>
      </Flex>
      <Table
        rowKey="_id"
        dataSource={drivers}
        loading={loading}
        pagination={{ pageSize: 8 }}
        rowSelection={rowSelection}
        columns={[
          {
            title: 'Tên',
            dataIndex: 'name',
          },
          {
            title: 'Bằng lái',
            dataIndex: 'licenseNumber',
          },
          {
            title: 'Số điện thoại',
            dataIndex: 'phone',
          },
          {
            title: 'Hành động',
            key: 'actions',
            render: (_, record) => (
              <Button size="small" onClick={() => handleEditDriver(record)}>
                {'Sửa'}
              </Button>
            ),
          },
        ]}
      />
      <BulkDeleteButton 
        selectedRowKeys={selectedRowKeys}
        onClick={handleDeleteSelected}
        label="Xóa tài xế"
      />
      <Modal
        title={modalMode === 'edit' ? 'Chỉnh sửa tài xế' : 'Thêm tài xế'}
        open={isAddModalOpen}
        onOk={handleSubmitDriver}
        onCancel={handleCloseAddModal}
        okText={modalMode === 'edit' ? 'Cập nhật' : 'Lưu'}
        cancelText={'Hủy'}
        confirmLoading={creatingDriver}
        destroyOnHidden
      >
        <Form form={addForm} layout="vertical">
          <Form.Item
            label={'Tên'}
            name="name"
            rules={[{ required: true, message: 'Vui lòng nhập tên tài xế' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label={'Bằng lái'}
            name="licenseNumber"
            rules={[{ required: true, message: 'Vui lòng nhập số bằng lái' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label={'Số điện thoại'}
            name="phone"
            rules={[{ required: true, message: 'Vui lòng nhập số điện thoại' }]}
          >
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  )
}

export default DriversPage;
