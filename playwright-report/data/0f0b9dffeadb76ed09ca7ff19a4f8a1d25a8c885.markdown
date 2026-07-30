# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: functional/language.spec.js >> Language — English rendering has no French leftovers >> decisions/adr-086.html — clean in English mode
- Location: tests/functional/language.spec.js:63:5

# Error details

```
Error: French content visible in decisions/adr-086.html with data-lang=en:
  line 138: "é" in "1. scripts/extract-relationships.js walks the existing sources above and writes a single generated i"
  line 166: "é" in "this work started, to be moved to Terminé once this ADR merges."

expect(received).toEqual(expected) // deep equality

- Expected  - 1
+ Received  + 4

- Array []
+ Array [
+   "  line 138: \"é\" in \"1. scripts/extract-relationships.js walks the existing sources above and writes a single generated i\"",
+   "  line 166: \"é\" in \"this work started, to be moved to Terminé once this ADR merges.\"",
+ ]
```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - link "Skip to content" [ref=e2] [cursor=pointer]:
    - /url: "#main-content"
  - banner [ref=e3]:
    - link "Agentica — Accueil" [ref=e4] [cursor=pointer]:
      - /url: ../index.html
      - img [ref=e5]
    - navigation "Navigation principale" [ref=e6]:
      - link "Home" [ref=e7] [cursor=pointer]:
        - /url: ../index.html
      - link "Why" [ref=e8] [cursor=pointer]:
        - /url: ../pourquoi.html
      - link "Architecture" [ref=e9] [cursor=pointer]:
        - /url: ../architecture.html
      - link "Quality" [ref=e10] [cursor=pointer]:
        - /url: ../qualite.html
      - link "AI" [ref=e11] [cursor=pointer]:
        - /url: ../ia.html
      - generic [ref=e12]:
        - link "Documentation" [ref=e13] [cursor=pointer]:
          - /url: ../documentation.html
        - generic:
          - generic:
            - heading "Understand" [level=2]
            - link "Introduction":
              - /url: ../pourquoi.html
            - link "Foundations":
              - /url: ../foundations/index.html
            - link "Human control":
              - /url: ../ia.html
            - link "Single source of truth":
              - /url: ../architecture.html
          - generic:
            - heading "Reference" [level=2]
            - link "Foundations":
              - /url: ../foundations/index.html
            - link "Components":
              - /url: ../components/index.html
            - link "Tokens":
              - /url: ../tokens/index.html
            - link "Decisions":
              - /url: ../decisions/index.html
            - link "Agents":
              - /url: ../agents/index.html
            - link "Pipelines":
              - /url: ../pipelines/index.html
            - link "Continuity":
              - /url: ../continuite.html
          - generic:
            - heading "Explore" [level=2]
            - link "Storybook":
              - /url: https://main--6a1c1e665ec5fe8fc0540983.chromatic.com/
            - link "GitHub":
              - /url: https://github.com/gnegreiros-ux/agentica-design-system
            - link "Audit":
              - /url: ../audit.html
      - link "Get started" [ref=e14] [cursor=pointer]:
        - /url: ../get-started.html
    - generic "Liens rapides" [ref=e15]:
      - button "Basculer thème sombre / Switch to dark theme" [ref=e16] [cursor=pointer]:
        - img [ref=e17]
      - group "Language" [ref=e20]:
        - button "FR" [ref=e21] [cursor=pointer]
        - button "EN" [ref=e22] [cursor=pointer]
      - link "Storybook — Catalogue interactif des composants" [ref=e23] [cursor=pointer]:
        - /url: https://main--6a1c1e665ec5fe8fc0540983.chromatic.com/
        - img [ref=e24]
      - link "GitHub — Code source du projet" [ref=e26] [cursor=pointer]:
        - /url: https://github.com/gnegreiros-ux/agentica-design-system
        - img [ref=e27]
  - generic [ref=e30]:
    - navigation "Secondary navigation / Navigation secondaire" [ref=e31]:
      - generic [ref=e32]:
        - generic [ref=e33]: Decisions
        - link "ADR index" [ref=e34] [cursor=pointer]:
          - /url: index.html
        - link "ADR-001" [ref=e35] [cursor=pointer]:
          - /url: adr-001.html
        - link "ADR-002" [ref=e36] [cursor=pointer]:
          - /url: adr-002.html
        - link "ADR-003" [ref=e37] [cursor=pointer]:
          - /url: adr-003.html
        - link "ADR-004" [ref=e38] [cursor=pointer]:
          - /url: adr-004.html
        - link "ADR-005" [ref=e39] [cursor=pointer]:
          - /url: adr-005.html
        - link "ADR-006" [ref=e40] [cursor=pointer]:
          - /url: adr-006.html
        - link "ADR-007" [ref=e41] [cursor=pointer]:
          - /url: adr-007.html
        - link "ADR-008" [ref=e42] [cursor=pointer]:
          - /url: adr-008.html
        - link "ADR-009" [ref=e43] [cursor=pointer]:
          - /url: adr-009.html
        - link "ADR-010" [ref=e44] [cursor=pointer]:
          - /url: adr-010.html
        - link "ADR-011" [ref=e45] [cursor=pointer]:
          - /url: adr-011.html
        - link "ADR-012" [ref=e46] [cursor=pointer]:
          - /url: adr-012.html
        - link "ADR-013" [ref=e47] [cursor=pointer]:
          - /url: adr-013.html
        - link "ADR-014" [ref=e48] [cursor=pointer]:
          - /url: adr-014.html
        - link "ADR-015" [ref=e49] [cursor=pointer]:
          - /url: adr-015.html
        - link "ADR-016" [ref=e50] [cursor=pointer]:
          - /url: adr-016.html
        - link "ADR-017" [ref=e51] [cursor=pointer]:
          - /url: adr-017.html
        - link "ADR-018" [ref=e52] [cursor=pointer]:
          - /url: adr-018.html
        - link "ADR-019" [ref=e53] [cursor=pointer]:
          - /url: adr-019.html
        - link "ADR-020" [ref=e54] [cursor=pointer]:
          - /url: adr-020.html
        - link "ADR-021" [ref=e55] [cursor=pointer]:
          - /url: adr-021.html
        - link "ADR-022" [ref=e56] [cursor=pointer]:
          - /url: adr-022.html
        - link "ADR-023" [ref=e57] [cursor=pointer]:
          - /url: adr-023.html
        - link "ADR-024" [ref=e58] [cursor=pointer]:
          - /url: adr-024.html
        - link "ADR-025" [ref=e59] [cursor=pointer]:
          - /url: adr-025.html
        - link "ADR-026" [ref=e60] [cursor=pointer]:
          - /url: adr-026.html
        - link "ADR-027" [ref=e61] [cursor=pointer]:
          - /url: adr-027.html
        - link "ADR-028" [ref=e62] [cursor=pointer]:
          - /url: adr-028.html
        - link "ADR-029" [ref=e63] [cursor=pointer]:
          - /url: adr-029.html
        - link "ADR-030" [ref=e64] [cursor=pointer]:
          - /url: adr-030.html
        - link "ADR-031" [ref=e65] [cursor=pointer]:
          - /url: adr-031.html
        - link "ADR-032" [ref=e66] [cursor=pointer]:
          - /url: adr-032.html
        - link "ADR-033" [ref=e67] [cursor=pointer]:
          - /url: adr-033.html
        - link "ADR-034" [ref=e68] [cursor=pointer]:
          - /url: adr-034.html
        - link "ADR-035" [ref=e69] [cursor=pointer]:
          - /url: adr-035.html
        - link "ADR-036" [ref=e70] [cursor=pointer]:
          - /url: adr-036.html
        - link "ADR-037" [ref=e71] [cursor=pointer]:
          - /url: adr-037.html
        - link "ADR-038" [ref=e72] [cursor=pointer]:
          - /url: adr-038.html
        - link "ADR-039" [ref=e73] [cursor=pointer]:
          - /url: adr-039.html
        - link "ADR-040" [ref=e74] [cursor=pointer]:
          - /url: adr-040.html
        - link "ADR-041" [ref=e75] [cursor=pointer]:
          - /url: adr-041.html
        - link "ADR-042" [ref=e76] [cursor=pointer]:
          - /url: adr-042.html
        - link "ADR-043" [ref=e77] [cursor=pointer]:
          - /url: adr-043.html
        - link "ADR-044" [ref=e78] [cursor=pointer]:
          - /url: adr-044.html
        - link "ADR-045" [ref=e79] [cursor=pointer]:
          - /url: adr-045.html
        - link "ADR-046" [ref=e80] [cursor=pointer]:
          - /url: adr-046.html
        - link "ADR-047" [ref=e81] [cursor=pointer]:
          - /url: adr-047.html
        - link "ADR-048" [ref=e82] [cursor=pointer]:
          - /url: adr-048.html
        - link "ADR-049" [ref=e83] [cursor=pointer]:
          - /url: adr-049.html
        - link "ADR-050" [ref=e84] [cursor=pointer]:
          - /url: adr-050.html
        - link "ADR-051" [ref=e85] [cursor=pointer]:
          - /url: adr-051.html
        - link "ADR-052" [ref=e86] [cursor=pointer]:
          - /url: adr-052.html
        - link "ADR-053" [ref=e87] [cursor=pointer]:
          - /url: adr-053.html
        - link "ADR-054" [ref=e88] [cursor=pointer]:
          - /url: adr-054.html
        - link "ADR-055" [ref=e89] [cursor=pointer]:
          - /url: adr-055.html
        - link "ADR-056" [ref=e90] [cursor=pointer]:
          - /url: adr-056.html
        - link "ADR-057" [ref=e91] [cursor=pointer]:
          - /url: adr-057.html
        - link "ADR-058" [ref=e92] [cursor=pointer]:
          - /url: adr-058.html
        - link "ADR-059" [ref=e93] [cursor=pointer]:
          - /url: adr-059.html
        - link "ADR-060" [ref=e94] [cursor=pointer]:
          - /url: adr-060.html
        - link "ADR-061" [ref=e95] [cursor=pointer]:
          - /url: adr-061.html
        - link "ADR-062" [ref=e96] [cursor=pointer]:
          - /url: adr-062.html
        - link "ADR-063" [ref=e97] [cursor=pointer]:
          - /url: adr-063.html
        - link "ADR-064" [ref=e98] [cursor=pointer]:
          - /url: adr-064.html
        - link "ADR-065" [ref=e99] [cursor=pointer]:
          - /url: adr-065.html
        - link "ADR-066" [ref=e100] [cursor=pointer]:
          - /url: adr-066.html
        - link "ADR-067" [ref=e101] [cursor=pointer]:
          - /url: adr-067.html
        - link "ADR-068" [ref=e102] [cursor=pointer]:
          - /url: adr-068.html
        - link "ADR-069" [ref=e103] [cursor=pointer]:
          - /url: adr-069.html
        - link "ADR-070" [ref=e104] [cursor=pointer]:
          - /url: adr-070.html
        - link "ADR-071" [ref=e105] [cursor=pointer]:
          - /url: adr-071.html
        - link "ADR-072" [ref=e106] [cursor=pointer]:
          - /url: adr-072.html
        - link "ADR-073" [ref=e107] [cursor=pointer]:
          - /url: adr-073.html
        - link "ADR-074" [ref=e108] [cursor=pointer]:
          - /url: adr-074.html
        - link "ADR-075" [ref=e109] [cursor=pointer]:
          - /url: adr-075.html
        - link "ADR-076" [ref=e110] [cursor=pointer]:
          - /url: adr-076.html
        - link "ADR-077" [ref=e111] [cursor=pointer]:
          - /url: adr-077.html
        - link "ADR-078" [ref=e112] [cursor=pointer]:
          - /url: adr-078.html
        - link "ADR-079" [ref=e113] [cursor=pointer]:
          - /url: adr-079.html
        - link "ADR-080" [ref=e114] [cursor=pointer]:
          - /url: adr-080.html
        - link "ADR-081" [ref=e115] [cursor=pointer]:
          - /url: adr-081.html
        - link "ADR-082" [ref=e116] [cursor=pointer]:
          - /url: adr-082.html
        - link "ADR-083" [ref=e117] [cursor=pointer]:
          - /url: adr-083.html
        - link "ADR-084" [ref=e118] [cursor=pointer]:
          - /url: adr-084.html
        - link "ADR-085" [ref=e119] [cursor=pointer]:
          - /url: adr-085.html
        - link "ADR-086" [ref=e120] [cursor=pointer]:
          - /url: adr-086.html
        - link "ADR-087" [ref=e121] [cursor=pointer]:
          - /url: adr-087.html
        - link "ADR-088" [ref=e122] [cursor=pointer]:
          - /url: adr-088.html
        - link "ADR-089" [ref=e123] [cursor=pointer]:
          - /url: adr-089.html
        - link "ADR-090" [ref=e124] [cursor=pointer]:
          - /url: adr-090.html
    - main [ref=e125]:
      - generic [ref=e126]:
        - generic [ref=e127]:
          - code [ref=e128]: ADR-086
          - status [ref=e130]:
            - generic [ref=e131]: Active
          - generic [ref=e132]: contract
        - heading "Relationships registry and contract validation scripts (concepts borrowed from DSDS)" [level=1] [ref=e133]
        - generic [ref=e134]:
          - generic [ref=e135]:
            - term [ref=e136]: Date
            - definition [ref=e137]: 2026-07-22
          - generic [ref=e138]:
            - term [ref=e139]: Decision makers
            - definition [ref=e140]: Guilherme Negreiros — Design System Lead
      - heading "Context" [level=2] [ref=e141]
      - paragraph [ref=e142]:
        - text: A comparative analysis of
        - link "Design System Documentation Schema (DSDS)" [ref=e143] [cursor=pointer]:
          - /url: https://designsystemdocspec.org/
        - text: "v0.15.2 against this repository's existing Markdown/JSON conventions concluded that a full migration to the DSDS format was not warranted: DSDS is a pre-1.0 draft with no third-party tooling or adopters, it has no entity for architectural decision records (the core of this repo's governance model), and this repo is already DTCG-aligned for token values (ADR-052)."
      - paragraph [ref=e144]: "That analysis did surface two concepts worth borrowing on their own terms, without adopting DSDS's format:"
      - paragraph [ref=e145]:
        - text: "1."
        - strong [ref=e146]:
          - text: Typed
          - code [ref=e147]: relationships
        - text: "between entities (DSDS:"
        - code [ref=e148]: depends-on
        - text: ","
        - code [ref=e149]: composes
        - text: ","
        - code [ref=e150]: extends
        - text: ", …) — this repo already encodes relations, but scattered across three places that were never linked: token"
        - code [ref=e151]: $extensions["com.agentica.usage"].decision
        - text: /
        - code [ref=e152]: .doNotUse
        - text: /
        - code [ref=e153]: $metadata.contract
        - text: fields, token
        - code [ref=e154]: $value
        - text: aliases (
        - code [ref=e155]: "{semantic.color.action.primary}"
        - text: ), and the free-prose
        - code [ref=e156]: <strong>Relations:</strong>
        - text: header on every
        - code [ref=e157]: guidelines/
        - text: and
        - code [ref=e158]: .claude/rules/
        - text: file. There was no way to ask "what depends on this token?" without a repo-wide grep. 2.
        - strong [ref=e159]: Programmatic (deterministic) validation
        - text: of the documentation layer, as a complement to the qualitative, agent-driven pipelines in
        - code [ref=e160]: .claude/skills/pipelines/
        - text: .
      - heading "Decision" [level=2] [ref=e161]
      - paragraph [ref=e162]:
        - text: "1."
        - strong [ref=e163]:
          - code [ref=e164]: scripts/extract-relationships.js
        - text: walks the existing sources above and writes a single generated index (
        - code [ref=e165]: relationships-report.json
        - text: ", gitignored, run via"
        - code [ref=e166]: npm run relationships
        - text: ), with edges typed
        - code [ref=e167]: depends-on
        - text: ","
        - code [ref=e168]: excludes
        - text: ","
        - code [ref=e169]: governed-by
        - text: ","
        - code [ref=e170]: documented-in
        - text: ", and a looser"
        - code [ref=e171]: related
        - text: type for the free-prose header case.
        - code [ref=e172]: excludes
        - text: is an Agentica-specific addition (e.g.
        - code [ref=e173]: button.primary
        - text: ↔
        - code [ref=e174]: button.critical
        - text: mutual exclusion) — DSDS has no equivalent. 2.
        - strong [ref=e175]:
          - code [ref=e176]: scripts/validate-contracts.js
        - text: adds deterministic checks for the governance layer, deliberately scoped to NOT duplicate
        - code [ref=e177]: scripts/audit-tokens.js
        - text: "(which already checks code-layer drift — hardcoded values, orphaned/phantom tokens, primitive→semantic→component alias resolution): DTCG shape ($value requires $type), ADR reference integrity ("
        - code [ref=e178]: $extensions.decision
        - text: → a real file in
        - code [ref=e179]: decisions/
        - text: ), contract path integrity (
        - code [ref=e180]: $metadata.contract
        - text: → a real guideline file), token/guideline sync (a
        - code [ref=e181]: component.*
        - text: reference in a guideline still exists in
        - code [ref=e182]: tokens/component.json
        - text: ), and presence of the
        - code [ref=e183]: "## UX Patterns Reference"
        - text: section mandated by
        - code [ref=e184]: .claude/rules/ux-patterns-sources.md
        - text: . Wired into
        - code [ref=e185]: npm test
        - text: via
        - code [ref=e186]: npm run validate:contracts
        - text: . 3.
        - strong [ref=e187]:
          - code [ref=e188]: scripts/lib/contracts.js
        - text: — shared parsing helpers (both scripts need the same token tree walk and Relations-header parsing; a single module avoids duplicating that logic). 4.
        - strong [ref=e189]: A minor, related governance addendum
        - text: ":"
        - code [ref=e190]: .claude/rules/project-overview.md
        - text: now requires moving a GitHub Projects ticket to
        - code [ref=e191]: En cours
        - text: "when work actually starts on it (observed: 0/144 items had ever used that status — work always jumped straight from"
        - code [ref=e192]: Backlog
        - text: to
        - code [ref=e193]: Terminé
        - text: ). Bundled into this ADR rather than given its own, since it's a one-line process rule decided in the same session, not an architectural decision on its own.
      - heading "Credits" [level=3] [ref=e194]
      - paragraph [ref=e195]:
        - text: "Both concepts are borrowed from DSDS v0.15.2 (https://designsystemdocspec.org/, https://github.com/somerandomdude/design-system-documentation-schema). Credited contributors:"
        - strong [ref=e196]: PJ Onori
        - text: (maintainer),
        - strong [ref=e197]: Afyia Smith
        - text: (governance and
        - code [ref=e198]: docOrigin
        - text: metadata schemas, introduced in v0.12.1),
        - strong [ref=e199]: Suleiman Ali Shakir
        - text: (documentation copy-edits). This repository does not consume or validate against the DSDS schema itself — the scripts above generate and check our own index over our own Markdown/JSON, applying the same *principles* DSDS documents, not its format.
      - heading "Rejected alternatives" [level=2] [ref=e200]
      - table [ref=e202]:
        - rowgroup [ref=e203]:
          - row "Alternative Reason for rejection" [ref=e204]:
            - columnheader "Alternative" [ref=e205]
            - columnheader "Reason for rejection" [ref=e206]
        - rowgroup [ref=e207]:
          - row "Migrate documentation to the DSDS JSON format Pre-1.0 draft spec, no third-party tooling consumes it, no entity for ADRs (this repo's governance core) — see the prior comparative analysis" [ref=e208]:
            - cell "Migrate documentation to the DSDS JSON format" [ref=e209]
            - cell "Pre-1.0 draft spec, no third-party tooling consumes it, no entity for ADRs (this repo's governance core) — see the prior comparative analysis" [ref=e210]
          - row "Validate tokens/*.json against DTCG's official JSON Schema via ajv Adds a new runtime dependency for one check; the existing scripts in scripts/ have zero external dependencies by convention — a manual $value/$type presence check gets the same practical signal without the dependency" [ref=e211]:
            - cell "Validate tokens/*.json against DTCG's official JSON Schema via ajv" [ref=e212]:
              - text: Validate
              - code [ref=e213]: tokens/*.json
              - text: against DTCG's official JSON Schema via
              - code [ref=e214]: ajv
            - cell "Adds a new runtime dependency for one check; the existing scripts in scripts/ have zero external dependencies by convention — a manual $value/$type presence check gets the same practical signal without the dependency" [ref=e215]:
              - text: Adds a new runtime dependency for one check; the existing scripts in
              - code [ref=e216]: scripts/
              - text: have zero external dependencies by convention — a manual
              - code [ref=e217]: $value
              - text: /
              - code [ref=e218]: $type
              - text: presence check gets the same practical signal without the dependency
          - 'row "Enforce one fixed set of required ## sections across every guidelines/components/*.md The 17 existing files do not share a single template today (e.g. tabs.md has no ## Intent; feature-card.md/icon.md/tabs.md/top-nav.md have no ## Governance) — enforcing this would invent a rule not actually in force, rather than check one that is. Only ## UX Patterns Reference is universal and explicitly mandated (ux-patterns-sources.md), so only that is checked" [ref=e219]':
            - 'cell "Enforce one fixed set of required ## sections across every guidelines/components/*.md" [ref=e220]':
              - text: Enforce one fixed set of required
              - code [ref=e221]: "##"
              - text: sections across every
              - code [ref=e222]: guidelines/components/*.md
            - 'cell "The 17 existing files do not share a single template today (e.g. tabs.md has no ## Intent; feature-card.md/icon.md/tabs.md/top-nav.md have no ## Governance) — enforcing this would invent a rule not actually in force, rather than check one that is. Only ## UX Patterns Reference is universal and explicitly mandated (ux-patterns-sources.md), so only that is checked" [ref=e223]':
              - text: The 17 existing files do not share a single template today (e.g.
              - code [ref=e224]: tabs.md
              - text: has no
              - code [ref=e225]: "## Intent"
              - text: ;
              - code [ref=e226]: feature-card.md
              - text: /
              - code [ref=e227]: icon.md
              - text: /
              - code [ref=e228]: tabs.md
              - text: /
              - code [ref=e229]: top-nav.md
              - text: have no
              - code [ref=e230]: "## Governance"
              - text: ) — enforcing this would invent a rule not actually in force, rather than check one that is. Only
              - code [ref=e231]: "## UX Patterns Reference"
              - text: is universal and explicitly mandated (
              - code [ref=e232]: ux-patterns-sources.md
              - text: ), so only that is checked
          - row "A separate ADR for the En cours status-discipline rule Too small on its own (one line, no architectural weight) to warrant a dedicated ADR; bundled here since it was decided in the same session" [ref=e233]:
            - cell "A separate ADR for the En cours status-discipline rule" [ref=e234]:
              - text: A separate ADR for the
              - code [ref=e235]: En cours
              - text: status-discipline rule
            - cell "Too small on its own (one line, no architectural weight) to warrant a dedicated ADR; bundled here since it was decided in the same session" [ref=e236]
      - heading "Consequences" [level=2] [ref=e237]
      - list [ref=e238]:
        - listitem [ref=e239]:
          - code [ref=e240]: package.json
          - text: ":"
          - code [ref=e241]: relationships
          - text: and
          - code [ref=e242]: validate:contracts
          - text: scripts added;
          - code [ref=e243]: validate:contracts
      - paragraph [ref=e244]:
        - text: now runs as part of
        - code [ref=e245]: npm test
        - text: .
      - list [ref=e246]:
        - listitem [ref=e247]:
          - code [ref=e248]: .gitignore
          - text: ":"
          - code [ref=e249]: relationships-report.json
          - text: added (generated artifact, same convention as
      - paragraph [ref=e250]:
        - code [ref=e251]: audit-report.json
        - text: ).
      - list [ref=e252]:
        - listitem [ref=e253]:
          - code [ref=e254]: relationships-report.json
          - text: is not committed — regenerate on demand via
          - code [ref=e255]: npm run relationships
      - paragraph [ref=e256]: before any TCR impact assessment.
      - list [ref=e257]:
        - listitem [ref=e258]: No new runtime dependency added.
        - listitem [ref=e259]:
          - text: "GitHub Projects: both tickets moved to"
          - code [ref=e260]: En cours
          - text: (per the new status-discipline rule) when
      - paragraph [ref=e261]:
        - text: this work started, to be moved to
        - code [ref=e262]: Terminé
        - text: once this ADR merges.
      - list [ref=e263]:
        - listitem [ref=e264]:
          - code [ref=e265]: scripts/audit-tokens.js
          - text: is unaffected — its scope (code-layer drift) and this ADR's scope
      - paragraph [ref=e266]: (governance-layer contracts) are deliberately disjoint.
      - generic [ref=e267]:
        - link "← ADR-085" [ref=e268] [cursor=pointer]:
          - /url: adr-085.html
        - link "ADR-087 →" [ref=e269] [cursor=pointer]:
          - /url: adr-087.html
    - navigation "Table of contents / Table des matières" [ref=e270]:
      - generic [ref=e271]: On this page
      - link "Context" [ref=e272] [cursor=pointer]:
        - /url: "#context"
      - link "Decision" [ref=e273] [cursor=pointer]:
        - /url: "#decision"
      - link "Rejected alternatives" [ref=e274] [cursor=pointer]:
        - /url: "#rejected-alternatives"
      - link "Consequences" [ref=e275] [cursor=pointer]:
        - /url: "#consequences"
  - contentinfo [ref=e276]:
    - generic [ref=e277]:
      - generic [ref=e278]:
        - link "Agentica — Accueil" [ref=e279] [cursor=pointer]:
          - /url: ../index.html
          - img [ref=e280]
        - link "Guilherme Negreiros" [ref=e281] [cursor=pointer]:
          - /url: https://www.linkedin.com/in/gnegreiros/
          - img [ref=e282]
          - text: Guilherme Negreiros
      - generic [ref=e286]:
        - generic [ref=e287]: Navigation
        - link "Home" [ref=e288] [cursor=pointer]:
          - /url: ../index.html
        - link "Why" [ref=e289] [cursor=pointer]:
          - /url: ../pourquoi.html
        - link "Architecture" [ref=e290] [cursor=pointer]:
          - /url: ../architecture.html
        - link "Quality" [ref=e291] [cursor=pointer]:
          - /url: ../qualite.html
        - link "AI" [ref=e292] [cursor=pointer]:
          - /url: ../ia.html
      - generic [ref=e293]:
        - generic [ref=e294]: Documentation
        - link "Understand" [ref=e295] [cursor=pointer]:
          - /url: ../pourquoi.html
        - link "Get started" [ref=e296] [cursor=pointer]:
          - /url: ../get-started.html
        - link "Foundations" [ref=e297] [cursor=pointer]:
          - /url: ../foundations/index.html
        - link "Components" [ref=e298] [cursor=pointer]:
          - /url: ../components/index.html
        - link "Tokens" [ref=e299] [cursor=pointer]:
          - /url: ../tokens/index.html
        - link "Decisions" [ref=e300] [cursor=pointer]:
          - /url: ../decisions/index.html
        - link "Continuity" [ref=e301] [cursor=pointer]:
          - /url: ../continuite.html
        - link "Changelog" [ref=e302] [cursor=pointer]:
          - /url: ../changelog.html
      - generic [ref=e303]:
        - generic [ref=e304]: Explorer
        - link "Storybook" [ref=e305] [cursor=pointer]:
          - /url: https://main--6a1c1e665ec5fe8fc0540983.chromatic.com/
        - link "GitHub" [ref=e306] [cursor=pointer]:
          - /url: https://github.com/gnegreiros-ux/agentica-design-system
        - link "Audit" [ref=e307] [cursor=pointer]:
          - /url: ../audit.html
        - link "AI Brief" [ref=e308] [cursor=pointer]:
          - /url: ../ai-brief.html
    - generic [ref=e309]:
      - generic [ref=e310]: © 2026 Guilherme Negreiros
      - generic [ref=e311]: Built with Claude Code.
  - button "Retour en haut" [ref=e312] [cursor=pointer]:
    - img [ref=e313]
    - generic [ref=e315]: Top
  - status [ref=e316]
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | import fs from 'fs';
  3  | import path from 'path';
  4  | import { fileURLToPath } from 'url';
  5  | 
  6  | // English-only content policy (ADR-070/071/075). scripts/audit-language.js catches
  7  | // French text left untranslated in source files, but it cannot catch a different bug
  8  | // class: a page that IS correctly bilingual by design, where one data cell (a table
  9  | // row, a nav link) is hardcoded as a single string instead of a lang-fr/lang-en pair
  10 | // — so it never toggles and stays visibly French even with data-lang="en". That bug
  11 | // is only visible by actually rendering the page (see the `ia.html` nav link and the
  12 | // get-started.html Framework Integration table, both fixed 2026-07-18 this way — a
  13 | // text-content scan alone would never have flagged them, since French prose is
  14 | // expected to exist somewhere on those pages).
  15 | //
  16 | // This spec renders every generated page with data-lang="en" and reads the VISIBLE
  17 | // text only (innerText, not textContent — innerText excludes anything hidden by the
  18 | // site's `html[data-lang="en"] .lang-fr{display:none}` CSS rule, textContent would not).
  19 | 
  20 | const __dirname = path.dirname(fileURLToPath(import.meta.url));
  21 | const DIST = path.resolve(__dirname, '../../site/dist');
  22 | 
  23 | // Same curated word list as scripts/audit-language.js — kept in sync by hand, see
  24 | // that file's comment for why these specific words (no plausible English collision).
  25 | const STOPWORD_RE = /\b(?:être|où|équipe|système|chemin|aucun|aucune|jamais|doivent|également|vérifier|toujours|avec|dans|sont|cette|ces)\b/;
  26 | const ACCENT_RE = /[àâäéèêëïîôöùûüçÀÂÄÉÈÊËÏÎÔÖÙÛÜÇœŒ]/;
  27 | 
  28 | function listPages(dir, base = '') {
  29 |   const pages = [];
  30 |   for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
  31 |     const rel = base ? `${base}/${entry.name}` : entry.name;
  32 |     if (entry.isDirectory()) {
  33 |       pages.push(...listPages(path.join(dir, entry.name), rel));
  34 |     } else if (entry.name.endsWith('.html')) {
  35 |       pages.push(rel);
  36 |     }
  37 |   }
  38 |   return pages;
  39 | }
  40 | 
  41 | const pages = fs.existsSync(DIST) ? listPages(DIST) : [];
  42 | 
  43 | // Content that IS French by design and correctly renders regardless of data-lang:
  44 | // a verbatim historical quote, a literal field-label/filename being documented, a
  45 | // bilingual inline code comment, a font glyph specimen. Narrow on purpose (page +
  46 | // distinguishing substring) so a real regression on the same page still gets caught.
  47 | // An HTML-comment marker (the source-file `lang-audit-ignore` convention used by
  48 | // scripts/audit-language.js) doesn't work here — comments never reach innerText.
  49 | const KNOWN_EXCEPTIONS = {
  50 |   'agents/index.html': ['Interdit —'], // naming-rule code example: bilingual comment in one line, by design
  51 |   'changelog.html': ['Domaine'], // quoting the literal GitHub Projects custom field name
  52 |   'decisions/adr-030.html': ['Densité'], // historical bug quote (the bug this ADR fixed)
  53 |   'decisions/adr-055.html': ['Copié', 'critères'], // quoting the site's bilingual UI strings
  54 |   'decisions/adr-071.html': ['Décideurs', 'Mon intention', 'francophones', 'seulement en anglais'], // literal field-label quote + verbatim human quote
  55 |   'decisions/adr-075.html': ['notre-demarche', 'synthèse', 'Synthèse'], // documenting the pre-rename French filenames (ADR-075)
  56 |   'foundations/typography.html': ['Æ Ç É'], // Atkinson Hyperlegible glyph specimen — intentional
  57 | };
  58 | 
  59 | test.describe('Language — English rendering has no French leftovers', () => {
  60 |   test.skip(pages.length === 0, 'site/dist not built — run node site/build.js first');
  61 | 
  62 |   for (const pagePath of pages) {
  63 |     test(`${pagePath} — clean in English mode`, async ({ page }) => {
  64 |       await page.goto(`/${pagePath}?lang=en`);
  65 |       await page.waitForLoadState('networkidle');
  66 | 
  67 |       const visibleText = await page.evaluate(() => document.body.innerText);
  68 |       const exceptions = KNOWN_EXCEPTIONS[pagePath] || [];
  69 |       const hits = [];
  70 |       visibleText.split('\n').forEach((line, idx) => {
  71 |         if (exceptions.some(ex => line.includes(ex))) return;
  72 |         const match = line.match(ACCENT_RE) || line.match(STOPWORD_RE);
  73 |         if (match) hits.push(`  line ${idx + 1}: "${match[0]}" in "${line.trim().slice(0, 100)}"`);
  74 |       });
  75 | 
> 76 |       expect(hits, `French content visible in ${pagePath} with data-lang=en:\n${hits.join('\n')}`).toEqual([]);
     |                                                                                                    ^ Error: French content visible in decisions/adr-086.html with data-lang=en:
  77 |     });
  78 |   }
  79 | });
  80 | 
```