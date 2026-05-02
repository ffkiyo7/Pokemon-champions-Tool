import { expect, test } from '@playwright/test';

test('keeps app shell, teams, and favorite benchmarks available offline', async ({ page, context }) => {
  await context.clearCookies();
  await page.goto('/');
  await expect(page.getByText('我的队伍')).toBeVisible();

  const serviceWorkerReady = await page.evaluate(async () => {
    if (!('serviceWorker' in navigator)) return false;
    const registration = await navigator.serviceWorker.ready;
    return Boolean(registration.active);
  });
  expect(serviceWorkerReady).toBe(true);

  await page.reload({ waitUntil: 'networkidle' });
  await expect(page.getByText('我的队伍')).toBeVisible();

  await page.getByRole('button', { name: /新建/ }).click();
  await page.getByPlaceholder(/输入队伍名称/).fill('离线测试队');
  await page.getByRole('button', { name: '确认' }).click();
  await expect(page.getByText(/0\/6 成员/)).toBeVisible();

  await page.getByRole('button', { name: '设置' }).click();
  await expect(page.getByText('本地队伍 2 支')).toBeVisible();

  await page.getByRole('button', { name: '速度线' }).click();
  await page.getByRole('button', { name: '收藏' }).first().click();
  await expect(page.getByRole('button', { name: /最速烈咬陆鲨 最终速度 169/ })).toBeVisible();

  await context.setOffline(true);
  await page.reload({ waitUntil: 'domcontentloaded' });
  await expect(page.getByText('我的队伍')).toBeVisible();

  await page.getByRole('button', { name: '设置' }).click();
  await expect(page.getByText('本地队伍 2 支')).toBeVisible();

  await page.getByRole('button', { name: '速度线' }).click();
  await page.getByRole('button', { name: '收藏' }).first().click();
  await expect(page.getByRole('button', { name: /最速烈咬陆鲨 最终速度 169/ })).toBeVisible();

  await context.setOffline(false);
});
