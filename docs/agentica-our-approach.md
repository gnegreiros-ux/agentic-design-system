# Agentica — How we built this design system
**A document for our fellow designers, CX consultants, and managers**

---

## Why this document?

This design system was built differently from others.
Not because we wanted to make things complicated — but because we had a new problem to solve.

This document explains the approach, the steps, and the choices we made,
in language everyone can understand.

---

## The starting problem

Design systems have been around for a long time. They bring together an organization's
visual components (buttons, forms, colors, type) so every team
uses them the same way.

But today, teams work with **AI agents** — assistants like
Claude or Copilot — that generate code, propose designs, and make
automatic changes.

And that's where a problem showed up:

> **Agents make things up.** When they don't understand the intent behind a decision,
> they improvise. An agent that sees `#3B82F6` doesn't know whether it's an action color, <!-- audit-ignore: illustrative example hex in prose, not applied styling -->
> a decorative one, or an alert. It guesses. And sometimes it gets it wrong.

The question we asked ourselves:

> How do we build a design system that agents truly understand,
> without losing human control over important decisions?

---

## The central idea

Agentica is a **design system built to be read by humans AND by AI agents.**

Every decision is made explicit. Every rule is documented. Every component has a "contract"
that explains why it exists, how it works, and what can't be changed without approval.

**The founding principle, in one sentence:**

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│   Agents propose, detect, and execute.                  │
│   The last word is always human.                        │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## The approach, in 5 steps

### Step 1 — Laying the foundations (May 28, 2026)

Before writing a single line of code or creating a single component,
we set the rules of the game.

**Two founding documents were created:**

- `DESIGN.md` — the *brand contract*: who we are, what our principles are,
  how we make decisions
- `AGENTS.md` — the *guide for agents*: what they can do, what they can't
  do, and who to call when a doubt comes up

These two files are the system's *constitution*. Any agent working on Agentica
reads them first.

```
  ┌──────────────────┐     ┌──────────────────┐
  │    DESIGN.md     │     │    AGENTS.md      │
  │                  │     │                  │
  │  Who we are,     │     │  What agents     │
  │  our principles, │     │  can and         │
  │  our identity    │     │  cannot do       │
  └──────────────────┘     └──────────────────┘
          │                         │
          └────────────┬────────────┘
                       │
                  Source of truth
               for humans and agents
```

---

### Step 2 — Inventing a shared language (May 28-29)

The big discovery: for an agent to understand the *intent* behind a color
or a spacing value, you have to give it **names that carry meaning**, not just raw values.

So we created a **3-level token architecture**:

```
  LEVEL 1               LEVEL 2              LEVEL 3
  Raw values      →     UX intent      →     UI contracts
  (the facts)           (the meaning)        (the rules)

  ┌─────────────┐    ┌──────────────┐    ┌──────────────┐
  │             │    │              │    │              │
  │  blue-700   │───▶│ action.      │───▶│ button.      │
  │  #3B82F6    │    │ primary      │    │ critical.    │
  │  space-4    │    │              │    │ requires     │
  │  16px       │    │ feedback.    │    │ Confirmation │
  │             │    │ danger       │    │              │
  └─────────────┘    └──────────────┘    └──────────────┘
  primitives.json    semantic.json       component.json
```

**Why does this matter?**

When an agent sees `color.action.primary`, it immediately understands:
*"This color is reserved for the user's primary actions."*

When it sees `#3B82F6`, it knows nothing. It improvises.

**The absolute rule:** raw values never go directly into components.
Everything passes through the middle layer — the semantic layer.

---

### Step 3 — Building the visual foundations (May 29)

With the language in place, we laid down the system's visual foundations:

| Decision | Why |
|----------|----------|
| **Atkinson Hyperlegible font** | Designed for accessibility — better readability for people with low vision or dyslexia |
| **4px grid** | Every spacing value is a multiple of 4 — automatic mathematical consistency |
| **Lucide icons** | Open-source library, consistent, readable by agents |
| **Teal palette** | Primary action color, WCAG AA tested (sufficient contrast for accessibility) |
| **Minor Third typographic scale** | Harmonious mathematical progression from xs to 5xl |

These choices aren't arbitrary. Each one has an **ADR** — an *Architecture Decision Record* —
that explains why we chose this option over another, and which alternatives
were rejected and why.

> An ADR is the written memory of a decision. Not just *what* we decided,
> but *why*, and what we ruled out.

---

### Step 4 — Building the components (May 30 – June 5)

With the foundations in place, we built the components one by one.

But **every component follows a 4-step process**:

