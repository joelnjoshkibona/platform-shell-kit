import html
from erd_data import *

def mermaid_entity(name, fields, with_attrs=True):
    if not with_attrs:
        return f"    {name} {{\n    }}"
    lines = [f"    {name} {{"]
    for t, f, k, c in fields:
        parts = [t, f]
        if k: parts.append(k.replace("UK", "UK"))
        if c: parts.append('"' + c.replace('"', "'") + '"')
        lines.append("        " + " ".join(parts))
    lines.append("    }")
    return "\n".join(lines)

def section_mermaid(sec):
    ents = [e for e in E if e[0] == sec]
    rels = [r for r in R if r[4] == sec]
    out = ["erDiagram"]
    for _, n, f, _ in ents:
        out.append(mermaid_entity(n, f))
    out.append("")
    for l, c, r, lab, _ in rels:
        out.append(f'    {l} {c} {r} : "{lab}"')
    return "\n".join(out)

def overview_mermaid():
    out = ["erDiagram"]
    for l, c, r, lab, _ in R:
        out.append(f'    {l} {c} {r} : "{lab}"')
    return "\n".join(out)

# ---------------- Markdown
md = ["# Form Builder — System ERD", "",
      "> Laravel 13 (Cobley backend) · MySQL 8 · multi-tenant (path-based `/{org}`) · hybrid storage (versioned JSON definitions + one row per answer).",
      "> Generated from `erd_data.py`. Edit the data file, not this file.", "",
      "## 00. Overview", "", "```mermaid", overview_mermaid(), "```", ""]
for num, title, desc in SECTIONS:
    md += [f"## {num}. {title}", "", desc, "", "```mermaid", section_mermaid(num), "```", ""]
    for s, n, f, notes in E:
        if s == num and notes:
            md.append(f"- **{n}**: {notes}")
    md.append("")
md += ["## 07. Form definition JSON (`form_versions.definition`)", "", "```jsonc", DEFINITION_JSON, "```", "",
       "| Question type | Rows written to `response_answers` |", "|---|---|"]
md += [f"| {a} | {b} |" for a, b in STORAGE_MAP]
md += ["", "## 08. Constraints & indexes", "", "| Table | Constraint | Why |", "|---|---|---|"]
md += [f"| `{a}` | `{b}` | {c} |" for a, b, c in CONSTRAINTS]
md += ["", "## 09. Status lifecycles", ""]
md += [f"- **{a}**: {b}" + (f" — {c}" if c else "") for a, b, c in LIFECYCLES]
md += ["", "## 10. Async jobs", "", "| Kind | Job | Does |", "|---|---|---|"]
md += [f"| {a} | `{b}` | {c} |" for a, b, c in JOBS]
md += ["", "## 11. Decisions", "", "| # | Decision | Outcome |", "|---|---|---|"]
md += [f"| {a} | {b} | {c} |" for a, b, c in OPEN_DECISIONS]
open("ERD.md", "w").write("\n".join(md) + "\n")

# ---------------- HTML
esc = html.escape
def keybadges(k):
    return "".join(f'<span class="k k-{x.lower()}">{x}</span>' for x in [p.strip() for p in k.split(",") if p.strip()])

def entity_card(n, f, notes):
    rows = "".join(
        f'<tr><td class="fn">{esc(fl)}</td><td class="ty">{esc(t)}</td><td>{keybadges(k)}</td><td class="cm">{esc(c)}</td></tr>'
        for t, fl, k, c in f)
    fkc = sum(1 for x in f if "FK" in x[2])
    return f'''<details class="ent" id="t-{n.lower()}">
<summary><span class="en">{n}</span><span class="meta">{len(f)} fields · {fkc} FK</span></summary>
{f'<p class="note">{esc(notes)}</p>' if notes else ''}
<div class="tw"><table class="ft"><thead><tr><th>Field</th><th>Type</th><th>Key</th><th>Notes</th></tr></thead><tbody>{rows}</tbody></table></div>
</details>'''

toc = ['<a href="#s-00"><span class="tn">00</span>Overview</a>']
body = []
body.append(f'''<section id="s-00"><div class="sh"><span class="num">00</span><h2>Overview</h2></div>
<p class="lead">{len(E)} tables across {len(SECTIONS)} domains, {len(R)} relationships. Relationships only; open a domain below for fields.</p>
<div class="dg dg-wide"><pre class="mermaid">{esc(overview_mermaid())}</pre></div></section>''')
for num, title, desc in SECTIONS:
    toc.append(f'<a href="#s-{num}"><span class="tn">{num}</span>{esc(title)}</a>')
    cards = "".join(entity_card(n, f, notes) for s, n, f, notes in E if s == num)
    body.append(f'''<section id="s-{num}"><div class="sh"><span class="num">{num}</span><h2>{esc(title)}</h2></div>
<p class="lead">{esc(desc)}</p>
<div class="dg"><pre class="mermaid">{esc(section_mermaid(num))}</pre></div>
<div class="ents">{cards}</div></section>''')

