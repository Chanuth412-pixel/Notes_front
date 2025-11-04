import React, { useState, useEffect } from 'react';
import NoteService from '../services/NoteService';
import TagService from '../services/TagService';
import CategoryService from '../services/CategoryService';
import { Note, Category } from '../models/Note';
import { Tag } from '../models/Tag';

const AdvancedSearch: React.FC = () => {
  const [searchTitle, setSearchTitle] = useState('');
  const [searchTags, setSearchTags] = useState<string[]>([]);
  const [searchCategory, setSearchCategory] = useState('');
  const [notes, setNotes] = useState<Note[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    const fetchTagsAndCategories = async () => {
      try {
        const [fetchedTags, fetchedCategories] = await Promise.all([
          TagService.getAllTags(),
          CategoryService.getAllCategories()
        ]);
        setTags(fetchedTags);
        setCategories(fetchedCategories);
      } catch (error) {
        console.error('Error fetching tags and categories:', error);
      }
    };

    fetchTagsAndCategories();
  }, []);

  const handleSearch = async () => {
    try {
      setIsLoading(true);
      setHasSearched(true);
      let searchResults: Note[];

      if (searchTags.length > 0) {
        searchResults = await NoteService.searchNotesByTags(searchTags);
      } else if (searchCategory) {
        searchResults = await NoteService.getNotesByCategory(searchCategory);
      } else if (searchTitle) {
        searchResults = await NoteService.getAllNotes();
        // Filter by title if needed
        searchResults = searchResults.filter(note =>
          note.title.toLowerCase().includes(searchTitle.toLowerCase())
        );
      } else {
        searchResults = await NoteService.getAllNotes();
      }

      setNotes(searchResults);
    } catch (error) {
      console.error('Error searching notes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const clearSearch = () => {
    setSearchTitle('');
    setSearchTags([]);
    setSearchCategory('');
    setNotes([]);
    setHasSearched(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const truncateContent = (content: string, maxLength: number = 150) => {
    if (!content) return '';
    return content.length > maxLength ? content.substring(0, maxLength) + '...' : content;
  };

  return (
    <div className="advanced-search">
      <div className="card shadow-sm mb-4">
        <div className="card-header bg-info text-white">
          <h3 className="card-title mb-0">
            <i className="fas fa-search me-2"></i>
            Advanced Search
          </h3>
        </div>
        <div className="card-body">
          <div className="row">
            <div className="col-md-6 mb-3">
              <label htmlFor="searchTitle" className="form-label fw-semibold">
                <i className="fas fa-heading me-1"></i>
                Search by Title
              </label>
              <input
                type="text"
                className="form-control"
                id="searchTitle"
                placeholder="Enter title keywords..."
                value={searchTitle}
                onChange={(e) => setSearchTitle(e.target.value)}
              />
            </div>
            <div className="col-md-6 mb-3">
              <label htmlFor="searchCategory" className="form-label fw-semibold">
                <i className="fas fa-folder me-1"></i>
                Search by Category
              </label>
              <select
                className="form-select"
                id="searchCategory"
                value={searchCategory}
                onChange={(e) => setSearchCategory(e.target.value)}
              >
                <option value="">All categories...</option>
                {categories.map((category: Category) => (
                  <option key={category.id} value={category.name}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mb-4">
            <label htmlFor="searchTags" className="form-label fw-semibold">
              <i className="fas fa-tags me-1"></i>
              Search by Tags
            </label>
            <select
              multiple
              className="form-select"
              id="searchTags"
              value={searchTags}
              onChange={(e) =>
                setSearchTags([...e.target.selectedOptions].map((o) => o.value))
              }
              size={4}
            >
              {tags.map((tag: Tag) => (
                <option key={tag.id} value={tag.name}>
                  {tag.name}
                </option>
              ))}
            </select>
            <div className="form-text">
              Hold Ctrl (or Cmd) to select multiple tags
            </div>
          </div>

          <div className="d-flex gap-2">
            <button
              className="btn btn-info"
              onClick={handleSearch}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                  Searching...
                </>
              ) : (
                <>
                  <i className="fas fa-search me-1"></i>
                  Search
                </>
              )}
            </button>
            <button
              className="btn btn-outline-secondary"
              onClick={clearSearch}
              disabled={isLoading}
            >
              <i className="fas fa-times me-1"></i>
              Clear
            </button>
          </div>
        </div>
      </div>

      {/* Search Results */}
      {hasSearched && (
        <div className="card shadow-sm">
          <div className="card-header bg-light">
            <h4 className="card-title mb-0">
              <i className="fas fa-list me-2 text-info"></i>
              Search Results
              <span className="badge bg-info ms-2">{notes.length}</span>
            </h4>
          </div>
          <div className="card-body p-0">
            {notes.length === 0 ? (
              <div className="text-center py-5">
                <i className="fas fa-search fs-1 text-muted mb-3"></i>
                <h5 className="text-muted">No notes found</h5>
                <p className="text-muted">Try adjusting your search criteria</p>
              </div>
            ) : (
              <div className="list-group list-group-flush">
                {notes.map((note) => (
                  <div key={note.id} className="list-group-item">
                    <div className="d-flex justify-content-between align-items-start">
                      <div className="flex-grow-1">
                        <h6 className="mb-1 fw-bold">{note.title}</h6>
                        <p className="mb-2 text-muted">{truncateContent(note.content)}</p>
                        <div className="d-flex align-items-center gap-3">
                          <small className="text-muted">
                            <i className="fas fa-calendar me-1"></i>
                            Note #{note.id}
                          </small>
                          {note.category && (
                            <span className="badge bg-secondary">
                              {note.category.name}
                            </span>
                          )}
                        </div>
                      </div>
                      {note.tags && note.tags.length > 0 && (
                        <div className="ms-3">
                          {note.tags.map((tag, index) => (
                            <span key={index} className="badge bg-light text-dark me-1">
                              {tag.name}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedSearch;
