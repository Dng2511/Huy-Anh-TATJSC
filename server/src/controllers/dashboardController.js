const Order = require('../models/Order')
const Fee = require('../models/Fee')
const Vehicle = require('../models/Vehicle')

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

const pad2 = (value) => String(value).padStart(2, '0')
const formatMonthKey = (year, monthIndex) => `${year}-${pad2(monthIndex)}`

const normalizeDate = (value) => {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

const resolvePeriod = ({ view, year, month }) => {
  if (view === 'month') {
    const fallback = new Date()
    const [monthYear, monthIndex] = String(month || '').split('-').map(Number)
    const safeYear = Number.isFinite(monthYear) ? monthYear : fallback.getFullYear()
    const safeMonthIndex = Number.isFinite(monthIndex) ? monthIndex : fallback.getMonth() + 1
    const start = new Date(safeYear, safeMonthIndex - 1, 1)
    const end = new Date(safeYear, safeMonthIndex, 1)
    return {
      view: 'month',
      year: safeYear,
      monthIndex: safeMonthIndex,
      monthKey: formatMonthKey(safeYear, safeMonthIndex),
      start,
      end,
    }
  }

  const fallbackYear = new Date().getFullYear()
  const safeYear = Number(year) || fallbackYear
  return {
    view: 'year',
    year: safeYear,
    monthKey: null,
    start: new Date(safeYear, 0, 1),
    end: new Date(safeYear + 1, 0, 1),
  }
}

const getWaitingDays = (order, now = new Date()) => {
  if (!order?.waitingStart) return 0

  const start = normalizeDate(order.waitingStart)
  const end = order.waitingEnd ? normalizeDate(order.waitingEnd) : now
  if (!start || !end || end < start) return 0

  const dayMs = 24 * 60 * 60 * 1000
  return Math.max(1, Math.ceil((end.getTime() - start.getTime()) / dayMs))
}

const getOrderRevenue = (order, now = new Date()) => {
  const baseCost = Number(order?.cost) || 0
  const waitingCost = Number(order?.waitingCost) || 0
  const waitingDays = getWaitingDays(order, now)
  const waitingRevenue = waitingCost * waitingDays

  return {
    baseCost,
    waitingCost,
    waitingDays,
    waitingRevenue,
    revenue: baseCost + waitingRevenue,
  }
}

const getOrderDate = (order) => normalizeDate(order?.orderDate || order?.createdAt)

const getBucketKey = (date, view) => {
  if (view === 'month') {
    return String(date.getDate()).padStart(2, '0')
  }
  return formatMonthKey(date.getFullYear(), date.getMonth() + 1)
}

const getChartBuckets = (period) => {
  if (period.view === 'month') {
    const lastDay = new Date(period.year, period.monthIndex, 0).getDate()
    return Array.from({ length: lastDay }, (_, index) => ({
      key: String(index + 1).padStart(2, '0'),
      label: `${index + 1}`,
    }))
  }

  return Array.from({ length: 12 }, (_, index) => ({
    key: formatMonthKey(period.year, index + 1),
    label: `Th${index + 1}`,
  }))
}

const getFeeTotalsByMonth = (feeDocs) => {
  const totals = new Map()

  feeDocs.forEach((feeDoc) => {
    if (!feeDoc?.month) return
    const [docYear, docMonth] = String(feeDoc.month).split('-').map(Number)
    if (!Number.isFinite(docYear) || !Number.isFinite(docMonth)) return
    totals.set(formatMonthKey(docYear, docMonth), {
      totalAmount: Number(feeDoc.totalAmount) || 0,
      totalDieselFee: Number(feeDoc.totalDieselFee) || 0,
      totalOtherFee: Number(feeDoc.totalOtherFee) || 0,
    })
  })

  return totals
}

exports.getDashboardSummary = async (req, res) => {
  try {
    const view = req.query.view === 'month' ? 'month' : 'year'
    const period = resolvePeriod({
      view,
      year: req.query.year,
      month: req.query.month,
    })
    const now = new Date()

    const [orders, feeDocs, vehicles] = await Promise.all([
      Order.find({ orderDate: { $gte: period.start, $lt: period.end } })
        .sort({ orderDate: -1 })
        .populate('partner', 'name')
        .populate('vehicle', 'licensePlate')
        .populate('pickup', 'name')
        .populate('delivery', 'name'),
      period.view === 'month'
        ? Fee.find({ month: period.monthKey }).lean()
        : Fee.find({ month: { $regex: `^${period.year}-` } }).lean(),
      Vehicle.find({}, { status: 1 }).lean(),
    ])

    const orderSummaries = orders.map((order) => {
      const revenueInfo = getOrderRevenue(order, now)
      return {
        id: order._id,
        status: order.status,
        orderDate: order.orderDate || order.createdAt,
        createdAt: order.createdAt,
        partnerName: order?.partner?.name || '-',
        vehicleLabel: order?.vehicle?.licensePlate || '-',
        route: `${order?.pickup?.name || '-'} → ${order?.delivery?.name || '-'}`,
        baseCost: revenueInfo.baseCost,
        waitingCost: revenueInfo.waitingCost,
        waitingDays: revenueInfo.waitingDays,
        waitingRevenue: revenueInfo.waitingRevenue,
        revenue: revenueInfo.revenue,
      }
    })

    const totalOrders = orderSummaries.length
    const baseRevenue = orderSummaries.reduce((total, order) => total + order.baseCost, 0)
    const waitingRevenue = orderSummaries.reduce((total, order) => total + order.waitingRevenue, 0)
    const revenue = orderSummaries.reduce((total, order) => total + order.revenue, 0)

    const buckets = getChartBuckets(period)
    const bucketMap = new Map(buckets.map((bucket) => [bucket.key, { revenue: 0, sales: 0 }]))

    orderSummaries.forEach((order) => {
      const orderDate = getOrderDate(order)
      if (!orderDate) return
      const bucketKey = getBucketKey(orderDate, period.view)
      const bucket = bucketMap.get(bucketKey)
      if (!bucket) return
      bucket.revenue += Number(order.revenue) || 0
      bucket.sales += 1
    })

    const feeTotalsByMonth = getFeeTotalsByMonth(feeDocs)

    const revenueSeries = buckets.map((bucket) => bucketMap.get(bucket.key)?.revenue || 0)
    const salesSeries = buckets.map((bucket) => bucketMap.get(bucket.key)?.sales || 0)
    const feeSeries = buckets.map((bucket) => {
      if (period.view === 'month') {
        const monthFee = feeDocs[0]
        const monthTotal = Number(monthFee?.totalAmount) || 0
        const daysInMonth = buckets.length || 1
        return monthTotal / daysInMonth
      }

      return feeTotalsByMonth.get(bucket.key)?.totalAmount || 0
    })
    const profitSeries = revenueSeries.map((value, index) => value - (feeSeries[index] || 0))

    const totalFee = period.view === 'month'
      ? Number(feeDocs[0]?.totalAmount) || 0
      : feeDocs.reduce((sum, feeDoc) => sum + (Number(feeDoc.totalAmount) || 0), 0)
    const totalDieselFee = period.view === 'month'
      ? Number(feeDocs[0]?.totalDieselFee) || 0
      : feeDocs.reduce((sum, feeDoc) => sum + (Number(feeDoc.totalDieselFee) || 0), 0)
    const totalOtherFee = period.view === 'month'
      ? Number(feeDocs[0]?.totalOtherFee) || 0
      : feeDocs.reduce((sum, feeDoc) => sum + (Number(feeDoc.totalOtherFee) || 0), 0)

    const profit = revenue - totalFee
    const profitMargin = revenue > 0 ? (profit / revenue) * 100 : 0

    const orderStatusBreakdown = orderSummaries.reduce((acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1
      return acc
    }, { planned: 0, running: 0, waiting: 0, delivering: 0, completed: 0, cancelled: 0 })

    const vehicleSummary = vehicles.reduce((acc, vehicle) => {
      const status = vehicle.status || 'idle'
      acc.total += 1
      acc[status] = (acc[status] || 0) + 1
      return acc
    }, { total: 0, idle: 0, running: 0, maintenance: 0 })

    const periodLabel = period.view === 'month'
      ? `${MONTH_LABELS[period.monthIndex - 1] || 'Tháng'} ${period.year}`
      : `Năm ${period.year}`

    res.json({
      view: period.view,
      year: period.year,
      monthKey: period.monthKey,
      periodLabel,
      orders: {
        totalOrders,
        baseRevenue,
        waitingRevenue,
        revenue,
        averageRevenue: totalOrders > 0 ? revenue / totalOrders : 0,
        statusBreakdown: orderStatusBreakdown,
      },
      fees: {
        totalDieselFee,
        totalOtherFee,
        totalFee,
      },
      profit: {
        value: profit,
        margin: profitMargin,
      },
      vehicles: vehicleSummary,
      chart: {
        labels: buckets.map((bucket) => bucket.label),
        revenueSeries,
        salesSeries,
        feeSeries,
        profitSeries,
        xAxisLabel: period.view === 'month' ? 'Ngày' : 'Tháng',
      },
      recentOrders: orderSummaries.slice(0, 5),
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}