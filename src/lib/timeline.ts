import type { Document } from '../types';

export interface TimelineEntry {
  id: string;
  date: string;
  title: string;
  type: string;
  characters?: string[];
}

export interface TimelineYear {
  year: number;
  months: TimelineMonth[];
}

export interface TimelineMonth {
  year: number;
  month: number;
  entries: TimelineEntry[];
}

export function buildTimeline(documents: Document[]): TimelineYear[] {
  const entries: TimelineEntry[] = [];

  for (const doc of documents) {
    if (doc.metadata.date) {
      entries.push({
        id: doc.id,
        date: doc.metadata.date,
        title: doc.metadata.title,
        type: doc.metadata.type,
        characters: doc.characters,
      });
    }
  }

  entries.sort((a, b) => a.date.localeCompare(b.date));

  const yearMap = new Map<number, Map<number, TimelineEntry[]>>();

  for (const entry of entries) {
    const date = new Date(entry.date);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;

    if (!yearMap.has(year)) yearMap.set(year, new Map());
    const monthMap = yearMap.get(year)!;
    if (!monthMap.has(month)) monthMap.set(month, []);
    monthMap.get(month)!.push(entry);
  }

  const years: TimelineYear[] = [];
  for (const [year, monthMap] of [...yearMap].sort((a, b) => a[0] - b[0])) {
    const months: TimelineMonth[] = [];
    for (const [month, monthEntries] of [...monthMap].sort((a, b) => a[0] - b[0])) {
      months.push({ year, month, entries: monthEntries });
    }
    years.push({ year, months });
  }

  return years;
}

export function filterTimelineByCharacter(
  timeline: TimelineYear[],
  characterId: string
): TimelineYear[] {
  return timeline
    .map((year) => ({
      ...year,
      months: year.months
        .map((month) => ({
          ...month,
          entries: month.entries.filter(
            (e) => e.characters?.includes(characterId)
          ),
        }))
        .filter((m) => m.entries.length > 0),
    }))
    .filter((y) => y.months.length > 0);
}

export function filterTimelineByType(
  timeline: TimelineYear[],
  type: string
): TimelineYear[] {
  return timeline
    .map((year) => ({
      ...year,
      months: year.months
        .map((month) => ({
          ...month,
          entries: month.entries.filter((e) => e.type === type),
        }))
        .filter((m) => m.entries.length > 0),
    }))
    .filter((y) => y.months.length > 0);
}