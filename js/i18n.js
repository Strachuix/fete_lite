// Fete Lite - Internacjonalizacja (i18n)
// System tłumaczeń PL/EN

class I18n {
  constructor() {
    this.currentLang = this.getStoredLanguage() || this.detectBrowserLanguage();
    this.translations = {};
    this.loadTranslations();
  }

  // Wykryj język przeglądarki
  detectBrowserLanguage() {
    const browserLang = navigator.language || navigator.userLanguage;
    const langCode = browserLang.split('-')[0];
    return ['pl', 'en'].includes(langCode) ? langCode : 'pl';
  }

  // Pobierz zapisany język z localStorage
  getStoredLanguage() {
    return localStorage.getItem('fete-lite-language');
  }

  // Zapisz język do localStorage
  setStoredLanguage(lang) {
    localStorage.setItem('fete-lite-language', lang);
  }

  // Załaduj tłumaczenia
  loadTranslations() {
    this.translations = {
      pl: {
        // Główna aplikacja
        'app.title': 'Fete Lite',
        'app.name': 'Fete Lite',
        
        // Nawigacja
                // Wspólne
        'common.cancel': 'Anuluj',
        'common.confirm': 'Potwierdź',
        'common.close': 'Zamknij',
        
        // Nawigacja
        'nav.home': 'Strona główna',
        'nav.create': 'Utwórz',
        'nav.notifications': 'Powiadomienia',
        'nav.settings': 'Ustawienia',
        'nav.login': 'Logowanie',
        
        // Strona główna
        'home.welcome': 'Witaj w Fete Lite!',
        'home.description': 'Organizuj wydarzenia towarzyskie szybko i prosto',
        'home.createEvent': 'Utwórz wydarzenie',
        'home.myEvents': 'Moje wydarzenia',
        'home.noEvents': 'Brak wydarzeń',
        'home.noEventsDesc': 'Utwórz swoje pierwsze wydarzenie i zacznij organizować spotkania!',
        'home.createFirst': 'Utwórz pierwsze wydarzenie',
        'home.viewDetails': 'Zobacz szczegóły',
        
        // Filtry
        'filter.all': 'Wszystkie',
        'filter.upcoming': 'Nadchodzące',
        'filter.past': 'Przeszłe',
        
        // Tworzenie wydarzenia
        'create.title': 'Nowe wydarzenie',
        'create.basicInfo': 'Podstawowe informacje',
        'create.eventTitle': 'Nazwa wydarzenia',
        'create.titlePlaceholder': 'np. Grillowanie w parku',
        'create.description': 'Opis wydarzenia',
        'create.descriptionPlaceholder': 'Opisz szczegóły wydarzenia, co będzie się działo...',
        'create.dateTime': 'Data i czas',
        'create.startDate': 'Data rozpoczęcia',
        'create.startTime': 'Godzina rozpoczęcia',
        'create.endDate': 'Data zakończenia',
        'create.endTime': 'Godzina zakończenia',
        'create.location': 'Lokalizacja',
        'create.eventLocation': 'Miejsce wydarzenia',
        'create.locationPlaceholder': 'Adres lub nazwa miejsca',
        'create.locationHelp': 'Kliknij 📍 aby pobrać aktualną lokalizację lub 🗺️ aby wybrać na mapie',
        'create.selectLocationOnMap': 'Wybierz lokalizację na mapie',
        'create.mapInstructions': 'Kliknij na mapie aby wybrać lokalizację wydarzenia',
        'create.selectedLocation': 'Wybrana lokalizacja:',
        'create.loadingAddress': 'Ładowanie adresu...',
        'create.additionalOptions': 'Opcje dodatkowe',
        'create.food': 'Jedzenie',
        'create.drinks': 'Napoje',
        'create.alcohol': 'Alkohol',
        'create.accommodation': 'Nocleg',
        'create.music': 'Muzyka',
        'create.games': 'Gry/Zabawy',
        'create.preview': 'Podgląd',
        'create.save': 'Zapisz wydarzenie',
        'create.previewTitle': 'Podgląd wydarzenia',
        'create.backToEditing': 'Wróć do edycji',
        'create.eventCreated': 'Wydarzenie utworzone!',
        'create.eventSaved': 'Twoje wydarzenie zostało pomyślnie zapisane.',
        'create.invitationCode': 'Kod zaproszenia',
        'create.invitationHelp': 'Udostępnij ten 8-znakowy kod znajomym aby mogli dołączyć',
        'create.shareEvent': 'Udostępnij wydarzenie',
        'create.qrHelp': 'Zeskanuj kod QR aby udostępnić wydarzenie',
        'create.viewEvent': 'Zobacz wydarzenie',
        'create.createAnother': 'Utwórz kolejne',
        'create.backToHome': 'Strona główna',
        
        // Nowe pola formularza
        'create.requirements': 'Wymagania i preferencje',
        'create.foodRequirements': 'Wymagania żywieniowe',
        'create.foodRequirementsPlaceholder': 'np. Opcje wegetariańskie, bezglutenowe, bez orzechów...',
        'create.alcoholPolicy': 'Polityka alkoholowa',
        'create.alcoholAllowed': 'Alkohol zapewniony przez organizatora',
        'create.alcoholNotAllowed': 'Bez alkoholu',
        'create.byob': 'Przynieś własny alkohol',
        'create.drinksProvided': 'Napoje będą zapewnione przez organizatora',
        'create.financial': 'Informacje finansowe',
        'create.entryFee': 'Składka (PLN)',
        'create.organizerBlik': 'Twój kod BLIK',
        'create.blikPlaceholder': '123456',
        'create.blikHelp': 'Kod BLIK ułatwi uczestnikom wpłacanie składek',
        'create.participants': 'Uczestnicy i nocleg',
        'create.maxParticipants': 'Limit uczestników',
        'create.maxParticipantsLabel': 'Maksymalna liczba uczestników',
        'create.maxOvernightParticipants': 'Limit uczestników nocujących',
        'create.dressCode': 'Dress code',
        'create.dressCodeLabel': 'Wybierz dress code dla wydarzenia',
        'create.dressCodeNone': 'Brak wymagań',
        'create.dressCodeCasual': 'Casual',
        'create.dressCodeSmartCasual': 'Smart casual',
        'create.dressCodeFormal': 'Elegancki',
        'create.dressCodeCostume': 'Kostiumowy',
        'create.dressCodeTheme': 'Tematyczny',
        'create.dressCodeCustom': 'Inne',
        'create.dressCodeCustomPlaceholder': 'np. Strój piracki, ubrania w kolorze czerwonym...',
        'create.selectDressCode': 'Wybierz dress code',
        'create.selectedDressCode': 'Wybrano:',
        'create.change': 'Zmień',
        'create.dressCodeNoneDesc': 'Dowolny strój',
        'create.dressCodeCasualDesc': 'Swobodny, codzienny strój', 
        'create.dressCodeSmartCasualDesc': 'Elegancko-casualowy',
        'create.dressCodeFormalDesc': 'Formalny strój',
        'create.dressCodeCostumeDesc': 'Stroje tematyczne',
        'create.dressCodeThemeDesc': 'Według tematu wydarzenia',
        'create.dressCodeCustomDesc': 'Wpisz własne wymagania',
        'create.customDressCodeLabel': 'Wpisz własne wymagania:',
        'create.accommodationAvailable': 'Możliwość noclegu',
        'create.accommodationInfo': 'Informacje o noclegu',
        'create.accommodationInfoPlaceholder': 'Opisz warunki noclegu, ilość miejsc, koszty...',
        'create.media': 'Zdjęcia wydarzenia',
        'create.eventImages': 'Dodaj zdjęcia',
        'create.uploadImages': 'Kliknij aby dodać zdjęcia lub przeciągnij je tutaj',
        'create.imageFormats': 'Format: JPG, PNG, WEBP (max 5MB każde)',
        
        // Udostępnianie
        'share.title': 'Udostępnij wydarzenie',
        'share.copyLink': 'Kopiuj link',
        'share.qrCode': 'Kod QR',
        'share.eventCode': 'Kod wydarzenia',
        'share.codeDescription': 'Inne osoby mogą użyć tego kodu do znalezienia wydarzenia',
        'share.downloadQR': 'Pobierz QR',
        'share.nativeShare': 'Udostępnij...',
        
        // Szczegóły wydarzenia
        'details.title': 'Szczegóły wydarzenia',
        'details.description': 'Opis',
        'details.features': 'Co będzie na wydarzeniu',
        'details.location': 'Lokalizacja',
        'details.getDirections': 'Pokaż dojazd',
        'details.exportCalendar': 'Eksportuj do kalendarza',
        'details.showQR': 'Pokaż kod QR',
        'details.editEvent': 'Edytuj wydarzenie',
        'details.deleteEvent': 'Usuń wydarzenie',
        'details.shareTitle': 'Udostępnij wydarzenie',
        'details.qrDescription': 'Zeskanuj ten kod QR aby udostępnić wydarzenie',
        'details.copyLink': 'Kopiuj link',
        'details.confirmDelete': 'Potwierdź usunięcie',
        'details.deleteWarning': 'Czy na pewno chcesz usunąć to wydarzenie? Tej operacji nie można cofnąć.',
        'details.cancel': 'Anuluj',
        'details.confirmDeleteBtn': 'Tak, usuń wydarzenie',
        'details.editTitle': 'Edytuj wydarzenie',
        'details.editComingSoon': 'Funkcja edycji wydarzeń będzie dostępna wkrótce.',
        'details.editWorkaround': 'Na razie możesz utworzyć nowe wydarzenie z podobnymi danymi.',
        'details.close': 'Zamknij',
        'details.createNew': 'Utwórz nowe',
        
        // Powiadomienia
        'notifications.title': 'Powiadomienia',
        'notifications.empty': 'Brak nowych powiadomień',
        'notifications.enable': 'Włącz powiadomienia o wydarzeniach',
        'notifications.permission': 'Aby otrzymywać powiadomienia, musisz wyrazić zgodę w przeglądarce.',
        'notifications.granted': 'Powiadomienia zostały włączone',
        'notifications.denied': 'Powiadomienia zostały wyłączone',
        'notifications.eventReminder': 'Przypomnienie o wydarzeniu',
        'notifications.eventStarting': 'Wydarzenie rozpoczyna się za godzinę',
        
        // Offline
        'offline.message': '🔌 Brak połączenia - pracujesz w trybie offline',
        
        // Loading
        'loading.events': 'Ładowanie wydarzeń...',
        'loading.event': 'Ładowanie wydarzenia...',
        
        // Błędy
        'error.eventNotFound': 'Wydarzenie nie znalezione',
        'error.eventNotFoundDesc': 'Wydarzenie mogło zostać usunięte lub nie istnieje.',
        'error.backToHome': 'Wróć do strony głównej',
        'error.loadError': 'Błąd ładowania wydarzenia',
        'error.noEventId': 'Nie podano ID wydarzenia',
        'error.geolocationDenied': 'Dostęp do lokalizacji został odrzucony',
        'error.geolocationUnavailable': 'Geolokalizacja jest niedostępna',
        'error.geolocationTimeout': 'Przekroczono limit czasu pobierania lokalizacji',
        
        // Walidacja
        'validation.titleRequired': 'Nazwa wydarzenia jest wymagana',
        'validation.titleTooLong': 'Nazwa wydarzenia jest za długa (max 100 znaków)',
        'validation.startDateRequired': 'Data rozpoczęcia jest wymagana',
        'validation.startTimeRequired': 'Godzina rozpoczęcia jest wymagana',
        'validation.pastDate': 'Data wydarzenia nie może być w przeszłości',
        'validation.endBeforeStart': 'Data zakończenia nie może być wcześniejsza niż rozpoczęcia',
        
        // Autoryzacja
        'auth.title': 'Zaloguj się - Fete Lite',
        'auth.welcome': 'Witaj z powrotem!',
        'auth.login': 'Logowanie',
        'auth.register': 'Rejestracja',
        'auth.email': 'Email',
        'auth.password': 'Hasło',
        'auth.password_confirm': 'Potwierdź hasło',
        'auth.remember': 'Zapamiętaj mnie',
        'auth.forgot': 'Zapomniałeś hasła?',
        'auth.personal_data': 'Dane osobowe',
        'auth.first_name': 'Imię',
        'auth.last_name': 'Nazwisko',
        'auth.birth_date': 'Data urodzenia',
        'auth.city': 'Miasto',
        'auth.contact_data': 'Dane kontaktowe',
        'auth.phone': 'Numer telefonu',
        'auth.preferences': 'Preferencje',
        'auth.dietary_preferences': 'Preferencje żywieniowe',
        'auth.blik': 'Kod BLIK (opcjonalnie)',
        'auth.blik_help': 'Kod BLIK ułatwi płatności za wydarzenia',
        'auth.accept_terms': 'Akceptuję regulamin i politykę prywatności',
        'auth.marketing_consent': 'Wyrażam zgodę na otrzymywanie informacji marketingowych',
        'auth.create_account': 'Utwórz konto',
        'auth.or': 'lub',
        'auth.google_login': 'Zaloguj się przez Google',
        'auth.have_account': 'Masz już konto? Zaloguj się',
        'auth.no_account': 'Nie masz konta? Zarejestruj się',
        
        // Preferencje żywieniowe
        'dietary.vegetarian': 'Wegetariańskie',
        'dietary.vegan': 'Wegańskie',
        'dietary.gluten_free': 'Bezglutenowe',
        'dietary.lactose_free': 'Bez laktozy',
        'dietary.halal': 'Halal',
        
        // Sukces
        'success.eventSaved': 'Wydarzenie zostało zapisane',
        'success.eventDeleted': 'Wydarzenie zostało usunięte',
        'success.linkCopied': 'Link został skopiowany do schowka',
        'success.locationObtained': 'Lokalizacja została pobrana',
        'success.calendarExported': 'Wydarzenie zostało wyeksportowane do kalendarza',
        
        // Geolokalizacja
        'geolocation.getting': 'Pobieranie lokalizacji...',
        'geolocation.success': 'Lokalizacja została pobrana',
        'geolocation.error': 'Nie udało się pobrać lokalizacji',
        
        // Daty
        'date.today': 'Dziś',
        'date.tomorrow': 'Jutro',
        'date.yesterday': 'Wczoraj',
        
        // Miesiące (skrócone)
        'month.jan': 'Sty',
        'month.feb': 'Lut',
        'month.mar': 'Mar',
        'month.apr': 'Kwi',
        'month.may': 'Maj',
        'month.jun': 'Cze',
        'month.jul': 'Lip',
        'month.aug': 'Sie',
        'month.sep': 'Wrz',
        'month.oct': 'Paź',
        'month.nov': 'Lis',
        'month.dec': 'Gru',
        
        // Eksport do kalendarza
        'ics.manualDownload': 'Pobieranie ręczne',
        'ics.copyContent': 'Skopiuj poniższą zawartość i zapisz jako plik .ics:',
        'ics.saveAs': 'Zapisz jako',
        'ics.close': 'Zamknij',
        
        // Ciemny motyw
        'darkMode.lightTheme': 'Jasny motyw',
        'darkMode.darkTheme': 'Ciemny motyw',
        'darkMode.autoTheme': 'Automatyczny',
        'darkMode.themeChanged': 'Zmieniono motyw na: {theme}',
        'darkMode.systemThemeChanged': 'Motyw systemowy został zmieniony',
        'darkMode.switchToLight': 'Przełącz na jasny motyw',
        'darkMode.switchToDark': 'Przełącz na ciemny motyw',
        'darkMode.toggleTheme': 'Przełącz motyw',
        'darkMode.theme': 'Motyw',
        'darkMode.resetToDefaults': 'Przywrócono domyślne ustawienia motywu',
        
        // Sieć
        'network.offline': 'Tryb offline',
        'network.offlineDescription': 'Brak połączenia z internetem. Niektóre funkcje mogą być ograniczone.',
        'network.retry': 'Spróbuj ponownie',
        'network.checking': 'Sprawdzanie...',
        'network.connectionRestored': 'Połączenie z internetem zostało przywrócone',
        'network.connectionLost': 'Utracono połączenie z internetem',
        'network.stillOffline': 'Nadal brak połączenia z internetem',
        'network.syncAvailable': 'Dostępne dane do synchronizacji ({count})',
        'network.syncCompleted': 'Zsynchronizowano {count} elementów',
        'network.syncError': 'Błąd podczas synchronizacji',
        
        // Powiadomienia
        'notifications.pushNotifications': 'Powiadomienia push',
        'notifications.receiveReminders': 'Otrzymuj przypomnienia o wydarzeniach',
        'notifications.settings': 'Ustawienia powiadomień',
        'notifications.enabled': 'Powiadomienia zostały włączone',
        'notifications.disabled': 'Powiadomienia zostały wyłączone',
        'notifications.eventReminder': 'Przypomnienie o wydarzeniu',
        'notifications.eventStartsAt': '{title} rozpoczyna się o {time}',
        'notifications.newEvent': 'Nowe wydarzenie',
        'notifications.newEventCreated': 'Utworzono wydarzenie: {title}',
        'notifications.viewEvent': 'Zobacz wydarzenie',
        'notifications.dismiss': 'Odrzuć',
        'notifications.enableReminders': 'Włącz przypomnienia o wydarzeniach',
        'notifications.reminderTime': 'Czas przypomnienia',
        'notifications.minutesBefore': 'minut przed',
        'notifications.hourBefore': 'godzinę przed',
        'notifications.hoursBefore': 'godziny przed',
        'notifications.other': 'Inne',
        'notifications.newEvents': 'Powiadomienia o nowych wydarzeniach',
        'notifications.settingsSaved': 'Ustawienia powiadomień zostały zapisane',
        'notifications.permissionDeniedHelp': 'Powiadomienia zostały zablokowane. Odblokuj je w ustawieniach przeglądarki.',
        'notifications.permissionHelp': 'Aby otrzymywać powiadomienia, musisz udzielić zgody w przeglądarce.',
        'notifications.test': 'Test powiadomienia',
        'notifications.testMessage': 'To jest przykładowe powiadomienie z Fete Lite!',
        'notifications.eventStarting': 'Wydarzenie wkrótce się rozpocznie',
        
        // Sample data
        'sampleData.title': 'Przykładowe dane',
        'sampleData.description': 'Załaduj przykładowe wydarzenia aby przetestować funkcjonalności aplikacji.',
        'sampleData.loadButton': 'Załaduj przykłady',
        'sampleData.clearButton': 'Usuń przykłady',
        'sampleData.loaded': 'Załadowano {count} przykładowych wydarzeń',
        'sampleData.cleared': 'Usunięto przykładowe wydarzenia',
        'sampleData.clearConfirm': 'Czy na pewno chcesz usunąć wszystkie przykładowe wydarzenia?',
        'sampleData.loadedAt': 'Załadowano {date} o {time}',
        'sampleData.currentlyLoaded': 'Przykładowe dane są załadowane',
        'sampleData.notLoaded': 'Przykładowe dane nie są załadowane',
        
        // Settings
        'settings.title': 'Ustawienia',
        'settings.profile': 'Profil użytkownika',
        'settings.welcomeUser': 'Organizator Wydarzeń',
        'settings.memberSince': 'Członek od października 2025',
        'settings.appSettings': 'Ustawienia aplikacji',
        'settings.language': 'Język',
        'settings.languageDesc': 'Wybierz język interfejsu',
        'settings.theme': 'Motyw',
        'settings.themeDesc': 'Personalizuj wygląd aplikacji',
        'settings.lightTheme': 'Jasny',
        'settings.darkTheme': 'Ciemny',
        'settings.autoTheme': 'Auto',
        'settings.notifications': 'Powiadomienia',
        'settings.pushNotifications': 'Powiadomienia push',
        'settings.pushDesc': 'Otrzymuj przypomnienia o wydarzeniach',
        'settings.dataPrivacy': 'Dane i prywatność',
        'settings.exportData': 'Eksportuj dane',
        'settings.exportDesc': 'Pobierz kopię swoich wydarzeń',
        'settings.clearData': 'Wyczyść dane',
        'settings.clearDesc': 'Usuń wszystkie wydarzenia i ustawienia',
        'settings.about': 'O aplikacji',
        'settings.version': 'Wersja {version}',
        'settings.description': 'Organizuj wydarzenia towarzyskie szybko i prosto',
        'settings.languageChanged': 'Zmieniono język na: {language}',
        'settings.themeChanged': 'Zmieniono motyw na: {theme}',
        'settings.notificationsEnabled': 'Powiadomienia zostały włączone',
        'settings.notificationsDisabled': 'Powiadomienia zostały wyłączone',
        'settings.notificationsDenied': 'Brak uprawnień do powiadomień',
        'settings.notificationsNotSupported': 'Powiadomienia nie są obsługiwane',
        'settings.notificationsError': 'Błąd podczas włączania powiadomień',
        'settings.dataExported': 'Dane zostały wyeksportowane',
        'settings.exportError': 'Błąd podczas eksportu danych',
        'settings.dataCleared': 'Dane zostały wyczyszczone',
        'settings.clearError': 'Błąd podczas czyszczenia danych',
        'settings.clearDataConfirm': 'Czy na pewno chcesz usunąć wszystkie wydarzenia? Tej operacji nie można cofnąć.',

        
        // Update system
        'update.available': 'Dostępna aktualizacja!',
        'update.newVersionReady': 'Nowa wersja {version} jest gotowa',
        'update.description': 'Nowa wersja zawiera poprawki błędów i nowe funkcje.',
        'update.updateNow': 'Zaktualizuj',
        'update.updateLater': 'Później',
        'update.updating': 'Aktualizowanie aplikacji...',
        'update.error': '❌ Błąd aktualizacji. Spróbuj ponownie później.',
        'update.step1': 'Pobieranie plików',
        'update.step2': 'Aktualizacja cache',
        'update.step3': 'Finalizacja',
        
        // Navigation
        'nav.settings': 'Ustawienia'
      },
      
      en: {
        // Main app
        'app.title': 'Fete Lite',
        'app.name': 'Fete Lite',
        
        // Common
        'common.cancel': 'Cancel',
        'common.confirm': 'Confirm', 
        'common.close': 'Close',
        
        // Navigation
        'nav.home': 'Home',
        'nav.create': 'Create',
        'nav.notifications': 'Notifications',
        'nav.settings': 'Settings',
        'nav.login': 'Login',
        
        // Home page
        'home.welcome': 'Welcome to Fete Lite!',
        'home.description': 'Organize social events quickly and easily',
        'home.createEvent': 'Create event',
        'home.myEvents': 'My events',
        'home.noEvents': 'No events',
        'home.noEventsDesc': 'Create your first event and start organizing meetings!',
        'home.createFirst': 'Create first event',
        'home.viewDetails': 'View details',
        
        // Filters
        'filter.all': 'All',
        'filter.upcoming': 'Upcoming',
        'filter.past': 'Past',
        
        // Create event
        'create.title': 'New event',
        'create.basicInfo': 'Basic information',
        'create.eventTitle': 'Event name',
        'create.titlePlaceholder': 'e.g. BBQ in the park',
        'create.description': 'Event description',
        'create.descriptionPlaceholder': 'Describe event details, what will happen...',
        'create.dateTime': 'Date and time',
        'create.startDate': 'Start date',
        'create.startTime': 'Start time',
        'create.endDate': 'End date',
        'create.endTime': 'End time',
        'create.location': 'Location',
        'create.eventLocation': 'Event location',
        'create.locationPlaceholder': 'Address or place name',
        'create.locationHelp': 'Click 📍 to get current location or 🗺️ to select on map',
        'create.selectLocationOnMap': 'Select location on map',
        'create.mapInstructions': 'Click on the map to select event location',
        'create.selectedLocation': 'Selected location:',
        'create.loadingAddress': 'Loading address...',
        'create.additionalOptions': 'Additional options',
        'create.food': 'Food',
        'create.drinks': 'Drinks',
        'create.alcohol': 'Alcohol',
        'create.accommodation': 'Accommodation',
        'create.music': 'Music',
        'create.games': 'Games/Activities',
        'create.preview': 'Preview',
        'create.save': 'Save event',
        'create.previewTitle': 'Event preview',
        'create.backToEditing': 'Back to editing',
        'create.eventCreated': 'Event created!',
        'create.eventSaved': 'Your event has been successfully saved.',
        'create.invitationCode': 'Invitation code',
        'create.invitationHelp': 'Share this 8-character code with friends so they can join',
        'create.shareEvent': 'Share event',
        'create.qrHelp': 'Scan QR code to share event',
        'create.viewEvent': 'View event',
        'create.createAnother': 'Create another',
        'create.backToHome': 'Home page',
        
        // New form fields
        'create.requirements': 'Requirements and preferences',
        'create.foodRequirements': 'Dietary requirements',
        'create.foodRequirementsPlaceholder': 'e.g. Vegetarian options, gluten-free, no nuts...',
        'create.alcoholPolicy': 'Alcohol policy',
        'create.alcoholAllowed': 'Alcohol provided by organizer',
        'create.alcoholNotAllowed': 'No alcohol',
        'create.byob': 'Bring your own alcohol',
        'create.drinksProvided': 'Drinks will be provided by organizer',
        'create.financial': 'Financial information',
        'create.entryFee': 'Entry fee (PLN)',
        'create.organizerBlik': 'Your BLIK code',
        'create.blikPlaceholder': '123456',
        'create.blikHelp': 'BLIK code will make it easier for participants to pay fees',
        'create.participants': 'Participants and accommodation',
        'create.maxParticipants': 'Participant limit',
        'create.maxParticipantsLabel': 'Maximum number of participants',
        'create.maxOvernightParticipants': 'Maximum overnight participants',
        'create.dressCode': 'Dress code',
        'create.dressCodeLabel': 'Select dress code for the event',
        'create.dressCodeNone': 'No requirements',
        'create.dressCodeCasual': 'Casual',
        'create.dressCodeSmartCasual': 'Smart casual',
        'create.dressCodeFormal': 'Formal',
        'create.dressCodeCostume': 'Costume',
        'create.dressCodeTheme': 'Themed',
        'create.dressCodeCustom': 'Other',
        'create.dressCodeCustomPlaceholder': 'e.g. Pirate costume, red colored clothing...',
        'create.selectDressCode': 'Select dress code',
        'create.selectedDressCode': 'Selected:',
        'create.change': 'Change',
        'create.dressCodeNoneDesc': 'Any attire',
        'create.dressCodeCasualDesc': 'Casual, everyday clothing',
        'create.dressCodeSmartCasualDesc': 'Smart casual attire',
        'create.dressCodeFormalDesc': 'Formal attire',
        'create.dressCodeCostumeDesc': 'Themed costumes',
        'create.dressCodeThemeDesc': 'According to event theme',
        'create.dressCodeCustomDesc': 'Enter custom requirements',
        'create.customDressCodeLabel': 'Enter custom requirements:',
        'create.accommodationAvailable': 'Accommodation available',
        'create.accommodationInfo': 'Accommodation information',
        'create.accommodationInfoPlaceholder': 'Describe accommodation conditions, number of places, costs...',
        'create.media': 'Event photos',
        'create.eventImages': 'Add photos',
        'create.uploadImages': 'Click to add photos or drag them here',
        'create.imageFormats': 'Format: JPG, PNG, WEBP (max 5MB each)',
        
        // Sharing
        'share.title': 'Share event',
        'share.copyLink': 'Copy link',
        'share.qrCode': 'QR Code',
        'share.eventCode': 'Event code',
        'share.codeDescription': 'Others can use this code to find the event',
        'share.downloadQR': 'Download QR',
        'share.nativeShare': 'Share...',
        
        // Event details
        'details.title': 'Event details',
        'details.description': 'Description',
        'details.features': 'What will be at the event',
        'details.location': 'Location',
        'details.getDirections': 'Get directions',
        'details.exportCalendar': 'Export to calendar',
        'details.showQR': 'Show QR code',
        'details.editEvent': 'Edit event',
        'details.deleteEvent': 'Delete event',
        'details.shareTitle': 'Share event',
        'details.qrDescription': 'Scan this QR code to share event',
        'details.copyLink': 'Copy link',
        'details.confirmDelete': 'Confirm deletion',
        'details.deleteWarning': 'Are you sure you want to delete this event? This action cannot be undone.',
        'details.cancel': 'Cancel',
        'details.confirmDeleteBtn': 'Yes, delete event',
        'details.editTitle': 'Edit event',
        'details.editComingSoon': 'Event editing feature will be available soon.',
        'details.editWorkaround': 'For now you can create a new event with similar data.',
        'details.close': 'Close',
        'details.createNew': 'Create new',
        
        // Notifications
        'notifications.title': 'Notifications',
        'notifications.empty': 'No new notifications',
        'notifications.enable': 'Enable event notifications',
        'notifications.permission': 'To receive notifications, you need to grant permission in the browser.',
        'notifications.granted': 'Notifications have been enabled',
        'notifications.denied': 'Notifications have been disabled',
        'notifications.eventReminder': 'Event reminder',
        'notifications.eventStarting': 'Event starts in one hour',
        
        // Offline
        'offline.message': '🔌 No connection - working in offline mode',
        
        // Loading
        'loading.events': 'Loading events...',
        'loading.event': 'Loading event...',
        
        // Errors
        'error.eventNotFound': 'Event not found',
        'error.eventNotFoundDesc': 'Event may have been deleted or does not exist.',
        'error.backToHome': 'Back to home page',
        'error.loadError': 'Error loading event',
        'error.noEventId': 'No event ID provided',
        'error.geolocationDenied': 'Location access denied',
        'error.geolocationUnavailable': 'Geolocation is unavailable',
        'error.geolocationTimeout': 'Location timeout exceeded',
        
        // Validation
        'validation.titleRequired': 'Event name is required',
        'validation.titleTooLong': 'Event name is too long (max 100 characters)',
        'validation.startDateRequired': 'Start date is required',
        'validation.startTimeRequired': 'Start time is required',
        'validation.pastDate': 'Event date cannot be in the past',
        'validation.endBeforeStart': 'End date cannot be earlier than start date',
        
        // Authorization
        'auth.title': 'Sign In - Fete Lite',
        'auth.welcome': 'Welcome back!',
        'auth.login': 'Sign In',
        'auth.register': 'Sign Up',
        'auth.email': 'Email',
        'auth.password': 'Password',
        'auth.password_confirm': 'Confirm Password',
        'auth.remember': 'Remember me',
        'auth.forgot': 'Forgot password?',
        'auth.personal_data': 'Personal Information',
        'auth.first_name': 'First Name',
        'auth.last_name': 'Last Name',
        'auth.birth_date': 'Birth Date',
        'auth.city': 'City',
        'auth.contact_data': 'Contact Information',
        'auth.phone': 'Phone Number',
        'auth.preferences': 'Preferences',
        'auth.dietary_preferences': 'Dietary Preferences',
        'auth.blik': 'BLIK Code (optional)',
        'auth.blik_help': 'BLIK code will make event payments easier',
        'auth.accept_terms': 'I accept the terms and privacy policy',
        'auth.marketing_consent': 'I consent to receiving marketing information',
        'auth.create_account': 'Create Account',
        'auth.or': 'or',
        'auth.google_login': 'Sign in with Google',
        'auth.have_account': 'Already have an account? Sign in',
        'auth.no_account': 'Don\'t have an account? Sign up',
        
        // Dietary preferences
        'dietary.vegetarian': 'Vegetarian',
        'dietary.vegan': 'Vegan',
        'dietary.gluten_free': 'Gluten-free',
        'dietary.lactose_free': 'Lactose-free',
        'dietary.halal': 'Halal',
        
        // Success
        'success.eventSaved': 'Event has been saved',
        'success.eventDeleted': 'Event has been deleted',
        'success.linkCopied': 'Link copied to clipboard',
        'success.locationObtained': 'Location obtained',
        'success.calendarExported': 'Event exported to calendar',
        
        // Geolocation
        'geolocation.getting': 'Getting location...',
        'geolocation.success': 'Location obtained',
        'geolocation.error': 'Failed to get location',
        
        // Dates
        'date.today': 'Today',
        'date.tomorrow': 'Tomorrow',
        'date.yesterday': 'Yesterday',
        
        // Months (abbreviated)
        'month.jan': 'Jan',
        'month.feb': 'Feb',
        'month.mar': 'Mar',
        'month.apr': 'Apr',
        'month.may': 'May',
        'month.jun': 'Jun',
        'month.jul': 'Jul',
        'month.aug': 'Aug',
        'month.sep': 'Sep',
        'month.oct': 'Oct',
        'month.nov': 'Nov',
        'month.dec': 'Dec',
        
        // Calendar export
        'ics.manualDownload': 'Manual Download',
        'ics.copyContent': 'Copy the content below and save as .ics file:',
        'ics.saveAs': 'Save as',
        'ics.close': 'Close',
        
        // Dark mode
        'darkMode.lightTheme': 'Light theme',
        'darkMode.darkTheme': 'Dark theme',
        'darkMode.autoTheme': 'Automatic',
        'darkMode.themeChanged': 'Theme changed to: {theme}',
        'darkMode.systemThemeChanged': 'System theme has changed',
        'darkMode.switchToLight': 'Switch to light theme',
        'darkMode.switchToDark': 'Switch to dark theme',
        'darkMode.toggleTheme': 'Toggle theme',
        'darkMode.theme': 'Theme',
        'darkMode.resetToDefaults': 'Theme settings restored to defaults',
        
        // Network
        'network.offline': 'Offline mode',
        'network.offlineDescription': 'No internet connection. Some features may be limited.',
        'network.retry': 'Retry',
        'network.checking': 'Checking...',
        'network.connectionRestored': 'Internet connection has been restored',
        'network.connectionLost': 'Internet connection lost',
        'network.stillOffline': 'Still no internet connection',
        'network.syncAvailable': 'Data available for sync ({count})',
        'network.syncCompleted': 'Synchronized {count} items',
        'network.syncError': 'Error during synchronization',
        
        // Notifications
        'notifications.pushNotifications': 'Push notifications',
        'notifications.receiveReminders': 'Receive event reminders',
        'notifications.settings': 'Notification settings',
        'notifications.enabled': 'Notifications have been enabled',
        'notifications.disabled': 'Notifications have been disabled',
        'notifications.eventReminder': 'Event reminder',
        'notifications.eventStartsAt': '{title} starts at {time}',
        'notifications.newEvent': 'New event',
        'notifications.newEventCreated': 'Event created: {title}',
        'notifications.viewEvent': 'View event',
        'notifications.dismiss': 'Dismiss',
        'notifications.enableReminders': 'Enable event reminders',
        'notifications.reminderTime': 'Reminder time',
        'notifications.minutesBefore': 'minutes before',
        'notifications.hourBefore': 'hour before',
        'notifications.hoursBefore': 'hours before',
        'notifications.other': 'Other',
        'notifications.newEvents': 'New event notifications',
        'notifications.settingsSaved': 'Notification settings have been saved',
        'notifications.permissionDeniedHelp': 'Notifications have been blocked. Unblock them in browser settings.',
        'notifications.permissionHelp': 'To receive notifications, you need to grant permission in the browser.',
        'notifications.test': 'Test notification',
        'notifications.testMessage': 'This is a sample notification from Fete Lite!',
        'notifications.eventStarting': 'Event starting soon',
        
        // Sample data
        'sampleData.title': 'Sample data',
        'sampleData.description': 'Load sample events to test app functionality.',
        'sampleData.loadButton': 'Load samples',
        'sampleData.clearButton': 'Clear samples',
        'sampleData.loaded': 'Loaded {count} sample events',
        'sampleData.cleared': 'Sample events removed',
        'sampleData.clearConfirm': 'Are you sure you want to remove all sample events?',
        'sampleData.loadedAt': 'Loaded on {date} at {time}',
        'sampleData.currentlyLoaded': 'Sample data is loaded',
        'sampleData.notLoaded': 'Sample data is not loaded',
        
        // Settings
        'settings.title': 'Settings',
        'settings.profile': 'User Profile',
        'settings.welcomeUser': 'Event Organizer',
        'settings.memberSince': 'Member since October 2025',
        'settings.appSettings': 'App Settings',
        'settings.language': 'Language',
        'settings.languageDesc': 'Choose interface language',
        'settings.theme': 'Theme',
        'settings.themeDesc': 'Customize app appearance',
        'settings.lightTheme': 'Light',
        'settings.darkTheme': 'Dark',
        'settings.autoTheme': 'Auto',
        'settings.notifications': 'Notifications',
        'settings.pushNotifications': 'Push notifications',
        'settings.pushDesc': 'Receive event reminders',
        'settings.dataPrivacy': 'Data & Privacy',
        'settings.exportData': 'Export data',
        'settings.exportDesc': 'Download copy of your events',
        'settings.clearData': 'Clear data',
        'settings.clearDesc': 'Delete all events and settings',
        'settings.about': 'About',
        'settings.version': 'Version {version}',
        'settings.description': 'Organize social events quickly and easily',
        'settings.languageChanged': 'Language changed to: {language}',
        'settings.themeChanged': 'Theme changed to: {theme}',
        'settings.notificationsEnabled': 'Notifications enabled',
        'settings.notificationsDisabled': 'Notifications disabled',
        'settings.notificationsDenied': 'Notification permission denied',
        'settings.notificationsNotSupported': 'Notifications not supported',
        'settings.notificationsError': 'Error enabling notifications',
        'settings.dataExported': 'Data exported successfully',
        'settings.exportError': 'Error exporting data',
        'settings.dataCleared': 'Data cleared successfully',
        'settings.clearError': 'Error clearing data',
        'settings.clearDataConfirm': 'Are you sure you want to delete all events? This action cannot be undone.',

        
        // Update system
        'update.available': 'Update available!',
        'update.newVersionReady': 'New version {version} is ready',
        'update.description': 'New version includes bug fixes and new features.',
        'update.updateNow': 'Update Now',
        'update.updateLater': 'Later',
        'update.updating': 'Updating application...',
        'update.error': '❌ Update error. Please try again later.',
        'update.step1': 'Downloading files',
        'update.step2': 'Updating cache',
        'update.step3': 'Finalizing',
        
        // Navigation
        'nav.settings': 'Settings'
      }
    };
  }

