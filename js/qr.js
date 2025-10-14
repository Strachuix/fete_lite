// Fete Lite - QR Codes
// Generowanie i wyświetlanie kodów QR z wykorzystaniem qrcode.js

class QRManager {
  constructor() {
    this.isQRLibraryLoaded = false;
    this.qrInstances = new Map(); // Cache dla wygenerowanych QR kodów
    
    this.checkQRLibrary();
  }

  // Sprawdź czy biblioteka QR jest załadowana
  checkQRLibrary() {
    if (typeof QRCode !== 'undefined') {
      this.isQRLibraryLoaded = true;

    } else {
      console.warn('[QR] QRCode library not loaded, will attempt to load');
      this.loadQRLibrary();
    }
  }

  // Załaduj bibliotekę QR dynamicznie
  async loadQRLibrary() {
    try {
      // Sprawdź czy już jest załadowana (może być załadowana między sprawdzeniami)
      if (typeof QRCode !== 'undefined') {
        this.isQRLibraryLoaded = true;
        return;
      }



      // Najpierw spróbuj lokalnej biblioteki, potem CDN
      const allUrls = [
        './js/qrcode.min.js', // Lokalna kopia
        'https://cdn.jsdelivr.net/npm/qrcode@1.5.3/build/qrcode.min.js',
        'https://unpkg.com/qrcode@1.5.3/build/qrcode.min.js',
        'https://cdnjs.cloudflare.com/ajax/libs/qrcode/1.5.3/qrcode.min.js'
      ];

      for (const url of allUrls) {
        try {
          const script = document.createElement('script');
          script.src = url;
          script.async = true;

          await new Promise((resolve, reject) => {
            const timeout = setTimeout(() => reject(new Error('Timeout')), 5000);
            
            script.onload = () => {
              clearTimeout(timeout);
              resolve();
            };
            script.onerror = () => {
              clearTimeout(timeout);
              reject(new Error('Script load error'));
            };
            document.head.appendChild(script);
          });

          // Sprawdź czy biblioteka została załadowana i utwórz wrapper
          if (typeof QRCode !== 'undefined') {
            this.createQRCodeWrapper();
            this.isQRLibraryLoaded = true;
            return;
          }

        } catch (error) {
          console.warn(`[QR] Failed to load from ${url}:`, error.message);
          // Usuń script który się nie załadował
          const scripts = document.querySelectorAll(`script[src="${url}"]`);
          scripts.forEach(s => s.remove());
        }
      }

      // Jeśli żaden CDN nie zadziałał, użyj fallback
      console.warn('[QR] All CDN attempts failed, using fallback implementation');
      this.createFallbackQRImplementation();

    } catch (error) {
      console.error('[QR] Failed to load QRCode library:', error);
      this.createFallbackQRImplementation();
    }
  }

