// Fete Lite - Główny plik aplikacji
// Inicjalizacja PWA, service worker i podstawowej funkcjonalności

class FeteLiteApp {
  constructor() {
    this.isOnline = navigator.onLine;
    this.isInstalled = false;
    this.deferredPrompt = null;
    
    this.init();
  }

  // Inicjalizacja aplikacji
  async init() {

    
    try {
      // Rejestruj Service Worker
      await this.registerServiceWorker();
      
      // Inicjalizuj komponenty
      this.initializeComponents();
      
      // Skonfiguruj event listenery
      this.setupEventListeners();
      
      // Sprawdź stan instalacji PWA
      this.checkInstallationStatus();
      
      // Załaduj dane początkowe
      await this.loadInitialData();
      

      
    } catch (error) {
      console.error('[App] Błąd inicjalizacji:', error);
      this.handleInitializationError(error);
    }
  }

  // Rejestruj Service Worker
  async registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      try {

        const registration = await navigator.serviceWorker.register('./service-worker.js', {
          scope: './'
        });
        

        
        // Nasłuchuj na aktualizacje
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          console.log('[SW] 🔄 Nowa wersja Service Workera dostępna');
          
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'activated') {
              console.log('[SW] ✓ Nowy Service Worker aktywny');
            }
          });
        });
        
        // Sprawdź czy jest aktywny
        if (registration.active) {
          console.log('[SW] ✓ Service Worker jest aktywny');
        }
        
        // Nasłuchuj na komunikaty od SW
        navigator.serviceWorker.addEventListener('message', this.handleServiceWorkerMessage.bind(this));
        
        // Nasłuchuj na błędy SW
        navigator.serviceWorker.addEventListener('error', (event) => {
          console.error('[SW] ✗ Service Worker error:', event);
        });
        
        return registration;
        
      } catch (error) {
        console.error('[SW] ✗ Błąd rejestracji Service Workera:', error);
        
        // Spróbuj odzyskać przez wyrejestrowanie i ponowną rejestrację
        try {
          const registrations = await navigator.serviceWorker.getRegistrations();
          for (const reg of registrations) {
            await reg.unregister();
            console.log('[SW] 🗑️ Wyrejestrowano stary Service Worker');
          }
          
          // Poczekaj chwilę i spróbuj ponownie
          setTimeout(() => {
            this.registerServiceWorker();
          }, 2000);
          
        } catch (recoveryError) {
          console.error('[SW] ✗ Nie można odzyskać Service Workera:', recoveryError);
        }
      }
    } else {
      console.warn('[SW] ⚠️ Service Worker nie jest obsługiwany w tej przeglądarce');
    }
  }

  // Inicjalizuj komponenty aplikacji
  initializeComponents() {
    // Komponenty są już zainicjalizowane przez ich odpowiednie pliki JS
    // Tutaj możemy wykonać dodatkową konfigurację
    

  }

  // Skonfiguruj event listenery
  setupEventListeners() {
    // Online/offline events
    window.addEventListener('online', this.handleOnline.bind(this));
    window.addEventListener('offline', this.handleOffline.bind(this));
    
    // PWA installation
    window.addEventListener('beforeinstallprompt', this.handleInstallPrompt.bind(this));
    window.addEventListener('appinstalled', this.handleAppInstalled.bind(this));
    
    // Navigation
    this.setupNavigation();
    
    // Form submissions
    this.setupFormHandlers();
    
    // Modal management
    this.setupModalHandlers();
    
    // Keyboard shortcuts
    this.setupKeyboardShortcuts();
    

  }

  // Skonfiguruj nawigację
  setupNavigation() {
    // Bottom navigation
    document.querySelectorAll('.nav-item, .nav-button').forEach(navItem => {
      if (navItem.tagName === 'A') {
        navItem.addEventListener('click', (e) => {
          // Dodaj active class
          document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
          });
          navItem.classList.add('active');
        });
      }
    });
    
    // Back buttons - obsługiwane przez HeaderManager

  }

  // Konfiguracja formularzy
  setupFormHandlers() {
    // Create event form
    const createEventForm = document.getElementById('create-event-form');
    if (createEventForm) {
      createEventForm.addEventListener('submit', this.handleCreateEventSubmit.bind(this));
      
      // Obsługa nowych pól formularza
      this.setupEnhancedFormFields();
    }
    
    // Search forms
    document.querySelectorAll('.search-form').forEach(form => {
      form.addEventListener('submit', this.handleSearchSubmit.bind(this));
    });
    
    // Filter forms
    const eventsFilter = document.getElementById('events-filter');
    if (eventsFilter) {
      eventsFilter.addEventListener('change', (e) => {
        window.eventManager.setFilter(e.target.value);
      });
    }
    
    // Theme filter
    const themeFilter = document.getElementById('theme-filter');
    if (themeFilter) {
      // Populate theme filter with available themes
      this.populateThemeFilter(themeFilter);
      
      themeFilter.addEventListener('change', (e) => {
        window.eventManager.setThemeFilter(e.target.value);
      });
    }
    
    // Sort dropdown
    const sortEvents = document.getElementById('sort-events');
    if (sortEvents) {
      sortEvents.addEventListener('change', (e) => {
        window.eventManager.setSorting(e.target.value);
      });
    }
    
    // Search input
    const searchInput = document.getElementById('event-search');
    if (searchInput) {
      // Debounce search to avoid too many calls
      let searchTimeout;
      searchInput.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
          window.eventManager.setSearchQuery(e.target.value.trim());
        }, 300); // Wait 300ms after user stops typing
      });
      
      // Clear search on ESC key
      searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          searchInput.value = '';
          window.eventManager.setSearchQuery('');
        }
      });
    }
  }
  
  // Populate theme filter dropdown with themes from event-themes.js
  populateThemeFilter(selectElement) {
    if (!window.EventThemes || !window.EventThemes.EVENT_THEMES) {
      console.warn('[Main] Event themes not loaded');
      return;
    }
    
    // Clear existing options except the "All themes" option
    while (selectElement.options.length > 1) {
      selectElement.remove(1);
    }
    
    // Add theme options
    window.EventThemes.EVENT_THEMES.forEach(theme => {
      const option = document.createElement('option');
      option.value = theme.id;
      option.setAttribute('data-i18n', `theme.${theme.id}`);
      option.textContent = theme.name;
      selectElement.appendChild(option);
    });
    
    // Apply translations if i18n is loaded
    if (window.i18n && window.i18n.translatePage) {
      window.i18n.translatePage();
    }
  }

  // Konfiguracja rozszerzonych pól formularza
  setupEnhancedFormFields() {
    // Obsługa checkboxa noclegu
    const accommodationCheckbox = document.getElementById('accommodation-available');
    const accommodationInfoGroup = document.getElementById('accommodation-info-group');
    
    if (accommodationCheckbox && accommodationInfoGroup) {
      accommodationCheckbox.addEventListener('change', (e) => {
        if (e.target.checked) {
          accommodationInfoGroup.style.display = 'block';
        } else {
          accommodationInfoGroup.style.display = 'none';
          document.getElementById('accommodation-info').value = '';
        }
      });
    }
    
    // Formatowanie kodu BLIK
    const blikInput = document.getElementById('organizer-blik');
    if (blikInput) {
      blikInput.addEventListener('input', (e) => {
        let value = e.target.value.replace(/\D/g, '').slice(0, 6);
        e.target.value = value;
      });
    }
    
    // Upload zdjęć
    const imageInput = document.getElementById('event-images');
    const imagePreview = document.getElementById('image-preview');
    
    if (imageInput && imagePreview) {
      imageInput.addEventListener('change', (e) => {
        this.handleImageUpload(e.target.files, imagePreview);
      });
      
      // Drag & drop dla zdjęć
      const uploadArea = imageInput.closest('.file-upload-area');
      if (uploadArea) {
        uploadArea.addEventListener('dragover', (e) => {
          e.preventDefault();
          uploadArea.classList.add('drag-over');
        });
        
        uploadArea.addEventListener('dragleave', () => {
          uploadArea.classList.remove('drag-over');
        });
        
        uploadArea.addEventListener('drop', (e) => {
          e.preventDefault();
          uploadArea.classList.remove('drag-over');
          this.handleImageUpload(e.dataTransfer.files, imagePreview);
        });
      }
    }
    
    // Obsługa dress code modal (z opóźnieniem dla pewności)
    setTimeout(() => {
      this.initDressCodeModal();
    }, 100);
  }

  // Obsługa uploadu zdjęć
  handleImageUpload(files, previewContainer) {
    Array.from(files).forEach(file => {
      if (!file.type.startsWith('image/')) {
        showNotification('Można dodawać tylko pliki graficzne', 'warning');
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) { // 5MB
        showNotification('Plik jest za duży (max 5MB)', 'warning');
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (e) => {
        this.addImagePreview(e.target.result, file.name, previewContainer);
      };
      reader.readAsDataURL(file);
    });
  }

  // Dodaj podgląd zdjęcia
  addImagePreview(src, fileName, container) {
    const previewItem = document.createElement('div');
    previewItem.className = 'image-preview-item';
    previewItem.innerHTML = `
      <img src="${src}" alt="${fileName}">
      <button type="button" class="image-preview-remove" aria-label="Usuń zdjęcie">×</button>
    `;
    
    // Obsługa usuwania zdjęcia
    const removeBtn = previewItem.querySelector('.image-preview-remove');
    removeBtn.addEventListener('click', () => {
      previewItem.remove();
    });
    
    container.appendChild(previewItem);
  }

  // Konfiguracja modali
  setupModalHandlers() {
    // Zamykanie modali
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('modal')) {
        this.hideModal(e.target.id);
      }
      
      if (e.target.classList.contains('modal-close')) {
        const modal = e.target.closest('.modal');
        if (modal) {
          this.hideModal(modal.id);
        }
      }
    });
    
    // ESC key dla modali
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        const visibleModal = document.querySelector('.modal.show');
        if (visibleModal) {
          this.hideModal(visibleModal.id);
        }
      }
    });
  }

  // Skróty klawiszowe
  setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      // Ctrl/Cmd + N - nowe wydarzenie
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        window.location.href = '/create-event.html';
      }
      
      // Ctrl/Cmd + H - strona główna
      if ((e.ctrlKey || e.metaKey) && e.key === 'h') {
        e.preventDefault();
        window.location.href = '/';
      }
      
      // Ctrl/Cmd + K - wyszukiwanie
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        const searchInput = document.querySelector('.search-input');
        if (searchInput) {
          searchInput.focus();
        }
      }
    });
  }

  // Załaduj dane początkowe
  async loadInitialData() {
    const currentPage = this.getCurrentPage();
    
    switch (currentPage) {
      case 'home':
        await this.loadHomePage();
        break;
      case 'create-event':
        await this.loadCreateEventPage();
        break;
      case 'event-details':
        await this.loadEventDetailsPage();
        break;
      default:

    }
  }

  // Pobierz aktualną stronę
  getCurrentPage() {
    const path = window.location.pathname;
    
    if (path === '/' || path === '/index.html') {
      return 'home';
    } else if (path === '/create-event.html') {
      return 'create-event';
    } else if (path === '/event-details.html') {
      return 'event-details';
    }
    
    return 'unknown';
  }

  // Załaduj stronę główną
  async loadHomePage() {
    console.log('[App] Ładowanie strony głównej...');
    
    // Załaduj wydarzenia
    if (window.eventManager) {
      await window.eventManager.loadAndDisplayEvents();
    }
    
    // Sprawdź powiadomienia
    if (window.notificationManager) {
      window.notificationManager.scheduleEventNotifications();
    }
    
    // Dodaj przykładowe dane jeśli brak wydarzeń
    await this.addSampleDataIfNeeded();
  }

  // Załaduj stronę tworzenia wydarzenia
  async loadCreateEventPage() {
    try {
      console.log('[App] Ładowanie strony tworzenia wydarzenia...');
      
      // Ustaw domyślne daty
      this.setDefaultEventDates();
      
      // Inicjalizuj geolokalizację jeśli włączona
      if (window.storageManager) {
        const autoLocation = window.storageManager.getSetting('autoLocation');
        if (autoLocation && window.geolocationManager) {
          window.geolocationManager.getCurrentLocation();
        }
      }
    } catch (error) {
      console.error('[App] Błąd ładowania strony tworzenia wydarzenia:', error);
      throw error;
    }
  }

  // Załaduj stronę szczegółów wydarzenia
  async loadEventDetailsPage() {
    console.log('[App] Ładowanie strony szczegółów wydarzenia...');
    // Logika jest już w event-details.html w skrypcie inline
  }

  // === OBSŁUGA FORMULARZY ===

  // Obsłuż wysłanie formularza tworzenia wydarzenia
  async handleCreateEventSubmit(e) {
    e.preventDefault();
    
    try {
      const formData = new FormData(e.target);
      const eventData = window.eventManager.createEventFromForm(formData);
      
      // Waliduj dane
      const validation = window.eventManager.validateEvent(eventData);
      if (!validation.isValid) {
        window.eventManager.displayValidationErrors(validation.errors);
        return;
      }
      
      // Zapisz wydarzenie
      const savedEvent = await window.storageManager.saveEvent(eventData);
      
      // Pokaż modal sukcesu
      this.showSuccessModal(savedEvent);
      

      
    } catch (error) {
      console.error('[App] Błąd tworzenia wydarzenia:', error);
      showNotification(t('error.general'), 'error');
    }
  }

  // Obsłuż wyszukiwanie
  handleSearchSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const query = formData.get('search');
    
    if (window.eventManager) {
      window.eventManager.setSearchQuery(query);
    }
  }

  // === OBSŁUGA POŁĄCZENIA ===

  // Obsłuż przejście online
  handleOnline() {
    this.isOnline = true;
    console.log('[App] Aplikacja przeszła w tryb online');
    
    // Ukryj banner offline
    if (window.networkManager) {
      window.networkManager.hideOfflineBanner();
    }
    
    // Synchronizuj dane jeśli potrzeba
    this.syncDataWhenOnline();
  }

  // Obsłuż przejście offline
  handleOffline() {
    this.isOnline = false;
    console.log('[App] Aplikacja przeszła w tryb offline');
    
    // Pokaż banner offline
    if (window.networkManager) {
      window.networkManager.showOfflineBanner();
    }
  }

  // Synchronizuj dane po powrocie online
  async syncDataWhenOnline() {
    // W przyszłości tutaj można dodać synchronizację z serwerem

  }

  // === PWA INSTALLATION ===

  // Obsłuż prompt instalacji
  handleInstallPrompt(e) {
    console.log('[PWA] Prompt instalacji dostępny');
    
    // Zapobiegnij automatycznemu pokazaniu
    e.preventDefault();
    
    // Zapisz event do późniejszego użycia
    this.deferredPrompt = e;
    
    // Pokaż własny przycisk instalacji
    this.showInstallButton();
  }

  // Obsłuż zakończenie instalacji
  handleAppInstalled() {
    console.log('[PWA] Aplikacja została zainstalowana');
    
    this.isInstalled = true;
    this.deferredPrompt = null;
    
    // Ukryj przycisk instalacji
    this.hideInstallButton();
    
    // Pokaż powiadomienie o sukcesie
    showNotification(t('pwa.installed'), 'success');
  }

  // Pokaż przycisk instalacji
  showInstallButton() {
    // Implementacja pokazania przycisku instalacji
    console.log('[PWA] Pokaż przycisk instalacji');
  }

  // Ukryj przycisk instalacji
  hideInstallButton() {
    // Implementacja ukrycia przycisku instalacji

  }

  // Rozpocznij instalację PWA
  async installPWA() {
    if (!this.deferredPrompt) {
      console.log('[PWA] Prompt instalacji niedostępny');
      return;
    }
    
    try {
      // Pokaż prompt instalacji
      this.deferredPrompt.prompt();
      
      // Czekaj na wybór użytkownika
      const { outcome } = await this.deferredPrompt.userChoice;
      
      console.log('[PWA] Wybór użytkownika:', outcome);
      
      if (outcome === 'accepted') {
        console.log('[PWA] Użytkownik zaakceptował instalację');
      } else {
        console.log('[PWA] Użytkownik odrzucił instalację');
      }
      
      // Wyczyść prompt
      this.deferredPrompt = null;
      
    } catch (error) {
      console.error('[PWA] Błąd instalacji:', error);
    }
  }

  // Sprawdź status instalacji
  checkInstallationStatus() {
    // Sprawdź czy aplikacja jest uruchomiona jako PWA
    if (window.matchMedia('(display-mode: standalone)').matches) {
      this.isInstalled = true;
      console.log('[PWA] Aplikacja uruchomiona jako PWA');
    }
  }

  // === SERVICE WORKER ===

  // Obsłuż wiadomości od Service Workera
  handleServiceWorkerMessage(event) {
    const { type, payload } = event.data;
    
    switch (type) {
      case 'CACHE_UPDATED':
        console.log('[SW] Cache zaktualizowany');
        break;
        
      case 'BACKGROUND_SYNC':
        console.log('[SW] Synchronizacja w tle:', payload);
        break;
        
      default:
        console.log('[SW] Nieznana wiadomość:', type, payload);
    }
  }

  // === MODALS ===

  // Pokaż modal
  showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.add('show');
      modal.style.display = 'flex';
      document.body.style.overflow = 'hidden'; // Zapobiegnij scrollowaniu tła
    }
  }

  // Ukryj modal
  hideModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.remove('show');
      setTimeout(() => {
        modal.style.display = 'none';
      }, 300); // Czas animacji
      document.body.style.overflow = ''; // Przywróć scrollowanie
    }
  }

  // Pokaż modal sukcesu tworzenia wydarzenia
  showSuccessModal(event) {
    const modal = document.getElementById('success-modal');
    if (!modal) return;
    
    // Ustaw kod zaproszenia
    const invitationCodeElement = modal.querySelector('#invitation-code-text');
    if (invitationCodeElement && event.invitationCode) {
      invitationCodeElement.textContent = event.invitationCode;
    }
    
    // Skonfiguruj przycisk kopiowania
    const copyBtn = modal.querySelector('#copy-invitation-btn');
    if (copyBtn && event.invitationCode) {
      copyBtn.onclick = () => this.copyInvitationCode(event.invitationCode);
    }
    
    // Wygeneruj QR kod
    if (window.qrManager) {
      const shareUrl = `${window.location.origin}/event-details.html?id=${event.id}`;
      window.qrManager.generateQR(shareUrl, 'qr-container');
    }
    
    // Skonfiguruj przyciski
    const viewEventBtn = modal.querySelector('#view-event-btn');
    const createAnotherBtn = modal.querySelector('#create-another-btn');
    
    if (viewEventBtn) {
      viewEventBtn.onclick = () => {
        window.location.href = `/event-details.html?id=${event.id}`;
      };
    }
    
    if (createAnotherBtn) {
      createAnotherBtn.onclick = () => {
        this.hideModal('success-modal');
        window.location.reload(); // Wyczyść formularz
      };
    }
    
    this.showModal('success-modal');
  }

  // Kopiuj kod zaproszenia do schowka
  async copyInvitationCode(code) {
    try {
      await navigator.clipboard.writeText(code);
      
      // Pokaż feedback
      const copyBtn = document.getElementById('copy-invitation-btn');
      if (copyBtn) {
        const originalText = copyBtn.textContent;
        copyBtn.textContent = '✓';
        copyBtn.style.background = '#4CAF50';
        
        setTimeout(() => {
          copyBtn.textContent = originalText;
          copyBtn.style.background = '';
        }, 2000);
      }
      
      // Opcjonalnie pokaż toast notification
      this.showToast('Kod zaproszenia skopiowany!', 'success');
    } catch (err) {
      console.error('Błąd kopiowania:', err);
      
      // Fallback - zaznacz tekst kodu
      const codeElement = document.getElementById('invitation-code-text');
      if (codeElement) {
        const range = document.createRange();
        range.selectNodeContents(codeElement);
        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
      }
      
      this.showToast('Kod jest zaznaczony - skopiuj ręcznie (Ctrl+C)', 'info');
    }
  }

  // === UTILITY ===

  // Ustaw domyślne daty w formularzu
  setDefaultEventDates() {
    const startDateInput = document.getElementById('event-start-date');
    const endDateInput = document.getElementById('event-end-date');
    const startTimeInput = document.getElementById('event-start-time');
    
    if (startDateInput && !startDateInput.value) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      startDateInput.value = tomorrow.toISOString().split('T')[0];
      startDateInput.min = new Date().toISOString().split('T')[0];
    }
    
    if (endDateInput && !endDateInput.value && startDateInput.value) {
      endDateInput.value = startDateInput.value;
    }
    
    if (startTimeInput && !startTimeInput.value) {
      startTimeInput.value = '18:00'; // Domyślna godzina
    }
  }

  // Dodaj przykładowe dane jeśli potrzeba
  async addSampleDataIfNeeded() {
    try {
      if (!window.storageManager) {
        console.warn('[App] StorageManager nie jest jeszcze dostępny');
        return;
      }
      
      const events = window.storageManager.getAllEvents();
      
      if (events.length === 0) {
        console.log('[App] Brak wydarzeń - przykładowe dane zostaną załadowane przez SampleDataManager');
        // SampleDataManager automatycznie załaduje wszystkie 8 przykładowych wydarzeń
      }
    } catch (error) {
      console.error('[App] Błąd podczas sprawdzania przykładowych danych:', error);
    }
  }

  // Pobierz datę w przyszłości (helper dla przykładowych danych)
  getDateInFuture(days, time) {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return `${date.toISOString().split('T')[0]}T${time}:00`;
  }

  // Obsłuż błąd inicjalizacji
  handleInitializationError(error) {
    console.error('[App] Krytyczny błąd inicjalizacji:', error);
    
    // Pokaż użytkownikowi informację o błędzie
    const errorDiv = document.createElement('div');
    errorDiv.className = 'app-error';
    errorDiv.innerHTML = `
      <h2>⚠️ Błąd aplikacji</h2>
      <p>Wystąpił problem podczas uruchamiania aplikacji.</p>
      <button onclick="window.location.reload()" class="btn btn-primary">
        Odśwież stronę
      </button>
    `;
    
    document.body.appendChild(errorDiv);
  }

  // Inicjalizuj modal dress code
  initDressCodeModal() {
    console.log('[DressCode] Inicjalizacja modalu dress code...');
    const dressCodeBtn = document.getElementById('dress-code-btn');
    const changeDressCodeBtn = document.getElementById('change-dress-code');
    const modal = document.getElementById('dress-code-modal');
    const closeModal = document.getElementById('close-dress-code-modal');
    const cancelBtn = document.getElementById('cancel-dress-code');
    const confirmBtn = document.getElementById('confirm-dress-code');
    const dressCodeOptions = document.querySelectorAll('.dress-code-option');
    const customInputSection = document.getElementById('custom-dress-input-section');
    const modalCustomInput = document.getElementById('modal-custom-dress-input');
    
    console.log('[DressCode] Elements found:', {
      dressCodeBtn: !!dressCodeBtn,
      modal: !!modal,
      dressCodeOptions: dressCodeOptions.length
    });
    
    let selectedValue = 'none';
    let customText = '';

    // Otwórz modal
    const openModal = () => {
      console.log('[DressCode] Otwieranie modalu...');
      this.showModal('dress-code-modal');
      // Zaznacz aktualnie wybraną opcję
      dressCodeOptions.forEach(option => {
        option.classList.toggle('selected', option.dataset.value === selectedValue);
      });
      
      // Pokaż pole custom jeśli wybrane
      if (selectedValue === 'custom') {
        customInputSection.style.display = 'block';
        customInputSection.classList.add('show');
        modalCustomInput.value = customText;
        setTimeout(() => modalCustomInput.focus(), 300);
      } else {
        customInputSection.style.display = 'none';
        customInputSection.classList.remove('show');
      }
    };

    // Event listeners
    if (dressCodeBtn) {
      console.log('[DressCode] Dodawanie event listenera do przycisku...');
      dressCodeBtn.addEventListener('click', (e) => {
        console.log('[DressCode] Przycisk kliknięty!', e);
        openModal();
      });
    } else {
      console.error('[DressCode] Nie znaleziono przycisku dress-code-btn!');
    }
    
    if (changeDressCodeBtn) {
      changeDressCodeBtn.addEventListener('click', openModal);
    }

    // Zamknij modal
    const closeModalHandler = () => {
      this.hideModal('dress-code-modal');
      customInputSection.style.display = 'none';
      customInputSection.classList.remove('show');
    };

    if (closeModal) {
      closeModal.addEventListener('click', closeModalHandler);
    }
    
    if (cancelBtn) {
      cancelBtn.addEventListener('click', closeModalHandler);
    }

    // Wybór opcji
    dressCodeOptions.forEach(option => {
      option.addEventListener('click', () => {
        // Usuń zaznaczenie z wszystkich opcji
        dressCodeOptions.forEach(opt => opt.classList.remove('selected'));
        
        // Zaznacz wybraną opcję
        option.classList.add('selected');
        selectedValue = option.dataset.value;

        // Pokaż/ukryj pole custom
        if (selectedValue === 'custom') {
          customInputSection.style.display = 'block';
          customInputSection.classList.add('show');
          setTimeout(() => modalCustomInput.focus(), 300);
        } else {
          customInputSection.style.display = 'none';
          customInputSection.classList.remove('show');
          modalCustomInput.value = '';
        }
      });
    });

    // Potwierdź wybór
    if (confirmBtn) {
      confirmBtn.addEventListener('click', () => {
        // Pobierz custom text jeśli wybrano custom
        if (selectedValue === 'custom') {
          customText = modalCustomInput.value.trim();
          if (!customText) {
            modalCustomInput.focus();
            return;
          }
        } else {
          customText = '';
        }

        // Zaktualizuj UI
        this.updateDressCodeDisplay(selectedValue, customText);
        
        // Zaktualizuj hidden inputs
        document.getElementById('dress-code-type').value = selectedValue;
        document.getElementById('custom-dress-code').value = customText;
        
        // Zamknij modal
        closeModalHandler();
      });
    }
  }

  // Zaktualizuj wyświetlanie wybranego dress code
  updateDressCodeDisplay(value, customText) {
    const button = document.getElementById('dress-code-btn');
    const selectedSection = document.getElementById('dress-code-selected');
    const selectedText = document.getElementById('selected-dress-code-text');

    if (!button || !selectedSection || !selectedText) return;

    let displayText = '';
    
    // Pobierz tekst dla wybranej opcji
    const translations = {
      'none': window.t ? window.t('create.dressCodeNone') : 'Brak wymagań',
      'casual': window.t ? window.t('create.dressCodeCasual') : 'Casual',
      'smart_casual': window.t ? window.t('create.dressCodeSmartCasual') : 'Smart casual',
      'formal': window.t ? window.t('create.dressCodeFormal') : 'Elegancki',
      'costume': window.t ? window.t('create.dressCodeCostume') : 'Kostiumowy',
      'theme': window.t ? window.t('create.dressCodeTheme') : 'Tematyczny',
      'custom': customText || (window.t ? window.t('create.dressCodeCustom') : 'Inne')
    };

    displayText = translations[value] || translations.none;

    // Pokaż wybrany dress code
    selectedText.textContent = displayText;
    button.style.display = 'none';
    selectedSection.style.display = 'flex';
  }

  // Pokaż toast notification
  showToast(message, type = 'info') {
    // Usuń istniejące toasty
    const existingToast = document.querySelector('.toast');
    if (existingToast) {
      existingToast.remove();
    }

    // Utwórz nowy toast
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;

    // Style inline dla toasta
    Object.assign(toast.style, {
      position: 'fixed',
      top: '20px',
      right: '20px',
      padding: '12px 24px',
      borderRadius: '8px',
      color: 'white',
      fontWeight: '500',
      zIndex: '10000',
      transform: 'translateX(100%)',
      transition: 'transform 0.3s ease',
      maxWidth: '300px',
      wordWrap: 'break-word'
    });

    // Kolory dla różnych typów
    const colors = {
      success: '#4CAF50',
      error: '#f44336',
      warning: '#ff9800',
      info: '#2196F3'
    };
    toast.style.background = colors[type] || colors.info;

    document.body.appendChild(toast);

    // Animacja pojawienia
    setTimeout(() => {
      toast.style.transform = 'translateX(0)';
    }, 10);

    // Automatyczne usunięcie po 3 sekundach
    setTimeout(() => {
      toast.style.transform = 'translateX(100%)';
      setTimeout(() => {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
      }, 300);
    }, 3000);
  }
}

