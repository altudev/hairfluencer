# Anonymous Account Cleanup Job

## Overview
The cleanup job removes abandoned anonymous accounts to prevent database bloat and maintain system performance.

## Configuration
- **Cleanup Threshold**: 30 days (accounts with no activity for 30+ days)
- **Schedule**: Recommended to run daily at off-peak hours
- **Mode**: Supports dry-run for testing

## Running the Job

### Manual Execution

#### Dry Run (Preview what would be deleted)
```bash
cd apps/api
bun run cleanup:anonymous:dry
```

#### Live Run (Actually delete accounts)
```bash
cd apps/api
bun run cleanup:anonymous
```

### Automated Execution (Cron)

Add to your server's crontab to run daily at 2 AM:

```bash
# Edit crontab
crontab -e

# Add this line (adjust path as needed)
0 2 * * * cd /path/to/hairfluencer/apps/api && bun run cleanup:anonymous >> /var/log/cleanup-anonymous.log 2>&1
```

### Using systemd Timer (Alternative)

1. Create service file `/etc/systemd/system/cleanup-anonymous.service`:
```ini
[Unit]
Description=Cleanup Anonymous Accounts
After=network.target

[Service]
Type=oneshot
WorkingDirectory=/path/to/hairfluencer/apps/api
ExecStart=/usr/local/bin/bun run cleanup:anonymous
StandardOutput=journal
StandardError=journal
```

2. Create timer file `/etc/systemd/system/cleanup-anonymous.timer`:
```ini
[Unit]
Description=Run cleanup-anonymous daily
Requires=cleanup-anonymous.service

[Timer]
OnCalendar=daily
OnCalendar=02:00
Persistent=true

[Install]
WantedBy=timers.target
```

3. Enable and start timer:
```bash
sudo systemctl daemon-reload
sudo systemctl enable cleanup-anonymous.timer
sudo systemctl start cleanup-anonymous.timer
```

## What Gets Deleted

The job deletes anonymous accounts that meet ALL of these criteria:
1. Account has `is_anonymous = true`
2. Account was created more than 30 days ago
3. No sessions exist within the last 30 days
4. All related data (sessions, accounts) are also deleted

## Safety Features

1. **Transaction-based**: All deletions happen within a database transaction
2. **Dry Run Mode**: Test the job without actually deleting anything
3. **Detailed Logging**: Every deletion is logged with timestamp
4. **Error Handling**: Continues processing even if individual deletions fail

## Monitoring

The job outputs statistics after each run:
- Total anonymous users found
- Number eligible for deletion
- Number actually deleted
- Any errors encountered
- Execution duration

## Future Enhancements

- [ ] Archive user data before deletion (try-on history, favorites)
- [ ] Send metrics to monitoring system
- [ ] Configurable retention period via environment variable
- [ ] Email notifications for large-scale deletions
- [ ] Redis-based distributed locking for multi-instance deployments

## Troubleshooting

### Job fails with foreign key constraint
Ensure the deletion order is correct: sessions → accounts → users

### Job takes too long
Consider:
- Running during off-peak hours
- Increasing cleanup frequency to reduce batch size
- Adding database indexes on `is_anonymous` and `created_at`

### Dry run shows unexpected deletions
Check the date calculation and ensure server timezone is correct