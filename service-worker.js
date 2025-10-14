// Service Worker dla Fete Lite PWA
// Wersja 1.0.0

const CACHE_VERSION = '1.0.12'
const CACHE_NAME = `fete-lite-v${CACHE_VERSION}`;
const STATIC_CACHE = `fete-lite-static-v${CACHE_VERSION}`;
const DYNAMIC_CACHE = `fete-lite-dynamic-v${CACHE_VERSION}`;

console.log('[SW] Service Worker version:', CACHE_VERSION);

// Pliki do cache'owania przy instalacji (tylko lokalne pliki)
const STATIC_FILES = [
  './',
  './index.html',
  './create-event.html', 
  './event-details.html',
  './auth.html',
  './settings.html',
  './css/style.css',
  './css/modern-effects.css',
  './css/dark-mode.css',
  './css/responsive.css',
  './css/standalone.css',
  './js/main.js',
  './js/events.js',
  './js/storage.js',
  './js/qr.js',
  './js/qrcode.min.js',
  './js/ics-export.js',
  './js/geolocation.js',
  './js/darkmode.js',
  './js/network.js',
  './js/mobile-fullscreen.js',
  './js/i18n.js',
  './js/notifications.js',
  './js/sample-data.js',
  './js/modern-effects.js',
  './js/navigation.js',
  './js/header.js',
  './js/auth.js',
  './js/settings.js',
  './js/update-checker.js',
  './js/create-event.js',
  './js/event-details.js',
  './images/logo.svg',
  './images/icons/icon-192.png',
  './images/icons/icon-512.png',
  './images/icons/maskable-icon.png',
  './manifest.json'
];

// Instalacja Service Workera
self.addEventListener('install', event => {
  console.log('[SW] Instalowanie Service Workera...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => {

        // Dodaj pliki jeden po drugim, aby obsłużyć błędy jednotliwych plików
        return addFilesToCache(cache, STATIC_FILES);
      })
      .then(() => {

        return self.skipWaiting(); // Wymuszenie aktywacji nowej wersji
      })
      .catch(error => {
        console.error('[SW] Błąd podczas instalacji:', error);
        // Kontynuuj instalację mimo błędów
        return self.skipWaiting();
      })
  );
});

// Funkcja do bezpiecznego dodawania plików do cache
async function addFilesToCache(cache, urls) {
  const results = await Promise.allSettled(
    urls.map(async (url) => {
      try {
        await cache.add(url);

        return { url, success: true };
      } catch (error) {
        console.warn('[SW] ✗ Failed to cache:', url, error.message);
        return { url, success: false, error: error.message };
      }
    })
  );
  
  const successful = results.filter(r => r.value?.success).length;
  const failed = results.filter(r => !r.value?.success).length;
  
  console.log(`[SW] Cache results: ${successful} successful, ${failed} failed`);
  
  if (failed > 0) {
    console.warn('[SW] Some files failed to cache but continuing...');
  }
  
  return results;
}

// Aktywacja Service Workera
self.addEventListener('activate', event => {
  console.log('[SW] Aktywacja Service Workera...');
  
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames
            .filter(cacheName => {
              // Usuń stare wersje cache
              return cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE;
            })
            .map(cacheName => {
              console.log('[SW] Usuwanie starego cache:', cacheName);
              return caches.delete(cacheName);
            })
        );
      })
      .then(() => {
        console.log('[SW] Service Worker aktywowany');
        return self.clients.claim(); // Przejęcie kontroli nad wszystkimi klientami
      })
  );
});

// Obsługa żądań sieciowych
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Ignoruj żądania do innych domen (które nie są CDN)
  if (url.origin !== location.origin && !isCDNResource(url.href)) {
    return;
  }
  
  event.respondWith(
    handleRequest(request)
  );
});

// Główna funkcja obsługi żądań
async function handleRequest(request) {
  const url = new URL(request.url);
  
  try {
    // DEVELOPMENT MODE: Network First dla plików CSS/JS żeby widzieć zmiany
    if (isDevelopmentMode() && (url.pathname.endsWith('.css') || url.pathname.endsWith('.js'))) {
      console.log('[SW] [DEV] Network First dla:', url.pathname);
      return await networkFirst(request);
    }
    
    // Strategia Cache First dla plików statycznych
    if (isStaticResource(request)) {
      return await cacheFirst(request);
    }
    
    // Strategia Network First dla API i dynamicznych zasobów
    if (isDynamicResource(request)) {
      return await networkFirst(request);
    }
    
    // Domyślnie Cache First
    return await cacheFirst(request);
    
  } catch (error) {
    console.error('[SW] Błąd obsługi żądania:', error);
    return await getOfflineFallback(request);
  }
}

