class PresentationApp {
    constructor() {
        this.currentSlide = 1;
        this.totalSlides = 13;
        this.slides = [];
        this.prevBtn = null;
        this.nextBtn = null;
        this.currentSlideSpan = null;
        this.totalSlidesSpan = null;
        this.isTransitioning = false;
        
        this.init();
    }
    
    init() {
        // Wait for DOM to be fully loaded
        if (document.readyState !== 'complete') {
            window.addEventListener('load', () => this.setupPresentation());
        } else {
            this.setupPresentation();
        }
    }
    
    setupPresentation() {
        // Get DOM elements
        this.slides = document.querySelectorAll('.slide');
        this.prevBtn = document.getElementById('prevBtn');
        this.nextBtn = document.getElementById('nextBtn');
        this.currentSlideSpan = document.getElementById('currentSlide');
        this.totalSlidesSpan = document.getElementById('totalSlides');
        
        if (!this.slides.length || !this.prevBtn || !this.nextBtn) {
            console.error('Required DOM elements not found');
            return;
        }
        
        // Set initial state
        this.updateSlideCounter();
        this.updateButtonStates();
        this.initializeSlides();
        
        // Event listeners
        this.prevBtn.addEventListener('click', (e) => {
            e.preventDefault();
            this.previousSlide();
        });
        
        this.nextBtn.addEventListener('click', (e) => {
            e.preventDefault();
            this.nextSlide();
        });
        
        // Keyboard navigation
        document.addEventListener('keydown', (e) => this.handleKeydown(e));
        
        // Touch/swipe support for mobile
        this.setupTouchNavigation();
        
        // Initialize animations
        this.initializeAnimations();
        
        // Start floating animations
        this.startFloatingAnimations();
        
        console.log('✅ Presentation initialized successfully with', this.totalSlides, 'slides');
    }
    
    initializeSlides() {
        // Ensure all slides are properly positioned
        this.slides.forEach((slide, index) => {
            slide.style.position = 'absolute';
            slide.style.top = '0';
            slide.style.left = '0';
            slide.style.width = '100%';
            slide.style.height = '100%';
            slide.style.zIndex = '2';
            
            if (index === 0) {
                slide.classList.add('active');
                slide.style.opacity = '1';
                slide.style.transform = 'translateX(0)';
            } else {
                slide.classList.remove('active');
                slide.style.opacity = '0';
                slide.style.transform = 'translateX(100%)';
            }
        });
    }
    
    showSlide(slideNumber) {
        if (slideNumber < 1 || slideNumber > this.totalSlides || this.isTransitioning) {
            return;
        }
        
        this.isTransitioning = true;
        console.log('🎯 Navigating to slide', slideNumber);
        
        const currentSlideElement = this.slides[this.currentSlide - 1];
        const targetSlideElement = this.slides[slideNumber - 1];
        
        // Determine transition direction
        const isForward = slideNumber > this.currentSlide;
        
        // Set up target slide position
        targetSlideElement.style.transform = isForward ? 'translateX(100%)' : 'translateX(-100%)';
        targetSlideElement.style.opacity = '1';
        targetSlideElement.classList.add('active');
        
        // Force reflow
        targetSlideElement.offsetHeight;
        
        // Animate both slides
        currentSlideElement.style.transition = 'all 0.6s cubic-bezier(0.25, 0.8, 0.25, 1)';
        targetSlideElement.style.transition = 'all 0.6s cubic-bezier(0.25, 0.8, 0.25, 1)';
        
        // Start transition
        requestAnimationFrame(() => {
            currentSlideElement.style.transform = isForward ? 'translateX(-100%)' : 'translateX(100%)';
            currentSlideElement.style.opacity = '0';
            
            targetSlideElement.style.transform = 'translateX(0)';
            targetSlideElement.style.opacity = '1';
        });
        
        // Clean up after transition
        setTimeout(() => {
            currentSlideElement.classList.remove('active');
            currentSlideElement.style.transition = '';
            targetSlideElement.style.transition = '';
            
            // Update current slide
            this.currentSlide = slideNumber;
            this.updateSlideCounter();
            this.updateButtonStates();
            
            // Trigger slide-specific animations
            this.animateSlideContent(slideNumber);
            
            this.isTransitioning = false;
            console.log('✅ Slide transition complete');
        }, 600);
    }
    
