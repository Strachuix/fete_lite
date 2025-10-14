// Fete Lite - Zarządzanie motywami
// Przełączanie między jasnym a ciemnym motywem

class DarkModeManager {
  constructor() {
    this.currentTheme = 'light';
    this.systemPreference = null;
    this.userPreference = null;
    this.mediaQuery = null;
    
    this.init();

  }

  // Inicjalizuj system motywów
  init() {
    // Sprawdź preferencje systemowe
    this.detectSystemPreference();
    
    // Załaduj preferencje użytkownika
    this.loadUserPreference();
    
    // Ustaw początkowy motyw
    this.applyTheme();
    
    // Nasłuchuj zmian preferencji systemowych
    this.setupSystemPreferenceListener();
    
    // Skonfiguruj interfejs użytkownika
    this.setupUI();
    
    // Nasłuchuj zmian w storage
    this.setupStorageListener();
  }

  // Wykryj preferencje systemowe
  detectSystemPreference() {
    if (window.matchMedia) {
      this.mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      this.systemPreference = this.mediaQuery.matches ? 'dark' : 'light';
      

    } else {
      this.systemPreference = 'light';

    }
  }

  // Załaduj preferencje użytkownika z localStorage
  loadUserPreference() {
    try {
      const saved = localStorage.getItem('theme-preference');
      
      if (saved && ['light', 'dark', 'auto'].includes(saved)) {
        this.userPreference = saved;

      } else {
        this.userPreference = 'auto'; // Domyślnie auto (podąża za systemem)
        this.saveUserPreference();

      }
      
    } catch (error) {
      console.warn('[DarkMode] Could not load user preference:', error);
      this.userPreference = 'auto';
    }
  }

  // Zapisz preferencje użytkownika
  saveUserPreference() {
    try {
      localStorage.setItem('theme-preference', this.userPreference);

    } catch (error) {
      console.warn('[DarkMode] Could not save user preference:', error);
    }
  }

  // Określ który motyw powinien być aktywny
  determineActiveTheme() {
    switch (this.userPreference) {
      case 'light':
        return 'light';
      case 'dark':
        return 'dark';
      case 'auto':
      default:
        return this.systemPreference || 'light';
    }
  }

  // Zastosuj motyw
  applyTheme() {
    const previousTheme = this.currentTheme;
    this.currentTheme = this.determineActiveTheme();
    
    // Ustaw atrybut data-theme na elemencie html
    document.documentElement.setAttribute('data-theme', this.currentTheme);
    
    // Załaduj/usuń CSS dla ciemnego motywu
    this.manageDarkModeCSS();
    
    // Ustaw kolor meta theme-color
    this.updateThemeColor();
    
    // Powiadom o zmianie motywu
    this.notifyThemeChange(previousTheme, this.currentTheme);
    

  }

  // Zarządzaj CSS dla ciemnego motywu
  manageDarkModeCSS() {
    const existingLink = document.getElementById('dark-mode-css');
    
    if (this.currentTheme === 'dark') {
      // Dodaj CSS dla ciemnego motywu jeśli nie istnieje
      if (!existingLink) {
        const link = document.createElement('link');
        link.id = 'dark-mode-css';
        link.rel = 'stylesheet';
        link.href = './css/dark-mode.css';
        document.head.appendChild(link);
        

      }
    } else {
      // Usuń CSS dla ciemnego motywu
      if (existingLink) {
        existingLink.remove();

      }
    }
  }

  // Zaktualizuj kolor theme-color w meta
  updateThemeColor() {
    let themeColorMeta = document.querySelector('meta[name="theme-color"]');
    
    if (!themeColorMeta) {
      themeColorMeta = document.createElement('meta');
      themeColorMeta.name = 'theme-color';
      document.head.appendChild(themeColorMeta);
    }
    
    const colors = {
      light: '#6366f1', // Indigo
      dark: '#4338ca'   // Ciemniejszy indigo
    };
    
    themeColorMeta.content = colors[this.currentTheme] || colors.light;
  }

  // Powiadom o zmianie motywu
  notifyThemeChange(from, to) {
    if (from !== to) {
      // Wyślij custom event
      const event = new CustomEvent('themechange', {
        detail: { from, to, userPreference: this.userPreference }
      });
      
      document.dispatchEvent(event);
      
      // Dodaj animację przejścia
      this.animateThemeTransition();
    }
  }

  // Animacja przejścia między motywami
  animateThemeTransition() {
    // Dodaj klasę animacji
    document.documentElement.classList.add('theme-transitioning');
    
    // Usuń po zakończeniu animacji
    setTimeout(() => {
      document.documentElement.classList.remove('theme-transitioning');
    }, 300);
  }

  // Przełącz motyw (toggle)
  toggleTheme() {
    const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
    this.setTheme(newTheme);
  }

  // Ustaw konkretny motyw
  setTheme(theme) {
    if (['light', 'dark', 'auto'].includes(theme)) {
      this.userPreference = theme;
      this.saveUserPreference();
      this.applyTheme();
      this.updateUI();
      
      // Pokaż notification
      const themeNames = {
        light: t('darkMode.lightTheme'),
        dark: t('darkMode.darkTheme'),
        auto: t('darkMode.autoTheme')
      };
      
      showNotification(
        t('darkMode.themeChanged', { theme: themeNames[theme] }),
        'info'
      );
    }
  }

  // Pobierz aktualny motyw
  getCurrentTheme() {
    return {
      active: this.currentTheme,
      userPreference: this.userPreference,
      systemPreference: this.systemPreference
    };
  }