// Strategia Cache First
async function cacheFirst(request) {
  try {
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
      console.log('[SW] ✓ Zwracam z cache:', request.url);
      return cachedResponse;
    }
    
    console.log('[SW] Nie ma w cache, pobieram z sieci:', request.url);
    const networkResponse = await fetch(request);
    
    // Cache'uj tylko żądania GET z pozytywną odpowiedzią
    if (networkResponse.ok && request.method === 'GET') {
      try {
        const cache = await caches.open(STATIC_CACHE);
        await cache.put(request, networkResponse.clone());
        console.log('[SW] ✓ Dodano do cache:', request.url);
      } catch (cacheError) {
        console.warn('[SW] ⚠ Nie można dodać do cache:', request.url, cacheError.message);
        // Kontynuuj mimo błędu cache
      }
    } else if (request.method !== 'GET') {
      console.log('[SW] ⚠ Pomijam cache dla metody:', request.method, request.url);
    }
    
    return networkResponse;
  } catch (error) {
    console.error('[SW] ✗ Błąd cache first dla:', request.url, error.message);
    throw error;
  }
}

// Strategia Network First  
async function networkFirst(request) {
  try {
    console.log('[SW] Pobieram z sieci (network first):', request.url);
    const networkResponse = await fetch(request);
    
    // Cache'uj tylko żądania GET z pozytywną odpowiedzią
    if (networkResponse.ok && request.method === 'GET') {
      try {
        const cache = await caches.open(DYNAMIC_CACHE);
        await cache.put(request, networkResponse.clone());
        console.log('[SW] ✓ Zaktualizowano w cache:', request.url);
      } catch (cacheError) {
        console.warn('[SW] ⚠ Nie można zaktualizować cache:', request.url, cacheError.message);
        // Kontynuuj mimo błędu cache
      }
    } else if (request.method !== 'GET') {
      console.log('[SW] ⚠ Pomijam cache dla metody:', request.method, request.url);
    }
    
    return networkResponse;
  } catch (error) {
    console.log('[SW] ⚠ Sieć niedostępna, sprawdzam cache dla:', request.url);
    try {
      const cachedResponse = await caches.match(request);
      
      if (cachedResponse) {
        console.log('[SW] ✓ Znaleziono w cache jako fallback:', request.url);
        return cachedResponse;
      }
    } catch (cacheError) {
      console.error('[SW] ✗ Błąd dostępu do cache:', cacheError.message);
    }
    
    console.error('[SW] ✗ Nie można pobrać zasobu:', request.url, error.message);
    throw error;
  }
}

// Fallback dla trybu offline
async function getOfflineFallback(request) {
  const url = new URL(request.url);
  
  // Dla HTML zwróć główną stronę
  if (request.destination === 'document') {
    const cachedIndex = await caches.match('/index.html');
    if (cachedIndex) {
      return cachedIndex;
    }
  }
  
  // Dla obrazów zwróć placeholder (opcjonalnie)
  if (request.destination === 'image') {
    return new Response('', { status: 200, statusText: 'OK' });
  }
  
  // Domyślna odpowiedź offline
  return new Response(
    JSON.stringify({ 
      error: 'Brak połączenia z internetem',
      offline: true,
      timestamp: new Date().toISOString()
    }),
    { 
      status: 503,
      statusText: 'Service Unavailable',
      headers: { 'Content-Type': 'application/json' }
    }
  );
}

// Sprawdź czy jesteśmy w trybie development (localhost lub port development)
function isDevelopmentMode() {
  return location.hostname === 'localhost' || 
         location.hostname === '127.0.0.1' || 
         location.port !== '' ||
         location.protocol === 'http:';
}

// Sprawdza czy zasób jest statyczny
function isStaticResource(request) {
  const url = new URL(request.url);
  const pathname = url.pathname;
  
  return (
    pathname.endsWith('.html') ||
    pathname.endsWith('.css') ||
    pathname.endsWith('.js') ||
    pathname.endsWith('.png') ||
    pathname.endsWith('.jpg') ||
    pathname.endsWith('.svg') ||
    pathname.endsWith('.ico') ||
    pathname.includes('/css/') ||
    pathname.includes('/js/') ||
    pathname.includes('/images/') ||
    isCDNResource(request.url)
  );
}

// Sprawdza czy zasób jest dynamiczny
function isDynamicResource(request) {
  const url = new URL(request.url);
  return (
    url.pathname.includes('/api/') ||
    url.searchParams.has('dynamic')
  );
}

// Sprawdza czy to zasób z CDN
function isCDNResource(url) {
  return (
    url.includes('cdn.jsdelivr.net') ||
    url.includes('unpkg.com') ||
    url.includes('cdnjs.cloudflare.com')
  );
}

// Obsługa wiadomości od głównej aplikacji
self.addEventListener('message', event => {
  const { type, payload } = event.data;
  
  switch (type) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;
      
    case 'FORCE_UPDATE_CACHE':
      forceUpdateCache().then(() => {
        event.ports[0].postMessage({ type: 'CACHE_UPDATED' });
      }).catch(error => {
        event.ports[0].postMessage({ type: 'CACHE_UPDATE_ERROR', error: error.message });
      });
      break;
      
    case 'GET_CACHE_SIZE':
      getCacheSize().then(size => {
        event.ports[0].postMessage({ type: 'CACHE_SIZE', size });
      });
      break;
      
    case 'CLEAR_CACHE':
      clearAllCaches().then(() => {
        event.ports[0].postMessage({ type: 'CACHE_CLEARED' });
      });
      break;
  }
});

