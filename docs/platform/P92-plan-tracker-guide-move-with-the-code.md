# P92 · Plan, tracker and guide move with the code

Status: **decided** (kit 1.12.0). The owner, 2026-11-07.

## Decision

- A product's deliverables are four: the **prototype**, the **implementation plan**, the **progress tracker** and the **build guide** (P91).
- `docs/IMPLEMENTATION_PLAN.md` (from `templates/IMPLEMENTATION_PLAN.md`): the build plan's phases broken into numbered steps (`0.1`, `0.2`, `2.4` …). Each step says its goal, the files it creates or changes, the commands, how to check it, and which guide chapter explains it.
- `docs/PROGRESS.md` (from `templates/PROGRESS.md`): one row per step: status (to do, doing, done, blocked), the PR, the date, how it was verified, guide updated (yes/no).
- Every change that touches `api/`, `web/` or `mobile/` updates, in the same PR: its plan step (if the work differed from the plan, the plan is corrected), its tracker row, and the guide chapter that explains it. `tools/guide/check.sh` fails the PR when code changed and they did not; the definition of done lists them.
- The guide shows the plan and the tracker as pages, so one HTML page tells where the build stands and how to do it.

## Why

A plan that is not updated stops being true, and a tracker no one fills in says nothing. Tying both to the same PR as the code keeps them honest at no extra step.

## Extension point

`templates/IMPLEMENTATION_PLAN.md`, `templates/PROGRESS.md`, `tools/guide/check.sh`.
