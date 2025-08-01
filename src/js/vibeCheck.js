// vibeCheck.js - Simple and reliable VIBE CHECK animations
export function initVibeCheck() {
  console.log('🚀 VIBE CHECK INIT CALLED!');
  
  const vibeCheckSection = document.querySelector('.vibe-check-section');
  if (!vibeCheckSection) {
    console.error('❌ NO VIBE CHECK SECTION FOUND!');
    return;
  }

  const titleVibe = document.querySelector('.title-word--vibe');
  const titleCheck = document.querySelector('.title-word--check');
  const titleDivider = document.querySelector('.title-divider');
  const vibeTitle = document.querySelector('.vibe-check-title');
  const vibeItems = document.querySelectorAll('.vibe-item');

  console.log('🎬 Initializing VIBE CHECK animations');
  console.log('🎬 Found elements:', {
    vibeCheckSection: !!vibeCheckSection,
    titleVibe: !!titleVibe,
    titleCheck: !!titleCheck,
    titleDivider: !!titleDivider,
    vibeTitle: !!vibeTitle,
    vibeItemsCount: vibeItems.length
  });

  // STEP 1: FORCE FRESH ANIMATION EVERY TIME (disable localStorage for now)
  console.log('🎬 FORCING FRESH ANIMATION - ignoring localStorage');
  
  // Always start fresh - remove any existing revealed classes
  if (titleVibe) {
    titleVibe.classList.remove('revealed');
    console.log('🎭 VIBE starts hidden (above line)');
  }
  if (titleCheck) {
    titleCheck.classList.remove('revealed');
    console.log('🎭 CHECK starts hidden (below line)');
  }
  if (titleDivider) {
    titleDivider.classList.remove('revealed');
    console.log('🎭 DIVIDER starts hidden');
  }
  console.log('🎭 Setting up VIBE CHECK animation observer');
  
  // Track if animation has been triggered
  let hasAnimated = false;
  
  // Set up observer to trigger animation once
  const textObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        console.log('🔍 VIBE CHECK intersection:', {
          isIntersecting: entry.isIntersecting,
          hasAnimated: hasAnimated,
          intersectionRatio: entry.intersectionRatio,
          target: entry.target.className
        });
        
        if (entry.isIntersecting && !hasAnimated) {
          console.log('🎭 TRIGGERING VIBE CHECK ANIMATION!');
          console.log('🎭 VIBE slides DOWN from above, CHECK slides UP from below');
          hasAnimated = true;
          
          // Animate in sequence
          if (titleVibe) {
            console.log('🎭 Adding revealed to VIBE');
            titleVibe.classList.add('revealed');
          }
          setTimeout(() => {
            if (titleDivider) {
              console.log('🎭 Adding revealed to DIVIDER');
              titleDivider.classList.add('revealed');
            }
          }, 300);
          setTimeout(() => {
            if (titleCheck) {
              console.log('🎭 Adding revealed to CHECK');
              titleCheck.classList.add('revealed');
            }
          }, 600);
          
          // Disconnect observer after animation
          textObserver.disconnect();
        }
      });
    }, {
      threshold: 0.2, // Trigger when 20% visible
      rootMargin: '0px 0px -10% 0px' // More generous triggering
    });
    
    if (vibeTitle) {
      textObserver.observe(vibeTitle);
    }

  // STEP 2: Setup background color changes - one observer per section
  const colors = {
    'serenity': '#B8E6E1', // Mint
    'spirit': '#F5C2D6',   // Pink  
    'texture': '#F5D49C',  // Peach
    'adventure': '#F2B8B8' // Coral
  };

  // Observer for title area -> black
  const titleColorObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        console.log('🖤 Setting background to black');
        vibeCheckSection.style.background = 'black';
      }
    });
  }, {
    threshold: 0.3,
    rootMargin: '0px'
  });
  
  if (vibeTitle) {
    titleColorObserver.observe(vibeTitle);
  }

  // Observer for each vibe item -> specific color
  vibeItems.forEach((item, index) => {
    const vibeType = item.dataset.vibe;
    const color = colors[vibeType];
    
    if (!color) return;
    
    const colorObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          console.log(`🎨 Setting background to ${vibeType} (${color})`);
          vibeCheckSection.style.background = color;
        }
      });
    }, {
      threshold: 0.5,
      rootMargin: '0px 0px -20% 0px'
    });
    
    colorObserver.observe(item);

    // Corner photos
    const leftPhoto = item.querySelector('.vibe-corner-photo--top-left');
    const rightPhoto = item.querySelector('.vibe-corner-photo--bottom-right');
    
    if (leftPhoto && rightPhoto) {
      const photoObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            console.log(`📸 Revealing corner photos for ${vibeType}`);
            leftPhoto.classList.add('revealed');
            rightPhoto.classList.add('revealed');
            photoObserver.unobserve(entry.target);
          }
        });
      }, {
        threshold: 0.3
      });
      
      photoObserver.observe(item);
    }

    // Paper unfolding animation
    const paperExpand = item.querySelector('.paper-expand');
    if (paperExpand) {
      console.log(`📜 Setting up paper observer for ${vibeType}`);
      
      const paperObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          console.log(`📜 Paper intersection for ${vibeType}:`, {
            isIntersecting: entry.isIntersecting,
            intersectionRatio: entry.intersectionRatio,
            target: entry.target.className
          });
          
          if (entry.isIntersecting) {
            console.log(`📜 TRIGGERING Paper unfolding for ${vibeType} (delayed)`);
            
            // Add delay so you can see the unfolding happen
            setTimeout(() => {
              paperExpand.classList.add('expanded');
              console.log(`📜 Paper actually unfolding NOW for ${vibeType}`);
            }, 500); // 500ms delay
            
            paperObserver.unobserve(entry.target);
          }
        });
      }, {
        threshold: 0.4, // Higher threshold - needs to be more in view
        rootMargin: '0px 0px -30% 0px' // More restrictive - trigger when well into viewport
      });
      
      paperObserver.observe(item);
    } else {
      console.log(`📜 No paper-expand found for ${vibeType}`);
    }
  });

  // STEP 3: Observer for Experience More section to cycle through all vibe colors
  const experienceMoreSection = document.querySelector('.experience-more-section');
  if (experienceMoreSection) {
    const colorValues = Object.values(colors); // Get all vibe colors
    let colorIndex = 0;
    
    // Set up color cycling interval when Experience More is in view
    const experienceObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          console.log('🌈 Starting color cycle for Experience More section');
          
          // Start cycling through colors
          const colorCycle = setInterval(() => {
            experienceMoreSection.style.background = colorValues[colorIndex];
            console.log(`🎨 Experience More color: ${colorValues[colorIndex]}`);
            colorIndex = (colorIndex + 1) % colorValues.length;
          }, 2000); // Change color every 2 seconds
          
          // Store interval so we can clear it when leaving
          experienceMoreSection.colorCycle = colorCycle;
        } else {
          // Stop cycling and reset when leaving view
          if (experienceMoreSection.colorCycle) {
            clearInterval(experienceMoreSection.colorCycle);
            experienceMoreSection.colorCycle = null;
            experienceMoreSection.style.background = 'white';
            console.log('🤍 Stopped Experience More color cycle');
          }
        }
      });
    }, {
      threshold: 0.3,
      rootMargin: '0px'
    });
    
    experienceObserver.observe(experienceMoreSection);
  }

  // STEP 4: Observer to reset to white when leaving vibe section
  const exitObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) {
        const rect = vibeCheckSection.getBoundingClientRect();
        if (rect.bottom < 0) {
          console.log('🤍 Resetting vibe section background to white');
          vibeCheckSection.style.background = 'white';
        }
      }
    });
  }, {
    threshold: 0,
    rootMargin: '0px'
  });
  
  exitObserver.observe(vibeCheckSection);
}

