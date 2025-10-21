# 🎉 Fete Lite - Lekka PWA do Organizowania Wydarzeń

**Fete Lite** to nowoczesna Progressive Web App (PWA) do organizowania wydarzeń społecznych. Aplikacja oferuje pełną funkcjonalność offline, intuicyjny interfejs użytkownika oraz zaawansowane funkcje organizacyjne.

> **🆕 NOWOŚĆ!** Aplikacja została zintegrowana z backendem PHP REST API!  
> Zobacz: [`INTEGRATION_GUIDE.md`](INTEGRATION_GUIDE.md) i [`QUICKSTART_API.md`](QUICKSTART_API.md)

---

## 📱 Cechy Aplikacji

### ✨ Główne Funkcjonalności
- **📅 Tworzenie wydarzeń** - Łatwe dodawanie wydarzeń z pełną walidacją
- **🔐 JWT Authentication** - Bezpieczne logowanie z auto-refresh tokenów
- **☁️ Cloud Sync** - Synchronizacja danych między urządzeniami (przez API)
- **🗺️ Integracja z mapami** - OpenStreetMap/Leaflet (bezpłatna alternatywa dla Google Maps)
- **📍 Geolokalizacja** - Automatyczne wykrywanie lokalizacji
- **📱 QR Code** - Generowanie kodów QR do udostępniania wydarzeń
- **📆 Eksport do kalendarza** - Pliki iCalendar (.ics) z automatyczną strefą czasową
- **🔔 Powiadomienia push** - Przypomnienia o nadchodzących wydarzeniach
- **🌙 Ciemny motyw** - Automatyczne przełączanie według preferencji systemowych
- **🌐 Wielojęzyczność** - Polski i angielski (z automatyczną detekcją)
- **📶 Tryb offline** - Pełna funkcjonalność bez internetu z kolejką sync
- **📊 Sample data** - Przykładowe wydarzenia do testowania

### 🔧 Techniczne Cechy PWA
- **⚡ Szybkie ładowanie** - Service Worker z cache-first strategy
- **📲 Instalowalna** - Możliwość instalacji jak natywna aplikacja
- **🎨 Responsywna** - Mobile-first design z Material Design
- **🔒 Bezpieczna** - HTTPS ready, JWT authentication
- **💾 Hybrid storage** - API + localStorage cache z offline fallback
- **🔄 Auto synchronizacja** - Offline queue sync po powrocie online
- **🔃 Token refresh** - Automatyczne odświeżanie wygasłych tokenów

## 🚀 Szybki Start

### Wymagania
- Serwer HTTP (nie można uruchomić przez `file://`)
- Nowoczesna przeglądarka z obsługą Service Workers
- HTTPS (wymagane dla PWA i powiadomień)

### Instalacja

1. **Sklonuj repozytorium:**
```bash
git clone https://github.com/username/fete-lite.git
cd fete-lite
```

2. **Uruchom lokalny serwer:**

**Z użyciem Python:**
```bash
# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000
```

**Z użyciem Node.js:**
```bash
npx serve -s . -l 8000
```

**Z użyciem PHP:**
```bash
php -S localhost:8000
```

3. **Otwórz w przeglądarce:**
```
http://localhost:8000
```

### Instalacja PWA
Po otwarciu aplikacji w przeglądarce:
1. Kliknij ikonę "Zainstaluj" w pasku adresu
2. Lub użyj menu przeglądarki > "Zainstaluj Fete Lite"
3. Aplikacja pojawi się na pulpicie/ekranie głównym

## 🌍 Production Deployment

### Backend (Separate Repository)

**Quick Deploy na Railway.app:**

```bash
# 1. Skopiuj folder Fete_backend/ do nowego GitHub repo
cd Fete_backend
git init && git add . && git commit -m "Backend ready"
git remote add origin https://github.com/username/fete-lite-backend.git
git push -u origin main

# 2. Deploy on Railway
railway login
railway new  # Connect GitHub repo
railway add mysql
railway deploy

# 3. Set environment variables
railway variables set JWT_SECRET=$(openssl rand -base64 32)
railway variables set CORS_ORIGINS=https://your-frontend.netlify.app
```

**Gotowy backend w 5 minut!** ✅ See: [`BACKEND_DEPLOYMENT.md`](BACKEND_DEPLOYMENT.md)

### Frontend (This Repository)

**Deploy na Netlify:**

```bash
# Option A: Drag & drop
# Zip this folder and drag to netlify.com/drop

# Option B: GitHub integration
git remote add origin https://github.com/username/fete-lite-frontend.git
git push -u origin main
# Then connect on Netlify dashboard

# Option C: Netlify CLI
npm i -g netlify-cli
netlify login
netlify init
netlify deploy --prod
```

