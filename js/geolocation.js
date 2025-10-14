// Fete Lite - Geolokalizacja i mapy
// Integracja z OpenStreetMap/Leaflet (darmowa alternatywa Google Maps)

class GeolocationManager {
  constructor() {
    this.isGeolocationSupported = 'geolocation' in navigator;
    this.currentPosition = null;
    this.watchId = null;
    this.maps = new Map(); // Cache dla map Leaflet
    

  }

  // Bezpieczne użycie funkcji tłumaczenia
  safeTranslate(key, fallback = '') {
    try {
      return typeof window.t === 'function' ? window.t(key) : fallback;
    } catch (error) {
      return fallback;
    }
  }

  // Pobierz aktualną pozycję użytkownika
  async getCurrentLocation(options = {}) {
    if (!this.isGeolocationSupported) {
      const errorMsg = typeof t === 'function' ? t('error.geolocationUnavailable') : 'Geolokalizacja nie jest dostępna';
      throw new Error(errorMsg);
    }

    const defaultOptions = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 300000 // 5 minut cache
    };

    const geoOptions = { ...defaultOptions, ...options };

    return new Promise((resolve, reject) => {
      // Pokaż loading state
      this.showLocationLoading();

      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.currentPosition = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: Date.now()
          };


          
          this.hideLocationLoading();
          resolve(this.currentPosition);
        },
        (error) => {
          this.hideLocationLoading();
          console.error('[Geolocation] Error:', error);
          
          let errorMessage;
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = t('error.geolocationDenied');
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = t('error.geolocationUnavailable');
              break;
            case error.TIMEOUT:
              errorMessage = t('error.geolocationTimeout');
              break;
            default:
              errorMessage = t('geolocation.error');
          }
          
