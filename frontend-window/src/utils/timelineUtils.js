export const HOUR_WIDTH = 30; // 1 giờ = 30px
export const ROW_HEIGHT = 50;

export function getBarStyle(
    order,
    minTime,
    hourWidth = HOUR_WIDTH
) {
    if (!order.startTime || !order.finishTime) {
        return {
            display: "none",
        };
    }

    const start = new Date(order.startTime).getTime();
    const finish = new Date(order.finishTime).getTime();
    const timelineStart = new Date(minTime).getTime();

    const left =
        ((start - timelineStart) / (1000 * 60 * 60)) *
        hourWidth;

    const width =
        Math.max(
            ((finish - start) / (1000 * 60 * 60)) *
                hourWidth,
            8
        );

    const colorMap = {
        planned: "#faad14",
        running: "#1890ff",
        waiting: "#722ed1",
        delivering: "#13c2c2",
        unloading: "#52c41a",
        completed: "#389e0d",
        cancelled: "#f5222d",
    };

    return {
        position: "absolute",
        left,
        top: 8,
        width,
        height: 34,
        borderRadius: 6,
        background: colorMap[order.status] || "#999",
        color: "#fff",
        padding: "0 8px",
        display: "flex",
        alignItems: "center",
        overflow: "hidden",
        whiteSpace: "nowrap",
        textOverflow: "ellipsis",
        cursor: "pointer",
        fontSize: 12,
        boxSizing: "border-box",
    };
}