# LESSONPLAN.md — the content contract

You are **filling in a pre-seeded single-file lesson-plan page**, not building one.

The page skeleton, the design system and all interactive behaviour already exist and are
frozen. Your job is content only.

## What you may write

Write **exactly one file**:

| File | What it holds |
| --- | --- |
| `content/data.json` | the content manifest (nav, tasks, quiz, cards, …) |

Read it before you start; it is seeded with a complete example and `FILL:` markers.
The manifest is parsed as **JSON** and injected into the page as `window.LESSON_DATA`;
`data.json` must stay valid JSON — no comments, no trailing commas. Its `meta` object fills
the page `<title>`, the meta description, the top bar, the footer, and all section text.

## What you must never touch

- `shell.html` — the frozen shell (`<head>`, all CSS, the topbar/nav/footer chrome and the
  whole JS framework). Do **not** edit it, rename it, or copy its CSS into your output.
- `content/sections.html` — a server-side template filled automatically from `data.json`
  by the assembly step. Do **not** edit it; editing it will have no effect and may break
  the page.
- `index.html` — the server assembles it from `shell.html` + your data *after* you finish.
  Never create or edit it. If you do, it will be overwritten.
- Do not add any other file.

## Hard rules

1. Replace **every** `FILL:` marker. Leave none behind — no `FILL:`, no `TODO`, no ellipsis.
   The server refuses to assemble while any `FILL:` remains, so this is also what makes
   your work appear.
2. Emit complete content. Never truncate a section to save space.
3. `data.json` must be valid JSON and its ids must be internally consistent
   (theories ↔ flashcards ↔ scenarios).
4. Section ids in `nav` must match the sections already defined in the page template,
   and must be in the same order.
5. All content must be in the language the user asked for.

## `LESSON_DATA` schema

See `content/data.json` — it is seeded with a complete, working example.

Key invariants:
- `theories[].id`, `flashcards[].id` and `scenarios[].a` share one id space — every
  flashcard id and every scenario answer must name an existing theory.
- `theories[].desc` / `who` and `meta.footer` may contain inline HTML (they are injected
  as markup). Everything else is plain text.
- Counts the page shows are derived from arrays, so there is nothing to keep in sync:
  the critique total is `critiques[].sentences` summed, the deck score is out of
  `flashcards.length`, and the scenario score is out of `scenarios.length`.

The `meta` object also drives the section text. Key fields:

| Key | Where it appears |
| --- | --- |
| `meta.intro` | Hero paragraph |
| `meta.duration` / `classSize` / `level` / `language` | Hero pills |
| `meta.pedagogy` / `framing` / `aiRole` / `assessment` | Hero meta-grid |
| `meta.ilosIntro` | Outcomes section intro |
| `meta.aiDesignPrinciple` | Outcomes design-principle callout |
| `meta.preclassIntro` | Pre-Class section intro |
| `meta.preclassToolLabel` | Pre-Class tool accordion label |
| `meta.activitiesIntro` | Activities section intro |
| `meta.chatOpening` | Simulated AI chat opening line |
| `meta.chatCritiquePlaceholder` | Chat critique textarea placeholder |
| `meta.assessmentIntro` | Assessment section intro |
| `meta.postTestItems` | Post-test item count pill |
| `meta.postTestDesc` | Post-test mirror description |
| `meta.alignmentIntro` | Alignment section intro |
| `meta.resourcesIntro` | Resources section intro |
| `meta.scenarioIntro` | Scenario quiz intro |
| `meta.cmCustomPlaceholder` / `cmNotePlaceholder` | Concept-map field placeholders |
| `meta.differentiationIntro` | Differentiation section intro |
| `meta.reflectionIntro` | Reflection section intro |

Array fields that drive repeated structures:

| Key | Structure |
| --- | --- |
| `roadmap[]` `{phase, mins, desc}` | Lesson roadmap timeline |
| `ilos[]` `{id, desc, ai}` | ILO table rows |
| `prepItems[]` `{text}` | Pre-class required prep list |
| `preclassToolSteps[]` `{text}` | LMS accordion steps |
| `round1.journalPrompt1` / `journalPrompt2` | Instructor observation journal labels |
| `instructorGuidance[]` `{text}` | Instructor guidance bullet points |
| `assessmentMethods[]` `{method, weight, what}` | Assessment methods table rows |
| `alignmentRows[]` `{ilo, activity, assessment, level}` | Alignment matrix rows |
| `support[]` `{text}` | Support strategies list |
| `extension[]` `{text}` | Extension tasks list |

## External tool integration

Where the lesson uses an outside tool (Mentimeter, Kahoot, Padlet, Google Forms, Jamboard, an
LMS quiz engine, …), you can reference it in the `meta.preclassToolLabel` field and list the
steps in `preclassToolSteps[]`.

## Checklist before you finish

- [ ] No `FILL:` or placeholder text anywhere in `data.json`.
- [ ] `data.json` is valid JSON and its ids are internally consistent
      (theories ↔ flashcards ↔ scenarios).
- [ ] `nav` matches the page sections, in order.
- [ ] Nothing outside `content/data.json` touched.
