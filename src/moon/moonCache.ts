import { getRecentChanges, getRecord, searchRecords, MoonRecord } from './moonApi';

/**
 * Keeps every Moon record ALQAMI has shown in IndexedDB, so a recalled object still opens in a hall with no
 * signal. Moon's change feed says which records changed since the last check; only those are fetched again.
 */

const DB_NAME = 'alqami-moon';
const DB_VERSION = 1;
const RECORDS = 'records';
const META = 'meta';
const SYNC_EVERY_MS = 5 * 60 * 1000;

interface CachedRecord {
  id: string;
  record: MoonRecord;
  fetchedAt: number;
}

let dbPromise: Promise<IDBDatabase | null> | null = null;
// Used when IndexedDB is unavailable (private mode, blocked storage): the app works, it just forgets on reload.
const memory = new Map<string, CachedRecord>();
const memoryMeta = new Map<string, unknown>();

function openDb(): Promise<IDBDatabase | null> {
  if (!dbPromise) {
    dbPromise = new Promise((resolve) => {
      try {
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        request.onupgradeneeded = () => {
          const db = request.result;
          if (!db.objectStoreNames.contains(RECORDS)) db.createObjectStore(RECORDS, { keyPath: 'id' });
          if (!db.objectStoreNames.contains(META)) db.createObjectStore(META);
        };
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => resolve(null);
      } catch {
        resolve(null);
      }
    });
  }
  return dbPromise;
}

async function tx<T>(store: string, mode: IDBTransactionMode, run: (s: IDBObjectStore) => IDBRequest<T>): Promise<T | undefined> {
  const db = await openDb();
  if (!db) return undefined;
  return new Promise((resolve) => {
    try {
      const request = run(db.transaction(store, mode).objectStore(store));
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => resolve(undefined);
    } catch {
      resolve(undefined);
    }
  });
}

async function readCached(id: string): Promise<CachedRecord | undefined> {
  return (await tx<CachedRecord>(RECORDS, 'readonly', (s) => s.get(id))) ?? memory.get(id);
}

async function writeCached(entry: CachedRecord) {
  memory.set(entry.id, entry);
  await tx(RECORDS, 'readwrite', (s) => s.put(entry));
}

async function dropCached(id: string) {
  memory.delete(id);
  await tx(RECORDS, 'readwrite', (s) => s.delete(id));
}

async function allCached(): Promise<CachedRecord[]> {
  const stored = await tx<CachedRecord[]>(RECORDS, 'readonly', (s) => s.getAll());
  return stored ?? [...memory.values()];
}

async function readMeta<T>(key: string): Promise<T | undefined> {
  return ((await tx<T>(META, 'readonly', (s) => s.get(key) as IDBRequest<T>)) ?? memoryMeta.get(key)) as T | undefined;
}

async function writeMeta(key: string, value: unknown) {
  memoryMeta.set(key, value);
  await tx(META, 'readwrite', (s) => s.put(value, key));
}

let syncing: Promise<void> | null = null;

/** Forget cached records that Moon has changed since the last check. Quiet when offline. */
export function syncWithMoon(force = false): Promise<void> {
  if (syncing) return syncing;
  syncing = (async () => {
    const lastCheck = (await readMeta<number>('lastCheck')) || 0;
    if (!force && Date.now() - lastCheck < SYNC_EVERY_MS) return;
    const since = (await readMeta<string>('lastChange')) || '';
    const changes = await getRecentChanges();
    const newer = changes.filter((c) => c.published > since);
    await Promise.all(newer.map((c) => dropCached(c.recordId)));
    if (changes[0]) await writeMeta('lastChange', changes[0].published);
    await writeMeta('lastCheck', Date.now());
  })()
    .catch(() => {
      // Offline or Moon unreachable: keep serving what is cached.
    })
    .finally(() => {
      syncing = null;
    });
  return syncing;
}

/**
 * A published Moon record: from the cache when Moon has not changed it, otherwise fresh from Moon.
 * Falls back to the cached copy when Moon cannot be reached. Null when Moon has no such published record.
 */
export async function loadRecord(id: string): Promise<{ record: MoonRecord | null; offline: boolean }> {
  // Only a cached copy can be out of date, so only then wait for the change check; otherwise fetch at once.
  if (await readCached(id)) await syncWithMoon();
  else void syncWithMoon();
  const cached = await readCached(id);
  if (cached) return { record: cached.record, offline: false };
  try {
    const record = await getRecord(id);
    if (record) await writeCached({ id, record, fetchedAt: Date.now() });
    return { record, offline: false };
  } catch {
    return { record: null, offline: true };
  }
}

/** Search Moon; when Moon cannot be reached, search the records already cached on this device. */
export async function findRecords(query: string, limit = 20): Promise<{ records: MoonRecord[]; total: number; offline: boolean }> {
  try {
    // Search hits are not cached: they come without the cover link, which only a full record carries.
    const result = await searchRecords(query, limit);
    return { records: result.records, total: result.total, offline: false };
  } catch {
    const needle = query.trim().toLowerCase();
    const hits = (await allCached())
      .map((c) => c.record)
      .filter((r) => !needle || JSON.stringify(r.document).toLowerCase().includes(needle));
    return { records: hits.slice(0, limit), total: hits.length, offline: true };
  }
}
