/**
 * Auth System - logowanie i rejestracja użytkowników
 */

class AuthManager {
    constructor() {
        this.currentUser = null;
        this.isLoggedIn = false;
        
        this.init();
    }

    init() {
        // Sprawdź czy użytkownik jest już zalogowany
        this.checkAuthState();
        
        // Skonfiguruj event listeners
        this.setupEventListeners();
        

    }

    setupEventListeners() {
        // Tab switching
        const loginTab = document.getElementById('login-tab');
        const registerTab = document.getElementById('register-tab');
        
        if (loginTab) {
            loginTab.addEventListener('click', () => this.switchToLogin());
        }
        
        if (registerTab) {
            registerTab.addEventListener('click', () => this.switchToRegister());
        }

        // Form submissions
        const loginForm = document.getElementById('login-form');
        const registerForm = document.getElementById('register-form');
        
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }
        
        if (registerForm) {
            registerForm.addEventListener('submit', (e) => this.handleRegister(e));
        }

        // Social login
        const googleLogin = document.getElementById('google-login');
        if (googleLogin) {
            googleLogin.addEventListener('click', () => this.handleGoogleLogin());
        }

        // Switch links
        const switchToLogin = document.getElementById('switch-to-login');
        const switchToRegister = document.getElementById('switch-to-register');
        
        if (switchToLogin) {
            switchToLogin.addEventListener('click', () => this.switchToLogin());
        }
        
        if (switchToRegister) {
            switchToRegister.addEventListener('click', () => this.switchToRegister());
        }

        // Password confirmation validation
        const password = document.getElementById('register-password');
        const passwordConfirm = document.getElementById('register-password-confirm');
        
        if (password && passwordConfirm) {
            passwordConfirm.addEventListener('input', () => {
                this.validatePasswordMatch();
            });
        }

        // Phone number formatting
        const phoneInput = document.getElementById('register-phone');
        if (phoneInput) {
            phoneInput.addEventListener('input', (e) => {
                this.formatPhoneNumber(e.target);
            });
        }

