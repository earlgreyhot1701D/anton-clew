import { minimatch } from 'minimatch';
import type { Policy } from './policy.js';

export type PathDecision = 'ALLOW' | 'DENY' | 'NEEDS_APPROVAL';

export interface PathEvaluation {
  path: string;
  decision: PathDecision;
  reason: string;
}

/**
 * Evaluates paths against a policy using glob pattern matching
 * Priority: deny_paths > approval_required_paths > allow (default)
 *
 * @param paths - Array of file paths to evaluate
 * @param policy - Policy configuration with deny and approval paths
 * @returns Array of evaluation results with decision and reason for each path
 */
export function evaluatePaths(paths: string[], policy: Policy): PathEvaluation[] {
  return paths.map((filePath) => evaluatePath(filePath, policy));
}

/**
 * Evaluates a single path against the policy
 * @param filePath - File path to evaluate
 * @param policy - Policy configuration
 * @returns Evaluation result with decision and reason
 */
function evaluatePath(filePath: string, policy: Policy): PathEvaluation {
  // Check deny_paths first (highest priority)
  const deniedPattern = policy.deny_paths.find((pattern) =>
    minimatch(filePath, pattern, { dot: true })
  );

  if (deniedPattern) {
    return {
      path: filePath,
      decision: 'DENY',
      reason: `Matches deny pattern: ${deniedPattern}`,
    };
  }

  // Check approval_required_paths (medium priority)
  const approvalPattern = policy.approval_required_paths.find((pattern) =>
    minimatch(filePath, pattern, { dot: true })
  );

  if (approvalPattern) {
    return {
      path: filePath,
      decision: 'NEEDS_APPROVAL',
      reason: `Matches approval-required pattern: ${approvalPattern}`,
    };
  }

  // Default to allow
  return {
    path: filePath,
    decision: 'ALLOW',
    reason: 'No restrictions apply',
  };
}