export function cleanupVibeCheck() {
  // Reset section background
  const vibeCheckSection = document.querySelector('.vibe-check-section');
  if (vibeCheckSection) {
    vibeCheckSection.style.background = '';
  }
}

// Debug function to reset animation for testing
export function resetVibeAnimation() {
  const titleVibe = document.querySelector('.title-word--vibe');
  const titleCheck = document.querySelector('.title-word--check');
  const titleDivider = document.querySelector('.title-divider');
  const vibeTitle = document.querySelector('.vibe-check-title');
  
  if (titleVibe) {
    titleVibe.classList.remove('revealed');
    console.log('🔄 Removed revealed from VIBE');
  }
  if (titleCheck) {
    titleCheck.classList.remove('revealed');
    console.log('🔄 Removed revealed from CHECK');
  }
  if (titleDivider) {
    titleDivider.classList.remove('revealed');
    console.log('🔄 Removed revealed from DIVIDER');
  }
  
  // Clear localStorage so animation can play again
  localStorage.removeItem('vibeCheckAnimated');
  
  // Set up the observer again without page refresh
  if (vibeTitle) {
    let hasAnimated = false;
    
    const textObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        console.log('🔍 RESET OBSERVER - VIBE CHECK intersection:', {
          isIntersecting: entry.isIntersecting,
          hasAnimated: hasAnimated,
          intersectionRatio: entry.intersectionRatio
        });
        
        if (entry.isIntersecting && !hasAnimated) {
          console.log('🎭 RESET OBSERVER - Triggering VIBE CHECK text animation');
          hasAnimated = true;
          localStorage.setItem('vibeCheckAnimated', 'true');
          
          // Animate in sequence
          if (titleVibe) {
            console.log('🎭 RESET - Adding revealed to VIBE');
            titleVibe.classList.add('revealed');
          }
          setTimeout(() => {
            if (titleDivider) {
              console.log('🎭 RESET - Adding revealed to DIVIDER');
              titleDivider.classList.add('revealed');
            }
          }, 300);
          setTimeout(() => {
            if (titleCheck) {
              console.log('🎭 RESET - Adding revealed to CHECK');
              titleCheck.classList.add('revealed');
            }
          }, 600);
          
          textObserver.disconnect();
        }
      });
    }, {
      threshold: 0.3,
      rootMargin: '0px 0px -20% 0px'
    });
    
    textObserver.observe(vibeTitle);
    console.log('🔄 New observer set up - scroll to vibe section to see animation');
  }
  
  console.log('🔄 Animation reset complete');
  console.log('🔄 Current localStorage state:', localStorage.getItem('vibeCheckAnimated'));
}

