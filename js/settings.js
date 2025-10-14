// Fete Lite - Ustawienia
// Zarządzanie ustawieniami użytkownika

class SettingsManager {
  constructor() {
    this.init();
  }

  async init() {
    // Poczekaj na gotowość i18n
    await this.waitForI18n();
    
    this.setupEventListeners();
    this.loadCurrentSettings();
    
    // Wymusz ponowne tłumaczenie po krótkiej przerwie
    setTimeout(() => {
      this.forceTranslationUpdate();
    }, 200);
    

  }

  // Wymusz aktualizację tłumaczeń
  forceTranslationUpdate() {
    if (window.i18n && window.i18n.updateDOM) {

      window.i18n.updateDOM();
    }
  }

  // Poczekaj na gotowość systemu i18n
  waitForI18n() {
    return new Promise((resolve) => {
      let attempts = 0;
      const maxAttempts = 100; // maksymalnie 5 sekund oczekiwania
      
      const checkI18n = () => {
        if (window.i18n && typeof window.i18n.init === 'function') {
          // i18n jest dostępne, zainicjalizuj i przetłumacz

          window.i18n.init();
          
          // Dodatkowa aktualizacja DOM po krótkiej przerwie
          setTimeout(() => {
            if (window.i18n.updateDOM) {
              window.i18n.updateDOM();
            }
          }, 50);
          
          resolve();
        } else {
          attempts++;
          if (attempts < maxAttempts) {
            setTimeout(checkI18n, 50);
          } else {
            console.warn('[Settings] Nie udało się załadować i18n po', maxAttempts, 'próbach');
            resolve(); // kontynuuj mimo braku i18n
          }
        }
      };
      checkI18n();
    });
  }

  setupEventListeners() {
    // Zmiana języka
    const languageSelector = document.getElementById('language-selector');
    if (languageSelector) {
      languageSelector.addEventListener('change', (e) => {
        this.changeLanguage(e.target.value);
      });
    }

    // Zmiana motywu
    const themeOptions = document.querySelectorAll('.theme-option');
    themeOptions.forEach(option => {
      option.addEventListener('click', (e) => {
        const theme = e.currentTarget.dataset.theme;
        this.changeTheme(theme);
      });
    });

    // Powiadomienia
    const notificationsToggle = document.getElementById('notifications-toggle');
    if (notificationsToggle) {
      notificationsToggle.addEventListener('change', (e) => {
        this.toggleNotifications(e.target.checked);
      });
    }

    // Eksport danych
    const exportData = document.getElementById('export-data');
    if (exportData) {
      exportData.addEventListener('click', () => {
        this.exportUserData();
      });
    }

    // Wyczyść dane
    const clearData = document.getElementById('clear-data');
    if (clearData) {
      clearData.addEventListener('click', () => {
        this.clearUserData();
      });
    }
  }



  loadCurrentSettings() {
    // Załaduj aktualny język
    const languageSelector = document.getElementById('language-selector');
    if (languageSelector && window.i18n) {
      languageSelector.value = window.i18n.getCurrentLanguage();
    }

    // Załaduj aktualny motyw
    this.updateThemeSelection();

    // Załaduj status powiadomień
    this.loadNotificationSettings();
    
    // Załaduj aktualną wersję aplikacji
    this.loadAppVersion();
  }

  // Pobierz wersję aplikacji z manifest.json
  async getAppVersion() {
    try {
      const response = await fetch('/manifest.json');
      const manifest = await response.json();
      return manifest.version || '1.0.0';
    } catch (error) {
      console.warn('[Settings] Nie udało się pobrać wersji z manifest.json:', error);
      return '1.0.0';
    }
  }

  // Załaduj wersję aplikacji z manifest.json
  async loadAppVersion() {
    const appVersion = await this.getAppVersion();
    
    const versionElement = document.querySelector('[data-i18n="settings.version"]');
    if (versionElement) {
      // Usuń atrybut data-i18n żeby nie był nadpisywany przez automatyczne tłumaczenia
      versionElement.removeAttribute('data-i18n');
      
      // Zaktualizuj tekst z parametrem wersji
      const versionText = window.i18n ? 
        window.i18n.t('settings.version', { version: appVersion }) : 
        `Wersja ${appVersion}`;
      
      versionElement.textContent = versionText;
      
      // Ustaw atrybut data dla przyszłych aktualizacji
      versionElement.setAttribute('data-version', appVersion);
    }
  }

  changeLanguage(language) {
    if (window.i18n) {
      window.i18n.setLanguage(language);
      this.showSuccessMessage(t('settings.languageChanged', { language }));
      
      // Zaktualizuj wersję po zmianie języka
      setTimeout(() => {
        this.updateVersionAfterLanguageChange();
      }, 100);
    }
  }

  // Zaktualizuj wyświetlanie wersji po zmianie języka
  updateVersionAfterLanguageChange() {
    const versionElement = document.querySelector('[data-version]');
    if (versionElement) {
      const appVersion = versionElement.getAttribute('data-version');
      if (appVersion && window.i18n) {
        const versionText = window.i18n.t('settings.version', { version: appVersion });
        versionElement.textContent = versionText;
      }
    }
  }

