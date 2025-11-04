// API Configuration
export const API_CONFIG = {
  // Use a relative base URL so CRA dev server can proxy requests to the backend
  // (set "proxy": "http://localhost:8080" in package.json)
  BASE_URL: '/api',
  ENDPOINTS: {
    NOTES: '/notes',
    TAGS: '/tags',
    CATEGORIES: '/categories'
  },
  TIMEOUT: 10000, // 10 seconds
};

// Helper function to check if backend is running
export const checkBackendHealth = async (): Promise<boolean> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    // Try the health endpoint first
    // Try the notes endpoint via relative path so the CRA proxy can forward it
    console.log('Checking backend health at:', `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.NOTES}`);

    // For simple GETs we intentionally avoid setting custom headers (like Content-Type)
    // to prevent preflight requests which trigger CORS checks. CRA proxy will forward
    // this to http://localhost:8080 during development.
    const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.NOTES}`, {
      method: 'GET',
      signal: controller.signal,
      // no extra headers here to avoid CORS preflight
    });
    
    clearTimeout(timeoutId);
    
    console.log('Backend health check response:', response.status, response.ok);

    if (response.ok) {
      // We expect the notes endpoint to return an array; accept any 2xx as healthy
      console.log('✅ Notes endpoint returned OK — backend considered healthy');
      return true;
    }

    console.log('❌ Notes endpoint did not return OK');
    return false;
    
  } catch (error) {
    console.error('Backend health check failed with error:', error);
    
    // More detailed CORS error detection
    if (error instanceof TypeError) {
      if (error.message.includes('Failed to fetch')) {
        console.error('🚨 CORS Error: Make sure your Spring Boot backend has CORS enabled for http://localhost:3000');
        console.error('Add @CrossOrigin(origins = "http://localhost:3000") to your controllers');
      } else if (error.message.includes('NetworkError')) {
        console.error('🚨 Network Error: Backend might not be running on http://localhost:8080');
      }
    }
    
    return false;
  }
};

// CORS configuration for development
export const CORS_CONFIG = {
  credentials: 'include',
  headers: {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': 'http://localhost:3000',
  },
};