// Skrypt specyficzny dla strony szczegółów wydarzenia
let currentEvent = null;
let eventMap = null;

document.addEventListener('DOMContentLoaded', function() {
    initEventDetails();
});

async function initEventDetails() {
    try {
        const eventId = getEventIdFromUrl();
        
        if (!eventId) {
            showErrorState('details.noEventId', 'Nie podano ID wydarzenia');
            return;
        }
        
        const event = await getEvent(eventId);
        
        if (!event) {
            showErrorState('details.eventNotFound', 'Wydarzenie nie znalezione');
            return;
        }
        
        currentEvent = event;
        displayEventDetails(event);
        checkOrganizerPermissions(event);
        hideLoadingState();
        
    } catch (error) {
        console.error('Błąd ładowania wydarzenia:', error);
        showErrorState('details.loadError', 'Błąd ładowania wydarzenia');
    }
}

function getEventIdFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id') || urlParams.get('event');
}

function displayEventDetails(event) {
    // Aktualizuj tytuł strony
    document.title = `${event.title} - Fete Lite`;
    
    // Wypełnij dane wydarzenia
    const eventTitle = document.getElementById('event-title');
    if (eventTitle) {
        eventTitle.textContent = event.title;
    }
    
    // Data i czas
    const startDate = new Date(event.startDate);
    const eventDay = document.getElementById('event-day');
    const eventMonth = document.getElementById('event-month');
    
    if (eventDay) {
        eventDay.textContent = startDate.getDate();
    }
    if (eventMonth) {
        eventMonth.textContent = startDate.toLocaleDateString('pl-PL', { month: 'short' });
    }
    
    // Czas wydarzenia
    const timeText = formatEventTime(event);
    const eventTimeText = document.getElementById('event-time-text');
    if (eventTimeText) {
        eventTimeText.textContent = timeText;
    }
    
    // Lokalizacja
    if (event.location) {
        const locationText = document.getElementById('event-location-text');
        const locationInfo = document.getElementById('event-location-info');
        
        if (locationText) {
            locationText.textContent = event.location;
        }
        if (locationInfo) {
            locationInfo.style.display = 'block';
        }
        
        // Pokaż mapę jeśli mamy współrzędne
        if (event.coordinates) {
            showEventMap(event.coordinates, event.location);
        }
    }
    
    // Opis
    if (event.description) {
        const eventDescription = document.getElementById('event-description');
        const descriptionSection = document.getElementById('event-description-section');
        
        if (eventDescription) {
            eventDescription.textContent = event.description;
        }
        if (descriptionSection) {
            descriptionSection.style.display = 'block';
        }
    }
    
    // Opcje dodatkowe
    if (event.options && event.options.length > 0) {
        displayEventOptions(event.options);
        const optionsSection = document.getElementById('event-options-section');
        if (optionsSection) {
            optionsSection.style.display = 'block';
        }
    }
    
    // Wyświetl kod zaproszenia jeśli istnieje
    if (event.invitationCode) {
        displayInvitationCode(event.invitationCode);
    }
    
    // Pokaż kontener szczegółów
    const detailsContainer = document.getElementById('event-details-container');
    if (detailsContainer) {
        detailsContainer.style.display = 'block';
    }
    
    // Inicjalizuj handlery
    initEventActionHandlers(event);
}

function formatEventTime(event) {
    const startDate = new Date(event.startDate);
    const endDate = event.endDate ? new Date(event.endDate) : null;
    
    const timeOptions = { hour: '2-digit', minute: '2-digit' };
    const startTime = startDate.toLocaleTimeString('pl-PL', timeOptions);
    
    if (endDate) {
        const endTime = endDate.toLocaleTimeString('pl-PL', timeOptions);
        
        // Sprawdź czy to ten sam dzień
        if (startDate.toDateString() === endDate.toDateString()) {
            return `${startTime} - ${endTime}`;
        } else {
            const endDateStr = endDate.toLocaleDateString('pl-PL');
            return `${startTime} - ${endDateStr} ${endTime}`;
        }
    }
    
    return startTime;
}

function displayEventOptions(options) {
    const container = document.getElementById('event-options');
    const template = document.getElementById('event-option-template');
    
    if (!container) {
        console.warn('Event options container not found');
        return;
    }
    
    if (!template) {
        console.warn('Event option template not found');
        return;
    }
    
    // Mapowanie opcji na ikony i etykiety
    const optionConfig = {
        food: { icon: '🍕', label: 'Jedzenie' },
        drinks: { icon: '🥤', label: 'Napoje' },
        alcohol: { icon: '🍺', label: 'Alkohol' },
        accommodation: { icon: '🏠', label: 'Nocleg' },
        music: { icon: '🎵', label: 'Muzyka' },
        games: { icon: '🎮', label: 'Gry/Zabawy' }
    };
    
    container.innerHTML = '';
    
    options.forEach(option => {
        const config = optionConfig[option];
        if (config) {
            const optionElement = template.content.cloneNode(true);
            const iconElement = optionElement.querySelector('.option-icon');
            const labelElement = optionElement.querySelector('.option-label');
            
            if (iconElement) {
                iconElement.textContent = config.icon;
            }
            if (labelElement) {
                labelElement.textContent = config.label;
            }
            
            container.appendChild(optionElement);
        }
    });
}

