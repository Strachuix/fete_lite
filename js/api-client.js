/**
 * API Client - Warstwa komunikacji z backendem
 * Hybrydowy tryb: API + localStorage cache
 */

class ApiClient {
  constructor(baseURL = null) {
    // Użyj Config jeśli dostępny, w przeciwnym razie fallback
    this.baseURL = baseURL || (window.Config ? window.Config.getApiUrl() : 'http://localhost:8000');
    this.token = this.getToken();
    this.refreshToken = this.getRefreshToken();
    this.isRefreshing = false;
    this.failedQueue = [];
  }

  // ==================== Token Management ====================

  getToken() {
    return localStorage.getItem('access_token');
  }

  setToken(token) {
    localStorage.setItem('access_token', token);
    this.token = token;
  }

  getRefreshToken() {
    return localStorage.getItem('refresh_token');
  }

  setRefreshToken(token) {
    localStorage.setItem('refresh_token', token);
    this.refreshToken = token;
  }

  clearTokens() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    this.token = null;
    this.refreshToken = null;
  }

  // ==================== Request Handler ====================

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };

    // Dodaj token jeśli dostępny
    if (this.token && !options.skipAuth) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers
      });

      // Token wygasł - spróbuj odświeżyć
      if (response.status === 401 && !options.skipAuth && this.refreshToken) {
        return await this.handleTokenRefresh(endpoint, options);
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || data.message || 'API Error');
      }

      return data;
    } catch (error) {
      // Sprawdź czy to błąd sieci (offline)
      if (error.message === 'Failed to fetch' || !navigator.onLine) {
        throw new Error('OFFLINE');
      }
      throw error;
    }
  }

  async handleTokenRefresh(endpoint, options) {
    // Zapobiegaj wielokrotnym próbom odświeżenia
    if (this.isRefreshing) {
      return new Promise((resolve, reject) => {
        this.failedQueue.push({ resolve, reject, endpoint, options });
      });
    }

    this.isRefreshing = true;

    try {
      const response = await this.refreshAccessToken();
      this.setToken(response.data.tokens.access_token);

      // Ponów wszystkie zakolejkowane requesty
      this.failedQueue.forEach(({ resolve, endpoint, options }) => {
        resolve(this.request(endpoint, options));
      });
      this.failedQueue = [];

      // Ponów oryginalny request
      return await this.request(endpoint, options);
    } catch (error) {
      // Refresh token też nieważny - wyloguj
      this.clearTokens();
      this.failedQueue.forEach(({ reject }) => {
        reject(new Error('Session expired'));
      });
      this.failedQueue = [];
      
      // Przekieruj do logowania
      if (window.location.pathname !== '/auth.html') {
        window.location.href = '/auth.html?expired=true';
      }
      
      throw error;
    } finally {
      this.isRefreshing = false;
    }
  }

  // ==================== Authentication ====================

  async sha256(message) {
    const encoder = new TextEncoder();
    const data = encoder.encode(message);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
    return hashHex;
  }


  async register(userData) {
    const response = await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
      skipAuth: true
    });

    // Zapisz tokeny
    this.setToken(response.data.tokens.access_token);
    this.setRefreshToken(response.data.tokens.refresh_token);

    return response.data.user;
  }

  async login(email, password) {
    password = await this.sha256(password);
    var response = await this.request('login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
      skipAuth: true
    });
    // Zapisz tokeny
    // this.setToken(response.data.tokens.access_token);
    // this.setRefreshToken(response.data.tokens.refresh_token);
    
    return response.user;
  }

  async refreshAccessToken() {
    return await this.request('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refresh_token: this.refreshToken }),
      skipAuth: true
    });
  }

  async logout() {
    try {
      await this.request('/auth/logout', {
        method: 'POST'
      });
    } catch (error) {
      console.warn('Logout API call failed:', error);
    } finally {
      this.clearTokens();
    }
  }

  async getProfile() {
    const response = await this.request('/auth/me');
    return response.data;
  }

  // ==================== Events ====================

  async getEvents(filters = {}) {
    // Buduj query params
    const params = new URLSearchParams();
    
    if (filters.theme) params.append('theme', filters.theme);
    if (filters.status) params.append('status', filters.status);
    if (filters.search) params.append('search', filters.search);
    if (filters.latitude && filters.longitude) {
      params.append('latitude', filters.latitude);
      params.append('longitude', filters.longitude);
      params.append('radius', filters.radius || 50);
    }

    const queryString = params.toString();
    const endpoint = queryString ? `/events?${queryString}` : '/events';
    
    const response = await this.request(endpoint);
    return response.data;
  }

  async getEvent(id) {
    const response = await this.request(`/events/${id}`);
    return response.data;
  }

  async createEvent(eventData) {
    const response = await this.request('/events', {
      method: 'POST',
      body: JSON.stringify(eventData)
    });
    return response.data;
  }

  async updateEvent(id, eventData) {
    const response = await this.request(`/events/${id}`, {
      method: 'PUT',
      body: JSON.stringify(eventData)
    });
    return response.data;
  }

  async deleteEvent(id) {
    const response = await this.request(`/events/${id}`, {
      method: 'DELETE'
    });
    return response.data;
  }

  async joinEvent(eventId) {
    const response = await this.request(`/events/${eventId}/join`, {
      method: 'POST'
    });
    return response.data;
  }

  async leaveEvent(eventId) {
    const response = await this.request(`/events/${eventId}/leave`, {
      method: 'POST'
    });
    return response.data;
  }

  async getEventParticipants(eventId) {
    const response = await this.request(`/events/${eventId}/participants`);
    return response.data;
  }

  // ==================== File Upload ====================

  async uploadEventImage(file) {
    const formData = new FormData();
    formData.append('image', file);

    const url = `${this.baseURL}/upload/event`;
    const headers = {};

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: formData
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Upload failed');
    }

    const data = await response.json();
    return data.data;
  }

  async uploadProfileImage(file) {
    const formData = new FormData();
    formData.append('image', file);

    const url = `${this.baseURL}/upload/profile`;
    const headers = {};

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: formData
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Upload failed');
    }

    const data = await response.json();
    return data.data;
  }

  // ==================== Notifications ====================

  async getNotifications() {
    const response = await this.request('/notifications');
    return response.data;
  }

  async markNotificationRead(notificationId) {
    const response = await this.request(`/notifications/${notificationId}/read`, {
      method: 'POST'
    });
    return response.data;
  }

  async markAllNotificationsRead() {
    const response = await this.request('/notifications/mark-all-read', {
      method: 'POST'
    });
    return response.data;
  }

  // ==================== Health Check ====================

  async healthCheck() {
    try {
      const response = await this.request('/health', { skipAuth: true });
      // Backend zwraca: {"success":true,"data":{"status":"healthy",...}}
      return response.success && response.data && response.data.status === 'healthy';
    } catch (error) {
      console.error('[ApiClient] Health check failed:', error);
      return false;
    }
  }

  // ==================== Utility ====================

  isOnline() {
    return navigator.onLine;
  }

  hasValidToken() {
    return !!this.token;
  }
}

// Singleton - globalna instancja
if (typeof window !== 'undefined') {
  window.apiClient = new ApiClient();
  console.log('✅ API Client initialized');
}
