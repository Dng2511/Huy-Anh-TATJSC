import { Modal, Select, InputNumber, Checkbox, Input, message } from 'antd'
import { useEffect, useState } from 'react'
import orderApi from '../../services/Api/orderApi'
import partnerApi from '../../services/Api/partnerApi'
import gateApi from '../../services/Api/gateApi'
import vehicleApi from '../../services/Api/vehicleApi'
import driverApi from '../../services/Api/driverApi'
import formatLicensePlate from '../../utils/formatLicensePlate'

const AVG_SPEED = 40
const WAITING_MINUTES = 2 * 60
const UNLOADING_MINUTES = 2 * 60

const toDateInputValue = (value) => {
    if (!value) return ''
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return ''
    return date.toISOString().slice(0, 10)
}

function getDisTance(lat1, lon1, lat2, lon2) {
    const R = 6371
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLon = (lon2 - lon1) * Math.PI / 180
    const rLat1 = lat1 * Math.PI / 180
    const rLat2 = lat2 * Math.PI / 180

    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(rLat1) * Math.cos(rLat2) *
        Math.sin(dLon / 2) ** 2

    return Math.ceil(R * 2 * Math.asin(Math.sqrt(a)))
}

function formatArrivalTime(date) {
    if (!date) return 'chưa xác định'

    const now = new Date()
    const isToday =
        date.getDate() === now.getDate() &&
        date.getMonth() === now.getMonth() &&
        date.getFullYear() === now.getFullYear()

    const time = date.toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
    })

    if (isToday) return `${time} hôm nay`

    const day = date.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
    })

    return `${time} ${day}`
}

function estimateTravelMinutes(fromGateId, toGateId, gates) {
    const fromGate = gates.find(g => String(g._id) === String(fromGateId))
    const toGate = gates.find(g => String(g._id) === String(toGateId))

    if (!fromGate?.locate || !toGate?.locate) return null

    const distance = getDisTance(
        Number(fromGate.locate.lat),
        Number(fromGate.locate.lng),
        Number(toGate.locate.lat),
        Number(toGate.locate.lng)
    )

    return Math.round((distance / AVG_SPEED) * 60)
}

function estimateVehicleToGateMinutes(vehicle, gateId, gates) {
    const gate = gates.find(g => String(g._id) === String(gateId))

    if (!vehicle?.tracking || !gate?.locate) return null

    const distance = getDisTance(
        Number(vehicle.tracking.lat),
        Number(vehicle.tracking.lng),
        Number(gate.locate.lat),
        Number(gate.locate.lng)
    )

    return Math.round((distance / AVG_SPEED) * 60)
}

function estimateOrderFinishTime(order, gates, vehicle) {
    if (!order) return null

    const pickupId = order.pickup?._id || order.pickup
    const deliveryId = order.delivery?._id || order.delivery

    const pickupToDeliveryMinutes = estimateTravelMinutes(pickupId, deliveryId, gates)
    if (pickupToDeliveryMinutes === null) return null

    let startTime = null
    let remainMinutes = 0

    if (order.status === 'planned') {
        startTime = new Date(order.orderDate)

        const toPickupMinutes = vehicle?.tracking
            ? estimateVehicleToGateMinutes(vehicle, pickupId, gates)
            : 0

        if (toPickupMinutes === null) return null

        remainMinutes =
            toPickupMinutes +
            WAITING_MINUTES +
            pickupToDeliveryMinutes +
            UNLOADING_MINUTES
    }

    if (order.status === 'running') {
        startTime = new Date()

        const toPickupMinutes = estimateVehicleToGateMinutes(vehicle, pickupId, gates)
        if (toPickupMinutes === null) return null

        remainMinutes =
            toPickupMinutes +
            WAITING_MINUTES +
            pickupToDeliveryMinutes +
            UNLOADING_MINUTES
    }

    if (order.status === 'waiting') {
        startTime = new Date(order.updatedAt || Date.now())

        remainMinutes =
            WAITING_MINUTES +
            pickupToDeliveryMinutes +
            UNLOADING_MINUTES
    }

    if (order.status === 'delivering') {
        startTime = new Date()

        const toDeliveryMinutes = estimateVehicleToGateMinutes(vehicle, deliveryId, gates)
        if (toDeliveryMinutes === null) return null

        remainMinutes =
            toDeliveryMinutes +
            UNLOADING_MINUTES
    }

    if (order.status === 'unloading') {
        startTime = new Date(order.updatedAt || Date.now())
        remainMinutes = UNLOADING_MINUTES
    }

    if (!startTime || Number.isNaN(startTime.getTime())) return null

    return new Date(startTime.getTime() + remainMinutes * 60 * 1000)
}

