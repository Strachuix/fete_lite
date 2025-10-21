# Skrypt PowerShell do uruchomienia lokalnego serwera HTTP dla frontendu Fete Lite

param(
    [int]$Port = 8080
)

Write-Host "🚀 Uruchamianie serwera HTTP na porcie $Port..." -ForegroundColor Green
Write-Host "📂 Serwowanie plików z: $(Get-Location)" -ForegroundColor Cyan
Write-Host "🌐 Aplikacja będzie dostępna pod: http://localhost:$Port" -ForegroundColor Yellow
Write-Host "🔗 Backend API: https://backend-production-bb92.up.railway.app/api/v1" -ForegroundColor Magenta
Write-Host ""
Write-Host "Aby zatrzymać serwer, naciśnij Ctrl+C" -ForegroundColor Red
Write-Host ""

# Sprawdź dostępność różnych serwerów HTTP
$pythonFound = $false
$nodeFound = $false
$phpFound = $false

# Sprawdź Python
try {
    $null = python --version 2>$null
    $pythonFound = $true
} catch {
    try {
        $null = python3 --version 2>$null
        $pythonFound = $true
    } catch {}
}

# Sprawdź Node.js
try {
    $null = node --version 2>$null
    $nodeFound = $true
} catch {}

# Sprawdź PHP
try {
    $null = php --version 2>$null
    $phpFound = $true
} catch {}

# Uruchom najlepszy dostępny serwer
if ($pythonFound) {
    Write-Host "✅ Używam Python HTTP Server..." -ForegroundColor Green
    try {
        python -m http.server $Port
    } catch {
        python3 -m http.server $Port
    }
} elseif ($nodeFound) {
    Write-Host "✅ Używam Node.js http-server..." -ForegroundColor Green
    # Sprawdź czy http-server jest zainstalowany
    try {
        npx http-server -p $Port -c-1 --cors
    } catch {
        Write-Host "❌ Instalowanie http-server..." -ForegroundColor Yellow
        npm install -g http-server
        npx http-server -p $Port -c-1 --cors
    }
} elseif ($phpFound) {
    Write-Host "✅ Używam PHP Built-in Server..." -ForegroundColor Green
    php -S "localhost:$Port"
} else {
    Write-Host "❌ Błąd: Nie znaleziono odpowiedniego serwera HTTP." -ForegroundColor Red
    Write-Host "   Zainstaluj jeden z:" -ForegroundColor Yellow
    Write-Host "   - Python: https://www.python.org/" -ForegroundColor Cyan
    Write-Host "   - Node.js: https://nodejs.org/" -ForegroundColor Cyan
    Write-Host "   - PHP: https://www.php.net/" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Alternatywnie otwórz index.html bezpośrednio w przeglądarce" -ForegroundColor Gray
    Write-Host "(niektóre funkcje mogą nie działać bez serwera HTTP)" -ForegroundColor Gray
    exit 1
}