// Test function to force animation without observer
export function forceVibeAnimation() {
  console.log('🧪 FORCING VIBE ANIMATION');
  
  const titleVibe = document.querySelector('.title-word--vibe');
  const titleCheck = document.querySelector('.title-word--check');
  const titleDivider = document.querySelector('.title-divider');
  
  console.log('🧪 Elements found:', { titleVibe: !!titleVibe, titleCheck: !!titleCheck, titleDivider: !!titleDivider });
  
  if (titleVibe) {
    titleVibe.classList.add('revealed');
    console.log('🧪 Added revealed to VIBE');
  }
  
  setTimeout(() => {
    if (titleDivider) {
      titleDivider.classList.add('revealed');
      console.log('🧪 Added revealed to DIVIDER');
    }
  }, 300);
  
  setTimeout(() => {
    if (titleCheck) {
      titleCheck.classList.add('revealed');
      console.log('🧪 Added revealed to CHECK');
    }
  }, 600);
}

// Nuclear reset function - clears everything aggressively
export function nuclearResetVibeAnimation() {
  console.log('💥 NUCLEAR RESET - Clearing everything!');
  
  // Clear ALL possible localStorage keys
  localStorage.removeItem('vibeCheckAnimated');
  localStorage.removeItem('vibeCheckAnimationComplete');
  localStorage.removeItem('vibeAnimated');
  
  // Show what's actually in localStorage
  console.log('💥 All localStorage keys:', Object.keys(localStorage));
  console.log('💥 vibeCheckAnimated value:', localStorage.getItem('vibeCheckAnimated'));
  
  // Remove classes
  const titleVibe = document.querySelector('.title-word--vibe');
  const titleCheck = document.querySelector('.title-word--check');
  const titleDivider = document.querySelector('.title-divider');
  
  if (titleVibe) {
    titleVibe.classList.remove('revealed');
    titleVibe.style.transform = '';
    console.log('💥 VIBE reset');
  }
  if (titleCheck) {
    titleCheck.classList.remove('revealed');
    titleCheck.style.transform = '';
    console.log('💥 CHECK reset');
  }
  if (titleDivider) {
    titleDivider.classList.remove('revealed');
    titleDivider.style.transform = '';
    console.log('💥 DIVIDER reset');
  }
  
  console.log('💥 NUCLEAR RESET COMPLETE - refresh page to test');
}

