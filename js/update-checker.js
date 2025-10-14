// Fete Lite - Update Checker
// Sprawdzanie aktualności aplikacji z obsługą międzynarodową (i18n)

class UpdateChecker {
  constructor() {
    this.currentVersion = '1.0.2'; // Aktualna wersja aplikacji
    this.checkInterval = 5 * 60 * 1000; // 5 minut
    this.lastCheck = null;
    this.isChecking = false;
    this.updateAvailable = false;
    
    this.init();
  }

  async init() {
    // Sprawdź od razu przy starcie (jeśli online)
    if (navigator.onLine) {
      await this.checkForUpdates();
    }
    
    // Ustaw interwał sprawdzania
    this.setupPeriodicCheck();
    
    // Nasłuchuj zmian statusu połączenia
    this.setupConnectionListener();
    
    // Nasłuchuj focus na oknie (sprawdź po powrocie do aplikacji)
    this.setupFocusListener();
  }

  // Główna funkcja sprawdzania aktualizacji
  async checkForUpdates(showNotification = true) {
    if (this.isChecking || !navigator.onLine) {
      return false;
    }

    this.isChecking = true;
    this.lastCheck = Date.now();
    
    try {
      // Sprawdź wersję na serwerze
      const serverVersion = await this.getServerVersion();
      
      if (this.isNewerVersion(serverVersion, this.currentVersion)) {
        this.updateAvailable = true;
        
        if (showNotification) {
          this.showUpdateNotification(serverVersion);
        }
        
        return true;
      } else {

        this.updateAvailable = false;
        return false;
      }
      
    } catch (error) {
      console.warn('[UpdateChecker] Błąd sprawdzania aktualizacji:', error.message);
      return false;
    } finally {
      this.isChecking = false;
    }
  }

  // Pobierz wersję z serwera
  async getServerVersion() {
    // Sprawdź manifest.json - zawiera informacje o aplikacji
    const manifestResponse = await fetch('./manifest.json?t=' + Date.now(), {
      method: 'GET',
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    });

    if (!manifestResponse.ok) {
      throw new Error(`HTTP ${manifestResponse.status}: ${manifestResponse.statusText}`);
    }

    const manifest = await manifestResponse.json();
    
    // Jeśli manifest ma wersję, użyj jej
    if (manifest.version) {
      return manifest.version;
    }

    // Alternatywnie sprawdź Service Worker
    return await this.getServiceWorkerVersion();
  }

