import { expect, type Page, test } from '@playwright/test';

const screenshotOptions = {
  animations: 'disabled' as const,
  caret: 'hide' as const,
  maxDiffPixelRatio: 0.02,
};

test.use({ serviceWorkers: 'block' });

const openApp = async (page: Page) => {
  await page.goto('/');
  await expect(page.getByText('我的队伍')).toBeVisible();
};

test('captures the mobile visual regression smoke set', async ({ page }) => {
  await openApp(page);

  await expect(page).toHaveScreenshot('01-team-compact.png', screenshotOptions);

  await page.getByText('烈咬陆鲨 Garchomp').click();
  await expect(page.getByText('示例能力值')).toBeVisible();
  await expect(page).toHaveScreenshot('02-team-expanded.png', screenshotOptions);

  await page.getByTitle('编辑成员').click();
  await expect(page.getByText('编辑成员')).toBeVisible();
  await expect(page).toHaveScreenshot('03-member-editor.png', screenshotOptions);
  await page.getByTitle('关闭').click();

  await page.getByRole('button', { name: '计算', exact: true }).click();
  await expect(page.getByText('选择进攻方')).toBeVisible();
  await expect(page).toHaveScreenshot('04-calculator-selector.png', screenshotOptions);

  await page.getByRole('button', { name: '速度线', exact: true }).click();
  await expect(page.getByText('最终速度', { exact: true })).toBeVisible();
  await expect(page).toHaveScreenshot('05-speed-line.png', screenshotOptions);

  await page.getByRole('button', { name: '图鉴', exact: true }).click();
  await expect(page.getByText('规则内图鉴')).toBeVisible();
  await expect(page).toHaveScreenshot('06-dex.png', screenshotOptions);

  await page.getByRole('button', { name: '设置', exact: true }).click();
  await expect(page.getByText('数据管理')).toBeVisible();
  await expect(page).toHaveScreenshot('07-settings.png', screenshotOptions);

  await page.getByRole('button', { name: /当前规则/ }).click();
  await expect(page.getByText('规则周期')).toBeVisible();
  await expect(page).toHaveScreenshot('08-rule-detail.png', screenshotOptions);
});
