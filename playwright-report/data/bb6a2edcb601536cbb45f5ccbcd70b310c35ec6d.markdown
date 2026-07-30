# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: functional/language.spec.js >> Language — English rendering has no French leftovers >> decisions/adr-084.html — clean in English mode
- Location: tests/functional/language.spec.js:63:5

# Error details

```
Error: French content visible in decisions/adr-084.html with data-lang=en:
  line 160: "é" in "GitHub Projects: agtc-illustration (P2) → Abandoned, reason recorded on the item; "Migrer les balise"

expect(received).toEqual(expected) // deep equality

- Expected  - 1
+ Received  + 3

- Array []
+ Array [
+   "  line 160: \"é\" in \"GitHub Projects: agtc-illustration (P2) → Abandoned, reason recorded on the item; \"Migrer les balise\"",
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
          - code [ref=e128]: ADR-084
          - status [ref=e130]:
            - generic [ref=e131]: Active
          - generic [ref=e132]: contract
        - 'heading "Home page illustrations migrated to `agtc-image` directly, no `agtc-illustration` wrapper" [level=1] [ref=e133]'
        - generic [ref=e134]:
          - generic [ref=e135]:
            - term [ref=e136]: Date
            - definition [ref=e137]: 2026-07-21
          - generic [ref=e138]:
            - term [ref=e139]: Decision makers
            - definition [ref=e140]: Guilherme Negreiros — Design System Lead
      - heading "Reference UX patterns applied" [level=2] [ref=e141]
      - blockquote [ref=e142]:
        - paragraph [ref=e143]:
          - text: Reviewed 2026-07-21 via the
          - code [ref=e144]: ux-pattern-review
          - text: workflow (ADR-036), before any code was written — for the
          - code [ref=e145]: agtc-illustration
          - text: component that was ultimately
          - strong [ref=e146]: not
          - text: built (see Decision below). The patterns approved during that review were instead applied directly to the site's
          - code [ref=e147]: <agtc-image>
          - text: usage, since that's where the actual work ended up.
      - table [ref=e149]:
        - rowgroup [ref=e150]:
          - row "Pattern Source Applied" [ref=e151]:
            - columnheader "Pattern" [ref=e152]
            - columnheader "Source" [ref=e153]
            - columnheader "Applied" [ref=e154]
        - rowgroup [ref=e155]:
          - row "Decorative by default (aria-hidden, no alt) Mirrors agtc-icon/agtc-image ✅ — decorative prop on every migrated instance" [ref=e156]:
            - cell "Decorative by default (aria-hidden, no alt)" [ref=e157]:
              - text: Decorative by default (
              - code [ref=e158]: aria-hidden
              - text: ", no"
              - code [ref=e159]: alt
              - text: )
            - cell "Mirrors agtc-icon/agtc-image" [ref=e160]:
              - text: Mirrors
              - code [ref=e161]: agtc-icon
              - text: /
              - code [ref=e162]: agtc-image
            - cell "✅ — decorative prop on every migrated instance" [ref=e163]:
              - text: ✅ —
              - code [ref=e164]: decorative
              - text: prop on every migrated instance
          - row "prefers-reduced-motion on the ambient float animation WCAG 2.3.3 ✅ — added to site/build.js's existing reduced-motion block" [ref=e165]:
            - cell "prefers-reduced-motion on the ambient float animation" [ref=e166]:
              - code [ref=e167]: prefers-reduced-motion
              - text: on the
              - code [ref=e168]: ambient
              - text: float animation
            - cell "WCAG 2.3.3" [ref=e169]
            - cell "✅ — added to site/build.js's existing reduced-motion block" [ref=e170]:
              - text: ✅ — added to
              - code [ref=e171]: site/build.js
              - text: "'s existing reduced-motion block"
          - row "Composition via agtc-image rather than a new wrapper Design system decision ✅ — this IS the decision below" [ref=e172]:
            - cell "Composition via agtc-image rather than a new wrapper" [ref=e173]:
              - text: Composition via
              - code [ref=e174]: agtc-image
              - text: rather than a new wrapper
            - cell "Design system decision" [ref=e175]
            - cell "✅ — this IS the decision below" [ref=e176]
      - separator [ref=e177]
      - heading "Context" [level=2] [ref=e178]
      - paragraph [ref=e179]:
        - text: The backlog carried a P2 ticket,
        - code [ref=e180]: agtc-illustration
        - text: ", proposing a new component to \"encapsulate the"
        - code [ref=e181]: illus
        - text: ","
        - code [ref=e182]: illus-hero
        - text: ","
        - code [ref=e183]: illus-feature
        - text: ","
        - code [ref=e184]: illus-ambient
        - text: ","
        - code [ref=e185]: illus-brand
        - text: classes" duplicated across the home page's hand-written HTML — 9 occurrences of
        - code [ref=e186]: <figure class="illus illus-X" aria-hidden="true"><img src=… alt="" width height loading …></figure>
        - text: .
      - paragraph [ref=e187]:
        - text: Two things emerged while scoping the work, both
        - strong [ref=e188]: after
        - code [ref=e189]: agtc-image
        - text: "(ADR-083) had already landed:"
      - paragraph [ref=e190]:
        - text: 1. **The
        - code [ref=e191]: .illus-*
        - text: classes are not self-contained.
        - strong [ref=e192]:
          - code [ref=e193]: .illus-hero
          - text: is
          - code [ref=e194]: position:absolute
          - text: relative to
          - code [ref=e195]: .hero-grid
          - text: ;
          - code [ref=e196]: .illus-feature
          - text: /
          - code [ref=e197]: .illus-brand
          - text: inherit bleed/width behavior from parent-scoped selectors like
          - code [ref=e198]: .overlap > figure:last-child
          - text: and
          - code [ref=e199]: .split > figure:first-child
          - text: ", which match on the literal"
          - code [ref=e200]: figure
          - text: tag and its position among siblings. Replacing that
          - code [ref=e201]: <figure>
          - text: with a custom element would either break those selectors outright, or require rewriting five site-layout CSS rules to target
          - code [ref=e202]: agtc-illustration
          - text: instead — a materially larger and riskier change than "encapsulate the img", touching the live marketing home page's layout system. 2.
        - text: Once the figure/positioning stays in the site's hand-written markup (the safer option, confirmed by the Design System Lead), there is nothing left for
        - code [ref=e203]: agtc-illustration
        - text: to do.** Every attribute duplicated inside the
        - code [ref=e204]: <img>
        - text: (
        - code [ref=e205]: alt=""
        - text: ","
        - code [ref=e206]: width
        - text: ","
        - code [ref=e207]: height
        - text: ","
        - code [ref=e208]: loading
        - text: ","
        - code [ref=e209]: fetchpriority
        - text: ) is already exactly what
        - code [ref=e210]: agtc-image
        - text: (
        - code [ref=e211]: decorative
        - text: +
        - code [ref=e212]: fit="contain"
        - text: ) handles. A second component that only forwards props to
        - code [ref=e213]: agtc-image
        - text: would be a near-empty wrapper — unnecessary abstraction with no behavior of its own.
      - paragraph [ref=e214]:
        - text: "A separate, unrelated discovery made during this investigation: the"
        - code [ref=e215]: width
        - text: /
        - code [ref=e216]: height
        - text: attributes hand-written on the 9 existing
        - code [ref=e217]: <img>
        - text: tags (e.g.
        - code [ref=e218]: 720×540
        - text: ","
        - code [ref=e219]: 740×560
        - text: ","
        - code [ref=e220]: 680×520
        - text: ) did not match the true intrinsic ratio of the source PNGs (all
        - code [ref=e221]: 1536×1024
        - text: ", a 3:2 ratio) — a latent, minor CLS bug, since"
        - code [ref=e222]: height:auto
        - text: recomputes to the image's real ratio once loaded, momentarily disagreeing with the reserved placeholder space.
      - heading "Decision" [level=2] [ref=e223]
      - paragraph [ref=e224]:
        - text: "1."
        - strong [ref=e225]:
          - text: "No"
          - code [ref=e226]: agtc-illustration
          - text: component is built.
        - text: The
        - code [ref=e227]: agtc-illustration
        - text: P2 ticket is closed as Abandoned — not deferred, not renamed, actually superseded by direct
        - code [ref=e228]: agtc-image
        - text: usage. 2.
        - strong [ref=e229]:
          - text: All 9 home page illustrations now use
          - code [ref=e230]: <agtc-image decorative fit="contain">
        - text: directly inside their existing, unchanged
        - code [ref=e231]: <figure class="illus illus-X" aria-hidden="true">
        - text: wrapper. The figure keeps full ownership of position/bleed/sizing via the site's existing layout CSS;
        - code [ref=e232]: agtc-image
        - text: owns loading/anti-CLS/fallback for the image itself. This resolves the separate Site-domain "Migrer les balises
        - img
        - text: existantes vers agtc-image" ticket at the same time — same underlying change. 3.
        - strong [ref=e233]:
          - code [ref=e234]: width
          - text: /
          - code [ref=e235]: height
          - text: corrected to
          - code [ref=e236]: 768×512
        - text: (true 3:2 ratio) on all 9 instances, fixing the latent CLS mismatch described above. 4.
        - strong [ref=e237]:
          - code [ref=e238]: prefers-reduced-motion
          - text: added for
          - code [ref=e239]: .illus-ambient
          - text: "'s"
          - code [ref=e240]: float-illus
          - text: animation
        - text: ", in"
        - code [ref=e241]: site/build.js
        - text: "'s existing"
        - code [ref=e242]: /* REDUCED MOTION */
        - text: block — closes a pre-existing WCAG 2.3.3 gap surfaced while reviewing this pattern, unrelated to the component-vs-no-component question but caught in the same pass. 5.
        - strong [ref=e243]: "Dead CSS removed:"
        - code [ref=e244]: .illus img
        - text: and
        - code [ref=e245]: .illus-hero img
        - text: descendant rules, which no longer match anything now that no bare
        - code [ref=e246]: <img>
        - text: exists inside
        - code [ref=e247]: .illus
        - text: (the real
        - code [ref=e248]: <img>
        - text: now lives inside
        - code [ref=e249]: agtc-image
        - text: "'s shadow DOM, unreachable by outer selectors regardless)."
      - heading "Rejected alternatives" [level=2] [ref=e250]
      - table [ref=e252]:
        - rowgroup [ref=e253]:
          - row "Alternative Reason for rejection" [ref=e254]:
            - columnheader "Alternative" [ref=e255]
            - columnheader "Reason for rejection" [ref=e256]
        - rowgroup [ref=e257]:
          - row "Build agtc-illustration as originally scoped, replacing the <figure> entirely Would require rewriting 5 position/bleed CSS selectors that match on the literal figure tag and sibling position — real risk to the live marketing home page's layout for no behavioral gain over direct agtc-image usage" [ref=e258]:
            - cell "Build agtc-illustration as originally scoped, replacing the <figure> entirely" [ref=e259]:
              - text: Build
              - code [ref=e260]: agtc-illustration
              - text: as originally scoped, replacing the
              - code [ref=e261]: <figure>
              - text: entirely
            - cell "Would require rewriting 5 position/bleed CSS selectors that match on the literal figure tag and sibling position — real risk to the live marketing home page's layout for no behavioral gain over direct agtc-image usage" [ref=e262]:
              - text: Would require rewriting 5 position/bleed CSS selectors that match on the literal
              - code [ref=e263]: figure
              - text: tag and sibling position — real risk to the live marketing home page's layout for no behavioral gain over direct
              - code [ref=e264]: agtc-image
              - text: usage
          - 'row "Build agtc-illustration as a thin pass-through wrapper around agtc-image, keeping the figure external Confirmed with the Design System Lead: once the figure stays external, the wrapper would do nothing agtc-image doesn''t already do — unnecessary abstraction" [ref=e265]':
            - cell "Build agtc-illustration as a thin pass-through wrapper around agtc-image, keeping the figure external" [ref=e266]:
              - text: Build
              - code [ref=e267]: agtc-illustration
              - text: as a thin pass-through wrapper around
              - code [ref=e268]: agtc-image
              - text: ", keeping the figure external"
            - 'cell "Confirmed with the Design System Lead: once the figure stays external, the wrapper would do nothing agtc-image doesn''t already do — unnecessary abstraction" [ref=e269]':
              - text: "Confirmed with the Design System Lead: once the figure stays external, the wrapper would do nothing"
              - code [ref=e270]: agtc-image
              - text: doesn't already do — unnecessary abstraction
          - row "Leave the agtc-illustration ticket open/deferred rather than closing it It isn't waiting on anything — the reasoning that would resolve it already exists in this ADR; leaving it open would misrepresent it as still-actionable future work" [ref=e271]:
            - cell "Leave the agtc-illustration ticket open/deferred rather than closing it" [ref=e272]:
              - text: Leave the
              - code [ref=e273]: agtc-illustration
              - text: ticket open/deferred rather than closing it
            - cell "It isn't waiting on anything — the reasoning that would resolve it already exists in this ADR; leaving it open would misrepresent it as still-actionable future work" [ref=e274]
      - heading "Consequences" [level=2] [ref=e275]
      - list [ref=e276]:
        - listitem [ref=e277]:
          - code [ref=e278]: site/build.js
          - text: ": 9"
          - code [ref=e279]: <img>
          - text: →
          - code [ref=e280]: <agtc-image>
          - text: migrations, corrected
          - code [ref=e281]: width
          - text: /
          - code [ref=e282]: height
          - text: ","
      - paragraph [ref=e283]: reduced-motion fix, 2 dead CSS rules removed.
      - list [ref=e284]:
        - listitem [ref=e285]:
          - text: "GitHub Projects:"
          - code [ref=e286]: agtc-illustration
          - text: (P2) → Abandoned, reason recorded on the item; "Migrer les balises
          - img
          - text: "\" (P3) → Terminé (the board's Status field is French: Backlog/En cours/Terminé/etc.)."
        - listitem [ref=e287]: No new component, no new tokens, no new ADR-036 propagation surfaces beyond this ADR
      - paragraph [ref=e288]:
        - text: itself (there's no
        - code [ref=e289]: guidelines/components/illustration.md
        - text: to write, since there's no such component).
      - list [ref=e290]:
        - listitem [ref=e291]: "Any *future* illustration added to the home page should follow the same pattern:"
      - paragraph [ref=e292]:
        - text: hand-written
        - code [ref=e293]: <figure class="illus illus-X" aria-hidden="true">
        - text: wrapper +
        - code [ref=e294]: <agtc-image decorative fit="contain" width="768" height="512" src="…">
        - text: inside it — not a reintroduction of raw
        - code [ref=e295]: <img>
        - text: .
      - generic [ref=e296]:
        - link "← ADR-083" [ref=e297] [cursor=pointer]:
          - /url: adr-083.html
        - link "ADR-085 →" [ref=e298] [cursor=pointer]:
          - /url: adr-085.html
    - navigation "Table of contents / Table des matières" [ref=e299]:
      - generic [ref=e300]: On this page
      - link "Reference UX patterns applied" [ref=e301] [cursor=pointer]:
        - /url: "#reference-ux-patterns-applied"
      - link "Context" [ref=e302] [cursor=pointer]:
        - /url: "#context"
      - link "Decision" [ref=e303] [cursor=pointer]:
        - /url: "#decision"
      - link "Rejected alternatives" [ref=e304] [cursor=pointer]:
        - /url: "#rejected-alternatives"
      - link "Consequences" [ref=e305] [cursor=pointer]:
        - /url: "#consequences"
  - contentinfo [ref=e306]:
    - generic [ref=e307]:
      - generic [ref=e308]:
        - link "Agentica — Accueil" [ref=e309] [cursor=pointer]:
          - /url: ../index.html
          - img [ref=e310]
        - link "Guilherme Negreiros" [ref=e311] [cursor=pointer]:
          - /url: https://www.linkedin.com/in/gnegreiros/
          - img [ref=e312]
          - text: Guilherme Negreiros
      - generic [ref=e316]:
        - generic [ref=e317]: Navigation
        - link "Home" [ref=e318] [cursor=pointer]:
          - /url: ../index.html
        - link "Why" [ref=e319] [cursor=pointer]:
          - /url: ../pourquoi.html
        - link "Architecture" [ref=e320] [cursor=pointer]:
          - /url: ../architecture.html
        - link "Quality" [ref=e321] [cursor=pointer]:
          - /url: ../qualite.html
        - link "AI" [ref=e322] [cursor=pointer]:
          - /url: ../ia.html
      - generic [ref=e323]:
        - generic [ref=e324]: Documentation
        - link "Understand" [ref=e325] [cursor=pointer]:
          - /url: ../pourquoi.html
        - link "Get started" [ref=e326] [cursor=pointer]:
          - /url: ../get-started.html
        - link "Foundations" [ref=e327] [cursor=pointer]:
          - /url: ../foundations/index.html
        - link "Components" [ref=e328] [cursor=pointer]:
          - /url: ../components/index.html
        - link "Tokens" [ref=e329] [cursor=pointer]:
          - /url: ../tokens/index.html
        - link "Decisions" [ref=e330] [cursor=pointer]:
          - /url: ../decisions/index.html
        - link "Continuity" [ref=e331] [cursor=pointer]:
          - /url: ../continuite.html
        - link "Changelog" [ref=e332] [cursor=pointer]:
          - /url: ../changelog.html
      - generic [ref=e333]:
        - generic [ref=e334]: Explorer
        - link "Storybook" [ref=e335] [cursor=pointer]:
          - /url: https://main--6a1c1e665ec5fe8fc0540983.chromatic.com/
        - link "GitHub" [ref=e336] [cursor=pointer]:
          - /url: https://github.com/gnegreiros-ux/agentica-design-system
        - link "Audit" [ref=e337] [cursor=pointer]:
          - /url: ../audit.html
        - link "AI Brief" [ref=e338] [cursor=pointer]:
          - /url: ../ai-brief.html
    - generic [ref=e339]:
      - generic [ref=e340]: © 2026 Guilherme Negreiros
      - generic [ref=e341]: Built with Claude Code.
  - button "Retour en haut" [ref=e342] [cursor=pointer]:
    - img [ref=e343]
    - generic [ref=e345]: Top
  - status [ref=e346]
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
     |                                                                                                    ^ Error: French content visible in decisions/adr-084.html with data-lang=en:
  77 |     });
  78 |   }
  79 | });
  80 | 
```