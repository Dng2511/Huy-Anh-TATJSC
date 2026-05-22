import { Http } from '../Http'

export default {
  getUsers: async (params = {}) => {
    try {
      const response = await Http.get('/users', { params })
      return response.data
    } catch (error) {
      console.error('Error fetching users:', error)
      throw error
    }
  },
  createUser: async (userData) => {
    try {
      const response = await Http.post('/users', userData)
      return response.data
    } catch (error) {
      console.error('Error creating user:', error)
      throw error
    }
  },
  updateUser: async (id, userData) => {
    try {
      const response = await Http.put(`/users/${id}`, userData)
      return response.data
    } catch (error) {
      console.error('Error updating user:', error)
      throw error
    }
  },
  deleteUsers: async (ids) => {
    try {
      const response = await Http.delete('/users', { data: { ids } })
      return response.data
    } catch (error) {
      console.error('Error deleting users:', error)
      throw error
    }
  },
}