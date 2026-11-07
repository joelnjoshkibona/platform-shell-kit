# P95 · Background work and its results

Status: **decided** (kit 1.15.0). The owner, 2026-11-07: "background work of export or running a report in a queue and present the results later in a notification that can have a detailed page." Proposal `docs/proposals/P94-P98.md`. SYSTEM_SHELL's `Modules/Core/Reports/Jobs/GenerateReportJob.php` is the backend starting point.

## Decision

- **Anything that may take more than a few seconds runs as a job**: an export, a report run, an import, a big bulk action, a heavy recalculation. The button starts it and says so; the person keeps working.
- **One record per run** (`job_runs`): id, ulid, number (`JOB-0041`), organization_id, user_id, kind (export, report, import, bulk), module, params (what was asked: filters, columns, grouping, format, file), status (waiting, running, done, failed, cancelled, expired), progress, result_media_id, rows, size, preview (the first rows), errors (row and message), started_at, finished_at, expires_at. It sits on top of Laravel's `jobs` and `failed_jobs`.
- **When it ends, a notification** (in the app; by email or push if the person wants it, P36) opens the **job page**:
  - the header with the number, kind, format and status, and Run again or Cancel;
  - while running: the progress and "you can leave this page";
  - done: the file with its rows, size and the days it is kept, Download, and the first rows;
  - failed: what went wrong in plain words, row by row for an import, and what to do;
  - expired: the date it expired and Run again;
  - "What was asked": every parameter, who started it, when it finished and how long it took.
- **My exports and reports**, under the avatar menu, lists the person's own runs (Running, Ready, Failed), with Download on a ready row. Admins see every run in Queue (P97), where each job opens its page.
- **Files** are private (downloaded with the person's token) and kept 7 days by default, set in Settings; a scheduled task deletes expired files (P97).
- **Exports behind an approval** (P18) start their job only once approved.
- **API**: `POST /{module}/export` (and `/reports/{id}/run`, `/{module}/import`) answers 202 with the run; `GET /job-runs/list`, `/job-runs/{uuid}/view`, `/job-runs/{uuid}/download`; `POST /job-runs/{uuid}/rerun`, `/job-runs/{uuid}/cancel`.

## Why

A spinner that blocks the page fails on big data and bad networks, and the work dies with the request. A run with its own page can be left, found again, downloaded later, explained when it fails and repeated.

## Extension point

`startJobRun({ kind, title, format, params, rows, columns, preview, file, download })` in the prototype's `parts_jobs.js`; `ListShare`'s Export uses it. In the app: a `JobRunsService` and one job class per kind.
