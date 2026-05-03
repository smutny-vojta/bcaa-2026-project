# Tests

## Requirements
- MongoDB running (Docker recommended)
- `MONGODB_URI` set
- `MONGODB_DB` set to a test database (e.g. `bcaa_test`)

The test runner appends a worker suffix (e.g. `bcaa_test_0`) to keep tests isolated.

## Run
```bash
MONGODB_URI=mongodb://localhost:27017 MONGODB_DB=bcaa_test bun run test
```

If you use .env.test:
```bash
set -a
. ./.env.test
set +a
bun run test
```