function displayInvitationCode(code) {
    // Dodaj kod zaproszenia do metadanych wydarzenia
    const eventMeta = document.querySelector('.event-meta');
    if (!eventMeta) return;
    
    // Sprawdź czy kod już nie został dodany
    if (eventMeta.querySelector('.event-invite-code')) return;
    
    const inviteCodeDiv = document.createElement('div');
    inviteCodeDiv.className = 'event-invite-code';
    inviteCodeDiv.innerHTML = `
        <span class="meta-icon">🎫</span>
        <span class="invite-code-label" data-i18n="details.inviteCode">Kod zaproszenia:</span>
        <span class="invite-code-value">${code}</span>
    `;
    
    eventMeta.appendChild(inviteCodeDiv);
}

function showEventMap(coordinates, locationName) {
    const mapContainer = document.getElementById('event-map');
    const mapSection = document.getElementById('event-map-section');
    
    // Pokaż sekcję mapy
    mapSection.style.display = 'block';
    
    // Inicjalizuj mapę
    if (!eventMap) {
        eventMap = L.map('event-map').setView([coordinates.lat, coordinates.lng], 15);
        
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(eventMap);
    }
    
    // Dodaj marker
    L.marker([coordinates.lat, coordinates.lng])
        .addTo(eventMap)
        .bindPopup(locationName)
        .openPopup();
}

function initEventActionHandlers(event) {
    // Skopiuj kod zaproszenia
    const copyInviteCodeBtn = document.getElementById('copy-invite-code-btn');
    if (copyInviteCodeBtn) {
        copyInviteCodeBtn.addEventListener('click', async function() {
            await copyInviteCode(event);
        });
    }
    
    // Eksport do kalendarza
    const exportBtn = document.getElementById('export-calendar-btn');
    if (exportBtn) {
        exportBtn.addEventListener('click', function() {
            exportToCalendar(event);
        });
    }
    
    // Pokaż QR kod
    const qrBtn = document.getElementById('show-qr-btn');
    if (qrBtn) {
        qrBtn.addEventListener('click', function() {
            showQRModal(event);
        });
    }
    
    // Udostępnij wydarzenie z animacją
    const shareBtn = document.getElementById('share-event-btn');
    if (shareBtn) {
        shareBtn.addEventListener('click', function(e) {
        const btn = e.currentTarget;
        
        // Dodaj animację loading
        btn.classList.add('loading');
        
        // Wywołaj funkcję share
        const sharePromise = shareEvent(event);
        
        // Obsłuż sukces/błąd
        if (sharePromise && sharePromise.then) {
            sharePromise.then(() => {
                btn.classList.remove('loading');
                btn.classList.add('success');
                setTimeout(() => btn.classList.remove('success'), 1500);
            }).catch(() => {
                btn.classList.remove('loading');
            });
        } else {
            // Jeśli shareEvent nie zwraca promise
            setTimeout(() => {
                btn.classList.remove('loading');
                btn.classList.add('success');
                setTimeout(() => btn.classList.remove('success'), 1500);
            }, 500);
        }
        });
    }
    
    // Edytuj wydarzenie
    const editBtn = document.getElementById('edit-event-btn');
    if (editBtn) {
        editBtn.addEventListener('click', function() {
            showModal('edit-modal');
        });
    }
    
    // Usuń wydarzenie
    const deleteBtn = document.getElementById('delete-event-btn');
    if (deleteBtn) {
        deleteBtn.addEventListener('click', function() {
            showModal('delete-modal');
        });
    }
    
    // Potwierdź usunięcie
    const confirmDeleteBtn = document.getElementById('confirm-delete-btn');
    if (confirmDeleteBtn) {
        confirmDeleteBtn.addEventListener('click', function() {
            deleteCurrentEvent();
        });
    }
    
    // Pokaż dojazd
    const directionsBtn = document.getElementById('show-directions-btn');
    if (directionsBtn && event.coordinates) {
        directionsBtn.addEventListener('click', function() {
            showDirections(event.coordinates);
        });
    }
}

function showErrorState(messageKey, fallbackMessage) {
    const loadingState = document.getElementById('loading-state');
    const errorState = document.getElementById('error-state');
    
    if (loadingState) {
        loadingState.style.display = 'none';
    }
    
    if (errorState) {
        errorState.style.display = 'block';
        
        // Aktualizuj komunikat błędu jeśli element istnieje
        const errorMessage = errorState.querySelector('.error-message');
        if (errorMessage && window.t) {
            errorMessage.textContent = window.t(messageKey) || fallbackMessage;
        }
    } else {
        // Fallback - pokaż alert jeśli nie ma elementu error-state
        console.error('Error state element not found:', messageKey, fallbackMessage);
        alert(fallbackMessage);
    }
}

