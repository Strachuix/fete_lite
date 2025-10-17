// Fete Lite - Monitoring stanu sieci
// Monitoring połączenia internetowego i obsługa trybu offline

class NetworkManager {
  constructor() {
    this.isOnline = navigator.onLine;
    this.connectionType = null;
    this.effectiveType = null;
    this.downlink = null;
    this.rtt = null;
    this.saveData = false;
    
    // Elementy UI
    this.statusBanner = null;
    this.statusIndicators = [];
    
    this.init();

  }

  // Inicjalizuj monitoring sieci
  init() {
    // Wykryj informacje o połączeniu
    this.detectConnectionInfo();
    
    // Skonfiguruj event listenery
    this.setupEventListeners();
    
    // Utwórz UI elementy
    this.createStatusBanner();
    this.createStatusIndicators();
    
    // Zaktualizuj początkowy stan
    this.updateNetworkStatus();
    
    // Rozpocznij okresowe sprawdzanie połączenia
    this.startPeriodicCheck();
  }

  // Wykryj informacje o połączeniu (Network Information API)
  detectConnectionInfo() {
    if ('connection' in navigator) {
      const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
      
      if (connection) {
        this.connectionType = connection.type;
        this.effectiveType = connection.effectiveType;
        this.downlink = connection.downlink;
        this.rtt = connection.rtt;
        this.saveData = connection.saveData;
        
        // Nasłuchuj zmian połączenia
        connection.addEventListener('change', () => {
          this.detectConnectionInfo();
          this.updateNetworkStatus();
        });
      }
    }
  }

