import React, { useState, useEffect } from 'react';
import TagService from '../services/TagService';
import { Tag } from '../models/Tag';

const TagManagement: React.FC = () => {
  const [tags, setTags] = useState<Tag[]>([]);
  const [newTag, setNewTag] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    const fetchTags = async () => {
      try {
        setIsLoading(true);
        const fetchedTags = await TagService.getAllTags();
        setTags(fetchedTags);
      } catch (error) {
        console.error('Error fetching tags:', error);
        const alert = document.createElement('div');
        alert.className = 'alert alert-danger alert-dismissible fade show';
        alert.innerHTML = `
          <i class="fas fa-exclamation-triangle me-2"></i>
          Failed to load tags.
          <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        document.querySelector('.tag-management')?.prepend(alert);
        setTimeout(() => alert.remove(), 5000);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTags();
  }, []);

  const handleCreateTag = async () => {
    if (!newTag.trim()) {
      const alert = document.createElement('div');
      alert.className = 'alert alert-warning alert-dismissible fade show';
      alert.innerHTML = `
        <i class="fas fa-exclamation-triangle me-2"></i>
        Please enter a valid tag name.
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
      `;
      document.querySelector('.tag-management')?.prepend(alert);
      setTimeout(() => alert.remove(), 3000);
      return;
    }

    try {
      setIsCreating(true);
      const createdTag = await TagService.createCustomTag(newTag);
      setTags((prevTags) => [...prevTags, createdTag]);
      setNewTag('');
      
      const alert = document.createElement('div');
      alert.className = 'alert alert-success alert-dismissible fade show';
      alert.innerHTML = `
        <i class="fas fa-check-circle me-2"></i>
        Tag "${createdTag.name}" created successfully!
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
      `;
      document.querySelector('.tag-management')?.prepend(alert);
      setTimeout(() => alert.remove(), 3000);
    } catch (error) {
      console.error('Error creating tag:', error);
      const alert = document.createElement('div');
      alert.className = 'alert alert-danger alert-dismissible fade show';
      alert.innerHTML = `
        <i class="fas fa-exclamation-triangle me-2"></i>
        Failed to create tag.
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
      `;
      document.querySelector('.tag-management')?.prepend(alert);
      setTimeout(() => alert.remove(), 5000);
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteTag = async (tagId: number, tagName: string) => {
    if (window.confirm(`Are you sure you want to delete the tag "${tagName}"?`)) {
      try {
        await TagService.deleteTag(tagId);
        setTags((prevTags) => prevTags.filter((tag) => tag.id !== tagId));
        
        const alert = document.createElement('div');
        alert.className = 'alert alert-success alert-dismissible fade show';
        alert.innerHTML = `
          <i class="fas fa-check-circle me-2"></i>
          Tag "${tagName}" deleted successfully!
          <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        document.querySelector('.tag-management')?.prepend(alert);
        setTimeout(() => alert.remove(), 3000);
      } catch (error) {
        console.error('Error deleting tag:', error);
        const alert = document.createElement('div');
        alert.className = 'alert alert-danger alert-dismissible fade show';
        alert.innerHTML = `
          <i class="fas fa-exclamation-triangle me-2"></i>
          Failed to delete tag.
          <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        document.querySelector('.tag-management')?.prepend(alert);
        setTimeout(() => alert.remove(), 5000);
      }
    }
  };

  const systemTags = tags.filter(tag => tag.isSystemTag);
  const userTags = tags.filter(tag => !tag.isSystemTag);

  if (isLoading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3 text-muted">Loading tags...</p>
      </div>
    );
  }

  return (
    <div className="tag-management">
      {/* Create New Tag Card */}
      <div className="card shadow-sm mb-4">
        <div className="card-header bg-warning text-dark">
          <h3 className="card-title mb-0">
            <i className="fas fa-tags me-2"></i>
            Tag Management
          </h3>
        </div>
        <div className="card-body">
          <h5 className="mb-3">
            <i className="fas fa-plus-circle me-2"></i>
            Create New Tag
          </h5>
          <div className="row">
            <div className="col-md-8 mb-3 mb-md-0">
              <input
                type="text"
                className="form-control"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Enter new tag name..."
                onKeyDown={(e) => e.key === 'Enter' && handleCreateTag()}
              />
            </div>
            <div className="col-md-4">
              <button
                className="btn btn-warning w-100"
                onClick={handleCreateTag}
                disabled={isCreating || !newTag.trim()}
              >
                {isCreating ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                    Creating...
                  </>
                ) : (
                  <>
                    <i className="fas fa-plus me-1"></i>
                    Add Tag
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* User Tags */}
      <div className="card shadow-sm mb-4">
        <div className="card-header bg-light">
          <h4 className="card-title mb-0">
            <i className="fas fa-user me-2 text-primary"></i>
            Your Tags
            <span className="badge bg-primary ms-2">{userTags.length}</span>
          </h4>
        </div>
        <div className="card-body">
          {userTags.length === 0 ? (
            <div className="text-center py-4">
              <i className="fas fa-tags fs-1 text-muted mb-3"></i>
              <h5 className="text-muted">No custom tags yet</h5>
              <p className="text-muted">Create your first tag above to get started!</p>
            </div>
          ) : (
            <div className="row">
              {userTags.map((tag) => (
                <div key={tag.id} className="col-md-6 col-lg-4 mb-3">
                  <div className="card border-primary">
                    <div className="card-body p-3">
                      <div className="d-flex justify-content-between align-items-center">
                        <div className="flex-grow-1">
                          <span className="badge bg-primary fs-6 me-2">
                            {tag.name}
                          </span>
                        </div>
                        <button
                          className="btn btn-outline-danger btn-sm"
                          onClick={() => handleDeleteTag(tag.id, tag.name)}
                          title="Delete tag"
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* System Tags */}
      {systemTags.length > 0 && (
        <div className="card shadow-sm">
          <div className="card-header bg-light">
            <h4 className="card-title mb-0">
              <i className="fas fa-cog me-2 text-secondary"></i>
              System Tags
              <span className="badge bg-secondary ms-2">{systemTags.length}</span>
            </h4>
          </div>
          <div className="card-body">
            <p className="text-muted mb-3">
              <i className="fas fa-info-circle me-1"></i>
              System tags cannot be deleted
            </p>
            <div className="row">
              {systemTags.map((tag) => (
                <div key={tag.id} className="col-md-6 col-lg-4 mb-3">
                  <div className="card border-secondary">
                    <div className="card-body p-3">
                      <span className="badge bg-secondary fs-6">
                        {tag.name}
                      </span>
                      <small className="text-muted ms-2">(System)</small>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TagManagement;