```
  ┌─────────────────────────────────────────────────────────┐
  │                                                         │
  │  1. UX REVIEW      What recognized patterns exist       │
  │                    for this type of component?          │
  │                    (Nielsen, IF Patterns, IxDF...)      │
  │                            │                           │
  │                            ▼                           │
  │  2. CONTRACT       Write the component's "contract":    │
  │                    intent, variants, accessibility      │
  │                            │                           │
  │                            ▼                           │
  │  3. BUILD          Code + document in Storybook         │
  │                            │                           │
  │                            ▼                           │
  │  4. APPROVAL       Human validation before publishing   │
  │                                                         │
  └─────────────────────────────────────────────────────────┘
```

**The components built so far:**

```
  Forms            Navigation       Content          Feedback
  ───────────      ──────────       ───────          ────────
  Button           Link             Card             Banner
  Input            Segmented        Table            Badge
  Checkbox         (selector)       Code Block       (label)
  Radio
  Toggle
  Icon
```

---

### Step 5 — Putting guardrails in place (May 30 – June 8)

A design system with no monitoring is a system that drifts.
Teams create local variations, agents make up values,
and within a few months, no one is using the real system anymore.

So we put **automatic guardrails** in place:

```
  On every code change...

  ┌─────────────────────────────────────────────────────────┐
  │                                                         │
  │  audit-tokens     Detects colors and spacing            │
  │                   values written "hardcoded"            │
  │                   (not tokenized)                       │
  │                                                         │
  │  axe-core         Checks accessibility — contrast,      │
  │                   keyboard navigation, ARIA             │
  │                                                         │
  │  Chromatic        Takes screenshots and                 │
  │                   detects visual regressions             │
  │                                                         │
  │  Playwright       User interaction tests                │
  │                                                         │
  └─────────────────────────────────────────────────────────┘
              │
              ▼
       If a violation is detected:
       the code CANNOT be merged.
       A human must review and approve.
```

---

## Governance: who does what?

This is perhaps the project's most important decision.

```
  ┌──────────────────────────────────────────────────────────────┐
  │                                                              │
  │  What an AI agent CAN do:                                    │
  │                                                              │
  │    ✓  Read every contract and token                          │
  │    ✓  Generate code that respects the tokens                 │
  │    ✓  Detect drift (hardcoded values, stale tokens)           │
  │    ✓  Open a proposed fix (Pull Request)                     │
  │    ✓  Produce accessibility reports                           │
  │                                                              │
  ├──────────────────────────────────────────────────────────────┤
  │                                                              │
  │  What an AI agent CANNOT do without approval:                │
  │                                                              │
  │    ✗  Modify a semantic token (the intent layer)             │
  │    ✗  Change a component contract                            │
  │    ✗  Delete anything at all                                 │
  │    ✗  Deploy to production                                   │
  │    ✗  Ignore an accessibility violation                      │
  │                                                              │
  └──────────────────────────────────────────────────────────────┘
```

**Why this boundary?**

An agent can be "certain" about a change that breaks something
it doesn't understand — an undocumented team agreement, a brand
strategy, a legal accessibility commitment. Technical confidence
doesn't replace human judgment.

---

## What this changes in practice

| Before Agentica | With Agentica |
|----------------|---------------|
| An agent makes up token names | It reads the contracts, it understands the intent |
| A color change breaks 30 components | The semantic layer absorbs the change |
| Drift is discovered in production | Automatic detection before every merge |
| Design decisions live in people's heads | Every decision has an ADR — traceable forever |
| Dark mode requires redoing everything | Just remap the semantic tokens |

---

## The timeline at a glance

```
  May 28          May 29          May 30          Jun 1-8
  ────────        ────────        ────────        ────────
  Foundations     Visuals         Build           Components
  DESIGN.md       Semantic        Brand           continued
  AGENTS.md       tokens          "Agentica"      Guardrails
  52 rules        Typography      Identity        Automated tests
  ADR-001→016     Colors          Initial         W3C DTCG
                  4px grid        components      compliance
```

**From May 28 to June 8, 2026 — 11 days of building.**
52 decisions documented. 14 components. 1 documentation site.

---

## What this system is not

- It's not a "ready-to-use" component library
- It's not a Figma replacement
- It's not an autonomous tool

**It's a foundation.** A formalized governance template, a contract
readable by both humans AND agents, a starting point to adapt
to any organization.

---

## What we're aiming for next

Agentica is a base. Trust between humans and agents is built
progressively. As the system accumulates evidence of reliability
— documented decisions, green tests, clean audits — agents'
action boundaries can be widened, by explicit human decision,
documented in an ADR.

**The end goal:**

> A system where agents do the repetitive work and detect drift,
> while humans focus on strategic, creative,
> and organizational decisions.

---

*Document written from the 52 ADRs, the construction log,
and the git history of the Agentica project — June 2026.*

*System author: Guilherme Negreiros*
*Documentation site: https://agentica.design*
