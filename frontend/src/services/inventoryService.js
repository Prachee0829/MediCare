import api from './api.js';

// Inventory API service
const inventoryService = {
  // Get all inventory items
  getInventoryItems: async () => {
    try {
      const response = await api.get('/inventory');
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to fetch inventory items';
    }
  },

  // Get inventory item by ID
  getInventoryItemById: async (id) => {
    try {
      const response = await api.get(`/inventory/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to fetch inventory item';
    }
  },

  // Create new inventory item
  createInventoryItem: async (itemData) => {
    try {
      const response = await api.post('/inventory', itemData);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to create inventory item';
    }
  },

  // Update inventory item
  updateInventoryItem: async (id, itemData) => {
    try {
      const response = await api.put(`/inventory/${id}`, itemData);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to update inventory item';
    }
  },

  // Delete inventory item
  deleteInventoryItem: async (id) => {
    try {
      const response = await api.delete(`/inventory/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to delete inventory item';
    }
  },

  // Get low stock items
  getLowStockItems: async () => {
    try {
      const response = await api.get('/inventory/low-stock');
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to fetch low stock items';
    }
  },

  // Get expiring items
  getExpiringItems: async () => {
    try {
      const response = await api.get('/inventory/expiring');
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to fetch expiring items';
    }
  },

  // Get inventory by category
  getInventoryByCategory: async (category) => {
    try {
      const response = await api.get(`/inventory/category/${category}`);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to fetch inventory by category';
    }
  },

  // Get all available categories
  getCategories: async () => {
    try {
      const response = await api.get('/inventory/categories');
      return response.data;
    } catch (error) {
      console.warn('API call failed, using predefined categories:', error);
      // Return predefined categories as fallback instead of throwing error
      return [
        'Pain Relief', 'Analgesics', 'Antibiotics', 'Antivirals', 'Cardiovascular', 
        'Respiratory', 'Gastrointestinal', 'Dermatological', 'Supplements', 'Hormones', 
        'Vaccines', 'Antifungals', 'Antiparasitics', 'Ophthalmics', 'Anesthetics', 
        'Antidepressants', 'Antipsychotics', 'Antihistamines'
      ];
    }
  },
};

export default inventoryService;