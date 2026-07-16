import { Http } from '../Http'

export default {
    getOrders: async (params = {}) => {
        try {
            const response = await Http.get('/orders', { params });
            return response.data;
        } catch (error) {
            console.error('Error fetching orders:', error);
            throw error;
        }
    },
    getOrderById: async (id) => {
        try {
            const response = await Http.get(`/orders/${id}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching order:', error);
            throw error;
        }
    },
    createOrder: async (orderData) => {
        try {
            const response = await Http.post('/orders', orderData);
            return response.data;
        } catch (error) {
            console.error('Error creating order:', error);
            throw error;
        }
    },
    updateOrder: async (id, orderData) => {
        try {
            const response = await Http.put(`/orders/${id}`, orderData);
            return response.data;
        } catch (error) {
            console.error('Error updating order:', error);
            throw error;
        }
    },
    deleteOrders: async (ids) => {
        try {
            const response = await Http.delete('/orders', { data: { ids } });
            return response.data;
        } catch (error) {
            console.error('Error deleting orders:', error);
            throw error;
        }
    },

    getOrdersForTimeline: async () => {
        try {
            const response = await Http.get('/orders/get-orders-for-timeline');
            return response.data;
        } catch (error) {
            console.error('Error fetching orders for timeline:', error);
            throw error;
        }
    }
}