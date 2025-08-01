# Fix Vibe Check Animation and Color Issues

## Issues that need to be fixed:

### 1. Text Animation Problems
- **Current Issue**: VIBE CHECK text animation keeps playing when scrolling away and back
- **Expected Behavior**: Animation should play ONCE when first scrolled into view, then never again
- **Files involved**: `src/js/vibeCheck.js`
- **What's broken**: IntersectionObserver is not properly disconnecting or the animation state is not being preserved

### 2. Background Color Cycling Wrong Area  
- **Current Issue**: Color changes are happening in a separate area below where they should be
- **Expected Behavior**: Colors should cycle as follows:
  - Start: **White** (body default)
  - When VIBE CHECK title comes into view: **Black**
  - When serenity section comes into view: **Mint green** (#B8E6E1)
  - When spirit section comes into view: **Pink** (#F5C2D6)
  - When texture section comes into view: **Peach** (#F5D49C)
  - When adventure section comes into view: **Coral** (#F2B8B8)
- **Files involved**: `src/js/vibeCornerReveal.js`
- **What's broken**: Observer is watching wrong elements or timing is off

### 3. Animation State Persistence
- **Current Issue**: Text animation state is not persisting when leaving and returning to section
- **Expected Behavior**: Once animated, text should stay revealed permanently
- **Root cause**: CSS classes being removed or observer re-triggering

## Technical Details:

### Current Implementation Issues:
1. Multiple intersection observers conflicting with each other
2. Animation state not being stored globally/persistently
3. Color observers watching wrong DOM elements
4. CSS transitions interfering with animation states

### Suggested Fix Approach:
1. Use a global flag to track if VIBE CHECK animation has ever been triggered
2. Store this flag in localStorage or a module-level variable that persists
3. Only create the intersection observer if the animation has never been triggered
4. For colors, ensure observers are watching the correct sections (.vibe-check-title for black, .vibe-item elements for colors)
5. Use proper CSS specificity to ensure color transitions work correctly

### Files to Focus On:
- `src/js/vibeCheck.js` - Text animation logic
- `src/js/vibeCornerReveal.js` - Color transition logic  
- `src/styles/styles.scss` - CSS animation states and transitions

### Key Requirements:
- Animation plays once and only once
- Colors change smoothly: white → black → mint → pink → peach → coral
- Text stays revealed after first animation
- No conflicts between multiple observers