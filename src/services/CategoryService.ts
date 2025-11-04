import axios, { AxiosResponse } from 'axios';
import { Category } from '../models/Note';

const API_BASE_URL = '/api';
const CATEGORIES_URL = `${API_BASE_URL}/categories`;

class CategoryService {
  // Fetch all categories
  async getAllCategories(): Promise<Category[]> {
    try {
      const response: AxiosResponse<Category[]> = await axios.get(CATEGORIES_URL);
      return response.data;
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw new Error('Failed to fetch categories from backend');
    }
  }

  // Get category by ID
  async getCategoryById(id: number): Promise<Category> {
    try {
      const response: AxiosResponse<Category> = await axios.get(`${CATEGORIES_URL}/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching category:', error);
      throw new Error('Failed to fetch category from backend');
    }
  }

  // Create a new category
  async createCategory(category: Omit<Category, 'id'>): Promise<Category> {
    try {
      const response: AxiosResponse<Category> = await axios.post(CATEGORIES_URL, category);
      return response.data;
    } catch (error) {
      console.error('Error creating category:', error);
      throw new Error('Failed to create category');
    }
  }

  // Update an existing category
  async updateCategory(id: number, category: Omit<Category, 'id'>): Promise<Category> {
    try {
      const response: AxiosResponse<Category> = await axios.put(`${CATEGORIES_URL}/${id}`, category);
      return response.data;
    } catch (error) {
      console.error('Error updating category:', error);
      throw new Error('Failed to update category');
    }
  }

  // Delete a category
  async deleteCategory(id: number): Promise<void> {
    try {
      await axios.delete(`${CATEGORIES_URL}/${id}`);
    } catch (error) {
      console.error('Error deleting category:', error);
      throw new Error('Failed to delete category');
    }
  }
}

export default new CategoryService();