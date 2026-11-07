# P91 · The build guide is a deliverable

Status: **decided** (kit 1.12.0). The owner, 2026-11-07: "Take it like we are making a beginner understand how to code that system, how the system was designed and everything else important."

## Decision

- Every product ships `docs/guide/index.html`: one self-contained HTML page with contents, search, light and dark, that prints. It is built from Markdown chapters in `docs/guide/chapters/NN-*.md` by `python3 tools/guide/build.py` (no dependencies), so chapters stay easy to edit and review.
- It is written for a beginner: plain words, every term explained the first time, every step with the files it touches, the commands to run and how to check it worked.
- What it covers, at least: what the product is and who uses it; how it was designed (the prototype, the decisions, the data, the modules); setting up from an empty folder; the module life cycle (P80–P90); each module as it was built; testing; the phone app; releasing and running; a glossary.
- Someone who follows it from the start can rebuild the product without asking anyone.
- The kit has its own guide (`docs/guide/`, building any product on the platform). A product's guide starts from `templates/guide/` and links to the kit's for the platform parts.

## Why

Products were handed over as a prototype, decisions and code; the reasoning and the order of work lived in conversations. A guide that is kept with the code turns that into something a new developer, or an agent, can follow.

## Extension point

`templates/guide/chapters/` (the product's chapters), `tools/guide/build.py` (copied into the product).
