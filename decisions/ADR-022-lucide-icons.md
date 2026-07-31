# ADR-022 — Lucide Icons as the icon library

> **Date:** 2026-05-29
> **Status:** ✅ Active
> **Decision-makers:** Guilherme Negreiros — Design System Lead
> **Type:** contract
> **Logical path:** decisions/ADR-022-lucide-icons.md
> **Read before:** AGENTS.md, DESIGN.md, .claude/rules/tokens-system.md
> **Relations:** tokens/primitives.json, tokens/semantic.json, components/agtc-icon.js, guidelines/components/icon.md

---

## Reference UX patterns applied

> Added 2026-06-01 via the `ux-pattern-review` workflow (ADR-036). Decision: **all approved**.
> `agtc-icon` has no dedicated implementation ADR — its pattern decision is recorded here.
> Detail and links: `guidelines/components/icon.md` § REFERENCE UX PATTERNS.

| Pattern | Source |
|---------|--------|
| Icon + text when meaning is not universal | NN/g — icon usability |
| Label mandatory when the icon carries the information | NN/g |
| Decorative icons hidden from AT (`aria-hidden`) | NN/g |
| Consistent, non-misleading meaning | IF — transparency |

---

## Context

The design system referenced `<agtc-icon>` in component examples (notably `guidelines/components/button.md`) without any icon system being defined. No icon size token existed. Teams were creating ad hoc solutions (emoji, inline SVG, Tailwind classes) — each one a potential source of drift.

---

## Decision

### Library: Lucide Icons

**Lucide** (a fork of Feather Icons) is adopted as the system's official icon library.

**Technical characteristics:**
- 1,500+ icons, full UI coverage
- Strict geometric consistency: a constant `strokeWidth: 1.5px` across all icons
- Pure SVG format — no font, no mandatory sprite
- Tree-shakeable — only the icons actually used are bundled
- ISC license (© Lucide Icons and Contributors) — no commercial constraint. Icons still
  derived from the original Feather project additionally carry Feather's MIT credit
  (© Cole Bemis) — see `node_modules/lucide/LICENSE`. Corrected 2026-07-31: this ADR
  originally said "MIT" for the whole library, which was inaccurate.

**Industry adoption:** Linear, Vercel, shadcn/ui, Raycast — a signal of quality and longevity.

### Web Component: `agtc-icon`

A Lit component wraps Lucide and exposes the design system's API:

```javascript
// Usage
<agtc-icon name="trash-2" size="control" label="Supprimer"></agtc-icon>
<agtc-icon name="check" size="inline" decorative></agtc-icon>
```

**Props:**
| Prop | Type | Values | Default |
|------|------|---------|--------|
| `name` | String | Lucide name (e.g. `"trash-2"`) | — (required) |
| `size` | String | `"inline"` / `"control"` / `"nav"` | `"control"` |
| `label` | String | Accessible text | — |
| `decorative` | Boolean | Purely decorative icon | `false` |

**WCAG 1.1.1 rule:** If `decorative` is absent, `label` is mandatory → `aria-label` is injected. If `decorative` is present → `aria-hidden="true"`.

### Icon size tokens

```json
// primitives.json
"iconSize": {
  "sm": "16px",  // inline — within text
  "md": "20px",  // control — in a button, input
  "lg": "24px"   // nav — navigation, emphasis
}

// semantic.json
"icon.size.inline":  "{primitive.iconSize.sm}"
"icon.size.control": "{primitive.iconSize.md}"
"icon.size.nav":     "{primitive.iconSize.lg}"
```

### Integration into the documentation site

Lucide is added as an npm dependency in `site/package.json`. The build generates an icon reference page at `site/dist/components/icon.html`.

---

## WCAG rationale

- **1.1.1 (Non-text Content):** Every semantic icon has an `aria-label`. Decorative icons have `aria-hidden="true"`.
- **1.4.3 (Contrast):** Icons inherit `color: currentColor` — contrast is that of the parent text, always compliant.
- **2.5.3 (Label in Name):** Icon-only buttons expose their label via `aria-label` on `agtc-icon`.

---

## Rejected alternatives

| Alternative | Reason for rejection |
|-------------|-----------------|
| **Material Icons** | Font icon — FOUT issues, more complex accessibility, coupling to Google. |
| **Heroicons** | Equivalent quality but lower adoption, fewer variants. |
| **Font Awesome** | Freemium model, proprietary dependency for advanced icons. |
| **Custom SVG sprite** | Unsustainable manual maintenance for 100+ icons. |
| **Phosphor Icons** | Equivalent quality but a React-centric ecosystem, less Web Components support. |

---

## Consequences

**For tokens:**
- `primitive.iconSize` (sm/md/lg) and `semantic.icon.size` (inline/control/nav) added

**For components:**
- `components/agtc-icon.js` provides the Lit implementation contract
- `guidelines/components/icon.md` documents usage rules and anti-patterns

**For AI agents:**
- `size="control"` is a readable intent — the agent understands it as an icon within an interactive control
- Anti-patterns (icon with no label, hardcoded size) are auditable

**For teams:**
- End of ad hoc solutions: a single API, a single token, a single library
- Icon names documented on lucide.dev — the canonical reference

<!-- FR -->

# ADR-022 — Lucide Icons comme bibliothèque d'icônes

> **Date :** 2026-05-29
> **Statut :** ✅ Actif
> **Décideurs :** Guilherme Negreiros — Design System Lead
> **Type:** contract
> **Chemin logique:** decisions/ADR-022-lucide-icons.md
> **Lecture avant:** AGENTS.md, DESIGN.md, .claude/rules/tokens-system.md
> **Relations:** tokens/primitives.json, tokens/semantic.json, components/agtc-icon.js, guidelines/components/icon.md

