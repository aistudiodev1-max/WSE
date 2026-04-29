import { useAuthStore } from '../features/auth/useAuthStore';

const BASE_URL = process.env.NEXT_PUBLIC_API_ENDPOINT || 'https://api-test.wisdomebooksclub.com';

export const apiClient = async (path: string, init: RequestInit = {}) => {
  const token = 'MOCK_TOKEN_OR_FIREBASE_TOKEN'; // In a real app with Firebase, you'd get the auth token here.
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(init.headers || {}),
  };

  const response = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers,
  });

  if (!response.ok) {
    let errorMsg = 'An error occurred';
    try {
      const data = await response.json();
      errorMsg = data.message || errorMsg;
    } catch (e) {
      // Ignored
    }
    throw new Error(errorMsg);
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return null;
  }

  return response.json();
};
