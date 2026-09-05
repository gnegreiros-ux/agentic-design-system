# ADR-033 — `agtc-input` implementation

> **Date:** 2026-05-31
> **Status:** ✅ Active
> **Decision-makers:** Design System Lead
> **Type:** contract
> **Logical path:** decisions/ADR-033-agtc-input-implementation.md
> **Read before:** AGENTS.md, DESIGN.md, .claude/rules/tokens-system.md, .claude/rules/development.md
> **Relations:** decisions/ADR-031-agtc-button-implementation.md, decisions/ADR-002-lit-web-components.md, tokens/component.json

---

## Context

`agtc-input` is the system's second component. It covers text entry
in forms — the most frequent entry point for user data.

Three constraints guided the decisions:

1. **Accessibility** — a text field with no visible label is inaccessible
   (WCAG 1.3.1). Every state (error, disabled, read-only) must be
   communicated to the accessibility tree, not just visually.

2. **Shadow DOM** — the `<label for="id">` association doesn't cross
   Shadow DOM boundaries. The implementation must work around this limitation.

3. **Consistency with `agtc-button`** — same hybrid icon approach (property +
   slot), same event conventions, same token structure.

---

## Decisions

### Decision 1 — Label and input colocated in the Shadow DOM

**Problem:** An external `<label for="id">` can't point to an `<input>`
inside the Shadow DOM.

**Decision:** The label is rendered inside the Shadow DOM with a `for`
pointing to the internal `id` of the `<input>`. A static counter guarantees
id uniqueness across instances.

**Rejected alternative:** `aria-label` on the input instead of a visible label.
Rejected: violates WCAG 1.3.1 (the label must be persistent and visible, not only
declared for AT).

---

### Decision 2 — Focus ring on the `.control` wrapper, not on the input

**Problem:** The native input has `outline: none` to allow custom styling.
Focus must remain visible (WCAG 2.4.7).

**Decision:** The `.control` wrapper carries the focus ring via `:focus-within`.
`outline: 2.5px solid` + `outline-offset: 2px` — identical to `agtc-button`.

**Justification:** The focus ring on the wrapper is visually cleaner
(frames the whole control including icons) and remains WCAG compliant
because the focus indicator is clearly visible.

---

### Decision 3 — `aria-describedby` for helper-text and error-message

The ids `{_id}-helper` and `{_id}-error` are always present in the DOM.
`aria-describedby` is built dynamically: only the relevant ids
are included depending on the component's state.

The error message carries `role="alert"` to announce the error to screen
readers as soon as it appears, with no need to navigate to the element.