          reject(new Error(errorMessage));
        },
        geoOptions
      );
    });
  }

  // Obserwuj zmiany pozycji
  watchPosition(callback, options = {}) {
    if (!this.isGeolocationSupported) {
      throw new Error(t('error.geolocationUnavailable'));
    }

    const defaultOptions = {
      enableHighAccuracy: false,
      timeout: 30000,
      maximumAge: 600000 // 10 minut cache dla watch
    };

    const geoOptions = { ...defaultOptions, ...options };

    this.watchId = navigator.geolocation.watchPosition(
      (position) => {
        this.currentPosition = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: Date.now()
        };


        callback(this.currentPosition);
      },
      (error) => {
        console.error('[Geolocation] Watch error:', error);
        callback(null, error);
      },
      geoOptions
    );


    return this.watchId;
  }

  // Zatrzymaj obserwowanie pozycji
  stopWatching() {
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);

      this.watchId = null;
    }
  }

  // Pobierz pozycję i ustaw w formularzu
  async setLocationInForm() {
    const locationInput = document.getElementById('event-location');
    const getLocationBtn = document.getElementById('get-location-btn');
    
    if (!locationInput) return;

    try {
      // Wyłącz przycisk podczas pobierania
      if (getLocationBtn) {
        getLocationBtn.disabled = true;
        getLocationBtn.innerHTML = '⏳';
      }

      const position = await this.getCurrentLocation();
      
      // Pobierz adres z współrzędnych (reverse geocoding)
      const address = await this.reverseGeocode(position.lat, position.lng);
      
      // Ustaw w formularzu
      locationInput.value = address;
      
      // Zapisz współrzędne do session storage
      sessionStorage.setItem('currentEventCoordinates', JSON.stringify(position));
      
      showNotification(t('success.locationObtained'), 'success');
      
    } catch (error) {
      console.error('[Geolocation] Error setting location:', error);
      showNotification(error.message, 'error');
      
    } finally {
      // Przywróć przycisk
      if (getLocationBtn) {
        getLocationBtn.disabled = false;
        getLocationBtn.innerHTML = '📍';
      }
    }
  }

  // Reverse geocoding - zamiana współrzędnych na adres
  async reverseGeocode(lat, lng) {
    try {

      
      // Próba 1: Nominatim API (OpenStreetMap)
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1&accept-language=pl`,
          {
            headers: {
              'User-Agent': 'FeteLite/1.0.0 (PWA Event Organizer)',
              'Accept': 'application/json'
            },
            mode: 'cors'
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        
        if (data.error) {
          throw new Error(data.error);
        }

        // Zbuduj czytelny adres
        const address = this.formatAddress(data);
        

        return address;

      } catch (corsError) {
        console.warn('[Geolocation] CORS error with Nominatim, trying alternative:', corsError.message);
        
        // Próba 2: Alternatywne API lub fallback
        return this.alternativeReverseGeocode(lat, lng);
      }

    } catch (error) {
      console.error('[Geolocation] Reverse geocoding failed:', error);
      // Fallback - zwróć sformatowane współrzędne
      return this.formatCoordinatesFallback(lat, lng);
    }
  }

  // Alternatywne reverse geocoding w przypadku problemów z CORS
  async alternativeReverseGeocode(lat, lng) {
    try {
      // Próba z innym endpoint lub proxy

      
      // Możemy dodać tutaj inne API lub własny proxy serwer
      // Na razie zwracamy sformatowane współrzędne z dodatkową informacją
      
      return this.formatCoordinatesFallback(lat, lng);
      
    } catch (error) {
      console.error('[Geolocation] Alternative geocoding failed:', error);
      return this.formatCoordinatesFallback(lat, lng);
    }
  }

  // Formatuj współrzędne jako fallback
  formatCoordinatesFallback(lat, lng) {
    const formattedLat = lat.toFixed(6);
    const formattedLng = lng.toFixed(6);
    
    // Dodaj informację o przybliżonej lokalizacji na podstawie współrzędnych
    let approximateLocation = 'Lokalizacja: ';
    
    // Prosta aproksymacja dla Polski
    if (lat >= 49 && lat <= 55 && lng >= 14 && lng <= 25) {
      if (lat >= 52 && lat <= 53 && lng >= 20 && lng <= 22) {
        approximateLocation += 'Warszawa (obszar)';
      } else if (lat >= 50 && lat <= 51 && lng >= 19 && lng <= 20.5) {
        approximateLocation += 'Kraków (obszar)';
      } else if (lat >= 51.5 && lat <= 52 && lng >= 17 && lng <= 18) {
        approximateLocation += 'Wrocław (obszar)';
      } else if (lat >= 54 && lat <= 54.5 && lng >= 18 && lng <= 19) {
        approximateLocation += 'Gdańsk (obszar)';
      } else {
        approximateLocation += 'Polska';
      }
    } else {
      approximateLocation += 'Nieznany obszar';
    }
    
    return `${approximateLocation} (${formattedLat}, ${formattedLng})`;
  }

  // Formatuj adres z danych Nominatim
  formatAddress(data) {
    const { address, display_name } = data;
    
    if (!address) return display_name || 'Nieznana lokalizacja';

    // Priorytet elementów adresu
    const parts = [];
    
    // Numer i ulica
    if (address.house_number && address.road) {
      parts.push(`${address.road} ${address.house_number}`);
    } else if (address.road) {
      parts.push(address.road);
    }
    
    // Miejsce/dzielnica
    if (address.suburb) {
      parts.push(address.suburb);
    } else if (address.neighbourhood) {
      parts.push(address.neighbourhood);
    }
    
    // Miasto
    if (address.city) {
      parts.push(address.city);
    } else if (address.town) {
      parts.push(address.town);
    } else if (address.village) {
      parts.push(address.village);
    }

    return parts.length > 0 ? parts.join(', ') : display_name || 'Nieznana lokalizacja';
  }

  // Geocoding - zamiana adresu na współrzędne
  async geocode(address) {
    try {

      
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1&accept-language=pl`,
        {
          headers: {
            'User-Agent': 'FeteLite/1.0.0 (PWA Event Organizer)',
            'Accept': 'application/json'
          },
          mode: 'cors'
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: Błąd wyszukiwania lokalizacji`);
      }

      const data = await response.json();
      
      if (!data || data.length === 0) {
        throw new Error('Lokalizacja nie znaleziona');
      }

      const result = data[0];

      
      return {
        lat: parseFloat(result.lat),
        lng: parseFloat(result.lon),
        display_name: result.display_name
      };

    } catch (error) {
      console.error('[Geolocation] Geocoding error:', error);
      throw error;
    }
  }

  // === MAPY LEAFLET ===

  // Utwórz mapę Leaflet
  createMap(containerId, center, zoom = 15) {
    try {
      // Sprawdź czy Leaflet jest załadowany
      if (typeof L === 'undefined') {
        console.error('[Geolocation] Leaflet library not loaded');
        return null;
      }

      // Usuń istniejącą mapę jeśli jest
      if (this.maps.has(containerId)) {
        this.destroyMap(containerId);
      }

      const container = document.getElementById(containerId);
      if (!container) {
        console.error('[Geolocation] Map container not found:', containerId);
        return null;
      }

      // Utwórz mapę
      const map = L.map(containerId).setView([center.lat, center.lng], zoom);

      // Dodaj kafelki OpenStreetMap
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19
      }).addTo(map);

      // Zapisz mapę w cache
      this.maps.set(containerId, map);


      return map;

    } catch (error) {
      console.error('[Geolocation] Error creating map:', error);
      return null;
    }
  }

  // Dodaj marker do mapy
  addMarker(mapId, position, popup = null, options = {}) {
    const map = this.maps.get(mapId);
    if (!map) {
      console.error('[Geolocation] Map not found:', mapId);
      return null;
    }

    const marker = L.marker([position.lat, position.lng], options).addTo(map);

    if (popup) {
      marker.bindPopup(popup);
    }

    return marker;
  }

  // Wycentruj mapę na pozycji
  centerMap(mapId, position, zoom) {
    const map = this.maps.get(mapId);
    if (!map) {
      console.error('[Geolocation] Map not found:', mapId);
      return;
    }

    map.setView([position.lat, position.lng], zoom || map.getZoom());
  }

  // Zniszcz mapę
  destroyMap(mapId) {
    const map = this.maps.get(mapId);
    if (map) {
      map.remove();
      this.maps.delete(mapId);

    }
  }

  // === UI HELPERS ===

  // Pokaż loading state dla lokalizacji
  showLocationLoading() {
    const btn = document.getElementById('get-location-btn');
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = '⏳';
      btn.setAttribute('title', t('geolocation.getting'));
    }

    // Pokaż powiadomienie
    showNotification(t('geolocation.getting'), 'info', 2000);
  }

  // Ukryj loading state
  hideLocationLoading() {
    const btn = document.getElementById('get-location-btn');
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = '📍';
      btn.setAttribute('title', t('create.locationHelp'));
    }
  }

  // Otwórz mapę zewnętrzną (Google Maps, Apple Maps)
  openExternalMap(position, destination = null) {
    let url;

    // Wykryj platformę
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isAndroid = /Android/.test(navigator.userAgent);

    if (destination) {
      // Nawigacja do celu
      if (isIOS) {
        url = `http://maps.apple.com/?daddr=${position.lat},${position.lng}`;
      } else if (isAndroid) {
        url = `google.navigation:q=${position.lat},${position.lng}`;
      } else {
        url = `https://www.google.com/maps/dir/?api=1&destination=${position.lat},${position.lng}`;
      }
    } else {
      // Pokaż lokalizację
      if (isIOS) {
        url = `http://maps.apple.com/?q=${position.lat},${position.lng}`;
      } else {
        url = `https://www.google.com/maps/search/?api=1&query=${position.lat},${position.lng}`;
      }
    }

    window.open(url, '_blank');
  }

  // Sprawdź dokładność pozycji
  getAccuracyLevel(accuracy) {
    if (accuracy < 10) return 'high';
    if (accuracy < 50) return 'medium';
    if (accuracy < 100) return 'low';
    return 'very-low';
  }

  // Oblicz odległość między dwoma punktami
  calculateDistance(pos1, pos2) {
    const R = 6371000; // Promień Ziemi w metrach
    const lat1Rad = pos1.lat * Math.PI / 180;
    const lat2Rad = pos2.lat * Math.PI / 180;
    const deltaLatRad = (pos2.lat - pos1.lat) * Math.PI / 180;
    const deltaLngRad = (pos2.lng - pos1.lng) * Math.PI / 180;

    const a = Math.sin(deltaLatRad / 2) * Math.sin(deltaLatRad / 2) +
              Math.cos(lat1Rad) * Math.cos(lat2Rad) *
              Math.sin(deltaLngRad / 2) * Math.sin(deltaLngRad / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Odległość w metrach
  }

  // Formatuj odległość
  formatDistance(meters) {
    if (meters < 1000) {
      return `${Math.round(meters)} m`;
    } else {
      return `${(meters / 1000).toFixed(1)} km`;
    }
  }

  // Sprawdź uprawnienia do geolokalizacji
  async checkPermissions() {
    if (!('permissions' in navigator)) {
      return 'unknown';
    }

    try {
      const permission = await navigator.permissions.query({ name: 'geolocation' });
      return permission.state; // 'granted', 'denied', 'prompt'
    } catch (error) {
      console.error('[Geolocation] Error checking permissions:', error);
      return 'unknown';
    }
  }

  // === CLEANUP ===

  // Wyczyść wszystkie mapy i obserwatory
  cleanup() {
    // Zatrzymaj obserwowanie pozycji
    this.stopWatching();

    // Zniszcz wszystkie mapy
    for (const mapId of this.maps.keys()) {
      this.destroyMap(mapId);
    }


  }
}

// Globalna instancja GeolocationManager
window.geolocationManager = new GeolocationManager();

// Event listenery dla przycisków geolokalizacji
document.addEventListener('DOMContentLoaded', () => {
  // Przycisk pobierania lokalizacji w formularzu
  const getLocationBtn = document.getElementById('get-location-btn');
  if (getLocationBtn) {
    getLocationBtn.addEventListener('click', () => {
      window.geolocationManager.setLocationInForm();
    });
  }

  // Inne przyciski związane z mapami będą obsługiwane w odpowiednich stronach
});

// Cleanup przy zamykaniu strony
window.addEventListener('beforeunload', () => {
  window.geolocationManager.cleanup();
});


