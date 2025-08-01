// vibesScroll.js - Interactive scroll-based vibes section with precise positioning
// STEP 1: Track exact scroll position for vibe selection
// STEP 2: Apply pastel background colors based on active vibe
// STEP 3: Smooth transitions between vibes

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

let vibeItems, vibeImages, vibesSection, vibesContent, locomotive;
let currentActiveIndex = -1;
let vibeNames = ['serenity', 'spirit', 'texture', 'community'];

// STEP 1: Initialize interactive vibes scroll functionality
export function initVibesScroll() {
  vibesSection = document.querySelector('.vibes-interactive');
  vibesContent = document.querySelector('.vibes-content');
  vibeItems = document.querySelectorAll('.vibe-item');
  vibeImages = document.querySelectorAll('.vibe-image');
  
  // Get locomotive scroll instance from the main content container
  const scrollContainer = document.querySelector('[data-controller="scroll-animations"]');
  locomotive = scrollContainer?.locomotive;
  
  if (!vibesSection || vibeItems.length === 0 || vibeImages.length === 0) {
    console.warn('Vibes scroll elements not found');
    return;
  }
  
  // STEP 2: Set up precise scroll-based triggers with proper locomotive integration
  setTimeout(() => {
    setupScrollBasedVibes();
  }, 100); // Small delay to ensure locomotive is fully initialized
}

// STEP 2: Create scroll triggers that precisely match scroll position to vibe
function setupScrollBasedVibes() {
  // STEP 2A: Check for reduced motion preference
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  if (prefersReducedMotion) {
    // Show all vibes as active for accessibility
    vibeItems.forEach(item => item.classList.add('active'));
    vibeImages.forEach(image => image.classList.add('active'));
    return;
  }
  
  // STEP 2B: Set up scroll-based progress tracking
  ScrollTrigger.create({
    trigger: vibesSection,
    start: 'top center',
    end: 'bottom center',
    scrub: 1,
    onUpdate: (self) => {
      // Calculate which vibe should be active based on scroll progress
      const progress = self.progress;
      const vibeIndex = Math.floor(progress * vibeNames.length);
      const clampedIndex = Math.max(0, Math.min(vibeNames.length - 1, vibeIndex));
      
      // Add some hysteresis to prevent rapid switching
      if (clampedIndex !== currentActiveIndex) {
        setActiveVibe(clampedIndex);
      }
    }
  });
  
  // STEP 2C: Create individual section triggers for more precise control
  vibeNames.forEach((vibe, index) => {
    const sectionHeight = vibesSection.offsetHeight / vibeNames.length;
    const startPosition = index * sectionHeight;
    const endPosition = (index + 1) * sectionHeight;
    
    ScrollTrigger.create({
      trigger: vibesSection,
      start: () => `top+=${startPosition} center`,
      end: () => `top+=${endPosition} center`,
      onEnter: () => setActiveVibe(index),
      onEnterBack: () => setActiveVibe(index)
    });
  });
  
  // STEP 2D: Add click handlers after scroll triggers are set up
  setupClickHandlers();
  
  // STEP 2E: Initialize with first vibe active
  setActiveVibe(0);
}

// STEP 3: Set active vibe with smooth transitions and background colors
function setActiveVibe(index) {
  if (index === currentActiveIndex) return;
  
  currentActiveIndex = index;
  
  // STEP 3A: Update background color class
  vibesContent.className = 'vibes-content';
  if (index >= 0 && index < vibeNames.length) {
    vibesContent.classList.add(`${vibeNames[index]}-active`);
  }
  
  // STEP 3B: Update text highlighting with scale effect
  vibeItems.forEach((item, i) => {
    if (i === index) {
      item.classList.add('active');
    } else {
      item.classList.remove('active');
    }
  });
  
  // STEP 3C: Update image visibility with enhanced left-to-right reveal
  vibeImages.forEach((image, i) => {
    image.classList.remove('active', 'prev');
    
    if (i === index) {
      // STEP 3D: Animate current image with smooth reveal
      gsap.fromTo(image, 
        { 
          x: '100%',
          opacity: 0,
          scale: 0.9
        },
        {
          x: '0%',
          opacity: 1,
          scale: 1,
          duration: 1,
          ease: 'cubic-bezier(0.4, 0, 0.2, 1)',
          onStart: () => {
            image.classList.add('active');
          }
        }
      );
      
    } else if (i === index - 1 && index > 0) {
      // STEP 3E: Keep previous image subtly visible
      gsap.to(image, {
        x: '-30%',
        opacity: 0.2,
        scale: 0.95,
        duration: 0.8,
        ease: 'power2.out',
        onStart: () => {
          image.classList.add('prev');
        }
      });
      
    } else {
      // STEP 3F: Hide other images smoothly
      gsap.to(image, {
        x: i < index ? '-100%' : '100%',
        opacity: 0,
        scale: 0.9,
        duration: 0.8,
        ease: 'power2.out'
      });
    }
  });
}

// STEP 4: Enhanced click handlers for direct navigation
function setupClickHandlers() {
  vibeItems.forEach((item, index) => {
    item.addEventListener('click', () => {
      // STEP 4A: Calculate precise scroll position for this vibe
      const sectionHeight = vibesSection.offsetHeight;
      const progressForVibe = (index + 0.5) / vibeNames.length; // Center of the vibe segment
      const targetScroll = vibesSection.offsetTop + (sectionHeight * progressForVibe) - (window.innerHeight / 2);
      
      gsap.to(window, {
        scrollTo: {
          y: targetScroll,
          autoKill: false
        },
        duration: 1.5,
        ease: 'power2.inOut'
      });
    });
  });
}

// STEP 5: Cleanup function for page transitions
export function destroyVibesScroll() {
  ScrollTrigger.getAll().forEach(trigger => {
    if (trigger.vars.trigger === vibesSection || trigger.vars.id === 'vibes-main') {
      trigger.kill();
    }
  });
  
  // Reset background
  if (vibesContent) {
    vibesContent.className = 'vibes-content';
  }
}

// STEP 6: Refresh function for window resize
export function refreshVibesScroll() {
  ScrollTrigger.refresh();
}