import { Http } from "../Http"

export default {
    getGates: async () => {
        try {
            const response = await Http.get('/gates');
            return response.data;
        } catch (error) {
            console.error('Error fetching gates:', error);
            throw error;
        }
    },
    createGate: async (gateData) => {
        try {
            const response = await Http.post('/gates', gateData);
            return response.data;
        } catch (error) {
            console.error('Error creating gate:', error);
            throw error;
        }
    },
    updateGate: async (id, gateData) => {
        try {
            const response = await Http.put(`/gates/${id}`, gateData);
            return response.data;
        } catch (error) {
            console.error('Error updating gate:', error);
            throw error;
        }
    },
    deleteGates: async (ids) => {
        try {
            const response = await Http.delete('/gates', { data: { ids } });
            return response.data;
        } catch (error) {
            console.error('Error deleting gates:', error);
            throw error;
        }
    },
}