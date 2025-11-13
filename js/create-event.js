// Skrypt specyficzny dla strony tworzenia wydarzenia
document.addEventListener('DOMContentLoaded', function() {
    // Inicjalizacja formularza
    initCreateEventForm();
    
    // Inicjalizacja paska postępu
    initFormProgress();
    
    // Inicjalizacja przycisków czasu trwania
    initDurationButtons();
    
    // Obsługa checkboxa noclegu
    const accommodationCheckbox = document.getElementById('accommodation-available');
    const maxOvernightGroup = document.getElementById('max-overnight-group');
    const accommodationInfoGroup = document.getElementById('accommodation-info-group');
    
    if (accommodationCheckbox && maxOvernightGroup && accommodationInfoGroup) {
        accommodationCheckbox.addEventListener('change', function() {
            if (this.checked) {
                maxOvernightGroup.style.display = 'block';
                accommodationInfoGroup.style.display = 'block';
            } else {
                maxOvernightGroup.style.display = 'none';
                accommodationInfoGroup.style.display = 'none';
                // Wyczyść wartości gdy nocleg jest wyłączony
                document.getElementById('max-overnight-participants').value = '';
                document.getElementById('accommodation-info').value = '';
            }
        });
    }
});


// Initialize form progress bar
function initFormProgress() {
    // Required fields that count towards progress
    const requiredFields = [
        'event-title',
        'event-start-date',
        'event-start-time',
        'selected-theme'
    ];
    
    const progressFill = document.getElementById('form-progress-fill');
    const filledCountSpan = document.getElementById('filled-fields-count');
    const totalCountSpan = document.getElementById('total-fields-count');
    
    if (!progressFill || !filledCountSpan || !totalCountSpan) {
        return;
    }
    
    // Set total count
    totalCountSpan.textContent = requiredFields.length;
    
    function updateProgress() {
        let filledCount = 0;
        
        requiredFields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            
            if (fieldId === 'selected-theme') {
                // Special case: check if any theme is selected
                const selectedTheme = document.querySelector('input[name="theme"]:checked');
                if (selectedTheme) {
                    filledCount++;
                }
            } else if (field && field.value.trim() !== '') {
                filledCount++;
            }
        });
        
        // Update counts
        filledCountSpan.textContent = filledCount;
        
        // Calculate percentage
        const percentage = (filledCount / requiredFields.length) * 100;
        
        // Update progress bar
        progressFill.style.width = percentage + '%';
        
        // Add color class based on completion
        progressFill.classList.remove('low', 'medium', 'high', 'complete');
        if (percentage === 100) {
            progressFill.classList.add('complete');
        } else if (percentage >= 75) {
            progressFill.classList.add('high');
        } else if (percentage >= 50) {
            progressFill.classList.add('medium');
        } else {
            progressFill.classList.add('low');
        }
    }
    
    // Initial update
    updateProgress();
    
    // Listen to changes on all required fields
    requiredFields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        
        if (fieldId === 'selected-theme') {
            // Special case: listen to theme radio buttons
            const themeRadios = document.querySelectorAll('input[name="theme"]');
            themeRadios.forEach(radio => {
                radio.addEventListener('change', updateProgress);
            });
        } else if (field) {
            field.addEventListener('input', updateProgress);
            field.addEventListener('change', updateProgress);
        }
    });
}

