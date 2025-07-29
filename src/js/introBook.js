// introBook.js - Three.js 3D book intro animation
import * as THREE from 'three';
import { gsap } from 'gsap';

let scene, camera, renderer, books = [];
let animationContainer, isAnimating = false;

export function initIntroBook() {
  // STEP 1: Check for reduced motion preference
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  
  if (prefersReducedMotion.matches) {
    // Skip animation for users who prefer reduced motion
    emitIntroComplete();
    hideIntroContainer();
    return;
  }

  animationContainer = document.querySelector('[data-controller="intro-book"]');
  if (!animationContainer) return;

  // STEP 2: Initialize Three.js scene
  initThreeScene();
  
  // STEP 3: Load textures and create book meshes
  loadImagesAndCreateBooks();
}

// STEP 2: Initialize Three.js scene and camera
function initThreeScene() {
  // Create scene
  scene = new THREE.Scene();
  
  // Setup camera with perspective that works well for the animation
  camera = new THREE.PerspectiveCamera(
    75, 
    window.innerWidth / window.innerHeight, 
    0.1, 
    1000
  );
  camera.position.z = 8;
  camera.position.y = 0;
  
  // Create renderer with anti-aliasing
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  
  // Add renderer to DOM
  animationContainer.appendChild(renderer.domElement);
  
  // Add ambient lighting for better visibility
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(ambientLight);
  
  // Add directional light for shadows and depth
  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
  directionalLight.position.set(5, 5, 5);
  directionalLight.castShadow = true;
  directionalLight.shadow.mapSize.width = 2048;
  directionalLight.shadow.mapSize.height = 2048;
  scene.add(directionalLight);
  
  // Handle window resize
  window.addEventListener('resize', onWindowResize);
}

// STEP 3: Load images and create 3D book meshes
function loadImagesAndCreateBooks() {
  const bookElements = document.querySelectorAll('.book-image');
  const textureLoader = new THREE.TextureLoader();
  let loadedCount = 0;
  
  bookElements.forEach((element, index) => {
    const imageSrc = element.dataset.src;
    
    textureLoader.load(
      imageSrc,
      (texture) => {
        // Create book mesh with loaded texture
        const book = createBookMesh(texture, index);
        books.push(book);
        scene.add(book);
        
        loadedCount++;
        if (loadedCount === bookElements.length) {
          // All textures loaded, hide loading indicator and start animation
          animationContainer.classList.add('loaded');
          startBookAnimation();
        }
      },
      (progress) => {
        // Loading progress callback
        console.log(`Loading texture ${index + 1}/${bookElements.length}: ${Math.round(progress.loaded / progress.total * 100)}%`);
      },
      (error) => {
        console.error(`Failed to load texture for book ${index}:`, error);
        // Create a fallback colored book
        const book = createBookMesh(null, index);
        books.push(book);
        scene.add(book);
        
        loadedCount++;
        if (loadedCount === bookElements.length) {
          // All textures loaded, hide loading indicator and start animation  
          animationContainer.classList.add('loaded');
          startBookAnimation();
        }
      }
    );
  });
}

// STEP 4: Create individual book mesh with realistic proportions
function createBookMesh(texture, index) {
  // Book dimensions (realistic book proportions)
  const bookWidth = 2;
  const bookHeight = 2.8;
  const bookDepth = 0.15;
  
  // Create book geometry
  const geometry = new THREE.BoxGeometry(bookWidth, bookHeight, bookDepth);
  
  // Create materials for different faces of the book
  let materials;
  
  if (texture) {
    // Configure texture
    texture.wrapS = THREE.ClampToEdgeWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    texture.minFilter = THREE.LinearFilter;
    texture.flipY = false;
    
    // Create materials array for all 6 faces
    const frontMaterial = new THREE.MeshLambertMaterial({ map: texture });
    const backMaterial = new THREE.MeshLambertMaterial({ map: texture });
    const sideMaterial = new THREE.MeshLambertMaterial({ color: 0xf0f0f0 });
    
    materials = [
      sideMaterial, // right
      sideMaterial, // left  
      sideMaterial, // top
      sideMaterial, // bottom
      frontMaterial, // front
      backMaterial  // back
    ];
  } else {
    // Fallback colored materials
    const colors = [0xff6b6b, 0x4ecdc4, 0x45b7d1, 0x96ceb4, 0xfeca57, 0xff9ff3];
    const color = colors[index % colors.length];
    const material = new THREE.MeshLambertMaterial({ color });
    materials = Array(6).fill(material);
  }
  
  // Create mesh
  const book = new THREE.Mesh(geometry, materials);
  
  // Set initial position (off-screen to the right)
  book.position.x = 15 + (index * 0.5); // Stagger positions
  book.position.y = (index - 2.5) * 0.8; // Spread vertically
  book.position.z = index * -0.2; // Slight depth variation
  
  // Add shadow casting
  book.castShadow = true;
  book.receiveShadow = true;
  
  // Store index for animation reference
  book.userData.index = index;
  book.userData.originalY = book.position.y;
  
  return book;
}

// STEP 5: Main animation sequence controller
function startBookAnimation() {
  if (isAnimating) return;
  isAnimating = true;
  
  // Create master timeline
  const tl = gsap.timeline({
    onComplete: () => {
      // Clean up and emit completion event
      cleanup();
      emitIntroComplete();
      hideIntroContainer();
    }
  });
  
  // STEP 1: Books slide in from right
  animateSlideIn(tl);
  
  // STEP 2: Books fold into 3D fan formation
  animateToFanFormation(tl);
  
  // STEP 3: Fan collapses and slides out left
  animateCollapseAndExit(tl);
  
  // Start render loop
  startRenderLoop();
}

