// Chromatic Story Modes — captures two snapshots per story (light + dark).
// Reference: https://www.chromatic.com/docs/modes/
// Usage in a story:
//   import { allModes } from '../.storybook/modes.js';
//   export const MyStory = { parameters: { chromatic: { modes: allModes } } };
// Or globally in preview.js (chromatic.modes parameter at the global level).

// Chromatic's backgrounds config needs a literal resolved color — it renders the
// Storybook canvas background before/outside the story's own CSS custom property
// scope, so var(--agtc-semantic-color-background-page) isn't resolvable here.
// Values match semantic.color.background.page (light/dark) exactly.
export const allModes = {
  light: {
    theme: 'light',
    backgrounds: { value: '#fcfcfc' }, // audit-ignore: literal value required by Chromatic tooling config
  },
  dark: {
    theme: 'dark',
    backgrounds: { value: '#0a0c11' }, // audit-ignore: literal value required by Chromatic tooling config
  },
};
