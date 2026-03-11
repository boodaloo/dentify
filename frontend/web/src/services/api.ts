const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://37.230.162.148:3001/api';

interface RequestOptions extends RequestInit {
  params?: Record<string, string>;
}

const apiRequest = async (endpoint: string, options: RequestOptions = {}) => {
  const token = localStorage.getItem('orisios_token');
  
  const headers = new Headers(options.headers || {});
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  if (!(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  let url = `${BASE_URL}${endpoint}`;
  if (options.params) {
    const searchParams = new URLSearchParams(options.params);
    url += `?${searchParams.toString()}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    localStorage.removeItem('orisios_token');
    window.location.reload(); // Simple way to reset state to login
    throw new Error('Unauthorized');
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || errorData.message || `API Error: ${response.status}`);
  }

  return response.json();
};

export const api = {
  get: (endpoint: string, params?: Record<string, string>) => 
    apiRequest(endpoint, { method: 'GET', params }),
  
  post: (endpoint: string, body: any) => 
    apiRequest(endpoint, { 
      method: 'POST', 
      body: JSON.stringify(body) 
    }),
  
  put: (endpoint: string, body: any) => 
    apiRequest(endpoint, { 
      method: 'PUT', 
      body: JSON.stringify(body) 
    }),
  
  patch: (endpoint: string, body: any) => 
    apiRequest(endpoint, { 
      method: 'PATCH', 
      body: JSON.stringify(body) 
    }),
  
  delete: (endpoint: string) => 
    apiRequest(endpoint, { method: 'DELETE' }),
};
