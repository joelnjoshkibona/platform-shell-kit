# The plan, the tracker and the guide

Five things are delivered with every product (P92, P98): the **prototype**, the **implementation plan**, the **progress tracker**, the **build guide** and the **user guide**. The last three are updated in the same pull request as the code they describe. `tools/guide/check.sh` fails a pull request that changes `api/`, `web/`, `mobile/` or `packages/` without them.

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

## The user guide: `docs/help/` (P98)

The build guide is for the people who **build** the product. The user guide is for the people who **use** it: one article per task ("Export a list", "Bring back something you deleted"), with pictures where numbered markers ①②③ point at the buttons the text talks about.

An article is a Markdown file, `docs/help/articles/en/<id>.md`. Its front matter says its title, module, the screens whose **How do I…** button offers it, and who can do it. A picture is not drawn by hand; you describe it:

```markdown
::: shot route=trash
1 = main [role=tablist]  Show one module at a time
2 = main button:has-text("Restore")  Bring it back
:::
```

Then run the tool. It opens the screen, finds each element, draws the numbers and saves a desktop and a phone picture:

```bash
node tools/help/build.js            # pictures, docs/help/index.html, help.json and the prototype's Help
node tools/help/build.js --check    # what CI runs: fails if a marker no longer finds its element
```

When you change a screen, change its articles in the same pull request. `tools/guide/check.sh` fails otherwise, unless a commit message has a line `Help: no change` saying why (for example, only colours changed).

> **Watch out**: Give every button a name a person would read (its text, or an `aria-label` for an icon button). The guide's markers, the tests and screen readers all find it by that name.
