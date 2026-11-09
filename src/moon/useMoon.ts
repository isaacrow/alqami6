import { useEffect, useState } from 'react';
import { MoonRecord } from './moonApi';
import { findRecords, loadRecord } from './moonCache';
import { MoonCardData, readRecord, UiLang } from './readRecord';

export type MoonLoad<T> =
  | { state: 'loading' }
  | { state: 'ready'; data: T; offline: boolean }
  | { state: 'missing' }
  | { state: 'offline' };

/** A Moon record read for the card, in the reader's language. Null id = nothing to load. */
export function useMoonRecord(id: string | null | undefined, lang: UiLang): MoonLoad<MoonCardData> | null {
  const [record, setRecord] = useState<{ id: string; load: MoonLoad<MoonRecord> } | null>(null);

  useEffect(() => {
    if (!id) return;
    let live = true;
    setRecord({ id, load: { state: 'loading' } });
    loadRecord(id).then(({ record: r, offline }) => {
      if (!live) return;
      setRecord({ id, load: r ? { state: 'ready', data: r, offline } : offline ? { state: 'offline' } : { state: 'missing' } });
    });
    return () => {
      live = false;
    };
  }, [id]);

  if (!id || !record || record.id !== id) return id ? { state: 'loading' } : null;
  const load = record.load;
  return load.state === 'ready' ? { state: 'ready', data: readRecord(load.data, lang), offline: load.offline } : load;
}

/** Moon search for a query, waiting until typing pauses. An empty query lists Moon's newest records. */
export function useMoonSearch(query: string, lang: UiLang, limit = 12): MoonLoad<{ cards: MoonCardData[]; total: number }> {
  const [result, setResult] = useState<MoonLoad<{ records: MoonRecord[]; total: number }>>({ state: 'loading' });

  useEffect(() => {
    let live = true;
    setResult({ state: 'loading' });
    const timer = window.setTimeout(() => {
      findRecords(query, limit).then(({ records, total, offline }) => {
        if (live) setResult(offline && !records.length ? { state: 'offline' } : { state: 'ready', data: { records, total }, offline });
      });
    }, query ? 350 : 0);
    return () => {
      live = false;
      window.clearTimeout(timer);
    };
  }, [query, limit]);

  if (result.state !== 'ready') return result;
  return {
    state: 'ready',
    offline: result.offline,
    data: { cards: result.data.records.map((r) => readRecord(r, lang)), total: result.data.total },
  };
}
