import { Http } from "../Http"

export default {
    getDrivers: async () => {
        try {
            const response = await Http.get('/drivers');
            return response.data;
        } catch (error) {
            console.error('Error fetching drivers:', error);
            throw error;
        }
    },
    getDriverById: async (id) => {
        try {
            const response = await Http.get(`/drivers/${id}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching driver:', error);
            throw error;
        }
    },
    createDriver: async (driverData) => {
        try {
            const response = await Http.post('/drivers', driverData);
            return response.data;
        } catch (error) {
            console.error('Error creating driver:', error);
            throw error;
        }
    },
    updateDriver: async (id, driverData) => {
        try {
            const response = await Http.put(`/drivers/${id}`, driverData);
            return response.data;
        } catch (error) {
            console.error('Error updating driver:', error);
            throw error;
        }
    },
    deleteDrivers: async (ids) => {
        try {
            const response = await Http.delete('/drivers', { data: { ids } });
            return response.data;
        } catch (error) {
            console.error('Error deleting drivers:', error);
            throw error;
        }
    },
}