**Alternative platforms:**
- **Vercel**: `vercel --prod`
- **GitHub Pages**: Enable in repo settings
- **Firebase Hosting**: `firebase deploy`

### Update API URL

Po deployment backendu, w `js/api-client.js` zmień:

```javascript
// From:
this.baseURL = 'http://localhost:8000/api/v1';

// To:  
this.baseURL = 'https://your-backend.railway.app/api/v1';
```

## 📋 Struktura Projektu

```
fete_lite/
├── 📄 index.html              # Główna strona (lista wydarzeń)
├── 📄 create-event.html       # Formularz tworzenia wydarzenia
├── 📄 event-details.html      # Szczegóły wydarzenia
├── 📄 manifest.json           # Manifest PWA
├── 📄 service-worker.js       # Service Worker
├── 📄 README.md              # Dokumentacja
├── 🎨 css/
│   ├── style.css             # Główne style
│   ├── dark-mode.css         # Ciemny motyw
│   └── responsive.css        # Responsive design
├── ⚙️ js/
│   ├── main.js               # Główna logika aplikacji
│   ├── events.js             # Zarządzanie wydarzeniami
│   ├── storage.js            # Zarządzanie danymi
│   ├── i18n.js               # System tłumaczeń
│   ├── geolocation.js        # Geolokalizacja i mapy
│   ├── qr.js                 # Generowanie QR kodów
│   ├── ics-export.js         # Eksport do kalendarza
│   ├── darkmode.js           # Przełączanie motywów
│   ├── network.js            # Monitoring sieci
│   ├── notifications.js      # System powiadomień
│   └── sample-data.js        # Przykładowe dane
└── 🖼️ images/
    ├── logo.svg              # Logo aplikacji
    └── icons/                # Ikony PWA
```

## 💡 Użytkowanie

### Tworzenie Wydarzenia
1. Kliknij **"+"** w dolnej nawigacji
2. Wypełnij formularz:
   - **Tytuł** - nazwa wydarzenia
   - **Opis** - szczegółowy opis
   - **Data i czas** - kiedy się odbędzie
   - **Lokalizacja** - gdzie się odbędzie
   - **Opcje** - jedzenie, napoje, zakwaterowanie, etc.
3. Użyj **"📍 Wykryj lokalizację"** dla automatycznej geolokalizacji
4. Kliknij **"Utwórz wydarzenie"**

### Zarządzanie Wydarzeniami
- **Przeglądanie** - główna lista wszystkich wydarzeń
- **Filtrowanie** - według dat i opcji
- **Edycja** - kliknij wydarzenie > "Edytuj"
- **Usuwanie** - kliknij wydarzenie > "Usuń"
- **Udostępnianie** - QR kod lub link

### Funkcje Specjalne

#### 📱 QR Code
- Automatyczne generowanie przy tworzeniu wydarzenia
- Możliwość udostępnienia linku
- Skanowanie prowadzi do szczegółów wydarzenia

#### 📅 Eksport do Kalendarza
- Format iCalendar (.ics)
- Kompatybilny z Google Calendar, Outlook, Apple Calendar
- Automatyczna strefa czasowa
- Przypomnienia wbudowane

#### 🔔 Powiadomienia
1. Kliknij **"🔔"** w nawigacji
2. Włącz powiadomienia w przeglądarce
3. Skonfiguruj czas przypomnienia (15min - 2h przed)
4. Otrzymuj automatyczne powiadomienia

#### 🌙 Ciemny Motyw
- **Automatyczny** - podąża za systemem
- **Ręczny** - przełącznik w nawigacji
- **Zapisywany** - zapamiętuje preferencje

## 🔧 Konfiguracja

### Zmiana Języka
```javascript
// W konsoli przeglądarki
window.i18n.setLanguage('en'); // angielski
window.i18n.setLanguage('pl'); // polski
```

### Zarządzanie Sample Data
```javascript
// Załaduj przykładowe wydarzenia
window.loadSampleData();

// Usuń przykładowe wydarzenia  
window.clearSampleData();

// Sprawdź statystyki
window.getSampleDataStats();
```

### Eksport/Import Danych
```javascript
// Eksport wszystkich danych
const data = window.storageManager.exportData();

// Import danych
window.storageManager.importData(data);
```

## 🛠️ Rozwój i Modyfikacje

### Dodawanie Nowych Funkcji

#### Nowy Język
1. Edytuj `js/i18n.js`
2. Dodaj nowe tłumaczenia w sekcji `translations`
3. Dodaj kod języka do `supportedLanguages`

#### Nowe Pola Wydarzenia
1. Edytuj formularz w `create-event.html`
2. Zaktualizuj walidację w `js/events.js`
3. Dodaj obsługę w `js/storage.js`

#### Nowy Motyw
1. Utwórz nowy plik CSS (np. `css/blue-theme.css`)
2. Dodaj opcję w `js/darkmode.js`
3. Zaktualizuj przełącznik motywów

