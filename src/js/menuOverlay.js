// menuOverlay.js - Full-screen menu overlay
// STEP 1: Muted terracotta background
// STEP 2: Items stagger reveal
// STEP 3: Contextual image thumbs

import { gsap } from 'gsap';

let menuOverlay, menuTrigger, menuClose, menuItems, isMenuOpen = false;

// STEP 1: Initialize menu overlay functionality
export function initMenuOverlay() {
  // Get DOM elements
  menuOverlay = document.querySelector('.menu-overlay');
  menuTrigger = document.querySelector('[data-controller="menu-trigger"] button');
  menuClose = document.querySelector('.menu-close');
  menuItems = document.querySelectorAll('.menu-nav ul li');

  if (!menuOverlay || !menuTrigger || !menuClose) {
    console.warn('Menu overlay elements not found');
    return;
  }

  // STEP 2: Set up event listeners
  setupEventListeners();
  
  // STEP 3: Initialize thumbnail images
  initThumbnails();
  
  // STEP 4: Set initial states
  gsap.set(menuItems, { opacity: 0, y: 50 });
}

// STEP 2: Event listeners for menu interactions
function setupEventListeners() {
  // Open menu on trigger click
  menuTrigger.addEventListener('click', openMenu);
  
  // Close menu on close button click
  menuClose.addEventListener('click', closeMenu);
  
  // Close menu on overlay background click
  menuOverlay.addEventListener('click', (e) => {
    if (e.target === menuOverlay) {
      closeMenu();
    }
  });
  
  // Close menu on ESC key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isMenuOpen) {
      closeMenu();
    }
  });
  
  // Prevent scroll when menu is open
  document.addEventListener('keydown', (e) => {
    if (isMenuOpen && (e.key === 'ArrowUp' || e.key === 'ArrowDown' || e.key === ' ')) {
      e.preventDefault();
    }
  });
}

// STEP 3: Initialize thumbnail images
function initThumbnails() {
  menuItems.forEach(item => {
    const link = item.querySelector('a');
    const thumbSrc = link.getAttribute('data-thumb');
    
    if (thumbSrc) {
      // Create thumbnail element
      const thumb = document.createElement('div');
      thumb.className = 'menu-thumb';
      thumb.style.cssText = `
        position: absolute;
        right: -100px;
        top: 50%;
        transform: translateY(-50%);
        width: 60px;
        height: 60px;
        background-image: url(${thumbSrc});
        background-size: cover;
        background-position: center;
        border-radius: 4px;
        opacity: 0;
        transition: opacity 0.3s ease;
        pointer-events: none;
        z-index: 1;
      `;
      
      item.style.position = 'relative';
      item.appendChild(thumb);
      
      // Show/hide thumbnail on hover
      link.addEventListener('mouseenter', () => {
        if (window.innerWidth > 768) { // Only on desktop
          gsap.to(thumb, { opacity: 1, duration: 0.3 });
        }
      });
      
      link.addEventListener('mouseleave', () => {
        gsap.to(thumb, { opacity: 0, duration: 0.3 });
      });
    }
  });
}

// STEP 4: Open menu with stagger animation
function openMenu() {
  if (isMenuOpen) return;
  
  // STEP 4A: Check for reduced motion preference
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  if (prefersReducedMotion) {
    // Immediate show for accessibility
    menuOverlay.classList.add('active');
    gsap.set(menuItems, { opacity: 1, y: 0 });
    isMenuOpen = true;
    document.body.style.overflow = 'hidden';
    return;
  }
  
  isMenuOpen = true;
  document.body.style.overflow = 'hidden';
  
  // STEP 4B: Show overlay
  menuOverlay.classList.add('active');
  
  // STEP 4C: Animate menu items with stagger
  gsap.to(menuItems, {
    opacity: 1,
    y: 0,
    duration: 0.6,
    stagger: 0.1,
    ease: "back.out(1.7)",
    delay: 0.2
  });
  
  // STEP 4D: Subtle background animation
  gsap.fromTo(menuOverlay, 
    { backdropFilter: 'blur(0px)' },
    { backdropFilter: 'blur(5px)', duration: 0.6, ease: 'power2.out' }
  );
}

// STEP 5: Close menu with reverse animation
function closeMenu() {
  if (!isMenuOpen) return;
  
  // STEP 5A: Check for reduced motion preference
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  if (prefersReducedMotion) {
    // Immediate hide for accessibility
    menuOverlay.classList.remove('active');
    gsap.set(menuItems, { opacity: 0, y: 50 });
    isMenuOpen = false;
    document.body.style.overflow = '';
    return;
  }
  
  // STEP 5B: Animate menu items out with reverse stagger
  gsap.to(menuItems, {
    opacity: 0,
    y: -30,
    duration: 0.4,
    stagger: 0.05,
    ease: "power2.in"
  });
  
  // STEP 5C: Hide overlay after animation
  gsap.to(menuOverlay, {
    backdropFilter: 'blur(0px)',
    duration: 0.4,
    ease: 'power2.in',
    onComplete: () => {
      menuOverlay.classList.remove('active');
      // Reset items for next time
      gsap.set(menuItems, { opacity: 0, y: 50 });
    }
  });
  
  isMenuOpen = false;
  document.body.style.overflow = '';
}

// STEP 6: Handle menu state on page transitions
export function resetMenu() {
  if (isMenuOpen) {
    closeMenu();
  }
}

// STEP 7: Cleanup function for page transitions
export function destroyMenu() {
  if (menuTrigger) {
    menuTrigger.removeEventListener('click', openMenu);
  }
  if (menuClose) {
    menuClose.removeEventListener('click', closeMenu);
  }
  
  // Reset body overflow
  document.body.style.overflow = '';
  isMenuOpen = false;
}