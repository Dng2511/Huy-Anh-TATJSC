import { Http } from "../Http"

export default {
    getVehicles: async () => {
        try {
            const response = await Http.get('/vehicles');
            return response.data;
        } catch (error) {
            console.error('Error fetching vehicles:', error);
            throw error;
        }
    },
    getVehicleById: async (id) => {
        try {
            const response = await Http.get(`/vehicles/${id}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching vehicle:', error);
            throw error;
        }
    },
    createVehicle: async (vehicleData) => {
        try {
            const response = await Http.post('/vehicles', vehicleData);
            return response.data;
        } catch (error) {
            console.error('Error creating vehicle:', error);
            throw error;
        }
    },
    updateVehicle: async (id, vehicleData) => {
        try {
            const response = await Http.put(`/vehicles/${id}`, vehicleData);
            return response.data;
        } catch (error) {
            console.error('Error updating vehicle:', error);
            throw error;
        }
    },
    deleteVehicles: async (ids) => {
        try {
            const response = await Http.delete('/vehicles', { data: { ids } });
            return response.data;
        } catch (error) {
            console.error('Error deleting vehicles:', error);
            throw error;
        }
    },

    getAverageSpeed: async () => {
        try {
            const response = await Http.get('/vehicles/average-speed');
            return response.data;
        } catch (error) {
            console.error('Error fetching average speed:', error);
            throw error;
        }
    }
}