        // BLIK validation
        const blikInput = document.getElementById('register-blik');
        if (blikInput) {
            blikInput.addEventListener('input', (e) => {
                this.formatBlikCode(e.target);
            });
        }
    }

    switchToLogin() {
        const loginTab = document.getElementById('login-tab');
        const registerTab = document.getElementById('register-tab');
        const loginForm = document.getElementById('login-form');
        const registerForm = document.getElementById('register-form');
        const loginLink = document.querySelector('.login-link');
        const registerLink = document.querySelector('.register-link');

        loginTab?.classList.add('active');
        registerTab?.classList.remove('active');
        loginForm?.classList.remove('hidden');
        registerForm?.classList.add('hidden');
        loginLink?.classList.add('hidden');
        registerLink?.classList.remove('hidden');
    }

    switchToRegister() {
        const loginTab = document.getElementById('login-tab');
        const registerTab = document.getElementById('register-tab');
        const loginForm = document.getElementById('login-form');
        const registerForm = document.getElementById('register-form');
        const loginLink = document.querySelector('.login-link');
        const registerLink = document.querySelector('.register-link');

        loginTab?.classList.remove('active');
        registerTab?.classList.add('active');
        loginForm?.classList.add('hidden');
        registerForm?.classList.remove('hidden');
        loginLink?.classList.remove('hidden');
        registerLink?.classList.add('hidden');
    }

    async handleLogin(event) {
        event.preventDefault();
        
        const formData = new FormData(event.target);
        const credentials = {
            email: formData.get('email'),
            password: formData.get('password'),
            remember: document.getElementById('remember-me')?.checked || false
        };

        try {
            // Walidacja
            if (!this.validateEmail(credentials.email)) {
                this.showError('Podaj prawidłowy adres email');
                return;
            }

            if (!credentials.password) {
                this.showError('Podaj hasło');
                return;
            }

            // Pokaż loading
            this.showLoading(event.target);

            // Prawdziwe logowanie przez API
            try {
                const user = await window.apiClient.login(credentials.email, credentials.password);
                
                // Użyj DataAdapter do konwersji
                const frontendUser = window.DataAdapter.userFromApi(user);
                
                this.setAuthState(frontendUser, window.apiClient.getToken());
                this.showSuccess('Zalogowano pomyślnie!');
                
                // Przekieruj do głównej strony
                setTimeout(() => {
                    window.location.href = '/';
                }, 1000);
                
            } catch (apiError) {
                // Jeśli API nie działa (offline), spróbuj localStorage
                if (apiError.message === 'OFFLINE') {
                    console.warn('API offline, trying localStorage fallback');
                    const loginResult = await this.simulateLogin(credentials);
                    
                    if (loginResult.success) {
                        this.setAuthState(loginResult.user, loginResult.token);
                        this.showSuccess('Zalogowano pomyślnie (tryb offline)');
                        
                        setTimeout(() => {
                            window.location.href = '/';
                        }, 1000);
                    } else {
                        this.showError(loginResult.message);
                    }
                } else {
                    throw apiError;
                }
            }

        } catch (error) {
            console.error('Login error:', error);
            this.showError(error.message || 'Wystąpił błąd podczas logowania');
        } finally {
            this.hideLoading(event.target);
        }
    }

    async handleRegister(event) {
        event.preventDefault();
        
        const formData = new FormData(event.target);
        
        // Zbierz dane użytkownika
        const userData = {
            first_name: formData.get('first_name'),
            last_name: formData.get('last_name'),
            birth_date: formData.get('birth_date'),
            city: formData.get('city'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            password: formData.get('password'),
            password_confirm: formData.get('password_confirm'),
            dietary_preferences: formData.getAll('dietary[]'),
            blik: formData.get('blik'),
            terms_accepted: document.getElementById('terms-acceptance')?.checked,
            marketing_consent: document.getElementById('marketing-consent')?.checked
        };

        try {
            // Walidacja
            if (!this.validateRegistrationData(userData)) {
                return; // błędy już wyświetlone w validateRegistrationData
            }

            // Pokaż loading
            this.showLoading(event.target);

            // Prawdziwa rejestracja przez API
            try {
                // Konwertuj dane na format API
                const apiUserData = window.DataAdapter.userToApi(userData);
                
                const user = await window.apiClient.register(apiUserData);
                
                this.showSuccess('Konto utworzone pomyślnie!');
                
                // Przełącz na logowanie po 2 sekundach
                setTimeout(() => {
                    this.switchToLogin();
                }, 2000);
                
            } catch (apiError) {
                // Jeśli API nie działa (offline), zapisz lokalnie
                if (apiError.message === 'OFFLINE') {
                    console.warn('API offline, saving user locally');
                    const registerResult = await this.simulateRegister(userData);
                    
                    if (registerResult.success) {
                        this.showSuccess('Konto utworzone lokalnie (będzie zsynchronizowane po połączeniu)');
                        
                        setTimeout(() => {
                            this.switchToLogin();
                        }, 2000);
                    } else {
                        this.showError(registerResult.message);
                    }
                } else {
                    throw apiError;
                }
            }

        } catch (error) {
            console.error('Registration error:', error);
            this.showError(error.message || 'Wystąpił błąd podczas rejestracji');
        } finally {
            this.hideLoading(event.target);
        }
    }

    validateRegistrationData(data) {
        // Sprawdź wymagane pola
        if (!data.first_name || !data.last_name) {
            this.showError('Podaj imię i nazwisko');
            return false;
        }

        if (!this.validateEmail(data.email)) {
            this.showError('Podaj prawidłowy adres email');
            return false;
        }

        if (!this.validatePhone(data.phone)) {
            this.showError('Podaj prawidłowy numer telefonu');
            return false;
        }

        if (!this.validatePassword(data.password)) {
            this.showError('Hasło musi mieć minimum 8 znaków');
            return false;
        }

        if (data.password !== data.password_confirm) {
            this.showError('Hasła nie są identyczne');
            return false;
        }

        if (data.blik && !this.validateBlik(data.blik)) {
            this.showError('Kod BLIK musi składać się z 6 cyfr');
            return false;
        }

        if (!data.terms_accepted) {
            this.showError('Musisz zaakceptować regulamin');
            return false;
        }

        return true;
    }

    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    validatePhone(phone) {
        const phoneRegex = /^(\+48\s?)?[0-9]{3}\s?[0-9]{3}\s?[0-9]{3}$/;
        return phoneRegex.test(phone.replace(/\s/g, ''));
    }

    validatePassword(password) {
        return password && password.length >= 8;
    }

    validateBlik(blik) {
        return /^[0-9]{6}$/.test(blik);
    }

    validatePasswordMatch() {
        const password = document.getElementById('register-password');
        const passwordConfirm = document.getElementById('register-password-confirm');
        
        if (password && passwordConfirm) {
            if (password.value !== passwordConfirm.value) {
                passwordConfirm.setCustomValidity('Hasła nie są identyczne');
            } else {
                passwordConfirm.setCustomValidity('');
            }
        }
    }

    formatPhoneNumber(input) {
        let value = input.value.replace(/\D/g, '');
        
        // Dodaj +48 jeśli nie ma prefiksu
        if (value.length > 0 && !value.startsWith('48')) {
            value = '48' + value;
        }
        
        // Formatuj numer
        if (value.length <= 2) {
            value = '+' + value;
        } else if (value.length <= 5) {
            value = '+' + value.slice(0, 2) + ' ' + value.slice(2);
        } else if (value.length <= 8) {
            value = '+' + value.slice(0, 2) + ' ' + value.slice(2, 5) + ' ' + value.slice(5);
        } else {
            value = '+' + value.slice(0, 2) + ' ' + value.slice(2, 5) + ' ' + value.slice(5, 8) + ' ' + value.slice(8, 11);
        }
        
        input.value = value;
    }

    formatBlikCode(input) {
        let value = input.value.replace(/\D/g, '').slice(0, 6);
        input.value = value;
    }

    async simulateLogin(credentials) {
        // Symulacja API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Sprawdź czy użytkownik istnieje w localStorage
        const users = JSON.parse(localStorage.getItem('fete_users') || '[]');
        const user = users.find(u => u.email === credentials.email);
        
        if (!user) {
            return { success: false, message: 'Nie znaleziono użytkownika' };
        }
        
        // W prawdziwej aplikacji sprawdzilibyśmy hash hasła
        if (user.password !== credentials.password) {
            return { success: false, message: 'Nieprawidłowe hasło' };
        }
        
        // Generuj token (w prawdziwej aplikacji byłby to JWT z serwera)
        const token = 'demo_token_' + Date.now();
        
        return {
            success: true,
            user: {
                id: user.id,
                email: user.email,
                first_name: user.first_name,
                last_name: user.last_name,
                avatar_url: user.avatar_url
            },
            token
        };
    }

    async simulateRegister(userData) {
        // Symulacja API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Sprawdź czy email już istnieje
        const users = JSON.parse(localStorage.getItem('fete_users') || '[]');
        const existingUser = users.find(u => u.email === userData.email);
        
        if (existingUser) {
            return { success: false, message: 'Użytkownik o tym adresie email już istnieje' };
        }
        
        // Utwórz nowego użytkownika
        const newUser = {
            id: Date.now(),
            ...userData,
            created_at: new Date().toISOString(),
            email_verified: false,
            phone_verified: false
        };
        
        users.push(newUser);
        localStorage.setItem('fete_users', JSON.stringify(users));
        
        return { success: true, user: newUser };
    }

    async handleGoogleLogin() {
        try {
            this.showSuccess('Funkcja Google Login będzie dostępna wkrótce');
        } catch (error) {
            console.error('Google login error:', error);
            this.showError('Błąd logowania przez Google');
        }
    }

    checkAuthState() {
        const token = localStorage.getItem('fete_auth_token');
        const userData = localStorage.getItem('fete_current_user');
        
        if (token && userData) {
            try {
                this.currentUser = JSON.parse(userData);
                this.isLoggedIn = true;

            } catch (error) {
                console.error('[Auth] Error parsing user data:', error);
                this.logout();
            }
        }
    }

    setAuthState(user, token) {
        this.currentUser = user;
        this.isLoggedIn = true;
        
        localStorage.setItem('fete_auth_token', token);
        localStorage.setItem('fete_current_user', JSON.stringify(user));
        

    }

    logout() {
        this.currentUser = null;
        this.isLoggedIn = false;
        
        localStorage.removeItem('fete_auth_token');
        localStorage.removeItem('fete_current_user');
        

    }

    getCurrentUser() {
        return this.currentUser;
    }

    isUserLoggedIn() {
        return this.isLoggedIn;
    }

    requireAuth() {
        if (!this.isLoggedIn) {
            window.location.href = '/auth.html';
            return false;
        }
        return true;
    }

    // UI Helper methods
    showError(message) {
        this.showNotification(message, 'error');
    }

    showSuccess(message) {
        this.showNotification(message, 'success');
    }

    showNotification(message, type = 'info') {
        // Utwórz element powiadomienia
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        // Dodaj style inline dla prostoty
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 20px;
            border-radius: 8px;
            color: white;
            font-weight: 500;
            z-index: 10000;
            animation: slideIn 0.3s ease;
            background: ${type === 'error' ? '#ef4444' : type === 'success' ? '#10b981' : '#3b82f6'};
        `;
        
        document.body.appendChild(notification);
        
        // Usuń po 3 sekundach
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    showLoading(form) {
        const submitBtn = form.querySelector('button[type="submit"]');
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<span>Ładowanie...</span>';
        }
    }

    hideLoading(form) {
        const submitBtn = form.querySelector('button[type="submit"]');
        if (submitBtn) {
            submitBtn.disabled = false;
            // Przywróć oryginalną treść
            if (form.id === 'login-form') {
                submitBtn.innerHTML = '<span data-i18n="auth.login">Zaloguj się</span>';
            } else {
                submitBtn.innerHTML = '<span data-i18n="auth.create_account">Utwórz konto</span>';
            }
        }
    }
}

// Globalna instancja
let authManager;

// Inicjalizacja po załadowaniu DOM
document.addEventListener('DOMContentLoaded', () => {
    authManager = new AuthManager();
    window.authManager = authManager; // Dla dostępu z innych skryptów
});


