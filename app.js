class PresentationApp {
    constructor() {
        this.currentSlide = 1;
        this.totalSlides = 13;
        this.slides = document.querySelectorAll('.slide');
        this.prevBtn = document.getElementById('prevBtn');
        this.nextBtn = document.getElementById('nextBtn');
        this.currentSlideSpan = document.getElementById('currentSlide');
        this.totalSlidesSpan = document.getElementById('totalSlides');
        
        this.init();
    }
    
    init() {
        // Set initial state
        this.updateSlideCounter();
        this.updateButtonStates();
        
        // Event listeners
        this.prevBtn.addEventListener('click', () => this.previousSlide());
        this.nextBtn.addEventListener('click', () => this.nextSlide());
        
        // Keyboard navigation
        document.addEventListener('keydown', (e) => this.handleKeydown(e));
        
        // Touch/swipe support for mobile
        this.setupTouchNavigation();
    }
    
    showSlide(slideNumber) {
        if (slideNumber < 1 || slideNumber > this.totalSlides) {
            return;
        }
        
        // Remove active class from current slide
        this.slides.forEach(slide => {
            slide.classList.remove('active', 'prev');
        });
        
        // Add appropriate classes
        this.slides[slideNumber - 1].classList.add('active');
        
        // Add prev class to slides before current
        for (let i = 0; i < slideNumber - 1; i++) {
            this.slides[i].classList.add('prev');
        }
        
        this.currentSlide = slideNumber;
        this.updateSlideCounter();
        this.updateButtonStates();
    }
    
    nextSlide() {
        if (this.currentSlide < this.totalSlides) {
            this.showSlide(this.currentSlide + 1);
        }
    }
    
    previousSlide() {
        if (this.currentSlide > 1) {
            this.showSlide(this.currentSlide - 1);
        }
    }
    
    updateSlideCounter() {
        this.currentSlideSpan.textContent = this.currentSlide;
        this.totalSlidesSpan.textContent = this.totalSlides;
    }
    
    updateButtonStates() {
        // Disable/enable previous button
        this.prevBtn.disabled = this.currentSlide === 1;
        
        // Disable/enable next button
        this.nextBtn.disabled = this.currentSlide === this.totalSlides;
    }
    
    handleKeydown(event) {
        switch(event.key) {
            case 'ArrowLeft':
                event.preventDefault();
                this.previousSlide();
                break;
            case 'ArrowRight':
                event.preventDefault();
                this.nextSlide();
                break;
            case 'Home':
                event.preventDefault();
                this.showSlide(1);
                break;
            case 'End':
                event.preventDefault();
                this.showSlide(this.totalSlides);
                break;
            case ' ': // Spacebar
                event.preventDefault();
                this.nextSlide();
                break;
        }
    }
    
    setupTouchNavigation() {
        let startX = 0;
        let startY = 0;
        let endX = 0;
        let endY = 0;
        
        const presentationContainer = document.querySelector('.presentation-container');
        
        presentationContainer.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
        }, { passive: true });
        
        presentationContainer.addEventListener('touchend', (e) => {
            endX = e.changedTouches[0].clientX;
            endY = e.changedTouches[0].clientY;
            
            const deltaX = endX - startX;
            const deltaY = endY - startY;
            
            // Only trigger if horizontal swipe is more significant than vertical
            if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
                if (deltaX > 0) {
                    // Swipe right - previous slide
                    this.previousSlide();
                } else {
                    // Swipe left - next slide
                    this.nextSlide();
                }
            }
        }, { passive: true });
    }
    
    // Method to go to a specific slide (could be useful for future enhancements)
    goToSlide(slideNumber) {
        this.showSlide(slideNumber);
    }
    
    // Method to get current slide info
    getCurrentSlideInfo() {
        return {
            current: this.currentSlide,
            total: this.totalSlides,
            isFirst: this.currentSlide === 1,
            isLast: this.currentSlide === this.totalSlides
        };
    }
}

// Initialize the presentation when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const presentation = new PresentationApp();
    
    // Make presentation globally available for debugging/testing
    window.presentation = presentation;
    
    // Optional: Auto-advance slides (commented out by default)
    /*
    let autoAdvanceTimer;
    const autoAdvanceDelay = 10000; // 10 seconds
    
    function startAutoAdvance() {
        autoAdvanceTimer = setInterval(() => {
            if (presentation.currentSlide < presentation.totalSlides) {
                presentation.nextSlide();
            } else {
                stopAutoAdvance();
            }
        }, autoAdvanceDelay);
    }
    
    function stopAutoAdvance() {
        if (autoAdvanceTimer) {
            clearInterval(autoAdvanceTimer);
            autoAdvanceTimer = null;
        }
    }
    
    // Start auto-advance
    startAutoAdvance();
    
    // Stop auto-advance on user interaction
    document.addEventListener('click', stopAutoAdvance);
    document.addEventListener('keydown', stopAutoAdvance);
    document.addEventListener('touchstart', stopAutoAdvance);
    */
});

// Utility function to handle presentation in fullscreen (optional enhancement)
function toggleFullscreen() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(err => {
            console.log(`Error attempting to enable fullscreen: ${err.message}`);
        });
    } else {
        document.exitFullscreen();
    }
}

// Add fullscreen toggle on F11 or F key
document.addEventListener('keydown', (e) => {
    if (e.key === 'F11' || (e.key === 'f' && e.ctrlKey)) {
        e.preventDefault();
        toggleFullscreen();
    }
});

// Handle visibility change to pause/resume any animations or timers
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        // Page is hidden - pause any ongoing processes
        console.log('Presentation paused');
    } else {
        // Page is visible - resume processes
        console.log('Presentation resumed');
    }
});

// Add smooth scrolling behavior for any internal links (if added later)
document.addEventListener('click', (e) => {
    if (e.target.matches('a[href^="#"]')) {
        e.preventDefault();
        const targetId = e.target.getAttribute('href').substring(1);
        const targetElement = document.getElementById(targetId);
        if (targetElement) {
            targetElement.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    }
});

// Performance optimization: Preload next slide content if needed
function preloadSlideContent(slideNumber) {
    // This function could be extended to preload images or other content
    // for upcoming slides to ensure smooth transitions
    const slide = document.querySelector(`[data-slide="${slideNumber}"]`);
    if (slide) {
        // Trigger any lazy loading or content preparation
        const images = slide.querySelectorAll('img[data-src]');
        images.forEach(img => {
            if (img.dataset.src) {
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
            }
        });
    }
}

// Error handling for any presentation issues
window.addEventListener('error', (e) => {
    console.error('Presentation error:', e.error);
    // Could implement user-friendly error reporting here
});

// Accessibility improvements
document.addEventListener('focus', (e) => {
    // Ensure focused elements are visible and properly highlighted
    if (e.target.classList.contains('nav-btn')) {
        e.target.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
});

// Export for potential module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PresentationApp;
}