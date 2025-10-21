// Fete Lite - Logika wydarzeń
// Funkcje do tworzenia, edycji i zarządzania wydarzeniami

// Fallback for i18n function if not loaded yet
if (typeof window.t === 'undefined') {
  window.t = function(key, replacements) {
    // Detect language preference (fallback to Polish)
    const lang = navigator.language.startsWith('en') ? 'en' : 'pl';
    
    // Multilingual fallbacks
    const fallbacks = {
      'loading.events': {
        pl: 'Ładowanie wydarzeń...',
        en: 'Loading events...'
      },
      'validation.titleRequired': {
        pl: 'Tytuł jest wymagany',
        en: 'Title is required'
      },
      'validation.titleTooLong': {
        pl: 'Tytuł jest za długi',
        en: 'Title is too long'
      },
      'validation.startDateRequired': {
        pl: 'Data rozpoczęcia jest wymagana',
        en: 'Start date is required'
      },
      'home.noEvents': {
        pl: 'Brak wydarzeń',
        en: 'No events'
      },
      'home.noEventsDesc': {
        pl: 'Utwórz swoje pierwsze wydarzenie!',
        en: 'Create your first event!'
      },
      'validation.locationRequired': {
        pl: 'Lokalizacja jest wymagana',
        en: 'Location is required'
      },
      'validation.descriptionTooLong': {
        pl: 'Opis jest za długi',
        en: 'Description is too long'
      },
      'error.loadEvents': {
        pl: 'Błąd ładowania wydarzeń',
        en: 'Error loading events'
      },
      'success.eventCreated': {
        pl: 'Wydarzenie utworzone pomyślnie',
        en: 'Event created successfully'
      },
      'success.eventUpdated': {
        pl: 'Wydarzenie zaktualizowane',
        en: 'Event updated'
      },
      'success.eventDeleted': {
        pl: 'Wydarzenie usunięte',
        en: 'Event deleted'
      },
      'error.tryAgain': {
        pl: 'Spróbuj ponownie',
        en: 'Try again'
      }
    };
    
    const translation = fallbacks[key];
    if (translation && translation[lang]) {
      return translation[lang];
    }
    
    // Return the key if no translation found
    return key;
  };
}

class EventManager {
  constructor() {
    this.currentFilter = 'all';
    this.currentSort = 'date-asc';
    this.searchQuery = '';
    this.themeFilter = 'all';
    
    // Binduj kontekst metod
    this.handleEventSaved = this.handleEventSaved.bind(this);
    this.handleEventDeleted = this.handleEventDeleted.bind(this);
    
    // Nasłuchuj na zmiany w storage
    document.addEventListener('eventSaved', this.handleEventSaved);
    document.addEventListener('eventDeleted', this.handleEventDeleted);
  }

  // === TWORZENIE WYDARZENIA ===

