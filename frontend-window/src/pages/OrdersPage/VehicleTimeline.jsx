import { useMemo, useState, useEffect } from "react";
import { estimateOrderFinishTime, estimateOrderStartTime } from "../../utils/orderTime";
import { Tooltip } from "antd";
import { getBarStyle, HOUR_WIDTH, ROW_HEIGHT } from "../../utils/timelineUtils";
import orderApi from "../../services/Api/orderApi";

export function buildTimelineData(vehicles, orders, gates) {
    let minTime = null;
    let maxTime = null;

    const rows = vehicles.map((vehicle) => {
        const vehicleOrders = orders
            .filter(
                (order) =>
                    String(order.vehicle?._id || order.vehicle) ===
                    String(vehicle._id)
            )
            .map((order) => {
                const startTime = estimateOrderStartTime(order);

                const finishTime = estimateOrderFinishTime(
                    order,
                    gates,
                    vehicle
                );

                if (
                    startTime &&
                    (!minTime || startTime < minTime)
                ) {
                    minTime = startTime;
                }

                if (
                    finishTime &&
                    (!maxTime || finishTime > maxTime)
                ) {
                    maxTime = finishTime;
                }

                return {
                    ...order,
                    startTime,
                    finishTime,
                };
            });

        return {
            vehicle,
            orders: vehicleOrders,
        };
    });

    if (!minTime) {
        minTime = new Date();
    }

    if (!maxTime) {
        maxTime = new Date(minTime.getTime() + 24 * 60 * 60 * 1000);
    }

    console.log("Timeline minTime:", minTime);
    console.log("Timeline maxTime:", maxTime);
    console.log("Timeline rows:", rows);

    return {
        rows,
        minTime,
        maxTime,
    };
}

export function buildTimelineHeader(minTime, maxTime) {
    const columns = [];

    const start = new Date(minTime);
    start.setMinutes(0, 0, 0);

    const end = new Date(maxTime);
    end.setMinutes(0, 0, 0);
    end.setHours(end.getHours() + 1);

    const current = new Date(start);

    while (current <= end) {
        columns.push({
            date: new Date(current),

            dayLabel: current.toLocaleDateString("vi-VN", {
                day: "2-digit",
                month: "2-digit",
            }),

            hourLabel: current.toLocaleTimeString("vi-VN", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
            }),
        });

        current.setHours(current.getHours() + 1);
    }

    return columns;
}

function renderTimelineHeader(columns) {
    return (
        <div
            style={{
                display: "flex",
                position: "sticky",
                top: 0,
                zIndex: 50,
                background: "#fff",
                borderBottom: "1px solid #d9d9d9",
            }}
        >
            <div
                style={{
                    width: 100,
                    minWidth: 100,
                    borderRight: "1px solid #d9d9d9",
                    padding: "12px",
                    fontWeight: 600,
                    background: "#fafafa",
                    zIndex: 10,
                    position: "sticky",
                }}
            >
            </div>

            <div
                style={{
                    display: "flex",
                    position: "relative",
                }}
            >
                {columns.map((col, index) => (
                    <div
                        key={index}
                        style={{
                            width: HOUR_WIDTH,
                            minWidth: HOUR_WIDTH,
                            borderRight: "1px solid #f0f0f0",
                            textAlign: "center",
                            padding: "4px 0",
                            background: "#fafafa",
                        }}
                    >
                        <div
                            style={{
                                fontSize: 12,
                                fontWeight: 600,
                            }}
                        >
                            {col.dayLabel}
                        </div>

                        <div
                            style={{
                                fontSize: 11,
                                color: "#888",
                            }}
                        >
                            {col.hourLabel}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function renderOrderBar(order, minTime) {
    return (
        <Tooltip
            key={order._id}
            title={
                <div>
                    <div>
                        <b>Mã đơn:</b> {order._id.slice(-6).toUpperCase()}
                    </div>

                    <div>
                        <b>Lấy hàng:</b> {order.pickup?.name}
                    </div>

                    <div>
                        <b>Giao hàng:</b> {order.delivery?.name}
                    </div>

                    <div>
                        <b>Bắt đầu:</b>{" "}
                        {order.startTime?.toLocaleString("vi-VN")}
                    </div>

                    <div>
                        <b>Kết thúc:</b>{" "}
                        {order.finishTime?.toLocaleString("vi-VN")}
                    </div>

                    <div>
                        <b>Trạng thái:</b> {order.status}
                    </div>
                </div>
            }
        >
            <div
                style={getBarStyle(order, minTime)}
            >
                {order._id.slice(-6).toUpperCase()}
            </div>
        </Tooltip>
    );
}

function renderVehicleRow(row, minTime, totalWidth) {
    return (
        <div
            key={row.vehicle._id}
            style={{
                display: "flex",
                borderBottom: "1px solid #f0f0f0",
                minHeight: ROW_HEIGHT,
            }}
        >
            <div
                style={{
                    position: "sticky",
                    left: 0,
                    width: 100,
                    minWidth: 100,
                    borderRight: "1px solid #d9d9d9",
                    display: "flex",
                    alignItems: "center",
                    paddingLeft: 12,
                    background: "#fff",
                    fontWeight: 500,
                    zIndex: 10,

                }}
            >
                {row.vehicle.licensePlate}
            </div>

            <div
                style={{
                    position: "relative",
                    width: totalWidth,
                    height: ROW_HEIGHT,
                    background:
                        "repeating-linear-gradient(to right,#fff,#fff 79px,#f5f5f5 80px)",
                }}
            >
                {row.orders.map((order) =>
                    renderOrderBar(order, minTime)
                )}
            </div>
        </div>
    );
}


export default function VehicleTimeline({
    visible,
    vehicles = [],
    gates = [],
}) {

    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchTimelineOrders = async () => {
        try {
            setLoading(true);

            const data = await orderApi.getOrdersForTimeline();

            setOrders(data);
        } catch (err) {
            console.error("Fetch timeline orders failed:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!visible) return;
        fetchTimelineOrders();
    }, [visible]);

    const { rows, minTime, maxTime } = useMemo(() => {
        return buildTimelineData(
            vehicles,
            orders,
            gates
        );
    }, [vehicles, orders, gates]);

    const columns = useMemo(() => {
        return buildTimelineHeader(
            minTime,
            maxTime
        );
    }, [minTime, maxTime]);

    const totalWidth = columns.length * HOUR_WIDTH;

    if (loading && orders.length === 0) {
        return (
            <div
                style={{
                    padding: 30,
                    textAlign: "center",
                }}
            >
                Đang tải Timeline...
            </div>
        );
    }

    return (
        <div
            style={{
                border: "1px solid #d9d9d9",
                borderRadius: 8,
                overflowX: "auto",
                overflowY: "auto",
                maxHeight: 600,
                background: "#fff",
            }}
        >
            <div
                style={{
                    minWidth: totalWidth + 160,
                }}
            >
                {renderTimelineHeader(columns)}

                {rows.map((row) =>
                    renderVehicleRow(
                        row,
                        minTime,
                        totalWidth
                    )
                )}
            </div>
        </div>
    );
}