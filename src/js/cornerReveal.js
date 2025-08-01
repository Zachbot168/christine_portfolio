// cornerReveal.js - Corner photo reveal animations on scroll

export function initCornerReveal() {
  const cornerPhotos = document.querySelectorAll('.corner-photo');
  const heroSection = document.querySelector('.hero');
  
  if (!cornerPhotos.length || !heroSection) return;

  // Intersection Observer for hero section
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const leftPhoto = document.querySelector('.corner-photo--top-left');
      const rightPhoto = document.querySelector('.corner-photo--bottom-right');
      
      if (entry.isIntersecting) {
        // Hero is in view - reveal photos left to right
        console.log('Hero in view - revealing photos');
        
        // Clear any existing classes first
        leftPhoto?.classList.remove('hidden');
        rightPhoto?.classList.remove('hidden');
        
        // Add revealed classes
        setTimeout(() => {
          leftPhoto?.classList.add('revealed');
        }, 100);
        
        setTimeout(() => {
          rightPhoto?.classList.add('revealed');
        }, 300);
        
      } else {
        // Hero is out of view - hide photos right to left
        console.log('Hero out of view - hiding photos');
        
        // Clear revealed classes first
        leftPhoto?.classList.remove('revealed');
        rightPhoto?.classList.remove('revealed');
        
        // Add hidden classes
        rightPhoto?.classList.add('hidden');
        
        setTimeout(() => {
          leftPhoto?.classList.add('hidden');
        }, 200);
      }
    });
  }, {
    threshold: 0.5,
    rootMargin: '0px 0px -50px 0px'
  });

  observer.observe(heroSection);
}