  // Utwórz wydarzenie z danych formularza
  createEventFromForm(formData) {
    const event = {
      id: null, // Zostanie wygenerowane w storage
      title: formData.get('title')?.trim() || '',
      description: formData.get('description')?.trim() || '',
      location: formData.get('location')?.trim() || '',
      startDate: formData.get('startDate') || '',
      startTime: formData.get('startTime') || '',
      endDate: formData.get('endDate') || '',
      endTime: formData.get('endTime') || '',
      
      // Nowe pola - wymagania i preferencje
      foodRequirements: formData.get('foodRequirements')?.trim() || '',
      alcoholPolicy: formData.get('alcoholPolicy') || 'provided',
      drinksProvided: formData.get('drinksProvided') === 'on',
      
      // Informacje finansowe
      entryFee: parseFloat(formData.get('entryFee')) || 0,
      organizerBlik: formData.get('organizerBlik')?.trim() || '',
      
      // Uczestnicy i dress code
      maxParticipants: parseInt(formData.get('maxParticipants')) || null,
      dressCode: this.getDressCodeFromForm(formData),
      
      // Nocleg
      accommodationAvailable: formData.get('accommodationAvailable') === 'on',
      accommodationInfo: formData.get('accommodationInfo')?.trim() || '',
      
      // Tematyka wydarzenia (pojedynczy wybór)
      eventTheme: formData.get('eventTheme') || 'other',
      
      // Zdjęcia (będą dodane osobno)
      images: [],
      
      // Kod zaproszenia (8-znakowy)
      invitationCode: this.generateInvitationCode(),
      
      // Metadane
      coordinates: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Pobierz współrzędne jeśli są zapisane
    const coordinatesData = sessionStorage.getItem('currentEventCoordinates');
    if (coordinatesData) {
      try {
        event.coordinates = JSON.parse(coordinatesData);
        sessionStorage.removeItem('currentEventCoordinates');
      } catch (e) {
        console.warn('[Events] Błąd parsowania współrzędnych:', e);
      }
    }

    return event;
  }

  // Generuj 8-znakowy kod zaproszenia
  generateInvitationCode() {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    
    // Generuj kod dopóki nie będzie unikalny
    do {
      code = '';
      for (let i = 0; i < 8; i++) {
        code += characters.charAt(Math.floor(Math.random() * characters.length));
      }
    } while (this.isInvitationCodeExists(code));
    
    return code;
  }

  // Sprawdź czy kod zaproszenia już istnieje
  isInvitationCodeExists(code) {
    const events = window.storageManager?.getEvents() || [];
    return events.some(event => event.invitationCode === code);
  }

  // Pobierz dress code z formularza (obsługa opcji i własnego tekstu)
  getDressCodeFromForm(formData) {
    const dressCodeType = formData.get('dressCodeType');
    
    if (dressCodeType === 'custom') {
      return formData.get('customDressCode')?.trim() || '';
    } else if (dressCodeType === 'none') {
      return '';
    } else {
      return dressCodeType || '';
    }
  }

  // Waliduj dane wydarzenia
  validateEvent(eventData) {
    const errors = [];

    // Walidacja tytułu
    if (!eventData.title) {
      errors.push({
        field: 'title',
        message: t('validation.titleRequired')
      });
    } else if (eventData.title.length > 100) {
      errors.push({
        field: 'title',
        message: t('validation.titleTooLong')
      });
    }

    // Walidacja daty rozpoczęcia
    if (!eventData.startDate) {
      errors.push({
        field: 'startDate',
        message: t('validation.startDateRequired')
      });
    }

    // Walidacja czasu rozpoczęcia
    if (!eventData.startTime) {
      errors.push({
        field: 'startTime',
        message: t('validation.startTimeRequired')
      });
    }

    // Sprawdź czy data nie jest w przeszłości
    if (eventData.startDate && eventData.startTime) {
      const startDateTime = new Date(`${eventData.startDate}T${eventData.startTime}`);
      const now = new Date();
      
      if (startDateTime < now) {
        errors.push({
          field: 'startDate',
          message: t('validation.pastDate')
        });
      }
    }

    // Sprawdź czy data zakończenia nie jest wcześniejsza niż rozpoczęcia
    if (eventData.startDate && eventData.startTime && eventData.endDate && eventData.endTime) {
      const startDateTime = new Date(`${eventData.startDate}T${eventData.startTime}`);
      const endDateTime = new Date(`${eventData.endDate}T${eventData.endTime}`);
      
      if (endDateTime < startDateTime) {
        errors.push({
          field: 'endDate',
          message: t('validation.endBeforeStart')
        });
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Wyświetl błędy walidacji
  displayValidationErrors(errors) {
    // Najpierw wyczyść wszystkie błędy
    document.querySelectorAll('.form-error').forEach(errorDiv => {
      errorDiv.style.display = 'none';
      errorDiv.textContent = '';
    });

    // Usuń klasy błędów z pól
    document.querySelectorAll('.form-input, .form-textarea').forEach(input => {
      input.classList.remove('error');
    });

    // Wyświetl nowe błędy
    errors.forEach(error => {
      const field = document.querySelector(`[name="${error.field}"]`);
      const errorDiv = document.getElementById(`${error.field}-error`);
      
      if (field) {
        field.classList.add('error');
      }
      
      if (errorDiv) {
        errorDiv.textContent = error.message;
        errorDiv.style.display = 'block';
      }
    });

    // Przeskroluj do pierwszego błędu
    if (errors.length > 0) {
      const firstErrorField = document.querySelector(`[name="${errors[0].field}"]`);
      if (firstErrorField) {
        firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
        firstErrorField.focus();
      }
    }
  }

  // === WYŚWIETLANIE WYDARZEŃ ===

  // Załaduj i wyświetl wszystkie wydarzenia
  async loadAndDisplayEvents() {
    try {
      showLoadingState('events-container');
      
      let events = window.storageManager.getAllEvents();
      
      // Zastosuj filtr czasu (all/upcoming/past)
      events = this.applyFilter(events, this.currentFilter);
      
      // Zastosuj filtr tematu
      if (this.themeFilter && this.themeFilter !== 'all') {
        events = events.filter(event => event.eventTheme === this.themeFilter);
      }
      
      // Zastosuj wyszukiwanie
      if (this.searchQuery) {
        events = this.applySearch(events, this.searchQuery);
      }
      
      // Posortuj
      events = this.applySorting(events, this.currentSort);
      
      // Wyświetl
      this.displayEvents(events);
      
      hideLoadingState('events-container');
      
    } catch (error) {
      console.error('[Events] Błąd ładowania wydarzeń:', error);
      showErrorState('events-container', t('error.loadError'));
    }
  }

  // Wyświetl listę wydarzeń
  displayEvents(events) {
    const container = document.getElementById('events-container');
    const noEventsDiv = document.getElementById('no-events');
    
    if (!container) return;

    if (events.length === 0) {
      container.style.display = 'none';
      if (noEventsDiv) noEventsDiv.style.display = 'block';
      return;
    }

    container.style.display = 'grid';
    if (noEventsDiv) noEventsDiv.style.display = 'none';
    
    container.innerHTML = '';
    
    events.forEach(event => {
      const eventCard = this.createEventCard(event);
      container.appendChild(eventCard);
    });
  }

  // Utwórz kartę wydarzenia
  createEventCard(event) {
    const template = document.getElementById('event-card-template');
    if (!template) {
      console.error('[Events] Brak template karty wydarzenia');
      return document.createElement('div');
    }

    const card = template.content.cloneNode(true);
    const cardElement = card.querySelector('.event-card');
    
    // Ustaw ID wydarzenia
    cardElement.setAttribute('data-event-id', event.id);
    
    // Data
    const startDate = new Date(event.startDate);
    const dayElement = card.querySelector('.event-day');
    const monthElement = card.querySelector('.event-month');
    const countdownElement = card.querySelector('.event-countdown');
    
    if (dayElement) dayElement.textContent = startDate.getDate();
    if (monthElement) {
      const monthKey = `month.${startDate.toLocaleDateString('en', { month: 'short' }).toLowerCase()}`;
      monthElement.textContent = t(monthKey);
    }
    
    // Licznik dni do wydarzenia
    if (countdownElement) {
      const daysUntil = this.calculateDaysUntil(startDate);
      if (daysUntil !== null) {
        countdownElement.textContent = daysUntil;
        countdownElement.className = 'event-countdown visible';
      }
    }
    
    // Tytuł
    const titleElement = card.querySelector('.event-title');
    if (titleElement) titleElement.textContent = event.title;
    
    // Czas
    const timeElement = card.querySelector('.event-time-text');
    if (timeElement) {
      timeElement.textContent = this.formatEventTime(event);
    }
    
    // Lokalizacja
    const locationElement = card.querySelector('.event-location-text');
    const locationContainer = card.querySelector('.event-location');
    if (event.location && locationElement) {
      locationElement.textContent = event.location;
      if (locationContainer) locationContainer.style.display = 'flex';
    } else {
      if (locationContainer) locationContainer.style.display = 'none';
    }
    
    // Opis (skrócony)
    const descriptionElement = card.querySelector('.event-description');
    if (descriptionElement && event.description) {
      descriptionElement.textContent = event.description;
      descriptionElement.style.display = 'block';
      
      // Dodaj obsługę rozwijania opisu
      descriptionElement.addEventListener('click', (e) => {
        e.stopPropagation(); // Zapobiegnij przejściu do szczegółów
        descriptionElement.classList.toggle('expanded');
      });
    } else if (descriptionElement) {
      descriptionElement.style.display = 'none';
    }
    
    // Tematyka wydarzenia
    const tagsContainer = card.querySelector('.event-tags');
    if (tagsContainer && event.eventTheme) {
      this.displayEventTheme(tagsContainer, event.eventTheme);
    }
    
    // Event listeners
    const detailsBtn = card.querySelector('.event-details-btn');
    if (detailsBtn) {
      detailsBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.navigateToEventDetails(event.id);
      });
    }
    
    const shareBtn = card.querySelector('.share-btn');
    if (shareBtn) {
      shareBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.shareEvent(event);
      });
    }
    
    // Kliknięcie w całą kartę
    cardElement.addEventListener('click', () => {
      this.navigateToEventDetails(event.id);
    });
    
    // Dodaj animację
    cardElement.classList.add('fade-in');
    
    return cardElement;
  }

