#!/bin/bash

# Skrypt do uruchomienia lokalnego serwera HTTP dla frontendu Fete Lite
# Wymaga Python 3.x

PORT=${1:-8080}
echo "🚀 Uruchamianie serwera HTTP na porcie $PORT..."
echo "📂 Serwowanie plików z: $(pwd)"
echo "🌐 Aplikacja będzie dostępna pod: http://localhost:$PORT"
echo "🔗 Backend API: fetebackend-production.up.railway.app"
echo ""
echo "Aby zatrzymać serwer, naciśnij Ctrl+C"
echo ""

# Sprawdź czy Python 3 jest dostępny
if command -v python3 &> /dev/null; then
    python3 -m http.server $PORT
elif command -v python &> /dev/null; then
    python -m http.server $PORT
else
    echo "❌ Błąd: Python nie jest zainstalowany."
    echo "   Zainstaluj Python z https://www.python.org/"
    echo "   Alternatywnie możesz użyć innych serwerów jak:"
    echo "   - Node.js: npx http-server -p $PORT"
    echo "   - PHP: php -S localhost:$PORT"
    exit 1
fi