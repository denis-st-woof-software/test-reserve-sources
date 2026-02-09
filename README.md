# Test Reserve Sources

## Overview
This repository stores JSON datasets and validates them before commit.
The validation ensures each JSON item includes all required fields.

## Data Files
- `data/source.json`
- `data/asset.json`

## Validation
Validation rules are defined in:
- `scripts/json-validation.config.json`

The validation script:
- loads the config
- checks that each listed file exists
- ensures the root JSON is an array
- verifies every item contains all required fields

## Git Hooks
Husky runs the validation on `pre-commit` to prevent invalid data from being committed.

## Scripts
- `npm run validate:json` — run validation manually
- `npm run format` — format JS scripts

## Setup
```bash
npm install
```

This installs Husky and sets up the git hook.