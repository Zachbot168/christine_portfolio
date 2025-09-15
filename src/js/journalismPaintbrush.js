// journalismPaintbrush.js - Journalism page typing animation controller
export function initJournalismPaintbrush() {
  console.log('⌨️  JOURNALISM TYPING CONTROLLER CALLED!');

  const journalismTitle = document.querySelector('.journalism-title');
  if (!journalismTitle) {
    console.error('❌ No journalism title element found!');
    return;
  }

  console.log('⌨️  Found journalism title element:', journalismTitle);
  console.log('⌨️  Initializing Journalism typing animation');

  // Reset animation states to initial conditions
  function resetAnimationStates() {
    console.log('⌨️  Resetting typing animation states');

    // Reset typing animation
    const typedText = document.getElementById('typed-text');
    const cursor = document.getElementById('typing-cursor');

    if (typedText) {
      typedText.textContent = '';
      console.log('⌨️  Reset: typed text cleared');
    }
    if (cursor) {
      cursor.style.display = 'inline';
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

  // Typing animation function
  function initJournalismTypingAnimation() {
    const typedText = document.getElementById('typed-text');
    const cursor = document.getElementById('typing-cursor');

    console.log('⌨️  Looking for typing elements:', {
      typedText: !!typedText,
      cursor: !!cursor
    });

    if (!typedText || !cursor) {
      console.error('❌ Missing typing elements!');
      return;
    }

    console.log('⌨️  Starting typing animation');

    const textToType = 'Journalism';
    const typingSpeed = 150; // milliseconds per character
    const pauseBeforeDelete = 1000; // pause after full word
    const deletingSpeed = 100; // faster deletion
    const pauseBeforeRetype = 500; // pause before retyping

    let currentIndex = 0;
    let isDeleting = false;
    let isComplete = false;

    function typeWriter() {
      if (isComplete) return;

      if (!isDeleting && currentIndex < textToType.length) {
        // Typing forward
        typedText.textContent = textToType.substring(0, currentIndex + 1);
        currentIndex++;
        setTimeout(typeWriter, typingSpeed);
      } else if (!isDeleting && currentIndex === textToType.length) {
        // Finished typing, pause then start deleting
        setTimeout(() => {
          isDeleting = true;
          typeWriter();
        }, pauseBeforeDelete);
      } else if (isDeleting && currentIndex > 0) {
        // Deleting backward
        typedText.textContent = textToType.substring(0, currentIndex - 1);
        currentIndex--;
        setTimeout(typeWriter, deletingSpeed);
      } else if (isDeleting && currentIndex === 0) {
        // Finished deleting, pause then start typing again
        setTimeout(() => {
          isDeleting = false;
          typeWriter();
        }, pauseBeforeRetype);
      }
    }

    // Start the typing animation after a short delay
    setTimeout(() => {
      typeWriter();
    }, 800);

    // Stop the animation after showing it a few times
    setTimeout(() => {
      isComplete = true;
      typedText.textContent = textToType;
      cursor.style.display = 'none';
      console.log('⌨️  Typing animation completed');
    }, 15000); // Stop after 15 seconds
  }

  // Set up scroll-based journalism animations
  function initJournalismScrollAnimations() {
    // Reset states first
    resetAnimationStates();

    // Observer to trigger journalism animations when title comes into view
    const journalismAnimationObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          console.log('⌨️  Triggering journalism typing animation');

          // Trigger the typing animation
          initJournalismTypingAnimation();

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

          // Keep observer active to allow re-triggering when scrolling away and back
        }
      });
    }, {
      threshold: 0.2,
      rootMargin: '0px 0px -10% 0px'
    });

    journalismAnimationObserver.observe(journalismTitle);

    // Store observer reference for cleanup
    journalismTitle.journalismObserver = journalismAnimationObserver;
  }

  // Video gallery scroll-based reveals
  function initVideoGalleryAnimations() {
    const journalismItems = document.querySelectorAll('.journalism-item');

    if (journalismItems.length === 0) return;

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

  // Background color transition
  function initJournalismGradientTransition() {
    const journalismSection = document.querySelector('.journalism-section');

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

  // Initialize all animations
  initJournalismScrollAnimations();
  initVideoGalleryAnimations();
  initJournalismGradientTransition();

  // Fallback: trigger animation immediately for testing
  setTimeout(() => {
    console.log('⌨️  Fallback: Triggering typing animation for testing');
    initJournalismTypingAnimation();
  }, 2000);

  console.log('⌨️  Journalism typing controller initialized');
}