  // Stwórz fallback implementację QR (bez biblioteki zewnętrznej)
  createFallbackQRImplementation() {
    // Prosta implementacja fallback używająca zewnętrznego API
    window.QRCode = {
      toCanvas: async (canvas, text, options = {}) => {
        try {
          // Użyj publicznego API do generowania QR
          const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=256x256&data=${encodeURIComponent(text)}`;
          
          const img = new Image();
          img.crossOrigin = 'anonymous';
          
          return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => reject(new Error('QR API timeout')), 10000);
            
            img.onload = () => {
              clearTimeout(timeout);
              const ctx = canvas.getContext('2d');
              canvas.width = img.width;
              canvas.height = img.height;
              ctx.drawImage(img, 0, 0);
              resolve();
            };
            
            img.onerror = () => {
              clearTimeout(timeout);
              // Jako ostateczny fallback, narysuj prostą reprezentację tekstową
              this.drawTextFallback(canvas, text);
              resolve();
            };
            
            img.src = qrApiUrl;
          });

        } catch (error) {
          // Ostateczny fallback - tekst
          this.drawTextFallback(canvas, text);
        }
      }
    };

    this.isQRLibraryLoaded = true;

  }

  // Stwórz wrapper kompatybilny z różnymi bibliotekami QR
  createQRCodeWrapper() {
    if (window.QRCode && window.QRCode.toCanvas) {
      // npm qrcode biblioteka - już kompatybilna
      console.log('[QR] Using npm qrcode library');
      return;
    } else if (window.QRCode) {
      // qrcodejs biblioteka - potrzebuje wrappera
      console.log('[QR] Using qrcodejs library, creating wrapper');
      
      const OriginalQRCode = window.QRCode;
      
      // Stwórz wrapper z metodami jak npm qrcode
      const self = this;
      
      window.QRCode = {
        toCanvas: (canvas, text, options = {}) => {
          return new Promise((resolve, reject) => {
            try {
              // Wyczyść canvas
              const ctx = canvas.getContext('2d');
              ctx.clearRect(0, 0, canvas.width, canvas.height);
              
              // Stwórz temporary element dla qrcodejs
              const tempDiv = document.createElement('div');
              tempDiv.style.position = 'absolute';
              tempDiv.style.left = '-9999px';
              document.body.appendChild(tempDiv);
              
              const qr = new OriginalQRCode(tempDiv, {
                text: text,
                width: options.width || 256,
                height: options.height || 256,
                colorDark: options.color?.dark || "#000000",
                colorLight: options.color?.light || "#ffffff",
                correctLevel: self.getCorrectLevel(options.errorCorrectionLevel)
              });
              
              // Skopiuj z temp canvas do docelowego
              setTimeout(() => {
                try {
                  const qrCanvas = tempDiv.querySelector('canvas');
                  if (qrCanvas) {
                    canvas.width = qrCanvas.width;
                    canvas.height = qrCanvas.height;
                    ctx.drawImage(qrCanvas, 0, 0);
                  }
                  document.body.removeChild(tempDiv);
                  resolve();
                } catch (err) {
                  document.body.removeChild(tempDiv);
                  reject(err);
                }
              }, 100);
            } catch (error) {
              reject(error);
            }
          });
        },
        
        toString: (text, options = {}) => {
          return new Promise((resolve, reject) => {
            // Dla prostoty, zwraca SVG placeholder
            resolve(`<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256"><rect width="256" height="256" fill="white"/><text x="128" y="128" text-anchor="middle" dy=".3em" font-family="Arial">QR: ${text}</text></svg>`);
          });
        },
        
        toDataURL: (text, options = {}) => {
          return new Promise((resolve, reject) => {
            try {
              const canvas = document.createElement('canvas');
              window.QRCode.toCanvas(canvas, text, options).then(() => {
                resolve(canvas.toDataURL());
              }).catch(reject);
            } catch (error) {
              reject(error);
            }
          });
        }
      };
    }
  }
  
  // Konwersja poziomów błędów
  getCorrectLevel(level) {
    const levels = {
      'L': 1,  // Low
      'M': 0,  // Medium  
      'Q': 3,  // Quartile
      'H': 2   // High
    };
    return levels[level] || 0; // Default Medium
  }

  // Narysuj tekst jako fallback dla QR
  drawTextFallback(canvas, text) {
    const ctx = canvas.getContext('2d');
    canvas.width = 256;
    canvas.height = 256;
    
    // Tło
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 256, 256);
    
    // Ramka
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.strokeRect(10, 10, 236, 236);
    
    // Tekst
    ctx.fillStyle = '#000000';
    ctx.font = '14px Arial';
    ctx.textAlign = 'center';
    
    const lines = this.wrapText(text, 220);
    const lineHeight = 20;
    const startY = 128 - (lines.length * lineHeight / 2);
    
    lines.forEach((line, index) => {
      ctx.fillText(line, 128, startY + (index * lineHeight));
    });
  }

  // Zawijanie tekstu
  wrapText(text, maxWidth) {
    const words = text.split(' ');
    const lines = [];
    let currentLine = words[0];

    for (let i = 1; i < words.length; i++) {
      const word = words[i];
      const testLine = currentLine + ' ' + word;
      
      if (testLine.length * 8 < maxWidth) { // Przybliżona szerokość znaku
        currentLine = testLine;
      } else {
        lines.push(currentLine);
        currentLine = word;
      }
    }
    lines.push(currentLine);
    
    return lines;
  }

  // Generuj QR kod
  async generateQR(data, containerId, options = {}) {
    try {


      // Sprawdź czy biblioteka jest dostępna
      if (!this.isQRLibraryLoaded) {
        console.log('[QR] Library not loaded, attempting to load...');
        await this.loadQRLibrary();
      }

      const container = document.getElementById(containerId);
      if (!container) {
        throw new Error(`Container ${containerId} not found`);
      }

      // Wyczyść kontener i pokaż loading
      container.innerHTML = '<div class="qr-loading">Generowanie kodu QR...</div>';

      // Sprawdź czy biblioteka jest dostępna po próbie załadowania
      if (!this.isQRLibraryLoaded && typeof QRCode === 'undefined') {
        console.warn('[QR] Library still not available, creating manual fallback');
        this.createManualFallback(container, data);
        return;
      }

      // Domyślne opcje
      const defaultOptions = {
        width: 256,
        height: 256,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        },
        errorCorrectionLevel: 'M'
      };

      const qrOptions = { ...defaultOptions, ...options };

      try {
        // Wyczyść kontener
        container.innerHTML = '';

        // Stwórz canvas
        const canvas = document.createElement('canvas');
        container.appendChild(canvas);

        // Generuj QR kod
        await QRCode.toCanvas(canvas, data, qrOptions);
        
        console.log('[QR] QR code generated successfully');

      } catch (qrError) {
        console.warn('[QR] QR generation failed, using fallback:', qrError);
        this.createManualFallback(container, data);
      }

      // Zapisz w cache
      this.qrInstances.set(containerId, {
        data,
        options: qrOptions,
        timestamp: Date.now()
      });

      console.log('[QR] QR code generated for:', data);
      return true;

    } catch (error) {
      console.error('[QR] Error generating QR code:', error);
      const container = document.getElementById(containerId);
      if (container) {
        this.createManualFallback(container, data);
      }
      return false;
    }
  }

  // Stwórz ręczny fallback gdy biblioteka QR nie działa
  createManualFallback(container, data) {
    if (!container) return;

    // Wyczyść kontener
    container.innerHTML = '';
    
    // Stwórz fallback UI
    const fallbackDiv = document.createElement('div');
    fallbackDiv.className = 'qr-fallback';
    fallbackDiv.style.cssText = `
      width: 256px;
      height: 256px;
      border: 2px solid #000;
      border-radius: 8px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background: white;
      font-family: Arial, sans-serif;
      padding: 20px;
      box-sizing: border-box;
      text-align: center;
    `;
    
    // Dodaj ikonę QR
    const qrIcon = document.createElement('div');
    qrIcon.innerHTML = '⬛⬜⬛';
    qrIcon.style.cssText = `
      font-size: 48px;
      margin-bottom: 16px;
      letter-spacing: -8px;
    `;
    
    // Dodaj tekst informacyjny
    const infoText = document.createElement('div');
    infoText.innerHTML = 'Kod QR tymczasowo niedostępny';
    infoText.style.cssText = `
      font-size: 14px;
      font-weight: bold;
      margin-bottom: 12px;
      color: #333;
    `;
    
    // Dodaj link do danych
    const dataLink = document.createElement('div');
    dataLink.innerHTML = `
      <div style="font-size: 12px; color: #666; margin-bottom: 8px;">Skopiuj link:</div>
      <div style="font-size: 11px; word-break: break-all; background: #f5f5f5; padding: 8px; border-radius: 4px; border: 1px solid #ddd;">
        ${data}
      </div>
    `;
    
    // Dodaj przycisk kopiowania
    const copyButton = document.createElement('button');
    copyButton.textContent = 'Skopiuj link';
    copyButton.style.cssText = `
      margin-top: 12px;
      padding: 6px 12px;
      background: #007bff;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 12px;
    `;
    
    copyButton.onclick = () => {
      navigator.clipboard.writeText(data).then(() => {
        copyButton.textContent = 'Skopiowano!';
        setTimeout(() => {
          copyButton.textContent = 'Skopiuj link';
        }, 2000);
      }).catch(() => {
        // Fallback dla starszych przeglądarek
        const textArea = document.createElement('textarea');
        textArea.value = data;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        
        copyButton.textContent = 'Skopiowano!';
        setTimeout(() => {
          copyButton.textContent = 'Skopiuj link';
        }, 2000);
      });
    };
    
    // Złóż elementy
    fallbackDiv.appendChild(qrIcon);
    fallbackDiv.appendChild(infoText);
    fallbackDiv.appendChild(dataLink);
    fallbackDiv.appendChild(copyButton);
    
    container.appendChild(fallbackDiv);
    
    console.log('[QR] Manual fallback created for:', data);
  }

  // Generuj QR kod jako SVG
  async generateQRSVG(data, containerId, options = {}) {
    try {
      if (!this.isQRLibraryLoaded) {
        await this.loadQRLibrary();
      }

      if (!this.isQRLibraryLoaded || typeof QRCode === 'undefined') {
        throw new Error('QRCode library is not available');
      }

      const container = document.getElementById(containerId);
      if (!container) {
        throw new Error(`Container ${containerId} not found`);
      }

      const defaultOptions = {
        width: 256,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        },
        errorCorrectionLevel: 'M'
      };

      const qrOptions = { ...defaultOptions, ...options };

      // Wyczyść kontener
      container.innerHTML = '';

      // Generuj SVG
      const svgString = await QRCode.toString(data, {
        type: 'svg',
        ...qrOptions
      });

      container.innerHTML = svgString;

      console.log('[QR] QR SVG generated for:', data);
      return true;

    } catch (error) {
      console.error('[QR] Error generating QR SVG:', error);
      this.showQRError(containerId, error.message);
      return false;
    }
  }

  // Generuj QR kod dla wydarzenia
  async generateEventQR(event, containerId, options = {}) {
    const shareUrl = this.createEventShareUrl(event);
    
    const qrOptions = {
      ...options,
      // Dostosuj kolory do motywu aplikacji
      color: {
        dark: getComputedStyle(document.documentElement).getPropertyValue('--color-primary') || '#673ab7',
        light: getComputedStyle(document.documentElement).getPropertyValue('--color-surface') || '#ffffff'
      }
    };

    return await this.generateQR(shareUrl, containerId, qrOptions);
  }

  // Utwórz URL udostępnienia wydarzenia
  createEventShareUrl(event) {
    const baseUrl = window.location.origin;
    return `${baseUrl}/event-details.html?id=${event.id}`;
  }

  // Pobierz QR kod jako Data URL
  async getQRDataURL(data, options = {}) {
    try {
      if (!this.isQRLibraryLoaded) {
        await this.loadQRLibrary();
      }

      if (!this.isQRLibraryLoaded || typeof QRCode === 'undefined') {
        throw new Error('QRCode library is not available');
      }

      const defaultOptions = {
        width: 256,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        },
        errorCorrectionLevel: 'M'
      };

      const qrOptions = { ...defaultOptions, ...options };

      const dataURL = await QRCode.toDataURL(data, qrOptions);
      return dataURL;

    } catch (error) {
      console.error('[QR] Error generating QR data URL:', error);
      throw error;
    }
  }

  // Pokaż QR kod w modalu
  async showQRModal(event) {
    const modal = document.getElementById('qr-modal');
    if (!modal) {
      console.error('[QR] QR modal not found');
      return;
    }

    // Wygeneruj QR kod
    const success = await this.generateEventQR(event, 'qr-code-container');
    
    if (success) {
      // Ustaw URL do kopiowania
      const shareUrl = this.createEventShareUrl(event);
      const urlInput = document.getElementById('share-url-input');
      if (urlInput) {
        urlInput.value = shareUrl;
      }

      // Skonfiguruj przycisk kopiowania
      const copyBtn = document.getElementById('copy-url-btn');
      if (copyBtn) {
        copyBtn.onclick = () => this.copyShareUrl(shareUrl);
      }

      // Pokaż modal
      if (window.app) {
        window.app.showModal('qr-modal');
      } else {
        modal.style.display = 'flex';
        modal.classList.add('show');
      }
    }
  }

  // Skopiuj URL udostępnienia
  async copyShareUrl(url) {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(url);
        showNotification(t('success.linkCopied'), 'success');
      } else {
        // Fallback dla starszych przeglądarek
        this.fallbackCopyText(url);
      }
    } catch (error) {
      console.error('[QR] Error copying URL:', error);
      this.fallbackCopyText(url);
    }
  }

  // Fallback kopiowanie dla starszych przeglądarek
  fallbackCopyText(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
      const successful = document.execCommand('copy');
      if (successful) {
        showNotification(t('success.linkCopied'), 'success');
      } else {
        throw new Error('Copy command failed');
      }
    } catch (error) {
      console.error('[QR] Fallback copy failed:', error);
      
      // Ostatni fallback - pokaż URL do ręcznego skopiowania
      this.showCopyFallback(text);
    } finally {
      document.body.removeChild(textArea);
    }
  }

  // Pokaż URL do ręcznego skopiowania
  showCopyFallback(url) {
    const fallbackDiv = document.createElement('div');
    fallbackDiv.className = 'copy-fallback';
    fallbackDiv.innerHTML = `
      <div class="copy-fallback-content">
        <h4>${t('qr.copyManually')}</h4>
        <input type="text" value="${url}" readonly onclick="this.select()">
        <button onclick="this.parentElement.parentElement.remove()" class="btn btn-small btn-secondary">
          ${t('qr.close')}
        </button>
      </div>
    `;
    
    // Style inline
    Object.assign(fallbackDiv.style, {
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      background: 'var(--color-surface)',
      padding: '20px',
      borderRadius: '8px',
      boxShadow: 'var(--shadow-lg)',
      zIndex: '10000',
      maxWidth: '90%'
    });
    
    document.body.appendChild(fallbackDiv);
  }

  // Pobierz QR kod jako obraz
  async downloadQR(data, filename = 'qr-code.png', options = {}) {
    try {
      const dataURL = await this.getQRDataURL(data, options);
      
      // Utwórz link do pobrania
      const link = document.createElement('a');
      link.download = filename;
      link.href = dataURL;
      
      // Kliknij automatycznie
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      showNotification(t('success.qrDownloaded'), 'success');
      
    } catch (error) {
      console.error('[QR] Error downloading QR:', error);
      showNotification(t('error.qrDownload'), 'error');
    }
  }

  // Wyświetl błąd QR
  showQRError(containerId, errorMessage) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = `
      <div class="qr-error">
        <div class="qr-error-icon">❌</div>
        <p class="qr-error-message">${errorMessage}</p>
        <button onclick="location.reload()" class="btn btn-small btn-secondary">
          ${t('qr.retry')}
        </button>
      </div>
    `;

    // Style inline dla błędu
    container.style.display = 'flex';
    container.style.flexDirection = 'column';
    container.style.alignItems = 'center';
    container.style.justifyContent = 'center';
    container.style.padding = '20px';
    container.style.textAlign = 'center';
  }

  // Sprawdź czy można skanować QR (kamera)
  canScanQR() {
    return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
  }

  // Rozpocznij skanowanie QR (placeholder - wymagałoby dodatkowej biblioteki)
  async startQRScanning(videoElementId, onScan, onError) {
    if (!this.canScanQR()) {
      onError(new Error('Camera not available'));
      return;
    }

    try {
      // To wymagałoby dodatkowej biblioteki jak jsQR lub qr-scanner
      // Na razie placeholder
      console.warn('[QR] QR scanning not implemented - requires additional library');
      onError(new Error('QR scanning not implemented'));
      
    } catch (error) {
      console.error('[QR] Error starting QR scan:', error);
      onError(error);
    }
  }

  // Zatrzymaj skanowanie QR
  stopQRScanning() {
    // Placeholder dla funkcji zatrzymania skanowania
    console.log('[QR] Stop QR scanning');
  }

  // Waliduj QR data
  validateQRData(data) {
    try {
      // Sprawdź czy to URL
      new URL(data);
      return { isValid: true, type: 'url' };
    } catch {
      // Sprawdź czy to JSON
      try {
        JSON.parse(data);
        return { isValid: true, type: 'json' };
      } catch {
        // Zwykły tekst
        return { isValid: true, type: 'text' };
      }
    }
  }

  // Parsuj QR z wydarzenia (jeśli ktoś zeskanuje nasz QR)
  parseEventQR(data) {
    try {
      const url = new URL(data);
      
      // Sprawdź czy to nasz URL
      if (url.pathname === '/event-details.html') {
        const eventId = url.searchParams.get('id');
        if (eventId) {
          return { eventId, isEventQR: true };
        }
      }
      
      return { isEventQR: false };
      
    } catch (error) {
      return { isEventQR: false };
    }
  }

  // Wyczyść cache QR kodów
  clearQRCache() {
    this.qrInstances.clear();
    console.log('[QR] QR cache cleared');
  }

  // Pobierz statystyki QR
  getQRStats() {
    return {
      totalGenerated: this.qrInstances.size,
      oldestTimestamp: Math.min(...Array.from(this.qrInstances.values()).map(qr => qr.timestamp)),
      libraryLoaded: this.isQRLibraryLoaded
    };
  }
}

