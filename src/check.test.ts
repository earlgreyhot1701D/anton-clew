vi.mock('execa', () => ({
  execa: vi.fn(),
}));

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import fs from 'fs';
import path from 'path';
import { checkStagedFiles } from './check.js';
import { execa } from 'execa';

const testDir = path.join(process.cwd(), '.test-check');

describe('checkStagedFiles', () => {
  beforeEach(() => {
    if (!fs.existsSync(testDir)) {
      fs.mkdirSync(testDir, { recursive: true });
    }
  });

  afterEach(() => {
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true });
    }
    vi.clearAllMocks();
  });

  it('should return success when no files are blocked', async () => {
    // Create policy
    const policyContent = `
deny_paths:
  - .env
approval_required_paths:
  - src/**
`;
    fs.writeFileSync(path.join(testDir, '.agentpolicy.yaml'), policyContent);

    // Mock git diff output with allowed files
    vi.mocked(execa).mockResolvedValue({
      stdout: 'README.md\ndocs/guide.md\n',
    } as any);

    const result = await checkStagedFiles(testDir);

    expect(result.success).toBe(true);
    expect(result.stagedFiles).toEqual(['README.md', 'docs/guide.md']);
    expect(result.blocked).toEqual([]);
    expect(result.evaluations).toHaveLength(2);
    expect(result.evaluations.every((e) => e.decision === 'ALLOW')).toBe(true);
  });

  it('should detect denied files and return failure', async () => {
    const policyContent = `
deny_paths:
  - .env
  - "*.key"
approval_required_paths: []
`;
    fs.writeFileSync(path.join(testDir, '.agentpolicy.yaml'), policyContent);

    vi.mocked(execa).mockResolvedValue({
      stdout: '.env\nconfig.key\nREADME.md\n',
    } as any);

    const result = await checkStagedFiles(testDir);

    expect(result.success).toBe(false);
    expect(result.blocked).toHaveLength(2);
    expect(result.blocked[0].path).toBe('.env');
    expect(result.blocked[0].decision).toBe('DENY');
    expect(result.blocked[1].path).toBe('config.key');
    expect(result.blocked[1].decision).toBe('DENY');
  });

  it('should detect approval-required files and return failure', async () => {
    const policyContent = `
deny_paths: []
approval_required_paths:
  - src/**
  - package.json
`;
    fs.writeFileSync(path.join(testDir, '.agentpolicy.yaml'), policyContent);

    vi.mocked(execa).mockResolvedValue({
      stdout: 'src/index.ts\npackage.json\nREADME.md\n',
    } as any);

    const result = await checkStagedFiles(testDir);

    expect(result.success).toBe(false);
    expect(result.blocked).toHaveLength(2);
    expect(result.blocked[0].decision).toBe('NEEDS_APPROVAL');
    expect(result.blocked[1].decision).toBe('NEEDS_APPROVAL');
  });

  it('should handle mixed decisions (allow, deny, approval)', async () => {
    const policyContent = `
deny_paths:
  - .env
approval_required_paths:
  - src/**
`;
    fs.writeFileSync(path.join(testDir, '.agentpolicy.yaml'), policyContent);

    vi.mocked(execa).mockResolvedValue({
      stdout: '.env\nsrc/index.ts\nREADME.md\n',
    } as any);

    const result = await checkStagedFiles(testDir);

    expect(result.success).toBe(false);
    expect(result.stagedFiles).toHaveLength(3);
    expect(result.evaluations).toHaveLength(3);
    expect(result.blocked).toHaveLength(2);

    const denied = result.blocked.filter((b) => b.decision === 'DENY');
    const approval = result.blocked.filter((b) => b.decision === 'NEEDS_APPROVAL');

    expect(denied).toHaveLength(1);
    expect(denied[0].path).toBe('.env');

    expect(approval).toHaveLength(1);
    expect(approval[0].path).toBe('src/index.ts');
  });

  it('should handle no staged files', async () => {
    const policyContent = `
deny_paths: []
approval_required_paths: []
`;
    fs.writeFileSync(path.join(testDir, '.agentpolicy.yaml'), policyContent);

    vi.mocked(execa).mockResolvedValue({
      stdout: '',
    } as any);

    const result = await checkStagedFiles(testDir);

    expect(result.success).toBe(true);
    expect(result.stagedFiles).toEqual([]);
    expect(result.evaluations).toEqual([]);
    expect(result.blocked).toEqual([]);
  });

  it('should throw error when policy file is missing', async () => {
    vi.mocked(execa).mockResolvedValue({
      stdout: 'README.md\n',
    } as any);

    await expect(checkStagedFiles(testDir)).rejects.toThrow(/Policy file not found/);
  });

  it('should throw error when git command fails', async () => {
    const policyContent = `
deny_paths: []
approval_required_paths: []
`;
    fs.writeFileSync(path.join(testDir, '.agentpolicy.yaml'), policyContent);

    vi.mocked(execa).mockRejectedValue(new Error('fatal: not a git repository'));

    await expect(checkStagedFiles(testDir)).rejects.toThrow(/Failed to get staged files/);
  });

  it('should trim whitespace from file paths', async () => {
    const policyContent = `
deny_paths: []
approval_required_paths: []
`;
    fs.writeFileSync(path.join(testDir, '.agentpolicy.yaml'), policyContent);

    vi.mocked(execa).mockResolvedValue({
      stdout: '  src/index.ts  \n  docs/guide.md  \n',
    } as any);

    const result = await checkStagedFiles(testDir);

    expect(result.stagedFiles).toEqual(['src/index.ts', 'docs/guide.md']);
  });
});