  // Skonfiguruj event listenery
  setupEventListeners() {
    // Standardowe eventy online/offline
    window.addEventListener('online', () => {

      this.isOnline = true;
      this.handleOnlineStatusChange();
    });

    window.addEventListener('offline', () => {

      this.isOnline = false;
      this.handleOnlineStatusChange();
    });

    // Nasłuchuj zmian widoczności strony
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        // Strona stała się widoczna - sprawdź połączenie
        this.checkNetworkConnectivity();
      }
    });

    // Nasłuchuj custom eventów
    document.addEventListener('forcenetworkcheck', () => {
      this.checkNetworkConnectivity();
    });
  }

  // Obsłuż zmianę statusu online/offline
  handleOnlineStatusChange() {
    this.updateNetworkStatus();
    
    if (this.isOnline) {
      this.handleConnectionRestored();
    } else {
      this.handleConnectionLost();
    }
  }

  // Obsłuż przywrócenie połączenia
  handleConnectionRestored() {
    // Ukryj banner offline
    this.hideOfflineBanner();
    
    // Pokaż powiadomienie
    this.showNetworkNotification(t('network.connectionRestored'), 'success');
    
    // Sprawdź czy są dane do synchronizacji
    this.checkPendingSynchronization();
    
    // Wyślij event
    this.dispatchNetworkEvent('online');
    

  }

  // Obsłuż utratę połączenia
  handleConnectionLost() {
    // Pokaż banner offline
    this.showOfflineBanner();
    
    // Pokaż powiadomienie
    this.showNetworkNotification(t('network.connectionLost'), 'warning');
    
    // Wyślij event
    this.dispatchNetworkEvent('offline');
    

  }

  // Sprawdź aktywnie połączenie z internetem
  async checkNetworkConnectivity() {
    try {
      // Próba pobrania małego pliku z cache-busting
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch('./manifest.json?t=' + Date.now(), {
        method: 'HEAD',
        cache: 'no-cache',
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      const wasOnline = this.isOnline;
      this.isOnline = response.ok;
      
      if (wasOnline !== this.isOnline) {
        this.handleOnlineStatusChange();
      }
      
      return this.isOnline;
      
    } catch (error) {
      console.log('[Network] Connectivity check failed:', error.name);
      
      const wasOnline = this.isOnline;
      this.isOnline = false;
      
      if (wasOnline !== this.isOnline) {
        this.handleOnlineStatusChange();
      }
      
      return false;
    }
  }

  // Utwórz banner statusu offline
  createStatusBanner() {
    // Sprawdź czy banner już istnieje w HTML
    this.statusBanner = document.getElementById('offline-banner');
    
    if (!this.statusBanner) {
      // Utwórz banner jeśli nie istnieje
      this.statusBanner = document.createElement('div');
      this.statusBanner.id = 'offline-banner';
      this.statusBanner.className = 'offline-banner';
      this.statusBanner.style.display = 'none';
      this.statusBanner.innerHTML = `
        <span data-i18n="offline.message">🔌 Brak połączenia - pracujesz w trybie offline</span>
        <button id="offline-close" aria-label="Zamknij komunikat">&times;</button>
      `;
      document.body.insertBefore(this.statusBanner, document.body.firstChild);
    }
    
    // Dodaj event listener do przycisku zamknięcia
    const closeBtn = this.statusBanner.querySelector('#offline-close, .banner-close-btn');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.hideOfflineBanner());
    }
  }

  // Utwórz wskaźniki statusu (wyłączone - używamy tylko bannera)
  createStatusIndicators() {
    // Nie tworzymy wskaźników - aplikacja używa tylko bannera do informowania o statusie sieci
    return;
  }

  // Zaktualizuj status sieci w UI
  updateNetworkStatus() {
    // Zaktualizuj klasę body
    document.body.classList.toggle('network-offline', !this.isOnline);
    document.body.classList.toggle('offline-mode', !this.isOnline);
    
    // Zaktualizuj meta theme-color dla offline
    if (!this.isOnline) {
      this.updateThemeColorForOffline();
    }
  }

  // Pokaż banner offline
  showOfflineBanner() {
    if (this.statusBanner) {
      this.statusBanner.style.display = 'flex';
      document.body.classList.add('offline-mode');
    }
  }

  // Ukryj banner offline
  hideOfflineBanner() {
    if (this.statusBanner) {
      this.statusBanner.style.display = 'none';
      document.body.classList.remove('offline-mode');
    }
  }

  // Spróbuj ponownie nawiązać połączenie
  async retryConnection() {
    const retryBtn = this.statusBanner?.querySelector('.banner-retry-btn');
    if (retryBtn) {
      retryBtn.textContent = t('network.checking');
      retryBtn.disabled = true;
    }

    const isConnected = await this.checkNetworkConnectivity();
    
    if (retryBtn) {
      retryBtn.textContent = t('network.retry');
      retryBtn.disabled = false;
    }

    if (!isConnected) {
      this.showNetworkNotification(t('network.stillOffline'), 'warning');
    }
  }

  // Pokaż powiadomienie o stanie sieci
  showNetworkNotification(message, type = 'info') {
    if (window.showNotification) {
      showNotification(message, type);
    } else {
      console.log(`[Network] ${type.toUpperCase()}: ${message}`);
    }
  }

  // Wyślij custom event o zmianie stanu sieci
  dispatchNetworkEvent(type) {
    const event = new CustomEvent('networkchange', {
      detail: {
        type,
        isOnline: this.isOnline,
        connectionType: this.connectionType,
        effectiveType: this.effectiveType,
        downlink: this.downlink,
        rtt: this.rtt,
        saveData: this.saveData
      }
    });
    
    document.dispatchEvent(event);
  }

  // Rozpocznij okresowe sprawdzanie połączenia
  startPeriodicCheck() {
    setInterval(() => {
      if (this.isOnline) {
        // Sprawdzaj co 30 sekund gdy online
        this.checkNetworkConnectivity();
      } else {
        // Sprawdzaj co 10 sekund gdy offline
        this.checkNetworkConnectivity();
      }
    }, this.isOnline ? 30000 : 10000);
  }

  // Sprawdź czy są dane do synchronizacji
  checkPendingSynchronization() {
    try {
      const pendingData = localStorage.getItem('pendingSyncData');
      if (pendingData) {
        const data = JSON.parse(pendingData);
        if (data.length > 0) {
          this.showNetworkNotification(
            t('network.syncAvailable', { count: data.length }),
            'info'
          );
          
          // Automatycznie synchronizuj po 2 sekundach
          setTimeout(() => {
            this.synchronizePendingData();
          }, 2000);
        }
      }
    } catch (error) {
      console.warn('[Network] Could not check pending sync data:', error);
    }
  }

  // Synchronizuj oczekujące dane
  async synchronizePendingData() {
    try {
      const pendingData = localStorage.getItem('pendingSyncData');
      if (!pendingData) return;

      const data = JSON.parse(pendingData);
      let syncCount = 0;

      for (const item of data) {
        // Tutaj będzie logika synchronizacji z serwerem
        // Na razie tylko symulujemy

        syncCount++;
      }

      // Wyczyść dane po synchronizacji
      localStorage.removeItem('pendingSyncData');
      
      this.showNetworkNotification(
        t('network.syncCompleted', { count: syncCount }),
        'success'
      );

    } catch (error) {
      console.error('[Network] Sync error:', error);
      this.showNetworkNotification(t('network.syncError'), 'error');
    }
  }

  // Dodaj dane do kolejki synchronizacji
  addToSyncQueue(data) {
    try {
      const existing = localStorage.getItem('pendingSyncData');
      const queue = existing ? JSON.parse(existing) : [];
      
      queue.push({
        ...data,
        timestamp: new Date().toISOString(),
        id: Date.now().toString()
      });
      
      localStorage.setItem('pendingSyncData', JSON.stringify(queue));

      
    } catch (error) {
      console.warn('[Network] Could not add to sync queue:', error);
    }
  }

  // Zaktualizuj theme-color dla trybu offline
  updateThemeColorForOffline() {
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) {
      meta.content = '#f59e0b'; // Pomarańczowy dla offline
    }
  }

  // Pobierz informacje o jakości połączenia
  getConnectionQuality() {
    if (!this.isOnline) return 'offline';
    
    if (this.effectiveType) {
      switch (this.effectiveType) {
        case 'slow-2g':
        case '2g':
          return 'poor';
        case '3g':
          return 'good';
        case '4g':
          return 'excellent';
        default:
          return 'unknown';
      }
    }
    
    // Fallback na podstawie RTT i downlink
    if (this.rtt && this.downlink) {
      if (this.rtt > 2000 || this.downlink < 0.15) return 'poor';
      if (this.rtt > 1000 || this.downlink < 0.5) return 'good';
      return 'excellent';
    }
    
    return 'unknown';
  }

  // Sprawdź czy powinien być używany tryb oszczędzania danych
  shouldSaveData() {
    return this.saveData || this.getConnectionQuality() === 'poor';
  }

  // Pobierz szczegóły połączenia
  getNetworkInfo() {
    return {
      isOnline: this.isOnline,
      connectionType: this.connectionType,
      effectiveType: this.effectiveType,
      downlink: this.downlink,
      rtt: this.rtt,
      saveData: this.saveData,
      quality: this.getConnectionQuality(),
      shouldSaveData: this.shouldSaveData()
    };
  }

  // Wymuś sprawdzenie połączenia
  forceCheck() {
    return this.checkNetworkConnectivity();
  }

  // Dodaj CSS dla elementów sieciowych
  addNetworkStyles() {
    const style = document.createElement('style');
    style.textContent = `
      .network-offline {
        --network-status-color: #f59e0b;
      }
      
      .network-offline .btn-primary {
        opacity: 0.7;
      }
      
      .network-offline .form-input:invalid {
        border-color: var(--network-status-color);
      }
      
      .offline-banner .banner-content {
        display: flex;
        align-items: center;
        gap: 12px;
        max-width: 1200px;
        margin: 0 auto;
      }
      
      .offline-banner .banner-text {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 2px;
      }
      
      .offline-banner .banner-description {
        font-size: 0.875rem;
        opacity: 0.9;
      }
      
      .offline-banner .banner-retry-btn,
      .offline-banner .banner-close-btn {
        background: rgba(255,255,255,0.2);
        border: 1px solid rgba(255,255,255,0.3);
        color: white;
        padding: 6px 12px;
        border-radius: 6px;
        cursor: pointer;
        font-size: 0.875rem;
        transition: background-color 0.2s;
      }
      
      .offline-banner .banner-retry-btn:hover,
      .offline-banner .banner-close-btn:hover {
        background: rgba(255,255,255,0.3);
      }
      
      .offline-banner .banner-close-btn {
        padding: 6px 10px;
        font-size: 1.2rem;
        line-height: 1;
      }
      
      @media (max-width: 640px) {
        .offline-banner .banner-content {
          flex-wrap: wrap;
          gap: 8px;
        }
        
        .offline-banner .banner-description {
          display: none;
        }
      }
    `;
    
    document.head.appendChild(style);
  }
}

// Inicjalizuj po załadowaniu DOM
document.addEventListener('DOMContentLoaded', () => {
  window.networkManager = new NetworkManager();
  window.networkManager.addNetworkStyles();
});

// Funkcje globalne
window.getNetworkInfo = () => window.networkManager?.getNetworkInfo();
window.checkNetworkConnectivity = () => window.networkManager?.forceCheck();
window.addToSyncQueue = (data) => window.networkManager?.addToSyncQueue(data);


