import { test, expect } from '@playwright/test';

// tabs.html has no <agtc-tabs> instance in the static HTML.
// The component is registered via agtc.js — we inject it via evaluate().

test.describe('agtc-tabs — functional', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/components/tabs.html');
    await page.waitForLoadState('networkidle');

    await page.evaluate(() => {
      const fixture = document.createElement('div');
      fixture.id = 'tabs-fixture';
      fixture.style.cssText = 'padding:var(--agtc-semantic-space-component-padding-2xl);';
      document.body.appendChild(fixture);

      const tabs = document.createElement('agtc-tabs');
      tabs.label = 'Test tabs';
      tabs.selected = 'overview';

      // Content is rendered via named slots (slot="<value>"), not the panel property
      ['overview', 'usage', 'tokens'].forEach((val) => {
        const p = document.createElement('p');
        p.setAttribute('slot', val);
        p.textContent = `Content ${val}`;
        tabs.appendChild(p);
      });

      fixture.appendChild(tabs);

      tabs.tabs = [
        { value: 'overview', label: 'Overview' },
        { value: 'usage',    label: 'Usage' },
        { value: 'tokens',   label: 'Tokens' },
      ];
    });

    await page.waitForFunction(() => {
      const el = document.querySelector('#tabs-fixture agtc-tabs');
      return el && el.shadowRoot !== null;
    });
    await page.waitForTimeout(150);
  });

  // --- ARIA structure ---

  test('role="tablist" present in the shadow DOM', async ({ page }) => {
    const hasTablist = await page.locator('#tabs-fixture agtc-tabs').evaluate((el) =>
      el.shadowRoot?.querySelector('[role="tablist"]') !== null
    );
    expect(hasTablist).toBe(true);
  });

  test('3 tabs with role="tab"', async ({ page }) => {
    const count = await page.locator('#tabs-fixture agtc-tabs').evaluate((el) =>
      el.shadowRoot?.querySelectorAll('[role="tab"]').length ?? 0
    );
    expect(count).toBe(3);
  });

  test('the selected tab has aria-selected="true"', async ({ page }) => {
    const selectedTab = await page.locator('#tabs-fixture agtc-tabs').evaluate((el) => {
      const tab = el.shadowRoot?.querySelector('[role="tab"][aria-selected="true"]');
      return tab?.textContent?.trim() ?? null;
    });
    expect(selectedTab).toBeTruthy();
  });

  // --- Switching ---

  test('clicking the 2nd tab updates aria-selected', async ({ page }) => {
    const tabs = page.locator('#tabs-fixture agtc-tabs');

    await tabs.evaluate((el) => {
      const tabEls = el.shadowRoot?.querySelectorAll('[role="tab"]') ?? [];
      tabEls[1]?.click();
    });
    await page.waitForTimeout(100);

    const selectedIndex = await tabs.evaluate((el) => {
      const tabEls = Array.from(el.shadowRoot?.querySelectorAll('[role="tab"]') ?? []);
      return tabEls.findIndex((t) => t.getAttribute('aria-selected') === 'true');
    });
    expect(selectedIndex).toBe(1);
  });

  test('clicking the 2nd tab makes the usage panel visible', async ({ page }) => {
    await page.locator('#tabs-fixture agtc-tabs').evaluate((el) => {
      const tabEls = el.shadowRoot?.querySelectorAll('[role="tab"]') ?? [];
      tabEls[1]?.click();
    });
    await page.waitForTimeout(100);

    // The usage panel must not have the [hidden] attribute (content via light-DOM slot)
    const panelHidden = await page.evaluate(() => {
      const tabs = document.querySelector('#tabs-fixture agtc-tabs');
      const panel = tabs?.shadowRoot?.querySelector('#panel-usage');
      return panel?.hasAttribute('hidden') ?? true;
    });
    expect(panelHidden).toBe(false);
  });

  // --- Keyboard ---

  test('ArrowRight moves focus to the next tab', async ({ page }) => {
    const tabs = page.locator('#tabs-fixture agtc-tabs');

    await tabs.evaluate((el) => {
      el.shadowRoot?.querySelector('[role="tab"]')?.focus();
    });
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(100);

    const focusedIndex = await tabs.evaluate((el) => {
      const tabEls = Array.from(el.shadowRoot?.querySelectorAll('[role="tab"]') ?? []);
      return tabEls.findIndex((t) => t === el.shadowRoot?.activeElement);
    });
    expect(focusedIndex).toBe(1);
  });
});