  changeTheme(theme) {
    if (window.darkModeManager) {
      if (theme === 'auto') {
        window.darkModeManager.setAutoMode();
      } else {
        window.darkModeManager.setTheme(theme);
      }
      this.updateThemeSelection();
      this.showSuccessMessage(t('settings.themeChanged', { theme: t(`settings.${theme}Theme`) }));
    }
  }



  updateThemeSelection() {
    const themeOptions = document.querySelectorAll('.theme-option');
    themeOptions.forEach(option => {
      option.classList.remove('active');
    });

    let currentTheme = 'auto';
    if (window.darkModeManager) {
      const savedTheme = localStorage.getItem('theme-preference');
      currentTheme = savedTheme || 'auto';
    }

    const activeOption = document.querySelector(`[data-theme="${currentTheme}"]`);
    if (activeOption) {
      activeOption.classList.add('active');
    }
  }

  toggleNotifications(enabled) {
    if (enabled) {
      this.requestNotificationPermission();
    } else {
      this.disableNotifications();
    }
  }

  async requestNotificationPermission() {
    if (!('Notification' in window)) {
      this.showErrorMessage(t('settings.notificationsNotSupported'));
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      const notificationsToggle = document.getElementById('notifications-toggle');
      
      if (permission === 'granted') {
        localStorage.setItem('notifications-enabled', 'true');
        if (notificationsToggle) notificationsToggle.checked = true;
        this.showSuccessMessage(t('settings.notificationsEnabled'));
      } else {
        localStorage.setItem('notifications-enabled', 'false');
        if (notificationsToggle) notificationsToggle.checked = false;
        this.showErrorMessage(t('settings.notificationsDenied'));
      }
    } catch (error) {
      console.error('[Settings] Błąd przy włączaniu powiadomień:', error);
      this.showErrorMessage(t('settings.notificationsError'));
    }
  }

  disableNotifications() {
    localStorage.setItem('notifications-enabled', 'false');
    this.showSuccessMessage(t('settings.notificationsDisabled'));
  }

  loadNotificationSettings() {
    const notificationsToggle = document.getElementById('notifications-toggle');
    if (notificationsToggle) {
      const enabled = localStorage.getItem('notifications-enabled') === 'true';
      const hasPermission = 'Notification' in window && Notification.permission === 'granted';
      notificationsToggle.checked = enabled && hasPermission;
    }
  }

  async exportUserData() {
    try {
      const appVersion = await this.getAppVersion();

      const data = {
        events: JSON.parse(localStorage.getItem('fete-lite-events') || '[]'),
        settings: {
          language: localStorage.getItem('fete-lite-language'),
          theme: localStorage.getItem('theme-preference'),
          notifications: localStorage.getItem('notifications-enabled')
        },
        exportDate: new Date().toISOString(),
        version: appVersion
      };

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `fete-lite-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      this.showSuccessMessage(t('settings.dataExported'));
    } catch (error) {
      console.error('[Settings] Błąd eksportu danych:', error);
      this.showErrorMessage(t('settings.exportError'));
    }
  }

  clearUserData() {
    const confirmation = confirm(t('settings.clearDataConfirm'));
    if (!confirmation) return;

    try {
      // Wyczyść wydarzenia
      localStorage.removeItem('fete-lite-events');
      localStorage.removeItem('fete-lite-sample-data');
      
      // Zachowaj ustawienia języka i motywu
      // localStorage.removeItem('fete-lite-language');
      // localStorage.removeItem('theme-preference');
      
      // Wyczyść powiadomienia
      localStorage.removeItem('notifications-enabled');

      this.showSuccessMessage(t('settings.dataCleared'));
      
      // Przekieruj na stronę główną po 2 sekundach
      setTimeout(() => {
        window.location.href = '/';
      }, 2000);
    } catch (error) {
      console.error('[Settings] Błąd czyszczenia danych:', error);
      this.showErrorMessage(t('settings.clearError'));
    }
  }

  showSuccessMessage(message) {
    this.showMessage(message, 'success');
  }

  showErrorMessage(message) {
    this.showMessage(message, 'error');
  }

  showMessage(message, type) {
    // Usuń poprzednie komunikaty
    const existingMessages = document.querySelectorAll('.settings-message');
    existingMessages.forEach(msg => msg.remove());

    // Utwórz nowy komunikat
    const messageEl = document.createElement('div');
    messageEl.className = `settings-message ${type}`;
    messageEl.innerHTML = `
      <span class="message-icon">${type === 'success' ? '✅' : '❌'}</span>
      <span class="message-text">${message}</span>
    `;

    // Dodaj na górę kontenera
    const container = document.querySelector('.settings-container');
    if (container) {
      container.insertBefore(messageEl, container.firstChild);

      // Usuń po 4 sekundach
      setTimeout(() => {
        messageEl.classList.add('fade-out');
        setTimeout(() => messageEl.remove(), 300);
      }, 4000);
    }
  }
}

// Inicjalizacja po załadowaniu DOM
document.addEventListener('DOMContentLoaded', async () => {
  window.settingsManager = new SettingsManager();
});

// Eksportuj dla dostępu globalnego
window.SettingsManager = SettingsManager;
