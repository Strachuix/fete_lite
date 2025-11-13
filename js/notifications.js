// Fete Lite - System powiadomień push
// Implementacja push notifications z zarządzaniem uprawnieniami

class NotificationManager {
  constructor() {
    this.isSupported = 'Notification' in window;
    this.permission = this.isSupported ? Notification.permission : 'denied';
    this.registration = null;
    this.subscription = null;
    
    // Konfiguracja
    this.vapidPublicKey = 'BEl62iUYgUivxIkv69yViEuiBIa40HcCWKpjHKTXCJllDSo7P2UJPsjyNFtCd3sF-fBdcpLNMWZsRYdcg7Oq8R8'; // Demo klucz
    this.notificationEndpoint = '/api/notifications'; // Endpoint serwera
    
    this.init();

  }

  // Inicjalizuj system powiadomień
  init() {
    if (!this.isSupported) {
      console.warn('[Notifications] Push notifications not supported');
      return;
    }

    // Załaduj zapisane ustawienia
    this.loadSettings();
    
    // Skonfiguruj UI
    this.setupUI();
    
    // Sprawdź Service Worker
    this.checkServiceWorker();
    
    // Zaplanuj powiadomienia o wydarzeniach
    this.scheduleEventNotifications();
  }

  // Załaduj ustawienia powiadomień
  loadSettings() {
    try {
      const settings = localStorage.getItem('notificationSettings');
      if (settings) {
        this.settings = JSON.parse(settings);
      } else {
        this.settings = {
          enabled: false,
          eventReminders: true,
          newEvents: false,
          beforeMinutes: 60, // Powiadom 1h przed wydarzeniem
          dailyDigest: false,
          digestTime: '09:00'
        };
        this.saveSettings();
      }
    } catch (error) {
      console.warn('[Notifications] Could not load settings:', error);
      this.settings = {};
    }
  }

  // Zapisz ustawienia powiadomień
  saveSettings() {
    try {
      localStorage.setItem('notificationSettings', JSON.stringify(this.settings));
    } catch (error) {
      console.warn('[Notifications] Could not save settings:', error);
    }
  }

  // Sprawdź dostępność Service Worker
  async checkServiceWorker() {
    if ('serviceWorker' in navigator) {
      try {
        this.registration = await navigator.serviceWorker.ready;

        
        // Sprawdź istniejącą subskrypcję
        this.subscription = await this.registration.pushManager.getSubscription();
        if (this.subscription) {

          this.settings.enabled = true;
          this.saveSettings();
        }
        
      } catch (error) {
        console.error('[Notifications] Service Worker error:', error);
      }
    }
  }

  // Poproś o uprawnienia
  async requestPermission() {
    if (!this.isSupported) {
      throw new Error('Notifications not supported');
    }

    // Jeśli już mamy uprawnienia
    if (this.permission === 'granted') {
      return true;
    }

    // Jeśli zostały odrzucone
    if (this.permission === 'denied') {
      throw new Error('Notifications denied by user');
    }

    // Poproś o uprawnienia
    const permission = await Notification.requestPermission();
    this.permission = permission;

    if (permission === 'granted') {

      await this.subscribeToPush();
      return true;
    } else if (permission === 'denied') {

      throw new Error('Notifications denied by user');
    } else {

      throw new Error('Permission request dismissed');
    }
  }

  // Subskrybuj push notifications
  async subscribeToPush() {
    if (!this.registration) {
      throw new Error('Service Worker not available');
    }

    try {
      // Utwórz subskrypcję
      this.subscription = await this.registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlB64ToUint8Array(this.vapidPublicKey)
      });


      
      // Wyślij subskrypcję do serwera (w prawdziwej aplikacji)
      await this.sendSubscriptionToServer(this.subscription);
      
      this.settings.enabled = true;
      this.saveSettings();
      
