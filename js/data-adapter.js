/**
 * Data Adapter - Konwersja formatów danych między Frontend ↔ Backend
 * Frontend używa camelCase, Backend używa snake_case
 */

class DataAdapter {
  
  // ==================== Event Conversion ====================

  /**
   * Konwertuje wydarzenie z formatu frontendowego do API
   * @param {Object} frontendEvent - Wydarzenie z localStorage (camelCase)
   * @returns {Object} Wydarzenie dla API (snake_case)
   */
  static eventToApi(frontendEvent) {
    const apiEvent = {
      title: frontendEvent.title,
      description: frontendEvent.description,
      start_date: this.formatDateForApi(frontendEvent.startDate),
      location_name: frontendEvent.location,
      max_participants: frontendEvent.maxParticipants,
      theme: frontendEvent.theme || 'other'
    };

    // Opcjonalne pola
    if (frontendEvent.endDate) {
      apiEvent.end_date = this.formatDateForApi(frontendEvent.endDate);
    }

    if (frontendEvent.coordinates) {
      apiEvent.latitude = frontendEvent.coordinates.lat;
      apiEvent.longitude = frontendEvent.coordinates.lng;
    }

    if (frontendEvent.isPaid !== undefined) {
      apiEvent.is_paid = frontendEvent.isPaid;
      apiEvent.price = frontendEvent.price || 0;
      apiEvent.currency = frontendEvent.currency || 'PLN';
    }

    if (frontendEvent.accommodationAvailable !== undefined) {
      apiEvent.accommodation_available = frontendEvent.accommodationAvailable;
      apiEvent.max_overnight_participants = frontendEvent.maxOvernightParticipants || 0;
      apiEvent.accommodation_info = frontendEvent.accommodationInfo || '';
    }

    if (frontendEvent.images && frontendEvent.images.length > 0) {
      // Filtruj tylko URL-e (nie base64)
      apiEvent.images = frontendEvent.images.filter(img => 
        img.startsWith('http://') || img.startsWith('https://')
      );
    }

    // Public visibility
    if (frontendEvent.is_public !== undefined) {
      apiEvent.is_public = frontendEvent.is_public ? 1 : 0;
    }

    return apiEvent;
  }

  /**
   * Konwertuje wydarzenie z API do formatu frontendowego
   * @param {Object} apiEvent - Wydarzenie z backendu (snake_case)
   * @returns {Object} Wydarzenie dla frontendu (camelCase)
   */
  static eventFromApi(apiEvent) {
    const frontendEvent = {
      id: apiEvent.id,
      title: apiEvent.title,
      description: apiEvent.description,
      startDate: this.formatDateFromApi(apiEvent.start_date),
      location: apiEvent.location_name,
      maxParticipants: apiEvent.max_participants,
      theme: apiEvent.theme,
      organizerId: apiEvent.organizer_id,
      createdAt: apiEvent.created_at,
      updatedAt: apiEvent.updated_at
    };

    // Opcjonalne pola
    if (apiEvent.end_date) {
      frontendEvent.endDate = this.formatDateFromApi(apiEvent.end_date);
    }

    if (apiEvent.latitude && apiEvent.longitude) {
      frontendEvent.coordinates = {
        lat: parseFloat(apiEvent.latitude),
        lng: parseFloat(apiEvent.longitude)
      };
    }

    if (apiEvent.is_paid !== undefined) {
      frontendEvent.isPaid = apiEvent.is_paid;
      frontendEvent.price = apiEvent.price;
      frontendEvent.currency = apiEvent.currency || 'PLN';
    }

    if (apiEvent.accommodation_available !== undefined) {
      frontendEvent.accommodationAvailable = apiEvent.accommodation_available;
      frontendEvent.maxOvernightParticipants = apiEvent.max_overnight_participants || 0;
      frontendEvent.accommodationInfo = apiEvent.accommodation_info || '';
    }

    if (apiEvent.images && apiEvent.images.length > 0) {
      frontendEvent.images = apiEvent.images;
    } else {
      frontendEvent.images = [];
    }

    // Public visibility flag
    if (apiEvent.is_public !== undefined) {
      frontendEvent.is_public = !!apiEvent.is_public;
    }

    // Dodaj dane organizatora jeśli dostępne
    if (apiEvent.organizer) {
      frontendEvent.organizerName = `${apiEvent.organizer.first_name} ${apiEvent.organizer.last_name}`;
      frontendEvent.organizerEmail = apiEvent.organizer.email;
    }

    // Liczba uczestników
    if (apiEvent.participants_count !== undefined) {
      frontendEvent.participantsCount = apiEvent.participants_count;
    }

    return frontendEvent;
  }