function initCreateEventForm() {
    const form = document.getElementById('create-event-form');
    const descriptionTextarea = document.getElementById('event-description');
    const descriptionCounter = document.getElementById('description-counter');
    
    // Track form changes for unsaved warning
    let formChanged = false;
    let formSubmitted = false;
    
    // Wypełnij numer telefonu użytkownika jeśli jest dostępny
    if (window.authManager && window.authManager.isUserLoggedIn()) {
        const currentUser = window.authManager.getCurrentUser();
        const blikInput = document.getElementById('organizer-blik');
        
        if (currentUser && currentUser.phone && blikInput && !blikInput.value) {
            // Usuń wszystkie spacje i dodaj tylko cyfry
            const phoneNumber = currentUser.phone.replace(/\s/g, '').replace(/\+48/, '');
            blikInput.value = phoneNumber;
        }
    }
    
    // Track changes in form
    const formInputs = form.querySelectorAll('input, textarea, select');
    formInputs.forEach(input => {
        input.addEventListener('change', () => {
            formChanged = true;
        });
        input.addEventListener('input', () => {
            formChanged = true;
        });
    });
    
    // Warn before leaving if form has unsaved changes
    window.addEventListener('beforeunload', (e) => {
        if (formChanged && !formSubmitted) {
            e.preventDefault();
            e.returnValue = ''; // Chrome requires returnValue to be set
            return 'Masz niezapisane zmiany. Czy na pewno chcesz opuścić stronę?';
        }
    });
    
    // Clear warning when form is submitted
    form.addEventListener('submit', () => {
        formSubmitted = true;
    });
    
    // Załaduj tematyki dynamicznie
    if (window.EventThemes) {
        window.EventThemes.renderThemeOptions('#theme-selection-grid');
    }
    
    // Licznik znaków dla opisu
    descriptionTextarea.addEventListener('input', function() {
        const length = this.value.length;
        descriptionCounter.textContent = length;
        
        if (length > 450) {
            descriptionCounter.style.color = 'var(--color-warning)';
        } else {
            descriptionCounter.style.color = 'var(--color-text-secondary)';
        }
    });
    
    // Automatyczne ustawienie dat
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    document.getElementById('event-start-date').min = today.toISOString().split('T')[0];
    document.getElementById('event-end-date').min = today.toISOString().split('T')[0];
    
    // Synchronizacja dat
    document.getElementById('event-start-date').addEventListener('change', function() {
        const endDateInput = document.getElementById('event-end-date');
        if (!endDateInput.value || endDateInput.value < this.value) {
            endDateInput.value = this.value;
        }
        endDateInput.min = this.value;
        validateEndDateTime();
    });
    
    // Walidacja czasu w czasie rzeczywistym
    document.getElementById('event-start-time').addEventListener('change', validateEndDateTime);
    document.getElementById('event-end-date').addEventListener('change', validateEndDateTime);
    document.getElementById('event-end-time').addEventListener('change', validateEndDateTime);
    
    // Obsługa formularza
    form.addEventListener('submit', handleFormSubmit);
    
    // Obsługa podglądu zdjęć
    initImagePreview();
    
    // Obsługa podglądu
    const previewBtn = document.getElementById('preview-btn');
    if (previewBtn) {
        previewBtn.addEventListener('click', showEventPreview);
    }
    
    // Obsługa zamykania modala podglądu
    const previewModal = document.getElementById('preview-modal');
    const previewCloseButtons = previewModal.querySelectorAll('.modal-close');
    
    previewCloseButtons.forEach(button => {
        button.addEventListener('click', () => {
            previewModal.classList.remove('show');
            setTimeout(() => {
                previewModal.style.display = 'none';
            }, 300);
        });
    });
    
    // Zamknij modal po kliknięciu w tło
    previewModal.addEventListener('click', (e) => {
        if (e.target === previewModal) {
            previewModal.classList.remove('show');
            setTimeout(() => {
                previewModal.style.display = 'none';
            }, 300);
        }
    });
    
    // Obsługa geolokalizacji
    const getLocationBtn = document.getElementById('get-location-btn');
    if (getLocationBtn) {
        getLocationBtn.addEventListener('click', getCurrentLocation);
    }
}

async function handleFormSubmit(event) {
    event.preventDefault();
    
    // Sprawdź walidację przed kontynuowaniem
    const isFormValid = validateForm();
    console.log('Walidacja formularza:', isFormValid);
    
    if (!isFormValid) {
        console.log('Formularz zawiera błędy - przerywanie zapisywania');
        showNotification('Proszę poprawić błędy w formularzu przed zapisaniem', 'error');
        return;
    }
    
    const formData = new FormData(event.target);
    const eventData = createEventFromForm(formData);
    
    try {
        showLoading(true);
        const savedEvent = await saveEvent(eventData);
        showSuccessModal(savedEvent);
    } catch (error) {
        console.error('Błąd zapisywania wydarzenia:', error);
        showNotification('Wystąpił błąd podczas zapisywania wydarzenia', 'error');
    } finally {
        showLoading(false);
    }
}

function showLoadingState(show) {
    const saveBtn = document.getElementById('save-btn');
    const loadingSpinner = saveBtn.querySelector('.btn-loading');
    const btnText = saveBtn.querySelector('.btn-text');
    
    if (show) {
        loadingSpinner.style.display = 'inline-block';
        btnText.style.opacity = '0.7';
        saveBtn.disabled = true;
    } else {
        loadingSpinner.style.display = 'none';
        btnText.style.opacity = '1';
        saveBtn.disabled = false;
    }
}

function showEventPreview() {
    // Zbierz dane z formularza
    const formData = getFormData();
    
    // Walidacja - sprawdź czy wymagane pola są wypełnione
    if (!formData.title.trim()) {
        showNotification('Wypełnij nazwę wydarzenia', 'error');
        return;
    }
    
    if (!formData.startDate || !formData.startTime) {
        showNotification('Wybierz datę i godzinę rozpoczęcia', 'error');
        return;
    }
    
    // Generuj podgląd
    generatePreviewContent(formData);
    
    // Pokaż modal podglądu
    const modal = document.getElementById('preview-modal');
    modal.style.display = 'flex';
    
    // Dodaj animację
    requestAnimationFrame(() => {
        modal.classList.add('show');
    });
}

