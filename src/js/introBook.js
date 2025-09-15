// introBook.js - Three.js 3D turbine page intro animation
// 
// NEW CONTROLLED TURBINE ANIMATION SEQUENCE (~6s total):
// 1. SLIDE IN: Pages slide in from right as flat planes (~1.5s)
// 2. GRADUAL FORMATION: Each page moves to turbine position ONE BY ONE with staggered timing (~2s)  
// 3. SPINNING PHASE: Complete turbine spins together as unified unit (~1.5s)
// 4. INDIVIDUAL BREAKAWAY: Each page detaches one by one with unique flight trajectories (~1s)
//
// Key Features:
// - Staggered formation: Pages join turbine one after another for controlled buildup
// - Clear spinning phase: Deliberate pause where complete turbine rotates as one unit
// - Individual breakaway: Each page flies off with unique trajectory and timing
// - Smooth transitions: Each movement phase is smooth and controlled
// - Natural pacing: More deliberate timing throughout for better visual flow
// - No central hub: Clean turbine without central orb or spoke connections

import * as THREE from 'three';
import { gsap } from 'gsap';

let scene, camera, renderer, pages = [];
let animationContainer, isAnimating = false;
let turbineGroup; // Group to hold all pages for turbine rotation

export function initIntroBook() {
  console.log('📖 Initializing intro book animation...');

  // STEP 1: Check for reduced motion preference
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  if (prefersReducedMotion.matches) {
    console.log('📖 Reduced motion detected, skipping animation');
    // Skip animation for users who prefer reduced motion
    emitIntroComplete();
    hideIntroContainer();
    return;
  }

  animationContainer = document.querySelector('[data-controller="intro-book"]');
  console.log('📖 Found animation container:', !!animationContainer);

  if (!animationContainer) {
    console.warn('📖 No intro-book container found!');
    return;
  }

  // STEP 2: Initialize Three.js scene
  initThreeScene();
  
  // STEP 3: Load textures and create page meshes
  loadImagesAndCreatePages();
}

