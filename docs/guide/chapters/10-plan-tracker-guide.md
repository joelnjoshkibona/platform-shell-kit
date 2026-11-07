# The plan, the tracker and the guide

Four things are delivered with every product (P92): the **prototype**, the **implementation plan**, the **progress tracker** and the **build guide**. The last three are updated in the same pull request as the code they describe. `tools/guide/check.sh` fails a pull request that changes `api/`, `web/` or `phone/` without them.

## The implementation plan: `docs/IMPLEMENTATION_PLAN.md`

The build plan's phases, broken into **numbered steps**. A step is small enough to finish and check in a day or two. Each step says:

| Field | Example |
| --- | --- |
| Step | `2.3` Tasks: create, edit, delete with the subtree |
| Goal | One sentence: what works when it is done |
| Files | `api/app/Modules/Custom/Work/Tasks/Services/TasksCreateService.php`, … |
| Commands | `php artisan migrate`, `./vendor/bin/pest app/Modules/Custom/Work/Tasks` |
| Check | how to prove it: the tests, the screen against its screenshot |
| Guide | the chapter that explains it: `chapters/12-tasks.md` |

If the work turns out different from the plan, **correct the plan** in the same pull request. The plan must always describe what was actually done.

## The progress tracker: `docs/PROGRESS.md`

One row per step:

| Step | Status | PR | Date | Verified by | Guide |
| --- | --- | --- | --- | --- | --- |
| 2.3 | done | #14 | 2026-11-12 | pest 18 passed; visual tasks__* match | yes |

Status is one of: to do, doing, done, blocked (say why).

## The build guide: `docs/guide/`

Chapters in `docs/guide/chapters/NN-name.md`, built into one HTML page by `python3 tools/guide/build.py`. The guide shows the plan and the tracker as pages too. Write it for a beginner who will rebuild the product by following it:

- explain **why** before **how**, in plain words;
- give the exact files, commands and checks of each step;
- keep chapters in the order things are built;
- when you change how something works, change its chapter.

> **Tip**: Before opening a pull request, read the chapter you changed as if you were new. If you would get stuck, add the missing sentence.
