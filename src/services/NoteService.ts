import axios, { AxiosResponse } from 'axios';
import { Note } from '../models/Note';
// Use relative path so CRA dev proxy forwards to backend
const API_BASE_URL = '/api';
const NOTES_URL = `${API_BASE_URL}/notes`;

// Configure axios defaults
axios.defaults.timeout = 10000; // 10 seconds timeout

// Add request interceptor to handle CSRF if needed
axios.interceptors.request.use(
  (config) => {
    // Add any authentication headers here if needed
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle common errors
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 403) {
      console.error('403 Forbidden - This might be a Spring Security/CSRF issue');
      console.error('Check if Spring Security is properly configured for your API endpoints');
    }
    return Promise.reject(error);
  }
);

// Helpers to normalize backend responses into arrays and tags into arrays
function normalizeTagsInput(tags: any): any[] {
  if (!tags) return [];
  if (Array.isArray(tags)) return tags;
  if (tags instanceof Set) return Array.from(tags);
  if (typeof tags === 'object') {
    // Convert objects (possibly returned from some serializers) into array of values
    try {
      return Object.values(tags).filter(v => v != null);
    } catch (e) {
      return [];
    }
  }
  return [];
}

function normalizeNotesArray(data: any): Note[] {
  if (!data) return [];
  const arr = Array.isArray(data) ? data : [data];
  return arr.map((n: any) => {
    const copy: any = { ...n };
    copy.tags = normalizeTagsInput(n?.tags);
    return copy as Note;
  });
}

class NoteService {
  // Fetch all notes
  async getAllNotes(): Promise<Note[]> {
    try {
      const response: AxiosResponse<Note[]> = await axios.get(NOTES_URL);
      return normalizeNotesArray(response.data);
    } catch (error) {
      console.error('Error fetching notes:', error);
      throw new Error('Failed to fetch notes from backend');
    }
  }

  // Get note by ID
  async getNoteById(id: number): Promise<Note> {
    try {
      const response: AxiosResponse<Note> = await axios.get(`${NOTES_URL}/${id}`);
      const notes = normalizeNotesArray([response.data]);
      return notes[0];
    } catch (error) {
      console.error('Error fetching note:', error);
      throw new Error('Failed to fetch note from backend');
    }
  }

  // Create a new note
  async createNote(note: Omit<Note, 'id'>): Promise<Note> {
    try {
      console.log('Attempting to create note with payload:', JSON.stringify(note, null, 2));
      console.log('POST URL:', NOTES_URL);
      // Ensure tags is sent as an array (normalize Sets or objects)
      const payload = { ...note, tags: normalizeTagsInput(note.tags) };

      const response: AxiosResponse<Note> = await axios.post(NOTES_URL, payload, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      console.log('Note creation successful:', response.data);
      const notes = normalizeNotesArray([response.data]);
      return notes[0];
    } catch (error: any) {
      console.error('Error creating note:', error);
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
        console.error('Response headers:', error.response.headers);
      }
      throw new Error('Failed to create note');
    }
  }

  // Update an existing note
  async updateNote(note: Note): Promise<Note> {
    try {
      const payload = { ...note, tags: normalizeTagsInput(note.tags) };
      const response: AxiosResponse<Note> = await axios.put(`${NOTES_URL}/${note.id}`, payload);
      const notes = normalizeNotesArray([response.data]);
      return notes[0];
    } catch (error) {
      console.error('Error updating note:', error);
      throw new Error('Failed to update note');
    }
  }

  // Delete a note
  async deleteNote(noteId: number): Promise<void> {
    try {
      await axios.delete(`${NOTES_URL}/${noteId}`);
    } catch (error) {
      console.error('Error deleting note:', error);
      throw new Error('Failed to delete note');
    }
  }

  // Fetch notes by tags (advanced search)
  async searchNotesByTags(tags: string[]): Promise<Note[]> {
    try {
      const response: AxiosResponse<Note[]> = await axios.get(`${NOTES_URL}/search/tags`, {
        params: { tags: tags.join(',') }
      });
      return normalizeNotesArray(response.data);
    } catch (error) {
      console.error('Error searching notes by tags:', error);
      // Fallback: filter all notes by tags on frontend
      const allNotes = await this.getAllNotes();
      return allNotes.filter(note => 
        tags.some(tag => (note.tags || []).some((noteTag: any) => noteTag?.name === tag))
      );
    }
  }

  // Fetch notes by category
  async getNotesByCategory(category: string): Promise<Note[]> {
    try {
      const response: AxiosResponse<Note[]> = await axios.get(`${NOTES_URL}/search/category`, {
        params: { category }
      });
      return normalizeNotesArray(response.data);
    } catch (error) {
      console.error('Error searching notes by category:', error);
      // Fallback: filter all notes by category on frontend
      const allNotes = await this.getAllNotes();
      return allNotes.filter(note => 
        note.category?.name.toLowerCase().includes(category.toLowerCase())
      );
    }
  }
}

const noteService = new NoteService();
export default noteService;