function estimateVehicleAvailableTime(oldOrder, newPickupId, gates, vehicle) {
    const oldFinishTime = estimateOrderFinishTime(oldOrder, gates, vehicle)
    if (!oldFinishTime) return null

    const oldDeliveryId = oldOrder.delivery?._id || oldOrder.delivery

    const returnMinutes = estimateTravelMinutes(
        oldDeliveryId,
        newPickupId,
        gates
    )

    if (returnMinutes === null) return null

    return new Date(oldFinishTime.getTime() + returnMinutes * 60 * 1000)
}

export default function CreateOrderModal({
    visible,
    onCancel,
    onCreated,
    initialParams,
    existingOrders = [],
}) {
    const [partnerId, setPartnerId] = useState(null)
    const [pickup, setPickup] = useState(null)
    const [delivery, setDelivery] = useState(null)
    const [vehicleId, setVehicleId] = useState(null)
    const [vehicleStatus, setVehicleStatus] = useState(null)
    const [driverId, setDriverId] = useState(null)
    const [isReefer, setIsReefer] = useState(true)
    const [cost, setCost] = useState(0)
    const [waitingCost, setWaitingCost] = useState(0)
    const [orderDate, setOrderDate] = useState(toDateInputValue(new Date()))
    const [partners, setPartners] = useState([])
    const [gates, setGates] = useState([])
    const [vehicles, setVehicles] = useState([])
    const [drivers, setDrivers] = useState([])
    const [status, setStatus] = useState('planned')

    useEffect(() => {
        if (!initialParams) {
            if (!partnerId || !pickup || !delivery) {
                setCost(0)
                return
            }

            const partnerObj = partners.find((p) => p._id === partnerId)
            if (!partnerObj || !Array.isArray(partnerObj.rates)) {
                setCost(0)
                return
            }

            const matched = partnerObj.rates.find(
                (r) =>
                    String(r.pickup) === String(pickup) &&
                    String(r.delivery) === String(delivery) &&
                    Boolean(r.isReefer) === Boolean(isReefer)
            )

            setCost(matched ? matched.fixedCost || 0 : 0)
        }
    }, [partnerId, pickup, delivery, isReefer, partners, initialParams])

    useEffect(() => {
        if (!partnerId) {
            setWaitingCost(0)
            return
        }

        const partnerObj = partners.find((p) => p._id === partnerId)
        setWaitingCost(Number(partnerObj?.waitingCost) || 0)
    }, [partnerId, partners])

    useEffect(() => {
        const fetchAll = async () => {
            try {
                const [pResp, gResp, vResp, dResp] = await Promise.all([
                    partnerApi.getPartners(),
                    gateApi.getGates(),
                    vehicleApi.getVehicles(),
                    driverApi.getDrivers(),
                ])

                setPartners(Array.isArray(pResp) ? pResp : pResp?.data || [])
                setGates(Array.isArray(gResp) ? gResp : gResp?.data || [])
                setVehicles(Array.isArray(vResp) ? vResp : vResp?.data || [])
                setDrivers(Array.isArray(dResp) ? dResp : dResp?.data || [])
            } catch (err) {
                console.error('Error fetching partners/gates/vehicles:', err)
                message.error('Lỗi khi tải dữ liệu dùng để tạo đơn')
            }
        }

        if (visible) fetchAll()
    }, [visible])

    const resetForm = () => {
        setPartnerId(null)
        setPickup(null)
        setDelivery(null)
        setVehicleId(null)
        setVehicleStatus(null)
        setDriverId(null)
        setIsReefer(true)
        setCost(0)
        setWaitingCost(0)
        setOrderDate(toDateInputValue(new Date()))
        setStatus('planned')
    }

    const submitOrder = async (payload) => {
        if (initialParams && initialParams._id) {
            await orderApi.updateOrder(initialParams._id, payload)
            message.success('Cập nhật đơn hàng thành công')
        } else {
            await orderApi.createOrder(payload)
            message.success('Tạo đơn hàng thành công')

            if (vehicleId && driverId) {
                const veh = vehicles.find((v) => String(v._id) === String(vehicleId))
                if (veh && !veh.driver) {
                    await vehicleApi.updateVehicle(vehicleId, { driver: driverId })
                }
            }
        }

        resetForm()
        onCreated && onCreated()
    }

    const handleOk = async () => {
        if (!pickup || !delivery) {
            message.error('Vui lòng chọn cả điểm lấy và giao hàng')
            return
        }

        if (!vehicleId && status !== 'planned') {
            message.error('Vui lòng chọn phương tiện để cập nhật')
            return
        }

        const payload = {
            partner: partnerId || undefined,
            pickup,
            delivery,
            vehicle: vehicleId || undefined,
            driver: driverId || undefined,
            isReefer: Boolean(isReefer),
            cost: Number(cost) || 0,
            waitingCost: Number(waitingCost) || 0,
            orderDate: orderDate || undefined,
            status: status || 'planned',
        }

        try {
            if (vehicleId) {
                const selectedVehicle = vehicles.find(
                    (v) => String(v._id) === String(vehicleId)
                )

                const newOrderStartTime = new Date(orderDate)

                const sameVehicleOrders = existingOrders.filter((o) =>
                    String(o.vehicle?._id || o.vehicle) === String(vehicleId) &&
                    !['completed', 'cancelled'].includes(o.status) &&
                    String(o._id) !== String(initialParams?._id)
                )

                const conflictOrder = sameVehicleOrders.find((oldOrder) => {
                    const availableTime = estimateVehicleAvailableTime(
                        oldOrder,
                        pickup,
                        gates,
                        selectedVehicle
                    )

                    return availableTime && availableTime > newOrderStartTime
                })

                if (conflictOrder) {
                    const availableTime = estimateVehicleAvailableTime(
                        conflictOrder,
                        pickup,
                        gates,
                        selectedVehicle
                    )

                    Modal.confirm({
                        title: 'Xe có thể không kịp nhận đơn',
                        content: `Xe dự kiến sẵn sàng lúc ${formatArrivalTime(availableTime)}, muộn hơn thời gian đặt đơn mới. Bạn vẫn muốn tiếp tục?`,
                        okText: 'Vẫn tạo',
                        cancelText: 'Hủy',
                        onOk: () => submitOrder(payload),
                    })

                    return
                }
            }

            await submitOrder(payload)
        } catch (err) {
            console.error('Error creating/updating order:', err)
            message.error('Lỗi khi lưu đơn hàng')
        }
    }

    useEffect(() => {
        if (visible && initialParams) {
            setPartnerId(initialParams.partner?._id || initialParams.partner || null)
            setPickup(initialParams.pickup?._id || initialParams.pickup || null)
            setDelivery(initialParams.delivery?._id || initialParams.delivery || null)
            setVehicleId(initialParams.vehicle?._id || initialParams.vehicle || null)
            setVehicleStatus(initialParams.vehicle?.status || null)
            setDriverId(initialParams.driver?._id || initialParams.driver || null)
            setIsReefer(Boolean(initialParams.isReefer))
            setCost(Number(initialParams.cost) || 0)
            setWaitingCost(Number(initialParams.waitingCost) || 0)
            setOrderDate(toDateInputValue(initialParams.orderDate || initialParams.createdAt || new Date()))
            setStatus(initialParams.status || 'planned')
        }

        if (!visible && !initialParams) {
            resetForm()
        }
    }, [visible, initialParams])

    useEffect(() => {
        if (!vehicleId) return
        if (status === 'completed' || status === 'cancelled') return

        const veh = vehicles.find((v) => String(v._id) === String(vehicleId))

        if (veh) {
            setVehicleStatus(veh.status || null)

            if (veh.driver) {
                setDriverId(veh.driver._id || veh.driver || null)
            }
        }
    }, [vehicleId, vehicles, status])

    return (
        <Modal
            title={initialParams?._id ? 'Thông tin đơn hàng' : 'Tạo đơn hàng mới'}
            open={visible}
            onOk={handleOk}
            onCancel={onCancel}
            okText={initialParams?._id ? 'Lưu' : 'Tạo'}
            cancelText={initialParams?._id ? 'Hủy' : 'Thoát'}
        >
            <div style={{ display: 'grid', gap: 12 }}>
                <div>
                    <div style={{ marginBottom: 6, fontWeight: 500 }}>Khách hàng</div>
                    <Select
                        placeholder="Chọn khách hàng"
                        value={partnerId}
                        onChange={setPartnerId}
                        options={(partners || []).map((p) => ({
                            label: p.name,
                            value: p._id,
                        }))}
                        style={{ width: '100%' }}
                        allowClear
                    />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    <div>
                        <div style={{ marginBottom: 6, fontWeight: 500 }}>Lấy hàng</div>
                        <Select
                            placeholder="Chọn cổng lấy"
                            value={pickup}
                            onChange={setPickup}
                            options={(gates || []).map((g) => ({
                                label: g.name,
                                value: g._id,
                            }))}
                            style={{ width: '100%' }}
                        />
                    </div>

                    <div>
                        <div style={{ marginBottom: 6, fontWeight: 500 }}>Giao hàng</div>
                        <Select
                            placeholder="Chọn cổng giao"
                            value={delivery}
                            onChange={setDelivery}
                            options={(gates || []).map((g) => ({
                                label: g.name,
                                value: g._id,
                            }))}
                            style={{ width: '100%' }}
                        />
                    </div>
                </div>

                <Checkbox
                    checked={isReefer}
                    onChange={(e) => setIsReefer(e.target.checked)}
                >
                    Xe có lạnh (Reefer)
                </Checkbox>

                <div>
                    <div style={{ marginBottom: 6, fontWeight: 500 }}>Ngày nhận hàng</div>
                    <Input
                        type="date"
                        value={orderDate}
                        min={toDateInputValue(new Date())}
                        onChange={(e) => setOrderDate(e.target.value)}
                        style={{ width: '100%' }}
                    />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    <div>
                        <div style={{ marginBottom: 6, fontWeight: 500 }}>Cước nhận</div>
                        <InputNumber
                            style={{ width: '100%' }}
                            min={0}
                            value={cost}
                            onChange={setCost}
                            formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                            parser={(value) => value.replace(/\D/g, '')}
                        />
                    </div>

                    <div>
                        <div style={{ marginBottom: 6, fontWeight: 500 }}>Chi phí chờ hàng</div>
                        <InputNumber
                            style={{ width: '100%' }}
                            min={0}
                            value={waitingCost}
                            onChange={setWaitingCost}
                            formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                            parser={(value) => value.replace(/\D/g, '')}
                        />
                    </div>
                </div>


                <div>
                    <div style={{ marginBottom: 6, fontWeight: 500 }}>Xe</div>
                    <Select
                        placeholder="Chọn xe"
                        value={vehicleId}
                        onChange={setVehicleId}
                        options={(vehicles || []).map((v) => {
                            const licensePlate = formatLicensePlate(v.licensePlate || '')
                            return {
                                label: `${licensePlate}`,
                                value: v._id,
                            }
                        })}
                        style={{ width: '100%' }}
                        allowClear
                    />

                    <div>
                        <div style={{ marginBottom: 6, fontWeight: 500 }}>Tài xế</div>
                        <Select
                            placeholder="Chọn tài xế"
                            value={driverId}
                            onChange={setDriverId}
                            options={(drivers || []).map((d) => ({
                                label: d.name,
                                value: d._id,
                            }))}
                            style={{ width: '100%' }}
                            allowClear
                        />
                    </div>
                </div>

                <div>
                    <div style={{ marginBottom: 6, fontWeight: 500 }}>Trạng thái</div>
                    <Select
                        placeholder="Chọn trạng thái"
                        value={status}
                        onChange={setStatus}
                        options={[
                            { label: 'Kế hoạch', value: 'planned' },
                            { label: 'Đang đến lấy hàng', value: 'running' },
                            { label: 'Đang chờ hàng', value: 'waiting' },
                            { label: 'Đang giao hàng', value: 'delivering' },
                            { label: 'Đang dỡ hàng', value: 'unloading' },
                            { label: 'Hoàn thành', value: 'completed' },
                            { label: 'Hủy', value: 'cancelled' },
                        ]}
                        style={{ width: '100%' }}
                    />
                </div>
            </div>
        </Modal>
    )
}