  // Wyświetl tematykę wydarzenia
  displayEventTheme(container, theme) {
    // Pobierz konfigurację z centralnego źródła
    const themeConfig = window.EventThemes ? window.EventThemes.getThemeConfig() : {
      birthday: { icon: '�', label: t('theme.birthday') },
      bbq: { icon: '🔥', label: t('theme.bbq') },
      boardgames: { icon: '�', label: t('theme.boardgames') },
      bar: { icon: '�', label: t('theme.bar') },
      integration: { icon: '🤝', label: t('theme.integration') },
      karaoke: { icon: '�', label: t('theme.karaoke') },
      cinema: { icon: '🎬', label: t('theme.cinema') },
      museum: { icon: '🖼️', label: t('theme.museum') },
      theater: { icon: '🎭', label: t('theme.theater') },
      minigolf: { icon: '⛳', label: t('theme.minigolf') },
      concert: { icon: '🎵', label: t('theme.concert') },
      sport: { icon: '⚽', label: t('theme.sport') },
      picnic: { icon: '🧺', label: t('theme.picnic') },
      party: { icon: '🎉', label: t('theme.party') },
      dance: { icon: '💃', label: t('theme.dance') },
      other: { icon: '📅', label: t('theme.other') }
    };

    container.innerHTML = '';
    
    const config = themeConfig[theme] || themeConfig.other;
    const tag = document.createElement('div');
    tag.className = 'event-tag event-tag-theme';
    tag.innerHTML = `
      <span class="tag-icon">${config.icon}</span>
      <span class="tag-label">${config.label}</span>
    `;
    container.appendChild(tag);
  }

