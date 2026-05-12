import { Http } from '../Http'

export default {
    getOrders: async () => {
        try {
            const response = await Http.get('/orders');
            return response.data;
        } catch (error) {
            console.error('Error fetching orders:', error);
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
    }
}