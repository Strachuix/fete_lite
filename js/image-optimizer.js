// Fete Lite - Image Optimization Manager
// WebP support detection, lazy loading, and optimized image delivery

class ImageOptimizer {
  constructor() {
    this.supportsWebP = null;
    this.lazyObserver = null;
    this.init();
  }

  async init() {
    // Check WebP support
    this.supportsWebP = await this.checkWebPSupport();
    
    // Initialize lazy loading
    this.initLazyLoading();
    
    // Optimize existing images
    this.optimizeExistingImages();
  }

  // Check if browser supports WebP
  checkWebPSupport() {
    return new Promise((resolve) => {
      const webP = new Image();
      webP.onload = webP.onerror = () => {
        resolve(webP.height === 2);
      };
      webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
    });
  }

  // Initialize Intersection Observer for lazy loading
  initLazyLoading() {
    if ('IntersectionObserver' in window) {
      this.lazyObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            this.loadImage(entry.target);
            this.lazyObserver.unobserve(entry.target);
          }
        });
      }, {
        rootMargin: '50px 0px', // Start loading 50px before image comes into view
        threshold: 0.01
      });
    }
  }

  // Optimize image source for performance
  optimizeImageSrc(originalSrc, options = {}) {
    const { width, height, quality = 85, format } = options;
    
    // If WebP is supported and no specific format requested
    const preferredFormat = format || (this.supportsWebP ? 'webp' : 'jpg');
    
    // For external images, return optimized CDN URLs if possible
    if (originalSrc.includes('unsplash') || originalSrc.includes('pexels')) {
      let optimizedSrc = originalSrc;
      
      // Add format and quality parameters
      if (originalSrc.includes('unsplash')) {
        optimizedSrc += `&fm=${preferredFormat}&q=${quality}`;
        if (width) optimizedSrc += `&w=${width}`;
        if (height) optimizedSrc += `&h=${height}`;
      }
      
      return optimizedSrc;
    }

    // For local images, return optimized path
    if (originalSrc.startsWith('./images/') || originalSrc.startsWith('/images/')) {
      const basePath = originalSrc.replace(/\.(jpg|jpeg|png)$/i, '');
      const extension = this.supportsWebP ? 'webp' : 'jpg';
      
      // Return responsive image path
      if (width && width <= 400) {
        return `${basePath}_small.${extension}`;
      } else if (width && width <= 800) {
        return `${basePath}_medium.${extension}`;
      }
      
      return `${basePath}.${extension}`;
    }

    return originalSrc;
  }

  // Load image with optimization
  loadImage(img) {
    const src = img.dataset.src || img.src;
    const options = {
      width: img.dataset.width ? parseInt(img.dataset.width) : null,
      height: img.dataset.height ? parseInt(img.dataset.height) : null,
      quality: img.dataset.quality ? parseInt(img.dataset.quality) : 85
    };

    const optimizedSrc = this.optimizeImageSrc(src, options);
    
    // Create a new image to preload
    const imageLoader = new Image();
    
    imageLoader.onload = () => {
      img.src = optimizedSrc;
      img.classList.add('loaded');
      img.style.opacity = '1';
    };

    imageLoader.onerror = () => {
      // Fallback to original source if optimized fails
      img.src = src;
      img.classList.add('error');
    };

    imageLoader.src = optimizedSrc;
  }

  // Add image to lazy loading queue
  observeImage(img) {
    if (this.lazyObserver) {
      this.lazyObserver.observe(img);
    } else {
      // Fallback for browsers without IntersectionObserver
      this.loadImage(img);
    }
  }

  // Optimize existing images on page
  optimizeExistingImages() {
    // Find all images with data-src (lazy loading)
    const lazyImages = document.querySelectorAll('img[data-src]');
    lazyImages.forEach(img => {
      img.style.opacity = '0';
      img.style.transition = 'opacity 0.3s ease';
      this.observeImage(img);
    });

    // Optimize regular images
    const regularImages = document.querySelectorAll('img:not([data-src])');
    regularImages.forEach(img => {
      if (img.src && !img.dataset.optimized) {
        const optimizedSrc = this.optimizeImageSrc(img.src);
        if (optimizedSrc !== img.src) {
          img.src = optimizedSrc;
        }
        img.dataset.optimized = 'true';
      }
    });
  }

  // Create responsive image with multiple sources
  createResponsiveImage(baseSrc, alt, options = {}) {
    const { 
      sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
      loading = 'lazy',
      width,
      height
    } = options;

    const picture = document.createElement('picture');
    
    // WebP sources
    if (this.supportsWebP) {
      const webpSource = document.createElement('source');
      webpSource.type = 'image/webp';
      webpSource.srcset = this.generateSrcSet(baseSrc, 'webp');
      webpSource.sizes = sizes;
      picture.appendChild(webpSource);
    }
    
    // Fallback source
    const fallbackSource = document.createElement('source');
    fallbackSource.type = 'image/jpeg';
    fallbackSource.srcset = this.generateSrcSet(baseSrc, 'jpg');
    fallbackSource.sizes = sizes;
    picture.appendChild(fallbackSource);

    // Main image element
    const img = document.createElement('img');
    img.src = this.optimizeImageSrc(baseSrc, { width: 800 });
    img.alt = alt;
    img.loading = loading;
    if (width) img.width = width;
    if (height) img.height = height;
    
    picture.appendChild(img);
    return picture;
  }

  // Generate srcset for responsive images
  generateSrcSet(baseSrc, format) {
    const basePath = baseSrc.replace(/\.(jpg|jpeg|png|webp)$/i, '');
    const sizes = [400, 800, 1200, 1600];
    
    return sizes.map(size => {
      const src = `${basePath}_${size}w.${format}`;
      return `${src} ${size}w`;
    }).join(', ');
  }

  // Performance metrics
  getImageMetrics() {
    const images = document.querySelectorAll('img');
    const metrics = {
      total: images.length,
      loaded: document.querySelectorAll('img.loaded').length,
      lazy: document.querySelectorAll('img[data-src]').length,
      webpSupported: this.supportsWebP
    };
    
    return metrics;
  }
}

// Auto-initialize
document.addEventListener('DOMContentLoaded', () => {
  window.imageOptimizer = new ImageOptimizer();
});

// Export for use in other modules
window.ImageOptimizer = ImageOptimizer;