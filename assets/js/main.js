/**
 * Dee Dee Thai Spa - Main JavaScript Interactivity Logic
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Mobile Menu Drawer Navigation
  initMobileMenu();

  // 3. Testimonial Slider (Home Page)
  initTestimonialSlider();

  // 4. Image Lightbox (Home Page)
  initImageLightbox();
});

/**
 * Mobile Navigation Menu Toggles
 */
function initMobileMenu() {
  const menuToggle = document.getElementById('menu-toggle');
  const navMenu = document.getElementById('nav-menu');

  if (!menuToggle || !navMenu) return;

  menuToggle.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true';
    menuToggle.setAttribute('aria-expanded', !isExpanded);
    navMenu.classList.toggle('active');
  });

  // Close mobile menu when clicking outside or on a link
  document.addEventListener('click', (e) => {
    if (!menuToggle.contains(e.target) && !navMenu.contains(e.target)) {
      menuToggle.setAttribute('aria-expanded', 'false');
      navMenu.classList.remove('active');
    }
  });

  navMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      menuToggle.setAttribute('aria-expanded', 'false');
      navMenu.classList.remove('active');
    });
  });
}

/**
 * ADA Compliance & Accessibility Features Panel
 */
function initAccessibilityPanel() {
  const adaBtn = document.getElementById('ada-btn');
  const adaPanel = document.getElementById('ada-panel');
  const adaClose = document.getElementById('ada-close');
  
  if (!adaBtn || !adaPanel) return;

  // Toggle Accessibility Panel
  adaBtn.addEventListener('click', () => {
    const isExpanded = adaBtn.getAttribute('aria-expanded') === 'true';
    adaBtn.setAttribute('aria-expanded', !isExpanded);
    adaPanel.classList.toggle('active');
    if (!isExpanded) {
      // Focus on first element of panel when opened
      setTimeout(() => {
        const firstBtn = adaPanel.querySelector('.ada-panel-btn');
        if (firstBtn) firstBtn.focus();
      }, 50);
    }
  });

  if (adaClose) {
    adaClose.addEventListener('click', () => {
      adaBtn.setAttribute('aria-expanded', 'false');
      adaPanel.classList.remove('active');
      adaBtn.focus();
    });
  }

  // Close panel on pressing Escape key inside the panel
  adaPanel.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      adaBtn.setAttribute('aria-expanded', 'false');
      adaPanel.classList.remove('active');
      adaBtn.focus();
    }
  });

  // Actions
  const toggleContrastBtn = document.getElementById('ada-toggle-contrast');
  const increaseTextBtn = document.getElementById('ada-increase-text');
  const decreaseTextBtn = document.getElementById('ada-decrease-text');
  const toggleLinksBtn = document.getElementById('ada-toggle-links');
  const resetBtn = document.getElementById('ada-reset');

  // Load preferences from LocalStorage
  let fontScale = parseFloat(localStorage.getItem('ada-font-scale')) || 1.0;
  let isHighContrast = localStorage.getItem('ada-high-contrast') === 'true';
  let isHighlightLinks = localStorage.getItem('ada-highlight-links') === 'true';

  // Apply preferences initially
  applyTextScale(fontScale);
  if (isHighContrast) document.body.classList.add('high-contrast');
  if (isHighlightLinks) document.body.classList.add('highlight-links');

  // Bind Listeners
  if (toggleContrastBtn) {
    toggleContrastBtn.addEventListener('click', () => {
      isHighContrast = !isHighContrast;
      document.body.classList.toggle('high-contrast', isHighContrast);
      localStorage.setItem('ada-high-contrast', isHighContrast);
    });
  }

  if (increaseTextBtn) {
    increaseTextBtn.addEventListener('click', () => {
      if (fontScale < 1.4) {
        fontScale += 0.1;
        applyTextScale(fontScale);
        localStorage.setItem('ada-font-scale', fontScale);
      }
    });
  }

  if (decreaseTextBtn) {
    decreaseTextBtn.addEventListener('click', () => {
      if (fontScale > 0.8) {
        fontScale -= 0.1;
        applyTextScale(fontScale);
        localStorage.setItem('ada-font-scale', fontScale);
      }
    });
  }

  if (toggleLinksBtn) {
    toggleLinksBtn.addEventListener('click', () => {
      isHighlightLinks = !isHighlightLinks;
      document.body.classList.toggle('highlight-links', isHighlightLinks);
      localStorage.setItem('ada-highlight-links', isHighlightLinks);
    });
  }

  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      fontScale = 1.0;
      isHighContrast = false;
      isHighlightLinks = false;
      
      applyTextScale(fontScale);
      document.body.classList.remove('high-contrast');
      document.body.classList.remove('highlight-links');
      
      localStorage.removeItem('ada-font-scale');
      localStorage.removeItem('ada-high-contrast');
      localStorage.removeItem('ada-highlight-links');
    });
  }
}

function applyTextScale(scale) {
  document.documentElement.style.setProperty('--font-scale', scale);
}

/**
 * Home Page Testimonial Swiper / Slider
 */