**Figma parity (2026-09-05):** a file-wide audit found `helper-text` genuinely broken on the
`Input` ComponentSet — `componentPropertyDefinitions` listed the property, but no variant
actually rendered it (predicted by an earlier session note, now confirmed). Fixed by adding a
new `helper-text` TEXT layer on all 15 variants, positioned in the auto-layout stack between
`field` and `error-message` (mirroring the code's DOM order: control → helper → error), bound
to the existing `Helper Text` property for its characters, plus a new `Show Helper Text`
Boolean property (default `false`) for visibility — same pattern as `Show Label` (Decision 7
below). Verified standalone and combined with an error state (correct stacking, correct
colors). `error-message` was audited in the same pass and found already correctly wired on
the 2 `State=Error` variants — no bug, no change needed there.

---

### Decision 4 — Native show/hide toggle for `type="password"`

An internal button is rendered automatically when `type="password"`. It toggles
the input's `type` attribute between `password` and `text`.

**Justification:** Letting the user verify what they typed is an
accessibility requirement (avoids errors on masked passwords).
The button's aria-label switches between "Show password" and
"Hide password".

The `suffix` slot remains available for free composition if the consumer
wants to replace the native toggle.

---

### Decision 5 — `live()` directive for value synchronization

The input uses `.value="${live(this.value)}"` to synchronize the Lit
property's value with the input's native value across re-renders.

Without `live()`, Lit doesn't update the native value if the user has
started typing (DOM drift). `live()` always compares against the current
DOM value, guaranteeing consistency.

---

### Decision 6 — Removal of native spinners on `type="number"`

The native CSS spinners (`-webkit-inner-spin-button`) are removed.
Control of the numeric value happens via keyboard (`↑`/`↓`) and direct input.

**Justification:** Native spinners are visually inconsistent across
browsers and can't be styled with the system's tokens.

---

### Decision 7 — `hide-label`: visually-hidden label exception for icon-clarified search fields

**Problem:** Search fields are a recognized UX pattern where a visible floating label is often
considered redundant next to an icon + placeholder (e.g. a header search box). Decision 1 above
already rejected `aria-label`-only labelling — this exception does not revisit that rejection.

**Decision:** `hide-label` keeps the exact same real `<label for="id">` from Decision 1, fully
in the DOM and linked, and only hides it *visually* via a `.visually-hidden` class (absolute
positioning + 1×1px clip — the same technique already used by `agtc-table`'s `captionHidden`),
never `display:none`/`visibility:hidden`, which would remove the accessible name entirely.
Requires `icon` to be set — without a visible icon, the field's purpose would no longer be
unambiguous, per W3C ARIA14's own condition for using an invisible label ("the context and
visual appearance of the control make its purpose clear"). `updated()` logs a console warning
if `hide-label` is set without `icon`, mirroring the existing missing-`label` warning.

**Why this doesn't contradict Decision 1:** Decision 1 rejected removing the persistent,
programmatically-associated label in favor of `aria-label`. `hide-label` keeps that same label
element — it changes only its visual rendering, not its presence or association. WCAG 1.3.1 is
satisfied identically to every other state of this component.

**Approved via `ux-pattern-review` (ADR-036) on 2026-09-05** — see the new pattern row below and
`guidelines/components/input.md` § UX Patterns Reference for the full source discussion,
including NN/g's caveat that the *field itself* (not just the label) must stay visible.

---

## Reference UX patterns applied

> Added on 2026-06-01 via the `ux-pattern-review` workflow (ADR-036). Design System Lead
> decision: **all patterns approved**. Details and links in
> `guidelines/components/input.md` § REFERENCE UX PATTERNS.

| Pattern | Source |
|---------|--------|
| Validation `onBlur`, re-validation while typing once in error | NN/g — How to Report Errors in Forms |
| Inline error + `role="alert"` | NN/g — Error-Message Guidelines |
| Constructive error message | NN/g — Error-Message Guidelines |
| Persistent help text via `aria-describedby` | NN/g |
| Required marker `*` + `aria-required` | NN/g — Forms |
| Forgiving format (`tel`/`number`) | IxDF — forgiving formats |
| Visible label always present | NN/g |
| Anti hostile patterns (no clearing the field on error) | NN/g — Hostile Patterns in Error Messages |
| **Exception** (2026-09-05) — visually-hidden label for icon-clarified search fields (`hide-label`) | W3C WAI — Labelling Controls · W3C ARIA14 · NN/g — The Magnifying-Glass Icon |

---

## Version 1.0 scope

| Included | Excluded (future version) |
|--------|------------------------|
| 7 native types | `type="date"`, `type="file"` |
| States: default / focus / invalid / disabled / readonly | Success state (positive validation) |
| Prefix/suffix icons (hybrid prop+slot) | Character counter |
| Built-in password toggle | Custom suggestions / autocomplete |
| helper-text + error-message | Multiline field (`agtc-textarea`) |

---

## Tokens used

| Token | Usage |
|-------|-------|
| `--agtc-input-default-*` | Component tokens compiled from `tokens/component.json` |
| `--agtc-semantic-color-feedback-danger` | Error message color |
| `--agtc-semantic-color-background-subtle` | Disabled state background |
| `--agtc-semantic-color-text-disabled` | Disabled state text |
| `--agtc-semantic-color-text-secondary` | Helper text + icons |
| `--agtc-semantic-typography-body-*` | Typography of the entered value |
| `--agtc-semantic-typography-label-*` | Typography of the label, helper, error |

<!-- FR -->

# ADR-033 — Implémentation de `agtc-input`

> **Date :** 2026-05-31
> **Statut :** ✅ Actif
> **Décideurs :** Design System Lead
> **Type:** contract
> **Chemin logique:** decisions/ADR-033-agtc-input-implementation.md
> **Lecture avant:** AGENTS.md, DESIGN.md, .claude/rules/tokens-system.md, .claude/rules/development.md
> **Relations:** decisions/ADR-031-agtc-button-implementation.md, decisions/ADR-002-lit-web-components.md, tokens/component.json

---

## Contexte

`agtc-input` est le deuxième composant du système. Il couvre la saisie de texte
dans les formulaires — le point d'entrée le plus fréquent des données utilisateur.

Trois contraintes ont guidé les décisions :

1. **Accessibilité** — un champ de saisie sans label visible est inaccessible
   (WCAG 1.3.1). Chaque état (erreur, désactivé, lecture seule) doit être
   communiqué à l'arbre d'accessibilité, pas seulement visuellement.

2. **Shadow DOM** — l'association `<label for="id">` ne traverse pas les
   frontières Shadow DOM. L'implémentation doit contourner cette limite.

3. **Cohérence avec `agtc-button`** — même approche icône hybride (propriété +
   slot), mêmes conventions d'événements, même structure de tokens.

---

## Décisions

### Décision 1 — Label et input colocalisés dans le Shadow DOM

**Problème :** `<label for="id">` externe ne peut pas pointer vers un `<input>`
dans le Shadow DOM.

**Décision :** Le label est rendu à l'intérieur du Shadow DOM avec un `for`
pointant vers l'`id` interne de l'`<input>`. Un compteur statique garantit
l'unicité des ids entre instances.

**Alternative rejetée :** `aria-label` sur l'input à la place du label visible.
Rejeté : viole WCAG 1.3.1 (le label doit être persistant et visible, pas seulement
déclaré pour les AT).

---

### Décision 2 — Focus ring sur le wrapper `.control`, pas sur l'input

**Problème :** L'input natif a `outline: none` pour permettre un style custom.
Le focus doit rester visible (WCAG 2.4.7).

**Décision :** Le wrapper `.control` porte le focus ring via `:focus-within`.
`outline: 2.5px solid` + `outline-offset: 2px` — identique à `agtc-button`.

**Justification :** Le focus ring sur le wrapper est visuellement plus propre
(encadre l'ensemble du contrôle incluant les icônes) et reste WCAG conforme
car l'indicateur de focus est clairement visible.

---

### Décision 3 — `aria-describedby` pour helper-text et error-message

Les ids `{_id}-helper` et `{_id}-error` sont toujours présents dans le DOM.
`aria-describedby` est construit dynamiquement : seuls les ids pertinents
sont inclus selon l'état du composant.

Le message d'erreur porte `role="alert"` pour annoncer l'erreur aux lecteurs
d'écran dès qu'elle apparaît, sans nécessiter de navigation vers l'élément.

**Parité Figma (2026-09-05) :** un audit fichier-complet a révélé que `helper-text` était
réellement cassé sur le ComponentSet `Input` — `componentPropertyDefinitions` listait la
propriété, mais aucune variante ne la rendait réellement (prédit par une note de session
antérieure, maintenant confirmé). Corrigé en ajoutant un nouveau calque TEXT `helper-text` sur
les 15 variantes, positionné dans la pile auto-layout entre `field` et `error-message`
(reflétant l'ordre DOM du code : contrôle → aide → erreur), lié à la propriété existante
`Helper Text` pour son texte, plus une nouvelle propriété Boolean `Show Helper Text` (défaut
`false`) pour la visibilité — même pattern que `Show Label` (Décision 7 ci-dessous). Vérifié
seul et combiné avec un état d'erreur (empilement et couleurs corrects). `error-message` a été
audité dans la même passe et confirmé déjà correctement câblé sur les 2 variantes
`State=Error` — aucun bug, aucun changement nécessaire là.

---

### Décision 4 — Toggle show/hide natif pour `type="password"`

Un bouton interne est rendu automatiquement quand `type="password"`. Il bascule
l'attribut `type` de l'input entre `password` et `text`.

**Justification :** Permettre à l'utilisateur de vérifier sa saisie est une
exigence d'accessibilité (évite les erreurs sur les mots de passe masqués).
L'aria-label du bouton bascule entre "Afficher le mot de passe" et
"Masquer le mot de passe".

Le slot `suffix` reste disponible pour la composition libre si le consommateur
veut remplacer le toggle natif.

---

### Décision 5 — Directive `live()` pour la synchronisation de valeur

L'input utilise `.value="${live(this.value)}"` pour synchroniser la valeur
de la propriété Lit avec la valeur native de l'input lors des re-renders.

Sans `live()`, Lit ne met pas à jour la valeur native si l'utilisateur a
commencé à taper (DOM drift). `live()` compare toujours contre la valeur
DOM actuelle, garantissant la cohérence.

---

### Décision 6 — Suppression des spinners natifs sur `type="number"`

Les spinners CSS natifs (`-webkit-inner-spin-button`) sont supprimés.
Le contrôle de la valeur numérique se fait via clavier (`↑`/`↓`) et saisie directe.

**Justification :** Les spinners natifs sont visuellement incohérents entre
navigateurs et ne peuvent pas être stylés avec les tokens du système.

---

### Décision 7 — `hide-label` : exception de label visuellement masqué pour les champs search clarifiés par une icône

**Problème :** les champs de recherche sont un pattern UX reconnu où un label flottant visible
est souvent jugé redondant à côté d'une icône + placeholder (ex. une barre de recherche
d'en-tête). La Décision 1 ci-dessus a déjà rejeté un label uniquement en `aria-label` — cette
exception ne revient pas sur ce rejet.

**Décision :** `hide-label` conserve exactement le même vrai `<label for="id">` de la Décision 1,
pleinement présent dans le DOM et lié, et le masque uniquement *visuellement* via une classe
`.visually-hidden` (positionnement absolu + clip 1×1px — la même technique déjà utilisée par le
`captionHidden` de `agtc-table`), jamais `display:none`/`visibility:hidden`, qui supprimerait
entièrement le nom accessible. Nécessite `icon` — sans icône visible, le rôle du champ ne serait
plus univoque, selon la condition même de la technique W3C ARIA14 ("le contexte et l'apparence
visuelle du contrôle rendent son objectif clair"). `updated()` émet un avertissement console si
`hide-label` est posé sans `icon`, à l'image de l'avertissement déjà existant pour `label`
manquant.

**Pourquoi ça ne contredit pas la Décision 1 :** la Décision 1 rejetait la suppression du label
persistant et associé par programmation au profit d'un `aria-label` seul. `hide-label` conserve
ce même élément label — seul son rendu visuel change, pas sa présence ni son association. Le
WCAG 1.3.1 est respecté à l'identique de tout autre état de ce composant.

**Approuvé via `ux-pattern-review` (ADR-036) le 2026-09-05** — voir la nouvelle ligne de pattern
ci-dessous et `guidelines/components/input.md` § UX Patterns Reference pour la discussion
complète des sources, y compris la réserve de NN/g selon laquelle le *champ lui-même* (pas
seulement le label) doit rester visible.

---

## Patterns UX de référence appliqués

> Ajouté le 2026-06-01 via le workflow `ux-pattern-review` (ADR-036). Décision du
> Design System Lead : **tous les patterns approuvés**. Détail et liens dans
> `guidelines/components/input.md` § PATTERNS UX DE RÉFÉRENCE.

| Pattern | Source |
|---------|--------|
| Validation à `onBlur`, re-validation à la frappe une fois en erreur | NN/g — How to Report Errors in Forms |
| Erreur inline + `role="alert"` | NN/g — Error-Message Guidelines |
| Message d'erreur constructif | NN/g — Error-Message Guidelines |
| Help text persistant via `aria-describedby` | NN/g |
| Required marker `*` + `aria-required` | NN/g — Forms |
| Forgiving format (`tel`/`number`) | IxDF — forgiving formats |
| Label visible toujours présent | NN/g |
| Anti hostile patterns (pas d'effacement du champ en erreur) | NN/g — Hostile Patterns in Error Messages |
| **Exception** (2026-09-05) — label visuellement masqué pour les champs search clarifiés par une icône (`hide-label`) | W3C WAI — Labelling Controls · W3C ARIA14 · NN/g — The Magnifying-Glass Icon |

---

## Périmètre de la version 1.0

| Inclus | Exclu (version future) |
|--------|------------------------|
| 7 types natifs | `type="date"`, `type="file"` |
| États : default / focus / invalid / disabled / readonly | État success (validation positive) |
| Icônes prefix/suffix (hybride prop+slot) | Compteur de caractères |
| Toggle password intégré | Suggestions / autocomplete custom |
| helper-text + error-message | Champ multiligne (`agtc-textarea`) |

---

## Tokens utilisés

| Token | Usage |
|-------|-------|
| `--agtc-input-default-*` | Tokens composant compilés depuis `tokens/component.json` |
| `--agtc-semantic-color-feedback-danger` | Couleur message d'erreur |
| `--agtc-semantic-color-background-subtle` | Fond état disabled |
| `--agtc-semantic-color-text-disabled` | Texte état disabled |
| `--agtc-semantic-color-text-secondary` | Helper text + icônes |
| `--agtc-semantic-typography-body-*` | Typographie de la valeur saisie |
| `--agtc-semantic-typography-label-*` | Typographie du label, helper, erreur |