// Inicjalizacja aplikacji po załadowaniu DOM
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.app = new FeteLiteApp();
  });
} else {
  window.app = new FeteLiteApp();
}

// Globalne funkcje pomocnicze
window.showModal = (modalId) => window.app?.showModal(modalId);
window.hideModal = (modalId) => window.app?.hideModal(modalId);

// Bezpieczne dodawanie event listenerów
window.safeAddEventListener = function(elementId, event, handler) {
  const element = document.getElementById(elementId);
  if (element) {
    element.addEventListener(event, handler);
    return true;
  } else {
    console.warn(`[SafeListener] Element o ID '${elementId}' nie został znaleziony`);
    return false;
  }
};

// Alternatywnie - sprawdź czy element istnieje
window.getElementById = function(id) {
  const element = document.getElementById(id);
  if (!element) {
    console.warn(`[SafeQuery] Element o ID '${id}' nie został znaleziony`);
  }
  return element;
};

// Globalne funkcje zarządzania cache
window.clearAppCache = async function() {
  try {
    console.log('[Cache] Czyszczenie cache...');
    
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map(cacheName => {
          console.log('[Cache] Usuwam:', cacheName);
          return caches.delete(cacheName);
        })
      );
    }
    
    // Wyrejestruj Service Worker
    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      for (const registration of registrations) {
        await registration.unregister();
        console.log('[Cache] Wyrejestrowano Service Worker');
      }
    }
    
    console.log('[Cache] ✓ Cache wyczyszczony');
    
    // Powiadomienie
    if (window.showNotification) {
      window.showNotification('Cache wyczyszczony. Przeładuj stronę.', 'success');
    } else {
      alert('Cache wyczyszczony. Przeładuj stronę (Ctrl+F5).');
    }
    
  } catch (error) {
    console.error('[Cache] Błąd czyszczenia cache:', error);
    
    if (window.showNotification) {
      window.showNotification('Błąd czyszczenia cache', 'error');
    } else {
      alert('Błąd czyszczenia cache');
    }
  }
};

