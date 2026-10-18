# LESSONPLAN.md — the content contract

You are **filling in a pre-seeded single-file lesson-plan page**, not building one.

The page skeleton, the design system and all interactive behaviour already exist and are
frozen. Your job is content only.

## What you may write

Write **exactly two files**:

| File | What it holds |
| --- | --- |
| `content/sections.html` | the page body — `<section class="block">` blocks only |
| `content/data.json` | the content manifest (nav, tasks, quiz, cards, …) |

Read both before you start; they are seeded with a small example and `FILL` markers. The
manifest is parsed as **JSON** and injected into the page as `window.LESSON_DATA`;
`data.json` must stay valid JSON — no comments, no trailing commas. Its `meta` object fills
the page `<title>`, the meta description, the top bar and the footer.

## What you must never touch

- `shell.html` — the frozen shell (`<head>`, all CSS, the topbar/nav/footer chrome and the
  whole JS framework). Do **not** edit it, rename it, or copy its CSS into your output.
- `index.html` — the server assembles it from `shell.html` + your two files *after* you finish.
  Never create or edit it. If you do, it will be overwritten.
- Do not add any other file. Do not add `<style>` or `<script>` tags to `content/sections.html`.

`content/sections.html` is injected where the shell has the `{{BODY}}` marker, i.e. inside
`<main id="main"><div class="wrap">`. Start at `<section ...>` — do not emit `<html>`, `<body>`,
`<head>` or wrapper divs.

## Hard rules

1. Replace **every** `FILL` marker. Leave none behind — no `FILL`, no `TODO`, no ellipsis.
2. Emit complete content. Never truncate a section to save space.
3. Use only the classes listed below. No new ids. No inline `<style>`.
4. The first section must be `<section id="overview" class="block">` and must contain the hero
   and the four-counter `stat` row.
5. Section ids must match the `nav` array in `content/data.js` exactly, and in the same order.
6. All content must be in the language the user asked for.

## Required DOM hooks

The frozen JS binds to these. Each id / `data-*` hook must appear **exactly once** in
`content/sections.html`. You may re-order and re-word everything around them, but keep the
hooks verbatim.

**Counters (in the hero):** `statTasks` `statPre` `statPost` `statCrit`

**Pre-class:** `startPre` `preQuiz` `preTasks`

**Activities:** `peerTasks` · AI Critique Lab: `critiqueLab` `critCount` `critVerdicts`
`critTotal` `critFill` `critReset` · simulated chat: `chatWindow` `chatPrompts` `chatCritique`
`chatSave` · journal textareas: `data-journal="..."`

**Assessment:** `startPost` `postQuiz` `compareBox`

**Resources:** reference cards `theoryCards` · flashcard deck `chipPool` `slotPool` `fcScore`
`fcReset` · scenario quiz `scenarioQuiz` `scenarioScore` `scenarioCheck` `scenarioReset` ·
concept map `cmScenario` `cmCustom` `cmTheory` `cmNote` `cmAdd` `cmClear` `cmAI` `mapCanvas`
`mapEmpty` `mapCore` `mapScenarioLabel` `mapRing` `cmExport`

**Reflection / portfolio:** `allTasks` · `data-log="..."` textareas · `portRing`
`portRingText` `portTasks` `portPre`/`portPreBar` `portPost`/`portPostBar` `portCrit`/
`portCritBar` `portFc`/`portFcBar` `portCm`/`portCmBar` · `exportAll` `exportText`

Task-completion buttons use `data-task="<task id>"` and must match an id in
`LESSON_DATA.tasks`.

## Class library (all defined in `shell.html` — use these, invent nothing)

**Layout:** `wrap` `grid` `g2` `g3` `g4` `split` `two-col-list` `center` `block`

**Section headings:** `sec-head` `sec-num` `t` `eyebrow` `badge`

**Surfaces:** `card` `card-title` `ic` `tight` `stat` `n` `l` `meta-grid` `meta-item` `k` `v`
`kv` `ring` `inner` `score-bar` `score-big` `steps` `tablewrap`

**Callouts:** `callout` + `ai` `key` `note` `tip` `warn`; inner `ct`

**Hero:** `hero` `chips` `pill` + `brand` `teal` `amber` `rose` `violet` `green` `meta`

**Text:** `small` `muted` `mb0` `mt0` `sr-only` `sub` `who` `limit`

**Timeline:** `tl` `tl-item` (`tt` `td`)

**Tasks:** `tasklist` `task` (`box` `label`) — the JS renders the items; do not hand-write them

**Accordion:** `acc` `acc-body`

**Tool cards:** `tool-card` `tool-head` `tool-logo` `prompt-box`

**Interactive (the JS fills these):** `quiz-q` `qtop` `qnum` `opts` `opt` `marker` `explain`
`score-bar` `cat-grid` `cat-row` `cat-track` `cat-fill` · `critique` `critique-head`
`critique-body` `sent` `sent-text` `verdicts` `vbtn` `ai-bubble` `ai-avatar` `ai-text` ·
`chat` `msg` `user` · `fc-arena` `chip-pool` `chip` `slots` `slot` `slot-label` `slot-desc`
`dropzone` `swatch` `picked` `placed` `over` `bad` · `map-canvas` `map-empty` `map-core`
`map-ring` `map-node` `x` · `theory-card`

**Controls:** `btn` `btn-sm` `btn-primary` `btn-ghost` `btn-icon` `field` `checkline`
`inline-actions`

**Print:** `no-print` — add to anything that should not appear on paper.

## `LESSON_DATA` schema

See `content/data.json` — it is seeded with a complete, working example. The rule that trips
people up: `theories[].id`, `flashcards[].id` and `scenarios[].a` share one id space — every
flashcard id and every scenario answer must name an existing theory.

`theories[].desc` / `who` and `meta.footer` may contain inline HTML (they are injected as
markup). Everything else is plain text.

Counts the page shows are derived from these arrays, so there is nothing to keep in sync:
the critique total is `critiques[].sentences` summed, the deck score is out of
`flashcards.length`, and the scenario score is out of `scenarios.length`.

## External tool integration

Where the lesson uses an outside tool (Mentimeter, Kahoot, Padlet, Google Forms, Jamboard, an
LMS quiz engine, …), put the step-by-step instructions in a `<details class="acc">` block and
link it in-text with descriptive anchor text, e.g.
`<a href="https://www.mentimeter.com" target="_blank" rel="noopener">create a Mentimeter poll</a>`.
Give each tool a `<span class="badge pill teal">Tool</span>` summary label.

## Checklist before you finish

- [ ] No `FILL` or placeholder text anywhere in either file.
- [ ] Every required DOM hook present exactly once.
- [ ] `data.json` is valid JSON and its ids are internally consistent
      (theories ↔ flashcards ↔ scenarios).
- [ ] `nav` matches the emitted sections, in order.
- [ ] No `<style>`/`<script>` in `content/sections.html`; nothing outside the two files touched.