function generatePreviewContent(data) {
    const previewBody = document.getElementById('preview-content');
    
    // Formatuj datę i czas
    const startDateTime = new Date(`${data.startDate}T${data.startTime}`);
    const endDateTime = data.endDate && data.endTime ? 
        new Date(`${data.endDate}T${data.endTime}`) : null;
        
    // Sprawdź czy wydarzenie kończy się tego samego dnia
    const isSameDay = !endDateTime || data.startDate === data.endDate;
        
    const dateOptions = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    };
    const timeOptions = { 
        hour: '2-digit', 
        minute: '2-digit' 
    };
    
    // Generuj tekst czasu - tylko z godziną zakończenia jeśli to ten sam dzień
    const timeText = isSameDay && endDateTime 
        ? `${startDateTime.toLocaleTimeString('pl-PL', timeOptions)} - ${endDateTime.toLocaleTimeString('pl-PL', timeOptions)}`
        : startDateTime.toLocaleTimeString('pl-PL', timeOptions);
    
    previewBody.innerHTML = `
        <div class="preview-event-card glass">
            <div class="preview-event-header gradient-primary">
                <div class="preview-date">
                    <span class="preview-day">${startDateTime.getDate()}</span>
                    <span class="preview-month">${startDateTime.toLocaleDateString('pl-PL', { month: 'short' })}</span>
                </div>
                <div class="preview-share">
                    <span>🔗</span>
                </div>
            </div>
            
            <div class="preview-content">
                <h3 class="preview-title">${data.title}</h3>
                
                <div class="preview-details">
                    <div class="preview-detail">
                        <span class="preview-icon">📅</span>
                        <span>${startDateTime.toLocaleDateString('pl-PL', dateOptions)}</span>
                    </div>
                    
                    <div class="preview-detail">
                        <span class="preview-icon">⏰</span>
                        <span>${timeText}</span>
                    </div>
                    
                    ${data.location ? `
                        <div class="preview-detail">
                            <span class="preview-icon">📍</span>
                            <span>${data.location}</span>
                        </div>
                    ` : ''}
                </div>
                
                ${data.description ? `
                    <div class="preview-description">
                        <p>${data.description}</p>
                    </div>
                ` : ''}
                
                ${data.tags && data.tags.length > 0 ? `
                    <div class="preview-tags">
                        ${data.tags.map(tag => `<span class="preview-tag">${tag}</span>`).join('')}
                    </div>
                ` : ''}
            </div>
        </div>
    `;
}

function getFormData() {
    return {
        title: document.getElementById('event-title').value,
        description: document.getElementById('event-description').value,
        startDate: document.getElementById('event-start-date').value,
        startTime: document.getElementById('event-start-time').value,
        endDate: document.getElementById('event-end-date').value,
        endTime: document.getElementById('event-end-time').value,
        location: document.getElementById('event-location').value,
        tags: Array.from(document.querySelectorAll('.tag')).map(tag => tag.textContent.replace('×', '').trim()),
        maxParticipants: (function(){
            const v = document.getElementById('max-participants');
            if (!v) return null;
            const n = parseInt(v.value);
            return Number.isInteger(n) && n > 0 ? n : null;
        })(),
        allowCompanion: (function(){
            const el = document.getElementById('allow-companion');
            return el ? el.checked : false;
        })()
    };
}

