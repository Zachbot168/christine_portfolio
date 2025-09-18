// Import all images as assets for Vite processing

// Photography - Serenity
import serenity1 from '../assets/photography/serenity/IMG_1332.JPG.jpg';
import serenity2 from '../assets/photography/serenity/IMG_0654.JPG.jpg';
import serenity3 from '../assets/photography/serenity/IMG_3178.JPG.jpg';
import serenity4 from '../assets/photography/serenity/IMG_0594.JPG.jpg';

// Photography - Spirit
import spirit1 from '../assets/photography/spirit/IMG_2815.JPG.jpg';
import spirit2 from '../assets/photography/spirit/IMG_2258_Original.jpg';
import spirit3 from '../assets/photography/spirit/IMG_3420.jpeg';
import spirit4 from '../assets/photography/spirit/IMG_2557.jpeg';
import spirit5 from '../assets/photography/spirit/IMG_1833_Original.jpg';

// Photography - Texture
import texture1 from '../assets/photography/texture/P1018716.JPG.jpg';
import texture2 from '../assets/photography/texture/IMG_3742_Original.jpg';
import texture3 from '../assets/photography/texture/IMG_4778.JPG.jpg';
import texture4 from '../assets/photography/texture/IMG_3692.JPG.jpg';

// Photography - Community/Adventure
import community1 from '../assets/photography/community/P1060996.jpg';
import community2 from '../assets/photography/community/P1061003.jpg';
import community3 from '../assets/photography/community/P1061076.jpg';
import community4 from '../assets/photography/community/P1061143.jpg';
import community5 from '../assets/photography/community/IMG_4623.jpeg';

// Photography - Commencement
import commencement1 from '../assets/photography/commencement/P1096231.jpg';
import commencement2 from '../assets/photography/commencement/P1129002.JPG';
import commencement3 from '../assets/photography/commencement/P1140423.JPG';
import commencement4 from '../assets/photography/commencement/P1185180.jpg';
import commencement5 from '../assets/photography/commencement/P1196127.jpg';
import commencement6 from '../assets/photography/commencement/P1151320.JPG';
import commencement7 from '../assets/photography/commencement/P1185310.jpg';

// Marketing - Lewkin Modeling
import lewkin1 from '../assets/marketing/lewkin/modeling/P1030493.JPG';
import lewkin2 from '../assets/marketing/lewkin/modeling/P1030505.JPG';
import lewkin3 from '../assets/marketing/lewkin/modeling/P1030511.JPG';
import lewkin4 from '../assets/marketing/lewkin/modeling/P1030538.JPG';
import lewkin5 from '../assets/marketing/lewkin/modeling/P1030583.JPG';
import lewkin6 from '../assets/marketing/lewkin/modeling/IMG_6629.JPG';
import lewkin7 from '../assets/marketing/lewkin/modeling/DSC01663.JPG';
import lewkin8 from '../assets/marketing/lewkin/modeling/DSC01661.JPG';
import lewkin9 from '../assets/marketing/lewkin/modeling/DSC01679.JPG';
import lewkin10 from '../assets/marketing/lewkin/modeling/DSC01604.JPG';

// Intro Book Images (already imported)
import { introBookImages } from './introBookImages.js';

export const imageAssets = {
  // Photography categories
  serenity: {
    main: serenity1,
    corner1: serenity2,
    corner2: serenity3,
    thumb: serenity4
  },
  spirit: {
    main: spirit1,
    corner1: spirit2,
    corner2: spirit3,
    hero: spirit4,
    thumb: spirit5
  },
  texture: {
    main: texture1,
    corner1: texture2,
    corner2: texture3,
    thumb: texture4
  },
  community: {
    main: community1,
    corner1: community2,
    corner2: community3,
    hero: community4,
    thumb: community5
  },

  // About section
  about: {
    profile: lewkin1,
    gallery: [lewkin2, lewkin3, lewkin4, lewkin5, lewkin6, lewkin7, lewkin8, lewkin9, lewkin10]
  },

  // Commencement section
  commencement: {
    main: commencement1,
    gallery: [commencement1, commencement2, commencement3, commencement4, commencement5]
  },

  // Marketing section
  marketing: {
    lewkin: [lewkin10, lewkin2]
  },

  // Navigation thumbs
  navigation: {
    about: spirit5,
    photography: serenity4,
    marketing: lewkin10,
    film: texture4,
    journalism: texture4,
    contact: community5
  },

  // Intro book
  introBook: introBookImages
};

// Function to replace image sources dynamically
export function loadImages() {
  // Update corner photos
  const cornerTopLeft = document.querySelector('.corner-photo--top-left img');
  const cornerBottomRight = document.querySelector('.corner-photo--bottom-right img');
  if (cornerTopLeft) cornerTopLeft.src = imageAssets.spirit.hero;
  if (cornerBottomRight) cornerBottomRight.src = imageAssets.community.hero;

  // Update about section profile photo
  const aboutProfileImg = document.querySelector('.about-image.main-photo img');
  if (aboutProfileImg) aboutProfileImg.src = imageAssets.about.profile;

  // Update about gallery
  const aboutGalleryImg = document.getElementById('current-gallery-image');
  if (aboutGalleryImg) aboutGalleryImg.src = imageAssets.about.gallery[0];

  // Update photography sections
  updateVibeSection('serenity', imageAssets.serenity);
  updateVibeSection('spirit', imageAssets.spirit);
  updateVibeSection('texture', imageAssets.texture);
  updateVibeSection('adventure', imageAssets.community);

  // Update commencement
  const commencementImg = document.getElementById('current-graduation-image');
  if (commencementImg) commencementImg.src = imageAssets.commencement.main;

  // Update marketing images
  updateMarketingImages();

  // Update navigation thumbs
  updateNavigationThumbs();
}

function updateVibeSection(vibe, images) {
  const section = document.querySelector(`[data-vibe="${vibe}"]`);
  if (!section) return;

  const mainImg = section.querySelector('.paper-expand img');
  const corner1 = section.querySelector('.vibe-corner-photo--top-left img');
  const corner2 = section.querySelector('.vibe-corner-photo--bottom-right img');

  if (mainImg) mainImg.src = images.main;
  if (corner1) corner1.src = images.corner1;
  if (corner2) corner2.src = images.corner2;
}

function updateMarketingImages() {
  const marketingImgs = document.querySelectorAll('#marketing img');
  marketingImgs.forEach((img, index) => {
    if (imageAssets.marketing.lewkin[index]) {
      img.src = imageAssets.marketing.lewkin[index];
    }
  });
}

function updateNavigationThumbs() {
  const navLinks = document.querySelectorAll('.menu-nav a[data-thumb]');
  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (href === '#about') link.setAttribute('data-thumb', imageAssets.navigation.about);
    if (href === '#photography') link.setAttribute('data-thumb', imageAssets.navigation.photography);
    if (href === '#marketing') link.setAttribute('data-thumb', imageAssets.navigation.marketing);
    if (href === '#film') link.setAttribute('data-thumb', imageAssets.navigation.film);
    if (href === '#journalism') link.setAttribute('data-thumb', imageAssets.navigation.journalism);
    if (href === '#contact') link.setAttribute('data-thumb', imageAssets.navigation.contact);
  });
}