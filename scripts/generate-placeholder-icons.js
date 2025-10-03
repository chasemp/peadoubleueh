#!/usr/bin/env node

/**
 * Generate placeholder icon files for PWA
 * This creates simple placeholder PNGs using SVG -> PNG conversion
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.join(__dirname, '..', 'public', 'assets');

// Ensure assets directory exists
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Icon sizes needed
const iconSizes = [
  { name: 'favicon-16x16.png', size: 16 },
  { name: 'favicon-32x32.png', size: 32 },
  { name: 'icon-72x72.png', size: 72 },
  { name: 'icon-96x96.png', size: 96 },
  { name: 'icon-128x128.png', size: 128 },
  { name: 'icon-144x144.png', size: 144 },
  { name: 'icon-152x152.png', size: 152 },
  { name: 'icon-192x192.png', size: 192 },
  { name: 'icon-384x384.png', size: 384 },
  { name: 'icon-512x512.png', size: 512 },
  { name: 'maskable-icon-192x192.png', size: 192 },
  { name: 'maskable-icon-512x512.png', size: 512 }
];

console.log('🎨 Generating placeholder icons...');
console.log('');

// Generate SVG placeholders (browsers can use these temporarily)
for (const icon of iconSizes) {
  const svgContent = generateSVGIcon(icon.size, icon.name);
  const outputPath = path.join(publicDir, icon.name.replace('.png', '.svg'));
  
  fs.writeFileSync(outputPath, svgContent);
  console.log(`✅ Generated: ${icon.name.replace('.png', '.svg')} (${icon.size}x${icon.size})`);
}

console.log('');
console.log('⚠️  IMPORTANT: SVG placeholders created temporarily');
console.log('📝 You should replace these with proper PNG icons using one of these methods:');
console.log('');
console.log('Option 1: Use an online tool like https://www.favicon-generator.org/');
console.log('Option 2: Use https://realfavicongenerator.net/ (comprehensive)');
console.log('Option 3: Design custom icons and export as PNG');
console.log('');
console.log('Place the PNG files in: src/pwa-template/public/assets/');

function generateSVGIcon(size, name) {
  const isMaskable = name.includes('maskable');
  const padding = isMaskable ? size * 0.2 : 0;
  const innerSize = size - (padding * 2);
  
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <!-- Background -->
  <rect width="${size}" height="${size}" fill="#2196F3"/>
  
  <!-- Icon shape (PWA) -->
  <g transform="translate(${padding}, ${padding})">
    <text 
      x="${innerSize / 2}" 
      y="${innerSize / 2}" 
      font-family="Arial, sans-serif" 
      font-size="${innerSize * 0.3}" 
      font-weight="bold"
      fill="white" 
      text-anchor="middle" 
      dominant-baseline="middle">
      PWA
    </text>
    
    <!-- Size indicator -->
    <text 
      x="${innerSize / 2}" 
      y="${innerSize * 0.75}" 
      font-family="Arial, sans-serif" 
      font-size="${innerSize * 0.15}" 
      fill="rgba(255,255,255,0.8)" 
      text-anchor="middle" 
      dominant-baseline="middle">
      ${size}x${size}
    </text>
  </g>
  
  ${isMaskable ? `<circle cx="${size/2}" cy="${size/2}" r="${size*0.4}" fill="none" stroke="rgba(255,255,255,0.3)" stroke-width="2" stroke-dasharray="5,5"/>` : ''}
</svg>`;
}

console.log('✅ Icon generation complete!');