function validateForm() {
    const formData = getFormData();
    let isValid = true;
    console.log('Dane formularza do walidacji:', formData);

    // Wyczyść poprzednie błędy
    document.querySelectorAll('.form-error').forEach(error => {
        error.classList.remove('show');
        error.textContent = '';
    });

    // Walidacja tytułu
    if (!formData.title.trim()) {
        console.log('Błąd: Brak tytułu wydarzenia');
        showFieldError('title-error', 'Nazwa wydarzenia jest wymagana');
        isValid = false;
    } else if (formData.title.trim().length < 3) {
        console.log('Błąd: Tytuł za krótki');
        showFieldError('title-error', 'Nazwa wydarzenia musi mieć co najmniej 3 znaki');
        isValid = false;
    }

    // Walidacja daty rozpoczęcia
    if (!formData.startDate) {
        console.log('Błąd: Brak daty rozpoczęcia');
        showFieldError('start-date-error', 'Data rozpoczęcia jest wymagana');
        isValid = false;
    }

    // Walidacja czasu rozpoczęcia
    if (!formData.startTime) {
        console.log('Błąd: Brak czasu rozpoczęcia');
        showFieldError('start-time-error', 'Czas rozpoczęcia jest wymagany');
        isValid = false;
    }

    // Walidacja dat i czasu zakończenia
    if (formData.startDate && formData.startTime) {
        console.log('Sprawdzanie dat i czasów zakończenia...');
        
        // Jeśli podano datę zakończenia, sprawdź czy jest prawidłowa
        if (formData.endDate) {
            const startDateTime = new Date(`${formData.startDate}T${formData.startTime}`);
            const endTime = formData.endTime || '23:59'; // Domyślnie koniec dnia jeśli nie podano czasu
            const endDateTime = new Date(`${formData.endDate}T${endTime}`);
            
            console.log('Porównanie dat:', {
                start: startDateTime,
                end: endDateTime,
                endLessOrEqual: endDateTime <= startDateTime
            });

            if (endDateTime <= startDateTime) {
                console.log('Błąd: Data/czas zakończenia nieprawidłowe');
                if (formData.endDate === formData.startDate && formData.endTime) {
                    showFieldError('end-time-error', 'Czas zakończenia musi być późniejszy od rozpoczęcia');
                } else {
                    showFieldError('end-date-error', 'Data i czas zakończenia muszą być późniejsze od rozpoczęcia');
                }
                isValid = false;
            }
        }
        
        // Jeśli podano tylko czas zakończenia bez daty (tego samego dnia)
        if (!formData.endDate && formData.endTime) {
            const startDateTime = new Date(`${formData.startDate}T${formData.startTime}`);
            const endDateTime = new Date(`${formData.startDate}T${formData.endTime}`);
            
            console.log('Porównanie czasów tego samego dnia:', {
                start: startDateTime,
                end: endDateTime,
                endLessOrEqual: endDateTime <= startDateTime
            });

            if (endDateTime <= startDateTime) {
                console.log('Błąd: Czas zakończenia tego samego dnia nieprawidłowy');
                showFieldError('end-time-error', 'Czas zakończenia musi być późniejszy od rozpoczęcia');
                isValid = false;
            }
        }
    }

    console.log('Końcowy wynik walidacji:', isValid);
    return isValid;
}

function showFieldError(errorId, message) {
    const errorElement = document.getElementById(errorId);
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.classList.add('show');
        
        // Znajdź odpowiednie pole input i dodaj focus
        const inputId = errorId.replace('-error', '');
        const inputElement = document.getElementById(inputId);
        if (inputElement) {
            // Scroll do elementu i focus (z małym opóźnieniem żeby animacje CSS się skończyły)
            setTimeout(() => {
                inputElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                inputElement.focus();
            }, 100);
        }
        
        console.log(`Wyświetlono błąd: ${errorId} - ${message}`);
    }
}

function hideFieldError(errorId) {
    const errorElement = document.getElementById(errorId);
    if (errorElement) {
        errorElement.textContent = '';
        errorElement.classList.remove('show');
    }
}

function validateEndDateTime() {
    const startDate = document.getElementById('event-start-date').value;
    const startTime = document.getElementById('event-start-time').value;
    const endDate = document.getElementById('event-end-date').value;
    const endTime = document.getElementById('event-end-time').value;
    
    console.log('Walidacja czasu rzeczywistego:', { startDate, startTime, endDate, endTime });
    
    // Wyczyść poprzednie błędy
    hideFieldError('end-date-error');
    hideFieldError('end-time-error');
    
    if (!startDate || !startTime) {
        console.log('Brak daty/czasu rozpoczęcia - pomijam walidację zakończenia');
        return true; // Nie waliduj jeśli brak daty/czasu rozpoczęcia
    }
    
    // Sprawdź czy podano datę zakończenia
    if (endDate) {
        const startDateTime = new Date(`${startDate}T${startTime}`);
        const endTimeToUse = endTime || '23:59'; // Domyślnie koniec dnia
        const endDateTime = new Date(`${endDate}T${endTimeToUse}`);
        
        console.log('Walidacja z datą zakończenia:', { startDateTime, endDateTime });
        
        if (endDateTime <= startDateTime) {
            console.log('Błąd walidacji w czasie rzeczywistym - data zakończenia nieprawidłowa');
            if (endDate === startDate && endTime) {
                showFieldError('end-time-error', 'Czas zakończenia musi być późniejszy od rozpoczęcia');
            } else {
                showFieldError('end-date-error', 'Data i czas zakończenia muszą być późniejsze od rozpoczęcia');
            }
            return false;
        }
    }
    
    // Sprawdź czy podano tylko czas zakończenia (bez daty) - to znaczy tego samego dnia
    if (!endDate && endTime) {
        const startDateTime = new Date(`${startDate}T${startTime}`);
        const endDateTime = new Date(`${startDate}T${endTime}`);
        
        console.log('Walidacja czasu tego samego dnia:', { startDateTime, endDateTime });
        
        if (endDateTime <= startDateTime) {
            console.log('Błąd walidacji w czasie rzeczywistym - czas tego samego dnia nieprawidłowy');
            showFieldError('end-time-error', 'Czas zakończenia musi być późniejszy od rozpoczęcia');
            return false;
        }
    }
    
    console.log('Walidacja czasu rzeczywistego zakończona - OK');
    return true;
}

