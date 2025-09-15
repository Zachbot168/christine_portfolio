# Christine Shin Portfolio

A modern, responsive portfolio website showcasing Christine Shin's work in photography, journalism, marketing, and film.

## Features

- ✨ **Smooth Page Transitions** - Barba.js powered navigation
- 📱 **Fully Responsive** - Optimized for all screen sizes
- 🎨 **Interactive Animations** - GSAP powered animations and paintbrush effects
- 📸 **Photo Galleries** - Interactive galleries with tape decorations
- 🎬 **Video Integration** - YouTube embeds for film work
- ⚡ **Performance Optimized** - Built with Vite for fast loading

## Tech Stack

- **Frontend**: Vanilla JS, HTML5, SCSS
- **Build Tool**: Vite
- **Animations**: GSAP, Custom CSS animations
- **Page Transitions**: Barba.js
- **Deployment**: Netlify

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Deployment

This site is optimized for Netlify deployment:

1. **Connect to Netlify**: Link your GitHub repository to Netlify
2. **Build Settings**:
   - Build command: `npm run build`
   - Publish directory: `dist`
3. **Deploy**: Netlify will automatically build and deploy

The `netlify.toml` configuration handles:
- Clean URLs (removes .html extensions)
- Asset caching optimization
- Security headers
- Proper routing

## Project Structure

```
├── src/
│   ├── js/           # JavaScript modules
│   └── styles/       # SCSS files
├── content 2/        # Images and media assets
├── *.html           # Page templates
├── vite.config.js   # Build configuration
└── netlify.toml     # Netlify deployment config
```

## Pages

- **Home** (`index.html`) - Hero landing with 3D book animation
- **About** (`about.html`) - Personal introduction and background
- **Work** (`work.html`) - Portfolio categories overview
- **Vibes** (`vibes.html`) - Photography category hub
- **Journalism** (`journalism.html`) - Written work and articles
- **Marketing** (`marketing.html`) - Marketing campaign examples
- **Film** (`film.html`) - Video portfolio with YouTube embeds
- **Contact** (`contact.html`) - Contact information and links

### Photography Galleries
- **Texture** - Architectural and detail photography
- **Serenity** - Peaceful and contemplative moments
- **Spirit** - Human energy and portraits
- **Adventure** - Community and exploration
- **Commencement** - Graduation and ceremony photography

All galleries feature interactive navigation, responsive layouts, and custom animations.