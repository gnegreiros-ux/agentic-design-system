# ADR-060 — Implementing `agtc-top-nav`

> **Date:** 2026-06-15
> **Status:** ✅ Active
> **Decision-makers:** Design System Lead
> **Type:** component
> **Logical path:** decisions/ADR-060-agtc-top-nav-implementation.md
> **Read before:** AGENTS.md, DESIGN.md, .claude/rules/tokens-system.md, decisions/ADR-047-no-visited-nav-rule.md
> **Relations:** tokens/component.json, components/agtc-top-nav.js, guidelines/components/top-nav.md, decisions/ADR-056-agtc-tabs-implementation.md

---

## Context

The Agentica site is the design system's living laboratory — every site feature is an
opportunity to build and validate a real component before formalizing it.

The site's main navigation (`site/build.js`) was implemented as static HTML generated
by JavaScript, with CSS styles defined directly in terms of semantic tokens (with no
component-level layer). Several problems had accumulated across sessions:

- `:visited` kept the browser's default color under Safari/WebKit: introduced 2026-05-30
  (`b5850cf`, `var()` with no hex fallback), first fixed 2026-06-06 (`fb7b5a5`), then reintroduced
  by mistake during a tokens audit on 2026-06-15 (`6b42f21`) before being fixed for good the same
  day (`ce994bf` — see ADR-047 and ADR-059)
- `:active` wasn't defined → browser default color
- `.active` used a persistent filled background → looked like a toggled button
- `:focus-visible` absent → keyboard navigation non-compliant with WCAG 2.4.7
- `aria-current="page"` absent → screen readers blind to the current page (WCAG 4.1.2)
- No component token → design decisions lived directly in the site's CSS

The decision to formalize `agtc-top-nav` as a DS component follows the founding
principle: the site consumes the design system, not the other way around.

---

## Decision

Create the `agtc-top-nav` component (a Lit Web Component) encapsulating the main
horizontal navigation with a full-height tab visual pattern, and formalize it in the
design system before applying it to the site.

### Key technical decisions

**`<nav>`, not `role="tablist"`**

Despite a visual appearance similar to tabs, `agtc-top-nav` uses inter-page links. The
correct ARIA pattern is `<nav aria-label="...">` + `<a aria-current="page">`, not
`role="tablist"`, which would imply in-page content panels and arrow-key navigation.

**Full-height tab pattern**

Each link occupies the full height of the header (64px) via `align-self:stretch`. The
active state is indicated by a `border-bottom:2px solid action-primary` positioned at the
bottom of the header — not by a filled background (which would mimic a toggled button).

**Separate CTA button**

The "Get Started" link (`cta:true`) breaks from the tab pattern: `height:auto;
align-self:center; border-radius:control; margin-left:8px`. It's an adoption action,
visually a button.

**18 component tokens**

Every visual decision is captured in `tokens/component.json` under `top-nav.*`: 11
tokens for the tabs, 7 tokens for the CTA. The component's and the site's CSS reference
only `--agtc-component-top-nav-*`.

---

## Reference UX patterns applied

| Pattern | Source | Decision |
|---------|--------|----------|
| `<nav aria-label>` landmark | W3C WAI APG | `nav-label` mandatory, exposed prop |
| `aria-current="page"` | WCAG 2.4.4 / 4.1.2 | Automatically computed from `current` (pathname) |
| Border-bottom indicator | NN/g — horizontal nav | 2px at the bottom of the full-height tab |
| No `role="tablist"` | W3C APG Tabs Pattern | Inter-page nav ≠ in-page tabs |
| Distinct CTA (pill button) | IxDF — clear primary action | `cta:true` → border-radius + filled background |
| `:visited` neutralized | ADR-047 | Inside shadow DOM via `a:visited { color: var(…) }` |
| Mobile hamburger | NN/g — mobile nav | Handled by the site (out of scope for component v1.0) |

---

## Rejected alternatives

| Alternative | Reason for rejection |
|-------------|-----------------------|
| **Keep the static HTML** | No reusability, design decisions scattered across the site's CSS |
| **Use `agtc-tabs` with `href`** | `agtc-tabs` has `role="tablist"` — incorrect ARIA semantics for inter-page navigation |
| **Filled background for the active link** | Looks like a toggled button (pill) — NN/g recommends a line indicator for horizontal navs |
| **Arrow-key navigation** | Reserved for ARIA `tablist` — misleading for links |
| **Bake bilingualism into the component** | The component is language-agnostic — language is handled on the consumer side (the site) |

---

## Consequences

**For the site:** The site's CSS now references `--agtc-component-top-nav-*` instead of
direct semantic tokens. The Lit component can be used to replace the generated HTML in
phase 2 of integration.

**For the design system:** 18 new component tokens in `tokens/component.json`. Build:
792 tokens defined (+18), 0 phantom.

**For agents:** Any visual change to the top nav goes through `tokens/component.json`
(and a TCR). The component is the contract — not the site's CSS.

---

## Incidents or triggers

Navigation fixed 6 times in a single day (2026-06-15) before the decision to formalize
the component: Safari `:visited` (×3), missing `:active`, button-like `.active`, missing
`:focus-visible`, missing `aria-current`. The recurrence of fixes triggered the formalization.

<!-- FR -->

# ADR-060 — Implémentation de `agtc-top-nav`

> **Date :** 2026-06-15
> **Statut :** ✅ Actif
> **Décideurs :** Design System Lead
> **Type:** component
> **Chemin logique:** decisions/ADR-060-agtc-top-nav-implementation.md
> **Lecture avant:** AGENTS.md, DESIGN.md, .claude/rules/tokens-system.md, decisions/ADR-047-no-visited-nav-rule.md
> **Relations:** tokens/component.json, components/agtc-top-nav.js, guidelines/components/top-nav.md, decisions/ADR-056-agtc-tabs-implementation.md

