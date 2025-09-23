/**
 * Cleanup job for abandoned anonymous accounts
 *
 * This job should be run periodically (e.g., daily via cron) to:
 * 1. Remove anonymous accounts older than 30 days with no activity
 * 2. Archive any associated data before deletion (if needed)
 * 3. Log cleanup statistics
 *
 * Usage:
 * - Run directly: bun run src/jobs/cleanup-anonymous-accounts.ts
 * - Schedule via cron: 0 2 * * * cd /path/to/api && bun run src/jobs/cleanup-anonymous-accounts.ts
 */

import { db } from '../db';
import { user, session, account } from '../db/schemas/auth-schema';
import { eq, and, lt, isNull } from 'drizzle-orm';

const CLEANUP_AFTER_DAYS = 30;
const DRY_RUN = process.env.DRY_RUN === 'true';

interface CleanupStats {
  totalAnonymousUsers: number;
  eligibleForDeletion: number;
  deleted: number;
  errors: number;
  duration: number;
}

async function cleanupAbandonedAnonymousAccounts(): Promise<CleanupStats> {
  const startTime = Date.now();
  const stats: CleanupStats = {
    totalAnonymousUsers: 0,
    eligibleForDeletion: 0,
    deleted: 0,
    errors: 0,
    duration: 0,
  };

  try {
    console.log('Starting anonymous account cleanup...');
    console.log(`Mode: ${DRY_RUN ? 'DRY RUN' : 'LIVE'}`);
    console.log(`Cleanup threshold: ${CLEANUP_AFTER_DAYS} days`);

    // Calculate cutoff date
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - CLEANUP_AFTER_DAYS);

    // Find all anonymous users
    const anonymousUsers = await db
      .select({
        id: user.id,
        email: user.email,
        createdAt: user.createdAt,
      })
      .from(user)
      .where(eq(user.isAnonymous, true));

    stats.totalAnonymousUsers = anonymousUsers.length;
    console.log(`Found ${stats.totalAnonymousUsers} anonymous users`);

    // Check each user for recent activity
    for (const anonymousUser of anonymousUsers) {
      try {
        // Check for recent sessions
        const recentSessions = await db
          .select({ id: session.id })
          .from(session)
          .where(
            and(
              eq(session.userId, anonymousUser.id),
              lt(session.createdAt, cutoffDate)
            )
          )
          .limit(1);

        // If user was created before cutoff and has no recent sessions
        if (
          anonymousUser.createdAt < cutoffDate &&
          recentSessions.length === 0
        ) {
          stats.eligibleForDeletion++;

          if (!DRY_RUN) {
            // Start transaction for safe deletion
            await db.transaction(async (tx) => {
              // Delete sessions first (foreign key constraint)
              await tx
                .delete(session)
                .where(eq(session.userId, anonymousUser.id));

              // Delete accounts
              await tx
                .delete(account)
                .where(eq(account.userId, anonymousUser.id));

              // Delete user
              await tx
                .delete(user)
                .where(eq(user.id, anonymousUser.id));

              console.log(`Deleted anonymous user: ${anonymousUser.id} (created: ${anonymousUser.createdAt.toISOString()})`);
            });

            stats.deleted++;
          } else {
            console.log(`[DRY RUN] Would delete user: ${anonymousUser.id} (created: ${anonymousUser.createdAt.toISOString()})`);
          }
        }
      } catch (error) {
        stats.errors++;
        console.error(`Error processing user ${anonymousUser.id}:`, error);
      }
    }

    stats.duration = Date.now() - startTime;

    // Log summary
    console.log('\n=== Cleanup Summary ===');
    console.log(`Total anonymous users: ${stats.totalAnonymousUsers}`);
    console.log(`Eligible for deletion: ${stats.eligibleForDeletion}`);
    console.log(`Actually deleted: ${stats.deleted}`);
    console.log(`Errors: ${stats.errors}`);
    console.log(`Duration: ${stats.duration}ms`);

    return stats;
  } catch (error) {
    console.error('Fatal error during cleanup:', error);
    throw error;
  }
}

// Archive function for future use (when we need to preserve data)
async function archiveUserData(userId: string): Promise<void> {
  // TODO: Implement archiving logic when needed
  // This could include:
  // - Exporting try-on history to S3
  // - Saving favorite styles
  // - Creating anonymized analytics records
  console.log(`Archiving data for user ${userId} (not implemented)`);
}

// Run cleanup if executed directly
if (import.meta.main) {
  cleanupAbandonedAnonymousAccounts()
    .then((stats) => {
      process.exit(stats.errors > 0 ? 1 : 0);
    })
    .catch((error) => {
      console.error('Cleanup job failed:', error);
      process.exit(1);
    });
}

export { cleanupAbandonedAnonymousAccounts, archiveUserData };