function initTestimonialSlider() {
  const track = document.getElementById('slider-track');
  const prevBtn = document.getElementById('slider-prev');
  const nextBtn = document.getElementById('slider-next');
  const dotsContainer = document.getElementById('slider-dots');

  if (!track) return;

  const slides = Array.from(track.children);
  if (slides.length === 0) return;

  let currentIndex = 0;
  let autoPlayTimer = null;
  const autoPlayInterval = 6000; // 6 seconds

  // Initialize Indicator Dots
  if (dotsContainer) {
    dotsContainer.innerHTML = '';
    slides.forEach((_, idx) => {
      const dot = document.createElement('button');
      dot.className = `slider-dot ${idx === 0 ? 'active' : ''}`;
      dot.setAttribute('aria-label', `Navigate to testimonial slide ${idx + 1}`);
      dot.addEventListener('click', () => {
        goToSlide(idx);
        resetAutoPlay();
      });
      dotsContainer.appendChild(dot);
    });
  }

  function updateSlider() {
    // Translate the track container
    track.style.transform = `translateX(-${currentIndex * 100}%)`;

    // Update dot classes
    if (dotsContainer) {
      const dots = Array.from(dotsContainer.children);
      dots.forEach((dot, idx) => {
        dot.classList.toggle('active', idx === currentIndex);
      });
    }

    // Accessibility updates
    slides.forEach((slide, idx) => {
      if (idx === currentIndex) {
        slide.setAttribute('aria-hidden', 'false');
        slide.removeAttribute('tabindex');
      } else {
        slide.setAttribute('aria-hidden', 'true');
        slide.setAttribute('tabindex', '-1');
      }
    });
  }

  function goToSlide(index) {
    if (index < 0) {
      currentIndex = slides.length - 1;
    } else if (index >= slides.length) {
      currentIndex = 0;
    } else {
      currentIndex = index;
    }
    updateSlider();
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      goToSlide(currentIndex - 1);
      resetAutoPlay();
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      goToSlide(currentIndex + 1);
      resetAutoPlay();
    });
  }

  // Auto Play
  function startAutoPlay() {
    autoPlayTimer = setInterval(() => {
      goToSlide(currentIndex + 1);
    }, autoPlayInterval);
  }

  function stopAutoPlay() {
    if (autoPlayTimer) {
      clearInterval(autoPlayTimer);
      autoPlayTimer = null;
    }
  }

  function resetAutoPlay() {
    stopAutoPlay();
    startAutoPlay();
  }

  // Pause autoplay on mouse hover or focus
  const sliderContainer = track.parentElement;
  if (sliderContainer) {
    sliderContainer.addEventListener('mouseenter', stopAutoPlay);
    sliderContainer.addEventListener('mouseleave', startAutoPlay);
    sliderContainer.addEventListener('focusin', stopAutoPlay);
    sliderContainer.addEventListener('focusout', startAutoPlay);
  }

  // Initial layout state setup
  updateSlider();
  startAutoPlay();
}

/**
 * Image Lightbox for Gallery (Modal Viewer)
 */
function initImageLightbox() {
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightbox-img');
  const closeBtn = document.getElementById('lightbox-close');
  const prevBtn = document.getElementById('lightbox-prev');
  const nextBtn = document.getElementById('lightbox-next');
  const galleryItems = Array.from(document.querySelectorAll('.gallery-item'));

  if (!lightbox || !lightboxImg || galleryItems.length === 0) return;

  let currentGalleryIndex = 0;
  let lastFocusedElement = null;

  // Open Lightbox
  galleryItems.forEach((item, index) => {
    const openAction = () => {
      lastFocusedElement = document.activeElement;
      currentGalleryIndex = index;
      openGallery(item);
    };

    // Click trigger
    item.addEventListener('click', openAction);

    // Keyboard accessibility trigger
    item.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openAction();
      }
    });
  });

  function openGallery(item) {
    const childImg = item.querySelector('img');
    if (!childImg) return;

    lightboxImg.src = childImg.src;
    lightboxImg.alt = childImg.alt || 'Enlarged Spa Gallery Image';
    lightbox.classList.add('active');

    // Accessibility focus management
    setTimeout(() => {
      if (closeBtn) closeBtn.focus();
    }, 50);

    document.body.style.overflow = 'hidden'; // Lock background scroll
  }

  function closeGallery() {
    lightbox.classList.remove('active');
    document.body.style.overflow = ''; // Unlock background scroll
    
    // Return focus to the element that triggered it
    if (lastFocusedElement) {
      lastFocusedElement.focus();
    }
  }

  function navigateGallery(direction) {
    currentGalleryIndex = (currentGalleryIndex + direction + galleryItems.length) % galleryItems.length;
    const item = galleryItems[currentGalleryIndex];
    const childImg = item.querySelector('img');
    if (childImg) {
      lightboxImg.src = childImg.src;
      lightboxImg.alt = childImg.alt || 'Enlarged Spa Gallery Image';
    }
  }

  // Click bindings
  if (closeBtn) closeBtn.addEventListener('click', closeGallery);
  if (prevBtn) prevBtn.addEventListener('click', () => navigateGallery(-1));
  if (nextBtn) nextBtn.addEventListener('click', () => navigateGallery(1));

  // Close when clicking overlay backdrop (clicking outside image content)
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox || e.target.classList.contains('lightbox-content')) {
      closeGallery();
    }
  });

  // Keyboard navigation & Close controls
  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('active')) return;

    if (e.key === 'Escape') {
      closeGallery();
    } else if (e.key === 'ArrowLeft') {
      navigateGallery(-1);
    } else if (e.key === 'ArrowRight') {
      navigateGallery(1);
    } else if (e.key === 'Tab') {
      // Focus Trap inside Modal
      const focusableSelectors = 'button, img';
      const focusables = Array.from(lightbox.querySelectorAll(focusableSelectors));
      const first = focusables[0];
      const last = focusables[focusables.length - 1];

      if (e.shiftKey) { // Shift + Tab
        if (document.activeElement === first) {
          last.focus();
          e.preventDefault();
        }
      } else { // Tab
        if (document.activeElement === last) {
          first.focus();
          e.preventDefault();
        }
      }
    }
  });
}
