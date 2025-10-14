// Fete Lite - Nowoczesne Animacje i Efekty
// System automatycznego dodawania animacji i efektów wizualnych

class ModernEffectsManager {
  constructor() {
    this.animationClasses = [
      'slide-in-up',
      'slide-in-left', 
      'slide-in-right',
      'float-animation',
      'pulse'
    ];
    
    this.init();

  }

  // Inicjalizuj system efektów
  init() {
    // Dodaj observer dla nowych elementów
    this.setupIntersectionObserver();
    
    // Dodaj efekty do istniejących elementów
    this.enhanceExistingElements();
    
    // Skonfiguruj animacje kart wydarzeń
    this.setupEventCardAnimations();
    
    // Dodaj efekty interakcji
    this.setupInteractionEffects();
  }

  // Skonfiguruj Intersection Observer dla lazy animations
  setupIntersectionObserver() {
    if (!('IntersectionObserver' in window)) {

      return;
    }

    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const element = entry.target;
          
          // Dodaj animację wejścia
          if (element.classList.contains('animate-on-scroll')) {
            element.classList.add('slide-in-up');
            element.classList.remove('animate-on-scroll');
          }
          
          // Staggered animation dla listy elementów
          if (element.classList.contains('stagger-container')) {
            this.animateStaggeredChildren(element);
          }
          
          this.observer.unobserve(element);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '50px'
    });

    // Obserwuj elementy z klasami animacji
    document.querySelectorAll('.animate-on-scroll, .stagger-container').forEach(el => {
      this.observer.observe(el);
    });
  }

  // Dodaj staggered animation do dzieci elementu
  animateStaggeredChildren(container) {
    const children = container.children;
    Array.from(children).forEach((child, index) => {
      if (!child.classList.contains('stagger-item')) {
        child.classList.add('stagger-item');
      }
      
      // Dodaj opóźnienie animacji
      child.style.animationDelay = `${index * 0.1 + 0.1}s`;
    });
  }

  // Ulepsz istniejące elementy
  enhanceExistingElements() {
    // Dodaj hover effects do przycisków
    document.querySelectorAll('.btn').forEach(btn => {
      if (!btn.classList.contains('hover-lift')) {
        btn.classList.add('hover-lift');
      }
    });

    // Dodaj glassmorphism do kart
    document.querySelectorAll('.event-card').forEach(card => {
      if (!card.classList.contains('glass')) {
        card.classList.add('glass');
      }
    });

    // Dodaj efekty do modali
    document.querySelectorAll('.modal-content').forEach(modal => {
      modal.classList.add('glass', 'slide-in-up');
    });
  }

  // Skonfiguruj animacje kart wydarzeń
  setupEventCardAnimations() {
    // Obserwuj dodawanie nowych kart
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === 1 && node.classList?.contains('event-card')) {
            this.enhanceEventCard(node);
          }
        });
      });
    });

    // Obserwuj kontener wydarzeń
    const eventsContainer = document.getElementById('events-container');
    if (eventsContainer) {
      observer.observe(eventsContainer, { childList: true });
    }
  }

  // Ulepsz kartę wydarzenia
  enhanceEventCard(card) {
    // Dodaj nowoczesne klasy
    card.classList.add('interactive-card', 'hover-lift', 'glass');
    
    // Dodaj efekt shimmer na hover
    card.addEventListener('mouseenter', () => {
      if (!card.querySelector('.shimmer-effect')) {
        this.addShimmerEffect(card);
      }
    });

    // Dodaj parallax effect do nagłówka
    const header = card.querySelector('.event-card-header');
    if (header && !header.classList.contains('gradient-primary')) {
      header.classList.add('gradient-primary');
    }
  }

  // Dodaj efekt shimmer
  addShimmerEffect(element) {
    const shimmer = document.createElement('div');
    shimmer.className = 'shimmer-effect';
    shimmer.style.cssText = `
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
      animation: shimmer 1.5s ease-in-out;
      pointer-events: none;
      z-index: 1;
    `;
    
    element.style.position = 'relative';
    element.style.overflow = 'hidden';
    element.appendChild(shimmer);

    // Usuń po animacji
    setTimeout(() => {
      if (shimmer.parentNode) {
        shimmer.parentNode.removeChild(shimmer);
      }
    }, 1500);
  }

  // Skonfiguruj efekty interakcji
  setupInteractionEffects() {
    // Ripple effect dla przycisków
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('btn') || e.target.closest('.btn')) {
        this.addRippleEffect(e);
      }
    });

    // Parallax effect dla scroll
    this.setupParallaxEffect();
    
    // Floating animation dla niektórych elementów
    this.setupFloatingAnimations();
  }

  // Dodaj ripple effect
  addRippleEffect(e) {
    const button = e.target.classList.contains('btn') ? e.target : e.target.closest('.btn');
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;
    
    const ripple = document.createElement('span');
    ripple.style.cssText = `
      position: absolute;
      width: ${size}px;
      height: ${size}px;
      left: ${x}px;
      top: ${y}px;
      background: rgba(255, 255, 255, 0.3);
      border-radius: 50%;
      transform: scale(0);
      animation: ripple 0.6s ease-out;
      pointer-events: none;
      z-index: 1;
    `;
    
    button.style.position = 'relative';
    button.style.overflow = 'hidden';
    button.appendChild(ripple);
    
    setTimeout(() => {
      if (ripple.parentNode) {
        ripple.parentNode.removeChild(ripple);
      }
    }, 600);
  }

  // Skonfiguruj parallax effect
  setupParallaxEffect() {
    const parallaxElements = document.querySelectorAll('.parallax');
    
    if (parallaxElements.length === 0) return;
    
    window.addEventListener('scroll', () => {
      const scrolled = window.pageYOffset;
      const rate = scrolled * -0.5;
      
      parallaxElements.forEach(element => {
        element.style.transform = `translateY(${rate}px)`;
      });
    });
  }

  // Skonfiguruj floating animations
  setupFloatingAnimations() {
    // Dodaj floating animation do ikon
    document.querySelectorAll('.nav-icon, .event-icon').forEach((icon, index) => {
      icon.classList.add(index % 2 === 0 ? 'float-animation' : 'float-animation-reverse');
    });

    // Dodaj subtle animation do ilustracji
    document.querySelectorAll('.no-events-illustration').forEach(illustration => {
      illustration.classList.add('float-animation');
    });
  }

  // Dodaj loading animation
  showLoadingEffect(container) {
    container.innerHTML = `
      <div class="loading-modern glass">
        <div class="loading-spinner"></div>
        <div class="loading-dots">
          <span></span>
          <span></span>
          <span></span>
        </div>
        <p>Ładowanie...</p>
      </div>
    `;
  }

  // Animacja pojawienia się elementów
  animateIn(elements, options = {}) {
    const defaultOptions = {
      animation: 'slide-in-up',
      stagger: 100,
      duration: 600
    };
    
    const config = { ...defaultOptions, ...options };
    
    if (!Array.isArray(elements)) {
      elements = [elements];
    }
    
    elements.forEach((element, index) => {
      setTimeout(() => {
        element.classList.add(config.animation);
      }, index * config.stagger);
    });
  }

  // Trigger custom animations
  triggerAnimation(element, animationType) {
    // Usuń poprzednie klasy animacji
    this.animationClasses.forEach(className => {
      element.classList.remove(className);
    });
    
    // Dodaj nową animację
    element.classList.add(animationType);
    
    // Auto-cleanup
    element.addEventListener('animationend', () => {
      element.classList.remove(animationType);
    }, { once: true });
  }

  // Obsłuż zmiany motywu
  handleThemeChange(theme) {
    document.documentElement.style.setProperty('--theme-transition', 'all 0.3s ease');
    
    // Dodaj subtle animation przy zmianie motywu
    document.body.classList.add('theme-transitioning');
    
    setTimeout(() => {
      document.body.classList.remove('theme-transitioning');
    }, 300);
  }

  // Cleanup
  destroy() {
    if (this.observer) {
      this.observer.disconnect();
    }
  }
}

// Dodaj keyframes dla shimmer i ripple
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes shimmer {
    0% { left: -100%; }
    100% { left: 100%; }
  }
  
  @keyframes ripple {
    0% { transform: scale(0); opacity: 1; }
    100% { transform: scale(4); opacity: 0; }
  }
  
  .loading-modern {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    padding: 2rem;
    border-radius: 1rem;
    text-align: center;
  }
  
  .theme-transitioning * {
    transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease !important;
  }
`;

document.head.appendChild(styleSheet);

// Inicjalizuj po załadowaniu DOM
document.addEventListener('DOMContentLoaded', () => {
  window.modernEffectsManager = new ModernEffectsManager();
  
  // Integracja z system przełączania motywów
  document.addEventListener('themechange', (e) => {
    window.modernEffectsManager.handleThemeChange(e.detail.to);
  });
});

// Funkcje globalne
window.animateIn = (elements, options) => 
  window.modernEffectsManager?.animateIn(elements, options);

window.triggerAnimation = (element, type) => 
  window.modernEffectsManager?.triggerAnimation(element, type);


