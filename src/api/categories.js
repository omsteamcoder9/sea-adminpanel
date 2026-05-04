// src/api/categories.js
import api from './axiosConfig';

export const categoriesAPI = {
  // Get all categories
  getAllCategories: () => api.get('/categories'),
  
  // Get single category
  getCategory: (id) => api.get(`/categories/${id}`),
  
  // Create category
  createCategory: (categoryData) => {
    // For regular JSON data (only name field)
    return api.post('/categories', categoryData);
  },
  
  // Update category
  updateCategory: (id, categoryData) => {
    // For regular JSON data (only name field)
    return api.put(`/categories/${id}`, categoryData);
  },
  
  // Delete category
  deleteCategory: (id) => api.delete(`/categories/${id}`),
};