function createEventFromForm(formData) {
    const data = getFormData();
    
    // Tworzenie obiektu wydarzenia zgodnego z formatem StorageManager
    const event = {
        id: Date.now().toString(), // Temporary ID
        title: data.title.trim(),
        description: data.description.trim(),
        startDate: data.startDate,
        startTime: data.startTime,
        endDate: data.endDate || data.startDate,
        endTime: data.endTime || data.startTime,
        location: data.location.trim(),
        tags: data.tags,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };

        // Read allowCompanion checkbox from formData (backwards-compatible)
        try {
            event.allowCompanion = formData.get('allowCompanion') === 'on';
        } catch (e) {
            event.allowCompanion = false;
        }

    return event;
}

function showLoading(show) {
    showLoadingState(show);
}

function showSuccessModal(savedEvent) {
    const modal = document.getElementById('success-modal');
    if (modal) {
        // Aktualizuj content modala z danymi zapisanego wydarzenia
        const eventTitle = modal.querySelector('.success-event-title');
        const eventDate = modal.querySelector('.success-event-date');
        
        if (eventTitle) {
            eventTitle.textContent = savedEvent.title;
        }
        
        if (eventDate) {
            const date = new Date(`${savedEvent.startDate}T${savedEvent.startTime}`);
            eventDate.textContent = date.toLocaleDateString('pl-PL', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        }

        modal.style.display = 'flex';

        // Dodaj animację
        requestAnimationFrame(() => {
            modal.classList.add('show');
        });

        // Dodaj obsługę zamykania
        const closeButtons = modal.querySelectorAll('.modal-close, .btn-back-home');
        closeButtons.forEach(button => {
            button.onclick = () => {
                modal.classList.remove('show');
                setTimeout(() => {
                    modal.style.display = 'none';
                    // Przekieruj do strony głównej
                    window.location.href = '/';
                }, 300);
            };
        });

        // Dodaj obsługę przycisku "Zobacz wydarzenie"
        const viewEventBtn = document.getElementById('view-event-btn');
        if (viewEventBtn) {
            viewEventBtn.onclick = () => {
                window.location.href = `/event-details.html?id=${savedEvent.id}`;
            };
        }

        // Dodaj obsługę przycisku "Utwórz kolejne"
        const createAnotherBtn = document.getElementById('create-another-btn');
        if (createAnotherBtn) {
            createAnotherBtn.onclick = () => {
                modal.classList.remove('show');
                setTimeout(() => {
                    modal.style.display = 'none';
                    // Wyczyść formularz i zostań na tej stronie
                    document.getElementById('event-form').reset();
                    document.getElementById('char-count').textContent = '0/500';
                }, 300);
            };
        }
    } else {
        // Fallback - po prostu pokaż powiadomienie i przekieruj
        showNotification('Wydarzenie zostało zapisane pomyślnie!', 'success');
        setTimeout(() => {
            window.location.href = '/';
        }, 2000);
    }
}

// Funkcja pobierania lokalizacji z reverse geocoding
async function getCurrentLocation() {
    const locationInput = document.getElementById('event-location');
    const getLocationBtn = document.getElementById('get-location-btn');
    
    if (!navigator.geolocation) {
        showNotification('Geolokalizacja nie jest wspierana przez tę przeglądarkę', 'error');
        return;
    }

    // Pokaż loading state
    const originalText = getLocationBtn.innerHTML;
    getLocationBtn.innerHTML = '<span class="loading-spinner"></span> Pobieranie...';
    getLocationBtn.disabled = true;

    try {
        // Pobierz współrzędne
        const position = await getGeolocationPosition();
        const { latitude, longitude } = position.coords;

        console.log('Otrzymane współrzędne:', latitude, longitude);

        // Konwertuj współrzędne na adres
        const address = await reverseGeocode(latitude, longitude);
        
        if (address) {
            locationInput.value = address;
            
            // Sprawdź czy to jest przybliżona lokalizacja (zawiera współrzędne)
            if (address.includes('(') && address.includes(',')) {
                showNotification('Uzupełniono przybliżoną lokalizację (ograniczenia sieciowe)', 'info');
            } else {
                showNotification('Lokalizacja została automatycznie uzupełniona', 'success');
            }
        } else {
            // Fallback - pokaż współrzędne
            locationInput.value = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
            showNotification('Uzupełniono współrzędne GPS', 'info');
        }

    } catch (error) {
        console.error('Błąd pobierania lokalizacji:', error);
        
        let errorMessage = 'Nie udało się pobrać lokalizacji';
        if (error.code === 1) {
            errorMessage = 'Dostęp do lokalizacji został odrzucony. Sprawdź ustawienia przeglądarki.';
        } else if (error.code === 2) {
            errorMessage = 'Lokalizacja niedostępna. Sprawdź połączenie GPS.';
        } else if (error.code === 3) {
            errorMessage = 'Upłynął limit czasu pobierania lokalizacji.';
        }
        
        showNotification(errorMessage, 'error');
    } finally {
        // Przywróć przycisk
        getLocationBtn.innerHTML = originalText;
        getLocationBtn.disabled = false;
    }
}

// Promise wrapper dla geolocation API
function getGeolocationPosition() {
    return new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
            resolve,
            reject,
            {
                enableHighAccuracy: true,
                timeout: 15000,
                maximumAge: 300000 // 5 minut cache
            }
        );
    });
}

