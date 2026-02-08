# Code Review: Errors and Solutions

## Issues Found

### 1. ❌ `src/check.test.ts` - Mock Setup Issue (Lines 6-11)

**Problem:**
The `vi.mock()` call must happen at the top level BEFORE any other imports from the mocked module. Currently:
1. Line 4 imports from `./check` which depends on `execa`
2. Lines 6-11 try to mock `execa` (too late - already imported)
3. Line 11 imports the mocked `execa` (order is wrong)

```typescript
import { checkStagedFiles } from './check';  // ← Check imports execa (unmocked!)

// Mock execa
vi.mock('execa', () => ({
  execa: vi.fn(),
}));

import { execa } from 'execa';  // ← Too late to mock
```

**Solution:** Move `vi.mock()` call to the very top, before any imports that might use the mocked module.

```typescript
// Hoist mock to top level
vi.mock('execa', () => ({
  execa: vi.fn(),
}));

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import fs from 'fs';
import path from 'path';
import { checkStagedFiles } from './check';  // ← Now execa is mocked
import { execa } from 'execa';
```

---

### 2. ✅ `src/check.ts` - No Errors

**Status:** Code is correct
- Imports are proper ESM
- Function signature matches test expectations
- Error handling is appropriate
- No type issues

---

### 3. ✅ `src/pathEvaluator.test.ts` - No Errors

**Status:** Code is correct
- Imports use correct relative paths
- All test cases are properly structured
- Mock policy setup is valid
- No async/await issues (all tests are synchronous)

---

## Summary of Issues

| File | Issue | Severity | Fix |
|------|-------|----------|-----|
| `src/check.test.ts` | vi.mock() called after import | 🔴 Critical | Move mock to line 1 |
| `src/check.ts` | None | ✅ OK | No changes needed |
| `src/pathEvaluator.test.ts` | None | ✅ OK | No changes needed |

---

## Recommended Fix

**Change `src/check.test.ts` line order:**

Move lines 6-11 (the mock) to the very top, before line 1.

**Before:**
```typescript
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import fs from 'fs';
import path from 'path';
import { checkStagedFiles } from './check';

// Mock execa
vi.mock('execa', () => ({
  execa: vi.fn(),
}));

import { execa } from 'execa';
```

**After:**
```typescript
vi.mock('execa', () => ({
  execa: vi.fn(),
}));

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import fs from 'fs';
import path from 'path';
import { checkStagedFiles } from './check';
import { execa } from 'execa';
```

This ensures the mock is registered BEFORE `checkStagedFiles` is imported (which depends on execa).
