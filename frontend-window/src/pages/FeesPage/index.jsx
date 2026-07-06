import { useEffect, useMemo, useState } from 'react'
import { Alert, Button, Card, Col, Input, InputNumber, Row, Select, Spin, Statistic, Table, Tabs, Tag, Typography, message } from 'antd'
import feeApi from '../../services/Api/feeApi'
import vehicleApi from '../../services/Api/vehicleApi'
import './FeesPage.css'

const { Title, Text } = Typography

const MONTH_LABELS = [
  'Tháng 1',
  'Tháng 2',
  'Tháng 3',
  'Tháng 4',
  'Tháng 5',
  'Tháng 6',
  'Tháng 7',
  'Tháng 8',
  'Tháng 9',
  'Tháng 10',
  'Tháng 11',
  'Tháng 12',
]

const HISTORY_YEARS = 6

const pad2 = (value) => String(value).padStart(2, '0')

const formatMonthKey = (year, monthIndex) => `${year}-${pad2(monthIndex)}`

const formatCurrency = (value) => {
  try {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(value) || 0)
  } catch (error) {
    return `${Number(value) || 0}`
  }
}

const formatDate = (value) => {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '-'
  return new Intl.DateTimeFormat('vi-VN').format(date)
}

const toDateInputValue = (value) => {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return date.toISOString().slice(0, 10)
}

const getMonthDateValue = (monthKey, day = 1) => {
  const [year, month] = monthKey.split('-').map(Number)
  return `${year}-${pad2(month)}-${pad2(day)}`
}

const getMonthBounds = (monthKey) => {
  const [year, month] = monthKey.split('-').map(Number)
  const lastDay = new Date(year, month, 0).getDate()
  return {
    minDate: `${year}-${pad2(month)}-01`,
    maxDate: `${year}-${pad2(month)}-${pad2(lastDay)}`,
    lastDay,
  }
}

const isDateInMonth = (monthKey, dateValue) => {
  if (!dateValue) return false
  return /^\d{4}-\d{2}-\d{2}$/.test(dateValue) && dateValue.startsWith(`${monthKey}-`)
}

const getTodayLikeDateForMonth = (monthKey) => {
  const today = new Date()
  const todayDay = today.getDate()
  const { lastDay } = getMonthBounds(monthKey)
  return getMonthDateValue(monthKey, Math.min(todayDay, lastDay))
}

const normalizeVehicleOption = (vehicle) => {
  if (!vehicle) return { value: '', label: '-' }
  if (typeof vehicle === 'string') return { value: vehicle, label: vehicle }
  return {
    value: vehicle._id || vehicle.id || '',
    label: vehicle.licensePlate || vehicle.name || vehicle._id || '-',
  }
}

const normalizeDieselRow = (row, index, monthKey) => {
  const vehicle = normalizeVehicleOption(row?.vehicle)
  const quantity = Number(row?.quantity) || 0
  const unitPrice = Number(row?.unitPrice) || 0
  return {
    _localId: row?._id || `${monthKey}-diesel-${index}`,
    date: toDateInputValue(row?.date) || getMonthDateValue(monthKey, index + 1),
    vehicleId: vehicle.value,
    vehicleLabel: vehicle.label,
    quantity,
    unitPrice,
    amount: Number(row?.amount) || quantity * unitPrice,
  }
}

const normalizeOtherRow = (row, index, monthKey) => {
  const vehicle = normalizeVehicleOption(row?.vehicle)
  return {
    _localId: row?._id || `${monthKey}-other-${index}`,
    date: toDateInputValue(row?.date) || getMonthDateValue(monthKey, index + 1),
    vehicleId: vehicle.value,
    vehicleLabel: vehicle.label,
    name: row?.name || '',
    amount: Number(row?.amount) || 0,
  }
}

const normalizeFeeData = (month, data) => ({
  month: data?.month || month,
  dieselFees: Array.isArray(data?.dieselFees) ? data.dieselFees.map((row, index) => normalizeDieselRow(row, index, month)) : [],
  otherFees: Array.isArray(data?.otherFees) ? data.otherFees.map((row, index) => normalizeOtherRow(row, index, month)) : [],
})

const cloneFeeData = (fee) => ({
  month: fee?.month || '',
  dieselFees: (fee?.dieselFees || []).map((row) => ({ ...row })),
  otherFees: (fee?.otherFees || []).map((row) => ({ ...row })),
})