    nextSlide() {
        if (this.currentSlide < this.totalSlides && !this.isTransitioning) {
            this.showSlide(this.currentSlide + 1);
        }
    }
    
    previousSlide() {
        if (this.currentSlide > 1 && !this.isTransitioning) {
            this.showSlide(this.currentSlide - 1);
        }
    }
    
    updateSlideCounter() {
        if (this.currentSlideSpan && this.totalSlidesSpan) {
            this.currentSlideSpan.textContent = this.currentSlide;
            this.totalSlidesSpan.textContent = this.totalSlides;
        }
    }
    
    updateButtonStates() {
        if (this.prevBtn && this.nextBtn) {
            // Update previous button
            this.prevBtn.disabled = this.currentSlide === 1;
            this.prevBtn.style.opacity = this.currentSlide === 1 ? '0.5' : '1';
            this.prevBtn.style.cursor = this.currentSlide === 1 ? 'not-allowed' : 'pointer';
            
            // Update next button
            this.nextBtn.disabled = this.currentSlide === this.totalSlides;
            this.nextBtn.style.opacity = this.currentSlide === this.totalSlides ? '0.5' : '1';
            this.nextBtn.style.cursor = this.currentSlide === this.totalSlides ? 'not-allowed' : 'pointer';
        }
    }
    
    handleKeydown(event) {
        // Prevent default behavior for navigation keys
        const navKeys = ['ArrowLeft', 'ArrowRight', 'Home', 'End', ' '];
        if (navKeys.includes(event.key)) {
            event.preventDefault();
        }
        
        if (this.isTransitioning) {
            return; // Don't allow navigation during transitions
        }
        
        switch(event.key) {
            case 'ArrowLeft':
                this.previousSlide();
                break;
            case 'ArrowRight':
                this.nextSlide();
                break;
            case 'Home':
                this.showSlide(1);
                break;
            case 'End':
                this.showSlide(this.totalSlides);
                break;
            case ' ': // Spacebar
                this.nextSlide();
                break;
            case 'f':
            case 'F':
                if (event.ctrlKey || event.metaKey) {
                    event.preventDefault();
                    this.toggleFullscreen();
                }
                break;
            case '?':
                event.preventDefault();
                this.showKeyboardHelp();
                break;
        }
    }
    
