import axios, { AxiosResponse } from 'axios';
import { Tag } from '../models/Tag';

const API_BASE_URL = '/api'; // Use relative path for CRA proxy
const TAGS_URL = `${API_BASE_URL}/tags`;

class TagService {
  // Fetch all tags (system + custom)
  async getAllTags(): Promise<Tag[]> {
    try {
      const response: AxiosResponse<Tag[]> = await axios.get(TAGS_URL);
      return response.data;
    } catch (error) {
      console.error('Error fetching tags:', error);
      // Return default tags if backend is not available
      return [
        { id: 1, name: 'important', isSystemTag: true },
        { id: 2, name: 'urgent', isSystemTag: true },
        { id: 3, name: 'personal', isSystemTag: true },
        { id: 4, name: 'work', isSystemTag: true },
        { id: 5, name: 'idea', isSystemTag: true },
        { id: 6, name: 'reminder', isSystemTag: true }
      ];
    }
  }

  // Get tag by ID
  async getTagById(id: number): Promise<Tag> {
    try {
      const response: AxiosResponse<Tag> = await axios.get(`${TAGS_URL}/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching tag:', error);
      throw new Error('Failed to fetch tag from backend');
    }
  }

  // Create a new custom tag
  async createCustomTag(name: string): Promise<Tag> {
    try {
      const tagData = { name, isSystemTag: false };
      const response: AxiosResponse<Tag> = await axios.post(TAGS_URL, tagData);
      return response.data;
    } catch (error) {
      console.error('Error creating tag:', error);
      throw new Error('Failed to create tag');
    }
  }

  // Update an existing tag
  async updateTag(id: number, tag: Omit<Tag, 'id'>): Promise<Tag> {
    try {
      const response: AxiosResponse<Tag> = await axios.put(`${TAGS_URL}/${id}`, tag);
      return response.data;
    } catch (error) {
      console.error('Error updating tag:', error);
      throw new Error('Failed to update tag');
    }
  }

  // Delete a tag by ID
  async deleteTag(tagId: number): Promise<void> {
    try {
      await axios.delete(`${TAGS_URL}/${tagId}`);
    } catch (error) {
      console.error('Error deleting tag:', error);
      throw new Error('Failed to delete tag');
    }
  }
}

const tagService = new TagService();
export default tagService;
