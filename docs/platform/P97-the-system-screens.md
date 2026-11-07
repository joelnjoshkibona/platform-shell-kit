# P97 · The system screens

Status: **decided** (kit 1.14.0). From the owner's review of the system modules, 2026-11-07 ("logs, queue, scheduled tasks, trash, notifications, permissions are important aspects to have in the system"), and the proposal `docs/proposals/P94-P98.md`. The backends come from SYSTEM_SHELL: `app/Project/Logs` (activity, error, login and request logs), `app/Project/Queue`, `app/Project/ScheduledTasks`, `Modules/Core/Trash`, `Modules/Core/Notifications`.

## Decision

- Six core screens, drawn in the prototype (`parts_system.js`) as kit list pages with details sheets (P24, P26, P39, P40), in every product:
  - **Logs**, with tabs Activity, Sign-ins, Errors and Requests in `?tab=`. Activity entries link to their records (P85). Errors are grouped with a count, first and last seen, and the call stack. Export runs as a background job (P95). Logs are kept 90 days, and passwords, tokens and form answers are never written to them.
  - **Queue**: KPIs (failed, running, waiting, done today), jobs by status with failed first, progress, tries and who started them; Retry failed, Retry, Cancel, Delete (`Queue.retry`).
  - **Scheduled tasks**: each cron task described in words with its command, how often, the last run (worked or failed, when, how long), the next run; Run now and pause or resume (`ScheduledTasks.manage`); recent runs in a sheet.
  - **Trash**: deleted records by module, who and when, what was deleted with them, the days left (a warning under a week); Restore (`Trash.restore`); Delete for good and Empty trash behind the YES gate (`Trash.purge`). Records go for good after 30 days (a scheduled task).
  - **Notifications**, with tabs in `?tab=`:
    - Inbox;
    - My settings (channels per kind, quiet hours, P36);
    - Rules (`Notifications.manage`): which event tells whom by which channel;
    - Announcements (`Notifications.announce`): one message to everyone or to chosen roles, with channels, now or scheduled. This replaces Broadcasts.
  - **Permissions**: every permission in words with its name and module, the number of roles and people; a sheet listing the roles (links) and the people who have it through their main role.
- Routes: `logs`, `queue`, `scheduled-tasks` (not `tasks`, which products use for their own modules), `trash`, `notifications`, `permissions`.
- The System menu: Monitoring (Logs, Queue, Scheduled tasks), Messaging (Notifications), Content (Media, Trash). The Broadcasts and Notification settings items are gone, folded into Notifications.

## Why

These screens were placeholders, yet every running product needs them: to see what happened, to recover from a failed job or a deleted record, and to control who is told about what.

## Extension point

`SYS` in `parts_system.js` holds the demo data. A product's own scheduled tasks, job kinds, trash modules and notification rules appear in the same screens from the API.
