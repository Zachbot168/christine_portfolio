// scrollAnimations.js - GSAP ScrollTrigger animations
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import LocomotiveScroll from 'locomotive-scroll';

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger, SplitText);

// STEP 1: Initialize Locomotive Scroll
let locoScroll;

function initLocomotiveScroll() {
  const scrollContainer = document.querySelector('[data-controller="scroll-animations"]');
  if (!scrollContainer) return null;

  locoScroll = new LocomotiveScroll({
    el: scrollContainer,
    smooth: true,
    multiplier: 1,
    class: 'is-revealed',
    scrollFromAnywhere: false,
    touchMultiplier: 2,
    firefoxMultiplier: 50,
    lerp: 0.1
  });

  // Store locomotive instance on the container for Barba.js integration
  scrollContainer.locomotive = locoScroll;

  return locoScroll;
}

// STEP 2: Configure ScrollTrigger to work with Locomotive Scroll
function setupScrollTriggerIntegration() {
  if (!locoScroll) return;

  locoScroll.on('scroll', ScrollTrigger.update);

  ScrollTrigger.scrollerProxy('[data-controller="scroll-animations"]', {
    scrollTop(value) {
      return arguments.length ? locoScroll.scrollTo(value, 0, 0) : locoScroll.scroll.instance.scroll.y;
    },
    getBoundingClientRect() {
      return {top: 0, left: 0, width: window.innerWidth, height: window.innerHeight};
    },
    pinType: document.querySelector('[data-controller="scroll-animations"]').style.transform ? "transform" : "fixed"
  });

  ScrollTrigger.addEventListener("refresh", () => locoScroll.update());
  ScrollTrigger.refresh();
}

// STEP 3: Heading unblur animation (6px blur to 0px with revealed class)
function animateHeadings() {
  const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
  
  headings.forEach((heading) => {
    // Skip headings that shouldn't be animated (like logo, menu, or VIBE CHECK titles)
    if (heading.closest('.hero-bar') || 
        heading.closest('.menu-overlay') || 
        heading.closest('.vibe-check-title')) return;
    
    ScrollTrigger.create({
      trigger: heading,
      scroller: '[data-controller="scroll-animations"]',
      start: 'top 80%',
      end: 'bottom 20%',
      onEnter: () => {
        heading.classList.add('revealed');
      },
      onLeave: () => {
        heading.classList.remove('revealed');
      },
      onEnterBack: () => {
        heading.classList.add('revealed');
      },
      onLeaveBack: () => {
        heading.classList.remove('revealed');
      }
    });
  });
}

// STEP 4: Hero buttons reveal animation
function animateHeroButtons() {
  const heroButtons = document.querySelector('.hero-buttons');
  
  if (heroButtons) {
    ScrollTrigger.create({
      trigger: heroButtons,
      scroller: '[data-controller="scroll-animations"]',
      start: 'top 90%',
      end: 'bottom 10%',
      onEnter: () => {
        heroButtons.classList.add('revealed');
      },
      onLeave: () => {
        heroButtons.classList.remove('revealed');
      },
      onEnterBack: () => {
        heroButtons.classList.add('revealed');
      },
      onLeaveBack: () => {
        heroButtons.classList.remove('revealed');
      }
    });
  }
}

// STEP 4b: Hero scroll indicator reveal animation
function animateHeroScrollIndicator() {
  const heroScrollIndicator = document.querySelector('.hero-scroll-indicator');
  
  if (heroScrollIndicator) {
    ScrollTrigger.create({
      trigger: heroScrollIndicator,
      scroller: '[data-controller="scroll-animations"]',
      start: 'top 90%',
      end: 'bottom 10%',
      onEnter: () => {
        heroScrollIndicator.classList.add('revealed');
      },
      onLeave: () => {
        heroScrollIndicator.classList.remove('revealed');
      },
      onEnterBack: () => {
        heroScrollIndicator.classList.add('revealed');
      },
      onLeaveBack: () => {
        heroScrollIndicator.classList.remove('revealed');
      }
    });
  }
}

// STEP 5: Letter stagger animations using SplitText
function animateTextStagger() {
  const textElements = document.querySelectorAll('.hero p, .about-text p, .contact-info p');
  
  textElements.forEach((element) => {
    const splitText = new SplitText(element, { type: 'chars' });
    const chars = splitText.chars;
    
    // Set initial state
    gsap.set(chars, {
      opacity: 0,
      y: 20,
      rotateX: -90
    });
    
    ScrollTrigger.create({
      trigger: element,
      scroller: '[data-controller="scroll-animations"]',
      start: 'top 85%',
      end: 'bottom 15%',
      onEnter: () => {
        gsap.to(chars, {
          opacity: 1,
          y: 0,
          rotateX: 0,
          duration: 0.6,
          stagger: {
            amount: 0.8,
            from: 'start'
          },
          ease: 'power2.out'
        });
      },
      onLeave: () => {
        gsap.to(chars, {
          opacity: 0,
          y: 20,
          rotateX: -90,
          duration: 0.4,
          stagger: {
            amount: 0.4,
            from: 'end'
          },
          ease: 'power2.in'
        });
      },
      onEnterBack: () => {
        gsap.to(chars, {
          opacity: 1,
          y: 0,
          rotateX: 0,
          duration: 0.6,
          stagger: {
            amount: 0.8,
            from: 'start'
          },
          ease: 'power2.out'
        });
      },
      onLeaveBack: () => {
        gsap.to(chars, {
          opacity: 0,
          y: 20,
          rotateX: -90,
          duration: 0.4,
          stagger: {
            amount: 0.4,
            from: 'end'
          },
          ease: 'power2.in'
        });
      }
    });
  });
}

