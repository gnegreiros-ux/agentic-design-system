import { test, expect } from '@playwright/test';

// toggle.html has no <agtc-toggle> instance in the static HTML.
// The component is loaded via agtc.js — we inject it via evaluate().

test.describe('agtc-toggle — functional', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/components/toggle.html');
    await page.waitForLoadState('networkidle');

    await page.evaluate(() => {
      const fixture = document.createElement('div');
      fixture.id = 'toggle-fixture';
      fixture.style.cssText = 'padding:var(--agtc-semantic-space-component-padding-2xl);display:flex;flex-direction:column;gap:var(--agtc-semantic-space-component-padding-lg);';
      document.body.appendChild(fixture);

      const t1 = document.createElement('agtc-toggle');
      t1.id = 'toggle-off';
      t1.label = 'Dark mode';
      t1.name = 'dark-mode';

      const t2 = document.createElement('agtc-toggle');
      t2.id = 'toggle-on';
      t2.label = 'Notifications';
      t2.name = 'notifs';
      t2.checked = true;

      const t3 = document.createElement('agtc-toggle');
      t3.id = 'toggle-disabled';
      t3.label = 'Sync';
      t3.name = 'sync';
      t3.disabled = true;

      fixture.append(t1, t2, t3);
    });

    await page.waitForFunction(() =>
      document.querySelector('#toggle-off')?.shadowRoot !== null
    );
    await page.waitForTimeout(100);
  });

  // --- Initial state ---

  test('toggle off — checked is false by default', async ({ page }) => {
    const checked = await page.locator('#toggle-off').evaluate((el) => el.checked);
    expect(checked).toBe(false);
  });

  test('toggle on — checked is true', async ({ page }) => {
    const checked = await page.locator('#toggle-on').evaluate((el) => el.checked);
    expect(checked).toBe(true);
  });

  // --- Interaction ---

  test('click toggles checked from false to true', async ({ page }) => {
    await page.locator('#toggle-off').evaluate((el) => {
      el.shadowRoot?.querySelector('input')?.click();
    });
    await page.waitForTimeout(100);
    const checked = await page.locator('#toggle-off').evaluate((el) => el.checked);
    expect(checked).toBe(true);
  });

  test('click toggles checked from true to false', async ({ page }) => {
    await page.locator('#toggle-on').evaluate((el) => {
      el.shadowRoot?.querySelector('input')?.click();
    });
    await page.waitForTimeout(100);
    const checked = await page.locator('#toggle-on').evaluate((el) => el.checked);
    expect(checked).toBe(false);
  });

  test('click emits an agtc-change event', async ({ page }) => {
    let eventValue = null;
    await page.exposeFunction('onToggleChange', (val) => { eventValue = val; });
    await page.locator('#toggle-off').evaluate((el) =>
      el.addEventListener('agtc-change', (e) => window.onToggleChange(e.detail?.checked))
    );
    await page.locator('#toggle-off').evaluate((el) => {
      el.shadowRoot?.querySelector('input')?.click();
    });
    await page.waitForTimeout(100);
    expect(eventValue).toBe(true);
  });

  // --- Disabled state ---

  test('disabled — the component has the disabled attribute', async ({ page }) => {
    await expect(page.locator('#toggle-disabled')).toHaveAttribute('disabled');
  });

  test('disabled — the inner input is disabled', async ({ page }) => {
    const inputDisabled = await page.locator('#toggle-disabled').evaluate((el) => {
      const input = el.shadowRoot?.querySelector('input');
      return input?.disabled ?? false;
    });
    expect(inputDisabled).toBe(true);
  });

  test('disabled — click doesn\'t change the state', async ({ page }) => {
    await page.locator('#toggle-disabled').evaluate((el) => {
      el.shadowRoot?.querySelector('input')?.click();
    });
    await page.waitForTimeout(100);
    const checked = await page.locator('#toggle-disabled').evaluate((el) => el.checked);
    expect(checked).toBe(false);
  });

  // --- Accessibility ---

  test('the inner input is type checkbox or role switch', async ({ page }) => {
    const role = await page.locator('#toggle-off').evaluate((el) => {
      const input = el.shadowRoot?.querySelector('input');
      return input?.getAttribute('role') ?? input?.type;
    });
    expect(['switch', 'checkbox']).toContain(role);
  });

  test('a label is associated with the input', async ({ page }) => {
    const hasLabel = await page.locator('#toggle-off').evaluate((el) => {
      const label = el.shadowRoot?.querySelector('label');
      const input = el.shadowRoot?.querySelector('input');
      return label !== null || input?.getAttribute('aria-label') !== null;
    });
    expect(hasLabel).toBe(true);
  });
});
