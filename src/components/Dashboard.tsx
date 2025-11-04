import React, { useEffect, useState } from 'react';
import NoteService from '../services/NoteService';
import CategoryService from '../services/CategoryService';
import TagService from '../services/TagService';
import type { Note, Category, Tag } from '../models/Note';

const Dashboard: React.FC = () => {
  const [recentNotes, setRecentNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    total: 0,
    thisWeek: 0,
    categories: 0
  });
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [editTags, setEditTags] = useState<Tag[]>([]);
  const [newTagName, setNewTagName] = useState('');

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        setIsLoading(true);
        const [result, fetchedCategories, fetchedTags] = await Promise.all([
          NoteService.getAllNotes(),
          CategoryService.getAllCategories(),
          TagService.getAllTags()
        ]);
        const notes: Note[] = Array.isArray(result) ? result : (result as any)?.data ?? [];
        setRecentNotes(notes);
        setCategories(fetchedCategories);
        setAllTags(fetchedTags);
        
        // Calculate stats
        // Calculate recent notes (since we don't have dateCreated, use first 10)
        const recentNotes = notes.slice(0, 10);
        const uniqueCategories = new Set(notes.map(note => note.category?.name).filter(Boolean));
        
        setStats({
          total: notes.length,
          thisWeek: recentNotes.length,
          categories: uniqueCategories.size
        });
      } catch (error) {
        console.error('Error fetching notes:', error);
        setError(error instanceof Error ? error.message : 'Failed to fetch notes');
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotes();
  }, []);

  const openNoteModal = async (note: Note) => {
    try {
      // Fetch full note by id to ensure we have most fields populated
      if (!note.id) return;
      const full = await NoteService.getNoteById(note.id as number);
      setSelectedNote(full);
      setEditTitle(full.title || '');
      setEditContent(full.content || '');
      setEditTags(full.tags || []);
      setIsModalOpen(true);
    } catch (err) {
      console.error('Failed to load note details', err);
      alert('Failed to load note details');
    }
  };

  const closeNoteModal = () => {
    setIsModalOpen(false);
    setSelectedNote(null);
  };

  const saveNoteEdits = async () => {
    if (!selectedNote) return;
    const updated: Note = {
      ...selectedNote,
      title: editTitle,
      content: editContent,
      tags: editTags || [],
      category: selectedNote.category || null
    };
    try {
      const res = await NoteService.updateNote(updated);
      // update list locally
      setRecentNotes(prev => prev.map(n => n.id === res.id ? res : n));
      closeNoteModal();
      alert('Note updated');
    } catch (err) {
      console.error('Failed to update note', err);
      alert('Failed to update note');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const truncateContent = (content: string, maxLength: number = 100) => {
    if (!content) return '';
    return content.length > maxLength ? content.substring(0, maxLength) + '...' : content;
  };

  if (isLoading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3 text-muted">Loading your notes...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger" role="alert">
        <h4 className="alert-heading">
          <i className="fas fa-exclamation-triangle me-2"></i>
          Connection Error
        </h4>
        <p>{error}</p>
        <hr />
        <p className="mb-0">
          <strong>Troubleshooting:</strong>
          <ul className="mt-2">
            <li>Make sure your Spring Boot backend is running on <code>http://localhost:8080</code></li>
            <li>Check that your backend has CORS enabled for <code>http://localhost:3001</code></li>
            <li>Verify the <code>/api/notes</code> endpoint is accessible</li>
          </ul>
          <button 
            className="btn btn-outline-danger mt-2"
            onClick={() => window.location.reload()}
          >
            <i className="fas fa-redo me-1"></i>
            Retry
          </button>
        </p>
      </div>
    );
  }

  return (
    <div className="dashboard">
      {/* Welcome Header */}
      <div className="row mb-4">
        <div className="col">
          <h2 className="display-6 fw-bold text-primary mb-1">
            <i className="fas fa-tachometer-alt me-2"></i>
            Dashboard
          </h2>
          <p className="text-muted">Welcome back! Here's an overview of your notes.</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="row mb-4">
        <div className="col-md-4 mb-3">
          <div className="card border-0 shadow-sm h-100 bg-primary text-white">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="flex-grow-1">
                  <h5 className="card-title opacity-75 mb-1">Total Notes</h5>
                  <h2 className="mb-0 fw-bold">{stats.total}</h2>
                </div>
                <div className="fs-1 opacity-50">
                  <i className="fas fa-sticky-note"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-4 mb-3">
          <div className="card border-0 shadow-sm h-100 bg-success text-white">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="flex-grow-1">
                  <h5 className="card-title opacity-75 mb-1">This Week</h5>
                  <h2 className="mb-0 fw-bold">{stats.thisWeek}</h2>
                </div>
                <div className="fs-1 opacity-50">
                  <i className="fas fa-calendar-week"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-4 mb-3">
          <div className="card border-0 shadow-sm h-100 bg-info text-white">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="flex-grow-1">
                  <h5 className="card-title opacity-75 mb-1">Categories</h5>
                  <h2 className="mb-0 fw-bold">{stats.categories}</h2>
                </div>
                <div className="fs-1 opacity-50">
                  <i className="fas fa-folder"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Notes */}
      <div className="row">
        <div className="col">
          <div className="card shadow-sm">
            <div className="card-header bg-light">
              <h4 className="card-title mb-0">
                <i className="fas fa-clock me-2 text-primary"></i>
                Recent Notes
              </h4>
            </div>
            <div className="card-body p-0">
              {recentNotes.length === 0 ? (
                <div className="text-center py-5">
                  <i className="fas fa-sticky-note fs-1 text-muted mb-3"></i>
                  <h5 className="text-muted">No notes yet</h5>
                  <p className="text-muted">Create your first note to get started!</p>
                </div>
              ) : (
                <div className="row g-0">
                  {recentNotes.slice(0, 6).map((note, index) => (
                    <div key={note.id ?? `note-${index}`} className="col-md-6 col-lg-4">
                      <div className="card border-0 h-100">
                        <div className="card-body border-end border-bottom">
                          <div className="d-flex justify-content-between align-items-start mb-2">
                            <h6 className="card-title mb-0 text-truncate flex-grow-1 pe-2" style={{cursor: 'pointer'}} onClick={() => openNoteModal(note)}>
                              {note.title}
                            </h6>
                            {note.category && (
                              <span className="badge bg-secondary text-nowrap">
                                {note.category.name}
                              </span>
                            )}
                          </div>
                          <p className="card-text text-muted small mb-2">
                            {truncateContent(note.content)}
                          </p>
                          <div className="d-flex justify-content-between align-items-center">
                            <small className="text-muted">
                              <i className="fas fa-calendar me-1"></i>
                              Note #{note.id}
                            </small>
                            {note.tags && note.tags.length > 0 && (
                              <div className="d-flex gap-1">
                                {note.tags.slice(0, 2).map((tag, tagIndex) => (
                                  <span key={tag.id ?? tag.name ?? `tag-${note.id ?? index}-${tagIndex}`} className="badge bg-light text-dark">
                                    {tag.name}
                                  </span>
                                ))}
                                {note.tags.length > 2 && (
                                  <span className="badge bg-light text-dark">
                                    +{note.tags.length - 2}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {recentNotes.length > 6 && (
              <div className="card-footer bg-light text-center">
                <small className="text-muted">
                  Showing 6 of {recentNotes.length} notes
                </small>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Modal for viewing/editing note */}
      {isModalOpen && selectedNote && (
        <div className="modal show d-block" tabIndex={-1} role="dialog">
          <div className="modal-dialog modal-lg" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Edit Note #{selectedNote.id}</h5>
                <button type="button" className="btn-close" onClick={closeNoteModal}></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Title</label>
                  <input className="form-control" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} />
                </div>
                <div className="mb-3">
                  <label className="form-label">Content</label>
                  <textarea className="form-control" rows={8} value={editContent} onChange={(e) => setEditContent(e.target.value)} />
                </div>
                <div className="mb-3">
                  <label className="form-label">Category</label>
                  <select className="form-select" value={selectedNote?.category?.id || ''} onChange={(e) => {
                    const id = e.target.value ? parseInt(e.target.value) : undefined;
                    const cat = categories.find(c => c.id === id) || null;
                    setSelectedNote(prev => prev ? { ...prev, category: cat } : prev);
                  }}>
                    <option value="">None</option>
                    {categories.map(c => (
                      <option key={c.id ?? c.name} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div className="mb-3">
                  <label className="form-label">Tags</label>
                  <div className="mb-2">
                    {allTags.map((t) => {
                      const checked = editTags.some(et => et.name === t.name || et.id === t.id);
                      const tagKey = t.id ?? t.name;
                      return (
                        <div className="form-check form-check-inline" key={tagKey}>
                          <input className="form-check-input" type="checkbox" id={`tag-${tagKey}`} checked={checked} onChange={(e) => {
                            if (e.target.checked) setEditTags(prev => [...prev, t]);
                            else setEditTags(prev => prev.filter(pt => pt.id !== t.id));
                          }} />
                          <label className="form-check-label" htmlFor={`tag-${tagKey}`}>{t.name}</label>
                        </div>
                      );
                    })}
                  </div>

                  <div className="input-group mt-2">
                    <input className="form-control" placeholder="Create tag..." value={newTagName} onChange={(e) => setNewTagName(e.target.value)} />
                    <button type="button" className="btn btn-outline-secondary" onClick={async () => {
                      const name = newTagName.trim();
                      if (!name) return;
                      try {
                        const created = await TagService.createCustomTag(name);
                        setAllTags(prev => [created, ...prev]);
                        setEditTags(prev => [...prev, created]);
                        setNewTagName('');
                      } catch (err) {
                        console.error('Failed to create tag', err);
                        alert('Failed to create tag');
                      }
                    }}>Add</button>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={closeNoteModal}>Close</button>
                <button type="button" className="btn btn-primary" onClick={saveNoteEdits}>Save changes</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