  // Formatuj czas wydarzenia
  formatEventTime(event) {
    const startDate = new Date(event.startDate);
    const endDate = event.endDate ? new Date(event.endDate) : null;
    
    const timeOptions = { hour: '2-digit', minute: '2-digit' };
    const startTime = startDate.toLocaleTimeString('pl-PL', timeOptions);
    
    if (endDate) {
      const endTime = endDate.toLocaleTimeString('pl-PL', timeOptions);
      
      // Sprawdź czy to ten sam dzień
      if (startDate.toDateString() === endDate.toDateString()) {
        return `${startTime} - ${endTime}`;
      } else {
        const endDateStr = endDate.toLocaleDateString('pl-PL');
        return `${startTime} - ${endDateStr} ${endTime}`;
      }
    }
    
    return startTime;
  }

  // === FILTROWANIE I SORTOWANIE ===

  // Zastosuj filtr
  applyFilter(events, filter) {
    return window.storageManager.getEventsFiltered(filter);
  }

  // Zastosuj wyszukiwanie
  applySearch(events, query) {
    if (!query) return events;
    
    const searchTerm = query.toLowerCase().trim();
    return events.filter(event => 
      event.title.toLowerCase().includes(searchTerm) ||
      (event.description && event.description.toLowerCase().includes(searchTerm)) ||
      (event.location && event.location.toLowerCase().includes(searchTerm))
    );
  }
  
  // Oblicz ile dni do wydarzenia
  calculateDaysUntil(eventDate) {
    const now = new Date();
    now.setHours(0, 0, 0, 0); // Reset time to start of day
    
    const event = new Date(eventDate);
    event.setHours(0, 0, 0, 0);
    
    const diffTime = event - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    // Only show for upcoming events (1-30 days)
    if (diffDays > 0 && diffDays <= 30) {
      if (diffDays === 1) {
        return 'Jutro';
      } else {
        return `Za ${diffDays} ${diffDays === 1 ? 'dzień' : diffDays < 5 ? 'dni' : 'dni'}`;
      }
    }
    
    return null;
  }

  // Zastosuj sortowanie
  applySorting(events, sort) {
    const eventsCopy = [...events];
    
    switch (sort) {
      case 'date-asc':
        return eventsCopy.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
      case 'date-desc':
        return eventsCopy.sort((a, b) => new Date(b.startDate) - new Date(a.startDate));
      case 'title-asc':
        return eventsCopy.sort((a, b) => a.title.localeCompare(b.title));
      case 'title-desc':
        return eventsCopy.sort((a, b) => b.title.localeCompare(a.title));
      case 'created-desc':
        return eventsCopy.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      default:
        return eventsCopy;
    }
  }

  // Ustaw filtr
  setFilter(filter) {
    this.currentFilter = filter;
    this.loadAndDisplayEvents();
  }

  // Ustaw sortowanie
  setSorting(sort) {
    this.currentSort = sort;
    this.loadAndDisplayEvents();
  }

  // Ustaw wyszukiwanie
  setSearchQuery(query) {
    this.searchQuery = query;
    this.loadAndDisplayEvents();
  }

  // Ustaw filtr tematu
  setThemeFilter(theme) {
    this.themeFilter = theme;
    this.loadAndDisplayEvents();
  }

  // === NAWIGACJA ===

  // Przejdź do szczegółów wydarzenia
  navigateToEventDetails(eventId) {
    window.location.href = `/event-details.html?id=${eventId}`;
  }

