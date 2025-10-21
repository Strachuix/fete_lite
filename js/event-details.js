// Skrypt specyficzny dla strony szczegółów wydarzenia
let currentEvent = null;
let eventMap = null;

document.addEventListener('DOMContentLoaded', function() {
    initEventDetails();
    initModalHandlers();
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

// Initialize modal handlers (close buttons, backdrop clicks)
function initModalHandlers() {
    const modals = document.querySelectorAll('.modal');
    
    modals.forEach(modal => {
        // Close on backdrop click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                hideModal(modal.id);
            }
        });
        
        // Close on close button click
        const closeButtons = modal.querySelectorAll('.modal-close');
        closeButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                hideModal(modal.id);
            });
        });
    });
    
    // ESC key to close modals
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const openModal = document.querySelector('.modal.show');
            if (openModal) {
                hideModal(openModal.id);
            }
        }
    });
}

// Show modal helper
function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    
    modal.style.display = 'flex';
    setTimeout(() => modal.classList.add('show'), 10);
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
}

// Hide modal helper
function hideModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    
    modal.classList.remove('show');
    setTimeout(() => {
        modal.style.display = 'none';
        document.body.style.overflow = ''; // Restore scrolling
    }, 300); // Match CSS transition duration
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
    
    // Wyświetl listę uczestników
    displayParticipants(event.id);
    
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

function displayParticipants(eventId) {
    const participantsSection = document.getElementById('event-participants-section');
    const participantsList = document.getElementById('participants-list');
    const noParticipantsMsg = document.getElementById('no-participants-message');
    
    if (!participantsSection || !participantsList) {
        return;
    }
    
    // Załaduj uczestników z localStorage
    const participantsData = localStorage.getItem(`event_participants_${eventId}`);
    
    if (!participantsData) {
        // Brak uczestników
        if (noParticipantsMsg) {
            noParticipantsMsg.style.display = 'block';
        }
        participantsList.innerHTML = '';
        participantsSection.style.display = 'none';
        return;
    }
    
    try {
        const participants = JSON.parse(participantsData);
        
        if (!participants || participants.length === 0) {
            // Pusta lista uczestników
            if (noParticipantsMsg) {
                noParticipantsMsg.style.display = 'block';
            }
            participantsList.innerHTML = '';
            participantsSection.style.display = 'none';
            return;
        }
        
        // Pokaż sekcję uczestników
        participantsSection.style.display = 'block';
        if (noParticipantsMsg) {
            noParticipantsMsg.style.display = 'none';
        }
        
        // Wygeneruj listę uczestników
        participantsList.innerHTML = participants.map(participant => {
            const initials = getParticipantInitials(participant.name);
            const emailText = participant.email ? `<div class="participant-email">${participant.email}</div>` : '';
            
            return `
                <div class="participant-card">
                    <div class="participant-avatar">${initials}</div>
                    <div class="participant-info">
                        <div class="participant-name">${participant.name}</div>
                        ${emailText}
                    </div>
                </div>
            `;
        }).join('');
        
    } catch (error) {
        console.error('Błąd parsowania danych uczestników:', error);
        if (noParticipantsMsg) {
            noParticipantsMsg.style.display = 'block';
        }
        participantsSection.style.display = 'none';
    }
}

