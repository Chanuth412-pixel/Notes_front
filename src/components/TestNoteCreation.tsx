import React from 'react';
import NoteService from '../services/NoteService';

const TestNoteCreation: React.FC = () => {
  
  const testSimpleNote = async () => {
    console.log('Testing simple note creation...');
    
    const simpleNote = {
      title: "Test Note",
      content: "This is a test note content",
      tags: [{ name: "test" }],
      category: null,
    };
    
    try {
      console.log('Sending simple note:', simpleNote);
      const result = await NoteService.createNote(simpleNote);
      console.log('Success:', result);
      alert('Simple note created successfully!');
    } catch (error) {
      console.error('Simple note failed:', error);
      alert('Simple note creation failed');
    }
  };

  const testWithCategory = async () => {
    console.log('Testing note with category...');
    
    const noteWithCategory = {
      title: "Test Note with Category",
      content: "This is a test note with category",
      tags: [{ name: "test" }, { name: "category" }],
      category: {
        id: 1,
        name: "Personal",
        description: "Personal notes"
      },
    };
    
    try {
      console.log('Sending note with category:', noteWithCategory);
      const result = await NoteService.createNote(noteWithCategory);
      console.log('Success:', result);
      alert('Note with category created successfully!');
    } catch (error) {
      console.error('Note with category failed:', error);
      alert('Note with category creation failed');
    }
  };

  const testMinimalNote = async () => {
    console.log('Testing minimal note...');
    
    const minimalNote = {
      title: "Minimal Test",
      content: "Minimal content",
      tags: [],
      category: null,
    };
    
    try {
      console.log('Sending minimal note:', minimalNote);
      const result = await NoteService.createNote(minimalNote);
      console.log('Success:', result);
      alert('Minimal note created successfully!');
    } catch (error) {
      console.error('Minimal note failed:', error);
      alert('Minimal note creation failed');
    }
  };

  return (
    <div className="container mt-4">
      <h3>Debug Note Creation</h3>
      <div className="d-flex gap-2">
        <button 
          className="btn btn-primary" 
          onClick={testMinimalNote}
        >
          Test Minimal Note
        </button>
        <button 
          className="btn btn-secondary" 
          onClick={testSimpleNote}
        >
          Test Simple Note
        </button>
        <button 
          className="btn btn-info" 
          onClick={testWithCategory}
        >
          Test With Category
        </button>
      </div>
      <div className="mt-3">
        <small className="text-muted">
          Check the browser console for detailed logs and network requests.
        </small>
      </div>
    </div>
  );
};

export default TestNoteCreation;