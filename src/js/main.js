// main.js - Application entry point
import { initIntroBook } from './introBook.js';
import { initScrollAnimations } from './scrollAnimations.js';
import { initMenuOverlay } from './menuOverlay.js';
import { initPageTransitions } from './pageTransitions.js';
import { initVibeCheck } from './vibeCheck.js';
import { initCornerReveal } from './cornerReveal.js';
import { initVibeCornerReveal } from './vibeCornerReveal.js';

// STEP 1: Initialize all controllers based on data-controller attributes
function initControllers() {
  const controllers = document.querySelectorAll('[data-controller]');
  
  controllers.forEach(element => {
    const controllerName = element.dataset.controller;
    
    switch (controllerName) {
      case 'intro-book':
        initIntroBook();
        break;
      case 'scroll-animations':
        initScrollAnimations();
        break;
      case 'menu-overlay':
      case 'menu-trigger':
        initMenuOverlay();
        break;
      case 'vibe-check':
        initVibeCheck();
        break;
      case 'corner-reveal':
        initCornerReveal();
        break;
      case 'vibe-corner-reveal':
        initVibeCornerReveal();
        break;
      default:
        console.warn(`Unknown controller: ${controllerName}`);
    }
  });
}

// STEP 2: Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  initControllers();
  initPageTransitions();
  
  // Listen for intro completion to show hero bar
  document.addEventListener('intro:done', () => {
    const heroBar = document.querySelector('.hero-bar');
    if (heroBar) {
      setTimeout(() => {
        heroBar.classList.add('visible');
      }, 500); // Small delay for smooth transition
    }
  });
});

// STEP 3: Reinitialize controllers after Barba transitions
export { initControllers };