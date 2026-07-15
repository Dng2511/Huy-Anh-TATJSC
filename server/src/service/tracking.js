const axios = require('axios');
const Order = require('../models/Order');
const Vehicle = require('../models/Vehicle');

let cachedTrackingData = null;
let lastFetchedAt = 0;
let isUpdating = false;

const CACHE_DURATION = 5 * 1000;
const TRACKING_INTERVAL = 5 * 1000;

function getDistanceKm(lat1, lng1, lat2, lng2) {
    if (
        lat1 == null || lng1 == null ||
        lat2 == null || lng2 == null
    ) return null;

    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;

    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(lat1 * Math.PI / 180) *
        Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLng / 2) ** 2;

    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

const getTrackingData = async () => {
    if (cachedTrackingData && Date.now() - lastFetchedAt < CACHE_DURATION) {
        return cachedTrackingData;
    }

    const response = await axios.post(
        'https://dvbk.vn/Home/get_AllTIBase',
        {
            UserID: 1106,
        }
    );

    cachedTrackingData = response.data;
    lastFetchedAt = Date.now();

    return cachedTrackingData;
};

const updateStatusByTracking = async () => {
    if (isUpdating) return;

    try {
        isUpdating = true;

        const trackingData = await getTrackingData();
        if (!trackingData) return;

        const orders = await Order.find({
            vehicle: { $ne: null },
            status: {
                $nin: ['completed', 'cancelled'],
            },
        })
            .populate('vehicle', 'licensePlate')
            .populate('delivery', 'locate')
            .populate('pickup', 'locate');

        const runningVehicleIds = new Set();

        for (const order of orders) {
            const plate = order.vehicle?.licensePlate;
            if (!plate) continue;

            const vehicle = order.vehicle;
            if (vehicle && vehicle.status !== 'running') {
                runningVehicleIds.add(vehicle._id);
                vehicle.status = 'running';
                await vehicle.save();
            }

            const vehicleData = trackingData.find(
                (v) => v.NormalizedPlate === plate
            );

            if (!vehicleData) continue;

            const pickupLocate = order.pickup?.locate;
            const deliveryLocate = order.delivery?.locate;

            const currentLat = vehicleData.Lt;
            const currentLng = vehicleData.Ln;

            let newStatus = null;

            if (order.status === 'planned') {
                const twoHoursLater = new Date(Date.now() + 2 * 60 * 60 * 1000);
                if (order.orderDate <= twoHoursLater) {
                    newStatus = 'running';
                }
            }

            else if (order.status === 'running' && pickupLocate) {
                const distanceToPickup = getDistanceKm(
                    currentLat,
                    currentLng,
                    pickupLocate.lat,
                    pickupLocate.lng
                );

                if (distanceToPickup !== null && distanceToPickup <= 5) {
                    newStatus = 'waiting';
                    order.waitingStart = new Date();
                }
            }

            else if (order.status === 'waiting' && pickupLocate) {
                const distanceToPickup = getDistanceKm(
                    currentLat,
                    currentLng,
                    pickupLocate.lat,
                    pickupLocate.lng
                );

                if (distanceToPickup !== null && distanceToPickup > 10) {
                    newStatus = 'delivering';
                    order.waitingEnd = new Date();
                }
            }

            else if (order.status === 'delivering' && deliveryLocate) {
                const distanceToDelivery = getDistanceKm(
                    currentLat,
                    currentLng,
                    deliveryLocate.lat,
                    deliveryLocate.lng
                );

                if (distanceToDelivery !== null && distanceToDelivery <= 5) {
                    newStatus = 'unloading';
                }
            } 

            else if (order.status === 'unloading' && deliveryLocate) {
                const distanceToDelivery = getDistanceKm(
                    currentLat,
                    currentLng,
                    deliveryLocate.lat,
                    deliveryLocate.lng
                );

                if (distanceToDelivery !== null && distanceToDelivery > 10) {
                    newStatus = 'completed';
                    const vehicle = order.vehicle;
                    if (vehicle) {
                        vehicle.status = 'idle';
                        await vehicle.save();
                    }
                }
            }

            if (newStatus && order.status !== newStatus) {
                order.status = newStatus;
                await order.save();
            }
        }

        await Vehicle.updateMany(
            {
                _id: { $nin: [...runningVehicleIds] },
                status: { $ne: "idle" },
            },
            {
                $set: { status: "idle" },
            }
        );
    } catch (error) {
        console.error('Update tracking status error:', error.message);
    } finally {
        isUpdating = false;
    }
};

const startTrackingJob = () => {
    updateStatusByTracking();

    setInterval(() => {
        updateStatusByTracking();
    }, TRACKING_INTERVAL);
};

module.exports = {
    getTrackingData,
    updateStatusByTracking,
    startTrackingJob,
};