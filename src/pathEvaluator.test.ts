import { describe, it, expect } from 'vitest';
import { evaluatePaths, type PathDecision } from './pathEvaluator.js';
import type { Policy } from './policy.js';

describe('evaluatePaths', () => {
  const mockPolicy: Policy = {
    deny_paths: ['.env', '*.key', 'secrets/**', '.aws/credentials'],
    approval_required_paths: ['src/**', 'package.json', 'tsconfig.json', '.github/**'],
  };

  describe('DENY decisions', () => {
    it('should deny exact file matches', () => {
      const results = evaluatePaths(['.env', '.aws/credentials'], mockPolicy);

      expect(results).toEqual([
        {
          path: '.env',
          decision: 'DENY',
          reason: 'Matches deny pattern: .env',
        },
        {
          path: '.aws/credentials',
          decision: 'DENY',
          reason: 'Matches deny pattern: .aws/credentials',
        },
      ]);
    });

    it('should deny glob pattern matches', () => {
      const results = evaluatePaths(
        ['config.key', 'private.key', 'id_rsa.key'],
        mockPolicy
      );

      expect(results).toHaveLength(3);
      expect(results.every((r) => r.decision === 'DENY')).toBe(true);
      expect(results[0].reason).toContain('*.key');
    });

    it('should deny nested directory matches', () => {
      const results = evaluatePaths(['secrets/api-key.txt', 'secrets/db/password'], mockPolicy);

      expect(results).toHaveLength(2);
      expect(results.every((r) => r.decision === 'DENY')).toBe(true);
      expect(results.every((r) => r.reason.includes('secrets/**'))).toBe(true);
    });

    it('should prioritize deny over approval', () => {
      // If a path somehow matched both patterns, deny takes priority
      const restrictivePolicy: Policy = {
        deny_paths: ['src/secrets/**'],
        approval_required_paths: ['src/**'],
      };

      const results = evaluatePaths(['src/secrets/config.yaml'], restrictivePolicy);

      expect(results[0].decision).toBe('DENY');
      expect(results[0].reason).toContain('src/secrets/**');
    });
  });

  describe('NEEDS_APPROVAL decisions', () => {
    it('should require approval for exact file matches', () => {
      const results = evaluatePaths(['package.json', 'tsconfig.json'], mockPolicy);

      expect(results).toEqual([
        {
          path: 'package.json',
          decision: 'NEEDS_APPROVAL',
          reason: 'Matches approval-required pattern: package.json',
        },
        {
          path: 'tsconfig.json',
          decision: 'NEEDS_APPROVAL',
          reason: 'Matches approval-required pattern: tsconfig.json',
        },
      ]);
    });

    it('should require approval for glob pattern matches', () => {
      const results = evaluatePaths(
        ['src/index.ts', 'src/components/Button.tsx', 'src/utils/helpers.ts'],
        mockPolicy
      );

      expect(results).toHaveLength(3);
      expect(results.every((r) => r.decision === 'NEEDS_APPROVAL')).toBe(true);
      expect(results.every((r) => r.reason.includes('src/**'))).toBe(true);
    });

    it('should require approval for nested directories', () => {
      const results = evaluatePaths(['.github/workflows/ci.yml', '.github/CODEOWNERS'], mockPolicy);

      expect(results).toHaveLength(2);
      expect(results.every((r) => r.decision === 'NEEDS_APPROVAL')).toBe(true);
    });
  });

  describe('ALLOW decisions', () => {
    it('should allow paths not matching any pattern', () => {
      const results = evaluatePaths(
        ['README.md', 'docs/guide.md', 'public/index.html'],
        mockPolicy
      );

      expect(results).toHaveLength(3);
      expect(results.every((r) => r.decision === 'ALLOW')).toBe(true);
      expect(results.every((r) => r.reason === 'No restrictions apply')).toBe(true);
    });

    it('should allow deeply nested files', () => {
      const results = evaluatePaths(['dist/index.js', 'build/output/bundle.js'], mockPolicy);

      expect(results.every((r) => r.decision === 'ALLOW')).toBe(true);
    });
  });

  describe('edge cases', () => {
    it('should handle empty paths array', () => {
      const results = evaluatePaths([], mockPolicy);

      expect(results).toEqual([]);
    });

    it('should handle empty policy', () => {
      const emptyPolicy: Policy = {
        deny_paths: [],
        approval_required_paths: [],
      };

      const results = evaluatePaths(['anything.txt', '.env', 'src/index.ts'], emptyPolicy);

      expect(results).toHaveLength(3);
      expect(results.every((r) => r.decision === 'ALLOW')).toBe(true);
    });

    it('should match dotfiles with dot: true option', () => {
      const policy: Policy = {
        deny_paths: ['.*'],
        approval_required_paths: [],
      };

      const results = evaluatePaths(['.env', '.gitignore', '.hidden'], policy);

      expect(results.every((r) => r.decision === 'DENY')).toBe(true);
    });

    it('should handle case-sensitive matching', () => {
      const policy: Policy = {
        deny_paths: ['.ENV'],
        approval_required_paths: [],
      };

      const results = evaluatePaths(['.env', '.ENV'], policy);

      expect(results[0].decision).toBe('ALLOW'); // .env doesn't match .ENV
      expect(results[1].decision).toBe('DENY'); // .ENV matches .ENV
    });

    it('should handle multiple patterns for same path', () => {
      const results = evaluatePaths(['src/index.ts'], mockPolicy);

      expect(results).toHaveLength(1);
      expect(results[0].decision).toBe('NEEDS_APPROVAL');
      expect(results[0].reason).toContain('src/**');
    });

    it('should handle complex glob patterns', () => {
      const policy: Policy = {
        deny_paths: ['**/*.{key,pem,pfx}'],
        approval_required_paths: ['src/**/*.test.*'],
      };

      const results = evaluatePaths(
        ['id_rsa.key', 'cert.pem', 'src/components/Button.test.tsx', 'src/test/setup.ts'],
        policy
      );

      expect(results[0].decision).toBe('DENY'); // .key
      expect(results[1].decision).toBe('DENY'); // .pem
      expect(results[2].decision).toBe('NEEDS_APPROVAL'); // *.test.*
      expect(results[3].decision).toBe('ALLOW'); // doesn't match *.test.*
    });
  });
});