      return this.subscription;
      
    } catch (error) {
      console.error('[Notifications] Subscription error:', error);
      throw error;
    }
  }

  // Wyślij subskrypcję do serwera
  async sendSubscriptionToServer(subscription) {
    // W prawdziwej aplikacji tutaj byłby fetch do serwera

    
    // Symulacja
    return new Promise(resolve => setTimeout(resolve, 500));
  }

  // Anuluj subskrypcję
  async unsubscribe() {
    if (this.subscription) {
      try {
        await this.subscription.unsubscribe();
        this.subscription = null;
        this.settings.enabled = false;
        this.saveSettings();
        

        
        // Powiadom serwer o anulowaniu (w prawdziwej aplikacji)
        return true;
        
      } catch (error) {
        console.error('[Notifications] Unsubscribe error:', error);
        return false;
      }
    }
    return true;
  }

  // Włącz powiadomienia
  async enableNotifications() {
    try {
      await this.requestPermission();
      this.updateUI();
      showNotification(t('notifications.enabled'), 'success');
      return true;
    } catch (error) {
      console.error('[Notifications] Enable error:', error);
      this.showPermissionHelp();
      return false;
    }
  }

  // Wyłącz powiadomienia
  async disableNotifications() {
    try {
      await this.unsubscribe();
      this.updateUI();
      showNotification(t('notifications.disabled'), 'info');
      return true;
    } catch (error) {
      console.error('[Notifications] Disable error:', error);
      return false;
    }
  }

  // Pokaż lokalne powiadomienie
  showLocalNotification(title, options = {}) {
    if (!this.isSupported || this.permission !== 'granted') {
      console.warn('[Notifications] Cannot show notification - no permission');
      return null;
    }

    const defaultOptions = {
      icon: './images/icons/icon-192x192.png',
      badge: './images/icons/icon-72x72.png',
      vibrate: [100, 50, 100],
      data: {
        timestamp: Date.now()
      },
      actions: []
    };

    const finalOptions = { ...defaultOptions, ...options };
    
    try {
      const notification = new Notification(title, finalOptions);
      
      // Auto-zamknij po 5 sekundach jeśli nie określono inaczej
      if (!options.requireInteraction) {
        setTimeout(() => {
          notification.close();
        }, 5000);
      }
      
      return notification;
      
    } catch (error) {
      console.error('[Notifications] Show notification error:', error);
      return null;
    }
  }

  // Zaplanuj powiadomienia o wydarzeniach
  scheduleEventNotifications() {
    if (!this.settings.enabled || !this.settings.eventReminders) {
      return;
    }

    // Pobierz wydarzenia z najbliższych 24 godzin
    const events = window.storageManager?.getAllEvents() || [];
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    events.forEach(event => {
      const eventDate = new Date(event.startDate);
      
      // Sprawdź czy wydarzenie jest w najbliższych 24h
      if (eventDate > now && eventDate < tomorrow) {
        this.scheduleEventReminder(event);
      }
    });
  }

  // Zaplanuj przypomnienie o wydarzeniu
  scheduleEventReminder(event) {
    const eventDate = new Date(event.startDate);
    const reminderTime = new Date(eventDate.getTime() - (this.settings.beforeMinutes * 60 * 1000));
    const now = new Date();

    if (reminderTime > now) {
      const timeUntilReminder = reminderTime.getTime() - now.getTime();
      
      setTimeout(() => {
        this.showEventReminder(event);
      }, timeUntilReminder);
      

    }
  }

  // Pokaż przypomnienie o wydarzeniu
  showEventReminder(event) {
    const eventDate = new Date(event.startDate);
    const timeString = eventDate.toLocaleTimeString('pl-PL', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });

    this.showLocalNotification(
      t('notifications.eventReminder'),
      {
        body: t('notifications.eventStartsAt', { 
          title: event.title, 
          time: timeString 
        }),
        tag: `event-${event.id}`,
        data: {
          type: 'event-reminder',
          eventId: event.id
        },
        actions: [
          {
            action: 'view',
            title: t('notifications.viewEvent')
          },
          {
            action: 'dismiss',
            title: t('notifications.dismiss')
          }
        ]
      }
    );
  }

  // Pokaż powiadomienie o nowym wydarzeniu
  showNewEventNotification(event) {
    if (!this.settings.enabled || !this.settings.newEvents) {
      return;
    }

    this.showLocalNotification(
      t('notifications.newEvent'),
      {
        body: t('notifications.newEventCreated', { title: event.title }),
        tag: `new-event-${event.id}`,
        data: {
          type: 'new-event',
          eventId: event.id
        }
      }
    );
  }

  // Skonfiguruj UI powiadomień
  setupUI() {
    // Aktualizuj UI
    this.updateUI();
  }

  // Dodaj przełącznik powiadomień


  // Pokaż modal ustawień powiadomień
  showNotificationSettings() {
    const modal = document.createElement('div');
    modal.className = 'notification-settings-modal';
    modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h3>${t('notifications.settings')}</h3>
          <button class="modal-close">&times;</button>
        </div>
        <div class="modal-body">
          <div class="setting-group">
            <h4>${t('notifications.eventReminders')}</h4>
            <label class="setting-item">
              <span>${t('notifications.enableReminders')}</span>
              <input type="checkbox" id="setting-event-reminders" ${this.settings.eventReminders ? 'checked' : ''}>
            </label>
            <label class="setting-item">
              <span>${t('notifications.reminderTime')}</span>
              <select id="setting-before-minutes">
                <option value="15" ${this.settings.beforeMinutes === 15 ? 'selected' : ''}>15 ${t('notifications.minutesBefore')}</option>
                <option value="30" ${this.settings.beforeMinutes === 30 ? 'selected' : ''}>30 ${t('notifications.minutesBefore')}</option>
                <option value="60" ${this.settings.beforeMinutes === 60 ? 'selected' : ''}>1 ${t('notifications.hourBefore')}</option>
                <option value="120" ${this.settings.beforeMinutes === 120 ? 'selected' : ''}>2 ${t('notifications.hoursBefore')}</option>
              </select>
            </label>
          </div>
          
          <div class="setting-group">
            <h4>${t('notifications.other')}</h4>
            <label class="setting-item">
              <span>${t('notifications.newEvents')}</span>
              <input type="checkbox" id="setting-new-events" ${this.settings.newEvents ? 'checked' : ''}>
            </label>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-primary" id="save-notification-settings">
            ${t('common.save')}
          </button>
          <button class="btn btn-secondary modal-close">
            ${t('common.cancel')}
          </button>
        </div>
      </div>
    `;

    // Style inline
    Object.assign(modal.style, {
      position: 'fixed',
      top: '0',
      left: '0',
      right: '0',
      bottom: '0',
      background: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: '10000'
    });

    document.body.appendChild(modal);

    // Event listenery
    modal.querySelectorAll('.modal-close').forEach(btn => {
      btn.addEventListener('click', () => modal.remove());
    });

    modal.querySelector('#save-notification-settings').addEventListener('click', () => {
      this.saveNotificationSettings(modal);
      modal.remove();
    });
  }

  // Zapisz ustawienia z modala
  saveNotificationSettings(modal) {
    this.settings.eventReminders = modal.querySelector('#setting-event-reminders').checked;
    this.settings.beforeMinutes = parseInt(modal.querySelector('#setting-before-minutes').value);
    this.settings.newEvents = modal.querySelector('#setting-new-events').checked;
    
    this.saveSettings();
    showNotification(t('notifications.settingsSaved'), 'success');
    
    // Zaplanuj ponownie powiadomienia z nowymi ustawieniami
    this.scheduleEventNotifications();
  }

  // Aktualizuj UI
  updateUI() {
    // Sprawdź przełącznik w ustawieniach
    const toggle = document.getElementById('notifications-toggle');
    if (toggle) {
      toggle.checked = this.settings.enabled;
    }
  }

  // Pokaż pomoc dotyczącą uprawnień
  showPermissionHelp() {
    const helpText = this.permission === 'denied' 
      ? t('notifications.permissionDeniedHelp')
      : t('notifications.permissionHelp');
      
    showNotification(helpText, 'info', 8000);
  }

  // Konwertuj klucz VAPID
  urlB64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  // Sprawdź czy powiadomienia są włączone
  isEnabled() {
    return this.settings.enabled && this.permission === 'granted';
  }

  // Pobierz status powiadomień
  getStatus() {
    return {
      supported: this.isSupported,
      permission: this.permission,
      enabled: this.settings.enabled,
      hasSubscription: !!this.subscription,
      settings: { ...this.settings }
    };
  }

  testNotification() {
    this.showLocalNotification(
      t('notifications.test'),
      {
        body: t('notifications.testMessage'),
        tag: 'test-notification'
      }
    );
  }


}

// Inicjalizuj po załadowaniu DOM
document.addEventListener('DOMContentLoaded', () => {
  window.notificationManager = new NotificationManager();
});

// Obsługa powiadomień w Service Worker (jeśli dostępny)
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.addEventListener('message', event => {
    if (event.data && event.data.type === 'notification-click') {
      const { action, eventId } = event.data;
      
      if (action === 'view' && eventId) {
        // Otwórz szczegóły wydarzenia
        window.location.href = `./event-details.html?id=${eventId}`;
      }
    }
  });
}

// Funkcje globalne
window.enableNotifications = () => window.notificationManager?.enableNotifications();
window.disableNotifications = () => window.notificationManager?.disableNotifications();
window.testNotification = () => window.notificationManager?.testNotification();
window.getNotificationStatus = () => window.notificationManager?.getStatus();
window.showNotificationSettings = () => window.notificationManager?.showNotificationSettings();

// Funkcja do skonfigurowania przycisku powiadomień - USUNIĘTO
// Przycisk powiadomień został usunięty z nawigacji

// Inicjalizacja przycisku została usunięta
// Powiadomienia są nadal dostępne przez sekcję ustawień


