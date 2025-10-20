// Fete Lite - Event Themes Configuration
// Konfiguracja tematyk wydarzeń

const EVENT_THEMES = [
  {
    id: 'birthday',
    icon: '🎂',
    labelKey: 'theme.birthday',
    order: 1
  },
  {
    id: 'bbq',
    icon: '🔥',
    labelKey: 'theme.bbq',
    order: 2
  },
  {
    id: 'boardgames',
    icon: '🎲',
    labelKey: 'theme.boardgames',
    order: 3
  },
  {
    id: 'bar',
    icon: '🍻',
    labelKey: 'theme.bar',
    order: 4
  },
  {
    id: 'integration',
    icon: '🤝',
    labelKey: 'theme.integration',
    order: 5
  },
  {
    id: 'karaoke',
    icon: '🎤',
    labelKey: 'theme.karaoke',
    order: 6
  },
  {
    id: 'cinema',
    icon: '🎬',
    labelKey: 'theme.cinema',
    order: 7
  },
  {
    id: 'museum',
    icon: '🖼️',
    labelKey: 'theme.museum',
    order: 8
  },
  {
    id: 'theater',
    icon: '🎭',
    labelKey: 'theme.theater',
    order: 9
  },
  {
    id: 'minigolf',
    icon: '⛳',
    labelKey: 'theme.minigolf',
    order: 10
  },
  {
    id: 'concert',
    icon: '🎵',
    labelKey: 'theme.concert',
    order: 11
  },
  {
    id: 'sport',
    icon: '⚽',
    labelKey: 'theme.sport',
    order: 12
  },
  {
    id: 'picnic',
    icon: '🧺',
    labelKey: 'theme.picnic',
    order: 13
  },
  {
    id: 'party',
    icon: '🎉',
    labelKey: 'theme.party',
    order: 14
  },
  {
    id: 'dance',
    icon: '💃',
    labelKey: 'theme.dance',
    order: 15
  },
  {
    id: 'other',
    icon: '📅',
    labelKey: 'theme.other',
    order: 99,
    isDefault: true
  }
];

// Helper functions
const EventThemes = {
  // Pobierz wszystkie tematyki
  getAll() {
    return EVENT_THEMES.sort((a, b) => a.order - b.order);
  },

  // Pobierz tematykę po ID
  getById(id) {
    return EVENT_THEMES.find(theme => theme.id === id);
  },

  // Pobierz domyślną tematykę
  getDefault() {
    return EVENT_THEMES.find(theme => theme.isDefault) || EVENT_THEMES[EVENT_THEMES.length - 1];
  },

  // Pobierz konfigurację dla selecta/radiobuttons
  getThemeConfig() {
    const config = {};
    EVENT_THEMES.forEach(theme => {
      config[theme.id] = {
        icon: theme.icon,
        label: window.t ? window.t(theme.labelKey) : theme.labelKey
      };
    });
    return config;
  },

  // Renderuj opcje tematyk do HTML
  renderThemeOptions(containerSelector) {
    const container = document.querySelector(containerSelector);
    if (!container) {
      console.error('[EventThemes] Container not found:', containerSelector);
      return;
    }

    container.innerHTML = '';
    const themes = this.getAll();
    const defaultTheme = this.getDefault();

    themes.forEach(theme => {
      const label = document.createElement('label');
      label.className = 'event-theme-option';
      
      const isChecked = theme.id === defaultTheme.id;
      
      label.innerHTML = `
        <input type="radio" name="eventTheme" value="${theme.id}" ${isChecked ? 'checked' : ''}>
        <span class="theme-card">
          <span class="theme-icon">${theme.icon}</span>
          <span class="theme-label" data-i18n="${theme.labelKey}">${window.t ? window.t(theme.labelKey) : theme.labelKey}</span>
        </span>
      `;
      
      container.appendChild(label);
    });

    console.log(`[EventThemes] Rendered ${themes.length} theme options`);
  }
};

// Eksportuj do użycia globalnego
if (typeof window !== 'undefined') {
  window.EventThemes = EventThemes;
  window.EVENT_THEMES = EVENT_THEMES;
}