    setupTouchNavigation() {
        let startX = 0;
        let startY = 0;
        let startTime = 0;
        
        const presentationContainer = document.querySelector('.presentation-container');
        if (!presentationContainer) return;
        
        presentationContainer.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
            startTime = Date.now();
        }, { passive: true });
        
        presentationContainer.addEventListener('touchend', (e) => {
            if (this.isTransitioning) return;
            
            const endX = e.changedTouches[0].clientX;
            const endY = e.changedTouches[0].clientY;
            
            const deltaX = endX - startX;
            const deltaY = endY - startY;
            const deltaTime = Date.now() - startTime;
            
            // Only trigger if it's a swipe (not a tap) and horizontal swipe is more significant
            if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50 && deltaTime < 500) {
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
    
    initializeAnimations() {
        // Add enhanced hover effects to all interactive cards
        const interactiveSelectors = [
            '.point-card', '.competitor-card', '.metric-card', '.seo-card', 
            '.opportunity-card', '.value-card', '.geo-card', '.weakness-item', 
            '.rec-card', '.phase-card', '.traffic-item'
        ];
        
        interactiveSelectors.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(element => {
                this.addHoverEffects(element);
            });
        });
        
        // Animate the initial slide
        setTimeout(() => {
            this.animateSlideContent(1);
        }, 500);
    }
    
    addHoverEffects(element) {
        element.style.transition = 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)';
        element.style.cursor = 'pointer';
        
        element.addEventListener('mouseenter', () => {
            element.style.transform = 'translateY(-8px) scale(1.02)';
            element.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.15)';
            element.style.zIndex = '10';
        });
        
        element.addEventListener('mouseleave', () => {
            element.style.transform = 'translateY(0) scale(1)';
            element.style.boxShadow = '';
            element.style.zIndex = '';
        });
        
        element.addEventListener('mousedown', () => {
            element.style.transform = 'translateY(-4px) scale(0.98)';
        });
        
        element.addEventListener('mouseup', () => {
            element.style.transform = 'translateY(-8px) scale(1.02)';
        });
    }
    
    animateSlideContent(slideNumber) {
        const currentSlide = this.slides[slideNumber - 1];
        if (!currentSlide) return;
        
        // Animate title
        const title = currentSlide.querySelector('.slide-title, .main-title');
        if (title) {
            title.style.opacity = '0';
            title.style.transform = 'translateY(-20px)';
            title.style.transition = 'all 0.6s ease-out';
            
            setTimeout(() => {
                title.style.opacity = '1';
                title.style.transform = 'translateY(0)';
            }, 200);
        }
        
        // Animate cards with staggered effect
        const cards = currentSlide.querySelectorAll(
            '.point-card, .competitor-card, .metric-card, .seo-card, .opportunity-card, .value-card, .geo-card, .weakness-item, .rec-card, .phase-card, .traffic-item'
        );
        
        cards.forEach((card, index) => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(30px) scale(0.9)';
            card.style.transition = 'all 0.5s cubic-bezier(0.25, 0.8, 0.25, 1)';
            
            setTimeout(() => {
                card.style.opacity = '1';
                card.style.transform = 'translateY(0) scale(1)';
            }, 300 + (index * 100));
        });
        
        // Animate traffic bars specifically
        const trafficBars = currentSlide.querySelectorAll('.traffic-bar');
        trafficBars.forEach((bar, index) => {
            const originalWidth = bar.style.width;
            bar.style.width = '0%';
            bar.style.transition = 'width 1.2s ease-out';
            
            setTimeout(() => {
                bar.style.width = originalWidth;
            }, 800 + (index * 300));
        });
        
        // Animate floating decorations on title slide
        if (slideNumber === 1) {
            const decorations = currentSlide.querySelectorAll('.decoration');
            decorations.forEach((decoration, index) => {
                decoration.style.opacity = '0';
                decoration.style.transform = 'scale(0) rotate(0deg)';
                decoration.style.transition = 'all 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
                
                setTimeout(() => {
                    decoration.style.opacity = '1';
                    decoration.style.transform = 'scale(1) rotate(360deg)';
                }, 1000 + (index * 300));
            });
        }
    }
    
    startFloatingAnimations() {
        const shapes = document.querySelectorAll('.shape');
        shapes.forEach((shape, index) => {
            // Ensure shapes are visible and animating
            shape.style.opacity = '0.15';
            shape.style.animation = `float ${20 + index * 3}s ease-in-out infinite`;
            shape.style.animationDelay = `${index * 0.5}s`;
            
            // Add random movement every few seconds
            setInterval(() => {
                const randomX = (Math.random() - 0.5) * 50;
                const randomY = (Math.random() - 0.5) * 50;
                shape.style.transform = `translate(${randomX}px, ${randomY}px)`;
            }, 4000 + (index * 1000));
        });
    }
    
    toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => {
                console.log(`Error attempting to enable fullscreen: ${err.message}`);
            });
        } else {
            document.exitFullscreen();
        }
    }
    
    showKeyboardHelp() {
        const existingModal = document.querySelector('.help-modal');
        if (existingModal) {
            existingModal.remove();
        }
        
        const helpModal = document.createElement('div');
        helpModal.className = 'help-modal';
        helpModal.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(255, 255, 255, 0.98);
            backdrop-filter: blur(20px);
            padding: 40px;
            border-radius: 20px;
            box-shadow: 0 30px 60px rgba(0, 0, 0, 0.3);
            z-index: 10000;
            max-width: 500px;
            text-align: center;
            border: 2px solid #21808D;
        `;
        
        helpModal.innerHTML = `
            <h3 style="margin-top: 0; color: #21808D; font-size: 24px;">⌨️ Keyboard Shortcuts</h3>
            <div style="text-align: left; margin: 30px 0; line-height: 2;">
                <p><strong>← / →</strong> Navigate slides</p>
                <p><strong>Space</strong> Next slide</p>
                <p><strong>Home</strong> First slide</p>
                <p><strong>End</strong> Last slide</p>
                <p><strong>Ctrl+F</strong> Toggle fullscreen</p>
                <p><strong>?</strong> Show this help</p>
            </div>
            <button onclick="this.parentElement.remove()" style="
                background: linear-gradient(135deg, #21808D, #2196F3);
                color: white;
                border: none;
                padding: 15px 30px;
                border-radius: 30px;
                cursor: pointer;
                font-size: 16px;
                font-weight: bold;
                transition: transform 0.2s ease;
            " onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">Got it! 🚀</button>
        `;
        
        document.body.appendChild(helpModal);
    }
    
    // Public methods for external use
    goToSlide(slideNumber) {
        if (slideNumber >= 1 && slideNumber <= this.totalSlides) {
            this.showSlide(slideNumber);
        }
    }
    
    getCurrentSlideInfo() {
        return {
            current: this.currentSlide,
            total: this.totalSlides,
            isFirst: this.currentSlide === 1,
            isLast: this.currentSlide === this.totalSlides,
            isTransitioning: this.isTransitioning
        };
    }
}

// Initialize the presentation when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('🎨 Initializing Pastbook Presentation...');
    
    // Remove loading indicator
    const loadingIndicator = document.querySelector('.loading-indicator');
    if (loadingIndicator) {
        loadingIndicator.remove();
    }
    
    // Create and start presentation
    const presentation = new PresentationApp();
    
    // Make presentation globally available
    window.presentation = presentation;
    window.goToSlide = (n) => presentation.goToSlide(n);
    window.getCurrentSlide = () => presentation.getCurrentSlideInfo();
    
    console.log('✅ Pastbook Presentation Ready!');
    console.log('🎯 Navigation: Arrow keys, Space, Home/End');
    console.log('📱 Touch: Swipe left/right on mobile');
    console.log('🔧 Debug: Use goToSlide(n) in console');
    console.log('❓ Help: Press ? for keyboard shortcuts');
});

// Handle window events
window.addEventListener('load', () => {
    console.log('🌟 All resources loaded, presentation fully ready!');
});

// Handle fullscreen changes
document.addEventListener('fullscreenchange', () => {
    if (document.fullscreenElement) {
        console.log('📺 Entered fullscreen mode');
    } else {
        console.log('🪟 Exited fullscreen mode');
    }
});

// Handle visibility changes
document.addEventListener('visibilitychange', () => {
    const shapes = document.querySelectorAll('.shape');
    if (document.hidden) {
        console.log('⏸️ Presentation paused (page hidden)');
        shapes.forEach(shape => {
            shape.style.animationPlayState = 'paused';
        });
    } else {
        console.log('▶️ Presentation resumed (page visible)');
        shapes.forEach(shape => {
            shape.style.animationPlayState = 'running';
        });
    }
});

// Enhanced error handling
window.addEventListener('error', (e) => {
    console.error('❌ Presentation error:', e.error);
    
    const errorNotification = document.createElement('div');
    errorNotification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #FF6B35, #FF8E53);
        color: white;
        padding: 15px 20px;
        border-radius: 10px;
        z-index: 10000;
        font-size: 14px;
        font-weight: bold;
        box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
        animation: slideInRight 0.3s ease-out;
    `;
    errorNotification.innerHTML = '⚠️ An error occurred. Check console for details.';
    document.body.appendChild(errorNotification);
    
    setTimeout(() => {
        if (document.body.contains(errorNotification)) {
            errorNotification.style.animation = 'slideOutRight 0.3s ease-in';
            setTimeout(() => {
                if (document.body.contains(errorNotification)) {
                    document.body.removeChild(errorNotification);
                }
            }, 300);
        }
    }, 5000);
});

// Add slide animation styles
const animationStyles = document.createElement('style');
animationStyles.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    @keyframes particleBurst {
        0% {
            opacity: 1;
            transform: scale(1);
        }
        100% {
            opacity: 0;
            transform: scale(3) rotate(180deg);
        }
    }
`;
document.head.appendChild(animationStyles);

// Add particle effect for slide transitions
function createTransitionEffect() {
    const colors = ['#21808D', '#FF6B35', '#FF8E53', '#4CAF50', '#9C27B0', '#2196F3'];
    
    for (let i = 0; i < 8; i++) {
        const particle = document.createElement('div');
        particle.style.cssText = `
            position: fixed;
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: ${colors[Math.floor(Math.random() * colors.length)]};
            pointer-events: none;
            z-index: 1000;
            top: 50%;
            left: 50%;
            animation: particleBurst 0.8s ease-out forwards;
            animation-delay: ${i * 0.1}s;
        `;
        
        document.body.appendChild(particle);
        
        setTimeout(() => {
            if (document.body.contains(particle)) {
                document.body.removeChild(particle);
            }
        }, 1000);
    }
}

// Export for potential module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PresentationApp;
}