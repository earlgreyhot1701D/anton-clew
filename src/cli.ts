#!/usr/bin/env node
import { Command } from 'commander';
import { checkStagedFiles } from './check.js';

const program = new Command();

program
  .name('clew')
  .description('Safety guardrails for AI agents and automation in Git repositories')
  .version('0.1.0');

program
  .command('init')
  .description('Initialize Anton Clew in this repository')
  .action(() => {
    console.log('✓ clew init command (coming soon)');
  });

program
  .command('check')
  .option('--staged', 'Check only staged files')
  .description('Check files against policy')
  .action(async (options) => {
    try {
      if (options.staged) {
        const result = await checkStagedFiles();

        if (result.stagedFiles.length === 0) {
          console.log('ℹ No staged files to check');
          process.exit(0);
        }

        console.log(`📋 Checking ${result.stagedFiles.length} staged file(s)...\n`);

        // Print all evaluations
        result.evaluations.forEach(({ path, decision, reason }) => {
          const icon =
            decision === 'ALLOW' ? '✓' : decision === 'DENY' ? '✗' : '⚠';
          console.log(`${icon} ${path}`);
          console.log(`  └─ ${decision}: ${reason}`);
        });

        // Exit with error if any files are blocked
        if (!result.success) {
          console.log(`\n✗ Check failed: ${result.blocked.length} file(s) blocked`);
          result.blocked.forEach(({ path, decision }) => {
            const status = decision === 'DENY' ? 'DENIED' : 'REQUIRES APPROVAL';
            console.log(`  • ${path} (${status})`);
          });
          process.exit(1);
        }

        console.log(`\n✓ All checks passed`);
        process.exit(0);
      } else {
        console.log('✓ clew check command (coming soon)');
      }
    } catch (error) {
      console.error(
        `✗ Error: ${error instanceof Error ? error.message : String(error)}`
      );
      process.exit(1);
    }
  });

program.parse(process.argv);
