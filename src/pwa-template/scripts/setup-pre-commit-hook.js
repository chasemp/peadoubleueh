#!/usr/bin/env node
/**
 * Setup pre-commit hook to automatically build /docs before committing
 */

import { writeFileSync, chmodSync, existsSync, mkdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const hookPath = resolve(__dirname, '../.git/hooks/pre-commit');
const hooksDir = dirname(hookPath);

// Ensure hooks directory exists
if (!existsSync(hooksDir)) {
  mkdirSync(hooksDir, { recursive: true });
}

const hookContent = `#!/bin/bash
# Auto-generated pre-commit hook for PWA Template
# This hook ensures /docs is always built before committing

set -e

echo "🔨 Pre-commit: Building /docs from /src..."

# Build the project
npm run build

# Stage the built files
git add docs/

echo "✓ Pre-commit: /docs built and staged"
`;

writeFileSync(hookPath, hookContent, 'utf-8');
chmodSync(hookPath, 0o755);

console.log('✓ Pre-commit hook installed at .git/hooks/pre-commit');
console.log('  - Automatically builds /docs before each commit');
console.log('  - Ensures /src and /docs stay in sync');