  // Pobierz tłumaczenie
  t(key, replacements = {}) {
    const translation = this.translations[this.currentLang]?.[key] || 
                       this.translations['pl'][key] || 
                       key;
    
    // Zastąp placeholdery jeśli są podane
    let result = translation;
    Object.keys(replacements).forEach(placeholder => {
      result = result.replace(`{${placeholder}}`, replacements[placeholder]);
    });
    
    return result;
  }

  // Zmień język
  setLanguage(lang) {
    if (!this.translations[lang]) {
      console.warn(`Language ${lang} not supported`);
      return;
    }
    
    this.currentLang = lang;
    this.setStoredLanguage(lang);
    this.updateDOM();
    
    // Wyślij event o zmianie języka
    document.dispatchEvent(new CustomEvent('languageChanged', {
      detail: { language: lang }
    }));
  }

  // Aktualizuj DOM po zmianie języka
  updateDOM() {
    // Aktualizuj wszystkie elementy z data-i18n
    document.querySelectorAll('[data-i18n]').forEach(element => {
      const key = element.getAttribute('data-i18n');
      element.textContent = this.t(key);
    });

    // Aktualizuj placeholdery
    document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
      const key = element.getAttribute('data-i18n-placeholder');
      element.placeholder = this.t(key);
    });

    // Aktualizuj aria-label
    document.querySelectorAll('[data-i18n-aria-label]').forEach(element => {
      const key = element.getAttribute('data-i18n-aria-label');
      element.setAttribute('aria-label', this.t(key));
    });

    // Aktualizuj title
    document.querySelectorAll('[data-i18n-title]').forEach(element => {
      const key = element.getAttribute('data-i18n-title');
      element.title = this.t(key);
    });

    // Aktualizuj lang attribute
    document.documentElement.lang = this.currentLang;

    // Aktualizuj selector języka
    const languageSelector = document.getElementById('language-selector');
    if (languageSelector) {
      languageSelector.value = this.currentLang;
    }
  }

  // Pobierz aktualny język
  getCurrentLanguage() {
    return this.currentLang;
  }

  // Sprawdź czy język jest obsługiwany
  isLanguageSupported(lang) {
    return this.translations.hasOwnProperty(lang);
  }

  // Inicjalizacja systemu i18n
  init() {
    this.updateDOM();
    
    // Nasłuchuj na zmiany w selectorze języka
    const languageSelector = document.getElementById('language-selector');
    if (languageSelector) {
      languageSelector.value = this.currentLang;
      languageSelector.addEventListener('change', (e) => {
        this.setLanguage(e.target.value);
      });
    }


  }
}

// Globalna instancja i18n
window.i18n = new I18n();

// Funkcja pomocnicza do szybkiego tłumaczenia
window.t = (key, replacements) => window.i18n.t(key, replacements);

// Inicjalizacja po załadowaniu DOM
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.i18n.init();
  });
} else {
  window.i18n.init();
}