// Pomocnicze funkcje
async function getCacheSize() {
  const cacheNames = await caches.keys();
  let totalSize = 0;
  
  for (const cacheName of cacheNames) {
    const cache = await caches.open(cacheName);
    const requests = await cache.keys();
    totalSize += requests.length;
  }
  
  return totalSize;
}

async function forceUpdateCache() {
  console.log('[SW] Wymuszenie aktualizacji cache...');
  
  try {
    // Usuń stary cache statyczny
    const oldStaticCache = await caches.delete(STATIC_CACHE);
    if (oldStaticCache) {
      console.log('[SW] Usunięto stary cache statyczny');
    }
    
    // Usuń cache dynamiczny
    const oldDynamicCache = await caches.delete(DYNAMIC_CACHE);
    if (oldDynamicCache) {
      console.log('[SW] Usunięto stary cache dynamiczny');
    }
    
    // Stwórz nowy cache i pobierz wszystkie pliki ponownie
    console.log('[SW] Pobieranie świeżych plików...');
    const cache = await caches.open(STATIC_CACHE);
    
    // Dodaj nagłówki cache-busting
    const cacheBustingFiles = STATIC_FILES.map(file => {
      if (file.endsWith('.js') || file.endsWith('.css') || file.endsWith('.html')) {
        const separator = file.includes('?') ? '&' : '?';
        return `${file}${separator}v=${Date.now()}`;
      }
      return file;
    });
    
    // Pobierz pliki z wymuszonym odświeżeniem
    const results = await Promise.allSettled(
      cacheBustingFiles.map(async (url, index) => {
        try {
          const originalUrl = STATIC_FILES[index];
          console.log(`[SW] Pobieranie: ${originalUrl}`);
          
          const response = await fetch(url, {
            cache: 'no-cache',
            headers: {
              'Cache-Control': 'no-cache, no-store, must-revalidate',
              'Pragma': 'no-cache'
            }
          });
          
          if (response.ok) {
            await cache.put(originalUrl, response);
            console.log(`[SW] ✓ Zaktualizowano: ${originalUrl}`);
            return { url: originalUrl, success: true };
          } else {
            throw new Error(`HTTP ${response.status}`);
          }
        } catch (error) {
          console.warn(`[SW] ✗ Błąd aktualizacji: ${STATIC_FILES[index]}`, error.message);
          return { url: STATIC_FILES[index], success: false, error: error.message };
        }
      })
    );
    
    const successful = results.filter(r => r.value?.success).length;
    const failed = results.filter(r => !r.value?.success).length;
    
    console.log(`[SW] Aktualizacja cache zakończona: ${successful} sukces, ${failed} błędów`);
    
    return { successful, failed, results };
  } catch (error) {
    console.error('[SW] Błąd podczas wymuszenia aktualizacji cache:', error);
    throw error;
  }
}

async function clearAllCaches() {
  console.log('[SW] Clearing all caches...');
  const cacheNames = await caches.keys();
  await Promise.all(
    cacheNames.map(cacheName => {
      console.log('[SW] Deleting cache:', cacheName);
      return caches.delete(cacheName);
    })
  );
  console.log('[SW] All caches cleared');
}

// Emergency cleanup funkcja dla problemów z cache
async function emergencyCleanup() {
  try {
    console.log('[SW] Starting emergency cleanup...');
    
    // Wyczyść wszystkie cache
    await clearAllCaches();
    
    // Zrestartuj cache z podstawowymi plikami
    const cache = await caches.open(STATIC_CACHE);
    const essentialFiles = [
      '/',
      '/index.html',
      '/css/style.css',
      '/js/main.js'
    ];
    
    for (const file of essentialFiles) {
      try {
        await cache.add(file);
        console.log('[SW] ✓ Re-cached essential file:', file);
      } catch (error) {
        console.warn('[SW] ⚠ Could not re-cache:', file, error.message);
      }
    }
    
    console.log('[SW] Emergency cleanup completed');
    return true;
  } catch (error) {
    console.error('[SW] Emergency cleanup failed:', error);
    return false;
  }
}

// Auto-cleanup przy błędach instalacji
self.addEventListener('error', (event) => {
  console.error('[SW] Service Worker error:', event.error);
  // Nie robimy emergency cleanup automatycznie, żeby nie spowodować pętli
});

// Obsługa wiadomości od aplikacji
self.addEventListener('message', (event) => {
  console.log('[SW] Otrzymano wiadomość:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('[SW] Pomijam waiting - wymuszam aktualizację');
    self.skipWaiting();
  }
});

console.log('[SW] Service Worker script loaded successfully');