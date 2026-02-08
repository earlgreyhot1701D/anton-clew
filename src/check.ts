import { execa } from 'execa';
import { loadPolicy } from './policy.js';
import { evaluatePaths, type PathDecision } from './pathEvaluator.js';

export interface CheckResult {
  success: boolean;
  stagedFiles: string[];
  evaluations: Array<{
    path: string;
    decision: PathDecision;
    reason: string;
  }>;
  blocked: Array<{
    path: string;
    decision: PathDecision;
    reason: string;
  }>;
}

/**
 * Checks staged files against the policy
 * @param repoRoot - Repository root path (defaults to cwd)
 * @returns Check result with evaluations and blocked files
 * @throws {Error} If policy file is invalid or git command fails
 */
export async function checkStagedFiles(repoRoot: string = process.cwd()): Promise<CheckResult> {
  // Load policy
  const policy = loadPolicy(repoRoot);

  // Get staged files
  let stagedFiles: string[];
  try {
    const { stdout } = await execa('git', ['diff', '--cached', '--name-only'], {
      cwd: repoRoot,
    });
    stagedFiles = stdout
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0);
  } catch (error) {
    throw new Error(
      `Failed to get staged files: ${error instanceof Error ? error.message : String(error)}`
    );
  }

  // Evaluate paths
  const evaluations = evaluatePaths(stagedFiles, policy);

  // Filter blocked paths (DENY or NEEDS_APPROVAL)
  const blocked = evaluations.filter(
    (e) => e.decision === 'DENY' || e.decision === 'NEEDS_APPROVAL'
  );

  return {
    success: blocked.length === 0,
    stagedFiles,
    evaluations,
    blocked,
  };
}
