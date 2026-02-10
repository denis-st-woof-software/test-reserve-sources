# Test Reserve Sources

## Quick Start
```bash
yarn install
```

This installs Husky and sets up the git hook.

## Overview
This repository stores JSON datasets and validates them before commit.
The validation ensures each JSON item includes all required fields.

These files are part of the
`woof-software/compound-reserve-growth-backend` repository and represent
seed data used to initialize the database before starting data collection.

## Data Files
### `data/source.json`
Each item defines a reserve source (market or contract) to track:
- `id`: unique source identifier
- `address`: on-chain contract address
- `market`: market label (nullable)
- `algorithm`: data collection strategy identifier
- `startBlock`: first block to start scanning
- `endBlock`: last block to scan (nullable)
- `chainId`: EVM chain ID
- `assetId`: foreign key to `asset.json`
- `type`: human-readable source type

### `data/asset.json`
Each item defines a tracked asset:
- `id`: unique asset identifier
- `address`: token contract address (or zero/native address)
- `decimals`: token decimals
- `symbol`: asset symbol
- `chainId`: EVM chain ID
- `type`: asset category

## Validation
Validation rules are defined in:
- `scripts/json-validation.config.json`

The validation script:
- loads the config
- checks that each listed file exists
- ensures the root JSON is an array
- verifies every item contains all required fields
- validates field types defined in the config
- validates that `address` values are valid EVM addresses

Supported field types:
- `string`
- `number`
- `boolean`
- `address` (EVM address validated with ethers)
- `nullableString`
- `nullableNumber`
- `nullableAddress`

## Git Hooks
Husky runs the validation on `pre-commit` to prevent invalid data from being committed.

## Scripts
- `yarn validate:json` — run validation manually
- `yarn format` — format JS scripts
