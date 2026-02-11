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

The validator (`scripts/validate-json.js`) runs as a staged pipeline with a shared context. Config rules live in `scripts/json-validation.config.json`.

**What it does:** loads config, validates each listed file (exists, root is array, items have required fields and correct types), normalizes address fields to checksummed EVM format, then reports results.

**Execution behavior:**
- Config errors are fail-fast (script exits before file validation).
- File/item errors are accumulated and printed once at the end.
- Normalization runs only when validation succeeds.

**Supported field types:** `string`, `number`, `boolean`, `address`, `nullableString`, `nullableNumber`, `nullableAddress`.

- `address` — EVM address validated with ethers; normalized to checksum format in memory.
- `nullableAddress` — same as `address`, but `null` is allowed; non-null values are checksummed.

Normalization uses ethers `getAddress` and modifies in-memory data only (no files written to disk).

**Run:** `yarn validate:json`

**Extending:** Add a new step to the `steps` array in `validate-json.js`; access `ctx.config`, `ctx.loadedFiles`, and `ctx.errors`. To support new types, add a validator to `typeValidators` and include the type in `allowedTypes`.

## Git Hooks
Husky runs the validation on `pre-commit` to prevent invalid data from being committed.

## Scripts
- `yarn validate:json` — run validation manually
- `yarn format` — format JS scripts