### Struktura Kodu

#### Główne Moduły
- **`main.js`** - Inicjalizacja i koordynacja
- **`events.js`** - Logika wydarzeń
- **`storage.js`** - Zarządzanie danymi
- **`i18n.js`** - Tłumaczenia

#### Moduły Specjalistyczne
- **`geolocation.js`** - Mapy i lokalizacja
- **`qr.js`** - Kody QR
- **`ics-export.js`** - Eksport kalendarzy
- **`notifications.js`** - Powiadomienia

### Wzorce Projektowe
- **Module Pattern** - każdy plik to zamknięty moduł
- **Event-driven** - komunikacja przez CustomEvents
- **Progressive Enhancement** - graceful degradation
- **Mobile-first** - projektowanie od najmniejszych ekranów

## 🧪 Testowanie

### Tryb Offline
1. Otwórz DevTools (F12)
2. Network tab > "Offline"
3. Przetestuj funkcjonalność

### PWA Audit
1. DevTools > Lighthouse
2. Wybierz "Progressive Web App"
3. Uruchom audit

### Responsywność
1. DevTools > Device Mode
2. Testuj różne rozmiary ekranu
3. Sprawdź touch targets

## 📚 API i Biblioteki

### Wykorzystane Technologie
- **Vanilla JavaScript** (ES6+)
- **CSS3** z CSS Custom Properties
- **HTML5** z Semantic Markup
- **Service Workers**
- **Web App Manifest**

### Zewnętrzne Biblioteki
- **[QRCode.js](https://github.com/davidshimjs/qrcode)** - Generowanie kodów QR
- **[Leaflet](https://leafletjs.com/)** - Interaktywne mapy
- **[OpenStreetMap](https://www.openstreetmap.org/)** - Dane map
- **[Nominatim](https://nominatim.org/)** - Geocoding

### Browser APIs
- **Service Worker API** - Offline functionality
- **Notification API** - Push powiadomienia
- **Geolocation API** - Wykrywanie lokalizacji
- **LocalStorage API** - Trwałe przechowywanie
- **Fetch API** - HTTP requests

## 🚨 Rozwiązywanie Problemów

### Aplikacja Nie Ładuje Się
- ✅ Sprawdź czy używasz HTTPS/localhost
- ✅ Otwórz DevTools i sprawdź Console
- ✅ Wyczyść cache przeglądarki
- ✅ Sprawdź czy Service Worker się zainstalował

### Powiadomienia Nie Działają
- ✅ Sprawdź uprawnienia w przeglądarce
- ✅ Odblokuj powiadomienia dla strony
- ✅ Sprawdź czy używasz HTTPS
- ✅ Przetestuj w trybie incognito

### Mapy Nie Ładują Się
- ✅ Sprawdź połączenie internetowe
- ✅ Odblokuj geolokalizację
- ✅ Sprawdź Console pod kątem błędów CORS

### PWA Nie Instaluje Się
- ✅ Sprawdź manifest.json w DevTools
- ✅ Sprawdź czy Service Worker działa
- ✅ Sprawdź czy używasz HTTPS

## 🔮 Roadmapa

### Wersja 1.1
- [ ] Synchronizacja z serwerem
- [ ] Udostępnianie wydarzeń między użytkownikami
- [ ] Kategorie wydarzeń
- [ ] Szablony wydarzeń

### Wersja 1.2
- [ ] Integracja z social media
- [ ] Bulk operations
- [ ] Zaawansowane filtry
- [ ] Eksport do PDF

### Wersja 2.0
- [ ] Multi-user support
- [ ] Real-time collaboration
- [ ] Advanced analytics
- [ ] Plugin system

## 🤝 Współpraca

### Zgłaszanie Błędów
1. Otwórz issue na GitHub
2. Opisz problem szczegółowo
3. Załącz zrzuty ekranu
4. Podaj przeglądarkę i system

### Propozycje Funkcji
1. Sprawdź czy feature request już istnieje
2. Opisz przypadek użycia
3. Zaproponuj implementację
4. Dodaj mockupy jeśli to możliwe

## 📄 Licencja

MIT License - szczegóły w pliku `LICENSE`

## 👥 Autorzy

- **Autor główny** - [Twoja nazwa]
- **Współtwórcy** - Lista w pliku `CONTRIBUTORS.md`

## 🙏 Podziękowania

- **Material Design** - za inspirację designu
- **OpenStreetMap** - za bezpłatne mapy
- **Społeczność Open Source** - za wykorzystane biblioteki

---

**🎉 Dziękujemy za korzystanie z Fete Lite!**

Jeśli aplikacja Ci się podoba, zostaw ⭐ na GitHub i podziel się nią ze znajomymi!