import { html } from 'lit';

const TOKEN_COLUMNS = [
  { label: 'CSS Token',  align: 'start', width: '46%' },
  { label: 'Reference',  align: 'start', width: '34%' },
  { label: 'Value',      align: 'end',   width: '20%' },
];

const TOKEN_ROWS = [
  ['--agtc-table-default-header-background', 'semantic.color.background.subtle', '#f0f0f0'], // audit-ignore: resolved value shown as reference data
  ['--agtc-table-default-border',           'semantic.color.border.default',    '#e8e8e8'], // audit-ignore: resolved value shown as reference data
  ['--agtc-table-default-row-hover',        'semantic.color.background.hover',   '#f5f5f5'], // audit-ignore: resolved value shown as reference data
  ['--agtc-table-padding-x',                'primitive.space.3',                 '12px'],
];

/** @type { import('@storybook/web-components').Meta } */
export default {
  title: 'Components/agtc-table',
  component: 'agtc-table',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: [
          'UX reference patterns applied (ADR-036/040, T1–T10 all approved):',
          '',
          '- **Semantic HTML + `scope="col"` + `<caption>`** — [Smashing — Table Patterns](https://www.smashingmagazine.com/2019/01/table-design-patterns-web/)',
          '- **Alignment** text/left, numeric/right; **separators** (zebra striping optional); **row hover**; **pinned header**; 1st column = readable identifier — [NN/g — Data Tables](https://www.nngroup.com/articles/data-tables/)',
          '- **Horizontal scroll + overflow indicator** — [Smashing](https://www.smashingmagazine.com/2019/01/table-design-patterns-web/)',
          '',
          'Read-only. Sorting / filtering / pagination are **out of scope for v1** (door left open: the `columns`/`rows` API will accommodate them without breakage).',
          '',
          'Details: `guidelines/components/table.md` § UX Patterns Reference.',
        ].join('\n'),
      },
    },
  },
  argTypes: {
    caption:       { control: 'text' },
    captionHidden: { control: 'boolean', name: 'caption-hidden' },
    striped:       { control: 'boolean' },
    stickyHeader:  { control: 'boolean', name: 'sticky-header' },
    density:       { control: 'select', options: ['compact', 'comfortable'], table: { defaultValue: { summary: 'compact' } } },
  },
  args: {
    caption: 'Table component tokens',
    captionHidden: true,
    striped: false,
    stickyHeader: false,
    density: 'compact',
  },
  render: (args) => {
    const el = document.createElement('agtc-table');
    el.columns = TOKEN_COLUMNS;
    el.rows = TOKEN_ROWS;
    el.caption = args.caption ?? '';
    el.captionHidden = args.captionHidden;
    el.striped = args.striped;
    el.stickyHeader = args.stickyHeader;
    el.density = args.density;
    return el;
  },
};

// ── Default: row separators ──────────────────────────────────────────────────
export const Default = {
  name: 'Default — row separators',
  render: () => {
    const el = document.createElement('agtc-table');
    el.columns = TOKEN_COLUMNS;
    el.rows = TOKEN_ROWS;
    el.caption = 'Table component tokens';
    el.captionHidden = true;
    return el;
  },
};

// ── Zebra striping (T4 option) ────────────────────────────────────────────────
export const Striped = {
  name: 'Zebra striping (striped)',
  render: () => {
    const el = document.createElement('agtc-table');
    el.columns = TOKEN_COLUMNS;
    el.rows = [...TOKEN_ROWS, ...TOKEN_ROWS];
    el.caption = 'Striped table';
    el.captionHidden = true;
    el.striped = true;
    return el;
  },
};

// ── Visible caption (T2) ──────────────────────────────────────────────────────
export const WithCaption = {
  name: 'Visible caption',
  render: () => {
    const el = document.createElement('agtc-table');
    el.columns = [
      { label: 'Step', align: 'start' },
      { label: 'Value', align: 'end' },
      { label: 'Role', align: 'start' },
    ];
    el.rows = [
      ['space-1', '4px', 'Minimal spacing'],
      ['space-2', '8px', 'Dense controls'],
      ['space-3', '12px', 'Standard padding'],
    ];
    el.caption = 'Primitive spacing scale';
    return el;
  },
};

// ── Comfortable density (T9) ──────────────────────────────────────────────────
export const Comfortable = {
  name: 'Comfortable density',
  render: () => {
    const el = document.createElement('agtc-table');
    el.columns = TOKEN_COLUMNS;
    el.rows = TOKEN_ROWS;
    el.caption = 'Comfortable density';
    el.captionHidden = true;
    el.density = 'comfortable';
    return el;
  },
};