const sumAmounts = (items) => items.reduce((total, item) => total + (Number(item?.amount) || 0), 0)
const calcDieselAmount = (quantity, unitPrice) => (Number(quantity) || 0) * (Number(unitPrice) || 0)

const getMonthDisplayName = (monthKey) => {
  const [year, month] = monthKey.split('-')
  return `${MONTH_LABELS[Number(month) - 1] || `Tháng ${month}`} ${year}`
}

const getRowCompareShape = (row, type) => {
  if (!row) {
    return type === 'diesel'
      ? { date: '', vehicleId: '', quantity: 0, unitPrice: 0, amount: 0 }
      : { date: '', vehicleId: '', name: '', amount: 0 }
  }

  if (type === 'diesel') {
    return {
      date: row.date || '',
      vehicleId: row.vehicleId || '',
      quantity: Number(row.quantity) || 0,
      unitPrice: Number(row.unitPrice) || 0,
      amount: Number(row.amount) || 0,
    }
  }

  return {
    date: row.date || '',
    vehicleId: row.vehicleId || '',
    name: row.name || '',
    amount: Number(row.amount) || 0,
  }
}

const isMonthDirty = (originalFee, draftFee) => {
  if (!originalFee || !draftFee) return false

  const originalShape = {
    dieselFees: originalFee.dieselFees.map((row) => getRowCompareShape(row, 'diesel')),
    otherFees: originalFee.otherFees.map((row) => getRowCompareShape(row, 'other')),
  }
  const draftShape = {
    dieselFees: draftFee.dieselFees.map((row) => getRowCompareShape(row, 'diesel')),
    otherFees: draftFee.otherFees.map((row) => getRowCompareShape(row, 'other')),
  }

  return JSON.stringify(originalShape) !== JSON.stringify(draftShape)
}

