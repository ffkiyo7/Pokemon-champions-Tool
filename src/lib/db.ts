import type { AppState, Team, UserPreference } from '../types';
import { defaultPreferences, defaultTeams } from '../data';

const DB_NAME = 'pokemon-champions-assistant';
const DB_VERSION = 1;
const TEAM_STORE = 'teams';
const META_STORE = 'meta';

type StoreName = typeof TEAM_STORE | typeof META_STORE;

const openDb = () =>
  new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(TEAM_STORE)) {
        db.createObjectStore(TEAM_STORE, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(META_STORE)) {
        db.createObjectStore(META_STORE, { keyPath: 'key' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });

const runStore = async <T>(
  storeName: StoreName,
  mode: IDBTransactionMode,
  operation: (store: IDBObjectStore) => IDBRequest<T>,
) => {
  const db = await openDb();
  return new Promise<T>((resolve, reject) => {
    const transaction = db.transaction(storeName, mode);
    const request = operation(transaction.objectStore(storeName));
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
    transaction.oncomplete = () => db.close();
    transaction.onerror = () => {
      db.close();
      reject(transaction.error);
    };
  });
};

export const repository = {
  async loadState(): Promise<AppState> {
    const teams = await runStore<Team[]>(TEAM_STORE, 'readonly', (store) => store.getAll());
    const preferencesRow = await runStore<{ key: string; value: UserPreference } | undefined>(META_STORE, 'readonly', (store) =>
      store.get('preferences'),
    );

    if (teams.length === 0) {
      await Promise.all(defaultTeams.map((team) => this.saveTeam(team)));
      await this.savePreferences(defaultPreferences);
      return { teams: defaultTeams, preferences: defaultPreferences };
    }

    return {
      teams,
      preferences: preferencesRow?.value ?? defaultPreferences,
    };
  },

  saveTeam(team: Team) {
    return runStore<IDBValidKey>(TEAM_STORE, 'readwrite', (store) => store.put(team));
  },

  deleteTeam(teamId: string) {
    return runStore<undefined>(TEAM_STORE, 'readwrite', (store) => store.delete(teamId));
  },

  savePreferences(preferences: UserPreference) {
    return runStore<IDBValidKey>(META_STORE, 'readwrite', (store) => store.put({ key: 'preferences', value: preferences }));
  },

  async replaceTeams(teams: Team[]) {
    const db = await openDb();
    return new Promise<void>((resolve, reject) => {
      const transaction = db.transaction(TEAM_STORE, 'readwrite');
      const store = transaction.objectStore(TEAM_STORE);
      store.clear();
      teams.forEach((team) => store.put(team));
      transaction.oncomplete = () => {
        db.close();
        resolve();
      };
      transaction.onerror = () => {
        db.close();
        reject(transaction.error);
      };
    });
  },

  async clearAll() {
    const db = await openDb();
    return new Promise<void>((resolve, reject) => {
      const transaction = db.transaction([TEAM_STORE, META_STORE], 'readwrite');
      transaction.objectStore(TEAM_STORE).clear();
      transaction.objectStore(META_STORE).clear();
      transaction.oncomplete = () => {
        db.close();
        resolve();
      };
      transaction.onerror = () => {
        db.close();
        reject(transaction.error);
      };
    });
  },
};
