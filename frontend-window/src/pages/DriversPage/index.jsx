import { Button, Card, Flex, Table, Input, Select, Modal, Form } from 'antd'
import React from 'react'
import driverApi from '../../services/Api/driverApi'
import useInlineRowEdit from '../../hooks/useInlineRowEdit'

function DriversPage() {
  const [drivers, setDrivers] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [selectedRowKeys, setSelectedRowKeys] = React.useState([]);
  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false);
  const [creatingDriver, setCreatingDriver] = React.useState(false);
  const containerRef = React.useRef(null);
  const [addForm] = Form.useForm();
  const driverStatusColor = {
    available: 'green',
    on_trip: 'blue',
    off: 'red',
  };

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
    addForm.setFieldsValue({
      name: '',
      licenseNumber: '',
      phone: '',
      status: 'available',
    });
    setIsAddModalOpen(true);
  };

  const handleCloseAddModal = () => {
    setIsAddModalOpen(false);
    addForm.resetFields();
  };

  const handleCreateDriver = async () => {
    try {
      const values = await addForm.validateFields();
      setCreatingDriver(true);
      await driverApi.createDriver(values);
      handleCloseAddModal();
      await fetchDrivers();
    } catch (error) {
      if (error?.errorFields) return;
      console.error('Error creating driver:', error);
      alert('Lỗi khi thêm tài xế');
    } finally {
      setCreatingDriver(false);
    }
  };

  const {
    editingRowId,
    editedRowData,
    setEditedRowData,
    setOriginalRowData,
    handleEnterEdit,
  } = useInlineRowEdit({
    containerRef,
    getInitialData: (record) => ({
      name: record.name,
      licenseNumber: record.licenseNumber,
      phone: record.phone,
      status: record.status,
    }),
    onSave: async (id, data) => {
      try {
        setLoading(true);
        await driverApi.updateDriver(id, data);
        await fetchDrivers();
      } catch (error) {
        console.error('Error saving driver:', error);
        alert('Lỗi khi lưu tài xế');
        throw error;
      } finally {
        setLoading(false);
      }
    },
    confirmSaveOutside: () => window.confirm('Bạn có muốn lưu thay đổi trước khi thoát?'),
    confirmSaveShortcut: () => window.confirm('Bạn có muốn lưu các thay đổi?'),
  });

  const handleDeleteDrivers = async () => {
    if (selectedRowKeys.length === 0) {
      alert('Vui lòng chọn tài xế cần xóa');
      return;
    }

    if (window.confirm('Bạn có chắc chắn muốn xóa những tài xế này?')) {
      try {
        setLoading(true);
        await driverApi.deleteDrivers(selectedRowKeys);
        setSelectedRowKeys([]);
        await fetchDrivers();
      } catch (error) {
        console.error('Error deleting drivers:', error);
        alert('Lỗi khi xóa tài xế');
      }
    }
  };

  const handleQuickStatusChange = async (record, value) => {
    const previousStatus = record.status;
    if (previousStatus === value) return;

    try {
      setLoading(true);
      const payload = {
        name: record.name,
        licenseNumber: record.licenseNumber,
        phone: record.phone,
        status: value,
      };
      await driverApi.updateDriver(record._id, payload);

      setDrivers((prev) =>
        prev.map((driver) =>
          driver._id === record._id ? { ...driver, status: value } : driver
        )
      );

      if (editingRowId === record._id) {
        setEditedRowData((prev) => ({ ...prev, status: value }));
        setOriginalRowData((prev) => ({ ...prev, status: value }));
      }
    } catch (error) {
      console.error('Error updating driver status:', error);
      alert('Lỗi khi lưu tài xế');
      setDrivers((prev) =>
        prev.map((driver) =>
          driver._id === record._id ? { ...driver, status: previousStatus } : driver
        )
      );
    } finally {
      setLoading(false);
    }
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: (newSelectedRowKeys) => {
      setSelectedRowKeys(newSelectedRowKeys);
    },
    hideSelectAll: true,
  };

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
      <div ref={containerRef}>
      <Table
        rowKey="_id"
        dataSource={drivers}
        loading={loading}
        pagination={{ pageSize: 8 }}
        scroll={{ x: 780 }}
        rowSelection={rowSelection}
        onRow={(record) => ({
          onDoubleClick: () => handleEnterEdit(record),
        })}
        columns={[
          {
            title: 'Tên',
            dataIndex: 'name',
            render: (text, record) => (
              editingRowId === record._id
                ? <Input value={editedRowData.name} onChange={(e) => setEditedRowData(prev => ({ ...prev, name: e.target.value }))} />
                : text
            ),
          },
          {
            title: 'Bằng lái',
            dataIndex: 'licenseNumber',
            render: (text, record) => (
              editingRowId === record._id
                ? <Input value={editedRowData.licenseNumber} onChange={(e) => setEditedRowData(prev => ({ ...prev, licenseNumber: e.target.value }))} />
                : text
            ),
          },
          {
            title: 'Số điện thoại',
            dataIndex: 'phone',
            render: (text, record) => (
              editingRowId === record._id
                ? <Input value={editedRowData.phone} onChange={(e) => setEditedRowData(prev => ({ ...prev, phone: e.target.value }))} />
                : text
            ),
          },
          {
            title: 'Trạng thái',
            dataIndex: 'status',
            render: (status, record) => (
              <Select
                value={editingRowId === record._id ? editedRowData.status : status}
                onChange={(value) => handleQuickStatusChange(record, value)}
                style={{ width: 140 }}
                options={Object.keys(driverStatusColor).map((key) => ({ value: key, label: key === 'available' ? 'Sẵn sàng' : key === 'on_trip' ? 'Đang chuyến' : key === 'off' ? 'Nghỉ' : key }))}
              />
            ),
          },
        ]}
      />
      <Flex justify="flex-start" align="flex-end" style={{ marginTop: -50 }}>
        <Button 
          danger 
          disabled={selectedRowKeys.length === 0}
          onClick={handleDeleteDrivers}
        >
          {'Xóa tài xế'} ({selectedRowKeys.length})
        </Button>
      </Flex>
      </div>
      <Modal
        title={'Thêm tài xế'}
        open={isAddModalOpen}
        onOk={handleCreateDriver}
        onCancel={handleCloseAddModal}
        okText={'Lưu'}
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

          <Form.Item
            label={'Trạng thái'}
            name="status"
            rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}
          >
            <Select
              options={Object.keys(driverStatusColor).map((key) => ({
                value: key,
                label: key === 'available' ? 'Sẵn sàng' : key === 'on_trip' ? 'Đang chuyến' : key === 'off' ? 'Nghỉ' : key,
              }))}
            />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  )
}

export default DriversPage;
