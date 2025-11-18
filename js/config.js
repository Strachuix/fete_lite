/**
 * Konfiguracja środowiska - automatyczne wykrywanie API URL
 */

class Config {
  static getApiUrl() {
    // Jeśli jest ustawiona zmienna środowiskowa (dla produkcji)
    if (window.ENV_API_URL) {
      return window.ENV_API_URL;
    }

    // Automatyczne wykrywanie na podstawie hostname
    const hostname = window.location.hostname;
    
    if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname.includes('192.168.')) {
      // Lokalne środowisko - używaj Railway backend
      return 'fetebackend-production.up.railway.app';
    } else {
      // Produkcja - również Railway backend
      return 'fetebackend-production.up.railway.app';
    }
  }

  static isDevelopment() {
    const hostname = window.location.hostname;
    return hostname === 'localhost' || hostname === '127.0.0.1' || hostname.includes('192.168.');
  }

  static isProduction() {
    return !this.isDevelopment();
  }

  static getEnvironment() {
    return this.isDevelopment() ? 'development' : 'production';
  }
}

// Udostępnij globalnie
window.Config = Config;

console.log(`🔧 Environment: ${Config.getEnvironment()}`);
console.log(`🌐 API URL: ${Config.getApiUrl()}`);