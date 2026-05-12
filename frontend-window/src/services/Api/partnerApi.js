import {Http} from "../Http"

export default {
    getPartners: async () => {
        try {
            const response = await Http.get('/partners');
            return response.data;
        } catch (error) {
            console.error('Error fetching partners:', error);
            throw error;
        }
    },
    createPartner: async (partnerData) => {
        try {
            const response = await Http.post('/partners', partnerData);
            return response.data;
        } catch (error) {
            console.error('Error creating partner:', error);
            throw error;
        }
    },
    updatePartner: async (id, partnerData) => {
        try {
            const response = await Http.put(`/partners/${id}`, partnerData);
            return response.data;
        } catch (error) {
            console.error('Error updating partner:', error);
            throw error;
        }
    },
    deletePartner: async (id) => {
        try {
            const response = await Http.delete(`/partners/${id}`);
            return response.data;
        } catch (error) {
            console.error('Error deleting partner:', error);
            throw error;
        }
    },
    addDeliveryRate: async (partnerId, rateData) => {
        try {
            const response = await Http.post(`/partners/${partnerId}/rates`, rateData);
            return response.data;
        } catch (error) {
            console.error('Error adding delivery rate:', error);
            throw error;
        }
    },
    removeDeliveryRate: async (partnerId, rateData) => {
        try {
            const response = await Http.delete(`/partners/${partnerId}/rates`, { data: rateData });
            return response.data;
        } catch (error) {
            console.error('Error removing delivery rate:', error);
            throw error;
        }
    }
}