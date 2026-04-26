import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { currentDataVersion, currentRuleSet, defaultPreferences } from '../data';
import { repository } from '../lib/db';
import type { AppState, Team, TeamMember, UserPreference } from '../types';

type Store = AppState & {
  loading: boolean;
  saveTeam: (team: Team) => Promise<void>;
  deleteTeam: (teamId: string) => Promise<void>;
  addTeam: () => Promise<void>;
  updateMember: (teamId: string, member: TeamMember) => Promise<void>;
  toggleFavoriteBenchmark: (benchmarkId: string) => Promise<void>;
  replaceTeams: (teams: Team[]) => Promise<void>;
  clearLocalData: () => Promise<void>;
  simulateRefresh: () => Promise<void>;
};

const AppContext = createContext<Store | undefined>(undefined);

const now = () => new Date().toISOString();

const createEmptyTeam = (): Team => ({
  id: crypto.randomUUID(),
  name: `新队伍 ${new Date().toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' })}`,
  ruleSetId: currentRuleSet.id,
  dataVersionId: currentDataVersion.id,
  members: [],
  createdAt: now(),
  updatedAt: now(),
  notes: '',
});

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [teams, setTeams] = useState<Team[]>([]);
  const [preferences, setPreferences] = useState<UserPreference>(defaultPreferences);
  const [lastRefreshError, setLastRefreshError] = useState<string | undefined>();

  useEffect(() => {
    repository
      .loadState()
      .then((state) => {
        setTeams(state.teams);
        setPreferences(state.preferences);
      })
      .catch(() => {
        setTeams([]);
        setPreferences(defaultPreferences);
        setLastRefreshError('IndexedDB 不可用，当前仅能使用内存数据。');
      })
      .finally(() => setLoading(false));
  }, []);

  const saveTeam = useCallback(async (team: Team) => {
    const nextTeam = { ...team, updatedAt: now() };
    setTeams((current) => current.map((item) => (item.id === team.id ? nextTeam : item)));
    await repository.saveTeam(nextTeam);
  }, []);

  const deleteTeam = useCallback(async (teamId: string) => {
    setTeams((current) => current.filter((item) => item.id !== teamId));
    await repository.deleteTeam(teamId);
  }, []);

  const addTeam = useCallback(async () => {
    const team = createEmptyTeam();
    setTeams((current) => [team, ...current]);
    await repository.saveTeam(team);
  }, []);

  const updateMember = useCallback(
    async (teamId: string, member: TeamMember) => {
      const team = teams.find((item) => item.id === teamId);
      if (!team) return;
      const exists = team.members.some((item) => item.id === member.id);
      const nextMembers = exists ? team.members.map((item) => (item.id === member.id ? member : item)) : [...team.members, member].slice(0, 6);
      await saveTeam({ ...team, members: nextMembers });
    },
    [saveTeam, teams],
  );

  const savePreferences = useCallback(async (next: UserPreference) => {
    setPreferences(next);
    await repository.savePreferences(next);
  }, []);

  const toggleFavoriteBenchmark = useCallback(
    async (benchmarkId: string) => {
      const exists = preferences.favoriteBenchmarkIds.includes(benchmarkId);
      await savePreferences({
        ...preferences,
        favoriteBenchmarkIds: exists
          ? preferences.favoriteBenchmarkIds.filter((id) => id !== benchmarkId)
          : [...preferences.favoriteBenchmarkIds, benchmarkId],
      });
    },
    [preferences, savePreferences],
  );

  const replaceTeams = useCallback(async (nextTeams: Team[]) => {
    setTeams(nextTeams);
    await repository.replaceTeams(nextTeams);
  }, []);

  const clearLocalData = useCallback(async () => {
    await repository.clearAll();
    setTeams([]);
    setPreferences(defaultPreferences);
  }, []);

  const simulateRefresh = useCallback(async () => {
    setLastRefreshError('刷新失败，当前使用本地缓存。MVP 暂不接真实官方数据源。');
    await savePreferences({ ...preferences, lastDataRefreshAt: now() });
  }, [preferences, savePreferences]);

  const value = useMemo<Store>(
    () => ({
      loading,
      teams,
      preferences,
      lastRefreshError,
      saveTeam,
      deleteTeam,
      addTeam,
      updateMember,
      toggleFavoriteBenchmark,
      replaceTeams,
      clearLocalData,
      simulateRefresh,
    }),
    [
      addTeam,
      clearLocalData,
      deleteTeam,
      lastRefreshError,
      loading,
      preferences,
      replaceTeams,
      saveTeam,
      simulateRefresh,
      teams,
      toggleFavoriteBenchmark,
      updateMember,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export const useAppStore = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppStore must be used within AppProvider');
  return context;
};
