const fs = require('fs');
const path = require('path');
const { isAddress } = require('ethers');

const rootDir = path.resolve(__dirname, '..');
const configPath = path.join(__dirname, 'json-validation.config.json');

const errors = [];

const isEvmAddress = (value) => typeof value === 'string' && isAddress(value);

const typeValidators = {
  string: (value) => typeof value === 'string',
  number: (value) => typeof value === 'number' && Number.isFinite(value),
  boolean: (value) => typeof value === 'boolean',
  address: (value) => isEvmAddress(value),
  nullableString: (value) => value === null || typeof value === 'string',
  nullableNumber: (value) =>
    value === null || (typeof value === 'number' && Number.isFinite(value)),
  nullableAddress: (value) => value === null || isEvmAddress(value),
};

const allowedTypes = new Set(Object.keys(typeValidators));

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

    const { path: filePath, fields } = entry;

    if (typeof filePath !== 'string' || filePath.trim().length === 0) {
      errors.push(`[config] File entry #${index} has invalid "path"`);
    }

    if (!Array.isArray(fields) || fields.length === 0) {
      errors.push(`[config] File entry #${index} has invalid "fields"`);
      return;
    }

    const fieldNames = new Set();
    fields.forEach((field, fieldIndex) => {
      if (!field || typeof field !== 'object' || Array.isArray(field)) {
        errors.push(`[config] File entry #${index} field #${fieldIndex} must be an object`);
        return;
      }

      const { name, type } = field;

      if (typeof name !== 'string' || name.trim().length === 0) {
        errors.push(`[config] File entry #${index} field #${fieldIndex} has invalid "name"`);
      } else if (fieldNames.has(name)) {
        errors.push(`[config] File entry #${index} has duplicate field name "${name}"`);
      } else {
        fieldNames.add(name);
      }

      if (typeof type !== 'string' || !allowedTypes.has(type)) {
        errors.push(`[config] File entry #${index} field #${fieldIndex} has invalid "type"`);
      }
    });
  });
}

if (errors.length > 0) {
  console.error('JSON validation failed:');
  errors.forEach((message) => console.error(`- ${message}`));
  process.exit(1);
}

for (const { path: file, fields } of config.files) {
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

    const missing = fields
      .map((field) => field.name)
      .filter((fieldName) => !Object.prototype.hasOwnProperty.call(item, fieldName));

    if (missing.length > 0) {
      const idHint = Object.prototype.hasOwnProperty.call(item, 'id') ? ` (id=${item.id})` : '';
      errors.push(`[${file}] Item #${index}${idHint} missing fields: ${missing.join(', ')}`);
      return;
    }

    fields.forEach((field) => {
      const value = item[field.name];
      const validator = typeValidators[field.type];

      if (!validator(value)) {
        const idHint = Object.prototype.hasOwnProperty.call(item, 'id') ? ` (id=${item.id})` : '';
        errors.push(
          `[${file}] Item #${index}${idHint} invalid "${field.name}" type (expected ${field.type})`,
        );
      }
    });
  });
}

if (errors.length > 0) {
  console.error('JSON validation failed:');
  errors.forEach((message) => console.error(`- ${message}`));
  process.exit(1);
}

console.log('JSON validation passed.');
