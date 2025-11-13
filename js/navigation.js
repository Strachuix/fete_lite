// Fete Lite - Komponent nawigacji
// Centralne zarządzanie nawigacją z automatycznym zaznaczaniem aktywnej strony

class NavigationManager {
  constructor() {
    this.currentPage = this.getCurrentPage();
    this.init();
  }

  // Inicjalizacja nawigacji
  init() {
    this.renderNavigation();
    this.setupEventListeners();

  }

  // Określ aktualną stronę na podstawie URL
  getCurrentPage() {
    const path = window.location.pathname;
    
    if (path === '/' || path === '/index.html' || path.endsWith('/')) {
      return 'home';
    } else if (path.includes('create-event')) {
      return 'create';
    } else if (path.includes('event-details')) {
      return 'details';
    } else if (path.includes('settings')) {
      return 'settings';
    }
    
    return 'home';
  }

  // Wygeneruj HTML nawigacji
  generateNavigationHTML() {
    const isMobile = window.innerWidth < 768;
    
    return `
      <nav class="bottom-nav" role="navigation" aria-label="Główna nawigacja">
        <a href="/" class="nav-item ${this.currentPage === 'home' ? 'active' : ''}" data-page="home">
          <span class="nav-icon">🏠</span>
          <span class="nav-label" data-i18n="nav.home">Strona główna</span>
        </a>
        <a href="./create-event.html" class="nav-item ${this.currentPage === 'create' ? 'active' : ''}" data-page="create">
          <span class="nav-icon">➕</span>
          <span class="nav-label" data-i18n="nav.create">Utwórz</span>
        </a>
        <a href="./settings.html" class="nav-item ${this.currentPage === 'settings' ? 'active' : ''}" data-page="settings">
          <span class="nav-icon">⚙️</span>
          <span class="nav-label" data-i18n="nav.settings">Ustawienia</span>
        </a>
        <a href="./auth.html" class="nav-item ${this.currentPage === 'auth' ? 'active' : ''}" data-page="auth">
          <span class="nav-icon">👤</span>
          <span class="nav-label" data-i18n="nav.login">Logowanie</span>
        </a>
      </nav>
    `;
  }

  // Renderuj nawigację w kontenerze
  renderNavigation() {
    // Znajdź kontener nawigacji lub utwórz go
    let navContainer = document.getElementById('navigation-container');
    
    if (!navContainer) {
      // Jeśli nie ma kontenera, utwórz go przed zamknięciem body
      navContainer = document.createElement('div');
      navContainer.id = 'navigation-container';
      document.body.appendChild(navContainer);
    }

    // Wstaw HTML nawigacji
    navContainer.innerHTML = this.generateNavigationHTML();

    // Zastosuj tłumaczenia jeśli są dostępne
    this.applyTranslations();
  }

  // Zastosuj tłumaczenia
  applyTranslations() {
    if (window.i18n && window.i18n.updateDOM) {
      // Opóźnij nieco aby DOM był gotowy
      setTimeout(() => {
        window.i18n.updateDOM();
      }, 100);
    }
  }

  // Skonfiguruj event listenery
  setupEventListeners() {
    // Obsługa kliknięć w linki nawigacji (dla SPA-like behavior)
    const navItems = document.querySelectorAll('.nav-item[data-page]');
    navItems.forEach(item => {
      item.addEventListener('click', (e) => {
        // Dodaj efekt kliknięcia
        this.addClickEffect(item);
      });
    });

    // Obsługa zmian rozmiaru okna dla responsywności
    window.addEventListener('resize', () => {
      this.handleResize();
    });
  }

  // Dodaj efekt wizualny kliknięcia
  addClickEffect(element) {
    element.classList.add('clicked');
    setTimeout(() => {
      element.classList.remove('clicked');
    }, 150);
  }

  // Obsłuż zmianę rozmiaru okna
  handleResize() {
    // Można tutaj dodać logikę dla zmian responsywnych
    const isMobile = window.innerWidth < 768;
    // Logika dla różnych rozmiarów ekranu jeśli potrzebna
  }

  // Zaktualizuj aktywną stronę (dla SPA)
  updateActivePage(newPage) {
    // Usuń klasę active ze wszystkich elementów
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
      item.classList.remove('active');
    });

    // Dodaj klasę active do odpowiedniego elementu
    const activeItem = document.querySelector(`[data-page="${newPage}"]`);
    if (activeItem) {
      activeItem.classList.add('active');
    }

    this.currentPage = newPage;
  }

  // Odśwież nawigację (przydatne po zmianach językowych)
  refresh() {
    this.renderNavigation();
  }

  // Metoda do wywołania z zewnątrz dla aktualizacji po załadowaniu i18n
  updateAfterI18nLoad() {
    this.applyTranslations();
  }
}

// Style CSS dla efektów nawigacji
const navigationStyles = `
<style>
.nav-item.clicked {
  transform: scale(0.95);
  transition: transform 0.15s ease-in-out;
}

/* Animacja dla aktywnego elementu */
.nav-item.active {
  animation: activeGlow 0.3s ease-in-out;
}

@keyframes activeGlow {
  0% { 
    background: rgba(102, 126, 234, 0.1); 
  }
  50% { 
    background: rgba(102, 126, 234, 0.25); 
  }
  100% { 
    background: var(--color-primary);
  }
}

/* Płynne przejścia dla hover */
.nav-item:hover:not(.active) {
  background: rgba(102, 126, 234, 0.1);
  transform: translateY(-1px);
}

@media (min-width: 768px) {
  .nav-item:hover:not(.active) {
    transform: translateX(4px);
  }
}
</style>
`;

// Dodaj style do head
document.head.insertAdjacentHTML('beforeend', navigationStyles);

// Inicjalizuj nawigację po załadowaniu DOM
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.navigationManager = new NavigationManager();
  });
} else {
  window.navigationManager = new NavigationManager();
}

// Eksportuj funkcje globalne
window.updateNavigationActivePage = (page) => {
  if (window.navigationManager) {
    window.navigationManager.updateActivePage(page);
  }
};

window.refreshNavigation = () => {
  if (window.navigationManager) {
    window.navigationManager.refresh();
  }
};

