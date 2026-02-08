# Fixed: execa Import Error in check.test.ts

## The Problem

After `vi.mock('execa', ...)`, you cannot simply cast the imported `execa` as `any` and call mock methods on it. The issue is that Vitest needs to know you're accessing the mock, not the real module.

**Before (❌ Incorrect):**
```typescript
vi.mock('execa', () => ({
  execa: vi.fn(),
}));

import { execa } from 'execa';

// In tests:
const mockExeca = execa as any;  // ❌ TypeScript and Vitest don't recognize this as a mock
mockExeca.mockResolvedValue({...});
```

This would cause:
- TypeScript errors (real `execa` doesn't have `mockResolvedValue`)
- Vitest not recognizing the mock properly

## The Solution

Use `vi.mocked()` to explicitly tell Vitest and TypeScript that the imported module is mocked:

**After (✅ Correct):**
```typescript
vi.mock('execa', () => ({
  execa: vi.fn(),
}));

import { execa } from 'execa';

// In tests:
vi.mocked(execa).mockResolvedValue({...});
```

## What `vi.mocked()` Does

- Tells Vitest: "This is a mocked module"
- Tells TypeScript: "This has all the mock methods (mockResolvedValue, mockRejectedValue, etc.)"
- Provides proper type information for the mock

## Changes Made

All test cases in `src/check.test.ts` updated:

```typescript
// Pattern applied to all 7 test cases:

// Before:
const mockExeca = execa as any;
mockExeca.mockResolvedValue({...});

// After:
vi.mocked(execa).mockResolvedValue({...} as any);
```

## Files Changed

| File | Tests Updated | Method |
|------|----------------|--------|
| `src/check.test.ts` | 7 tests | Changed from `execa as any` to `vi.mocked(execa)` |

## Example

```typescript
// Test: should return success when no files are blocked

vi.mocked(execa).mockResolvedValue({
  stdout: 'README.md\ndocs/guide.md\n',
} as any);

const result = await checkStagedFiles(testDir);
expect(result.success).toBe(true);
```

## Why This Matters

- ✅ Proper Vitest mock integration
- ✅ Correct TypeScript type information
- ✅ Explicit intent (readers see this is a mock)
- ✅ No TypeScript `as any` casting needed on the mock access
- ✅ IDE autocomplete works for mock methods

## Status

✅ All test cases properly configured to use `vi.mocked(execa)`
