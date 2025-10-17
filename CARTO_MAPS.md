# Migracja do Carto Maps

## Przegląd

Aplikacja została zaktualizowana do używania **Carto Maps** zamiast standardowego OpenStreetMap. Carto oferuje lepszą estetykę i wydajność przy zachowaniu pełnej darmowości i braku konieczności rejestracji.

## Zalety Carto Maps

### ✅ Korzyści
- **Całkowicie darmowe** - bez limitów, bez rejestracji, bez klucza API
- **Lepszy wygląd** - nowoczesny, minimalistyczny design
- **Lepsza wydajność** - zoptymalizowane serwery CDN
- **Wyższa jakość** - maxZoom 20 (vs 19 w OSM)
- **Retina ready** - automatyczna detekcja wysokiej rozdzielczości
- **Multiple subdomains** - szybsze równoległe ładowanie (a, b, c, d)

### 📊 Porównanie

| Cecha | OpenStreetMap | Carto Maps |
|-------|---------------|------------|
| Koszt | Darmowy | Darmowy |
| Klucz API | Nie wymaga | Nie wymaga |
| MaxZoom | 19 | 20 |
| Wygląd | Podstawowy | Nowoczesny |
| Subdomeny | a, b, c | a, b, c, d |
| CDN | Wolniejszy | Szybszy |

## Zmiany w kodzie

### 1. js/geolocation.js

**Przed:**
```javascript
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap contributors',
  maxZoom: 19,
  // ...
})
```

**Po:**
```javascript
L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
  attribution: '© OpenStreetMap contributors © CARTO',
  subdomains: 'abcd',
  maxZoom: 20,
  // ...
})
```

### 2. HTML Files (event-details.html, create-event.html)

**Przed:**
```html
<link rel="dns-prefetch" href="https://tile.openstreetmap.org">
<link rel="preconnect" href="https://tile.openstreetmap.org" crossorigin>
```

**Po:**
```html
<link rel="dns-prefetch" href="https://basemaps.cartocdn.com">
<link rel="preconnect" href="https://basemaps.cartocdn.com" crossorigin>
```

### 3. Wersje (manifest.json, service-worker.js)

- Manifest: `1.0.9` → `1.1.0`
- Service Worker: `1.0.18` → `1.1.0`

## Dostępne style Carto

Możesz łatwo zmienić styl mapy modyfikując URL w `geolocation.js`:

### 🌍 Voyager (obecny)
```javascript
'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png'
```
- Jasny, kolorowy, idealny do nawigacji
- **Rekomendowany dla większości zastosowań**

### 🌙 Dark Matter
```javascript
'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
```
- Ciemny motyw, idealny dla aplikacji nocnych
- Świetny dla dark mode

### ☀️ Positron
```javascript
'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'
```
- Bardzo jasny, minimalistyczny
- Idealny gdy chcesz wyeksponować własne markery

### 🗺️ Voyager (bez etykiet)
```javascript
'https://{s}.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}{r}.png'
```
- Voyager bez nazw miast/ulic
- Gdy chcesz dodać własne etykiety

## Zmiana stylu

Aby zmienić styl mapy:

1. Otwórz `js/geolocation.js`
2. Znajdź funkcję `createMap()`
3. Zmień URL w `L.tileLayer()`
4. Opcjonalnie dostosuj atrybucję

Przykład zmiany na Dark Matter:

```javascript
L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
  attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors © <a href="https://carto.com/attributions">CARTO</a>',
  subdomains: 'abcd',
  maxZoom: 20,
  // ... reszta opcji bez zmian
}).addTo(map);
```

## Wydajność

Optymalizacje wydajności zachowane:
- ✅ DNS prefetch dla `basemaps.cartocdn.com`
- ✅ Preconnect z crossorigin
- ✅ Canvas rendering (`preferCanvas: true`)
- ✅ Lazy loading Leaflet
- ✅ Async CSS/JS loading
- ✅ `updateWhenIdle: true`
- ✅ `keepBuffer: 2`
- ✅ `detectRetina: true`

## Kompatybilność

- ✅ Wszystkie przeglądarki wspierające Leaflet
- ✅ Retina/HiDPI displays
- ✅ Mobile devices
- ✅ Offline (cache przez Service Worker)

## Licencja

Carto Maps wymagają atrybucji:
```
© OpenStreetMap contributors © CARTO
```

Jest ona automatycznie dodawana w prawym dolnym rogu mapy.

## Dodatkowe zasoby

- [Carto Basemaps](https://github.com/CartoDB/basemap-styles)
- [Carto Attribution](https://carto.com/attributions/)
- [Leaflet Documentation](https://leafletjs.com/)

## Wersja

- **Data zmiany:** 15 października 2025
- **Wersja aplikacji:** 1.1.0
- **Poprzedni provider:** OpenStreetMap
- **Obecny provider:** Carto Maps (Voyager)
