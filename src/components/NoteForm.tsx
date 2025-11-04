import React, { useState, useEffect } from 'react';
import { Note, Category, Tag } from '../models/Note';
import NoteService from '../services/NoteService';
import CategoryService from '../services/CategoryService';

const NoteForm: React.FC = () => {
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [newTagName, setNewTagName] = useState('');

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const fetchedCategories = await CategoryService.getAllCategories();
        setCategories(fetchedCategories);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    fetchCategories();
  }, []);

  // Add a new tag
  const addTag = (tagName: string) => {
    if (tagName.trim() && !selectedTags.some(tag => tag.name === tagName.trim())) {
      const newTag: Tag = { name: tagName.trim() };
      setSelectedTags([...selectedTags, newTag]);
    }
  };

  // Remove a tag
  const removeTag = (tagName: string) => {
    setSelectedTags(selectedTags.filter(tag => tag.name !== tagName));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const newNote: Omit<Note, 'id'> = {
      title: noteTitle,
      content: noteContent,
      tags: selectedTags,
      category: selectedCategory,
    };

    console.log('=== NOTE CREATION DEBUG ===');
    console.log('Final payload:', JSON.stringify(newNote, null, 2));

    try {
      await NoteService.createNote(newNote);
      setNoteTitle('');
      setNoteContent('');
      setSelectedTags([]);
      setSelectedCategory(null);
      setNewTagName('');
      alert('Note created successfully!');
    } catch (error) {
      console.error('Error creating note:', error);
      alert('Failed to create note. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="card">
        <div className="card-header">
          <h2>Create New Note</h2>
        </div>
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Title</label>
              <input
                type="text"
                className="form-control"
                value={noteTitle}
                onChange={(e) => setNoteTitle(e.target.value)}
                required
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Content</label>
              <textarea
                className="form-control"
                rows={5}
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                required
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Category</label>
              <select
                className="form-select"
                value={selectedCategory?.id || ''}
                onChange={(e) => {
                  const categoryId = parseInt(e.target.value);
                  const category = categories.find(c => c.id === categoryId) || null;
                  setSelectedCategory(category);
                }}
              >
                <option value="">Select a category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="mb-3">
              <label className="form-label">Tags</label>
              
              {/* Display selected tags */}
              <div className="mb-2">
                {selectedTags.map((tag, index) => (
                  <span key={index} className="badge bg-primary me-2 mb-1">
                    {tag.name}
                    <button
                      type="button"
                      className="btn-close btn-close-white ms-2"
                      style={{ fontSize: '0.6em' }}
                      onClick={() => removeTag(tag.name)}
                    ></button>
                  </span>
                ))}
              </div>

              {/* Predefined tag buttons */}
              <div className="mb-2">
                {['Important', 'Urgent', 'Personal', 'Work', 'Ideas', 'Tasks'].map((tagName) => (
                  <button
                    key={tagName}
                    type="button"
                    className={`btn btn-sm me-2 mb-1 ${
                      selectedTags.some(tag => tag.name === tagName) 
                        ? 'btn-primary' 
                        : 'btn-outline-primary'
                    }`}
                    onClick={() => {
                      if (selectedTags.some(tag => tag.name === tagName)) {
                        removeTag(tagName);
                      } else {
                        addTag(tagName);
                      }
                    }}
                  >
                    {tagName}
                  </button>
                ))}
              </div>

              {/* Custom tag input */}
              <div className="input-group">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Add custom tag..."
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addTag(newTagName);
                      setNewTagName('');
                    }
                  }}
                />
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => {
                    addTag(newTagName);
                    setNewTagName('');
                  }}
                >
                  <i className="fas fa-plus"></i>
                </button>
              </div>
            </div>
            <button type="submit" className="btn btn-primary" disabled={isLoading}>
              {isLoading ? 'Creating...' : 'Create Note'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default NoteForm;