// Fete Lite - Zarządzanie nagłówkami
// Uniwersalny system nagłówków dla wszystkich stron aplikacji

class HeaderManager {
  constructor() {
    this.currentPage = this.detectCurrentPage();
    this.eventId = this.extractEventId();
    
    this.init();
  }

  // Inicjalizacja managera nagłówków
  init() {
    this.createHeader();
    this.setupEventListeners();
  }

  // Wykryj aktualną stronę na podstawie URL
  detectCurrentPage() {
    const path = window.location.pathname;
    const filename = path.split('/').pop() || 'index.html';
    
    if (filename === '' || filename === 'index.html') return 'home';
    if (filename === 'auth.html') return 'auth';
    if (filename === 'create-event.html') return 'create-event';
    if (filename === 'event-details.html') return 'event-details';
    if (filename === 'settings.html') return 'settings';
    
    return 'unknown';
  }

  // Wyciągnij ID wydarzenia z URL (dla event-details)
  extractEventId() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id');
  }

  // Utwórz odpowiedni nagłówek
  createHeader() {
    const headerContainer = document.querySelector('header');
    if (!headerContainer) return;

    // Wyczyść istniejący content
    headerContainer.innerHTML = '';
    
    // Użyj tego samego nagłówka dla wszystkich widoków
    this.createUniformHeader(headerContainer);
  }

  // Utwórz jednolity nagłówek dla wszystkich stron
  createUniformHeader(container) {
    // Ustaw jednolitą klasę dla wszystkich nagłówków
    container.className = 'uniform-header';
    container.innerHTML = `
      <div class="header-content">
        <h1 class="app-title" data-i18n="app.title">Fete Lite</h1>
      </div>
    `;
  }



  // Skonfiguruj event listenery
  setupEventListeners() {
    // Nasłuchuj zmiany języka dla aktualizacji tytułu
    document.addEventListener('languageChanged', () => {
      this.updateTitle();
    });
  }

  // Aktualizuj tytuł aplikacji po zmianie języka
  updateTitle() {
    const titleElement = document.querySelector('.app-title');
    if (titleElement && window.i18nManager) {
      titleElement.textContent = window.i18nManager.t('app.title');
    }
  }

  // Zaktualizuj nagłówek (publiczna metoda)
  refresh() {
    this.createHeader();
    this.setupEventListeners();
  }
}

// Inicjalizuj po załadowaniu DOM
document.addEventListener('DOMContentLoaded', () => {
  // Sprawdź czy header już istnieje (aby uniknąć podwójnej inicjalizacji)
  if (!window.headerManager) {
    window.headerManager = new HeaderManager();
  }
});

// Eksportuj dla dostępu z innych modułów
window.HeaderManager = HeaderManager;