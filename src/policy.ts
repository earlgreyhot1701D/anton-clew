import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import { z } from 'zod';

/**
 * Schema for validating .agentpolicy.yaml files
 */
const PolicySchema = z.object({
  deny_paths: z
    .array(z.string().min(1, 'Path cannot be empty'))
    .default([])
    .describe('Paths that are completely blocked from access'),
  approval_required_paths: z
    .array(z.string().min(1, 'Path cannot be empty'))
    .default([])
    .describe('Paths that require approval before modification'),
});

export type Policy = z.infer<typeof PolicySchema>;

/**
 * Loads and validates the .agentpolicy.yaml file from the repository root
 * @param repoRoot - Path to the repository root (defaults to current working directory)
 * @returns Validated policy configuration
 * @throws {Error} If the policy file is invalid or missing
 */
export function loadPolicy(repoRoot: string = process.cwd()): Policy {
  const policyPath = path.join(repoRoot, '.agentpolicy.yaml');

  // Check if file exists
  if (!fs.existsSync(policyPath)) {
    throw new Error(
      `Policy file not found: ${policyPath}\n` +
      'Create a .agentpolicy.yaml file in the repository root with the required configuration.'
    );
  }

  // Read file
  let fileContent: string;
  try {
    fileContent = fs.readFileSync(policyPath, 'utf-8');
  } catch (error) {
    throw new Error(
      `Failed to read policy file: ${policyPath}\n` +
      `Reason: ${error instanceof Error ? error.message : String(error)}`
    );
  }

  // Parse YAML
  let parsedYaml: unknown;
  try {
    parsedYaml = yaml.load(fileContent);
  } catch (error) {
    throw new Error(
      `Invalid YAML syntax in policy file: ${policyPath}\n` +
      `Reason: ${error instanceof Error ? error.message : String(error)}`
    );
  }

  // Treat empty/null YAML as empty object for defaults
  if (parsedYaml === null || parsedYaml === undefined) {
    parsedYaml = {};
  }

  // Validate with Zod
  try {
    const policy = PolicySchema.parse(parsedYaml);
    return policy;
  } catch (error) {
    if (error instanceof z.ZodError) {
      const issues = error.issues
        .map((issue) => `  • ${issue.path.join('.')}: ${issue.message}`)
        .join('\n');
      throw new Error(
        `Invalid policy configuration:\n${issues}\n\n` +
        `Expected format:\n` +
        `deny_paths:\n` +
        `  - "path/to/deny1"\n` +
        `  - "path/to/deny2"\n` +
        `approval_required_paths:\n` +
        `  - "path/requiring/approval"`
      );
    }
    throw error;
  }
}