---

## Contexte

Le site Agentica est le laboratoire vivant du design system — chaque fonctionnalité du site est
l'occasion de construire et valider un composant réel avant de le formaliser.

La navigation principale du site (`site/build.js`) était implémentée en HTML statique généré
par JavaScript, avec des styles CSS définis directement en termes de tokens sémantiques (sans
passer par un niveau composant). Plusieurs problèmes accumulés au fil des sessions :

- `:visited` gardait la couleur navigateur par défaut sous Safari/WebKit : introduit le 2026-05-30
  (`b5850cf`, `var()` sans fallback hex), corrigé une première fois le 2026-06-06 (`fb7b5a5`), puis
  réintroduit par erreur lors d'un audit tokens le 2026-06-15 (`6b42f21`) avant d'être corrigé
  définitivement le même jour (`ce994bf` — voir ADR-047 et ADR-059)
- `:active` n'était pas défini → couleur navigateur par défaut
- `.active` utilisait un fond rempli persistant → ressemblait à un bouton togglé
- `:focus-visible` absent → navigation clavier non conforme WCAG 2.4.7
- `aria-current="page"` absent → lecteurs d'écran aveugles à la page courante (WCAG 4.1.2)
- Aucun token composant → les décisions de design étaient directement dans le CSS du site

La décision de formaliser `agtc-top-nav` comme composant du DS découle du principe fondateur :
le site consomme le design system, pas l'inverse.

---

## Décision

Créer le composant `agtc-top-nav` (Web Component Lit) qui encapsule la navigation principale
horizontale avec un pattern visuel tabs full-height, et le formaliser dans le design system avant
de l'appliquer au site.

### Décisions techniques clés

**`<nav>` et non `role="tablist"`**

Malgré l'apparence visuelle similaire aux tabs, `agtc-top-nav` utilise des liens inter-pages.
Le pattern ARIA correct est `<nav aria-label="...">` + `<a aria-current="page">`, pas
`role="tablist"` qui impliquerait des panneaux de contenu in-page et une navigation aux flèches.

**Pattern tabs full-height**

Chaque lien occupe toute la hauteur du header (64px) via `align-self:stretch`. L'état actif est
indiqué par `border-bottom:2px solid action-primary` positionné au bas du header — pas par un fond
rempli (qui imiterait un bouton togglé).

**Bouton CTA séparé**

Le lien "Démarrer" (`cta:true`) sort du pattern tab : `height:auto; align-self:center;
border-radius:control; margin-left:8px`. C'est une action d'adoption, visuellement un bouton.

**18 tokens composant**

Toutes les décisions visuelles sont capturées dans `tokens/component.json` sous `top-nav.*` :
11 tokens pour les tabs, 7 tokens pour le CTA. Le CSS du composant et du site ne référencent
que `--agtc-component-top-nav-*`.

---

## Patterns UX de référence appliqués

| Pattern | Source | Décision |
|---------|--------|----------|
| Landmark `<nav aria-label>` | W3C WAI APG | `nav-label` obligatoire, prop exposée |
| `aria-current="page"` | WCAG 2.4.4 / 4.1.2 | Calculé automatiquement depuis `current` (pathname) |
| Indicateur border-bottom | NN/g — nav horizontale | 2px en bas du tab pleine hauteur |
| Pas de `role="tablist"` | W3C APG Tabs Pattern | Nav inter-pages ≠ tabs in-page |
| CTA distinct (bouton pill) | IxDF — clear primary action | `cta:true` → border-radius + fond rempli |
| `:visited` neutralisé | ADR-047 | Dans shadow DOM via `a:visited { color: var(…) }` |
| Mobile hamburger | NN/g — Mobile nav | Géré par le site (hors composant v1.0) |

---

## Alternatives rejetées

| Alternative | Raison du rejet |
|-------------|-----------------|
| **Garder le HTML statique** | Pas de réutilisabilité, décisions de design éparpillées dans le CSS du site |
| **Utiliser `agtc-tabs` avec `href`** | `agtc-tabs` a `role="tablist"` — sémantique ARIA incorrecte pour une nav inter-pages |
| **Fond rempli pour le lien actif** | Ressemble à un bouton togglé (pill) — NN/g recommande l'indicateur de ligne pour les navs horizontales |
| **Navigation aux flèches** | Réservée aux `tablist` ARIA — trompeuse pour des liens |
| **Intégrer le bilinguisme dans le composant** | Le composant est language-agnostic — la langue est gérée côté consommateur (site) |

---

## Conséquences

**Pour le site :** La CSS du site référence désormais `--agtc-component-top-nav-*` au lieu de
tokens sémantiques directs. Le composant Lit peut être utilisé pour remplacer le HTML généré
en phase 2 d'intégration.

**Pour le design system :** 18 nouveaux tokens composant dans `tokens/component.json`. Build :
792 tokens définis (+18), 0 fantôme.

**Pour les agents :** Toute modification visuelle de la top-nav passe par `tokens/component.json`
(et un TCR). Le composant est le contrat — pas le CSS du site.

---

## Incidents ou déclencheurs

Navigation corrigée 6 fois en une journée (2026-06-15) avant la décision de formaliser
le composant : `:visited` Safari (×3), `:active` absent, `.active` bouton-like, `:focus-visible`
absent, `aria-current` absent. La récurrence des corrections a déclenché la formalisation.
