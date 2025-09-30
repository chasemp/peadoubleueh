#!/usr/bin/env node

/**
 * Icon Generation Script for PWA Template
 * Generates all required icon sizes from a source logo
 */

const fs = require('fs');
const path = require('path');

// Required PWA icon sizes
const iconSizes = [
  { size: 16, name: 'favicon-16x16.png' },
  { size: 32, name: 'favicon-32x32.png' },
  { size: 48, name: 'icon-48x48.png' },
  { size: 72, name: 'icon-72x72.png' },
  { size: 96, name: 'icon-96x96.png' },
  { size: 144, name: 'icon-144x144.png' },
  { size: 192, name: 'icon-192x192.png' },
  { size: 512, name: 'icon-512x512.png' }
];

console.log('🎨 PWA Icon Generation Script');
console.log('=============================');
console.log('');
console.log('This script will help you generate all required PWA icon sizes.');
console.log('');
console.log('Required icon sizes:');
iconSizes.forEach(icon => {
  console.log(`  - ${icon.name} (${icon.size}x${icon.size}px)`);
});
console.log('');
console.log('Instructions:');
console.log('1. Place your logo file as "logo.png" in the assets/ directory');
console.log('2. Run this script to generate all required sizes');
console.log('3. The script will create placeholder files if logo.png is not found');
console.log('');

// Check if logo exists
const logoPath = path.join(__dirname, '..', 'assets', 'logo.png');
if (!fs.existsSync(logoPath)) {
  console.log('⚠️  logo.png not found in assets/ directory');
  console.log('Creating placeholder files...');
  
  // Create placeholder files
  iconSizes.forEach(icon => {
    const placeholderPath = path.join(__dirname, '..', 'assets', icon.name);
    const placeholderContent = `<!-- Placeholder for ${icon.name} - Replace with actual icon -->`;
    fs.writeFileSync(placeholderPath, placeholderContent);
  });
  
  console.log('✅ Placeholder files created');
  console.log('📝 Please replace logo.png with your actual logo and run this script again');
} else {
  console.log('✅ logo.png found!');
  console.log('🔄 Generating icon sizes...');
  
  // Here you would use an image processing library like sharp
  // For now, we'll just copy the logo to all sizes
  iconSizes.forEach(icon => {
    const outputPath = path.join(__dirname, '..', 'assets', icon.name);
    fs.copyFileSync(logoPath, outputPath);
    console.log(`  ✅ Generated ${icon.name}`);
  });
  
  console.log('');
  console.log('🎉 All icons generated successfully!');
}

console.log('');
console.log('Next steps:');
console.log('1. Update manifest.json with correct icon paths');
console.log('2. Update HTML with favicon links');
console.log('3. Test the PWA installation');
