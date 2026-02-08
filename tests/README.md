# Ghost Apex Backend Tests

This directory contains property-based tests and unit tests for the Ghost Apex Operations Portal backend.

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the project root with your Supabase credentials:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

You can find these credentials in your Supabase project settings under **API**.

**Important:** The `SUPABASE_SERVICE_ROLE_KEY` is required for tests to bypass Row-Level Security (RLS) policies and perform admin operations.

### 3. Apply Database Migrations

Ensure the database schema has been created by applying the migration:

```bash
# If using Supabase CLI
supabase db push

# Or apply the migration manually in your Supabase SQL editor
# Run the contents of: supabase/migrations/001_initial_schema.sql
```

## Running Tests

### Run all tests
```bash
npm test
```

### Run tests in watch mode
```bash
npm test -- --watch
```

### Run tests with UI
```bash
npm run test:ui
```

### Run tests once (CI mode)
```bash
npm run test:run
```

**Note:** If you encounter PostCSS/Tailwind errors when running tests, temporarily rename `postcss.config.js` to `postcss.config.js.bak` before running tests, then rename it back afterwards:

```bash
# Before running tests
Rename-Item -Path "postcss.config.js" -NewName "postcss.config.js.bak"

# Run tests
npm run test:run

# After tests complete
Rename-Item -Path "postcss.config.js.bak" -NewName "postcss.config.js"
```

## Test Structure

### Property-Based Tests

Property-based tests use `fast-check` to generate random test data and verify that properties hold across all inputs.

- **Location:** `tests/database/`
- **Framework:** Vitest + fast-check
- **Iterations:** Each property test runs 10-100 times with different random data

### Test Files

- `tests/database/unique-constraints.test.js` - Tests database unique constraint enforcement (Property 1)

## Property Test Format

Each property test includes:
1. **Feature tag:** `// Feature: ghost-apex-backend, Property X: Description`
2. **Validation tag:** `// **Validates: Requirements X.Y**`
3. **Property assertion:** Using `fc.assert()` with `fc.asyncProperty()`
4. **Cleanup:** Proper cleanup of test data in `afterAll()` and `finally` blocks

## Troubleshooting

### "Missing required environment variables"
- Ensure `.env` file exists in project root
- Verify all three Supabase credentials are set correctly

### "relation does not exist"
- Apply the database migration: `supabase/migrations/001_initial_schema.sql`
- Verify you're connected to the correct Supabase project

### "permission denied"
- Ensure you're using the `SUPABASE_SERVICE_ROLE_KEY` (not the anon key) for tests
- The service role key bypasses RLS policies for testing

### Tests timing out
- Increase timeout in `vitest.config.js` if needed
- Check your internet connection to Supabase
- Verify Supabase project is not paused