// Test function that completely ignores localStorage and just sets up observer
export function testVibeAnimationFresh() {
  console.log('🧪 FRESH TEST - Ignoring localStorage completely');
  
  const titleVibe = document.querySelector('.title-word--vibe');
  const titleCheck = document.querySelector('.title-word--check');
  const titleDivider = document.querySelector('.title-divider');
  const vibeTitle = document.querySelector('.vibe-check-title');
  
  // Reset visual state
  if (titleVibe) {
    titleVibe.classList.remove('revealed');
    titleVibe.style.transform = '';
  }
  if (titleCheck) {
    titleCheck.classList.remove('revealed');
    titleCheck.style.transform = '';
  }
  if (titleDivider) {
    titleDivider.classList.remove('revealed');
    titleDivider.style.transform = '';
  }
  
  console.log('🧪 Elements reset, setting up fresh observer...');
  
  // Set up completely fresh observer - ignore localStorage
  let hasAnimated = false;
  
  const testObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      console.log('🧪 FRESH OBSERVER intersection:', {
        isIntersecting: entry.isIntersecting,
        hasAnimated: hasAnimated,
        intersectionRatio: entry.intersectionRatio,
        boundingRect: entry.boundingClientRect,
        rootBounds: entry.rootBounds
      });
      
      if (entry.isIntersecting && !hasAnimated) {
        console.log('🧪 FRESH OBSERVER - TRIGGERING ANIMATION!');
        hasAnimated = true;
        
        // Animate in sequence
        if (titleVibe) {
          console.log('🧪 Adding revealed to VIBE');
          titleVibe.classList.add('revealed');
        }
        setTimeout(() => {
          if (titleDivider) {
            console.log('🧪 Adding revealed to DIVIDER');
            titleDivider.classList.add('revealed');
          }
        }, 300);
        setTimeout(() => {
          if (titleCheck) {
            console.log('🧪 Adding revealed to CHECK');
            titleCheck.classList.add('revealed');
          }
        }, 600);
      }
    });
  }, {
    threshold: 0.1, // Very low threshold
    rootMargin: '0px' // No margin
  });
  
  if (vibeTitle) {
    testObserver.observe(vibeTitle);
    console.log('🧪 Fresh observer attached to:', vibeTitle);
  } else {
    console.error('🧪 No vibeTitle found!');
  }
  
  console.log('🧪 FRESH TEST SETUP COMPLETE - scroll to VIBE CHECK section');
}

// Emergency function to show text immediately
export function showVibeTextNow() {
  console.log('🚨 EMERGENCY: Showing VIBE CHECK text immediately');
  
  const titleVibe = document.querySelector('.title-word--vibe');
  const titleCheck = document.querySelector('.title-word--check');
  const titleDivider = document.querySelector('.title-divider');
  
  if (titleVibe) {
    titleVibe.classList.add('revealed');
    titleVibe.style.transform = 'translateY(0)';
    titleVibe.style.opacity = '1';
    console.log('🚨 VIBE forced visible');
  }
  if (titleCheck) {
    titleCheck.classList.add('revealed');
    titleCheck.style.transform = 'translateY(0)';
    titleCheck.style.opacity = '1';
    console.log('🚨 CHECK forced visible');
  }
  if (titleDivider) {
    titleDivider.classList.add('revealed');
    titleDivider.style.transform = 'scaleX(1)';
    titleDivider.style.opacity = '1';
    console.log('🚨 DIVIDER forced visible');
  }
  
  console.log('🚨 All elements should now be visible');
}

// Test function to manually unfold all papers
export function unfoldAllPapers() {
  console.log('📜 MANUALLY UNFOLDING ALL PAPERS');
  
  const papers = document.querySelectorAll('.paper-expand');
  papers.forEach((paper, index) => {
    console.log(`📜 Unfolding paper ${index}:`, paper);
    paper.classList.add('expanded');
    
    // Also check current styles
    console.log(`📜 Paper ${index} computed width:`, window.getComputedStyle(paper).width);
    console.log(`📜 Paper ${index} classes:`, paper.className);
  });
  
  console.log(`📜 Total papers found: ${papers.length}`);
}

// Make functions available in console for testing
if (typeof window !== 'undefined') {
  window.resetVibeAnimation = resetVibeAnimation;
  window.forceVibeAnimation = forceVibeAnimation;
  window.nuclearResetVibeAnimation = nuclearResetVibeAnimation;
  window.testVibeAnimationFresh = testVibeAnimationFresh;
  window.showVibeTextNow = showVibeTextNow;
  window.unfoldAllPapers = unfoldAllPapers;
}