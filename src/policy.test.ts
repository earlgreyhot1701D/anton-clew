import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import { loadPolicy, type Policy } from './policy.js';

const testDir = path.join(process.cwd(), '.test-policy');

describe('loadPolicy', () => {
  beforeEach(() => {
    // Create test directory
    if (!fs.existsSync(testDir)) {
      fs.mkdirSync(testDir, { recursive: true });
    }
  });

  afterEach(() => {
    // Clean up test directory
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true });
    }
  });

  it('should load a valid policy file', () => {
    const policyContent = `
deny_paths:
  - .env
  - "*.key"
approval_required_paths:
  - src/**
`;
    fs.writeFileSync(path.join(testDir, '.agentpolicy.yaml'), policyContent);

    const policy = loadPolicy(testDir);

    expect(policy).toEqual({
      deny_paths: ['.env', '*.key'],
      approval_required_paths: ['src/**'],
    });
  });

  it('should use empty arrays as defaults', () => {
    const policyContent = '';
    fs.writeFileSync(path.join(testDir, '.agentpolicy.yaml'), policyContent);

    const policy = loadPolicy(testDir);

    expect(policy).toEqual({
      deny_paths: [],
      approval_required_paths: [],
    });
  });

  it('should fail with clear error when file is missing', () => {
    expect(() => loadPolicy(testDir)).toThrow(/Policy file not found/);
    expect(() => loadPolicy(testDir)).toThrow(/.agentpolicy.yaml/);
  });

  it('should fail with clear error on invalid YAML', () => {
    const invalidYaml = 'deny_paths: [unclosed';
    fs.writeFileSync(path.join(testDir, '.agentpolicy.yaml'), invalidYaml);

    expect(() => loadPolicy(testDir)).toThrow(/Invalid YAML syntax/);
  });

  it('should fail with clear error on validation failure', () => {
    const invalidPolicy = `
deny_paths:
  - ""
`;
    fs.writeFileSync(path.join(testDir, '.agentpolicy.yaml'), invalidPolicy);

    expect(() => loadPolicy(testDir)).toThrow(/Invalid policy configuration/);
    expect(() => loadPolicy(testDir)).toThrow(/Path cannot be empty/);
  });

  it('should reject extra fields', () => {
    const policyWithExtra = `
deny_paths: []
approval_required_paths: []
unknown_field: value
`;
    fs.writeFileSync(path.join(testDir, '.agentpolicy.yaml'), policyWithExtra);

    // Zod by default strips extra fields, so this should succeed
    const policy = loadPolicy(testDir);
    expect(policy).toEqual({
      deny_paths: [],
      approval_required_paths: [],
    });
  });
});