// STEP 1: Animate books sliding in from the right
function animateSlideIn(timeline) {
  books.forEach((book, index) => {
    timeline.to(book.position, {
      duration: 1.2,
      x: 2 + (index * 0.3), // End positions spread horizontally
      ease: "power3.out",
      delay: index * 0.1 // Stagger the slide-in
    }, 0.2);
    
    // Add slight rotation for visual interest
    timeline.to(book.rotation, {
      duration: 1.2,
      y: (index - 2.5) * 0.05, // Subtle rotation variation
      ease: "power3.out",
      delay: index * 0.1
    }, 0.2);
  });
  
  // Hold position briefly
  timeline.to({}, { duration: 0.5 });
}

// STEP 2: Transform books into a 3D fan formation
function animateToFanFormation(timeline) {
  const fanRadius = 4;
  const fanAngleSpread = Math.PI * 0.8; // 144 degrees spread
  
  books.forEach((book, index) => {
    // Calculate fan position
    const angle = (index / (books.length - 1)) * fanAngleSpread - (fanAngleSpread / 2);
    const fanX = Math.sin(angle) * fanRadius;
    const fanZ = Math.cos(angle) * fanRadius - 2;
    
    // Position animation with slight elastic effect
    timeline.to(book.position, {
      duration: 1.5,
      x: fanX,
      y: book.userData.originalY + Math.sin(angle) * 0.5, // Slight arc
      z: fanZ,
      ease: "back.out(1.2)" // Elastic overshoot for dramatic effect
    }, "-=0.3");
    
    // Rotation animation - books face outward in fan
    timeline.to(book.rotation, {
      duration: 1.5,
      y: angle + Math.PI, // Face outward
      x: Math.sin(angle) * 0.1, // Slight tilt
      z: Math.cos(angle) * 0.05, // Subtle roll
      ease: "power2.inOut"
    }, "-=1.5");
    
    // Scale animation for dramatic effect with stagger
    timeline.to(book.scale, {
      duration: 1.5,
      x: 1.15 + (Math.abs(index - 2.5) * 0.05), // Center books larger
      y: 1.15 + (Math.abs(index - 2.5) * 0.05),
      z: 1.15 + (Math.abs(index - 2.5) * 0.05),
      ease: "power2.inOut"
    }, "-=1.5");
    
    // Add a subtle glow effect by varying the material opacity
    if (book.material && Array.isArray(book.material)) {
      timeline.to(book.material[4], { // Front face
        duration: 0.3,
        opacity: 0.95,
        repeat: 1,
        yoyo: true,
        ease: "power2.inOut"
      }, "-=1.2");
    }
  });
  
  // Add camera shake for impact
  timeline.to(camera.position, {
    duration: 0.2,
    y: "+=0.1",
    repeat: 3,
    yoyo: true,
    ease: "power2.out"
  }, "-=1.0");
  
  // Hold fan formation
  timeline.to({}, { duration: 0.8 });
}

// STEP 3: Collapse fan and slide out to the left
function animateCollapseAndExit(timeline) {
  // First, collapse the fan
  books.forEach((book, index) => {
    // Collapse to center
    timeline.to(book.position, {
      duration: 0.8,
      x: 0,
      y: book.userData.originalY,
      z: index * -0.1, // Stack them
      ease: "power2.in"
    }, 0);
    
    // Reset rotation
    timeline.to(book.rotation, {
      duration: 0.8,
      x: 0,
      y: 0,
      z: 0,
      ease: "power2.in"
    }, 0);
    
    // Scale back to normal
    timeline.to(book.scale, {
      duration: 0.8,
      x: 1,
      y: 1,
      z: 1,
      ease: "power2.in"
    }, 0);
  });
  
  // Then slide out to the left
  books.forEach((book, index) => {
    timeline.to(book.position, {
      duration: 1.0,
      x: -15 - (index * 0.2), // Exit to the left
      ease: "power3.in",
      delay: index * 0.05 // Slight stagger
    }, "+=0.2");
    
    // Add rotation during exit
    timeline.to(book.rotation, {
      duration: 1.0,
      y: -Math.PI * 0.5, // Spin as they exit
      ease: "power3.in",
      delay: index * 0.05
    }, "-=1.0");
  });
}

// STEP 6: Render loop for Three.js animation
function startRenderLoop() {
  function animate() {
    if (!isAnimating) return;
    
    requestAnimationFrame(animate);
    
    // Update camera for subtle movement
    camera.position.x = Math.sin(Date.now() * 0.0005) * 0.5;
    camera.lookAt(0, 0, 0);
    
    renderer.render(scene, camera);
  }
  
  animate();
}

// STEP 7: Utility functions
function onWindowResize() {
  if (!camera || !renderer) return;
  
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function cleanup() {
  isAnimating = false;
  
  // Remove event listeners
  window.removeEventListener('resize', onWindowResize);
  
  // Dispose of Three.js resources
  books.forEach(book => {
    if (book.geometry) book.geometry.dispose();
    if (Array.isArray(book.material)) {
      book.material.forEach(material => {
        if (material.map) material.map.dispose();
        material.dispose();
      });
    } else if (book.material) {
      if (book.material.map) book.material.map.dispose();
      book.material.dispose();
    }
    scene.remove(book);
  });
  
  if (renderer) {
    renderer.dispose();
    if (renderer.domElement && renderer.domElement.parentNode) {
      renderer.domElement.parentNode.removeChild(renderer.domElement);
    }
  }
  
  // Clear arrays
  books = [];
  scene = null;
  camera = null;
  renderer = null;
}

function emitIntroComplete() {
  // Emit custom event for hero bar to fade in
  const event = new CustomEvent('intro:done', { 
    detail: { 
      timestamp: Date.now(),
      duration: isAnimating ? 6000 : 0 // Approximate total animation duration
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