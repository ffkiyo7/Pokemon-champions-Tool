import 'fake-indexeddb/auto';
import { beforeEach, describe, expect, it } from 'vitest';
import { defaultPreferences, defaultTeams } from '../data';
import type { Team } from '../types';
import { repository } from './db';

const DB_NAME = 'pokemon-champions-assistant';

const deleteDb = () =>
  new Promise<void>((resolve, reject) => {
    const request = indexedDB.deleteDatabase(DB_NAME);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
    request.onblocked = () => reject(new Error('IndexedDB delete was blocked'));
  });

const cloneTeam = (team: Team, patch: Partial<Team> = {}): Team => ({
  ...team,
  members: team.members.map((member) => ({ ...member, moveIds: [...member.moveIds], statPoints: { ...member.statPoints } })),
  ...patch,
});

describe('IndexedDB repository', () => {
  beforeEach(async () => {
    await deleteDb();
  });

  it('seeds default teams and preferences on first load', async () => {
    const state = await repository.loadState();

    expect(state.teams).toEqual(defaultTeams);
    expect(state.preferences).toEqual(defaultPreferences);
  });

  it('saves and reloads a team', async () => {
    await repository.loadState();
    const savedTeam = cloneTeam(defaultTeams[0], {
      id: 'saved-team',
      name: 'Saved team',
    });

    await repository.saveTeam(savedTeam);
    const state = await repository.loadState();

    expect(state.teams.some((team) => team.id === 'saved-team' && team.name === 'Saved team')).toBe(true);
  });

  it('deletes a team by id', async () => {
    await repository.loadState();

    await repository.deleteTeam(defaultTeams[0].id);
    const state = await repository.loadState();

    expect(state.teams.some((team) => team.id === defaultTeams[0].id)).toBe(false);
  });

  it('replaces all teams', async () => {
    await repository.loadState();
    const replacement = cloneTeam(defaultTeams[0], {
      id: 'replacement-team',
      name: 'Replacement team',
    });

    await repository.replaceTeams([replacement]);
    const state = await repository.loadState();

    expect(state.teams).toHaveLength(1);
    expect(state.teams[0].id).toBe('replacement-team');
  });

  it('clears local teams and preferences', async () => {
    await repository.loadState();

    await repository.clearAll();
    const state = await repository.loadState();

    expect(state.teams).toEqual([]);
    expect(state.preferences).toEqual(defaultPreferences);
  });
});