// Globalna instancja QRManager
console.log('[QR] Creating QRManager instance...');
window.qrManager = new QRManager();

// Event listenery dla QR functionality
document.addEventListener('DOMContentLoaded', () => {
  console.log('[QR] DOM loaded, setting up QR event listeners...');
  // Przycisk pokazania QR w szczegółach wydarzenia
  const showQRBtn = document.getElementById('show-qr-btn');
  if (showQRBtn) {
    showQRBtn.addEventListener('click', () => {
      if (window.currentEvent) {
        window.qrManager.showQRModal(window.currentEvent);
      }
    });
  }

  // Przycisk udostępnienia w kartach wydarzeń
  document.addEventListener('click', (e) => {
    if (e.target.classList.contains('share-btn') || e.target.closest('.share-btn')) {
      const eventCard = e.target.closest('.event-card');
      if (eventCard) {
        const eventId = eventCard.getAttribute('data-event-id');
        const event = window.storageManager.getEvent(eventId);
        if (event) {
          window.qrManager.showQRModal(event);
        }
      }
    }
  });
});

// Funkcje globalne dla łatwiejszego użycia
window.generateQR = (data, containerId, options) => 
  window.qrManager.generateQR(data, containerId, options);

window.showQRModal = (event) => 
  window.qrManager.showQRModal(event);

console.log('[QR] QRManager initialized');