function hideLoadingState() {
    const loadingState = document.getElementById('loading-state');
    if (loadingState) {
        loadingState.style.display = 'none';
    }
}

async function deleteCurrentEvent() {
    try {
        await deleteEvent(currentEvent.id);
        showNotification('Wydarzenie zostało usunięte', 'success');
        window.location.href = '/';
    } catch (error) {
        console.error('Błąd usuwania wydarzenia:', error);
        showNotification('Błąd podczas usuwania wydarzenia', 'error');
    }
}

function showDirections(coordinates) {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${coordinates.lat},${coordinates.lng}`;
    window.open(url, '_blank');
}

// Sprawdź uprawnienia organizatora i dostosuj interfejs
function checkOrganizerPermissions(event) {
    const isOrganizer = window.storageManager && window.storageManager.isUserOrganizer(event.id);
    
    // Pobierz przycisk edycji, sekcję z niebezpiecznymi akcjami i action-buttons
    const editBtn = document.getElementById('edit-event-btn');
    const dangerActions = document.querySelector('.danger-actions');
    const actionButtons = document.querySelector('.action-buttons');
    
    // Usuń przycisk edycji i całą sekcję danger-actions z DOM jeśli użytkownik nie jest organizatorem
    if (!isOrganizer) {
        if (editBtn) editBtn.remove();
        if (dangerActions) {
            dangerActions.remove();
            // Usuń margines dolny z action-buttons gdy danger-actions są usunięte
            if (actionButtons) actionButtons.classList.add('no-danger-margin');
        }
    }
    
    // Wyświetl informacje o organizatorze
    displayOrganizerInfo(event);
}

// Wyświetl informacje o organizatorze wydarzenia
function displayOrganizerInfo(event) {
    if (!event.organizerName && !event.organizerId) {
        return; // Brak informacji o organizatorze
    }
    
    // Znajdź lub utwórz sekcję z informacjami o organizatorze
    let organizerSection = document.getElementById('organizer-info-section');
    
    if (!organizerSection) {
        // Utwórz sekcję jeśli nie istnieje
        const descriptionSection = document.getElementById('event-description-section');
        if (descriptionSection) {
            organizerSection = document.createElement('div');
            organizerSection.id = 'organizer-info-section';
            organizerSection.className = 'event-info-section';
            descriptionSection.parentNode.insertBefore(organizerSection, descriptionSection.nextSibling);
        } else {
            return;
        }
    }
    
    const isCurrentUserOrganizer = window.storageManager && window.storageManager.isUserOrganizer(event.id);
    const organizerLabel = isCurrentUserOrganizer ? 'Ty jesteś organizatorem' : 'Organizator';
    
    organizerSection.innerHTML = `
        <div class="section-header">
            <i class="fas fa-user-tie"></i>
            <h3>${organizerLabel}</h3>
        </div>
        <div class="organizer-info">
            <div class="organizer-details">
                <i class="fas fa-user-circle"></i>
                <span class="organizer-name">${event.organizerName || event.organizerId}</span>
            </div>
            ${isCurrentUserOrganizer ? '<span class="badge badge-primary">Twoje wydarzenie</span>' : ''}
        </div>
    `;
    
        organizerSection.style.display = 'block';
}

// Skopiuj kod zaproszenia do schowka
async function copyInviteCode(event) {
    if (!event || !event.invitationCode) {
        showNotification(window.t('details.noInviteCode') || 'Brak kodu zaproszenia', 'error');
        return;
    }
    
    const inviteCode = event.invitationCode;
    const btn = document.getElementById('copy-invite-code-btn');
    
    try {
        // Spróbuj użyć nowoczesnego API Clipboard
        if (navigator.clipboard && navigator.clipboard.writeText) {
            await navigator.clipboard.writeText(inviteCode);
        } else {
            // Fallback dla starszych przeglądarek
            const textArea = document.createElement('textarea');
            textArea.value = inviteCode;
            textArea.style.position = 'fixed';
            textArea.style.left = '-9999px';
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
        }
        
        // Animacja sukcesu na przycisku
        if (btn) {
            const originalHTML = btn.innerHTML;
            btn.innerHTML = '<span class="btn-icon">✅</span><span>Skopiowano!</span>';
            btn.classList.add('success');
            
            setTimeout(() => {
                btn.innerHTML = originalHTML;
                btn.classList.remove('success');
            }, 2000);
        }
        
        // Pokaż powiadomienie z kodem
        showNotification(
            `${window.t('details.inviteCodeCopied') || 'Skopiowano kod zaproszenia'}: ${inviteCode}`,
            'success'
        );
        
    } catch (error) {
        console.error('[EventDetails] Error copying invite code:', error);
        showNotification(
            window.t('details.copyError') || 'Nie udało się skopiować kodu',
            'error'
        );
    }
}