  // Przejdź do tworzenia wydarzenia
  navigateToCreateEvent() {
    window.location.href = '/create-event.html';
  }

  // === UDOSTĘPNIANIE ===

  // Udostępnij wydarzenie
  async shareEvent(event) {
    const shareUrl = `${window.location.origin}/event-details.html?id=${event.id}`;
    const shareData = {
      title: event.title,
      text: event.description || t('home.viewDetails'),
      url: shareUrl
    };

    try {
      // Spróbuj użyć Web Share API
      if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData);

        return;
      }
    } catch (error) {

    }

    // Fallback - skopiuj link do schowka
    try {
      await navigator.clipboard.writeText(shareUrl);
      showNotification(t('success.linkCopied'), 'success');
    } catch (error) {
      console.error('[Events] Błąd kopiowania do schowka:', error);
      
      // Ostatni fallback - pokaż modal z linkiem
      this.showShareModal(shareUrl, event);
    }
  }

  // Pokaż modal udostępniania
  showShareModal(shareUrl, event) {
    // Implementacja modal udostępniania
    if (navigator.share && /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
      navigator.share({
        title: event.title,
        text: event.description,
        url: shareUrl
      });
    } else {
      // Fallback - kopiuj do schowka
      navigator.clipboard.writeText(shareUrl).then(() => {
        alert('Link skopiowany do schowka!');
      });
    }
  }

  // === EVENT HANDLERS ===

  // Obsłuż zapisanie wydarzenia
  handleEventSaved(e) {
    const { event } = e.detail;

    
    // Odśwież listę jeśli jesteśmy na stronie głównej
    if (window.location.pathname === '/' || window.location.pathname === '/index.html') {
      this.loadAndDisplayEvents();
    }
  }

  // Obsłuż usunięcie wydarzenia
  handleEventDeleted(e) {
    const { eventId } = e.detail;

    
    // Odśwież listę jeśli jesteśmy na stronie głównej
    if (window.location.pathname === '/' || window.location.pathname === '/index.html') {
      this.loadAndDisplayEvents();
    }
  }

  // === UTILITY ===

  // Sprawdź czy wydarzenie jest dzisiaj
  isEventToday(event) {
    const eventDate = new Date(event.startDate);
    const today = new Date();
    
    return eventDate.toDateString() === today.toDateString();
  }

  // Sprawdź czy wydarzenie jest w przyszłości
  isEventUpcoming(event) {
    const eventDate = new Date(event.startDate);
    const now = new Date();
    
    return eventDate > now;
  }

  // Pobierz czas do wydarzenia
  getTimeUntilEvent(event) {
    const eventDate = new Date(event.startDate);
    const now = new Date();
    const diffMs = eventDate - now;
    
    if (diffMs < 0) return null; // Wydarzenie w przeszłości
    
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    return { days: diffDays, hours: diffHours, minutes: diffMinutes };
  }
}

// Globalna instancja EventManager
window.eventManager = new EventManager();

// Globalne funkcje dla event listenerów
window.shareEvent = (event) => window.eventManager.shareEvent(event);
window.deleteEvent = (eventId) => window.eventManager.deleteEvent(eventId);

// === HELPER FUNCTIONS ===

// Pokaż stan ładowania
function showLoadingState(containerId) {
  const container = document.getElementById(containerId);
  if (container) {
    container.innerHTML = `
      <div class="loading-placeholder">
        <div class="spinner"></div>
        <p>${t('loading.events')}</p>
      </div>
    `;
  }
}

// Ukryj stan ładowania
function hideLoadingState(containerId) {
  const container = document.getElementById(containerId);
  const loadingPlaceholder = container?.querySelector('.loading-placeholder');
  if (loadingPlaceholder) {
    loadingPlaceholder.remove();
  }
}

// Pokaż stan błędu
function showErrorState(containerId, message) {
  const container = document.getElementById(containerId);
  if (container) {
    container.innerHTML = `
      <div class="error-state">
        <div class="error-icon">❌</div>
        <p>${message}</p>
        <button onclick="window.eventManager.loadAndDisplayEvents()" class="btn btn-primary">
          ${t('error.tryAgain')}
        </button>
      </div>
    `;
  }
}

// Pokaż powiadomienie
function showNotification(message, type = 'info', duration = 3000) {
  // Usuń istniejące powiadomienia
  document.querySelectorAll('.notification').forEach(n => n.remove());
  
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.textContent = message;
  
  document.body.appendChild(notification);
  
  // Animacja wejścia
  requestAnimationFrame(() => {
    notification.classList.add('show');
  });
  
  // Automatyczne usunięcie
  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => notification.remove(), 300);
  }, duration);
}


