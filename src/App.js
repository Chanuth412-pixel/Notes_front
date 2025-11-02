import React, { useState, useEffect } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Container, Card, Button, Modal, Form, Row, Col, Badge, Alert } from 'react-bootstrap';

const API_BASE_URL = 'http://localhost:8080/api';

function App() {
  const [notes, setNotes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    categoryId: '',
    tags: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchNotes();
    fetchCategories();
  }, []);

  const fetchNotes = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/notes`);
      setNotes(response.data);
    } catch (error) {
      console.error('Error fetching notes:', error);
      setError('Failed to fetch notes');
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/categories`);
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setError('Failed to fetch categories');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const noteData = {
        title: formData.title,
        content: formData.content,
        category: formData.categoryId ? { id: formData.categoryId } : null
      };

      if (editingNote) {
        await axios.put(`${API_BASE_URL}/notes/${editingNote.id}`, noteData);
        setSuccess('Note updated successfully!');
      } else {
        await axios.post(`${API_BASE_URL}/notes`, noteData);
        setSuccess('Note created successfully!');
      }

      setShowModal(false);
      setFormData({ title: '', content: '', categoryId: '', tags: '' });
      setEditingNote(null);
      fetchNotes();
    } catch (error) {
      console.error('Error saving note:', error);
      setError('Failed to save note');
    }
  };

  const handleEdit = (note) => {
    setEditingNote(note);
    setFormData({
      title: note.title,
      content: note.content,
      categoryId: note.category ? note.category.id : '',
      tags: note.tags ? note.tags.map(tag => tag.name).join(', ') : ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      try {
        await axios.delete(`${API_BASE_URL}/notes/${id}`);
        setSuccess('Note deleted successfully!');
        fetchNotes();
      } catch (error) {
        console.error('Error deleting note:', error);
        setError('Failed to delete note');
      }
    }
  };

  const openModal = () => {
    setEditingNote(null);
    setFormData({ title: '', content: '', categoryId: '', tags: '' });
    setShowModal(true);
  };

  return (
    <Container className="mt-4">
      <h1 className="mb-4">Notes Application</h1>
      
      {error && <Alert variant="danger" onClose={() => setError('')} dismissible>{error}</Alert>}
      {success && <Alert variant="success" onClose={() => setSuccess('')} dismissible>{success}</Alert>}
      
      <Button variant="primary" onClick={openModal} className="mb-3">
        Add New Note
      </Button>

      <Row>
        {notes.map(note => (
          <Col md={6} lg={4} key={note.id} className="mb-3">
            <Card>
              <Card.Body>
                <Card.Title>{note.title}</Card.Title>
                <Card.Text>
                  {note.content.length > 100 
                    ? `${note.content.substring(0, 100)}...` 
                    : note.content
                  }
                </Card.Text>
                {note.category && (
                  <Badge bg="secondary" className="me-2">
                    {note.category.name}
                  </Badge>
                )}
                {note.tags && note.tags.map(tag => (
                  <Badge key={tag.id} bg="info" className="me-1">
                    {tag.name}
                  </Badge>
                ))}
                <div className="mt-2">
                  <small className="text-muted">
                    Created: {new Date(note.createdAt).toLocaleDateString()}
                  </small>
                </div>
                <div className="mt-2">
                  <Button 
                    variant="outline-primary" 
                    size="sm" 
                    onClick={() => handleEdit(note)}
                    className="me-2"
                  >
                    Edit
                  </Button>
                  <Button 
                    variant="outline-danger" 
                    size="sm" 
                    onClick={() => handleDelete(note.id)}
                  >
                    Delete
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {notes.length === 0 && (
        <div className="text-center mt-5">
          <h5>No notes found</h5>
          <p>Click "Add New Note" to create your first note!</p>
        </div>
      )}

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{editingNote ? 'Edit Note' : 'Add New Note'}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Title</Form.Label>
              <Form.Control
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                required
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Content</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                value={formData.content}
                onChange={(e) => setFormData({...formData, content: e.target.value})}
                required
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Category</Form.Label>
              <Form.Select
                value={formData.categoryId}
                onChange={(e) => setFormData({...formData, categoryId: e.target.value})}
              >
                <option value="">Select a category (optional)</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Tags (comma-separated)</Form.Label>
              <Form.Control
                type="text"
                value={formData.tags}
                onChange={(e) => setFormData({...formData, tags: e.target.value})}
                placeholder="tag1, tag2, tag3"
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              {editingNote ? 'Update Note' : 'Create Note'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
}

export default App;
