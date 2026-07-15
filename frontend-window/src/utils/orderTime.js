// src/utils/orderTime.js

const AVG_SPEED = 40; // km/h
export const WAITING_MINUTES = 2 * 60;
export const UNLOADING_MINUTES = 2 * 60;

/**
 * Tính khoảng cách giữa 2 tọa độ (km)
 */
export function getDistance(lat1, lon1, lat2, lon2) {
    const R = 6371;

    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;

    const rLat1 = lat1 * Math.PI / 180;
    const rLat2 = lat2 * Math.PI / 180;

    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(rLat1) *
        Math.cos(rLat2) *
        Math.sin(dLon / 2) ** 2;

    return Math.ceil(R * 2 * Math.asin(Math.sqrt(a)));
}

/**
 * Thời gian di chuyển giữa 2 cổng (phút)
 */
export function estimateTravelMinutes(fromGateId, toGateId, gates) {
    const fromGate = gates.find(
        (g) => String(g._id) === String(fromGateId)
    );

    const toGate = gates.find(
        (g) => String(g._id) === String(toGateId)
    );

    if (!fromGate?.locate || !toGate?.locate) {
        return null;
    }

    const distance = getDistance(
        Number(fromGate.locate.lat),
        Number(fromGate.locate.lng),
        Number(toGate.locate.lat),
        Number(toGate.locate.lng)
    );

    return Math.round((distance / AVG_SPEED) * 60);
}

/**
 * Thời gian xe đến cổng lấy hàng (phút)
 */
export function estimateVehicleToGateMinutes(vehicle, gateId, gates) {
    const gate = gates.find(
        (g) => String(g._id) === String(gateId)
    );

    if (!vehicle?.tracking || !gate?.locate) {
        return null;
    }

    const distance = getDistance(
        Number(vehicle.tracking.lat),
        Number(vehicle.tracking.lng),
        Number(gate.locate.lat),
        Number(gate.locate.lng)
    );

    return Math.round((distance / AVG_SPEED) * 60);
}

/**
 * Thời điểm dự kiến hoàn thành Order
 */
export function estimateOrderFinishTime(order, gates, vehicle) {
    if (!order) return null;

    const pickupId = order.pickup?._id || order.pickup;
    const deliveryId = order.delivery?._id || order.delivery;

    const pickupToDeliveryMinutes =
        estimateTravelMinutes(
            pickupId,
            deliveryId,
            gates
        );

    if (pickupToDeliveryMinutes == null) {
        return null;
    }

    let startTime = null;
    let remainMinutes = 0;

    switch (order.status) {
        case "planned": {
            startTime = new Date(order.orderDate);

            const toPickupMinutes = vehicle?.tracking
                ? estimateVehicleToGateMinutes(
                    vehicle,
                    pickupId,
                    gates
                )
                : 0;

            if (toPickupMinutes == null) {
                return null;
            }

            remainMinutes =
                toPickupMinutes +
                WAITING_MINUTES +
                pickupToDeliveryMinutes +
                UNLOADING_MINUTES;

            break;
        }

        case "running": {
            startTime = new Date();

            const toPickupMinutes =
                estimateVehicleToGateMinutes(
                    vehicle,
                    pickupId,
                    gates
                );

            if (toPickupMinutes == null) {
                return null;
            }

            remainMinutes =
                toPickupMinutes +
                WAITING_MINUTES +
                pickupToDeliveryMinutes +
                UNLOADING_MINUTES;

            break;
        }

        case "waiting": {
            startTime = new Date(
                order.updatedAt || Date.now()
            );

            remainMinutes =
                WAITING_MINUTES +
                pickupToDeliveryMinutes +
                UNLOADING_MINUTES;

            break;
        }

        case "delivering": {
            startTime = new Date();

            const toDeliveryMinutes =
                estimateVehicleToGateMinutes(
                    vehicle,
                    deliveryId,
                    gates
                );

            if (toDeliveryMinutes == null) {
                return null;
            }

            remainMinutes =
                toDeliveryMinutes +
                UNLOADING_MINUTES;

            break;
        }

        case "unloading": {
            startTime = new Date(
                order.updatedAt || Date.now()
            );

            remainMinutes =
                UNLOADING_MINUTES;

            break;
        }

        case "completed":
        case "cancelled": {
            return new Date(order.updatedAt || order.createdAt || Date.now());
        }

        default:
            return null;
    }

    if (
        !startTime ||
        Number.isNaN(startTime.getTime())
    ) {
        return null;
    }

    return new Date(
        startTime.getTime() +
        remainMinutes * 60 * 1000
    );
}

/**
 * Thời điểm xe có thể nhận đơn tiếp theo
 */
export function estimateVehicleAvailableTime(
    oldOrder,
    newPickupId,
    gates,
    vehicle
) {
    const oldFinishTime =
        estimateOrderFinishTime(
            oldOrder,
            gates,
            vehicle
        );

    if (!oldFinishTime) {
        return null;
    }

    const oldDeliveryId =
        oldOrder.delivery?._id ||
        oldOrder.delivery;

    const returnMinutes =
        estimateTravelMinutes(
            oldDeliveryId,
            newPickupId,
            gates
        );

    if (returnMinutes == null) {
        return null;
    }

    return new Date(
        oldFinishTime.getTime() +
        returnMinutes * 60 * 1000
    );
}

/**
 * Thời điểm bắt đầu của Order
 * (dùng cho Timeline/Gantt Chart)
 */
export function estimateOrderStartTime(order) {
    if (!order) return null;

    switch (order.status) {
        case "planned":
            return new Date(order.orderDate);

        case "waiting":
        case "unloading":
            return new Date(order.updatedAt || Date.now());

        case "running":
        case "delivering":
            return new Date();

        case "completed":
        case "cancelled":
            return new Date(order.orderDate);

        default:
            return new Date(order.orderDate);
    }
}