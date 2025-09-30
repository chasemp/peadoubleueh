#!/usr/bin/env node

/**
 * Build script for PWA Template
 * Injects build information and handles asset optimization
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Build configuration
const config = {
  currentDir: process.cwd(),
  version: process.env.npm_package_version || '1.0.0',
  buildTime: new Date().toISOString(),
  commit: process.env.GITHUB_SHA || 'local',
  branch: process.env.GITHUB_REF_NAME || 'local'
};

console.log('🔨 Building PWA Template...');
console.log(`Version: ${config.version}`);
console.log(`Build Time: ${config.buildTime}`);
console.log(`Commit: ${config.commit}`);

// Ensure current directory exists
if (!fs.existsSync(config.currentDir)) {
  fs.mkdirSync(config.currentDir, { recursive: true });
}

// Read source HTML
const htmlPath = path.join(config.currentDir, 'index.html');
if (!fs.existsSync(htmlPath)) {
  console.error('❌ Source HTML not found:', htmlPath);
  process.exit(1);
}

let html = fs.readFileSync(htmlPath, 'utf8');

// Generate content hashes for cache busting
function generateContentHash(filePath) {
  if (!fs.existsSync(filePath)) {
    return 'missing';
  }
  const content = fs.readFileSync(filePath);
  return crypto.createHash('md5').update(content).digest('hex').substring(0, 8);
}

// Generate hashes for CSS and JS files
const cssHash = generateContentHash(path.join(config.currentDir, 'css/styles.css'));
const jsHash = generateContentHash(path.join(config.currentDir, 'js/PWAApp.js'));

// Inject build information
const buildInfo = {
  version: config.version,
  buildTime: config.buildTime,
  commit: config.commit,
  branch: config.branch,
  cssHash: cssHash,
  jsHash: jsHash
};

// Replace placeholders in HTML
html = html
  .replace(/\{\{VERSION\}\}/g, buildInfo.version)
  .replace(/\{\{BUILD_TIME\}\}/g, buildInfo.buildTime)
  .replace(/\{\{COMMIT\}\}/g, buildInfo.commit)
  .replace(/\{\{BRANCH\}\}/g, buildInfo.branch)
  .replace(/styles\.css/g, `styles.css?v=${cssHash}`)
  .replace(/PWAApp\.js/g, `PWAApp.js?v=${jsHash}`);

// Write built HTML
const outputPath = path.join(config.currentDir, 'index.html');
fs.writeFileSync(outputPath, html);

// Generate build info file
const buildInfoPath = path.join(config.currentDir, 'build-info.json');
fs.writeFileSync(buildInfoPath, JSON.stringify(buildInfo, null, 2));

// Generate build info text file
const buildInfoTextPath = path.join(config.currentDir, 'build-info.txt');
const buildInfoText = `PWA Template Build Info
=======================
Version: ${buildInfo.version}
Build Time: ${buildInfo.buildTime}
Commit: ${buildInfo.commit}
Branch: ${buildInfo.branch}
CSS Hash: ${buildInfo.cssHash}
JS Hash: ${buildInfo.jsHash}
`;

fs.writeFileSync(buildInfoTextPath, buildInfoText);

console.log('✅ HTML built successfully');
console.log(`Output: ${outputPath}`);
console.log(`CSS Hash: ${cssHash}`);
console.log(`JS Hash: ${jsHash}`);
console.log('🎉 Build completed!');
