// Fete Lite - Mobile Fullscreen Handler
// Automatyczne ukrywanie paska adresu na urządzeniach mobilnych

class MobileFullscreen {
  constructor() {
    this.isStandalone = false;
    this.isIOS = false;
    this.isAndroid = false;
    this.init();
  }

  init() {
    this.detectPlatform();
    this.checkStandaloneMode();
    
    if (!this.isStandalone) {
      this.hideAddressBar();
      this.showInstallPrompt();
    }
    
    this.handleOrientationChange();
    
    // Nasłuchuj scroll dla ukrycia paska adresu
    this.handleScrollHiding();
  }

  detectPlatform() {
    const userAgent = navigator.userAgent.toLowerCase();
    
    this.isIOS = /iphone|ipad|ipod/.test(userAgent);
    this.isAndroid = /android/.test(userAgent);
  }

  checkStandaloneMode() {
    this.isStandalone = 
      window.navigator.standalone ||
      window.matchMedia('(display-mode: standalone)').matches ||
      window.matchMedia('(display-mode: fullscreen)').matches ||
      window.matchMedia('(display-mode: minimal-ui)').matches;
    
    if (this.isStandalone) {
      document.body.classList.add('standalone-mode');
    }
  }

  hideAddressBar() {
    if (this.isStandalone) {
      return;
    }
    
    // Delikatna metoda - tylko jeden raz przy starcie
    const gentleHide = () => {
      if (window.scrollY === 0) {
        window.scrollTo(0, 1);
        setTimeout(() => window.scrollTo(0, 0), 300);
      }
    };

    // Wywołaj tylko przy załadowaniu
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        setTimeout(gentleHide, 1000);
      });
    } else {
      setTimeout(gentleHide, 1000);
    }
  }

  handleScrollHiding() {
    // Wyłączone - funkcja interferowała z normalnym scrollowaniem
  }

  handleOrientationChange() {
    const handleChange = () => {
      setTimeout(() => {
        this.hideAddressBar();
      }, 500);
    };

    // Nasłuchuj zmian orientacji
    window.addEventListener('orientationchange', handleChange);
    
    // Nasłuchuj zmian rozmiaru okna
    window.addEventListener('resize', handleChange);
  }

  showInstallPrompt() {
    // Pokaż subtelną wskazówkę o instalacji PWA
    if (this.isIOS) {
      this.showIOSInstallPrompt();
    } else if (this.isAndroid) {
      this.showAndroidInstallPrompt();
    }
  }

  showIOSInstallPrompt() {
    // Sprawdź czy już nie pokazywano tej wskazówki
    if (localStorage.getItem('ios-install-prompt-shown')) {
      return;
    }

    setTimeout(() => {
      const promptDiv = document.createElement('div');
      promptDiv.id = 'ios-install-prompt';
      promptDiv.className = 'install-prompt ios-prompt';
      promptDiv.innerHTML = `
        <div class="prompt-content">
          <div class="prompt-icon">📱</div>
          <div class="prompt-text">
            <strong>Zainstaluj aplikację</strong>
            <p>Dotknij <span class="share-icon">⎘</span> i wybierz "Dodaj do ekranu głównego" aby ukryć pasek adresu</p>
          </div>
          <button class="prompt-close">&times;</button>
        </div>
      `;

      document.body.appendChild(promptDiv);

      // Zamknij po kliknięciu
      promptDiv.querySelector('.prompt-close').addEventListener('click', () => {
        promptDiv.remove();
        localStorage.setItem('ios-install-prompt-shown', 'true');
      });

      // Auto-ukryj po 10 sekundach
      setTimeout(() => {
        if (promptDiv.parentNode) {
          promptDiv.remove();
          localStorage.setItem('ios-install-prompt-shown', 'true');
        }
      }, 10000);

    }, 3000);
  }

  showAndroidInstallPrompt() {
    // Nasłuchuj na beforeinstallprompt event
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      
      const promptDiv = document.createElement('div');
      promptDiv.id = 'android-install-prompt';
      promptDiv.className = 'install-prompt android-prompt';
      promptDiv.innerHTML = `
        <div class="prompt-content">
          <div class="prompt-icon">📱</div>
          <div class="prompt-text">
            <strong>Zainstaluj aplikację</strong>
            <p>Dodaj Fete Lite do ekranu głównego dla lepszego doświadczenia</p>
          </div>
          <div class="prompt-actions">
            <button class="btn-install">Zainstaluj</button>
            <button class="btn-dismiss">Nie teraz</button>
          </div>
        </div>
      `;

      document.body.appendChild(promptDiv);

      // Zainstaluj
      promptDiv.querySelector('.btn-install').addEventListener('click', async () => {
        e.prompt();
        const { outcome } = await e.userChoice;

        promptDiv.remove();
      });

      // Odrzuć
      promptDiv.querySelector('.btn-dismiss').addEventListener('click', () => {
        promptDiv.remove();
      });
    });
  }

  // API publiczne
  forceHideAddressBar() {
    this.hideAddressBar();
  }

  getStatus() {
    return {
      isStandalone: this.isStandalone,
      isIOS: this.isIOS,
      isAndroid: this.isAndroid,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight,
        availableHeight: window.screen.availHeight
      }
    };
  }
}

// Inicjalizuj po załadowaniu DOM
document.addEventListener('DOMContentLoaded', () => {
  window.mobileFullscreen = new MobileFullscreen();
});

// Export dla innych modułów
if (typeof module !== 'undefined' && module.exports) {
  module.exports = MobileFullscreen;
}