import React, { useEffect, useMemo, useRef, useState } from 'react'
import {
  Alert,
  Button,
  Card,
  Collapse,
  Divider,
  Empty,
  Input,
  InputNumber,
  Modal,
  Select,
  Space,
  Spin,
  Switch,
  Table,
  Typography,
  message,
} from 'antd'
import partnerApi from '../../services/Api/partnerApi'
import gateApi from '../../services/Api/gateApi'
import AddGateModal from '../GatesPage/AddGateModal'
import './PartnersPage.css'

const { Text } = Typography
const ADD_GATE_OPTION_VALUE = '__ADD_NEW_GATE__'
const DEFAULT_GATE_MAP_CENTER = [21.0, 105.5]
const DEFAULT_GATE_MAP_ZOOM = 6

const normalizeRate = (rate) => ({
  pickup: rate?.pickup || '',
  delivery: rate?.delivery || '',
  isReefer: !!rate?.isReefer,
  fixedCost: Number(rate?.fixedCost) || 0,
})

const buildComparablePartner = (partner) => ({
  name: partner?.name || '',
  contact: {
    phone: partner?.contact?.phone || '',
    email: partner?.contact?.email || '',
  },
  waitingCost: Number(partner?.waitingCost) || 0,
  rates: (partner?.rates || []).map(normalizeRate),
})