  // Nasłuchuj zmian preferencji systemowych
  setupSystemPreferenceListener() {
    if (this.mediaQuery) {
      this.mediaQuery.addEventListener('change', (e) => {
        const oldSystemPreference = this.systemPreference;
        this.systemPreference = e.matches ? 'dark' : 'light';
        

        
        // Jeśli użytkownik ma ustawione 'auto', zastosuj nowy motyw
        if (this.userPreference === 'auto') {
          this.applyTheme();
          this.updateUI();
          
          showNotification(
            t('darkMode.systemThemeChanged'),
            'info'
          );
        }
      });
    }
  }

  // Skonfiguruj interfejs użytkownika
  setupUI() {
    // Znajdź wszystkie przyciski przełączania motywu
    const toggleButtons = document.querySelectorAll('[data-theme-toggle]');
    
    toggleButtons.forEach(button => {
      button.addEventListener('click', () => {
        this.toggleTheme();
      });
    });

    // Znajdź selektor motywu (jeśli istnieje)
    const themeSelector = document.getElementById('theme-selector');
    if (themeSelector) {
      themeSelector.addEventListener('change', (e) => {
        this.setTheme(e.target.value);
      });
    }

    // Zaktualizuj UI
    this.updateUI();
  }

  // Zaktualizuj interfejs użytkownika
  updateUI() {
    // Zaktualizuj przyciski toggle
    const toggleButtons = document.querySelectorAll('[data-theme-toggle]');
    toggleButtons.forEach(button => {
      this.updateToggleButton(button);
    });

    // Zaktualizuj selektor motywu
    const themeSelector = document.getElementById('theme-selector');
    if (themeSelector) {
      themeSelector.value = this.userPreference;
    }

    // Zaktualizuj ikony w nawigacji
    this.updateNavigationIcons();
  }

  // Zaktualizuj przycisk toggle
  updateToggleButton(button) {
    const lightIcon = button.querySelector('.theme-icon-light');
    const darkIcon = button.querySelector('.theme-icon-dark');
    
    if (lightIcon && darkIcon) {
      if (this.currentTheme === 'dark') {
        lightIcon.style.display = 'inline';
        darkIcon.style.display = 'none';
        button.setAttribute('aria-label', t('darkMode.switchToLight'));
      } else {
        lightIcon.style.display = 'none';
        darkIcon.style.display = 'inline';
        button.setAttribute('aria-label', t('darkMode.switchToDark'));
      }
    }

    // Zaktualizuj tekst przycisku jeśli istnieje
    const buttonText = button.querySelector('.theme-button-text');
    if (buttonText) {
      const texts = {
        light: t('darkMode.darkTheme'),
        dark: t('darkMode.lightTheme')
      };
      buttonText.textContent = texts[this.currentTheme] || '';
    }
  }

  // Zaktualizuj ikony w nawigacji bottom
  updateNavigationIcons() {
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
      // Dodaj klasę dla stylowania w zależności od motywu
      item.classList.toggle('dark-theme', this.currentTheme === 'dark');
    });
  }

  // Nasłuchuj zmian w localStorage (z innych zakładek)
  setupStorageListener() {
    window.addEventListener('storage', (e) => {
      if (e.key === 'theme-preference' && e.newValue !== this.userPreference) {

        this.loadUserPreference();
        this.applyTheme();
        this.updateUI();
      }
    });
  }



  // Funkcje pomocnicze dla integracji z innymi komponentami

  // Sprawdź czy aktywny jest ciemny motyw
  isDarkMode() {
    return this.currentTheme === 'dark';
  }

  // Pobierz odpowiedni kolor dla aktualnego motywu
  getThemeColor(colorName) {
    const colors = {
      light: {
        primary: '#6366f1',
        secondary: '#8b5cf6',
        background: '#ffffff',
        surface: '#f8fafc',
        text: '#1e293b',
        textSecondary: '#64748b'
      },
      dark: {
        primary: '#4338ca',
        secondary: '#7c3aed',
        background: '#0f172a',
        surface: '#1e293b',
        text: '#f1f5f9',
        textSecondary: '#94a3b8'
      }
    };

    return colors[this.currentTheme]?.[colorName] || colors.light[colorName];
  }

  // Eksportuj ustawienia motywu
  exportSettings() {
    return {
      userPreference: this.userPreference,
      currentTheme: this.currentTheme,
      systemPreference: this.systemPreference,
      timestamp: new Date().toISOString()
    };
  }

  // Importuj ustawienia motywu
  importSettings(settings) {
    if (settings && settings.userPreference) {
      this.setTheme(settings.userPreference);
      return true;
    }
    return false;
  }

  // Reset do ustawień domyślnych
  resetToDefaults() {
    this.setTheme('auto');
    showNotification(t('darkMode.resetToDefaults'), 'success');
  }
}

// Globalna instancja DarkModeManager
window.darkModeManager = new DarkModeManager();

// Event listenery
document.addEventListener('DOMContentLoaded', () => {
  // Motyw jest teraz kontrolowany wyłącznie przez ustawienia
});

// CSS dla animacji przejść między motywami
const style = document.createElement('style');
style.textContent = `
  .theme-transitioning * {
    transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease !important;
  }
`;
document.head.appendChild(style);

// Funkcje globalne
window.toggleTheme = () => window.darkModeManager.toggleTheme();
window.setTheme = (theme) => window.darkModeManager.setTheme(theme);
window.getCurrentTheme = () => window.darkModeManager.getCurrentTheme();
window.isDarkMode = () => window.darkModeManager.isDarkMode();