// STEP 2: Initialize Three.js scene and camera
function initThreeScene() {
  // Create scene
  scene = new THREE.Scene();
  
  /* ------------ 5. Camera & resize (FIX: editorial perspective) ------------------- */
  // FIX 7: Camera FOV ≈ 35°, centred on book, slight tilt for dynamism
  camera = new THREE.PerspectiveCamera(
    35, // FIX 7: Editorial perspective
    window.innerWidth / window.innerHeight, 
    0.1, 
    1000
  );
  camera.position.set(0, 0, 8); // Zoom out to see full turbine
  camera.updateProjectionMatrix();
  
  // Create renderer with optimized settings
  renderer = new THREE.WebGLRenderer({ 
    antialias: window.devicePixelRatio === 1, // Only use antialiasing on low-DPI displays
    alpha: true,
    powerPreference: "high-performance" // Use high-performance GPU if available
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Cap pixel ratio to prevent excessive rendering
  renderer.shadowMap.enabled = false; // Disable shadows for better performance
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.sortObjects = true; // FIX 7: Enable object sorting for proper depth order
  
  // Add renderer to DOM
  animationContainer.appendChild(renderer.domElement);
  
  // Simplified lighting for better performance
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
  scene.add(ambientLight);
  
  // Single directional light without shadows
  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.4);
  directionalLight.position.set(5, 5, 5);
  scene.add(directionalLight);
  
  // Background colors now handled via CSS container background
  
  // Handle window resize
  window.addEventListener('resize', onWindowResize);
}

// Background colors handled via CSS - no 3D plane needed

// STEP 3: Load images and create 3D page meshes with proper texture loading
function loadImagesAndCreatePages() {
  const bookElements = document.querySelectorAll('.book-image');
  console.log('📖 Found book elements:', bookElements.length);

  const textureLoader = new THREE.TextureLoader();
  
  // Create fan group to hold all pages at origin
  turbineGroup = new THREE.Group();
  turbineGroup.position.set(0, 0, 0);
  scene.add(turbineGroup);
  
  // Create promises for all texture loads
  const texturePromises = Array.from(bookElements).map((element, index) => {
    return new Promise((resolve, reject) => {
      const imageSrc = element.dataset.src;
      
      // First load the image to get natural dimensions
      const img = new Image();
      img.onload = () => {
        // Now load the texture with known dimensions
        textureLoader.load(
          imageSrc,
          (texture) => {
            resolve({ texture, img, index });
          },
          undefined,
          reject
        );
      };
      img.onerror = reject;
      img.src = imageSrc;
    });
  });
  
  // Wait for all textures to load before creating any planes
  Promise.all(texturePromises)
    .then((results) => {
      // All textures loaded, create fan with proper aspect ratios
      createFan(results);
      animationContainer.classList.add('loaded');
      startTurbineAnimation();
    })
    .catch((error) => {
      console.error('Failed to load textures:', error);
      // Create fallback fan
      createFallbackFan(bookElements.length);
      animationContainer.classList.add('loaded');
      startTurbineAnimation();
    });
}


/******************************************************************
 * FULL‑SPREAD FAN  — stays open until you call fanClose()
 ******************************************************************/

// STEP 4: Create turbine fan with blades radiating from center
function createFan(textureResults) {
  const HEIGHT = 1.2;
  
  // Define intense, saturated colors for each image
  const pastelColors = [
    '#7BB3D9', // Ocean/Rocky Coastline - Rich ocean blue
    '#ECC794', // Portrait with Warm Light - Golden champagne
    '#B8E6B8', // Outdoor Portrait - Vibrant sage green
    '#E0A896', // Clock Tower - Bold dusty rose
    '#B8D4E8', // Mountain Balcony Scene - Strong misty blue
    '#E8DDD4'  // Architectural Ceiling - Rich warm pearl
  ];
  
  const pageMeshes = textureResults.map(({ texture, img, index }) => {
    // Preserve aspect ratio
    const w = HEIGHT * (img.naturalWidth / img.naturalHeight);
    const h = HEIGHT;
    
    const geo = new THREE.PlaneGeometry(w, h);
    // For turbine blades, keep pivot at center
    
    // Configure texture for better quality
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.generateMipmaps = false;
    texture.flipY = true; // Fix upside down images
    
    const mat = new THREE.MeshBasicMaterial({ 
      map: texture, 
      transparent: true,
      opacity: 1,
      depthTest: true, // Ensure proper depth testing
      depthWrite: true // Write to depth buffer for proper sorting
    });
    
    const mesh = new THREE.Mesh(geo, mat);
    mesh.renderOrder = 100 + index; // High render order to stay in front
    
    // Store pastel color for this image
    mesh.userData.pastelColor = pastelColors[index] || '#F8F6F4';
    
    return mesh;
  });
  
  turbineGroup.add(...pageMeshes);

  // TURBINE BLADE ARRANGEMENT - radiating from center like electric fan
  const totalPages = pageMeshes.length;
  const angleStep = (Math.PI * 2) / totalPages; // Evenly distribute around 360°
  
  pageMeshes.forEach((page, index) => {
    const angle = index * angleStep;
    
    // Start position: off-screen to the right
    page.position.set(8, 0, index * 0.01);
    page.rotation.y = 0;
    page.scale.set(1, 1, 1);
    
    // Store turbine formation position
    page.userData.turbinePosition = {
      x: Math.sin(angle) * 1.6,
      y: 0,
      z: Math.cos(angle) * 1.6
    };
    page.userData.turbineRotation = { y: angle };
    
    // Store exit position: off-screen to the left
    page.userData.exitPosition = {
      x: -8,
      y: (Math.random() - 0.5) * 4, // Random vertical spread
      z: index * 0.01
    };
  });

  // Create full animation sequence timeline
  const tl = gsap.timeline({
    onStart: function() {
      // Reset hero section background to transparent at start of each loop
      const heroSection = document.querySelector('.hero');
      if (heroSection) {
        heroSection.style.backgroundColor = 'transparent';
      }
    }
  });
  
  // PHASE 1: Slide in from right (staggered) - SLOWER
  pageMeshes.forEach((page, index) => {
    const delay = index * 0.3; // Slower stagger
    tl.to(page.position, {
      x: 0, y: 0, z: index * 0.01,
      duration: 1.5, // Longer duration
      ease: "power2.out",
      delay: delay
    }, 0);
  });
  
  // PHASE 2: Build turbine formation (staggered) - SLOWER
  pageMeshes.forEach((page, index) => {
    const delay = index * 0.2; // Slower stagger
    tl.to(page.position, {
      x: page.userData.turbinePosition.x,
      y: page.userData.turbinePosition.y,
      z: page.userData.turbinePosition.z,
      duration: 1.2, // Longer duration
      ease: "power2.inOut",
      delay: delay
    }, 3.0) // Start after slide-in completes
    .to(page.rotation, {
      y: page.userData.turbineRotation.y,
      duration: 1.2, // Longer duration
      ease: "power2.inOut",
      delay: delay
    }, 3.0);
  });
  
  // PHASE 3: Step-through rotation - fast turn then pause on each image
  const rotationStep = (Math.PI * 2) / pageMeshes.length;
  let currentTime = 5.5; // Start after turbine forms
  
  // For each image, do a quick rotation to it, then pause
  for (let i = 0; i < pageMeshes.length; i++) {
    const targetRotation = rotationStep * (i + 1);
    
    // Quick rotation to next image
    tl.to(turbineGroup.rotation, {
      y: targetRotation,
      duration: 0.6, // Fast rotation
      ease: "power2.out"
    }, currentTime);
    
    // Update hero section background color when we reach the image
    tl.call(() => {
      if (pageMeshes[i]) {
        const targetColor = pageMeshes[i].userData.pastelColor;
        const heroSection = document.querySelector('.hero');
        if (heroSection) {
          gsap.to(heroSection, {
            backgroundColor: targetColor,
            duration: 0.8,
            ease: "power2.out"
          });
        }
      }
    }, [], currentTime + 0.6);
    
    // Pause to show the image
    currentTime += 0.6 + 1.5; // 0.6s rotation + 1.5s pause
  }
  
  // PHASE 4: Restack back to center (reverse of phase 2) - SLOWER
  const restackStartTime = currentTime + 0.5; // Start shortly after rotation ends
  pageMeshes.forEach((page, index) => {
    const delay = index * 0.2; // Slower stagger
    tl.to(page.position, {
      x: 0, y: 0, z: index * 0.01, // Back to stacked position
      duration: 1.2, // Longer duration
      ease: "power2.inOut",
      delay: delay
    }, restackStartTime) // Start after rotation
    .to(page.rotation, {
      y: 0, // Reset rotation
      duration: 1.2, // Longer duration
      ease: "power2.inOut",
      delay: delay
    }, restackStartTime);
  });
  
  // PHASE 5: Exit to the left (opposite direction from entry) - SLOWER
  const exitStartTime = restackStartTime + 3.0; // Start after restacking completes
  pageMeshes.forEach((page, index) => {
    const delay = index * 0.2; // Slower stagger
    tl.to(page.position, {
      x: -8, // Exit left (opposite of entry direction)
      y: 0,
      z: index * 0.01,
      duration: 1.5, // Longer duration
      ease: "power2.in",
      delay: delay
    }, exitStartTime) // Start after restacking
    .to(page.scale, {
      x: 0.8, y: 0.8, z: 0.8, // Slight scale down as they exit
      duration: 1.5, // Longer duration
      ease: "power2.in",
      delay: delay
    }, exitStartTime);
  });
  
  // Add breathing space before loop repeats
  const bufferStartTime = exitStartTime + 4.0; // After exit completes
  tl.to({}, { 
    duration: 3.0 // 3 second pause to breathe and read
  }, bufferStartTime);
  
  // Reset background color during buffer
  tl.call(() => {
    const heroSection = document.querySelector('.hero');
    if (heroSection) {
      gsap.to(heroSection, {
        backgroundColor: 'transparent',
        duration: 1.0,
        ease: "power2.out"
      });
    }
  }, [], bufferStartTime + 1.0);
  
  // Set up infinite loop
  tl.repeat(-1); // Infinite repeat
  tl.play(); // Start playing immediately

  // Store references globally
  window.fanTimeline = tl;
  window.pageMeshes = pageMeshes;
  pages.push(...pageMeshes);
}

// STEP 4b: Create fallback fan for failed texture loads
function createFallbackFan(count) {
  const HEIGHT = 1;
  const colors = [0xff6b6b, 0x4ecdc4, 0x45b7d1, 0x96ceb4, 0xfeca57, 0xff9ff3];
  
  for (let index = 0; index < count; index++) {
    const WIDTH = HEIGHT * 1.5; // Default aspect ratio
    
    const geometry = new THREE.PlaneGeometry(WIDTH, HEIGHT);
    geometry.translate(-WIDTH/2, 0, 0);
    
    const material = new THREE.MeshLambertMaterial({
      color: colors[index % colors.length],
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.9,
      depthWrite: false,
      depthTest: true
    });
    
    const page = new THREE.Mesh(geometry, material);
    page.renderOrder = index;
    page.position.set(index * 0.02, 0, index * 0.01);
    
    page.userData = {
      index,
      originalWidth: WIDTH,
      originalHeight: HEIGHT,
      aspectRatio: 1.5
    };
    
    pages.push(page);
    turbineGroup.add(page);
  }
}

// STEP 5: FULL-SPREAD FAN animation controller
function startTurbineAnimation() {
  if (isAnimating) return;
  isAnimating = true;
  
  // Start the animation sequence
  fanOpen();
  
  // Emit intro complete immediately so hero bar shows
  setTimeout(() => {
    emitIntroComplete();
  }, 1000);
  
  // Start render loop
  startRenderLoop();
}

/* ------------ 4. Manual control API ---------------- */
export const fanOpen  = () => {
  if (window.fanTimeline) {
    window.fanTimeline.play();       // play from current position (0 when paused at start)
  }
};

export const fanClose = () => {
  // This function is now mainly for manual control
  // The full sequence plays automatically from fanOpen()
  if (window.fanTimeline) {
    window.fanTimeline.pause();
  }
};

// Manual cleanup trigger - no longer needed since animation loops
export const completeFanIntro = () => {
  // Animation now loops continuously, no cleanup needed
};

// STEP 1: Animate pages sliding in from the right (~0.8s)
function animateSlideIn(timeline) {
  pages.forEach((page, index) => {
    timeline.to(page.position, {
      duration: 1.2,
      x: 2 + (index * 1.5), // Much more spacing during slide-in
      z: index * -1.0, // Much more depth spacing during slide
      ease: "power3.out",
      delay: index * 0.15 // More delay between each page
    }, 0.1);
    
    // Add gentle flutter/page-like rotation
    timeline.to(page.rotation, {
      duration: 1.2,
      z: (index - 2.5) * 0.02, // Subtle page flutter
      ease: "power3.out",
      delay: index * 0.05
    }, 0.1);
  });
  
  // Hold position briefly to establish the stack
  timeline.to({}, { duration: 0.3 });
}

// STEP 2: Gradual turbine formation with staggered timing (~1.2s)
function animateGradualTurbineFormation(timeline) {
  const pageWidth = 2.4; // Same as geometry width
  const pageHeight = 3.2; // Same as geometry height
  // Position pages so their inner edge touches the center point
  const turbineRadius = pageWidth * 0.5; // Half the page width so inner edge is at center
  const totalPages = pages.length;
  const formationDuration = 1.2;
  const staggerTime = formationDuration / totalPages; // Time between each page joining
  
  
  // Each page joins the turbine one by one with staggered timing
  pages.forEach((page, index) => {
    const delay = index * staggerTime * 0.8; // Overlap slightly for smoother flow
    
    // Calculate position so inner edge of each page touches center point
    const angle = (index / totalPages) * Math.PI * 2;
    const turbineX = Math.sin(angle) * turbineRadius;
    const turbineZ = Math.cos(angle) * turbineRadius;
    const turbineY = 0; // Keep all pages centered vertically
    
    
    // Smooth movement to turbine position
    timeline.to(page.position, {
      duration: 1.0,
      x: turbineX,
      y: turbineY,
      z: turbineZ,
      ease: "power2.out"
    }, delay);
    
    // Rotate page so it radiates outward from center like a turbine blade
    // The page should be oriented with its inner edge pointing toward center
    timeline.to(page.rotation, {
      duration: 1.0,
      y: angle, // Rotate to point outward from center
      x: 0, // Keep flat horizontally  
      z: 0, // No roll
      ease: "power2.out"
    }, delay);
    
    // Scale up as it joins the formation
    timeline.to(page.scale, {
      duration: 1.0,
      x: 1.2,
      y: 1.2,
      z: 1.2,
      ease: "back.out(1.5)"
    }, delay);
    
    // Brief flash/pulse as page locks into position
    timeline.to(page.material, {
      duration: 0.1,
      opacity: 0.6,
      ease: "power2.inOut"
    }, delay + 0.5);
    timeline.to(page.material, {
      duration: 0.2,
      opacity: 0.95,
      ease: "power2.out"
    }, delay + 0.6);
  });
  
  // Brief pause after all pages have joined
  timeline.to({}, { duration: 0.3 });
}

// STEP 3: Spinning phase - turbine spins as complete unit (~0.8s)
function animateSpinningPhase(timeline) {
  // Now that all pages are in formation, spin the entire turbine as one unit
  timeline.to(turbineGroup.rotation, {
    duration: 6.0, // Even slower to see each photo clearly
    y: "+=12.56", // Two full 360-degree rotations (2 * 2π radians) 
    ease: "none" // Constant speed for better photo visibility
  }, 0);
  
  // Add subtle camera movement during spin to enhance the effect
  timeline.to(camera.position, {
    duration: 6.0, // Match the slower spinning duration
    x: Math.sin(Date.now() * 0.001) * 0.3,
    y: "+=0.1",
    ease: "power2.inOut"
  }, 0);
  
}

// STEP 4: Individual breakaway with unique trajectories (~1.0s)
function animateIndividualBreakaway(timeline) {
  const breakawayDuration = 4.0; // Much longer duration for very slow breakaway
  const totalPages = pages.length;
  const staggerTime = breakawayDuration / totalPages; // More time between each page leaving
  
  // Gradual deceleration and stop of turbine rotation
  timeline.to(turbineGroup.rotation, {
    duration: 1.5, // Even longer deceleration time
    y: turbineGroup.rotation.y, // Hold current rotation to stop spinning
    ease: "power3.out"
  }, 0);
  
  // Hold the formation for much longer before breakaway starts
  timeline.to({}, { duration: 2.0 });
  
  // Each page breaks away individually with unique trajectories
  pages.forEach((page, index) => {
    const delay = index * staggerTime;
    const angle = (index / totalPages) * Math.PI * 2;
    
    
    // Calculate unique exit trajectory for each page
    const exitDistance = 12 + Math.random() * 8; // Distance 12-20
    const exitAngleVariation = (Math.random() - 0.5) * 1.2; // More variation in exit angle
    const exitAngle = angle + exitAngleVariation;
    const exitX = Math.sin(exitAngle) * exitDistance;
    const exitZ = Math.cos(exitAngle) * exitDistance;
    const exitY = page.position.y + (Math.random() - 0.5) * 6; // Larger vertical spread
    
    // Smooth individual exit trajectory - much slower
    timeline.to(page.position, {
      duration: 4.0, // Even slower exit trajectory
      x: exitX,
      y: exitY,
      z: exitZ,
      ease: "power2.out" // Smooth deceleration as they fly away
    }, delay + 2.0); // Much later start delay
    
    // Individual tumbling rotation for natural flight
    const tumbleX = (Math.random() - 0.5) * 3;
    const tumbleY = (Math.random() - 0.5) * 4;
    const tumbleZ = (Math.random() - 0.5) * 3;
    timeline.to(page.rotation, {
      duration: 4.0, // Match the slower exit duration
      x: page.rotation.x + tumbleX,
      y: page.rotation.y + tumbleY,
      z: page.rotation.z + tumbleZ,
      ease: "power1.out"
    }, delay + 2.0); // Much later start delay
    
    // Scale down as pages fly away (like moving into distance)
    const finalScale = 0.2 + Math.random() * 0.3; // Random scale 0.2-0.5
    timeline.to(page.scale, {
      duration: 4.0, // Match the slower exit duration
      x: finalScale,
      y: finalScale,
      z: finalScale,
      ease: "power2.in"
    }, delay + 2.0); // Much later start delay
    
    // Fade out each page naturally - much later in the exit
    timeline.to(page.material, {
      duration: 1.5, // Even longer fade duration
      opacity: 0,
      ease: "power2.in"
    }, delay + 4.0); // Much much later fade start
  });
  
  // Subtle camera movement during breakaway for cinematic effect
  timeline.to(camera.position, {
    duration: 5.0, // Much longer camera movement to match slower breakaway
    x: "+=0.2",
    y: "-=0.1",
    ease: "power2.out"
  }, 2.0); // Start camera movement when breakaway begins
}

// STEP 6: Optimized render loop for Three.js animation
function startRenderLoop() {
  let lastTime = 0;
  const targetFPS = 60;
  const frameInterval = 1000 / targetFPS;
  
  function animate(currentTime) {
    if (!isAnimating) return;
    
    requestAnimationFrame(animate);
    
    // Throttle rendering to target FPS for consistent performance
    if (currentTime - lastTime < frameInterval) return;
    lastTime = currentTime;
    
    // Simplified camera movement (removed expensive Math.sin calls in render loop)
    camera.lookAt(0, 0, 0);
    
    // Remove per-frame page wobble to reduce calculations
    // (GSAP handles all animation, no need for additional effects)
    
    renderer.render(scene, camera);
  }
  
  animate();
}

// STEP 7: Responsive resize with pivot preservation
function onWindowResize() {
  if (!camera || !renderer) return;
  
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight; 
  camera.updateProjectionMatrix();
  
  // FIX 8: Re-run pivot translate on resize to keep hinges intact
  if (window.pageMeshes) {
    window.pageMeshes.forEach(mesh => {
      if (mesh.userData.width && mesh.userData.height) {
        // Reapply left-edge pivot after resize
        const w = mesh.userData.width;
        mesh.geometry.translate(w/2, 0, 0);      // Undo current translation
        mesh.geometry.translate(-w/2, 0, 0);     // Reapply left-edge pivot
      }
    });
  }
}

function cleanup() {
  isAnimating = false;
  
  // Remove event listeners
  window.removeEventListener('resize', onWindowResize);
  
  // Dispose of Three.js resources
  pages.forEach(page => {
    if (page.geometry) page.geometry.dispose();
    if (page.material) {
      if (page.material.map) page.material.map.dispose();
      page.material.dispose();
    }
  });
  
  
  // Remove turbine group from scene
  if (turbineGroup) {
    scene.remove(turbineGroup);
    turbineGroup = null;
  }
  
  // Reset hero section background on cleanup
  const heroSection = document.querySelector('.hero');
  if (heroSection) {
    heroSection.style.backgroundColor = 'transparent';
  }
  
  if (renderer) {
    renderer.dispose();
    if (renderer.domElement && renderer.domElement.parentNode) {
      renderer.domElement.parentNode.removeChild(renderer.domElement);
    }
  }
  
  // Clear arrays
  pages = [];
  scene = null;
  camera = null;
  renderer = null;
}

function emitIntroComplete() {
  // Emit custom event for hero bar to fade in
  const event = new CustomEvent('intro:done', { 
    detail: { 
      timestamp: Date.now(),
      duration: isAnimating ? 6000 : 0 // Slowed down animation duration: slide(1.2s) + formation(2.0s) + spin(1.5s) + breakaway(1.3s) = 6s
    }
  });
  document.dispatchEvent(event);
}

function hideIntroContainer() {
  if (animationContainer) {
    gsap.to(animationContainer, {
      duration: 0.5,
      opacity: 0,
      onComplete: () => {
        animationContainer.style.display = 'none';
      }
    });
  }
}

// STEP 8: Handle prefers-reduced-motion changes
window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', (e) => {
  if (e.matches && isAnimating) {
    // User enabled reduced motion during animation
    cleanup();
    emitIntroComplete();
    hideIntroContainer();
  }
});