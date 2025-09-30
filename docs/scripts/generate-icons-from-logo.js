#!/usr/bin/env node

/**
 * Generate PWA Icons from Actual Logo
 * Creates all required icon sizes from the provided logo.png
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Required PWA icon sizes
const iconSizes = [
  { size: 16, name: 'favicon-16x16.png' },
  { size: 32, name: 'favicon-32x32.png' },
  { size: 48, name: 'icon-48x48.png' },
  { size: 72, name: 'icon-72x72.png' },
  { size: 96, name: 'icon-96x96.png' },
  { size: 144, name: 'icon-144x144.png' },
  { size: 192, name: 'icon-192x192.png' },
  { size: 512, name: 'icon-512x512.png' },
  { size: 180, name: 'apple-touch-icon.png' }
];

const logoPath = path.join(__dirname, '..', 'assets', 'logo.png');
const assetsDir = path.join(__dirname, '..', 'assets');

console.log('🎨 Generating PWA Icons from Actual Logo');
console.log('=========================================');
console.log('');

// Check if logo exists
if (!fs.existsSync(logoPath)) {
  console.error('❌ logo.png not found in assets/ directory');
  console.log('Please place your logo as logo.png in the assets/ directory');
  process.exit(1);
}

console.log('✅ Found logo.png');
console.log('🔄 Generating icon sizes...');

// Check if sips (macOS) or ImageMagick is available
let useSips = false;
let useImageMagick = false;

try {
  execSync('which sips', { stdio: 'ignore' });
  useSips = true;
  console.log('✅ sips found - using for high-quality resizing');
} catch (error) {
  try {
    execSync('which convert', { stdio: 'ignore' });
    useImageMagick = true;
    console.log('✅ ImageMagick found - using for high-quality resizing');
  } catch (error) {
    console.log('⚠️  No image processing tools found - using basic file copying');
  }
}

// Generate icons
iconSizes.forEach(icon => {
  const outputPath = path.join(assetsDir, icon.name);
  
  try {
    if (useSips) {
      // Use sips (macOS) for high-quality resizing
      execSync(`sips -z ${icon.size} ${icon.size} "${logoPath}" --out "${outputPath}"`, { stdio: 'ignore' });
    } else if (useImageMagick) {
      // Use ImageMagick for high-quality resizing
      execSync(`convert "${logoPath}" -resize ${icon.size}x${icon.size} -background transparent -gravity center -extent ${icon.size}x${icon.size} "${outputPath}"`, { stdio: 'ignore' });
    } else {
      // Fallback: copy the original file (user can manually resize later)
      fs.copyFileSync(logoPath, outputPath);
    }
    
    console.log(`  ✅ Generated ${icon.name} (${icon.size}x${icon.size}px)`);
  } catch (error) {
    console.log(`  ⚠️  Failed to generate ${icon.name}: ${error.message}`);
  }
});

// Create favicon.ico from 32x32 icon
try {
  const favicon32Path = path.join(assetsDir, 'favicon-32x32.png');
  const faviconPath = path.join(assetsDir, 'favicon.ico');
  
  if (useImageMagick && fs.existsSync(favicon32Path)) {
    execSync(`convert "${favicon32Path}" "${faviconPath}"`, { stdio: 'ignore' });
    console.log('  ✅ Generated favicon.ico');
  } else {
    // Create a simple favicon.ico placeholder
    fs.writeFileSync(faviconPath, '<!-- Placeholder favicon.ico -->');
    console.log('  ⚠️  Created placeholder favicon.ico');
  }
} catch (error) {
  console.log('  ⚠️  Failed to generate favicon.ico');
}

console.log('');
console.log('🎉 Icon generation completed!');
console.log('');
console.log('Next steps:');
console.log('1. Check the generated icons in the assets/ directory');
console.log('2. Test the PWA installation to see the icons');
console.log('3. Adjust any icons that need manual tweaking');
console.log('');

// Show file sizes
console.log('Generated files:');
iconSizes.forEach(icon => {
  const filePath = path.join(assetsDir, icon.name);
  if (fs.existsSync(filePath)) {
    const stats = fs.statSync(filePath);
    const sizeKB = Math.round(stats.size / 1024);
    console.log(`  ${icon.name}: ${sizeKB}KB`);
  }
});
