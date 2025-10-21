// Lazy Loading Module for Images
// Uses Intersection Observer API to load images only when visible

class LazyLoader {
  constructor(options = {}) {
    this.options = {
      root: options.root || null,
      rootMargin: options.rootMargin || '50px',
      threshold: options.threshold || 0.01,
      loadingClass: options.loadingClass || 'lazy-loading',
      loadedClass: options.loadedClass || 'lazy-loaded',
      errorClass: options.errorClass || 'lazy-error'
    };
    
    this.observer = null;
    this.init();
  }
  
  init() {
    // Check if Intersection Observer is supported
    if (!('IntersectionObserver' in window)) {
      console.warn('[LazyLoader] Intersection Observer not supported, loading all images');
      this.loadAllImages();
      return;
    }
    
    // Create observer
    this.observer = new IntersectionObserver(
      this.handleIntersection.bind(this),
      {
        root: this.options.root,
        rootMargin: this.options.rootMargin,
        threshold: this.options.threshold
      }
    );
    
    // Observe all lazy images
    this.observeImages();
  }
  
  handleIntersection(entries) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        this.loadImage(entry.target);
        this.observer.unobserve(entry.target);
      }
    });
  }
  
  loadImage(img) {
    const src = img.dataset.src;
    const srcset = img.dataset.srcset;
    
    if (!src && !srcset) return;
    
    // Add loading class
    img.classList.add(this.options.loadingClass);
    
    // Create a new image to preload
    const tempImage = new Image();
    
    tempImage.onload = () => {
      // Set the actual src
      if (src) img.src = src;
      if (srcset) img.srcset = srcset;
      
      // Remove data attributes
      delete img.dataset.src;
      delete img.dataset.srcset;
      
      // Update classes
      img.classList.remove(this.options.loadingClass);
      img.classList.add(this.options.loadedClass);
      
      // Trigger custom event
      img.dispatchEvent(new CustomEvent('lazyloaded', { 
        detail: { src } 
      }));
    };
    
    tempImage.onerror = () => {
      img.classList.remove(this.options.loadingClass);
      img.classList.add(this.options.errorClass);
      
      // Set fallback image if defined
      if (img.dataset.fallback) {
        img.src = img.dataset.fallback;
      }
      
      // Trigger error event
      img.dispatchEvent(new CustomEvent('lazyerror', { 
        detail: { src } 
      }));
    };
    
    // Start loading
    if (src) tempImage.src = src;
    if (srcset) tempImage.srcset = srcset;
  }
  
  observeImages() {
    const images = document.querySelectorAll('img[data-src], img[data-srcset]');
    images.forEach(img => {
      this.observer.observe(img);
    });
  }
  
  // Fallback for browsers without Intersection Observer
  loadAllImages() {
    const images = document.querySelectorAll('img[data-src], img[data-srcset]');
    images.forEach(img => {
      if (img.dataset.src) img.src = img.dataset.src;
      if (img.dataset.srcset) img.srcset = img.dataset.srcset;
      delete img.dataset.src;
      delete img.dataset.srcset;
      img.classList.add(this.options.loadedClass);
    });
  }
  
  // Add new images to observer
  observe(element) {
    if (!this.observer) return;
    
    if (element.tagName === 'IMG' && (element.dataset.src || element.dataset.srcset)) {
      this.observer.observe(element);
    } else {
      // Observe all lazy images within element
      const images = element.querySelectorAll('img[data-src], img[data-srcset]');
      images.forEach(img => this.observer.observe(img));
    }
  }
  
  // Manually trigger loading for an image
  loadNow(img) {
    if (img.dataset.src || img.dataset.srcset) {
      this.loadImage(img);
      if (this.observer) this.observer.unobserve(img);
    }
  }
  
  // Disconnect observer
  disconnect() {
    if (this.observer) {
      this.observer.disconnect();
    }
  }
}

// Create global instance
window.lazyLoader = new LazyLoader({
  rootMargin: '100px', // Start loading 100px before entering viewport
  threshold: 0.01
});

// Re-observe images when new content is added
document.addEventListener('DOMContentLoaded', () => {
  // Initial observation
  window.lazyLoader.observeImages();
  
  // Watch for dynamically added content
  const contentObserver = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === 1) { // Element node
          window.lazyLoader.observe(node);
        }
      });
    });
  });
  
  // Observe main content area
  const mainContent = document.querySelector('main') || document.body;
  contentObserver.observe(mainContent, {
    childList: true,
    subtree: true
  });
});

// Helper function to prepare image for lazy loading
function prepareLazyImage(imgElement, src, options = {}) {
  imgElement.dataset.src = src;
  
  if (options.srcset) {
    imgElement.dataset.srcset = options.srcset;
  }
  
  if (options.fallback) {
    imgElement.dataset.fallback = options.fallback;
  }
  
  // Set placeholder
  if (options.placeholder) {
    imgElement.src = options.placeholder;
  } else {
    // Use a tiny transparent placeholder
    imgElement.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
  }
  
  // Add lazy class
  imgElement.classList.add('lazy');
  
  // Observe the image
  if (window.lazyLoader) {
    window.lazyLoader.observe(imgElement);
  }
  
  return imgElement;
}

// Export for use in other scripts
window.prepareLazyImage = prepareLazyImage;