---

## Patterns UX de référence appliqués

> Ajouté le 2026-06-01 via le workflow `ux-pattern-review` (ADR-036). Décision : **tous approuvés**.
> `agtc-icon` n'a pas d'ADR d'implémentation dédié — sa décision de patterns est consignée ici.
> Détail et liens : `guidelines/components/icon.md` § PATTERNS UX DE RÉFÉRENCE.

| Pattern | Source |
|---------|--------|
| Icône + texte quand le sens n'est pas universel | NN/g — icon usability |
| Label obligatoire si l'icône porte l'information | NN/g |
| Icônes décoratives masquées aux AT (`aria-hidden`) | NN/g |
| Signification cohérente et non trompeuse | IF — transparence |

---

## Contexte

Le design system référençait `<agtc-icon>` dans les exemples de composants (notamment `guidelines/components/button.md`) sans qu'aucun système d'icônes ne soit défini. Aucun token de taille d'icône n'existait. Les équipes créaient des solutions ad hoc (emoji, SVG inline, classes Tailwind) — chacune une dérive potentielle.

---

## Décision

### Bibliothèque : Lucide Icons

**Lucide** (fork de Feather Icons) est adopté comme bibliothèque d'icônes officielle du système.

**Caractéristiques techniques :**
- 1 500+ icônes, couverture UI complète
- Cohérence géométrique stricte : `strokeWidth: 1.5px` constant sur toutes les icônes
- Format SVG pur — pas de font, pas de sprite obligatoire
- Tree-shakeable — seules les icônes utilisées sont bundlées
- Licence ISC (© Lucide Icons and Contributors) — aucune contrainte commerciale. Les icônes
  toujours dérivées du projet Feather portent en plus le crédit MIT d'origine de Feather
  (© Cole Bemis) — voir `node_modules/lucide/LICENSE`. Corrigé le 2026-07-31 : cet ADR disait
  à l'origine « MIT » pour toute la bibliothèque, ce qui était inexact.

**Adoption sectorielle :** Linear, Vercel, shadcn/ui, Raycast — signal de qualité et de pérennité.

### Web Component : `agtc-icon`

Un composant Lit encapsule Lucide et expose l'API du design system :

```javascript
// Usage
<agtc-icon name="trash-2" size="control" label="Supprimer"></agtc-icon>
<agtc-icon name="check" size="inline" decorative></agtc-icon>
```

**Props :**
| Prop | Type | Valeurs | Défaut |
|------|------|---------|--------|
| `name` | String | Nom Lucide (ex: `"trash-2"`) | — (requis) |
| `size` | String | `"inline"` / `"control"` / `"nav"` | `"control"` |
| `label` | String | Texte accessible | — |
| `decorative` | Boolean | Icône purement décorative | `false` |

**Règle WCAG 1.1.1 :** Si `decorative` est absent, `label` est obligatoire → `aria-label` injecté. Si `decorative` est présent → `aria-hidden="true"`.

### Tokens de taille d'icône

```json
// primitives.json
"iconSize": {
  "sm": "16px",  // inline — dans un texte
  "md": "20px",  // control — dans un bouton, input
  "lg": "24px"   // nav — navigation, emphase
}

// semantic.json
"icon.size.inline":  "{primitive.iconSize.sm}"
"icon.size.control": "{primitive.iconSize.md}"
"icon.size.nav":     "{primitive.iconSize.lg}"
```

### Intégration dans le site de documentation

Lucide est ajouté comme dépendance npm dans `site/package.json`. Le build génère une page de référence des icônes à `site/dist/components/icon.html`.

---

## Argumentaire WCAG

- **1.1.1 (Contenu non textuel) :** Toute icône sémantique a un `aria-label`. Les icônes décoratives ont `aria-hidden="true"`.
- **1.4.3 (Contraste) :** Les icônes héritent de `color: currentColor` — le contraste est celui du texte parent, toujours conforme.
- **2.5.3 (Label dans le nom) :** Les boutons icône-seule exposent leur label via `aria-label` sur `agtc-icon`.

---

## Alternatives rejetées

| Alternative | Raison du rejet |
|-------------|-----------------|
| **Material Icons** | Font icon — problèmes FOUT, accessibilité plus complexe, couplage Google. |
| **Heroicons** | Qualité équivalente mais moindre adoption, moins de variantes. |
| **Font Awesome** | Modèle freemium, dépendance propriétaire pour icônes avancées. |
| **SVG sprite custom** | Maintenance manuelle insoutenable pour 100+ icônes. |
| **Phosphor Icons** | Qualité équivalente mais écosystème React-centrique, moins de support Web Components. |

---

## Conséquences

**Pour les tokens :**
- `primitive.iconSize` (sm/md/lg) et `semantic.icon.size` (inline/control/nav) ajoutés

**Pour les composants :**
- `components/agtc-icon.js` fournit le contrat d'implémentation Lit
- `guidelines/components/icon.md` documente les règles d'usage et les anti-patterns

**Pour les agents IA :**
- `size="control"` est une intention lisible — l'agent comprend que c'est une icône dans un contrôle interactif
- Les anti-patterns (icône sans label, taille en dur) sont auditables

**Pour les équipes :**
- Fin des solutions ad hoc : une seule API, un seul token, une seule bibliothèque
- Noms d'icônes documentés sur lucide.dev — référence canonique