// Reverse geocoding - konwersja współrzędnych na adres
async function reverseGeocode(lat, lon) {
    try {
        console.log('Próba reverse geocoding dla:', lat, lon);
        
        // Próba 1: Nominatim API (OpenStreetMap)
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1&accept-language=pl`,
                {
                    headers: {
                        'User-Agent': 'Fete-Lite-App/1.0',
                        'Accept': 'application/json'
                    },
                    mode: 'cors'
                }
            );

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            console.log('Dane reverse geocoding:', data);

            if (data.display_name) {
                // Formatuj adres
                const address = formatAddress(data.address);
                return address || data.display_name;
            } else {
                throw new Error('Brak danych adresowych');
            }
            
        } catch (corsError) {
            console.warn('Problem z CORS przy Nominatim API:', corsError.message);
            
            // Fallback - zwróć sformatowane współrzędne z przybliżoną lokalizacją
            return formatCoordinatesWithLocation(lat, lon);
        }

    } catch (error) {
        console.error('Błąd reverse geocoding:', error);
        return formatCoordinatesWithLocation(lat, lon);
    }
}

// Formatuj współrzędne z przybliżoną lokalizacją (fallback gdy CORS nie działa)
function formatCoordinatesWithLocation(lat, lon) {
    const formattedLat = lat.toFixed(6);
    const formattedLon = lon.toFixed(6);
    
    // Prosta aproksymacja lokalizacji dla Polski
    let approximateLocation = '';
    
    if (lat >= 49 && lat <= 55 && lon >= 14 && lon <= 25) {
        // Główne miasta Polski
        if (lat >= 52.1 && lat <= 52.4 && lon >= 20.8 && lon <= 21.3) {
            approximateLocation = 'Warszawa (okolice)';
        } else if (lat >= 50.0 && lat <= 50.1 && lon >= 19.8 && lon <= 20.1) {
            approximateLocation = 'Kraków (okolice)';
        } else if (lat >= 51.0 && lat <= 51.2 && lon >= 16.8 && lon <= 17.2) {
            approximateLocation = 'Wrocław (okolice)';
        } else if (lat >= 54.2 && lat <= 54.5 && lon >= 18.5 && lon <= 18.8) {
            approximateLocation = 'Gdańsk (okolice)';
        } else if (lat >= 52.3 && lat <= 52.5 && lon >= 16.8 && lon <= 17.1) {
            approximateLocation = 'Poznań (okolice)';
        } else if (lat >= 50.2 && lat <= 50.4 && lon >= 18.9 && lon <= 19.2) {
            approximateLocation = 'Katowice (okolice)';
        } else if (lat >= 51.6 && lat <= 51.9 && lon >= 19.3 && lon <= 19.6) {
            approximateLocation = 'Łódź (okolice)';
        } else {
            approximateLocation = 'Polska';
        }
    } else {
        approximateLocation = 'Lokalizacja GPS';
    }
    
    return `${approximateLocation} (${formattedLat}, ${formattedLon})`;
}

// Formatowanie adresu na bardziej czytelną formę
function formatAddress(addressComponents) {
    if (!addressComponents) return null;

    const parts = [];

    // Numer domu i ulica
    if (addressComponents.house_number && addressComponents.road) {
        parts.push(`${addressComponents.road} ${addressComponents.house_number}`);
    } else if (addressComponents.road) {
        parts.push(addressComponents.road);
    }

    // Miasto/miejscowość
    const city = addressComponents.city || 
                addressComponents.town || 
                addressComponents.village || 
                addressComponents.municipality;
    if (city) {
        parts.push(city);
    }

    // Kod pocztowy
    if (addressComponents.postcode) {
        parts.push(addressComponents.postcode);
    }

    // Kraj (tylko jeśli nie Polska)
    if (addressComponents.country && addressComponents.country_code !== 'pl') {
        parts.push(addressComponents.country);
    }

    return parts.length > 0 ? parts.join(', ') : null;
}

// === FUNKCJONALNOŚĆ WYBORU NA MAPIE ===
let mapLocationModal;
let locationMap;
let selectedLocationMarker;
let selectedCoordinates = null;

// Inicjalizacja wyboru lokalizacji na mapie
document.addEventListener('DOMContentLoaded', function() {
    const selectOnMapBtn = document.getElementById('select-on-map-btn');
    if (selectOnMapBtn) {
        selectOnMapBtn.addEventListener('click', openMapLocationModal);
    }
});

// Otwórz modal wyboru na mapie
function openMapLocationModal() {
    mapLocationModal = document.getElementById('map-location-modal');
    if (!mapLocationModal) return;
    
    // Pokaż modal
    window.app?.showModal('map-location-modal') || (mapLocationModal.style.display = 'flex');
    
    // Inicjalizuj mapę po pokazaniu modala
    setTimeout(() => {
        initLocationMap();
    }, 100);
    
    // Obsługa przycisków
    const confirmBtn = document.getElementById('confirm-map-location');
    const closeBtns = mapLocationModal.querySelectorAll('.modal-close');
    
    confirmBtn.addEventListener('click', confirmMapLocation);
    closeBtns.forEach(btn => {
        btn.addEventListener('click', closeMapLocationModal);
    });
}

// Inicjalizacja mapy Leaflet
function initLocationMap() {
    if (locationMap) {
        locationMap.remove();
    }
    
    // Domyślna lokalizacja - Warszawa
    const defaultLat = 52.2297;
    const defaultLng = 21.0122;
    
    locationMap = L.map('location-map').setView([defaultLat, defaultLng], 10);
    
    // Dodaj kafelki OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap contributors'
    }).addTo(locationMap);
    
    // Spróbuj uzyskać aktualną lokalizację użytkownika
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const userLat = position.coords.latitude;
                const userLng = position.coords.longitude;
                locationMap.setView([userLat, userLng], 13);
            },
            (error) => {
                console.log('Nie udało się pobrać lokalizacji użytkownika:', error);
            }
        );
    }
    
    // Obsługa kliknięcia na mapę
    locationMap.on('click', function(e) {
        selectLocationOnMap(e.latlng);
    });
}

// Wybór lokalizacji na mapie
async function selectLocationOnMap(latlng) {
    const { lat, lng } = latlng;
    selectedCoordinates = { lat, lng };
    
    // Usuń poprzedni marker jeśli istnieje
    if (selectedLocationMarker) {
        locationMap.removeLayer(selectedLocationMarker);
    }
    
    // Dodaj nowy marker
    selectedLocationMarker = L.marker([lat, lng]).addTo(locationMap);
    
    // Pokaż informacje o wybranej lokalizacji
    const locationInfo = document.getElementById('selected-location-info');
    const coordsElement = document.getElementById('selected-coords');
    const addressElement = document.getElementById('selected-address');
    
    locationInfo.style.display = 'block';
    coordsElement.textContent = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
    addressElement.textContent = t('create.loadingAddress');
    
    // Włącz przycisk potwierdzenia
    const confirmBtn = document.getElementById('confirm-map-location');
    confirmBtn.disabled = false;
    
    // Pobierz adres przez reverse geocoding
    try {
        const address = await reverseGeocode(lat, lng);
        if (address) {
            addressElement.textContent = address;
        } else {
            addressElement.textContent = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
        }
    } catch (error) {
        console.error('Błąd podczas pobierania adresu:', error);
        addressElement.textContent = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
    }
}

// Potwierdź wybraną lokalizację
function confirmMapLocation() {
    if (!selectedCoordinates) return;
    
    const addressElement = document.getElementById('selected-address');
    const locationInput = document.getElementById('event-location');
    
    // Ustaw adres w polu formularza
    locationInput.value = addressElement.textContent;
    
    // Zapisz współrzędne jako dane dodatkowe (można wykorzystać później)
    locationInput.dataset.latitude = selectedCoordinates.lat;
    locationInput.dataset.longitude = selectedCoordinates.lng;
    
    // Zamknij modal
    closeMapLocationModal();
    
    // Pokaż powiadomienie sukcesu
    showNotification(t('geolocation.success'), 'success');
}

// Zamknij modal wyboru na mapie
function closeMapLocationModal() {
    if (mapLocationModal) {
        mapLocationModal.style.display = 'none';
        mapLocationModal.classList.remove('show');
    }
    
    // Wyczyść mapę i dane
    if (locationMap) {
        locationMap.remove();
        locationMap = null;
    }
    
    selectedLocationMarker = null;
    selectedCoordinates = null;
    
    // Ukryj informacje o lokalizacji
    const locationInfo = document.getElementById('selected-location-info');
    locationInfo.style.display = 'none';
    
    // Wyłącz przycisk potwierdzenia
    const confirmBtn = document.getElementById('confirm-map-location');
    confirmBtn.disabled = true;
}

// Reverse geocoding - zamiana współrzędnych na adres
async function reverseGeocode(lat, lng) {
    try {
        const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1&accept-language=pl`
        );
        
        if (!response.ok) {
            throw new Error('Błąd podczas pobierania danych z Nominatim');
        }
        
        const data = await response.json();
        
        if (data && data.address) {
            return formatAddress(data.address);
        }
        
        return null;
    } catch (error) {
        console.error('Błąd reverse geocoding:', error);
        return null;
    }
}
// ========================================
// Image Preview Functionality
// ========================================

