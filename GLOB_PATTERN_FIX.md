# Fix for Failing Complex Glob Patterns Test

## Problem

Test `evaluatePaths > edge cases > should handle complex glob patterns` was failing with:
```
expected 'ALLOW' to be 'NEEDS_APPROVAL'
```

## Root Cause

The glob pattern `src/**/test/**` was incorrect for the test intent.

**Pattern `src/**/test/**` matches:**
- Any file under a directory literally named `test`
- Examples:
  - ✅ `src/test/setup.ts` (matches!)
  - ✅ `src/foo/test/bar.js` (matches!)
  - ❌ `src/components/Button.test.tsx` (does NOT match - "test" is in filename, not directory)

**Test Expected:**
- `src/components/Button.test.tsx` → NEEDS_APPROVAL
- `src/test/setup.ts` → ALLOW

But the pattern was matching the opposite behavior because `src/test/setup.ts` matched the pattern when it shouldn't.

## Solution

Changed the approval pattern from `src/**/test/**` to `src/**/*.test.*`

**Pattern `src/**/*.test.*` matches:**
- Any file with `.test.` in the filename
- Examples:
  - ✅ `src/components/Button.test.tsx` (has `.test.` in name)
  - ✅ `src/foo/MyComponent.test.ts` (has `.test.` in name)
  - ❌ `src/test/setup.ts` (no `.test.` in name)

## Changes Made

| File | Line | Change |
|------|------|--------|
| `src/pathEvaluator.test.ts` | 171 | `src/**/test/**` → `src/**/*.test.*` |
| `src/pathEvaluator.test.ts` | 181 | Updated comment: `test/**` → `*.test.*` |
| `src/pathEvaluator.test.ts` | 182 | Updated comment: `test/**` → `*.test.*` |

## Why This Fix Is Correct

The test case title is "should handle complex glob patterns" and validates:

1. **Brace expansion:** `**/*.{key,pem,pfx}` correctly matches `.key`, `.pem`, `.pfx` files
   - ✅ `id_rsa.key` matches `**/*.{key,pem,pfx}` → DENY
   - ✅ `cert.pem` matches `**/*.{key,pem,pfx}` → DENY

2. **Glob with dot patterns:** `src/**/*.test.*` correctly matches test files under src
   - ✅ `src/components/Button.test.tsx` matches `src/**/*.test.*` → NEEDS_APPROVAL
   - ✅ `src/test/setup.ts` does NOT match `src/**/*.test.*` → ALLOW

This demonstrates proper use of:
- `**` to match any directory depth
- `*` to match any filename component
- `.` literal dots in patterns
- `{}` for alternative extensions

## Test Status

✅ All 15 tests in `pathEvaluator.test.ts` now pass
