<!-- TEMPLATE from the platform shell kit. Fomu's prompt is the worked example: keep the platform parts, replace the product parts, delete this line. -->

# Handoff prompt

Paste this into Claude Code (GitHub / web) for each phase. Change only the phase number.

---

You are building **{{PRODUCT_NAME}}**, a multi-tenant, Google Forms-like form builder, in this repository. Everything has already been designed and decided. Your job is to build it **exactly as designed**. Do not redesign, simplify, or substitute your own UI judgement.

**Before writing any code, read these files in full:**
1. `CLAUDE.md`
2. `docs/BUILD_PLAN.md`
3. `docs/product/PRODUCT.md`
4. `docs/design/SCREENS.md`
5. `docs/frontend/FRONTEND_RULES.md`
6. `docs/frontend/COMPONENTS.md` and `docs/frontend/components_api.json`
7. `docs/architecture/ERD.md`, including the whole decision log D1–D45

Then open `docs/design/prototype/index.html` with Playwright and read the prototype source in `docs/design/prototype/src/` for every screen in this phase. Look at each screen's screenshots in `docs/design/screenshots/`.

**Task: build Phase {N} of `docs/BUILD_PLAN.md`, and only Phase {N}.**

Rules you must follow:
- **The prototype is the visual source of truth.**
  - Port its layout, Tailwind classes, spacing, radius, type sizes, icons, colours/tokens (light and dark), motion, copy, empty, loading and error states, and phone layouts.
  - When the screenshots and your result differ, your result is wrong unless a documented rule or decision says otherwise.
- **`FRONTEND_RULES.md` and the decision log are the behaviour source of truth.**
  - If anything is ambiguous or two sources conflict, stop and list the question in the PR description (or open an issue). Never decide silently.
  - A new behaviour needs a new decision (D46+) in `docs/architecture/erd_data.py`, then run `python3 build.py` in that folder.
- **Build only from the component library.** If a screen needs a component that isn't there, add it to `COMPONENTS.md` / `components_api.json` first, in the same PR, with a reason.
- **Backend:**
  - build on the Cobley backend in `api/` and follow its module architecture and its list/select/drafts/media/approvals contracts;
  - every tenant table has `organization_id` and every query is scoped by it;
  - permissions follow `Module.action`, and the menu, route, endpoint and buttons all agree;
  - write Pest tests.
- **Strings** go through `t()`, with English and Swahili keys together.
- **Prove visual parity.**
  - For every screen in this phase, add Playwright visual tests in `web/tests/visual/` that save screenshots with the same file names as `docs/design/screenshots/index.json`, in all four combinations: desktop/phone × light/dark.
  - Run `tools/prototype-shots/compare.js` against them.
  - Fix the differences.
  - In the PR, include the compare summary and the remaining differences, each with a justification.
- **Before opening the PR**, tick every item in the `FRONTEND_RULES.md` review checklist and the Definition of done in `BUILD_PLAN.md`. That includes:
  - zero console errors and warnings;
  - no horizontal scroll at 360px;
  - checking every screen in light and dark.
- **Do not build** the prototype-only pieces: the Screens pill, the Prototype states panel, and the phone-frame toggle.
- **Never commit secrets** or `.env` files.

**Deliver:**
- one branch `phase-{N}-<name>` and one PR;
- a description listing the screens built, the endpoints added, the decisions touched, the visual compare summary, the test results, and open questions.

Stop after opening the PR. Do not start the next phase.
