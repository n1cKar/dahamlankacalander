import { useEffect, useState, useCallback } from "react";

export type EventCategory = "test" | "agent" | "notice";

export interface DLEvent {
  id: string;
  title: string;
  titleSi?: string;
  date: string; // ISO yyyy-mm-dd
  time?: string; // HH:mm
  category: EventCategory;
  description: string;       // supports **highlight** and *italic*
  descriptionSi?: string;
  note?: string;
  noteSi?: string;
}

const STORAGE_KEY = "dl_events_v3";
const EVENTS_CHANGED = "dl-events-changed";

const seed: DLEvent[] = [
  {
    id: "seed-marino",
    title: "Marino Beach Hotel Colombo Stay",
    date: "2026-06-05",
    category: "agent",
    description:
      "Rony's New Agent — Agent A arrival.\n*Stay for a week (June 5 – June 11).*\n\nRequirements:\n• 100 shuttering\n• 50 barbender\n• 20 welders\n• 10 finishing carpenters\n• 50 excavator\n• 30 painters\n• 50 tile masons\n• 30 block\n• 20 interlocks\n• 30 gypsum\n• 20 pump truck\n• 20 aluminium\n• 30 electricians\n• 30 plumbers",
    note: "**Need 3 Arabic speaking guys with driving.**",
  },
  {
    id: "seed-agent-a-departure",
    title: "Agent A Departure (Rony's Agent)",
    date: "2026-06-11",
    category: "agent",
    description: "Agent A departs after the Marino Beach Hotel stay.",
  },
  {
    id: "seed-gali-arrival",
    title: "Gali's Arrival",
    date: "2026-06-11",
    category: "agent",
    description: "Gali arrives — agent visit.\n**Bring to office for verbal test with Gali.**",
  },
  {
    id: "seed-gali-test",
    title: "Testing with Gali (verbal only)",
    date: "2026-06-14",
    category: "test",
    description:
      "**Verbal test with Gali — bring candidates to office.**\n\n• 50 excavator / JCB\n• 50 shuttering\n• Mason\n• Gypsum workers\n• Barbenders",
  },
];

function read(): DLEvent[] {
  if (typeof window === "undefined") return seed;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
      return seed;
    }
    return JSON.parse(raw) as DLEvent[];
  } catch {
    return seed;
  }
}

function write(events: DLEvent[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
  window.dispatchEvent(new Event(EVENTS_CHANGED));
}

export function useEvents() {
  const [events, setEvents] = useState<DLEvent[]>([]);

  useEffect(() => {
    setEvents(read());
    const onChange = () => setEvents(read());
    window.addEventListener(EVENTS_CHANGED, onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener(EVENTS_CHANGED, onChange);
      window.removeEventListener("storage", onChange);
    };
  }, []);

  const addEvent = useCallback((e: Omit<DLEvent, "id">) => {
    const all = read();
    const next = [...all, { ...e, id: crypto.randomUUID() }];
    write(next);
  }, []);

  const updateEvent = useCallback((id: string, patch: Partial<DLEvent>) => {
    const all = read();
    write(all.map((ev) => (ev.id === id ? { ...ev, ...patch } : ev)));
  }, []);

  const removeEvent = useCallback((id: string) => {
    const all = read();
    write(all.filter((ev) => ev.id !== id));
  }, []);

  return { events, addEvent, updateEvent, removeEvent };
}

export const categoryMeta: Record<
  EventCategory,
  { label: string; dot: string; chip: string; ring: string }
> = {
  test: {
    label: "Test",
    dot: "bg-event-test",
    chip: "bg-event-test/10 text-event-test border-event-test/30",
    ring: "ring-event-test/40",
  },
  agent: {
    label: "Agent arrival",
    dot: "bg-event-agent",
    chip: "bg-event-agent/10 text-event-agent border-event-agent/30",
    ring: "ring-event-agent/40",
  },
  notice: {
    label: "Notice",
    dot: "bg-event-notice",
    chip: "bg-event-notice/10 text-event-notice border-event-notice/30",
    ring: "ring-event-notice/40",
  },
};

export function daysUntil(dateIso: string): number {
  const d = new Date(dateIso + "T00:00:00");
  const t = new Date();
  t.setHours(0, 0, 0, 0);
  return Math.round((d.getTime() - t.getTime()) / 86400000);
}

export function formatDate(dateIso: string): string {
  return new Date(dateIso + "T00:00:00").toLocaleDateString(undefined, {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}