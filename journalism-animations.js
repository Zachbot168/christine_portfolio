// Page initialization and scroll handling
function initializePage() {
    // Force scroll to top if coming from another page
    if (window.location.hash === '#top' || document.referrer.includes('work.html')) {
        window.scrollTo(0, 0);
        // Remove hash to keep URL clean
        if (window.location.hash) {
            history.replaceState(null, null, window.location.pathname);
        }
    }
    
    // Reset any existing animation states
    resetAnimationStates();
    
    // Ensure CSS is loaded before starting animations
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', startAnimations);
    } else {
        startAnimations();
    }
}

// Reset animation states to initial conditions
function resetAnimationStates() {
    // Reset paintbrush animation
    const brushPath = document.getElementById('journalismBrushPath');
    const textElement = document.querySelector('text[mask="url(#journalismBrushMask)"]');
    if (brushPath && textElement) {
        brushPath.setAttribute('stroke-dashoffset', '2800');
        brushPath.setAttribute('stroke-width', '0');
        textElement.style.opacity = '0';
    }
    
    // Reset subtitle and scroll indicator
    const subtitle = document.querySelector('.journalism-subtitle');
    const subtitleTape = document.querySelector('.subtitle-tape');
    const scrollIndicator = document.querySelector('.journalism-scroll');
    
    if (subtitle) {
        subtitle.style.opacity = '0';
        subtitle.style.transform = 'translateY(20px) scale(0.95)';
    }
    if (subtitleTape) {
        subtitleTape.style.opacity = '0';
        subtitleTape.style.transform = 'translateX(-50%) rotate(-8deg)';
    }
    if (scrollIndicator) {
        scrollIndicator.style.opacity = '0';
    }
}

// Start animations function
function startAnimations() {
    
    // SVG Paintbrush animation
    function initJournalismPaintbrushAnimation() {
        const brushPath = document.getElementById('journalismBrushPath');
        const textElement = document.querySelector('text[mask="url(#journalismBrushMask)"]');
        
        if (!brushPath || !textElement) return;
        
        // Make text visible first
        textElement.style.opacity = '1';
        
        // Start with width 0 for paper tearing effect
        brushPath.setAttribute('stroke-width', '0');
        
        // Start the brush stroke animation (left to right reveal)
        setTimeout(() => {
            brushPath.style.strokeDashoffset = '0';
        }, 500);
        
        // Paper tearing width animation
        const widths = [60, 80, 100];
        let widthInterval;
        
        // Choppy stop-motion style paper tearing animation
        setTimeout(() => {
            const targetWidth = 80;
            const frames = [0, 20, 45, 70, 80];
            let currentFrame = 0;
            
            const animateChoppy = () => {
                if (currentFrame < frames.length) {
                    brushPath.setAttribute('stroke-width', frames[currentFrame]);
                    currentFrame++;
                    setTimeout(animateChoppy, 100);
                } else {
                    // Start random width switching after tearing animation completes
                    setTimeout(() => {
                        widthInterval = setInterval(() => {
                            const randomWidth = widths[Math.floor(Math.random() * widths.length)];
                            brushPath.setAttribute('stroke-width', randomWidth);
                        }, 1000);
                    }, 300);
                }
            };
            
            animateChoppy();
        }, 1000);
    }
    
    // Set up scroll-based journalism animations
    function initJournalismScrollAnimations() {
        const journalismTitle = document.querySelector('.journalism-title');
        if (!journalismTitle) return;
        
        let hasAnimated = false;
        
        // Observer to trigger journalism animations when title comes into view
        const journalismAnimationObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !hasAnimated) {
                    hasAnimated = true;
                    
                    // Trigger the paintbrush animation
                    initJournalismPaintbrushAnimation();
                    
                    // Show subtitle after paintbrush animation
                    const subtitle = document.querySelector('.journalism-subtitle');
                    const scrollIndicator = document.querySelector('.journalism-scroll');
                    
                    setTimeout(() => {
                        // Show subtitle first
                        if (subtitle) {
                            subtitle.style.opacity = '1';
                            subtitle.style.transform = 'translateY(0) scale(1)';
                        }
                        
                        // Then animate tape on top of subtitle
                        setTimeout(() => {
                            const subtitleTape = document.querySelector('.subtitle-tape');
                            if (subtitleTape) {
                                subtitleTape.style.opacity = '1';
                                subtitleTape.style.transform = 'translateX(-50%) rotate(-8deg) scale(1.1)';
                                
                                // Settle tape to normal size
                                setTimeout(() => {
                                    subtitleTape.style.transform = 'translateX(-50%) rotate(-8deg) scale(1)';
                                }, 200);
                            }
                        }, 400);
                        
                        // Show scroll indicator after everything
                        setTimeout(() => {
                            if (scrollIndicator) {
                                scrollIndicator.style.opacity = '1';
                            }
                        }, 1200);
                    }, 1000);
                    
                    // Disconnect observer after animation
                    journalismAnimationObserver.disconnect();
                }
            });
        }, {
            threshold: 0.2,
            rootMargin: '0px 0px -10% 0px'
        });
        
        journalismAnimationObserver.observe(journalismTitle);
    }
    
    // Initialize scroll-based animations
    initJournalismScrollAnimations();
    
    // Video gallery scroll-based reveals
    function initVideoGalleryAnimations() {
        const journalismItems = document.querySelectorAll('.journalism-item');
        
        const videoObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry, index) => {
                if (entry.isIntersecting) {
                    // Staggered reveal with delay
                    setTimeout(() => {
                        entry.target.classList.add('revealed');
                    }, index * 200);
                    
                    videoObserver.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -5% 0px'
        });
        
        journalismItems.forEach(item => {
            videoObserver.observe(item);
        });
    }
    
    // Initialize video gallery animations
    initVideoGalleryAnimations();
    
    // Background color transition
    function initJournalismGradientTransition() {
        const journalismSection = document.querySelector('.journalism-section');
        const journalismTitle = document.querySelector('.journalism-title');
        
        if (!journalismSection || !journalismTitle) return;
        
        const journalismColor = '#FDF2F2'; // Light red for journalism theme
        
        // Observer for title area -> color
        const journalismColorObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    journalismSection.style.backgroundColor = journalismColor;
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '-10% 0px -10% 0px'
        });
        
        journalismColorObserver.observe(journalismTitle);
        
        // Observer to reset to white when leaving section
        const journalismExitObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) {
                    const rect = journalismSection.getBoundingClientRect();
                    if (rect.bottom < 0) {
                        journalismSection.style.backgroundColor = 'white';
                    }
                }
            });
        }, {
            threshold: 0,
            rootMargin: '0px'
        });
        
        journalismExitObserver.observe(journalismSection);
    }
    
    // Initialize background transition
    initJournalismGradientTransition();
}

// Initialize the page when script loads
initializePage();

// Also handle browser back/forward navigation
window.addEventListener('pageshow', function(event) {
    if (event.persisted) {
        // Page was loaded from cache, reset everything
        initializePage();
    }
});

// Handle visibility changes (tab switching)
document.addEventListener('visibilitychange', function() {
    if (!document.hidden && window.location.pathname.includes('journalism')) {
        // Page became visible, ensure animations are working
        setTimeout(() => {
            if (window.scrollY < 100) {
                resetAnimationStates();
                startAnimations();
            }
        }, 100);
    }
});