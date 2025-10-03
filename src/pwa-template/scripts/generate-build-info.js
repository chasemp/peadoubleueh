#!/usr/bin/env node
/**
 * Generate build metadata files for production builds
 * Creates /docs/build and /docs/build-info.json
 */

import { writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const docsDir = resolve(__dirname, '../../../docs');
const buildDate = new Date().toISOString();
const buildVersion = `build-${Date.now()}`;

// Create simple version file
const versionContent = `${buildVersion}\n`;
writeFileSync(resolve(docsDir, 'build'), versionContent, 'utf-8');

// Create detailed build info JSON
const buildInfo = {
  version: buildVersion,
  timestamp: buildDate,
  node_version: process.version,
  platform: process.platform
};
writeFileSync(resolve(docsDir, 'build-info.json'), JSON.stringify(buildInfo, null, 2), 'utf-8');

console.log(`✓ Build metadata generated: ${buildVersion}`);
console.log(`  - /docs/build`);
console.log(`  - /docs/build-info.json`);