// STEP 6: Vibe panels animation (opacity + colored background + image scale)
function animateVibePanels() {
  const vibePanels = document.querySelectorAll('.vibe-panel');
  
  vibePanels.forEach((panel, index) => {
    const image = panel.querySelector('img');
    
    ScrollTrigger.create({
      trigger: panel,
      scroller: '[data-controller="scroll-animations"]',
      start: 'top 70%',
      end: 'bottom 30%',
      onEnter: () => {
        panel.classList.add('active');
        if (image) {
          gsap.to(image, {
            scale: 1.05,
            duration: 0.6,
            ease: 'power2.out'
          });
        }
      },
      onLeave: () => {
        panel.classList.remove('active');
        if (image) {
          gsap.to(image, {
            scale: 1,
            duration: 0.4,
            ease: 'power2.in'
          });
        }
      },
      onEnterBack: () => {
        panel.classList.add('active');
        if (image) {
          gsap.to(image, {
            scale: 1.05,
            duration: 0.6,
            ease: 'power2.out'
          });
        }
      },
      onLeaveBack: () => {
        panel.classList.remove('active');
        if (image) {
          gsap.to(image, {
            scale: 1,
            duration: 0.4,
            ease: 'power2.in'
          });
        }
      }
    });
  });
}

// STEP 7: Work items fade-in animation
function animateWorkItems() {
  const workItems = document.querySelectorAll('.work-item');
  
  workItems.forEach((item, index) => {
    gsap.set(item, {
      opacity: 0,
      y: 30
    });
    
    ScrollTrigger.create({
      trigger: item,
      scroller: '[data-controller="scroll-animations"]',
      start: 'top 80%',
      onEnter: () => {
        gsap.to(item, {
          opacity: 1,
          y: 0,
          duration: 0.6,
          delay: index * 0.1,
          ease: 'power2.out'
        });
      }
    });
  });
}

// STEP 8: Handle resize events
function handleResize() {
  let resizeTimer;
  
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      if (locoScroll) {
        locoScroll.update();
      }
      ScrollTrigger.refresh();
    }, 250);
  });
}

// STEP 9: Cleanup function
function cleanup() {
  if (locoScroll) {
    locoScroll.destroy();
    locoScroll = null;
  }
  ScrollTrigger.getAll().forEach(trigger => trigger.kill());
}

// STEP 10: Main initialization function with reduced motion support
export function initScrollAnimations() {
  // Check for reduced motion preference
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  if (prefersReducedMotion) {
    // Add revealed class to all headings immediately
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    headings.forEach(heading => {
      if (!heading.closest('.hero-bar') && !heading.closest('.menu-overlay')) {
        heading.classList.add('revealed');
      }
    });
    
    // Add active class to vibe panels
    const vibePanels = document.querySelectorAll('.vibe-panel');
    vibePanels.forEach(panel => {
      panel.classList.add('active');
    });
    
    // Show work items
    const workItems = document.querySelectorAll('.work-item');
    workItems.forEach(item => {
      gsap.set(item, { opacity: 1, y: 0 });
    });
    
    // Show text elements
    const textElements = document.querySelectorAll('.hero p, .about-text p, .contact-info p');
    textElements.forEach(element => {
      element.classList.add('revealed');
    });
    
    // Show hero buttons
    const heroButtons = document.querySelector('.hero-buttons');
    if (heroButtons) {
      heroButtons.classList.add('revealed');
    }
    
    // Show hero scroll indicator
    const heroScrollIndicator = document.querySelector('.hero-scroll-indicator');
    if (heroScrollIndicator) {
      heroScrollIndicator.classList.add('revealed');
    }
    
    return;
  }
  
  // Initialize Locomotive Scroll
  const locomotiveInstance = initLocomotiveScroll();
  if (!locomotiveInstance) {
    console.warn('Locomotive Scroll could not be initialized');
    return;
  }
  
  // Setup ScrollTrigger integration
  setupScrollTriggerIntegration();
  
  // Initialize all animations
  animateHeadings();
  animateHeroButtons();
  animateHeroScrollIndicator();
  animateTextStagger();
  animateVibePanels();
  animateWorkItems();
  
  // Handle resize events
  handleResize();
  
  // Cleanup on page unload
  window.addEventListener('beforeunload', cleanup);
  
  // Return cleanup function for Barba.js integration
  return cleanup;
}