let selectedFiles = [];

function initImagePreview() {
    const fileInput = document.getElementById('event-images');
    const previewContainer = document.getElementById('image-preview');
    
    if (!fileInput || !previewContainer) return;
    
    fileInput.addEventListener('change', function(e) {
        handleFileSelect(e.target.files);
    });
    
    // Drag and drop support
    const uploadArea = fileInput.closest('.file-upload-area');
    if (uploadArea) {
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('dragover');
        });
        
        uploadArea.addEventListener('dragleave', () => {
            uploadArea.classList.remove('dragover');
        });
        
        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('dragover');
            handleFileSelect(e.dataTransfer.files);
        });
    }
}

function handleFileSelect(files) {
    const previewContainer = document.getElementById('image-preview');
    const maxSize = 5 * 1024 * 1024; // 5MB
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    
    Array.from(files).forEach(file => {
        // Validate file type
        if (!validTypes.includes(file.type)) {
            showImageNotification(
                `Nieprawidłowy format pliku: ${file.name}. Użyj JPG, PNG lub WEBP.`,
                'error'
            );
            return;
        }
        
        // Validate file size
        if (file.size > maxSize) {
            showImageNotification(
                `Plik ${file.name} jest za duży. Maksymalny rozmiar to 5MB.`,
                'error'
            );
            return;
        }
        
        // Check if file already added
        if (selectedFiles.some(f => f.name === file.name && f.size === file.size)) {
            return;
        }
        
        selectedFiles.push(file);
        createImagePreview(file);
    });
    
    // Update file input with selected files
    updateFileInput();
}

