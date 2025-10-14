// Fete Lite - Eksport do kalendarza (.ics)
// Generowanie plików iCalendar z automatyczną strefą czasową

class ICSExportManager {
  constructor() {
    this.timezone = this.detectTimezone();
    console.log('[ICS] Export manager initialized, timezone:', this.timezone);
  }

  // Wykryj strefę czasową użytkownika
  detectTimezone() {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone;
    } catch (error) {
      console.warn('[ICS] Could not detect timezone, using default');
      return 'Europe/Warsaw';
    }
  }

  // Eksportuj wydarzenie do kalendarza
  async exportEventToCalendar(event) {
    try {
      const icsContent = this.generateICSContent(event);
      const filename = this.sanitizeFilename(`${event.title}.ics`);
      
      await this.downloadICSFile(icsContent, filename);
      
      showNotification(t('success.calendarExported'), 'success');
      console.log('[ICS] Event exported:', event.id);
      
      return true;
      
    } catch (error) {
      console.error('[ICS] Export error:', error);
      showNotification(t('error.calendarExport'), 'error');
      return false;
    }
  }

  // Generuj zawartość pliku ICS
  generateICSContent(event) {
    const startDate = new Date(event.startDate);
    const endDate = event.endDate ? new Date(event.endDate) : this.calculateDefaultEndDate(startDate);
    
    // Wygeneruj UID (unikalne ID)
    const uid = this.generateUID(event);
    
    // Aktualna data (timestamp utworzenia)
    const now = new Date();
    const dtstamp = this.formatDateForICS(now, true);
    
    // Formatuj daty
    const dtstart = this.formatDateForICS(startDate);
    const dtend = this.formatDateForICS(endDate);
    
    // Zbuduj zawartość ICS
    const icsLines = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Fete Lite//Event Organizer//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      this.generateTimezoneComponent(),
      'BEGIN:VEVENT',
      `UID:${uid}`,
      `DTSTAMP:${dtstamp}`,
      `DTSTART;TZID=${this.timezone}:${dtstart}`,
      `DTEND;TZID=${this.timezone}:${dtend}`,
      `SUMMARY:${this.escapeICSText(event.title)}`,
      event.description ? `DESCRIPTION:${this.escapeICSText(event.description)}` : '',
      event.location ? `LOCATION:${this.escapeICSText(event.location)}` : '',
      `STATUS:CONFIRMED`,
      `SEQUENCE:0`,
      `CREATED:${this.formatDateForICS(new Date(event.createdAt || event.startDate), true)}`,
      `LAST-MODIFIED:${this.formatDateForICS(new Date(event.updatedAt || now), true)}`,
      this.generateCategories(event.options),
      this.generateAlarm(),
      'END:VEVENT',
      'END:VCALENDAR'
    ];

    // Usuń puste linie i złącz
    return icsLines
      .filter(line => line.trim() !== '')
      .map(line => this.foldICSLine(line))
      .join('\r\n');
  }

  // Wygeneruj komponent strefy czasowej
  generateTimezoneComponent() {
    const timezoneLines = [
      'BEGIN:VTIMEZONE',
      `TZID:${this.timezone}`,
      // Uproszczona implementacja - w pełnej wersji należałoby dodać
      // szczegóły DST (Daylight Saving Time)
      'BEGIN:STANDARD',
      'DTSTART:19701025T030000',
      'RRULE:FREQ=YEARLY;BYMONTH=10;BYDAY=-1SU',
      'TZNAME:CET',
      'TZOFFSETFROM:+0200',
      'TZOFFSETTO:+0100',
      'END:STANDARD',
      'BEGIN:DAYLIGHT',
      'DTSTART:19700329T020000',
      'RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=-1SU',
      'TZNAME:CEST',
      'TZOFFSETFROM:+0100',
      'TZOFFSETTO:+0200',
      'END:DAYLIGHT',
      'END:VTIMEZONE'
    ];

    return timezoneLines.join('\r\n');
  }

  // Wygeneruj unikalne UID
  generateUID(event) {
    const timestamp = new Date(event.createdAt || event.startDate).getTime();
    const eventId = event.id || 'unknown';
    const domain = window.location.hostname || 'fete-lite.app';
    
    return `${eventId}-${timestamp}@${domain}`;
  }

  // Formatuj datę dla ICS
  formatDateForICS(date, isUTC = false) {
    if (isUTC) {
      // Format UTC: YYYYMMDDTHHMMSSZ
      return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
    } else {
      // Format lokalny: YYYYMMDDTHHMMSS
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      const seconds = String(date.getSeconds()).padStart(2, '0');
      
      return `${year}${month}${day}T${hours}${minutes}${seconds}`;
    }
  }

  // Oblicz domyślną datę zakończenia (2 godziny po starcie)
  calculateDefaultEndDate(startDate) {
    const endDate = new Date(startDate);
    endDate.setHours(endDate.getHours() + 2);
    return endDate;
  }

  // Escapuj tekst dla ICS
  escapeICSText(text) {
    if (!text) return '';
    
    return text
      .replace(/\\/g, '\\\\')  // Backslash
      .replace(/;/g, '\\;')    // Semicolon
      .replace(/,/g, '\\,')    // Comma
      .replace(/\n/g, '\\n')   // Newline
      .replace(/\r/g, '')      // Remove carriage return
      .trim();
  }

  // Złóż linię ICS (maksymalnie 75 znaków)
  foldICSLine(line) {
    if (line.length <= 75) {
      return line;
    }

    const folded = [];
    let currentLine = line;

    while (currentLine.length > 75) {
      // Znajdź najlepsze miejsce do złamania (unikaj łamania w środku słowa)
      let breakPoint = 75;
      
      // Spróbuj znaleźć spację przed 75 znakiem
      for (let i = 74; i > 60; i--) {
        if (currentLine[i] === ' ') {
          breakPoint = i;
          break;
        }
      }

      folded.push(currentLine.substring(0, breakPoint));
      currentLine = ' ' + currentLine.substring(breakPoint); // Kontynuacja z spacją
    }

    if (currentLine.trim()) {
      folded.push(currentLine);
    }

    return folded.join('\r\n');
  }

  // Wygeneruj kategorie na podstawie opcji wydarzenia
  generateCategories(options) {
    if (!options || options.length === 0) {
      return '';
    }

    const categoryMapping = {
      food: 'FOOD',
      drinks: 'SOCIAL',
      alcohol: 'PARTY',
      accommodation: 'TRAVEL',
      music: 'ENTERTAINMENT',
      games: 'ENTERTAINMENT'
    };

    const categories = options
      .map(option => categoryMapping[option] || option.toUpperCase())
      .filter((category, index, arr) => arr.indexOf(category) === index) // Usuń duplikaty
      .join(',');

    return categories ? `CATEGORIES:${categories}` : '';
  }

  // Wygeneruj alarm (przypomnienie)
  generateAlarm() {
    const alarmLines = [
      'BEGIN:VALARM',
      'TRIGGER;VALUE=DURATION:-PT1H', // 1 godzinę przed
      'REPEAT:1',
      'DURATION:PT15M',
      'ACTION:DISPLAY',
      `DESCRIPTION:${this.escapeICSText(t('notifications.eventStarting'))}`,
      'END:VALARM'
    ];

    return alarmLines.join('\r\n');
  }

  // Pobierz plik ICS
  async downloadICSFile(content, filename) {
    try {
      // Utwórz Blob z zawartością ICS
      const blob = new Blob([content], {
        type: 'text/calendar;charset=utf-8'
      });

      // Sprawdź czy obsługiwane jest File API
      if (window.navigator && window.navigator.msSaveOrOpenBlob) {
        // Internet Explorer
        window.navigator.msSaveOrOpenBlob(blob, filename);
        return;
      }

      // Nowoczesne przeglądarki
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.style.display = 'none';

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Zwolnij pamięć
      setTimeout(() => URL.revokeObjectURL(url), 100);

    } catch (error) {
      console.error('[ICS] Download error:', error);
      
      // Fallback - pokaż zawartość do skopiowania
      this.showICSFallback(content, filename);
    }
  }

  // Fallback - pokaż zawartość ICS do skopiowania
  showICSFallback(content, filename) {
    const modal = document.createElement('div');
    modal.className = 'ics-fallback-modal';
    modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h3>${t('ics.manualDownload')}</h3>
          <button class="modal-close" onclick="this.closest('.ics-fallback-modal').remove()">&times;</button>
        </div>
        <div class="modal-body">
          <p>${t('ics.copyContent')}</p>
          <textarea readonly style="width: 100%; height: 200px; font-family: monospace; font-size: 12px;">${content}</textarea>
          <p><strong>${t('ics.saveAs')}:</strong> ${filename}</p>
        </div>
        <div class="modal-footer">
          <button onclick="this.closest('.ics-fallback-modal').remove()" class="btn btn-secondary">
            ${t('ics.close')}
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
      zIndex: '10000',
      padding: '20px'
    });

    document.body.appendChild(modal);

    // Zaznacz tekst
    const textarea = modal.querySelector('textarea');
    textarea.focus();
    textarea.select();
  }

  // Oczyść nazwę pliku
  sanitizeFilename(filename) {
    return filename
      .replace(/[^a-z0-9.-]/gi, '_') // Zastąp nieprawidłowe znaki
      .replace(/_+/g, '_')          // Usuń wielokrotne podkreślenia
      .replace(/^_|_$/g, '')        // Usuń podkreślenia z początku i końca
      .toLowerCase();
  }

  // Eksportuj wiele wydarzeń do jednego pliku
  async exportMultipleEvents(events) {
    try {
      if (!events || events.length === 0) {
        throw new Error('No events to export');
      }

      let icsContent = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//Fete Lite//Event Organizer//EN',
        'CALSCALE:GREGORIAN',
        'METHOD:PUBLISH',
        this.generateTimezoneComponent()
      ];

      // Dodaj każde wydarzenie
      events.forEach(event => {
        const eventLines = this.generateEventLines(event);
        icsContent = icsContent.concat(eventLines);
      });

      icsContent.push('END:VCALENDAR');

      const finalContent = icsContent.join('\r\n');
      const filename = `fete-lite-events-${new Date().toISOString().split('T')[0]}.ics`;

      await this.downloadICSFile(finalContent, filename);
      
      showNotification(
        t('success.multipleEventsExported', { count: events.length }), 
        'success'
      );

      return true;

    } catch (error) {
      console.error('[ICS] Multiple export error:', error);
      showNotification(t('error.multipleEventsExport'), 'error');
      return false;
    }
  }

  // Wygeneruj linie ICS dla pojedynczego wydarzenia
  generateEventLines(event) {
    const startDate = new Date(event.startDate);
    const endDate = event.endDate ? new Date(event.endDate) : this.calculateDefaultEndDate(startDate);
    const uid = this.generateUID(event);
    const now = new Date();

    return [
      'BEGIN:VEVENT',
      `UID:${uid}`,
      `DTSTAMP:${this.formatDateForICS(now, true)}`,
      `DTSTART;TZID=${this.timezone}:${this.formatDateForICS(startDate)}`,
      `DTEND;TZID=${this.timezone}:${this.formatDateForICS(endDate)}`,
      `SUMMARY:${this.escapeICSText(event.title)}`,
      event.description ? `DESCRIPTION:${this.escapeICSText(event.description)}` : '',
      event.location ? `LOCATION:${this.escapeICSText(event.location)}` : '',
      'STATUS:CONFIRMED',
      'SEQUENCE:0',
      `CREATED:${this.formatDateForICS(new Date(event.createdAt || event.startDate), true)}`,
      `LAST-MODIFIED:${this.formatDateForICS(new Date(event.updatedAt || now), true)}`,
      this.generateCategories(event.options),
      this.generateAlarm(),
      'END:VEVENT'
    ].filter(line => line.trim() !== '');
  }

  // Waliduj wydarzenie przed eksportem
  validateEventForExport(event) {
    const errors = [];

    if (!event.title) {
      errors.push('Event title is required');
    }

    if (!event.startDate) {
      errors.push('Event start date is required');
    }

    if (event.startDate && event.endDate) {
      const start = new Date(event.startDate);
      const end = new Date(event.endDate);
      
      if (end <= start) {
        errors.push('End date must be after start date');
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Pobierz informacje o strefie czasowej
  getTimezoneInfo() {
    const date = new Date();
    const offset = date.getTimezoneOffset();
    const offsetHours = Math.floor(Math.abs(offset) / 60);
    const offsetMinutes = Math.abs(offset) % 60;
    const offsetSign = offset <= 0 ? '+' : '-';

    return {
      timezone: this.timezone,
      offset: `${offsetSign}${String(offsetHours).padStart(2, '0')}:${String(offsetMinutes).padStart(2, '0')}`,
      isDST: this.isDaylightSavingTime(date)
    };
  }

  // Sprawdź czy aktywny jest czas letni
  isDaylightSavingTime(date) {
    const january = new Date(date.getFullYear(), 0, 1);
    const july = new Date(date.getFullYear(), 6, 1);
    return Math.max(january.getTimezoneOffset(), july.getTimezoneOffset()) !== date.getTimezoneOffset();
  }

  // Konwertuj wydarzenie na format Google Calendar URL
  generateGoogleCalendarUrl(event) {
    const startDate = new Date(event.startDate);
    const endDate = event.endDate ? new Date(event.endDate) : this.calculateDefaultEndDate(startDate);

    const formatDateForGoogle = (date) => {
      return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
    };

    const params = new URLSearchParams({
      action: 'TEMPLATE',
      text: event.title,
      dates: `${formatDateForGoogle(startDate)}/${formatDateForGoogle(endDate)}`,
      details: event.description || '',
      location: event.location || '',
      ctz: this.timezone
    });

    return `https://calendar.google.com/calendar/render?${params.toString()}`;
  }

  // Otwórz w Google Calendar
  openInGoogleCalendar(event) {
    const url = this.generateGoogleCalendarUrl(event);
    window.open(url, '_blank');
  }
}

// Globalna instancja ICSExportManager
window.icsExportManager = new ICSExportManager();

// Event listenery dla eksportu do kalendarza
document.addEventListener('DOMContentLoaded', () => {
  // Przycisk eksportu w szczegółach wydarzenia
  const exportBtn = document.getElementById('export-calendar-btn');
  if (exportBtn) {
    exportBtn.addEventListener('click', () => {
      if (window.currentEvent) {
        window.icsExportManager.exportEventToCalendar(window.currentEvent);
      }
    });
  }

  // Dodaj obsługę eksportu z kart wydarzeń (można dodać w przyszłości)
  document.addEventListener('click', (e) => {
    if (e.target.classList.contains('export-btn') || e.target.closest('.export-btn')) {
      const eventCard = e.target.closest('.event-card');
      if (eventCard) {
        const eventId = eventCard.getAttribute('data-event-id');
        const event = window.storageManager.getEvent(eventId);
        if (event) {
          window.icsExportManager.exportEventToCalendar(event);
        }
      }
    }
  });
});

// Funkcje globalne dla łatwiejszego użycia
window.exportToCalendar = (event) => 
  window.icsExportManager.exportEventToCalendar(event);

window.openInGoogleCalendar = (event) => 
  window.icsExportManager.openInGoogleCalendar(event);

console.log('[ICS] ICSExportManager initialized');