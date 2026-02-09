const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const configPath = path.join(__dirname, 'json-validation.config.json');

const errors = [];

const readJson = (filePath) => {
  const raw = fs.readFileSync(filePath, 'utf8');
  try {
    return JSON.parse(raw);
  } catch (error) {
    throw new Error(`Invalid JSON: ${error.message}`);
  }
};

let config;
try {
  config = readJson(configPath);
} catch (error) {
  errors.push(`[config] ${error.message}`);
}

if (!config || typeof config !== 'object' || Array.isArray(config)) {
  errors.push('[config] Root must be an object');
} else if (!Array.isArray(config.files) || config.files.length === 0) {
  errors.push('[config] "files" must be a non-empty array');
} else {
  config.files.forEach((entry, index) => {
    if (!entry || typeof entry !== 'object' || Array.isArray(entry)) {
      errors.push(`[config] File entry #${index} must be an object`);
      return;
    }

    const { path: filePath, requiredFields } = entry;

    if (typeof filePath !== 'string' || filePath.trim().length === 0) {
      errors.push(`[config] File entry #${index} has invalid "path"`);
    }

    if (!Array.isArray(requiredFields) || requiredFields.length === 0) {
      errors.push(`[config] File entry #${index} has invalid "requiredFields"`);
      return;
    }

    const invalidField = requiredFields.find(
      (field) => typeof field !== 'string' || field.trim().length === 0,
    );

    if (invalidField) {
      errors.push(`[config] File entry #${index} has invalid field name`);
    }
  });
}

if (errors.length > 0) {
  console.error('JSON validation failed:');
  errors.forEach((message) => console.error(`- ${message}`));
  process.exit(1);
}

for (const { path: file, requiredFields } of config.files) {
  const filePath = path.join(rootDir, file);

  if (!fs.existsSync(filePath)) {
    errors.push(`[${file}] File not found`);
    continue;
  }

  let data;
  try {
    data = readJson(filePath);
  } catch (error) {
    errors.push(`[${file}] ${error.message}`);
    continue;
  }

  if (!Array.isArray(data)) {
    errors.push(`[${file}] Root JSON must be an array`);
    continue;
  }

  data.forEach((item, index) => {
    if (!item || typeof item !== 'object' || Array.isArray(item)) {
      errors.push(`[${file}] Item #${index} is not an object`);
      return;
    }

    const missing = requiredFields.filter(
      (field) => !Object.prototype.hasOwnProperty.call(item, field),
    );

    if (missing.length > 0) {
      const idHint = Object.prototype.hasOwnProperty.call(item, 'id') ? ` (id=${item.id})` : '';
      errors.push(`[${file}] Item #${index}${idHint} missing fields: ${missing.join(', ')}`);
    }
  });
}

if (errors.length > 0) {
  console.error('JSON validation failed:');
  errors.forEach((message) => console.error(`- ${message}`));
  process.exit(1);
}

console.log('JSON validation passed.');