function createImagePreview(file) {
    const previewContainer = document.getElementById('image-preview');
    const reader = new FileReader();
    
    reader.onload = function(e) {
        const previewItem = document.createElement('div');
        previewItem.className = 'image-preview-item';
        previewItem.dataset.fileName = file.name;
        
        previewItem.innerHTML = `
            <img src="${e.target.result}" alt="Preview">
            <div class="image-preview-overlay">
                <button type="button" class="btn-remove-image" onclick="removeImage('${file.name}')" title="Usuń zdjęcie">
                    ×
                </button>
            </div>
            <div class="image-preview-info">
                <span class="image-name">${file.name}</span>
                <span class="image-size">${formatFileSize(file.size)}</span>
            </div>
        `;
        
        previewContainer.appendChild(previewItem);
    };
    
    reader.readAsDataURL(file);
}

function removeImage(fileName) {
    // Remove from selected files
    selectedFiles = selectedFiles.filter(f => f.name !== fileName);
    
    // Remove preview element
    const previewItem = document.querySelector(`.image-preview-item[data-file-name="${fileName}"]`);
    if (previewItem) {
        previewItem.remove();
    }
    
    // Update file input
    updateFileInput();
}

function updateFileInput() {
    const fileInput = document.getElementById('event-images');
    const dataTransfer = new DataTransfer();
    
    selectedFiles.forEach(file => {
        dataTransfer.items.add(file);
    });
    
    fileInput.files = dataTransfer.files;
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

function showImageNotification(message, type = 'info') {
    // Use existing notification system if available
    if (window.showNotification) {
        window.showNotification(message, type);
    } else {
        alert(message);
    }
}