window.forceReloadApp = function() {
  console.log('[Cache] Wymuszam przeładowanie aplikacji...');
  
  // Wyczyść cache i przeładuj
  window.clearAppCache().then(() => {
    setTimeout(() => {
      window.location.reload(true);
    }, 1000);
  });
};

console.log('[App] Main.js loaded');

// Helper dla deweloperów
if (location.hostname === 'localhost' || location.hostname === '127.0.0.1') {
  console.log('🚀 [DEV MODE] Dostępne komendy:');
  console.log('- clearAppCache() - wyczyść cache aplikacji');
  console.log('- forceReloadApp() - wymuś przeładowanie z czyszczeniem cache');
  console.log('- location.reload(true) - standardowe przeładowanie');
}

// Inicjalizacja przycisku przełączania filtrów (tylko na index.html)
document.addEventListener('DOMContentLoaded', () => {
  const toggleFiltersBtn = document.getElementById('toggle-filters-btn');
  const filtersContainer = document.getElementById('filters-container');
  
  if (toggleFiltersBtn && filtersContainer) {
    let filtersVisible = false;
    
    toggleFiltersBtn.addEventListener('click', () => {
      filtersVisible = !filtersVisible;
      
      if (filtersVisible) {
        filtersContainer.style.display = 'block';
        // Animacja wjazdu
        setTimeout(() => {
          filtersContainer.classList.add('show');
        }, 10);
        
        // Zmień tekst i ikonę przycisku
        const btnText = toggleFiltersBtn.querySelector('span:not(.btn-icon)');
        const btnIcon = toggleFiltersBtn.querySelector('.btn-icon');
        if (btnText) {
          btnText.setAttribute('data-i18n', 'filter.hideFilters');
          btnText.textContent = i18n.t('filter.hideFilters');
        }
        if (btnIcon) {
          btnIcon.textContent = '🔼';
        }
      } else {
        filtersContainer.classList.remove('show');
        // Ukryj po animacji
        setTimeout(() => {
          filtersContainer.style.display = 'none';
        }, 300);
        
        // Przywróć oryginalny tekst i ikonę
        const btnText = toggleFiltersBtn.querySelector('span:not(.btn-icon)');
        const btnIcon = toggleFiltersBtn.querySelector('.btn-icon');
        if (btnText) {
          btnText.setAttribute('data-i18n', 'filter.showFilters');
          btnText.textContent = i18n.t('filter.showFilters');
        }
        if (btnIcon) {
          btnIcon.textContent = '🔽';
        }
      }
    });
  }
});