  // ==================== User Conversion ====================

  /**
   * Konwertuje użytkownika z formatu frontendowego do API
   * @param {Object} frontendUser - Użytkownik z localStorage (camelCase)
   * @returns {Object} Użytkownik dla API (snake_case)
   */
  static userToApi(frontendUser) {
    const apiUser = {
      email: frontendUser.email,
      first_name: frontendUser.first_name || frontendUser.firstName,
      last_name: frontendUser.last_name || frontendUser.lastName
    };

    // Opcjonalne pola
    if (frontendUser.password) {
      apiUser.password = frontendUser.password;
    }

    if (frontendUser.phone) {
      apiUser.phone = frontendUser.phone;
    }

    if (frontendUser.birth_date || frontendUser.birthDate) {
      apiUser.birth_date = frontendUser.birth_date || frontendUser.birthDate;
    }

    if (frontendUser.city) {
      apiUser.city = frontendUser.city;
    }

    if (frontendUser.dietary_preferences || frontendUser.dietaryPreferences) {
      apiUser.dietary_preferences = frontendUser.dietary_preferences || frontendUser.dietaryPreferences;
    }

    if (frontendUser.blik || frontendUser.blik_number) {
      apiUser.blik_number = frontendUser.blik || frontendUser.blik_number;
    }

    if (frontendUser.profile_image || frontendUser.profileImage) {
      apiUser.profile_image = frontendUser.profile_image || frontendUser.profileImage;
    }

    return apiUser;
  }

  /**
   * Konwertuje użytkownika z API do formatu frontendowego
   * @param {Object} apiUser - Użytkownik z backendu (snake_case)
   * @returns {Object} Użytkownik dla frontendu (camelCase)
   */
  static userFromApi(apiUser) {
    const frontendUser = {
      id: apiUser.id,
      email: apiUser.email,
      first_name: apiUser.first_name,
      last_name: apiUser.last_name,
      createdAt: apiUser.created_at
    };

    // Opcjonalne pola
    if (apiUser.phone) {
      frontendUser.phone = apiUser.phone;
    }

    if (apiUser.birth_date) {
      frontendUser.birthDate = apiUser.birth_date;
    }

    if (apiUser.city) {
      frontendUser.city = apiUser.city;
    }

    if (apiUser.dietary_preferences) {
      frontendUser.dietaryPreferences = apiUser.dietary_preferences;
    }

    if (apiUser.blik_number) {
      frontendUser.blik = apiUser.blik_number;
    }

    if (apiUser.profile_image) {
      frontendUser.profileImage = apiUser.profile_image;
    }

    return frontendUser;
  }

  // ==================== Participant Conversion ====================

  /**
   * Konwertuje uczestnika z API do formatu frontendowego
   * @param {Object} apiParticipant - Uczestnik z backendu
   * @returns {Object} Uczestnik dla frontendu
   */
  static participantFromApi(apiParticipant) {
    return {
      id: apiParticipant.id,
      eventId: apiParticipant.event_id,
      userId: apiParticipant.user_id,
      status: apiParticipant.status,
      joinedAt: apiParticipant.joined_at,
      // Dane użytkownika jeśli dołączone
      user: apiParticipant.user ? this.userFromApi(apiParticipant.user) : null
    };
  }

