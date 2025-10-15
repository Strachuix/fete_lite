// Fete Lite - Zarządzanie danymi (localStorage)
// Abstrakcja do zapisu i odczytu danych wydarzeń

class StorageManager {
  constructor() {
    this.storageKey = 'fete-lite-events';
    this.settingsKey = 'fete-lite-settings';
    this.isLocalStorageAvailable = this.checkLocalStorageSupport();
    
    if (!this.isLocalStorageAvailable) {
      console.warn('[Storage] localStorage nie jest dostępne, używam fallback');
      this.fallbackStorage = new Map();
    }
  }

  // Sprawdź dostępność localStorage
  checkLocalStorageSupport() {
    try {
      const testKey = '__localStorage_test__';
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
      return true;
    } catch (e) {
      return false;
    }
  }

  // Generuj unikalny ID dla wydarzenia
  generateEventId() {
    return 'event_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  // Pobierz wszystkie wydarzenia
  getAllEvents() {
    try {
      if (this.isLocalStorageAvailable) {
        const eventsJson = localStorage.getItem(this.storageKey);
        return eventsJson ? JSON.parse(eventsJson) : [];
      } else {
        return Array.from(this.fallbackStorage.values());
      }
    } catch (error) {
      console.error('[Storage] Błąd podczas pobierania wydarzeń:', error);
      return [];
    }
  }

  // Pobierz pojedyncze wydarzenie po ID
  getEvent(id) {
    try {
      if (this.isLocalStorageAvailable) {
        const events = this.getAllEvents();
        return events.find(event => event.id === id) || null;
      } else {
        return this.fallbackStorage.get(id) || null;
      }
    } catch (error) {
      console.error('[Storage] Błąd podczas pobierania wydarzenia:', error);
      return null;
    }
  }

  // Zapisz wydarzenie
  saveEvent(eventData) {
    try {
      // Walidacja danych
      if (!eventData.title || !eventData.startDate) {
        throw new Error('Brak wymaganych danych wydarzenia');
      }

      // Dodaj ID jeśli go nie ma
      if (!eventData.id) {
        eventData.id = this.generateEventId();
      }

      // Dodaj organizatora (aktualnie zalogowany użytkownik)
      if (!eventData.organizerId && window.authManager) {
        const currentUser = window.authManager.getCurrentUser();
        if (currentUser) {
          eventData.organizerId = currentUser.id || currentUser.email;
          eventData.organizerName = `${currentUser.first_name || ''} ${currentUser.last_name || ''}`.trim() || currentUser.email;
        }
      }

      // Dodaj timestamp utworzenia i modyfikacji
      const now = new Date().toISOString();
      if (!eventData.createdAt) {
        eventData.createdAt = now;
      }
      eventData.updatedAt = now;

      // Konwertuj daty na ISO string dla spójności
      if (eventData.startDate && eventData.startTime) {
        eventData.startDate = this.combineDateAndTime(eventData.startDate, eventData.startTime);
      }
      if (eventData.endDate && eventData.endTime) {
        eventData.endDate = this.combineDateAndTime(eventData.endDate, eventData.endTime);
      }

      if (this.isLocalStorageAvailable) {
        const events = this.getAllEvents();
        const existingIndex = events.findIndex(event => event.id === eventData.id);
        
        if (existingIndex >= 0) {
          events[existingIndex] = eventData;
        } else {
          events.push(eventData);
        }
        
        localStorage.setItem(this.storageKey, JSON.stringify(events));
      } else {
        this.fallbackStorage.set(eventData.id, eventData);
      }


      
      // Wyślij event o zapisaniu
      document.dispatchEvent(new CustomEvent('eventSaved', {
        detail: { event: eventData }
      }));

      return eventData;
    } catch (error) {
      console.error('[Storage] Błąd podczas zapisywania wydarzenia:', error);
      throw error;
    }
  }

  // Usuń wydarzenie
  deleteEvent(id) {
    try {
      if (this.isLocalStorageAvailable) {
        const events = this.getAllEvents();
        const filteredEvents = events.filter(event => event.id !== id);
        
        if (events.length === filteredEvents.length) {
          throw new Error('Wydarzenie nie zostało znalezione');
        }
        
        localStorage.setItem(this.storageKey, JSON.stringify(filteredEvents));
      } else {
        if (!this.fallbackStorage.has(id)) {
          throw new Error('Wydarzenie nie zostało znalezione');
        }
        this.fallbackStorage.delete(id);
      }


      
      // Wyślij event o usunięciu
      document.dispatchEvent(new CustomEvent('eventDeleted', {
        detail: { eventId: id }
      }));

      return true;
    } catch (error) {
      console.error('[Storage] Błąd podczas usuwania wydarzenia:', error);
      throw error;
    }
  }

  // Pobierz wydarzenia z filtrem
  getEventsFiltered(filter = 'all') {
    const events = this.getAllEvents();
    const now = new Date();

    switch (filter) {
      case 'upcoming':
        return events.filter(event => new Date(event.startDate) >= now);
      case 'past':
        return events.filter(event => new Date(event.startDate) < now);
      case 'today':
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        return events.filter(event => {
          const eventDate = new Date(event.startDate);
          return eventDate >= today && eventDate < tomorrow;
        });
      default:
        return events;
    }
  }

  // Posortuj wydarzenia według daty
  sortEventsByDate(events, ascending = true) {
    return events.sort((a, b) => {
      const dateA = new Date(a.startDate);
      const dateB = new Date(b.startDate);
      return ascending ? dateA - dateB : dateB - dateA;
    });
  }

  // Wyszukaj wydarzenia
  searchEvents(query) {
    const events = this.getAllEvents();
    const searchTerm = query.toLowerCase().trim();
    
    if (!searchTerm) return events;

    return events.filter(event => 
      event.title.toLowerCase().includes(searchTerm) ||
      (event.description && event.description.toLowerCase().includes(searchTerm)) ||
      (event.location && event.location.toLowerCase().includes(searchTerm))
    );
  }

  // Pomocnicza funkcja do łączenia daty i czasu
  combineDateAndTime(date, time) {
    if (!date || !time) return date;
    
    // Jeśli to już jest pełna data ISO, zwróć bez zmian
    if (date.includes('T')) return date;
    
    return `${date}T${time}:00`;
  }

  // Rozdziel datę i czas
  splitDateTime(dateTimeString) {
    if (!dateTimeString) return { date: '', time: '' };
    
    const dateTime = new Date(dateTimeString);
    
    return {
      date: dateTime.toISOString().split('T')[0],
      time: dateTime.toTimeString().slice(0, 5)
    };
  }

  // === USTAWIENIA APLIKACJI ===

  // Pobierz wszystkie ustawienia
  getSettings() {
    try {
      if (this.isLocalStorageAvailable) {
        const settingsJson = localStorage.getItem(this.settingsKey);
        return settingsJson ? JSON.parse(settingsJson) : this.getDefaultSettings();
      } else {
        return this.getDefaultSettings();
      }
    } catch (error) {
      console.error('[Storage] Błąd podczas pobierania ustawień:', error);
      return this.getDefaultSettings();
    }
  }

  // Domyślne ustawienia
  getDefaultSettings() {
    return {
      theme: 'auto', // 'light', 'dark', 'auto'
      language: 'pl',
      notifications: false,
      notificationTime: 60, // minuty przed wydarzeniem
      autoLocation: false,
      defaultEventDuration: 120 // minuty
    };
  }

  // Zapisz ustawienia
  saveSettings(settings) {
    try {
      const currentSettings = this.getSettings();
      const updatedSettings = { ...currentSettings, ...settings };

      if (this.isLocalStorageAvailable) {
        localStorage.setItem(this.settingsKey, JSON.stringify(updatedSettings));
      }


      
      // Wyślij event o zmianie ustawień
      document.dispatchEvent(new CustomEvent('settingsChanged', {
        detail: { settings: updatedSettings }
      }));

      return updatedSettings;
    } catch (error) {
      console.error('[Storage] Błąd podczas zapisywania ustawień:', error);
      throw error;
    }
  }

  // Pobierz konkretne ustawienie
  getSetting(key) {
    const settings = this.getSettings();
    return settings[key];
  }

  // Zapisz konkretne ustawienie
  setSetting(key, value) {
    const settings = this.getSettings();
    settings[key] = value;
    return this.saveSettings(settings);
  }

  // === STATYSTYKI ===

  // Pobierz statystyki wydarzeń
  getEventStats() {
    const events = this.getAllEvents();
    const now = new Date();

    return {
      total: events.length,
      upcoming: events.filter(event => new Date(event.startDate) >= now).length,
      past: events.filter(event => new Date(event.startDate) < now).length,
      thisMonth: events.filter(event => {
        const eventDate = new Date(event.startDate);
        return eventDate.getMonth() === now.getMonth() && 
               eventDate.getFullYear() === now.getFullYear();
      }).length
    };
  }

  // === EKSPORT/IMPORT ===

  // Eksportuj wszystkie dane do JSON
  exportData() {
    return {
      events: this.getAllEvents(),
      settings: this.getSettings(),
      exportDate: new Date().toISOString(),
      version: '1.0.0'
    };
  }

  // Importuj dane z JSON
  importData(data) {
    try {
      if (!data || !data.events) {
        throw new Error('Nieprawidłowy format danych');
      }

      // Waliduj i importuj wydarzenia
      const validEvents = data.events.filter(event => 
        event.id && event.title && event.startDate
      );

      if (this.isLocalStorageAvailable) {
        localStorage.setItem(this.storageKey, JSON.stringify(validEvents));
        
        if (data.settings) {
          localStorage.setItem(this.settingsKey, JSON.stringify(data.settings));
        }
      } else {
        this.fallbackStorage.clear();
        validEvents.forEach(event => {
          this.fallbackStorage.set(event.id, event);
        });
      }


      
      // Wyślij event o imporcie
      document.dispatchEvent(new CustomEvent('dataImported', {
        detail: { eventsCount: validEvents.length }
      }));

      return validEvents.length;
    } catch (error) {
      console.error('[Storage] Błąd podczas importu danych:', error);
      throw error;
    }
  }

  // Wyczyść wszystkie dane
  clearAllData() {
    try {
      if (this.isLocalStorageAvailable) {
        localStorage.removeItem(this.storageKey);
        localStorage.removeItem(this.settingsKey);
      } else {
        this.fallbackStorage.clear();
      }


      
      // Wyślij event o wyczyszczeniu
      document.dispatchEvent(new CustomEvent('dataCleared'));

      return true;
    } catch (error) {
      console.error('[Storage] Błąd podczas czyszczenia danych:', error);
      throw error;
    }
  }

  // Pobierz rozmiar użytego storage
  getStorageSize() {
    if (!this.isLocalStorageAvailable) {
      return { used: 0, available: 0 };
    }

    try {
      let used = 0;
      for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          used += localStorage[key].length + key.length;
        }
      }

      // Szacunkowa dostępna przestrzeń (5MB - typowy limit)
      const available = 5 * 1024 * 1024 - used;

      return {
        used: used,
        available: Math.max(0, available),
        usedFormatted: this.formatBytes(used),
        availableFormatted: this.formatBytes(available)
      };
    } catch (error) {
      console.error('[Storage] Błąd podczas sprawdzania rozmiaru:', error);
      return { used: 0, available: 0 };
    }
  }

  // Formatuj bajty na czytelny format
  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // Sprawdź czy użytkownik jest organizatorem wydarzenia
  isUserOrganizer(eventId) {
    if (!window.authManager || !window.authManager.isUserLoggedIn()) {
      return false;
    }

    const event = this.getEvent(eventId);
    if (!event || !event.organizerId) {
      return false;
    }

    const currentUser = window.authManager.getCurrentUser();
    if (!currentUser) {
      return false;
    }

    const currentUserId = currentUser.id || currentUser.email;
    return event.organizerId === currentUserId;
  }

  // Pobierz wydarzenia utworzone przez użytkownika
  getUserEvents(userId) {
    const allEvents = this.getAllEvents();
    return allEvents.filter(event => event.organizerId === userId);
  }
}

// Globalna instancja StorageManager
window.storageManager = new StorageManager();

// Funkcje pomocnicze dla wstecznej kompatybilności
window.saveEvent = (eventData) => window.storageManager.saveEvent(eventData);
window.getEvent = (id) => window.storageManager.getEvent(id);
window.getAllEvents = () => window.storageManager.getAllEvents();
window.deleteEvent = (id) => window.storageManager.deleteEvent(id);
window.getEventsFiltered = (filter) => window.storageManager.getEventsFiltered(filter);