function FeeMonthPanel({
  monthKey,
  fee,
  originalFee,
  loading,
  error,
  selectedRowKeys,
  vehicleOptions,
  onSelectRowKeys,
  onAddRow,
  onRemoveSelectedRows,
  onUpdateRow,
  onReload,
}) {
  const dieselRows = fee?.dieselFees || []
  const otherRows = fee?.otherFees || []
  const isEmptyMonth = !dieselRows.length && !otherRows.length
  const dirty = isMonthDirty(originalFee, fee)
  const dieselTotal = useMemo(() => sumAmounts(dieselRows), [dieselRows])
  const otherTotal = useMemo(() => sumAmounts(otherRows), [otherRows])
  const totalAmount = dieselTotal + otherTotal
  const { minDate, maxDate } = getMonthBounds(monthKey)

  const findOriginalRow = (type, rowId) => (originalFee?.[type === 'diesel' ? 'dieselFees' : 'otherFees'] || []).find((row) => row._localId === rowId)
  const compareRow = (type, record) => JSON.stringify(getRowCompareShape(record, type)) !== JSON.stringify(getRowCompareShape(findOriginalRow(type, record._localId), type))

  const dieselColumns = [
    {
      title: 'Ngày',
      dataIndex: 'date',
      key: 'date',
      render: (value, record) => (
        <Input
          type="date"
          value={value}
          min={minDate}
          max={maxDate}
          className={compareRow('diesel', record) ? 'fee-inline-dirty' : ''}
          onChange={(event) => onUpdateRow(monthKey, 'diesel', record._localId, 'date', event.target.value)}
        />
      ),
    },
    {
      title: 'Phương tiện',
      dataIndex: 'vehicleId',
      key: 'vehicleId',
      render: (value, record) => (
        <Select
          value={value || undefined}
          options={vehicleOptions}
          placeholder="Chọn xe"
          showSearch
          optionFilterProp="label"
          style={{ width: '100%' }}
          className={compareRow('diesel', record) ? 'fee-inline-dirty' : ''}
          onChange={(nextValue) => onUpdateRow(monthKey, 'diesel', record._localId, 'vehicleId', nextValue)}
        />
      ),
    },
    {
      title: 'Số lượng',
      dataIndex: 'quantity',
      key: 'quantity',
      render: (value, record) => (
        <InputNumber
          min={0}
          value={value}
          style={{ width: '100%' }}
          className={compareRow('diesel', record) ? 'fee-inline-dirty' : ''}
          onChange={(nextValue) => onUpdateRow(monthKey, 'diesel', record._localId, 'quantity', Number(nextValue) || 0)}
        />
      ),
    },
    {
      title: 'Đơn giá',
      dataIndex: 'unitPrice',
      key: 'unitPrice',
      render: (value, record) => (
        <InputNumber
          min={0}
          value={value}
          style={{ width: '100%' }}
          className={compareRow('diesel', record) ? 'fee-inline-dirty' : ''}
          formatter={(nextValue) => `${nextValue}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
          parser={(nextValue) => Number((nextValue || '').replace(/,/g, ''))}
          onChange={(nextValue) => {
            const unitPrice = Number(nextValue) || 0
            const quantity = Number(record.quantity) || 0
            onUpdateRow(monthKey, 'diesel', record._localId, 'unitPrice', unitPrice)
            onUpdateRow(monthKey, 'diesel', record._localId, 'amount', quantity * unitPrice)
          }}
        />
      ),
    },
    {
      title: 'Thành tiền',
      dataIndex: 'amount',
      key: 'amount',
      render: (_value, record) => formatCurrency(calcDieselAmount(record.quantity, record.unitPrice)),
    },
  ]

  const otherColumns = [
    {
      title: 'Ngày',
      dataIndex: 'date',
      key: 'date',
      render: (value, record) => (
        <Input
          type="date"
          value={value}
          min={minDate}
          max={maxDate}
          className={compareRow('other', record) ? 'fee-inline-dirty' : ''}
          onChange={(event) => onUpdateRow(monthKey, 'other', record._localId, 'date', event.target.value)}
        />
      ),
    },
    {
      title: 'Phương tiện',
      dataIndex: 'vehicleId',
      key: 'vehicleId',
      render: (value, record) => (
        <Select
          value={value || undefined}
          options={vehicleOptions}
          placeholder="Chọn xe"
          showSearch
          optionFilterProp="label"
          style={{ width: '100%' }}
          className={compareRow('other', record) ? 'fee-inline-dirty' : ''}
          onChange={(nextValue) => onUpdateRow(monthKey, 'other', record._localId, 'vehicleId', nextValue)}
        />
      ),
    },
    {
      title: 'Khoản chi',
      dataIndex: 'name',
      key: 'name',
      render: (value, record) => (
        <Input
          value={value}
          placeholder="Nhập tên khoản chi"
          className={compareRow('other', record) ? 'fee-inline-dirty' : ''}
          onChange={(event) => onUpdateRow(monthKey, 'other', record._localId, 'name', event.target.value)}
        />
      ),
    },
    {
      title: 'Thành tiền',
      dataIndex: 'amount',
      key: 'amount',
      render: (value, record) => (
        <InputNumber
          min={0}
          value={value}
          style={{ width: '100%' }}
          className={compareRow('other', record) ? 'fee-inline-dirty' : ''}
          formatter={(nextValue) => `${nextValue}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
          parser={(nextValue) => Number((nextValue || '').replace(/,/g, ''))}
          onChange={(nextValue) => onUpdateRow(monthKey, 'other', record._localId, 'amount', Number(nextValue) || 0)}
        />
      ),
    },
  ]

  const selectedDieselKeys = selectedRowKeys?.diesel || []
  const selectedOtherKeys = selectedRowKeys?.other || []

  if (loading) {
    return (
      <div className="fee-loading-state">
        <Spin size="large" />
      </div>
    )
  }

  if (error) {
    return (
      <Alert
        className="fee-alert"
        type="error"
        message="Không tải được dữ liệu chi phí"
        description={error}
        action={
          <Tag color="red" className="fee-reload-tag" onClick={onReload}>
            Tải lại
          </Tag>
        }
      />
    )
  }

  return (
    <div className="fee-month-panel">
      <div className="fee-month-toolbar">
        <div>
          <Title level={4} className="fee-month-title">
            {getMonthDisplayName(monthKey)}
          </Title>
          <Text className="fee-month-subtitle">Sửa trực tiếp, xóa dòng đã chọn và lưu tháng này giống trang khách hàng.</Text>
        </div>

        <div className="fee-month-toolbar-actions">
          <Tag color={dirty ? 'orange' : 'green'} className="fee-status-pill">
            {dirty ? 'Chưa lưu' : 'Đã lưu'}
          </Tag>
        </div>
      </div>

      {isEmptyMonth ? (
        <Alert
          className="fee-alert"
          type="info"
          message="Tháng này chưa có dữ liệu chi phí"
          description="Hệ thống đã tạo sẵn tháng mới. Bạn có thể thêm dòng diesel hoặc chi phí khác ngay bên dưới."
          showIcon
        />
      ) : null}

      <Row gutter={[16, 16]}>
        <Col xs={24} md={8}>
          <Card className="fee-stat-card" bordered={false}>
            <Statistic title="Tổng phí diesel" value={formatCurrency(dieselTotal)} />
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card className="fee-stat-card" bordered={false}>
            <Statistic title="Chi phí khác" value={formatCurrency(otherTotal)} />
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card className="fee-stat-card fee-stat-card-total" bordered={false}>
            <Statistic title="Tổng cộng" value={formatCurrency(totalAmount)} />
          </Card>
        </Col>
      </Row>

      <Card
        className="fee-section-card"
        title={<span>Phí diesel <Tag color="blue">{dieselRows.length} dòng</Tag></span>}
        bordered={false}
      >
        <Table
          rowKey="_localId"
          dataSource={dieselRows}
          columns={dieselColumns}
          pagination={false}
          size="middle"
          scroll={{ x: 980 }}
          locale={{ emptyText: 'Chưa có dòng diesel nào. Bấm + Thêm dòng diesel để tạo dòng đầu tiên.' }}
          rowSelection={{
            selectedRowKeys: selectedDieselKeys,
            onChange: (keys) => onSelectRowKeys(monthKey, 'diesel', keys),
          }}
          rowClassName={(record) => (compareRow('diesel', record) ? 'fee-row-dirty' : '')}
        />

        <div className="fee-table-actions">
          <Button type="dashed" onClick={() => onAddRow(monthKey, 'diesel')}>
            + Thêm dòng diesel
          </Button>
          <Button danger disabled={!selectedDieselKeys.length} onClick={() => onRemoveSelectedRows(monthKey, 'diesel')}>
            Xóa dòng diesel đã chọn
          </Button>
        </div>
      </Card>

      <Card
        className="fee-section-card"
        title={<span>Các chi phí khác <Tag color="geekblue">{otherRows.length} dòng</Tag></span>}
        bordered={false}
      >
        <Table
          rowKey="_localId"
          dataSource={otherRows}
          columns={otherColumns}
          pagination={false}
          size="middle"
          scroll={{ x: 820 }}
          locale={{ emptyText: 'Chưa có chi phí khác nào. Bấm + Thêm dòng khác để tạo dòng đầu tiên.' }}
          rowSelection={{
            selectedRowKeys: selectedOtherKeys,
            onChange: (keys) => onSelectRowKeys(monthKey, 'other', keys),
          }}
          rowClassName={(record) => (compareRow('other', record) ? 'fee-row-dirty' : '')}
        />

        <div className="fee-table-actions">
          <Button type="dashed" onClick={() => onAddRow(monthKey, 'other')}>
            + Thêm dòng khác
          </Button>
          <Button danger disabled={!selectedOtherKeys.length} onClick={() => onRemoveSelectedRows(monthKey, 'other')}>
            Xóa dòng khác đã chọn
          </Button>
        </div>
      </Card>
    </div>
  )
}

export default function FeesPage({ onDirtyChange }) {
  const now = new Date()
  const currentYear = now.getFullYear()
  const currentMonthKey = formatMonthKey(currentYear, now.getMonth() + 1)

  const [selectedYear, setSelectedYear] = useState(currentYear)
  const [selectedMonth, setSelectedMonth] = useState(currentMonthKey)
  const [originalByMonth, setOriginalByMonth] = useState({})
  const [draftByMonth, setDraftByMonth] = useState({})
  const [selectedRowsByMonth, setSelectedRowsByMonth] = useState({})
  const [loadingMonths, setLoadingMonths] = useState({})
  const [savingMonths, setSavingMonths] = useState({})
  const [loadingPage, setLoadingPage] = useState(true)
  const [monthErrors, setMonthErrors] = useState({})
  const [vehicles, setVehicles] = useState([])

  const vehicleOptions = useMemo(() => vehicles.map((vehicle) => ({
    value: vehicle._id,
    label: vehicle.licensePlate || vehicle.name || vehicle._id,
  })), [vehicles])

  const availableYears = useMemo(() => {
    const years = []
    for (let offset = 0; offset < HISTORY_YEARS; offset += 1) {
      years.push(currentYear - offset)
    }
    return years
  }, [currentYear])

  const getMonthState = (monthKey) => draftByMonth[monthKey] || originalByMonth[monthKey] || null

  const currentMonthState = getMonthState(selectedMonth)
  const currentOriginalMonthState = originalByMonth[selectedMonth] || null
  const currentMonthDirty = isMonthDirty(currentOriginalMonthState, currentMonthState)

  const hasUnsavedChanges = useMemo(() => {
    return MONTH_LABELS.some((_, index) => {
      const yearCandidates = []
      for (let offset = 0; offset < HISTORY_YEARS; offset += 1) {
        yearCandidates.push(currentYear - offset)
      }
      return yearCandidates.some((year) => {
        const monthKey = formatMonthKey(year, index + 1)
        return isMonthDirty(originalByMonth[monthKey], draftByMonth[monthKey])
      })
    })
  }, [currentYear, draftByMonth, originalByMonth])

  useEffect(() => {
    onDirtyChange?.(hasUnsavedChanges)
  }, [hasUnsavedChanges, onDirtyChange])

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

  const ensureMonthLoaded = async (monthKey, forceReload = false) => {
    if (!/^\d{4}-\d{2}$/.test(monthKey)) return null

    if (!forceReload && (draftByMonth[monthKey] || loadingMonths[monthKey])) {
      return draftByMonth[monthKey] || null
    }

    setLoadingMonths((prev) => ({ ...prev, [monthKey]: true }))
    setMonthErrors((prev) => {
      if (!prev[monthKey]) return prev
      const next = { ...prev }
      delete next[monthKey]
      return next
    })

    try {
      const response = await feeApi.getFee(monthKey)
      const normalized = normalizeFeeData(monthKey, response)
      setOriginalByMonth((prev) => ({ ...prev, [monthKey]: normalized }))
      setDraftByMonth((prev) => {
        if (forceReload || !prev[monthKey]) {
          return { ...prev, [monthKey]: cloneFeeData(normalized) }
        }
        return prev
      })
      return normalized
    } catch (error) {
      const errorMessage = error?.response?.data?.message || error?.message || 'Không thể tải dữ liệu tháng này'
      setMonthErrors((prev) => ({ ...prev, [monthKey]: errorMessage }))
      message.error(errorMessage)
      return null
    } finally {
      setLoadingMonths((prev) => {
        const next = { ...prev }
        delete next[monthKey]
        return next
      })
    }
  }

  const ensureVehiclesLoaded = async () => {
    try {
      const response = await vehicleApi.getVehicles()
      const vehicleList = Array.isArray(response) ? response : response?.data || []
      setVehicles(vehicleList)
    } catch (error) {
      console.error('Error fetching vehicles for fee page:', error)
    }
  }

  const openMonth = async (monthKey) => {
    setSelectedMonth(monthKey)
    await ensureMonthLoaded(monthKey)
  }

  useEffect(() => {
    const bootstrap = async () => {
      setLoadingPage(true)
      await Promise.all([
        ensureVehiclesLoaded(),
        ensureMonthLoaded(currentMonthKey),
      ])
      setLoadingPage(false)
    }

    bootstrap()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const updateRow = (monthKey, section, rowId, field, value) => {
    setDraftByMonth((prev) => {
      const current = prev[monthKey]
      if (!current) return prev

      if (field === 'date' && !isDateInMonth(monthKey, value)) {
        return prev
      }

      const key = section === 'diesel' ? 'dieselFees' : 'otherFees'
      const nextRows = current[key].map((row) => {
        if (row._localId !== rowId) return row

        const nextRow = { ...row, [field]: value }

        if (section === 'diesel' && (field === 'quantity' || field === 'unitPrice')) {
          const quantity = field === 'quantity' ? Number(value) || 0 : Number(row.quantity) || 0
          const unitPrice = field === 'unitPrice' ? Number(value) || 0 : Number(row.unitPrice) || 0
          nextRow.amount = quantity * unitPrice
        }

        return nextRow
      })

      return {
        ...prev,
        [monthKey]: {
          ...current,
          [key]: nextRows,
        },
      }
    })
  }

  const addRow = (monthKey, section) => {
    setDraftByMonth((prev) => {
      const current = prev[monthKey]
      if (!current) return prev

      const nextId = `${monthKey}-${section}-${Date.now()}`
      const defaultDate = getTodayLikeDateForMonth(monthKey)
      const firstVehicle = vehicleOptions[0] || { value: '', label: '-' }
      const key = section === 'diesel' ? 'dieselFees' : 'otherFees'

      const newRow = section === 'diesel'
        ? {
            _localId: nextId,
            date: defaultDate,
            vehicleId: firstVehicle.value,
            vehicleLabel: firstVehicle.label,
            quantity: 1,
            unitPrice: 0,
            amount: 0,
          }
        : {
            _localId: nextId,
            date: defaultDate,
            vehicleId: firstVehicle.value,
            vehicleLabel: firstVehicle.label,
            name: '',
            amount: 0,
          }

      return {
        ...prev,
        [monthKey]: {
          ...current,
          [key]: [...current[key], newRow],
        },
      }
    })
  }

  const removeSelectedRows = (monthKey, section) => {
    const selected = selectedRowsByMonth[monthKey] || { diesel: [], other: [] }
    const selectedKeys = section === 'diesel' ? selected.diesel : selected.other
    if (!selectedKeys.length) {
      message.info('Vui lòng chọn dòng cần xóa')
      return
    }

    setDraftByMonth((prev) => {
      const current = prev[monthKey]
      if (!current) return prev

      const key = section === 'diesel' ? 'dieselFees' : 'otherFees'

      return {
        ...prev,
        [monthKey]: {
          ...current,
          [key]: current[key].filter((row) => !selectedKeys.includes(row._localId)),
        },
      }
    })

    setSelectedRowsByMonth((prev) => ({
      ...prev,
      [monthKey]: {
        ...(prev[monthKey] || { diesel: [], other: [] }),
        [section]: [],
      },
    }))

    message.success('Đã xóa dòng đã chọn khỏi bản nháp')
  }

  const saveMonth = async (monthKey) => {
    const draft = draftByMonth[monthKey]
    if (!draft) return

    const original = originalByMonth[monthKey]
    if (!isMonthDirty(original, draft)) {
      message.info('Không có thay đổi để lưu')
      return
    }

    const dieselFeesPayload = draft.dieselFees.map((row) => ({
        date: row.date,
        vehicle: row.vehicleId,
        quantity: Number(row.quantity) || 0,
        unitPrice: Number(row.unitPrice) || 0,
        amount: calcDieselAmount(row.quantity, row.unitPrice),
      }))

    const otherFeesPayload = draft.otherFees.map((row) => ({
        date: row.date,
        vehicle: row.vehicleId,
        name: row.name,
        amount: Number(row.amount) || 0,
      }))

    const totalDieselFee = sumAmounts(dieselFeesPayload)
    const totalOtherFee = sumAmounts(otherFeesPayload)

    const payload = {
      dieselFees: dieselFeesPayload,
      otherFees: otherFeesPayload,
      totalDieselFee,
      totalOtherFee,
      totalAmount: totalDieselFee + totalOtherFee,
    }

    setSavingMonths((prev) => ({ ...prev, [monthKey]: true }))
    try {
      const response = await feeApi.updateFee(monthKey, payload)
      const normalized = normalizeFeeData(monthKey, response)
      setOriginalByMonth((prev) => ({ ...prev, [monthKey]: normalized }))
      setDraftByMonth((prev) => ({ ...prev, [monthKey]: cloneFeeData(normalized) }))
      setSelectedRowsByMonth((prev) => ({
        ...prev,
        [monthKey]: { diesel: [], other: [] },
      }))
      message.success('Đã lưu chi phí của tháng này')
    } catch (error) {
      const errorMessage = error?.response?.data?.message || error?.message || 'Lưu chi phí thất bại'
      message.error(errorMessage)
    } finally {
      setSavingMonths((prev) => {
        const next = { ...prev }
        delete next[monthKey]
        return next
      })
    }
  }

  const saveCurrentMonth = async () => {
    await saveMonth(selectedMonth)
  }

  const yearTabs = useMemo(() => {
    return availableYears.map((year) => {
      const hasDirtyMonth = MONTH_LABELS.some((_, index) => {
        const monthKey = formatMonthKey(year, index + 1)
        return isMonthDirty(originalByMonth[monthKey], draftByMonth[monthKey])
      })

      return {
        key: String(year),
        label: (
          <span className="fee-year-tab-label">
            {year}
            {hasDirtyMonth ? <Tag color="orange">Chưa lưu</Tag> : null}
          </span>
        ),
        children: (
          <Tabs
            className="fee-month-tabs"
            activeKey={selectedMonth.startsWith(`${year}-`) ? selectedMonth : formatMonthKey(year, year === currentYear ? now.getMonth() + 1 : 1)}
            onChange={(monthKey) => openMonth(monthKey)}
            items={MONTH_LABELS.map((label, index) => {
              const monthKey = formatMonthKey(year, index + 1)
              const originalFee = originalByMonth[monthKey]
              const fee = getMonthState(monthKey)
              const isLoading = Boolean(loadingMonths[monthKey])
              const dirty = isMonthDirty(originalFee, fee)

              return {
                key: monthKey,
                label: (
                  <span className="fee-month-tab-label">
                    {label}
                    {dirty ? <Tag color="orange">Chưa lưu</Tag> : null}
                  </span>
                ),
                children: (
                  <FeeMonthPanel
                    monthKey={monthKey}
                    fee={fee}
                    originalFee={originalFee}
                    loading={isLoading}
                    error={monthErrors[monthKey] || ''}
                    selectedRowKeys={selectedRowsByMonth[monthKey] || { diesel: [], other: [] }}
                    vehicleOptions={vehicleOptions}
                    onSelectRowKeys={(key, section, keys) => {
                      setSelectedRowsByMonth((prev) => ({
                        ...prev,
                        [key]: {
                          ...(prev[key] || { diesel: [], other: [] }),
                          [section]: keys,
                        },
                      }))
                    }}
                    onAddRow={addRow}
                    onRemoveSelectedRows={removeSelectedRows}
                    onUpdateRow={updateRow}
                    onReload={() => ensureMonthLoaded(monthKey, true)}
                  />
                ),
              }
            })}
            destroyInactiveTabPane
            tabBarGutter={12}
          />
        ),
      }
    })
  }, [
    addRow,
    availableYears,
    currentYear,
    draftByMonth,
    loadingMonths,
    monthErrors,
    now,
    originalByMonth,
    removeSelectedRows,
    saveMonth,
    savingMonths,
    selectedMonth,
    updateRow,
    vehicleOptions,
  ])

  if (loadingPage) {
    return (
      <div className="fee-page-loading">
        <Spin size="large" />
      </div>
    )
  }

  return (
    <Card className="module-card fee-page-card">
      <div className="fee-page-header">
        <div>
          <Title level={3} className="fee-page-title">
            Chi phí
          </Title>
          <Text className="fee-page-subtitle">
            Sửa trực tiếp, xóa dòng đã chọn và lưu tháng giống trang đối tác.
          </Text>
        </div>

        <Tag color="green" className="fee-current-tag">
          Mở mặc định: {MONTH_LABELS[now.getMonth()]} {currentYear}
        </Tag>
      </div>

      {Object.keys(monthErrors).length > 0 ? (
        <Alert
          className="fee-alert"
          type="warning"
          message="Một số tháng chưa tải được dữ liệu"
          description="Bạn có thể mở lại tab tháng đó để thử tải lại."
        />
      ) : null}

      <Tabs
        className="fee-year-tabs"
        activeKey={String(selectedYear)}
        onChange={(yearKey) => {
          const nextYear = Number(yearKey)
          setSelectedYear(nextYear)
          const nextMonth = nextYear === currentYear ? currentMonthKey : formatMonthKey(nextYear, 1)
          void openMonth(nextMonth)
        }}
        items={yearTabs}
        destroyInactiveTabPane
      />

      <div className="fee-page-footer">
        <div className="fee-page-footer-left">
          <Tag color={currentMonthDirty ? 'orange' : 'green'} className="fee-status-pill">
            {currentMonthDirty ? 'Tháng hiện tại chưa lưu' : 'Tháng hiện tại đã lưu'}
          </Tag>
        </div>
        <Button type="primary" size="large" loading={Boolean(savingMonths[selectedMonth])} onClick={saveCurrentMonth}>
          Lưu
        </Button>
      </div>
    </Card>
  )
}