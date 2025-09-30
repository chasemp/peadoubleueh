# PWA Icons - Pea's with Answers

This directory contains all the PWA icons generated from the actual logo.

## Generated Icons

### Favicons
- `favicon.ico` - Browser favicon (32x32 converted to ICO format)
- `favicon-16x16.png` - Small favicon for browser tabs
- `favicon-32x32.png` - Standard favicon for browser tabs

### PWA Icons
- `icon-48x48.png` - Small PWA icon
- `icon-72x72.png` - Medium PWA icon
- `icon-96x96.png` - Standard PWA icon
- `icon-144x144.png` - High-res PWA icon
- `icon-192x192.png` - Standard PWA icon (required)
- `icon-512x512.png` - Large PWA icon (required)

### Apple Touch Icon
- `apple-touch-icon.png` - iOS home screen icon (180x180)

### Source Logo
- `logo.png` - Original high-resolution logo (1.4MB)
- `logo.svg` - SVG placeholder (can be removed)

## Regenerating Icons

To regenerate all icons from the source logo:

```bash
cd docs
node scripts/generate-icons-from-logo.js
```

This script will:
1. Use macOS `sips` for high-quality image resizing
2. Fall back to ImageMagick if available
3. Generate all required PWA icon sizes
4. Create proper favicon.ico from 32x32 icon

## File Sizes

The generated icons are optimized for web use:
- Small icons (16x16, 32x32): ~1-2KB
- Medium icons (48x48, 72x72): ~2-4KB
- Large icons (96x96, 144x144): ~5-10KB
- Extra large icons (192x192, 512x512): ~15-95KB

## PWA Compliance

All icons meet PWA requirements:
- ✅ Square aspect ratio
- ✅ PNG format (except favicon.ico)
- ✅ Transparent backgrounds preserved
- ✅ High quality at all sizes
- ✅ Proper file naming convention
