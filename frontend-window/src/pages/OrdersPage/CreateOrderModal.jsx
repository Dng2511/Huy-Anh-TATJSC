import { Modal, Select, InputNumber, Checkbox, message } from 'antd'
import { useEffect, useState } from 'react'
import orderApi from '../../services/Api/orderApi'
import partnerApi from '../../services/Api/partnerApi'
import gateApi from '../../services/Api/gateApi'
import vehicleApi from '../../services/Api/vehicleApi'
import formatLicensePlate from '../../utils/formatLicensePlate'

export default function CreateOrderModal({ visible, onCancel, onCreated, initialParams }) {
    const [partnerId, setPartnerId] = useState(null)
    const [pickup, setPickup] = useState(null)
    const [delivery, setDelivery] = useState(null)
    const [vehicleId, setVehicleId] = useState(null)
    const [isReefer, setIsReefer] = useState(true)
    const [cost, setCost] = useState(0)
    const [waitingCost, setWaitingCost] = useState(0)
    const [partners, setPartners] = useState([])
    const [gates, setGates] = useState([])
    const [vehicles, setVehicles] = useState([])
    const [status, setStatus] = useState('planned');

    useEffect(() => {
        if (!partnerId || !pickup || !delivery) {
            setCost(0)
            return
        }

        const partnerObj = partners.find((p) => p._id === partnerId)
        if (!partnerObj || !Array.isArray(partnerObj.rates)) {
            setCost(0)
            return
        }

        const matched = partnerObj.rates.find((r) => String(r.pickup) === String(pickup) && String(r.delivery) === String(delivery) && Boolean(r.isReefer) === Boolean(isReefer))
        if (matched) setCost(matched.fixedCost || 0)
        else setCost(0)
    }, [partnerId, pickup, delivery, isReefer, partners])

    // set waiting cost as soon as a partner is selected (partner-level waitingCost)
    useEffect(() => {
        if (!partnerId) {
            setWaitingCost(0)
            return
        }
        const partnerObj = partners.find((p) => p._id === partnerId)
        if (!partnerObj) {
            setWaitingCost(0)
            return
        }
        setWaitingCost(Number(partnerObj.waitingCost) || 0)
    }, [partnerId, partners])

    useEffect(() => {
        const fetchAll = async () => {
            try {
                const [pResp, gResp, vResp] = await Promise.all([
                    partnerApi.getPartners(),
                    gateApi.getGates(),
                    vehicleApi.getVehicles(),
                ])

                const pList = Array.isArray(pResp) ? pResp : pResp?.data || []
                const gList = Array.isArray(gResp) ? gResp : gResp?.data || []
                const vList = Array.isArray(vResp) ? vResp : vResp?.data || []

                setPartners(pList)
                setGates(gList)
                setVehicles(vList)
            } catch (err) {
                console.error('Error fetching partners/gates/vehicles:', err)
                message.error('Lỗi khi tải dữ liệu dùng để tạo đơn')
            }
        }

        if (visible) {
            fetchAll()
        }
    }, [visible])

    const handleOk = async () => {
        if (!pickup || !delivery) {
            message.error('Vui lòng chọn cả điểm lấy và giao hàng')
            return
        }

        const payload = {
            partner: partnerId || undefined,
            pickup,
            delivery,
            vehicle: vehicleId || undefined,
            isReefer: Boolean(isReefer),
            cost: Number(cost) || 0,
            waitingCost: Number(waitingCost) || 0,
            status: status || 'planned',
        }

        try {
            if (initialParams && initialParams._id) {
                // update existing order
                await orderApi.updateOrder(initialParams._id, payload)
                message.success('Cập nhật đơn hàng thành công')
            } else {
                await orderApi.createOrder(payload)
                message.success('Tạo đơn hàng thành công')
            }
            // reset
            setPartnerId(null)
            setPickup(null)
            setDelivery(null)
            setVehicleId(null)
            setIsReefer(false)
            setCost(0)
            setWaitingCost(0)
            setStatus('planned')
            onCreated && onCreated()
        } catch (err) {
            console.error('Error creating order:', err)
            message.error('Lỗi khi tạo đơn hàng')
        }
    }

    // populate form when editing
    useEffect(() => {
        if (visible && initialParams) {
            setPartnerId(initialParams.partner?._id || initialParams.partner || null)
            setPickup(initialParams.pickup?._id || initialParams.pickup || null)
            setDelivery(initialParams.delivery?._id || initialParams.delivery || null)
            setVehicleId(initialParams.vehicle?._id || initialParams.vehicle || null)
            setIsReefer(Boolean(initialParams.isReefer))
            setCost(Number(initialParams.cost) || 0)
            setWaitingCost(Number(initialParams.waitingCost) || 0)
            setStatus(initialParams.status || 'planned')
        }
        if (!visible && !initialParams) {
            // ensure reset when closed and no initial params
            setPartnerId(null)
            setPickup(null)
            setDelivery(null)
            setVehicleId(null)
            setIsReefer(false)
            setCost(0)
            setWaitingCost(0)
            setStatus('planned')
        }
    }, [visible, initialParams])

    return (
        <Modal title="Tạo đơn hàng mới" open={visible} onOk={handleOk} onCancel={onCancel} okText="Tạo" cancelText="Hủy">
            <div style={{ display: 'grid', gap: 12 }}>
                <div>
                    <div style={{ marginBottom: 6, fontWeight: 500 }}>Đối tác</div>
                    <Select placeholder="Chọn đối tác" value={partnerId} onChange={setPartnerId} options={(partners || []).map((p) => ({ label: p.name, value: p._id }))} style={{ width: '100%' }} allowClear />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    <div>
                        <div style={{ marginBottom: 6, fontWeight: 500 }}>Lấy hàng</div>
                        <Select placeholder="Chọn cổng lấy" value={pickup} onChange={setPickup} options={(gates || []).map((g) => ({ label: g.name, value: g._id }))} style={{ width: '100%' }} />
                    </div>

                    <div>
                        <div style={{ marginBottom: 6, fontWeight: 500 }}>Giao hàng</div>
                        <Select placeholder="Chọn cổng giao" value={delivery} defaultValue={true} onChange={setDelivery} options={(gates || []).map((g) => ({ label: g.name, value: g._id }))} style={{ width: '100%' }} />
                    </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <Checkbox checked={isReefer} onChange={(e) => setIsReefer(e.target.checked)}>Xe có lạnh (Reefer)</Checkbox>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    <div>
                        <div style={{ marginBottom: 6, fontWeight: 500 }}>Cước nhận</div>
                        <InputNumber style={{ width: '100%' }} min={0} value={cost} onChange={setCost} formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} parser={(value) => value.replace(/\D/g, '')} />
                    </div>
                    <div>
                        <div style={{ marginBottom: 6, fontWeight: 500 }}>Chi phí chờ hàng</div>
                        <InputNumber style={{ width: '100%' }} min={0} value={waitingCost} onChange={setWaitingCost} formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} parser={(value) => value.replace(/\D/g, '')} />
                    </div>

                </div>

                <div>
                    <div style={{ marginBottom: 6, fontWeight: 500 }}>Xe (tùy chọn)</div>
                    <Select
                        placeholder="Chọn xe"
                        value={vehicleId}
                        onChange={setVehicleId}
                        options={(vehicles || []).map((v) => ({
                            label: `${formatLicensePlate(v.licensePlate || '')}`,
                            value: v._id,
                        }))}
                        style={{ width: '100%' }}
                        allowClear
                    />
                </div>

                <div>
                    <div style={{ marginBottom: 6, fontWeight: 500 }}>Trạng thái</div>
                    <Select
                        placeholder="Chọn trạng thái"
                        value={status}
                        onChange={setStatus}
                        options={[
                            { label: 'Kế hoạch', value: 'planned' },
                            { label: 'Đang chạy', value: 'running' },
                            { label: 'Chờ', value: 'waiting' },
                            { label: 'Đang tháo', value: 'delivering' },
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
