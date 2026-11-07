# Decisions: why we never argue twice

Every choice that shapes a product is written down as a numbered decision, with the reason. When someone asks "why does it work like this?", the answer is a number.

## Two logs

| Log | Numbers | Who it binds | Where |
| --- | --- | --- | --- |
| Platform decisions | P1, P2, … P93 | Every product | `docs/PLATFORM_DECISIONS.md` in the kit, one spec per decision in `docs/platform/` |
| Product decisions | D1, D2, … | One product | The product's `docs/product/DECISIONS.md` (or its ERD) |

Examples:

- **P21**: permissions are named `Module.action` (`Tasks.create`, `Tickets.triage`).
- **P49**: every record page starts with a Back button.
- **P80**: a module owns its files.
- **Shelui D8**: tasks nest without limit.

## The rules

1. A product never re-opens a P. If the platform itself must change, that is a new P in the kit (with the prototype, rules and components updated in the same change), and every product gets it.
2. A product decision that is new gets the next D number before it is built.
3. If two documents disagree, stop and ask. Don't pick one quietly.

> **Tip**: When you start on a product, read its D-log from the top. It is the fastest way to understand what the product is and why it looks the way it does.

## Where the truth lives

| Question | Answer lives in |
| --- | --- |
| How does it look? | The prototype and its screenshots |
| How does it behave? | `FRONTEND_RULES.md`, then the D-log |
| What data exists? | The product's ERD |
| How is the code laid out? | `docs/architecture/MODULES.md` (P80–P90) |
| How was it built, step by step? | The product's build guide, plan and tracker (P91, P92) |