function getParticipantInitials(name) {
    if (!name) return '?';
    
    const nameParts = name.trim().split(' ').filter(part => part.length > 0);
    
    if (nameParts.length === 0) return '?';
    if (nameParts.length === 1) return nameParts[0][0].toUpperCase();
    
    // Pierwsza litera z pierwszego i ostatniego słowa
    return (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase();
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
    // Dodaj do kalendarza
    const addToCalendarBtn = document.getElementById('add-to-calendar-btn');
    if (addToCalendarBtn) {
        addToCalendarBtn.addEventListener('click', async function() {
            if (window.icsExportManager) {
                await window.icsExportManager.exportEventToCalendar(event);
            } else {
                showNotification('Moduł eksportu kalendarza nie jest dostępny', 'error');
            }
        });
    }
    
    // Dołącz do wydarzenia (dla uczestników)
    const joinBtn = document.getElementById('join-event-btn');
    if (joinBtn) {
        joinBtn.addEventListener('click', function() {
            showJoinModal(event);
        });
    }
    
    // Skopiuj kod zaproszenia
    const copyInviteCodeBtn = document.getElementById('copy-invite-code-btn');
    if (copyInviteCodeBtn) {
        copyInviteCodeBtn.addEventListener('click', async function() {
            await copyInviteCode(event);
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
    if (!currentEvent) {
        showNotification('Brak wydarzenia do usunięcia', 'error');
        return;
    }
    
    try {
        // Close modal first
        hideModal('delete-modal');
        
        // Show loading notification
        showNotification('Usuwanie wydarzenia...', 'info');
        
        // Delete the event
        await deleteEvent(currentEvent.id);
        
        // Show success and redirect
        showNotification('Wydarzenie zostało usunięte', 'success');
        
        // Redirect after short delay
        setTimeout(() => {
            window.location.href = '/';
        }, 1000);
        
    } catch (error) {
        console.error('Błąd usuwania wydarzenia:', error);
        showNotification('Błąd podczas usuwania wydarzenia', 'error');
    }
}

function showDirections(coordinates) {
    // Detect platform and use appropriate maps service
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    const isAndroid = /Android/.test(navigator.userAgent);
    
    let url;
    
    if (isIOS) {
        // Use Apple Maps on iOS
        url = `maps://maps.apple.com/?daddr=${coordinates.lat},${coordinates.lng}&dirflg=d`;
        
        // Fallback to Google Maps if Apple Maps doesn't open
        setTimeout(() => {
            window.open(`https://maps.google.com/maps?daddr=${coordinates.lat},${coordinates.lng}`, '_blank');
        }, 25);
    } else if (isAndroid) {
        // Try to open in Google Maps app first
        url = `google.navigation:q=${coordinates.lat},${coordinates.lng}`;
        
        // Fallback to web version
        setTimeout(() => {
            window.open(`https://maps.google.com/maps?daddr=${coordinates.lat},${coordinates.lng}`, '_blank');
        }, 25);
    } else {
        // Desktop - use Google Maps web
        url = `https://www.google.com/maps/dir/?api=1&destination=${coordinates.lat},${coordinates.lng}`;
    }
    
    // Try to open native app first (mobile)
    if (isIOS || isAndroid) {
        const link = document.createElement('a');
        link.href = url;
        link.click();
    } else {
        // Desktop - direct open
        window.open(url, '_blank');
    }
}

// Sprawdź uprawnienia organizatora i dostosuj interfejs
function checkOrganizerPermissions(event) {
    const isOrganizer = window.storageManager && window.storageManager.isUserOrganizer(event.id);
    
    // Pobierz przyciski
    const editBtn = document.getElementById('edit-event-btn');
    const dangerActions = document.querySelector('.danger-actions');
    const actionButtons = document.querySelector('.action-buttons');
    const joinBtn = document.getElementById('join-event-btn');
    
    // Pokaż przycisk dołączenia tylko dla nie-organizatorów
    if (!isOrganizer) {
        if (joinBtn) joinBtn.style.display = 'flex';
        if (editBtn) editBtn.remove();
        if (dangerActions) {
            dangerActions.remove();
            // Usuń margines dolny z action-buttons gdy danger-actions są usunięte
            if (actionButtons) actionButtons.classList.add('no-danger-margin');
        }
    } else {
        // Ukryj przycisk dołączenia dla organizatora
        if (joinBtn) joinBtn.style.display = 'none';
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

// Pokaż modal z kodem QR
function showQRModal(event) {
    if (!event) return;
    
    const modal = document.getElementById('qr-modal');
    if (!modal) {
        console.warn('[EventDetails] QR modal not found');
        return;
    }
    
    // Wygeneruj dane do QR code (kod zaproszenia + link)
    const eventUrl = `${window.location.origin}${window.location.pathname}?id=${event.id}`;
    const qrData = event.invitationCode ? 
        `${event.invitationCode}\n${eventUrl}` : 
        eventUrl;
    
    // Znajdź kontener na QR code
    const qrContainer = modal.querySelector('#qr-code-container') || modal.querySelector('.qr-code');
    if (!qrContainer) {
        console.warn('[EventDetails] QR container not found');
        return;
    }
    
    // Wyczyść poprzedni kod
    qrContainer.innerHTML = '';
    
    // Sprawdź czy biblioteka QRCode jest dostępna
    if (typeof QRCode !== 'undefined') {
        try {
            // Wygeneruj nowy kod QR
            new QRCode(qrContainer, {
                text: qrData,
                width: 256,
                height: 256,
                colorDark: '#000000',
                colorLight: '#ffffff',
                correctLevel: QRCode.CorrectLevel.H
            });
            
            // Dodaj tekst z kodem zaproszenia
            if (event.invitationCode) {
                const codeText = modal.querySelector('#qr-code-text') || modal.querySelector('.qr-invite-code');
                if (codeText) {
                    codeText.textContent = event.invitationCode;
                }
            }
            
            
            // Pokaż modal
            modal.style.display = 'block';
            modal.classList.add('show');
            
        } catch (error) {
            console.error('[EventDetails] QR generation error:', error);
            showNotification(window.t('error.qrFailed') || 'Nie udało się wygenerować kodu QR', 'error');
        }
    } else {
        console.warn('[EventDetails] QRCode library not loaded');
        showNotification(window.t('error.qrLibrary') || 'Biblioteka QR code nie została załadowana', 'error');
    }
}

// Udostępnij wydarzenie za pomocą Web Share API
async function shareEvent(event) {
    if (!event) {
        console.warn('[EventDetails] No event to share');
        return Promise.reject(new Error('No event'));
    }
    
    const eventUrl = `${window.location.origin}/event-details.html?id=${event.id}`;
    const shareData = {
        title: event.title,
        text: event.description || window.t('home.viewDetails') || 'Zobacz szczegóły wydarzenia',
        url: eventUrl
    };
    
    try {
        // Sprawdź czy Web Share API jest dostępne
        if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
            await navigator.share(shareData);
            console.log('[EventDetails] Event shared via Web Share API');
            return Promise.resolve();
        }
    } catch (error) {
        // Użytkownik anulował udostępnianie - to nie jest błąd
        if (error.name === 'AbortError') {
            console.log('[EventDetails] Share cancelled by user');
            return Promise.reject(error);
        }
        console.error('[EventDetails] Web Share API error:', error);
    }
    
    // Fallback - skopiuj link do schowka
    try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            await navigator.clipboard.writeText(eventUrl);
            showNotification(
                window.t('success.linkCopied') || 'Link został skopiowany do schowka',
                'success'
            );
            return Promise.resolve();
        } else {
            // Starszy fallback dla przeglądarek bez Clipboard API
            const textArea = document.createElement('textarea');
            textArea.value = eventUrl;
            textArea.style.position = 'fixed';
            textArea.style.left = '-9999px';
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            
            showNotification(
                window.t('success.linkCopied') || 'Link został skopiowany do schowka',
                'success'
            );
            return Promise.resolve();
        }
    } catch (error) {
        console.error('[EventDetails] Clipboard copy error:', error);
        showNotification(
            window.t('error.copyError') || 'Nie udało się skopiować linku',
            'error'
        );
        return Promise.reject(error);
    }
}


// ========================================
// Join Event Functionality
// ========================================

function showJoinModal(event) {
    const modal = document.getElementById('join-modal');
    if (!modal) return;
    
    // Fill event info
    const eventName = document.getElementById('join-event-name');
    const eventDate = document.getElementById('join-event-date');
    
    if (eventName) eventName.textContent = event.title;
    if (eventDate) {
        const startDate = new Date(event.startDate);
        eventDate.textContent = startDate.toLocaleString('pl-PL', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
    
    // Show modal
    modal.style.display = 'flex';
    setTimeout(() => modal.classList.add('show'), 10);
    
    // Handle modal close
    const closeButtons = modal.querySelectorAll('.modal-close');
    closeButtons.forEach(btn => {
        btn.addEventListener('click', () => closeJoinModal());
    });
    
    // Handle confirm join
    const confirmBtn = document.getElementById('confirm-join-btn');
    if (confirmBtn) {
        confirmBtn.onclick = () => confirmJoinEvent(event);
    }
    
    // Close on outside click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeJoinModal();
    });
}

function closeJoinModal() {
    const modal = document.getElementById('join-modal');
    if (!modal) return;
    
    modal.classList.remove('show');
    setTimeout(() => {
        modal.style.display = 'none';
        // Reset form
        document.getElementById('participant-name').value = '';
        document.getElementById('participant-email').value = '';
    }, 300);
}

function confirmJoinEvent(event) {
    const nameInput = document.getElementById('participant-name');
    const emailInput = document.getElementById('participant-email');
    
    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    
    if (!name) {
        showNotification('Podaj swoje imi�', 'error');
        nameInput.focus();
        return;
    }
    
    // Create participant object
    const participant = {
        id: Date.now().toString(),
        name: name,
        email: email || null,
        joinedAt: new Date().toISOString()
    };
    
    // Get existing participants
    let participants = [];
    const storedData = localStorage.getItem(`event_participants_${event.id}`);
    if (storedData) {
        try {
            participants = JSON.parse(storedData);
        } catch (e) {
            participants = [];
        }
    }
    
    // Check if already joined
    if (participants.some(p => p.name.toLowerCase() === name.toLowerCase())) {
        showNotification('Już dołączyłeś do tego wydarzenia', 'info');
        closeJoinModal();
        return;
    }
    
    // Add participant
    participants.push(participant);
    localStorage.setItem(`event_participants_${event.id}`, JSON.stringify(participants));
    
    // Update participant count display if exists
    updateParticipantCount(event.id, participants.length);
    
    // Show success message
    showNotification('Pomyślnie dołączono do wydarzenia!', 'success');
    
    // Close modal
    closeJoinModal();
    
    // Refresh participants list
    displayParticipants(event.id);
    
    // Update join button to show "Joined" state
    const joinBtn = document.getElementById('join-event-btn');
    if (joinBtn) {
        joinBtn.innerHTML = '<span class="btn-icon"></span><span data-i18n="details.joined">Już zapisany</span>';
        joinBtn.disabled = true;
        joinBtn.classList.add('joined');
    }
}

function updateParticipantCount(eventId, count) {
    // Update participant count in the UI if element exists
    const countElement = document.getElementById('participant-count');
    if (countElement) {
        countElement.textContent = count;
    }
}
