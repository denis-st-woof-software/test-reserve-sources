const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const huskyDir = path.join(rootDir, '.husky');
const hookPath = path.join(huskyDir, 'pre-commit');

const hookContent = `#!/usr/bin/env sh
yarn run validate:json
`;

fs.mkdirSync(huskyDir, { recursive: true });

if (!fs.existsSync(hookPath)) {
  fs.writeFileSync(hookPath, hookContent, 'utf8');
}

fs.chmodSync(hookPath, 0o755);
