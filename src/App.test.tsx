// @vitest-environment jsdom
import 'fake-indexeddb/auto';
import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { App } from './App';

const DB_NAME = 'pokemon-champions-assistant';

const deleteDb = () =>
  new Promise<void>((resolve, reject) => {
    const request = indexedDB.deleteDatabase(DB_NAME);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
    request.onblocked = () => resolve();
  });

const renderApp = async () => {
  const user = userEvent.setup();
  render(<App />);
  await screen.findByText('我的队伍');
  return user;
};

describe('App page flows', () => {
  beforeEach(async () => {
    await deleteDb();
  });

  afterEach(() => {
    cleanup();
  });

  it('navigates bottom tabs and opens the rule detail page', async () => {
    const user = await renderApp();

    await user.click(screen.getByRole('button', { name: '计算' }));
    expect(await screen.findByText('伤害计算')).toBeTruthy();

    await user.click(screen.getByRole('button', { name: '图鉴' }));
    expect(await screen.findByText('规则内图鉴')).toBeTruthy();

    await user.click(screen.getByRole('button', { name: '组队' }));
    await user.click(screen.getByText('官方数据源状态可追溯'));
    expect(await screen.findByText('规则周期')).toBeTruthy();

    await user.click(screen.getByRole('button', { name: /返回/ }));
    expect(await screen.findByText('我的队伍')).toBeTruthy();
  });

  it('creates and switches teams, then expands and collapses a member card', async () => {
    const user = await renderApp();

    await user.click(screen.getByRole('button', { name: /新建/ }));
    expect(await screen.findByText(/0\/6 成员/)).toBeTruthy();

    await user.click(screen.getByRole('button', { name: 'M-A 测试队' }));
    expect(await screen.findByText(/2\/6 成员/)).toBeTruthy();

    await user.click(screen.getByText('烈咬陆鲨 Garchomp'));
    expect(await screen.findByText('示例能力值')).toBeTruthy();

    await user.click(screen.getByTitle('收起成员'));
    expect(screen.queryByText('示例能力值')).toBeNull();
  });

  it('keeps member editing focused on Pokemon, moves, nature, item, ability, and six SP fields', async () => {
    const user = await renderApp();

    await user.click(screen.getByText('烈咬陆鲨 Garchomp'));
    await user.click(screen.getByTitle('编辑成员'));

    expect(await screen.findByText('编辑成员')).toBeTruthy();
    expect(screen.queryByText('等级')).toBeNull();
    expect(screen.queryByText('备注')).toBeNull();

    ['HP SP', '攻击 SP', '防御 SP', '特攻 SP', '特防 SP', '速度 SP'].forEach((label) => {
      expect(screen.getByText(label)).toBeTruthy();
    });
  });

  it('selects both calculator sides from searchable current-rule Pokemon and team recommendations', async () => {
    const user = await renderApp();

    await user.click(screen.getByRole('button', { name: '计算' }));
    expect(await screen.findByText('选择进攻方')).toBeTruthy();
    expect(screen.getByText('当前队伍推荐')).toBeTruthy();
    expect(screen.queryByText('小顿熊')).toBeNull();

    await user.click(screen.getByRole('button', { name: /防守方/ }));
    expect(await screen.findByText('选择防守方')).toBeTruthy();
    const selector = screen.getByText('选择防守方').closest('section');
    expect(selector).toBeTruthy();

    const recommendedGarchomp = within(selector as HTMLElement).getByRole('button', { name: /烈咬陆鲨/ });
    await user.click(recommendedGarchomp);
    const recommendedDefenderCard = screen.getByRole('button', { name: /防守方/ });
    expect(within(recommendedDefenderCard).getByText('烈咬陆鲨 Garchomp')).toBeTruthy();
    expect(recommendedGarchomp.getAttribute('aria-pressed')).toBe('true');

    await user.type(screen.getByPlaceholderText('搜索名称或属性'), 'Torkoal');
    await user.click(within(selector as HTMLElement).getByText('コータス'));

    const defenderCard = screen.getByRole('button', { name: /防守方/ });
    expect(within(defenderCard).getByText('コータス Torkoal')).toBeTruthy();
    expect(screen.getByText('该机制待确认，计算暂不可用')).toBeTruthy();
  });

  it('filters the Pokedex Pokemon list by type chips', async () => {
    const user = await renderApp();

    await user.click(screen.getByRole('button', { name: '图鉴' }));
    expect(await screen.findByText('规则内图鉴')).toBeTruthy();

    await user.click(screen.getByRole('button', { name: '火' }));
    expect(screen.getAllByText('炽焰咆哮虎 Incineroar').length).toBeGreaterThan(0);
    expect(screen.getByText('コータス Torkoal')).toBeTruthy();
    expect(screen.queryByText('水君 Politoed')).toBeNull();

    await user.click(screen.getByRole('button', { name: '水' }));
    expect(screen.getAllByText('水君 Politoed').length).toBeGreaterThan(0);
    expect(screen.queryByText('炽焰咆哮虎 Incineroar')).toBeNull();
  });
});
