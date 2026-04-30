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

    await user.click(screen.getByText('烈咬陆鲨'));
    expect(await screen.findByText('示例能力值')).toBeTruthy();
    await user.click(screen.getByRole('button', { name: /能力配置/ }));
    expect(await screen.findByText('编辑成员')).toBeTruthy();
    await user.click(screen.getByTitle('关闭'));

    await user.click(screen.getByTitle('收起成员'));
    expect(screen.queryByText('示例能力值')).toBeNull();
  });

  it('keeps member editing focused on Pokemon, moves, nature, item, ability, and six SP fields', async () => {
    const user = await renderApp();

    await user.click(screen.getByText('烈咬陆鲨'));
    await user.click(screen.getByTitle('编辑成员'));

    expect(await screen.findByText('编辑成员')).toBeTruthy();
    expect(screen.queryByText('等级')).toBeNull();
    expect(screen.queryByText('备注')).toBeNull();

    ['HP SP', '攻击 SP', '防御 SP', '特攻 SP', '特防 SP', '速度 SP'].forEach((label) => {
      expect(screen.getAllByText(label.replace(' SP', '')).length).toBeGreaterThan(0);
    });
    expect(screen.getByText('已用 65/66')).toBeTruthy();

    await user.click(screen.getByRole('button', { name: /速度\s*32/ }));
    expect(screen.getByText('速度 SP')).toBeTruthy();
    expect(screen.getByRole('slider', { name: '速度 SP' }).getAttribute('max')).toBe('32');
    expect(screen.getByRole('button', { name: 'min' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'max' })).toBeTruthy();
  });

  it('selects both calculator sides from searchable current-rule Pokemon and team recommendations', async () => {
    const user = await renderApp();

    await user.click(screen.getByRole('button', { name: '计算' }));
    expect(await screen.findByText('选择进攻方')).toBeTruthy();
    expect(screen.getByText('当前队伍推荐')).toBeTruthy();
    expect(screen.queryByText('小顿熊')).toBeNull();
    expect(screen.getByText('选择招式')).toBeTruthy();
    expect(screen.getByText('天气')).toBeTruthy();
    await user.selectOptions(screen.getByLabelText('选择招式'), 'dragon-claw');
    await user.selectOptions(screen.getByLabelText('天气'), '晴天');
    expect((screen.getByLabelText('选择招式') as HTMLSelectElement).value).toBe('dragon-claw');
    expect((screen.getByLabelText('天气') as HTMLSelectElement).value).toBe('晴天');
    expect(within(screen.getByLabelText('Mega 状态')).getByText('进攻方 Mega Garchomp')).toBeTruthy();
    expect(within(screen.getByLabelText('Mega 状态')).getByText('防守方不支持 Mega')).toBeTruthy();

    await user.click(screen.getByRole('button', { name: /防守方/ }));
    expect(await screen.findByText('选择防守方')).toBeTruthy();
    const selector = screen.getByText('选择防守方').closest('section');
    expect(selector).toBeTruthy();

    const recommendedGarchomp = within(selector as HTMLElement).getByRole('button', { name: /烈咬陆鲨/ });
    await user.click(recommendedGarchomp);
    const recommendedDefenderCard = screen.getByRole('button', { name: /防守方/ });
    expect(within(recommendedDefenderCard).getByText('烈咬陆鲨')).toBeTruthy();
    expect(recommendedGarchomp.getAttribute('aria-pressed')).toBe('true');

    await user.type(screen.getByPlaceholderText('搜索名称'), 'Torkoal');
    await user.click(within(selector as HTMLElement).getByText('煤炭龟'));

    const defenderCard = screen.getByRole('button', { name: /防守方/ });
    expect(within(defenderCard).getByText('煤炭龟')).toBeTruthy();
    expect(screen.getByText('该机制待确认，计算暂不可用')).toBeTruthy();
  });

  it('filters the Pokedex Pokemon list by up to two selected types', async () => {
    const user = await renderApp();

    await user.click(screen.getByRole('button', { name: '图鉴' }));
    expect(await screen.findByText('规则内图鉴')).toBeTruthy();
    expect(screen.getByPlaceholderText('搜索名称')).toBeTruthy();

    await user.click(screen.getByRole('button', { name: /属性：全部/ }));
    await user.click(screen.getByRole('button', { name: /^火属性$/ }));
    await user.click(screen.getByRole('button', { name: '完成' }));
    expect(screen.getAllByText('炽焰咆哮虎').length).toBeGreaterThan(0);
    expect(screen.getByText('煤炭龟')).toBeTruthy();
    expect(screen.getAllByText('喷火龙').length).toBeGreaterThan(0);
    expect(screen.queryByText('蚊香蛙皇')).toBeNull();

    await user.click(screen.getByRole('button', { name: /属性：火/ }));
    await user.click(screen.getByRole('button', { name: /^飞行属性$/ }));
    await user.click(screen.getByRole('button', { name: '完成' }));
    expect(screen.getAllByText('喷火龙').length).toBeGreaterThan(0);
    expect(screen.queryByText('炽焰咆哮虎')).toBeNull();
    expect(screen.queryByText('煤炭龟')).toBeNull();

    await user.click(screen.getByRole('button', { name: '清空' }));
    await user.click(screen.getByRole('button', { name: /属性：全部/ }));
    await user.click(screen.getByRole('button', { name: /^地面属性$/ }));
    await user.click(screen.getByRole('button', { name: /^龙属性$/ }));
    await user.click(screen.getByRole('button', { name: '完成' }));
    expect(screen.getAllByText('烈咬陆鲨').length).toBeGreaterThan(0);
    expect(screen.getAllByLabelText('龙属性').length).toBeGreaterThan(0);

    await user.click(screen.getByText('烈咬陆鲨'));
    expect(await screen.findByText('Garchomp')).toBeTruthy();
    await user.click(screen.getByRole('button', { name: '切日文' }));
    expect(await screen.findByText('ガブリアス')).toBeTruthy();
    expect(screen.getAllByText('特性').length).toBeGreaterThan(0);
    expect(screen.getByText('种族值')).toBeTruthy();
    expect(screen.getByText('当前规则可学会招式')).toBeTruthy();
    expect(screen.getByText('属性相克')).toBeTruthy();
  });
});
