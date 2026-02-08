# Fixed: ESM Runtime Import Extensions

## Problem

Node.js ESM requires explicit file extensions for relative imports at runtime. The TypeScript source files were using bare relative imports (e.g., `./policy`), which work during compilation but fail at runtime with:

```
ERR_MODULE_NOT_FOUND: Cannot find module 'dist/policy' imported from dist/check.js
```

## Solution

Added `.js` extensions to all relative imports in TypeScript source files. When TypeScript compiles to JavaScript, these imports will point to the correct compiled files.

## Files Modified

### 1. `src/pathEvaluator.test.ts`
```typescript
// Before
import { evaluatePaths, type PathDecision } from './pathEvaluator';
import type { Policy } from './policy';

// After
import { evaluatePaths, type PathDecision } from './pathEvaluator.js';
import type { Policy } from './policy.js';
```

### 2. `src/check.test.ts`
```typescript
// Before
import { checkStagedFiles } from './check';

// After
import { checkStagedFiles } from './check.js';
```

### 3. `src/check.ts`
```typescript
// Before
import { loadPolicy } from './policy';
import { evaluatePaths, type PathDecision } from './pathEvaluator';

// After
import { loadPolicy } from './policy.js';
import { evaluatePaths, type PathDecision } from './pathEvaluator.js';
```

### 4. `src/policy.test.ts`
```typescript
// Before
import { loadPolicy, type Policy } from './policy';

// After
import { loadPolicy, type Policy } from './policy.js';
```

### 5. `src/pathEvaluator.ts`
```typescript
// Before
import type { Policy } from './policy';

// After
import type { Policy } from './policy.js';
```

### 6. `src/cli.ts` (Already Correct)
```typescript
// Already has extension
import { checkStagedFiles } from './check.js';
```

## Summary of Changes

| File | Line Changes | Details |
|------|--------------|---------|
| `src/pathEvaluator.test.ts` | 2 | Added `.js` to `pathEvaluator` and `policy` imports |
| `src/check.test.ts` | 1 | Added `.js` to `check` import |
| `src/check.ts` | 2 | Added `.js` to `policy` and `pathEvaluator` imports |
| `src/policy.test.ts` | 1 | Added `.js` to `policy` import |
| `src/pathEvaluator.ts` | 1 | Added `.js` to `policy` import |
| `src/cli.ts` | 0 | Already correct |

**Total:** 5 files modified, 7 imports updated

## What Was NOT Changed

- ✅ External package imports (execa, js-yaml, minimatch, zod, commander, vitest) - no changes
- ✅ Type-only imports remain unchanged in functionality
- ✅ No behavioral changes, only module resolution fixes
- ✅ Test files unchanged in logic, only import paths

## Why This Works

When TypeScript compiles:
- `import { foo } from './policy.js'` compiles to `require('./policy.js')`
- Node.js ESM then resolves `./policy.js` to the compiled `dist/policy.js` ✅
- Before: `import { foo } from './policy'` compiled to `require('./policy')` which fails at runtime ❌

## Status

✅ All relative imports now have explicit `.js` extensions
✅ Ready for runtime execution
