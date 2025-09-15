// main.js - Application entry point
import { initIntroBook } from './introBook.js';
import { initScrollAnimations } from './scrollAnimations.js';
import { initMenuOverlay } from './menuOverlay.js';
import { initPageTransitions } from './pageTransitions.js';
import { initVibeCheck } from './vibeCheck.js';
import { initCornerReveal } from './cornerReveal.js';
import { initVibeCornerReveal } from './vibeCornerReveal.js';
import { initVibePageManager, getVibePageManager } from './vibePageManager.js';
import { initBrowserBackFix } from './browserBackFix.js';
import { initJournalismPaintbrush } from './journalismPaintbrush.js';

// STEP 1: Initialize all controllers based on data-controller attributes
function initControllers() {
  const controllers = document.querySelectorAll('[data-controller]');
  
  controllers.forEach(element => {
    const controllerName = element.dataset.controller;
    console.log(`🎮 Found controller: ${controllerName}`, element);

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
        console.log('🎮 Initializing corner-reveal controller');
        initCornerReveal();
        break;
      case 'vibe-corner-reveal':
        initVibeCornerReveal();
        break;
      case 'journalism-paintbrush':
        initJournalismPaintbrush();
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
  
  // Initialize vibe page manager for gallery back navigation
  initVibePageManager();
  
  // Initialize browser back fix for animation issues
  initBrowserBackFix();
  
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