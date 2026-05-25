import { Http } from '../Http'

export default {
  getFee: async (month) => {
    try {
      const response = await Http.get(`/fees/${month}`)
      return response.data
    } catch (error) {
      console.error('Error fetching fee month:', error)
      throw error
    }
  },

  updateFee: async (month, payload) => {
    try {
      const response = await Http.put(`/fees/${month}`, payload)
      return response.data
    } catch (error) {
      console.error('Error updating fee month:', error)
      throw error
    }
  },
}