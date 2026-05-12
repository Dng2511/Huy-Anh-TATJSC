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
    deletePartners: async (ids) => {
        try {
            const response = await Http.delete('/partners', { data: { ids } });
            return response.data;
        } catch (error) {
            console.error('Error deleting partners:', error);
            throw error;
        }
    },
}