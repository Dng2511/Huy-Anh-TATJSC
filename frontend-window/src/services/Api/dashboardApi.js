import { Http } from '../Http'

export default {
  getSummary: async (params = {}) => {
    try {
      const response = await Http.get('/dashboard/summary', {
        params,
      })
      return response.data
    } catch (error) {
      console.error('Error fetching dashboard summary:', error)
      throw error
    }
  },
}