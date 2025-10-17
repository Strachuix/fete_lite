// Fete Lite - Sample Data
// Przykładowe wydarzenia do demonstracji funkcjonalności aplikacji

class SampleDataManager {
  constructor() {
    this.sampleEvents = [];
    this.isDataLoaded = false;
    this.initializeSampleData();

  }

  // Inicjalizuj przykładowe dane
  initializeSampleData() {
    this.sampleEvents = this.generateSampleEvents();

  }

  // Generuj unikalny 8-znakowy kod zaproszenia
  generateSampleInviteCode(index) {
    // Generuj deterministyczne kody dla przykładowych wydarzeń
    const codes = [
      'DEMO2024',  // Urodziny Ani
      'JAZZ2024',  // Koncert Jazz
      'TECH2024',  // Konferencja Tech
      'WEDD2024',  // Ślub
      'BBQ12024',  // BBQ
      'FOTO2024',  // Warsztaty
      'KINO2024',  // Kino pod gwiazdami
      'PAST2024'   // Piknik (zakończony)
    ];
    return codes[index] || `DEMO${String(index).padStart(4, '0')}`;
  }

  // Wygeneruj przykładowe wydarzenia
  generateSampleEvents() {
    const now = new Date();
    const sampleData = [
      {
        id: 'demo-birthday-party',
        title: 'Urodziny Ani 🎂',
        description: 'Świętujemy 25. urodziny Ani! Będą torty, gry i świetna muzyka. Zapraszamy wszystkich przyjaciół na niezapomnianą imprezę.',
        location: 'ul. Słoneczna 15, Warszawa',
        coordinates: { lat: 52.2297, lng: 21.0122 },
        startDate: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString(), // Za 3 dni
        endDate: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000).toISOString(), // 4 godziny później
        options: ['food', 'drinks', 'music', 'games'],
        organizerId: 'demo-user-1',
        organizerName: 'Anna Kowalska',
        invitationCode: this.generateSampleInviteCode(0),
        createdAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 dni temu
        updatedAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 dni temu
        isSample: true,
        sampleNote: 'Przykład prywatnej imprezy urodzinowej z lokalizacją i wieloma opcjami'
      },
      {
        id: 'demo-concert',
        title: 'Koncert Jazz w Parku 🎷',
        description: 'Bezpłatny koncert jazzowy w parku. Wystąpią lokalni muzycy z repertuarem klasycznego i nowoczesnego jazzu. Zabierz koc i ciesz się muzyką pod gwiazdami.',
        location: 'Park Łazienkowski, Warszawa',
        coordinates: { lat: 52.2148, lng: 21.0289 },
        startDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(), // Za tydzień
        endDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString(), // 2 godziny później
        options: ['music'],
        organizerId: 'demo-user-2',
        organizerName: 'Jazz Club Warszawa',
        invitationCode: this.generateSampleInviteCode(1),
        createdAt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        isSample: true,
        sampleNote: 'Przykład wydarzenia kulturalnego bez opcji jedzenia czy zakwaterowania'
      },
      {
        id: 'demo-conference',
        title: 'Konferencja Tech Warsaw 2024 💻',
        description: 'Największa konferencja technologiczna w Warszawie. Prelegenci z całego świata, warsztaty, networking i najnowsze trendy w IT. Rejestracja wymagana.',
        location: 'Centrum Konferencyjne Golden Floor Tower, Warszawa',
        coordinates: { lat: 52.2319, lng: 21.0067 },
        startDate: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString(), // Za 2 tygodnie
        endDate: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000 + 8 * 60 * 60 * 1000).toISOString(), // 8 godzin później
        options: ['food', 'drinks', 'accommodation'],
        organizerId: 'demo-user-3',
        organizerName: 'Tech Events Sp. z o.o.',
        invitationCode: this.generateSampleInviteCode(2),
        createdAt: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        isSample: true,
        sampleNote: 'Przykład profesjonalnego wydarzenia biznesowego z opcjami zakwaterowania'
      },
      {
        id: 'demo-wedding',
        title: 'Ślub Magdy i Tomka 💍',
        description: 'Zapraszamy na nasz ślub! Ceremonia w kościele o 15:00, potem wesele w sali. Dress code: elegancki. Prosimy o potwierdzenie uczestnictwa.',
        location: 'Restauracja Pod Różą, ul. Kwiatowa 22, Warszawa',
        coordinates: { lat: 52.2206, lng: 21.0058 },
        startDate: new Date(now.getTime() + 21 * 24 * 60 * 60 * 1000).toISOString(), // Za 3 tygodnie
        endDate: new Date(now.getTime() + 22 * 24 * 60 * 60 * 1000).toISOString(), // Następnego dnia
        options: ['food', 'drinks', 'alcohol', 'music'],
        organizerId: 'demo-user-4',
        organizerName: 'Magda i Tomek',
        invitationCode: this.generateSampleInviteCode(3),
        createdAt: new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        isSample: true,
        sampleNote: 'Przykład wielodniowego wydarzenia z alkoholem i muzyką'
      },
      {
        id: 'demo-bbq',
        title: 'BBQ nad Wisłą 🔥',
        description: 'Grillowanie nad Wisłą! Każdy przynosi coś do grillowania. Będą gry plażowe, muzyka i dobra zabawa. Start o zmierzchu.',
        location: 'Plaża Poniatówka, Warszawa',
        coordinates: { lat: 52.2450, lng: 21.0543 },
        startDate: new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000).toISOString(), // Jutro
        endDate: new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000).toISOString(), // 3 godziny później
        options: ['food', 'games', 'music'],
        organizerId: 'demo-user-5',
        organizerName: 'Piotr Nowak',
        invitationCode: this.generateSampleInviteCode(4),
        createdAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        isSample: true,
        sampleNote: 'Przykład nieformalnego wydarzenia nad wodą z grami'
      },
      {
        id: 'demo-workshop',
        title: 'Warsztaty Fotograficzne 📸',
        description: 'Warsztaty dla początkujących fotografów. Nauka podstaw kompozycji, ustawień aparatu i obróbki zdjęć. Materiały i kawa wliczone w cenę.',
        location: 'Studio Foto, ul. Artystyczna 8, Warszawa',
        coordinates: { lat: 52.2370, lng: 21.0175 },
        startDate: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString(), // Za 5 dni
        endDate: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000).toISOString(), // 4 godziny później
        options: ['drinks'],
        organizerId: 'demo-user-6',
        organizerName: 'Fotograf Pro',
        invitationCode: this.generateSampleInviteCode(5),
        createdAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        isSample: true,
        sampleNote: 'Przykład wydarzenia edukacyjnego z minimalną liczbą opcji'
      },
      {
        id: 'demo-movie-night',
        title: 'Kino pod Gwiazdami 🌟',
        description: 'Seans filmowy na świeżym powietrzu. Dzisiejszego wieczoru: "Casablanca". Przynieś koc lub krzesło. Popcorn zapewniamy!',
        location: 'Dziedziniec Zamku Królewskiego, Warszawa',
        coordinates: { lat: 52.2472, lng: 21.0143 },
        startDate: new Date(now.getTime() + 6 * 24 * 60 * 60 * 1000).toISOString(), // Za 6 dni
        endDate: new Date(now.getTime() + 6 * 24 * 60 * 60 * 1000 + 2.5 * 60 * 60 * 1000).toISOString(), // 2.5 godziny później
        options: ['food'],
        organizerId: 'demo-user-7',
        organizerName: 'Kino Letnie',
        invitationCode: this.generateSampleInviteCode(6),
        createdAt: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000).toISOString(),
        isSample: true,
        sampleNote: 'Przykład wydarzenia kulturalnego z jedzeniem ale bez napojów'
      },
      {
        id: 'demo-past-event',
        title: '✅ Piknik Rodzinny (zakończone)',
        description: 'Udany piknik rodzinny w parku. Dzieci bawiły się świetnie, była masa pysznego jedzenia i dobra pogoda nam sprzyjała.',
        location: 'Park Skaryszewski, Warszawa',
        coordinates: { lat: 52.2445, lng: 21.0892 },
        startDate: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 dni temu
        endDate: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000).toISOString(), // 4 godziny trwania
        options: ['food', 'drinks', 'games'],
        organizerId: 'demo-user-8',
        organizerName: 'Rodzina Wiśniewskich',
        invitationCode: this.generateSampleInviteCode(7),
        createdAt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        isSample: true,
        sampleNote: 'Przykład wydarzenia z przeszłości - pokazuje jak wyglądają zakończone wydarzenia'
      }
    ];

    return sampleData;
  }

  // Załaduj przykładowe dane do aplikacji
  loadSampleData() {
    if (this.isDataLoaded) {

      return false;
    }

    try {
      // Sprawdź czy są już jakieś wydarzenia w storage
      const existingEvents = window.storageManager?.getAllEvents() || [];
      
      // Jeśli są już wydarzenia (nie sample), nie ładuj przykładowych danych
      const nonSampleEvents = existingEvents.filter(event => !event.isSample);
      if (nonSampleEvents.length > 0) {

        return false;
      }

      // Usuń stare sample data jeśli istnieją
      this.clearSampleData();

      // Dodaj nowe sample data
      let addedCount = 0;
      this.sampleEvents.forEach(event => {
        if (window.storageManager?.saveEvent(event)) {
          addedCount++;
        }
      });

      this.isDataLoaded = true;
      
      // Zapisz informację o załadowaniu sample data
      localStorage.setItem('sampleDataLoaded', 'true');
      localStorage.setItem('sampleDataTimestamp', new Date().toISOString());

      console.log(`[SampleData] Loaded ${addedCount} sample events`);
      
      // Powiadom aplikację o nowych danych
      this.notifyDataLoaded();
      
      return true;

    } catch (error) {
      console.error('[SampleData] Error loading sample data:', error);
      return false;
    }
  }

  // Wyczyść przykładowe dane
  clearSampleData() {
    try {
      const allEvents = window.storageManager?.getAllEvents() || [];
      const sampleEvents = allEvents.filter(event => event.isSample);
      
      let removedCount = 0;
      sampleEvents.forEach(event => {
        if (window.storageManager?.deleteEvent(event.id)) {
          removedCount++;
        }
      });

      if (removedCount > 0) {
        console.log(`[SampleData] Removed ${removedCount} sample events`);
        this.notifyDataCleared();
      }

      this.isDataLoaded = false;
      localStorage.removeItem('sampleDataLoaded');
      localStorage.removeItem('sampleDataTimestamp');

      return removedCount;

    } catch (error) {
      console.error('[SampleData] Error clearing sample data:', error);
      return 0;
    }
  }

  // Sprawdź czy sample data są załadowane
  isSampleDataLoaded() {
    return localStorage.getItem('sampleDataLoaded') === 'true';
  }

  // Powiadom o załadowaniu danych
  notifyDataLoaded() {
    // Wyślij custom event
    const event = new CustomEvent('sampledataloaded', {
      detail: { count: this.sampleEvents.length }
    });
    document.dispatchEvent(event);

    // Pokaż powiadomienie
    if (window.showNotification) {
      showNotification(
        t('sampleData.loaded', { count: this.sampleEvents.length }),
        'success'
      );
    }

    // Odśwież listę wydarzeń jeśli jesteśmy na głównej stronie
    if (window.eventManager?.displayEvents) {
      window.eventManager.displayEvents();
    }
  }

  // Powiadom o wyczyszczeniu danych
  notifyDataCleared() {
    const event = new CustomEvent('sampledatacleared');
    document.dispatchEvent(event);

    if (window.showNotification) {
      showNotification(t('sampleData.cleared'), 'info');
    }

    // Odśwież listę wydarzeń
    if (window.eventManager?.displayEvents) {
      window.eventManager.displayEvents();
    }
  }

  // Utwórz interfejs zarządzania sample data
  createSampleDataInterface() {
    const container = document.createElement('div');
    container.className = 'sample-data-container';
    container.innerHTML = `
      <div class="sample-data-section">
        <h4>📋 ${t('sampleData.title')}</h4>
        <p>${t('sampleData.description')}</p>
        
        <div class="sample-data-actions">
          <button id="load-sample-data-btn" class="btn btn-primary btn-sm">
            ${t('sampleData.loadButton')}
          </button>
          <button id="clear-sample-data-btn" class="btn btn-secondary btn-sm">
            ${t('sampleData.clearButton')}
          </button>
        </div>
        
        <div class="sample-data-status">
          <small id="sample-data-status-text">${this.getStatusText()}</small>
        </div>
      </div>
    `;

    // Event listenery
    const loadBtn = container.querySelector('#load-sample-data-btn');
    const clearBtn = container.querySelector('#clear-sample-data-btn');

    loadBtn.addEventListener('click', () => {
      if (this.loadSampleData()) {
        this.updateInterface();
      }
    });

    clearBtn.addEventListener('click', () => {
      if (confirm(t('sampleData.clearConfirm'))) {
        this.clearSampleData();
        this.updateInterface();
      }
    });

    // Zaktualizuj stan przycisków
    this.updateButtonStates(container);

    return container;
  }

  // Zaktualizuj stan przycisków
  updateButtonStates(container) {
    const loadBtn = container.querySelector('#load-sample-data-btn');
    const clearBtn = container.querySelector('#clear-sample-data-btn');
    const statusText = container.querySelector('#sample-data-status-text');

    const isLoaded = this.isSampleDataLoaded();
    
    loadBtn.disabled = isLoaded;
    clearBtn.disabled = !isLoaded;
    statusText.textContent = this.getStatusText();
  }

  // Pobierz tekst statusu
  getStatusText() {
    if (this.isSampleDataLoaded()) {
      const timestamp = localStorage.getItem('sampleDataTimestamp');
      if (timestamp) {
        const date = new Date(timestamp);
        return t('sampleData.loadedAt', { 
          date: date.toLocaleDateString('pl-PL'),
          time: date.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })
        });
      }
      return t('sampleData.currentlyLoaded');
    }
    return t('sampleData.notLoaded');
  }

  // Zaktualizuj interfejs
  updateInterface() {
    const containers = document.querySelectorAll('.sample-data-container');
    containers.forEach(container => {
      this.updateButtonStates(container);
    });
  }

  // Dodaj sample data interface do strony ustawień
  addToSettingsPage() {
    // Znajdź kontener ustawień
    const settingsContainer = document.querySelector('.settings-container') || 
                             document.querySelector('.main-content') ||
                             document.body;

    // Sprawdź czy interface już istnieje
    if (settingsContainer.querySelector('.sample-data-container')) {
      return;
    }

    const interfaceElement = this.createSampleDataInterface();
    settingsContainer.appendChild(interfaceElement);
  }

  // Automatycznie załaduj sample data przy pierwszym uruchomieniu
  autoLoadOnFirstRun() {
    // Sprawdź czy to pierwsze uruchomienie aplikacji
    const hasRunBefore = localStorage.getItem('appHasRun');
    const hasAnyEvents = (window.storageManager?.getAllEvents() || []).length > 0;

    if (!hasRunBefore && !hasAnyEvents) {

      this.loadSampleData();
      localStorage.setItem('appHasRun', 'true');
    }
  }

  // Pobierz statystyki sample data
  getSampleDataStats() {
    const allEvents = window.storageManager?.getAllEvents() || [];
    const sampleEvents = allEvents.filter(event => event.isSample);
    const userEvents = allEvents.filter(event => !event.isSample);

    return {
      total: allEvents.length,
      sample: sampleEvents.length,
      user: userEvents.length,
      isLoaded: this.isSampleDataLoaded(),
      sampleEventIds: sampleEvents.map(e => e.id)
    };
  }

  // Style CSS dla sample data interface
  addSampleDataStyles() {
    const style = document.createElement('style');
    style.textContent = `
      .sample-data-container {
        background: var(--color-surface);
        border: 1px solid var(--color-border);
        border-radius: 12px;
        padding: 20px;
        margin: 16px 0;
      }
      
      .sample-data-section h4 {
        margin: 0 0 8px 0;
        color: var(--color-primary);
        font-size: 1.1rem;
      }
      
      .sample-data-section p {
        margin: 0 0 16px 0;
        color: var(--color-text-secondary);
        font-size: 0.9rem;
        line-height: 1.4;
      }
      
      .sample-data-actions {
        display: flex;
        gap: 8px;
        margin-bottom: 12px;
        flex-wrap: wrap;
      }
      
      .sample-data-status small {
        color: var(--color-text-secondary);
        font-size: 0.8rem;
      }
      
      .sample-data-container .btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
      
      /* Oznaczenie przykładowych wydarzeń */
      .event-card[data-is-sample="true"] {
        position: relative;
        border-left: 4px solid #10b981;
      }
      
      .event-card[data-is-sample="true"]::before {
        content: "📋";
        position: absolute;
        top: 8px;
        right: 8px;
        font-size: 0.8rem;
        opacity: 0.7;
      }
      
      .event-card[data-is-sample="true"] .event-title::after {
        content: " (demo)";
        font-size: 0.8rem;
        color: var(--color-text-secondary);
        font-weight: normal;
      }
    `;
    
    document.head.appendChild(style);
  }
}

// Inicjalizuj po załadowaniu DOM
document.addEventListener('DOMContentLoaded', () => {
  window.sampleDataManager = new SampleDataManager();
  window.sampleDataManager.addSampleDataStyles();
  
  // Auto-load przy pierwszym uruchomieniu (z opóźnieniem)
  setTimeout(() => {
    window.sampleDataManager.autoLoadOnFirstRun();
  }, 1000);
});

// Funkcje globalne
window.loadSampleData = () => window.sampleDataManager?.loadSampleData();
window.clearSampleData = () => window.sampleDataManager?.clearSampleData();
window.getSampleDataStats = () => window.sampleDataManager?.getSampleDataStats();