  // ==================== Notification Conversion ====================

  /**
   * Konwertuje powiadomienie z API do formatu frontendowego
   * @param {Object} apiNotification - Powiadomienie z backendu
   * @returns {Object} Powiadomienie dla frontendu
   */
  static notificationFromApi(apiNotification) {
    return {
      id: apiNotification.id,
      userId: apiNotification.user_id,
      eventId: apiNotification.event_id,
      type: apiNotification.type,
      title: apiNotification.title,
      message: apiNotification.message,
      isRead: apiNotification.is_read,
      createdAt: apiNotification.created_at,
      // Dane wydarzenia jeśli dołączone
      event: apiNotification.event ? this.eventFromApi(apiNotification.event) : null
    };
  }

  // ==================== Date Utilities ====================

  /**
   * Formatuje datę dla API (ISO 8601)
   * @param {string|Date} date - Data z frontendu
   * @returns {string} Data w formacie ISO
   */
  static formatDateForApi(date) {
    if (!date) return null;
    
    // Jeśli to już string w formacie ISO
    if (typeof date === 'string' && date.includes('T')) {
      return new Date(date).toISOString();
    }
    
    // Jeśli to datetime-local format (YYYY-MM-DDTHH:mm)
    if (typeof date === 'string' && date.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/)) {
      return new Date(date).toISOString();
    }

    // Jeśli to obiekt Date
    if (date instanceof Date) {
      return date.toISOString();
    }

    // Fallback - spróbuj sparsować
    return new Date(date).toISOString();
  }

  /**
   * Formatuje datę z API dla frontendu
   * @param {string} isoDate - Data ISO z backendu
   * @returns {string} Data w formacie datetime-local (YYYY-MM-DDTHH:mm)
   */
  static formatDateFromApi(isoDate) {
    if (!isoDate) return null;
    
    const date = new Date(isoDate);
    
    // Format dla <input type="datetime-local">
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }

  /**
   * Formatuje datę dla wyświetlania użytkownikowi
   * @param {string} dateString - Data ISO lub datetime-local
   * @returns {string} Sformatowana data (DD.MM.YYYY HH:mm)
   */
  static formatDateForDisplay(dateString) {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    return `${day}.${month}.${year} ${hours}:${minutes}`;
  }

  // ==================== Validation ====================

  /**
   * Sprawdza czy wydarzenie ma wszystkie wymagane pola dla API
   * @param {Object} event - Wydarzenie do walidacji
   * @returns {Object} { valid: boolean, errors: string[] }
   */
  static validateEventForApi(event) {
    const errors = [];

    if (!event.title || event.title.trim().length === 0) {
      errors.push('Tytuł wydarzenia jest wymagany');
    }

    if (!event.startDate) {
      errors.push('Data rozpoczęcia jest wymagana');
    }

    if (!event.location || event.location.trim().length === 0) {
      errors.push('Lokalizacja jest wymagana');
    }

    if (!event.maxParticipants || event.maxParticipants < 1) {
      errors.push('Liczba uczestników musi być większa od 0');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Sprawdza czy użytkownik ma wszystkie wymagane pola dla API
   * @param {Object} user - Użytkownik do walidacji
   * @returns {Object} { valid: boolean, errors: string[] }
   */
  static validateUserForApi(user) {
    const errors = [];

    if (!user.email || !user.email.includes('@')) {
      errors.push('Poprawny email jest wymagany');
    }

    if (!user.first_name || user.first_name.trim().length === 0) {
      errors.push('Imię jest wymagane');
    }

    if (!user.last_name || user.last_name.trim().length === 0) {
      errors.push('Nazwisko jest wymagane');
    }

    if (user.password && user.password.length < 6) {
      errors.push('Hasło musi mieć minimum 6 znaków');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}

// Export dla użycia globalnego
if (typeof window !== 'undefined') {
  window.DataAdapter = DataAdapter;
  console.log('✅ Data Adapter initialized');
}