toc += ['<a href="#s-07"><span class="tn">07</span>Definition JSON</a>',
        '<a href="#s-08"><span class="tn">08</span>Constraints</a>',
        '<a href="#s-09"><span class="tn">09</span>Lifecycles</a>',
        '<a href="#s-10"><span class="tn">10</span>Async jobs</a>',
        '<a href="#s-11"><span class="tn">11</span>Decisions</a>']

sm = "".join(f"<tr><td>{esc(a)}</td><td>{esc(b)}</td></tr>" for a, b in STORAGE_MAP)
body.append(f'''<section id="s-07"><div class="sh"><span class="num">07</span><h2>Form definition JSON</h2></div>
<p class="lead">Stored in <code>form_versions.definition</code> and <code>forms.draft_definition</code>. Keys are ULIDs that never change when a question is edited, so summaries merge across versions.</p>
<div class="tw"><pre class="code">{esc(DEFINITION_JSON)}</pre></div>
<h3>How each type lands in <code>response_answers</code></h3>
<div class="tw"><table class="ft"><thead><tr><th>Question type</th><th>Rows written</th></tr></thead><tbody>{sm}</tbody></table></div></section>''')

cr = "".join(f'<tr><td class="fn">{esc(a)}</td><td><code>{esc(b)}</code></td><td class="cm">{esc(c)}</td></tr>' for a, b, c in CONSTRAINTS)
body.append(f'''<section id="s-08"><div class="sh"><span class="num">08</span><h2>Constraints &amp; indexes</h2></div>
<p class="lead">The integrity rules that the database enforces, so races between two tabs or two devices cannot create duplicates.</p>
<div class="tw"><table class="ft"><thead><tr><th>Table</th><th>Constraint</th><th>Why</th></tr></thead><tbody>{cr}</tbody></table></div></section>''')

def flow(s):
    return "".join(f'<span class="st">{esc(p.strip())}</span>' if p.strip() not in ("→", "|") else f'<span class="ar">{"→" if p.strip()=="→" else "or"}</span>'
                   for p in s.replace("→", " → ").replace("|", " | ").split("  ") if p.strip())
def flow2(s):
    toks = []
    for chunk in s.split("→"):
        alts = [a.strip() for a in chunk.split("|")]
        toks.append('<span class="alt">' + '<span class="or">/</span>'.join(f'<span class="st">{esc(a)}</span>' for a in alts) + '</span>')
    return '<span class="ar">→</span>'.join(toks)
lc = "".join(f'<div class="lc"><div class="lcn">{esc(a)}</div><div class="lcf">{flow2(b)}</div>{f"<p>{esc(c)}</p>" if c else ""}</div>' for a, b, c in LIFECYCLES)
body.append(f'''<section id="s-09"><div class="sh"><span class="num">09</span><h2>Status lifecycles</h2></div><div class="lcs">{lc}</div></section>''')

jr = "".join(f'<tr><td><span class="pill {"q" if a=="Queue" else "c"}">{esc(a)}</span></td><td class="fn">{esc(b)}</td><td class="cm">{esc(c)}</td></tr>' for a, b, c in JOBS)
body.append(f'''<section id="s-10"><div class="sh"><span class="num">10</span><h2>Async jobs</h2></div>
<div class="tw"><table class="ft"><thead><tr><th>Kind</th><th>Job</th><th>Does</th></tr></thead><tbody>{jr}</tbody></table></div></section>''')

dr = "".join(f'<div class="dc"><div class="did">{esc(a)}</div><div><div class="dq">{esc(b)}</div><div class="dr"><span>Decided</span> {esc(c)}</div></div></div>' for a, b, c in OPEN_DECISIONS)
body.append(f'''<section id="s-11"><div class="sh"><span class="num">11</span><h2>Decisions</h2></div>
<p class="lead">Resolved 10 Oct 2026 and applied to the tables above.</p><div class="dcs">{dr}</div></section>''')

CSS = open("style.css").read()
page = f'''<title>Form Builder ERD</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Schibsted+Grotesk:wght@500;600;700&family=Source+Sans+3:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap">
<style>{CSS}</style>
<div class="wrap">
<header class="top">
  <div class="eyebrow">System ERD · v0.2 · decisions applied</div>
  <h1>Form Builder</h1>
  <p class="sub">Multi-tenant form builder on Laravel 13 (Cobley backend) and MySQL 8. Choice-only questions, email-OTP respondents, timed attempts with tab, fullscreen and copy/paste integrity rules.</p>
  <div class="stats"><div><b>{len(E)}</b><span>tables</span></div><div><b>{len(R)}</b><span>relationships</span></div><div><b>{len(SECTIONS)}</b><span>domains</span></div><div><b>{len(OPEN_DECISIONS)}</b><span>decisions locked</span></div></div>
</header>
<div class="grid">
<nav class="toc" aria-label="Sections">{"".join(toc)}</nav>
<main>{"".join(body)}</main>
</div>
<footer>Source of truth: <code>erd_data.py</code> → <code>system_erd.md</code>. Field types map to Laravel migrations: <code>ulid</code> = <code>$table->ulid()</code>, <code>enum</code> = string-backed PHP enum cast.</footer>
</div>'''
open("erd.html", "w").write(page)
print("ok", len(E), len(R))
