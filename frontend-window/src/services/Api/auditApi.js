import { Http } from '../Http'

export default {
  getLogs: async (params = {}) => {
    try {
      const response = await Http.get('/audit', { params })
      return response.data
    } catch (error) {
      console.error('Error fetching audit logs:', error)
      throw error
    }
  },
}
