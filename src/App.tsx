import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import NoteForm from './components/NoteForm';
import AdvancedSearch from './components/AdvancedSearch';
import TagManagement from './components/TagManagement';
import Dashboard from './components/Dashboard';
import TestNoteCreation from './components/TestNoteCreation';
import { checkBackendHealth } from './config/api';

/*
  CORS Configuration Required for Spring Boot Backend:
  
  Add this to your Spring Boot Application class or Configuration:
  
  @Configuration
  public class CorsConfig {
      @Bean
      public CorsConfigurationSource corsConfigurationSource() {
          CorsConfiguration configuration = new CorsConfiguration();
          configuration.setAllowedOriginPatterns(Arrays.asList("http://localhost:3002", "http://localhost:3001", "http://localhost:3000"));
          configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
          configuration.setAllowedHeaders(Arrays.asList("*"));
          configuration.setAllowCredentials(true);
          
          UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
          source.registerCorsConfiguration("/api/**", configuration);
          return source;
      }
  }
  
  OR add @CrossOrigin annotation to your controllers:
  @CrossOrigin(origins = {"http://localhost:3002", "http://localhost:3001", "http://localhost:3000"})
*/

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [backendStatus, setBackendStatus] = useState<'checking' | 'online' | 'offline'>('checking');

  const checkBackendStatus = async () => {
    setBackendStatus('checking');
    const isOnline = await checkBackendHealth();
    setBackendStatus(isOnline ? 'online' : 'offline');
  };

  useEffect(() => {
    checkBackendStatus();
    // Check backend status every 60 seconds (reduced frequency)
    const interval = setInterval(checkBackendStatus, 60000);
    
    return () => clearInterval(interval);
  }, []);

  const renderActiveComponent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'create':
        return <NoteForm />;
      case 'search':
        return <AdvancedSearch />;
      case 'tags':
        return <TagManagement />;
      case 'debug':
        return <TestNoteCreation />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="App">
      {/* Modern Navbar */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary shadow-sm">
        <div className="container">
          <span className="navbar-brand fw-bold">
            <i className="fas fa-sticky-note me-2"></i>
            NotesApp
          </span>
          
          {/* Backend Status Indicator */}
          <div className="me-3">
            {backendStatus === 'checking' && (
              <span className="badge bg-warning">
                <i className="fas fa-spinner fa-spin me-1"></i>
                Checking Backend...
              </span>
            )}
            {backendStatus === 'online' && (
              <span className="badge bg-success">
                <i className="fas fa-check-circle me-1"></i>
                Backend Online
              </span>
            )}
            {backendStatus === 'offline' && (
              <button 
                className="btn btn-sm btn-outline-light"
                onClick={checkBackendStatus}
                title="Retry connection to backend"
              >
                <i className="fas fa-exclamation-triangle me-1"></i>
                Backend Offline - Retry
              </button>
            )}
          </div>
          
          <div className="navbar-nav ms-auto">
            <button
              className={`nav-link btn btn-link text-white ${activeTab === 'dashboard' ? 'active' : ''}`}
              onClick={() => setActiveTab('dashboard')}
            >
              <i className="fas fa-tachometer-alt me-1"></i>
              Dashboard
            </button>
            <button
              className={`nav-link btn btn-link text-white ${activeTab === 'create' ? 'active' : ''}`}
              onClick={() => setActiveTab('create')}
            >
              <i className="fas fa-plus me-1"></i>
              Create Note
            </button>
            <button
              className={`nav-link btn btn-link text-white ${activeTab === 'search' ? 'active' : ''}`}
              onClick={() => setActiveTab('search')}
            >
              <i className="fas fa-search me-1"></i>
              Search
            </button>
                        <button 
              className={`btn ${activeTab === 'tags' ? 'btn-primary' : 'btn-outline-primary'} d-flex align-items-center`}
              onClick={() => setActiveTab('tags')}
            >
              <i className="fas fa-tags me-1"></i>
              Tags
            </button>
            <button 
              className={`btn ${activeTab === 'debug' ? 'btn-warning' : 'btn-outline-warning'} d-flex align-items-center`}
              onClick={() => setActiveTab('debug')}
            >
              <i className="fas fa-bug me-1"></i>
              Debug
            </button>
          </div>
        </div>
      </nav>

      {/* Backend Offline Warning */}
            {backendStatus === 'offline' && (
        <div className="container-fluid">
          <div className="alert alert-warning alert-dismissible fade show m-3" role="alert">
            <i className="fas fa-exclamation-triangle me-2"></i>
                  <strong>Backend Not Available!</strong> The Spring Boot backend may not be responding. 
            <div className="mt-2">
              <strong>Quick Fix:</strong>
              <ul className="mt-2 mb-3">
                <li>Start your Spring Boot application</li>
                <li>Verify it's running on port 8080</li>
                <li>Add CORS configuration (see code comments in App.tsx)</li>
              </ul>
              <div className="d-flex gap-2">
                <button 
                  className="btn btn-outline-warning btn-sm"
                  onClick={checkBackendStatus}
                >
                  <i className="fas fa-redo me-1"></i>
                  Test Connection
                </button>
                <button 
                        className="btn btn-outline-info btn-sm"
                        onClick={() => window.open('/api/notes', '_blank')}
                >
                  <i className="fas fa-external-link-alt me-1"></i>
                  Open Backend URL
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="container-fluid py-4">
        <div className="row justify-content-center">
          <div className="col-12 col-lg-10 col-xl-8">
            {renderActiveComponent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