  // Pobierz wersję z Service Worker
  async getServiceWorkerVersion() {
    const swResponse = await fetch('./service-worker.js?t=' + Date.now(), {
      method: 'GET',
      headers: {
        'Cache-Control': 'no-cache'
      }
    });

    if (!swResponse.ok) {
      throw new Error('Nie można pobrać Service Worker');
    }

    const swContent = await swResponse.text();
    
    // Szukaj CACHE_VERSION w kodzie Service Worker
    const versionMatch = swContent.match(/CACHE_VERSION\s*=\s*['"`]([^'"`]+)['"`]/);
    
    if (versionMatch) {
      return versionMatch[1];
    }

    // Fallback - użyj hash pliku
    return this.calculateHash(swContent).substring(0, 8);
  }

  // Sprawdź czy wersja jest nowsza
  isNewerVersion(serverVersion, currentVersion) {
    // Porównaj wersje semantyczne (x.y.z)
    const parseVersion = (version) => {
      return version.split('.').map(num => parseInt(num, 10));
    };

    const server = parseVersion(serverVersion);
    const current = parseVersion(currentVersion);

    for (let i = 0; i < Math.max(server.length, current.length); i++) {
      const s = server[i] || 0;
      const c = current[i] || 0;
      
      if (s > c) return true;
      if (s < c) return false;
    }

    return false; // Równe wersje
  }

  // Oblicz hash dla zawartości
  calculateHash(content) {
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16);
  }

  // Pokaż powiadomienie o dostępnej aktualizacji
  showUpdateNotification(newVersion) {
    // Usuń poprzednie powiadomienie jeśli istnieje
    const existing = document.getElementById('update-notification');
    if (existing) {
      existing.remove();
    }

    const notification = document.createElement('div');
    notification.id = 'update-notification';
    notification.className = 'update-notification slide-in-down';
    notification.innerHTML = `
      <div class="update-content">
        <div class="update-icon">⚡</div>
        <div class="update-message">
          <strong>${window.t ? window.t('update.available') : 'Dostępna aktualizacja!'}</strong>
          <p>${window.t ? window.t('update.newVersionReady', {version: newVersion}) : `Nowa wersja ${newVersion} jest gotowa`}</p>
        </div>
        <div class="update-actions">
          <button id="update-now" class="btn btn-primary btn-sm">
            ${window.t ? window.t('update.updateNow') : 'Zaktualizuj'}
          </button>
          <button id="update-dismiss" class="btn btn-secondary btn-sm">
            ${window.t ? window.t('update.updateLater') : 'Później'}
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(notification);

    // Event listenery dla przycisków
    document.getElementById('update-now').addEventListener('click', () => {
      this.performUpdate();
    });

    document.getElementById('update-dismiss').addEventListener('click', () => {
      this.dismissUpdateNotification();
    });

    // Auto-dismiss po 30 sekundach
    setTimeout(() => {
      if (document.getElementById('update-notification')) {
        this.dismissUpdateNotification();
      }
    }, 30000);
  }

  // Ukryj powiadomienie o aktualizacji
  dismissUpdateNotification() {
    const notification = document.getElementById('update-notification');
    if (notification) {
      notification.classList.add('slide-out-up');
      setTimeout(() => {
        if (notification.parentNode) {
          notification.remove();
        }
      }, 300);
    }
  }

  // Wykonaj aktualizację
  async performUpdate() {

    
    this.dismissUpdateNotification();
    
    // Pokaż loading
    this.showUpdateProgress();
    
    try {
      // Wyczyść cache Service Worker
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        // Wyślij wiadomość do SW żeby się zaktualizował
        navigator.serviceWorker.controller.postMessage({
          type: 'SKIP_WAITING'
        });
      }

      // Wyczyść cache przeglądarki
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames.map(cacheName => caches.delete(cacheName))
        );
      }

      // Przeładuj stronę
      setTimeout(() => {
        window.location.reload(true);
      }, 1000);
      
    } catch (error) {
      console.error('[UpdateChecker] Błąd aktualizacji:', error);
      this.showUpdateError();
    }
  }

  // Pokaż progress aktualizacji
  showUpdateProgress() {
    const progress = document.createElement('div');
    progress.id = 'update-progress';
    progress.className = 'update-progress';
    progress.innerHTML = `
      <div class="update-spinner">
        <div class="spinner"></div>
      </div>
      <p>${window.t ? window.t('update.updating') : 'Aktualizowanie aplikacji...'}</p>
    `;
    document.body.appendChild(progress);
  }

  // Pokaż błąd aktualizacji
  showUpdateError() {
    const existing = document.getElementById('update-progress');
    if (existing) {
      existing.remove();
    }

    const error = document.createElement('div');
    error.className = 'update-error';
    error.innerHTML = `
      <p>${window.t ? window.t('update.error') : '❌ Błąd aktualizacji. Spróbuj ponownie później.'}</p>
    `;
    document.body.appendChild(error);

    setTimeout(() => {
      if (error.parentNode) {
        error.remove();
      }
    }, 5000);
  }

  // Ustaw okresowe sprawdzanie
  setupPeriodicCheck() {
    setInterval(async () => {
      if (navigator.onLine) {
        await this.checkForUpdates(true);
      }
    }, this.checkInterval);
  }

  // Nasłuchuj zmian połączenia
  setupConnectionListener() {
    window.addEventListener('online', async () => {

      // Sprawdź po krótkim opóźnieniu
      setTimeout(async () => {
        await this.checkForUpdates(true);
      }, 2000);
    });
  }

  // Nasłuchuj focus na oknie
  setupFocusListener() {
    let lastFocusCheck = 0;
    
    window.addEventListener('focus', async () => {
      const now = Date.now();
      
      // Sprawdzaj tylko jeśli minęło więcej niż 5 minut od ostatniego sprawdzenia
      if (now - lastFocusCheck > 5 * 60 * 1000 && navigator.onLine) {
        lastFocusCheck = now;

        await this.checkForUpdates(true);
      }
    });
  }

  // API publiczne
  async manualCheck() {
    return await this.checkForUpdates(true);
  }

  getStatus() {
    return {
      currentVersion: this.currentVersion,
      lastCheck: this.lastCheck,
      isChecking: this.isChecking,
      updateAvailable: this.updateAvailable,
      isOnline: navigator.onLine
    };
  }
}

// Inicjalizuj checker gdy DOM jest gotowy
document.addEventListener('DOMContentLoaded', () => {
  if (window.location.pathname !== '/auth.html') {
    window.updateChecker = new UpdateChecker();
  }
});

// Export dla innych modułów
if (typeof module !== 'undefined' && module.exports) {
  module.exports = UpdateChecker;
}