function PartnersPage({ onDirtyChange }) {
  const [gates, setGates] = useState([])
  const [originalPartners, setOriginalPartners] = useState([])
  const [draftPartners, setDraftPartners] = useState([])
  const [selectedRateKeys, setSelectedRateKeys] = useState({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [savingPartnerIds, setSavingPartnerIds] = useState({})
  const [isAddGateModalOpen, setIsAddGateModalOpen] = useState(false)
  const [creatingGate, setCreatingGate] = useState(false)
  const [pendingRateField, setPendingRateField] = useState(null)
  const localRateCounterRef = useRef(0)

  useEffect(() => {
    fetchData()
  }, [])

  const toDraftPartner = (partner) => ({
    _id: partner._id,
    name: partner.name || '',
    contact: {
      phone: partner.contact?.phone || '',
      email: partner.contact?.email || '',
    },
    waitingCost: Number(partner.waitingCost) || 0,
    rates: (partner.rates || []).map((rate, index) => ({
      ...normalizeRate(rate),
      _localId: `${partner._id}-${index}-${rate.pickup}-${rate.delivery}-${!!rate.isReefer}`,
      _isNew: false,
    })),
  })

  const fetchData = async () => {
    try {
      setLoading(true)
      const [gatesData, partnersData] = await Promise.all([
        gateApi.getGates(),
        partnerApi.getPartners(),
      ])
      const gateList = gatesData.data || []
      const partnerList = partnersData.data || []

      setGates(gateList)
      setOriginalPartners(partnerList)
      setDraftPartners(partnerList.map(toDraftPartner))
      setSelectedRateKeys({})

    } catch (error) {
      console.error('Error fetching data:', error)
      message.error('Không thể tải dữ liệu đối tác')
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(value)
  }

  const originalPartnerMap = useMemo(
    () => Object.fromEntries(originalPartners.map((partner) => [partner._id, buildComparablePartner(partner)])),
    [originalPartners]
  )

  const dirtyPartnerIds = useMemo(
    () => draftPartners
      .filter((partner) => {
        const original = originalPartnerMap[partner._id]
        if (!original) {
          return false
        }
        return JSON.stringify(buildComparablePartner(partner)) !== JSON.stringify(original)
      })
      .map((partner) => partner._id),
    [draftPartners, originalPartnerMap]
  )

  const hasUnsavedChanges = dirtyPartnerIds.length > 0

  useEffect(() => {
    onDirtyChange?.(hasUnsavedChanges)
  }, [onDirtyChange, hasUnsavedChanges])

  useEffect(() => {
    if (!hasUnsavedChanges) {
      return undefined
    }

    const handleBeforeUnload = (event) => {
      event.preventDefault()
      event.returnValue = ''
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [hasUnsavedChanges])

  const gateOptions = useMemo(
    () => [
      { value: ADD_GATE_OPTION_VALUE, label: '+ Thêm cửa khẩu mới' },
      ...gates.map((gate) => ({ value: gate._id, label: gate.name })),
    ],
    [gates]
  )

  const getLatestGateList = async () => {
    const gatesData = await gateApi.getGates()
    const gateList = gatesData?.data || []
    setGates(gateList)
    return gateList
  }

  const openAddGateModalForRateField = (partnerId, rateLocalId, field) => {
    setPendingRateField({ partnerId, rateLocalId, field })
    setIsAddGateModalOpen(true)
  }

  const closeAddGateModal = () => {
    setIsAddGateModalOpen(false)
    setPendingRateField(null)
  }

  const handleRateGateChange = (partnerId, rateLocalId, field, value) => {
    if (value === ADD_GATE_OPTION_VALUE) {
      openAddGateModalForRateField(partnerId, rateLocalId, field)
      return
    }

    updateRateField(partnerId, rateLocalId, field, value)
  }

  const handleCreateGateFromPartnerPage = async (gateData) => {
    setCreatingGate(true)
    try {
      const createdResponse = await gateApi.createGate(gateData)
      const createdGate = createdResponse?.data || createdResponse
      const latestGates = await getLatestGateList()

      const createdGateId = createdGate?._id || createdGate?.id || latestGates.find((gate) => (
        gate?.name === gateData.name
        && gate?.location === gateData.location
        && Number(gate?.locate?.lat) === Number(gateData?.locate?.lat)
        && Number(gate?.locate?.lng) === Number(gateData?.locate?.lng)
      ))?._id

      if (pendingRateField && createdGateId) {
        updateRateField(
          pendingRateField.partnerId,
          pendingRateField.rateLocalId,
          pendingRateField.field,
          createdGateId,
        )
      }

      message.success('Đã tạo cửa khẩu mới')
      closeAddGateModal()
    } catch (error) {
      console.error('Error creating gate from PartnersPage:', error)
      message.error('Tạo cửa khẩu thất bại')
    } finally {
      setCreatingGate(false)
    }
  }

  const updatePartnerDraft = (partnerId, updater) => {
    setDraftPartners((prev) => prev.map((partner) => (
      partner._id === partnerId ? updater(partner) : partner
    )))
  }

  const addRate = (partnerId) => {
    localRateCounterRef.current += 1
    const defaultGate = gates[0]?._id || ''
    const newRate = {
      pickup: defaultGate,
      delivery: defaultGate,
      isReefer: false,
      fixedCost: 0,
      _localId: `new-${partnerId}-${localRateCounterRef.current}`,
      _isNew: true,
    }

    updatePartnerDraft(partnerId, (partner) => ({
      ...partner,
      rates: [...partner.rates, newRate],
    }))
  }

  const deleteSelectedRates = (partnerId) => {
    const keys = selectedRateKeys[partnerId] || []
    if (!keys.length) {
      return
    }

    updatePartnerDraft(partnerId, (partner) => ({
      ...partner,
      rates: partner.rates.filter((rate) => !keys.includes(rate._localId)),
    }))

    setSelectedRateKeys((prev) => ({
      ...prev,
      [partnerId]: [],
    }))
  }

  const updateRateField = (partnerId, rateLocalId, field, value) => {
    updatePartnerDraft(partnerId, (partner) => ({
      ...partner,
      rates: partner.rates.map((rate) => (
        rate._localId === rateLocalId ? { ...rate, [field]: value } : rate
      )),
    }))
  }

  const updateContactField = (partnerId, field, value) => {
    updatePartnerDraft(partnerId, (partner) => ({
      ...partner,
      contact: {
        ...partner.contact,
        [field]: value,
      },
    }))
  }

  const updatePartnerName = (partnerId, value) => {
    updatePartnerDraft(partnerId, (partner) => ({
      ...partner,
      name: value,
    }))
  }

  const updateWaitingCost = (partnerId, value) => {
    updatePartnerDraft(partnerId, (partner) => ({
      ...partner,
      waitingCost: Number(value) || 0,
    }))
  }

  const saveChanges = async () => {
    const changedPartners = draftPartners.filter((partner) => dirtyPartnerIds.includes(partner._id))
    if (!changedPartners.length) {
      return
    }

    setSaving(true)
    try {
      await Promise.all(changedPartners.map((partner) => partnerApi.updatePartner(partner._id, {
        name: partner.name,
        contact: {
          phone: partner.contact.phone,
          email: partner.contact.email,
        },
        waitingCost: Number(partner.waitingCost) || 0,
        rates: partner.rates.map((rate) => ({
          pickup: rate.pickup,
          delivery: rate.delivery,
          isReefer: !!rate.isReefer,
          fixedCost: Number(rate.fixedCost) || 0,
        })),
      })))

      message.success('Đã lưu thay đổi thành công')
      await fetchData()
      onDirtyChange?.(false)
    } catch (error) {
      console.error('Error saving partners:', error)
      message.error('Lưu thay đổi thất bại')
      throw error
    } finally {
      setSaving(false)
    }
  }

  const savePartner = async (partnerId) => {
    const partner = draftPartners.find((p) => p._id === partnerId)
    if (!partner) return
    const isDirty = dirtyPartnerIds.includes(partnerId)
    if (!isDirty) {
      message.info('Không có thay đổi để lưu')
      return
    }

    setSavingPartnerIds((prev) => ({ ...prev, [partnerId]: true }))
    try {
      await partnerApi.updatePartner(partner._id, {
        name: partner.name,
        contact: {
          phone: partner.contact.phone,
          email: partner.contact.email,
        },
        waitingCost: Number(partner.waitingCost) || 0,
        rates: partner.rates.map((rate) => ({
          pickup: rate.pickup,
          delivery: rate.delivery,
          isReefer: !!rate.isReefer,
          fixedCost: Number(rate.fixedCost) || 0,
        })),
      })

      message.success('Đã lưu thay đổi thành công')
      await fetchData()
      onDirtyChange?.(false)
    } catch (error) {
      console.error('Error saving partner:', error)
      message.error('Lưu thay đổi thất bại')
      throw error
    } finally {
      setSavingPartnerIds((prev) => ({ ...prev, [partnerId]: false }))
    }
  }


  const getRateColumns = (partnerId) => [
    {
    title: 'Điểm lấy hàng',
      dataIndex: 'pickup',
      key: 'pickup',
      render: (pickup, record) => (
        <Select
          value={pickup}
          options={gateOptions}
          style={{ width: 250 }}
          onChange={(value) => handleRateGateChange(partnerId, record._localId, 'pickup', value)}
        />
      ),
      width: 200,
    },
    {
      title: 'Điểm giao hàng',
      dataIndex: 'delivery',
      key: 'delivery',
      render: (delivery, record) => (
        <Select
          value={delivery}
          options={gateOptions}
          style={{ width: 250 }}
          onChange={(value) => handleRateGateChange(partnerId, record._localId, 'delivery', value)}
        />
      ),
      width: 200,
    },
    {
      title: 'Reefer',
      dataIndex: 'isReefer',
      key: 'isReefer',
      render: (isReefer, record) => (
        <Switch
          checked={!!isReefer}
          onChange={(checked) => updateRateField(partnerId, record._localId, 'isReefer', checked)}
        />
      ),
      width: 100,
    },
    {
      title: 'Giá cước',
      dataIndex: 'fixedCost',
      key: 'fixedCost',
      render: (cost, record) => (
        <InputNumber
          min={0}
          value={cost}
          style={{ width: 160 }}
          formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
          parser={(value) => Number((value || '').replace(/\,/g, ''))}
          onChange={(value) => updateRateField(partnerId, record._localId, 'fixedCost', Number(value) || 0)}
        />
      ),
      width: 180,
    },
    {
      title: 'Xem nhanh',
      dataIndex: 'fixedCostPreview',
      key: 'fixedCostPreview',
      render: (_, record) => <Text strong>{formatCurrency(record.fixedCost)}</Text>,
      width: 170,
    },
  ]

  const getCollapseItems = () => {
    return draftPartners.map((partner) => {
      const originalPartner = originalPartners.find((item) => item._id === partner._id)
      const isPartnerDirty = dirtyPartnerIds.includes(partner._id)
      const nameDirty = originalPartner ? (partner.name || '') !== (originalPartner.name || '') : false
      const emailDirty = originalPartner
        ? (partner.contact?.email || '') !== (originalPartner.contact?.email || '')
        : false
      const phoneDirty = originalPartner
        ? (partner.contact?.phone || '') !== (originalPartner.contact?.phone || '')
        : false
      const waitingCostDirty = originalPartner
        ? (Number(partner.waitingCost) || 0) !== (Number(originalPartner.waitingCost) || 0)
        : false
      const ratesDirty = originalPartner
        ? JSON.stringify((partner.rates || []).map(normalizeRate)) !== JSON.stringify((originalPartner.rates || []).map(normalizeRate))
        : false

      return {
      key: partner._id,
      label: (
        <div className="partner-tab-header">
          <span className="partner-name">{partner.name}</span>
          {isPartnerDirty ? <span className="partner-unsaved-pill">Chưa lưu</span> : null}
        </div>
      ),
      children: (
        <div className="partner-details">
          <div className="contact-section">
            <Card size="small" className="contact-card">
              <Space direction="vertical" style={{ width: '100%' }}>
                <div>
                  <Text strong>Tên công ty:</Text>
                  <Input
                    value={partner.name}
                    placeholder={'Nhập tên công ty'}
                    className={nameDirty ? 'unsaved-input' : ''}
                    style={{ marginTop: 6 }}
                    onChange={(event) => updatePartnerName(partner._id, event.target.value)}
                  />
                </div>
                <Divider style={{ margin: '12px 0' }} />
                <div>
                  <Text strong>Email:</Text>
                  <Input
                    value={partner.contact?.email || ''}
                    placeholder={'Nhập email'}
                    className={emailDirty ? 'unsaved-input' : ''}
                    style={{ marginTop: 6 }}
                    onChange={(event) => updateContactField(partner._id, 'email', event.target.value)}
                  />
                </div>
                <Divider style={{ margin: '12px 0' }} />
                <div>
                  <Text strong>Số điện thoại:</Text>
                  <Input
                    value={partner.contact?.phone || ''}
                    placeholder={'Nhập số điện thoại'}
                    className={phoneDirty ? 'unsaved-input' : ''}
                    style={{ marginTop: 6 }}
                    onChange={(event) => updateContactField(partner._id, 'phone', event.target.value)}
                  />
                </div>
                <>
                  <Divider style={{ margin: '12px 0' }} />
                  <div>
                    <Text strong>Chi phí chờ hàng:</Text>
                    <InputNumber
                      min={0}
                      value={Number(partner.waitingCost) || 0}
                      className={waitingCostDirty ? 'unsaved-input' : ''}
                      style={{ marginTop: 6, width: 220 }}
                      formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                      parser={(value) => Number((value || '').replace(/\,/g, ''))}
                      onChange={(value) => updateWaitingCost(partner._id, value)}
                    />
                  </div>
                </>
              </Space>
            </Card>
          </div>

          <Divider />

          <div className={`rates-section ${ratesDirty ? 'unsaved-section' : ''}`}>
            <Text strong style={{ fontSize: 16 }}>
              Danh sách giá cước ({partner.rates?.length || 0} mục)
            </Text>
            <Space style={{ marginLeft: 12 }}>
              <Button size="small" type="dashed" onClick={() => addRate(partner._id)}>
                + Thêm cước
              </Button>
              <Button
                size="small"
                danger
                disabled={!(selectedRateKeys[partner._id] || []).length}
                onClick={() => deleteSelectedRates(partner._id)}
              >
                Xóa cước đã chọn
              </Button>
            </Space>
            <Table
              dataSource={partner.rates || []}
              columns={getRateColumns(partner._id)}
              pagination={false}
              rowSelection={{
                selectedRowKeys: selectedRateKeys[partner._id] || [],
                onChange: (keys) => {
                  setSelectedRateKeys((prev) => ({
                    ...prev,
                    [partner._id]: keys,
                  }))
                },
              }}
              rowKey={(record) => record._localId}
              rowClassName={(record) => (record._isNew ? 'new-rate-row' : '')}
              scroll={{ x: 900 }}
              style={{ marginTop: 16 }}
              size="small"
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
              <Button
                type="primary"
                size="large"
                style={{ minWidth: 140 }}
                disabled={!isPartnerDirty}
                loading={!!savingPartnerIds[partner._id]}
                onClick={() => savePartner(partner._id)}
              >
                {'Lưu'}
              </Button>
            </div>
          </div>
        </div>
      ),
    }
    })
  }

  if (loading) {
    return (
      <Card>
        <Spin size="large" />
      </Card>
    )
  }

  if (draftPartners.length === 0) {
    return (
      <Card>
        <Empty description={'Không có dữ liệu'} />
      </Card>
    )
  }

  return (
    <Card className="module-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 style={{ margin: 0 }}>{'Danh sách các công ty vận chuyển'}</h2>
      </div>
      {hasUnsavedChanges ? (
        <Alert
          type="warning"
          showIcon
          style={{ marginBottom: 12 }}
          message={'Bạn có thay đổi chưa lưu. Các vùng màu vàng là phần đã chỉnh sửa.'}
        />
      ) : null}
      <Collapse items={getCollapseItems()} />

      <AddGateModal
        open={isAddGateModalOpen}
        onCancel={closeAddGateModal}
        onCreate={handleCreateGateFromPartnerPage}
        submitting={creatingGate}
        gates={gates}
        defaultCenter={DEFAULT_GATE_MAP_CENTER}
        defaultZoom={DEFAULT_GATE_MAP_ZOOM}
      />
    </Card>
  )
}

export default PartnersPage