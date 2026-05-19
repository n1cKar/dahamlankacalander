import { useEffect, useState, useCallback } from "react";

export type EventCategory = "test" | "agent" | "notice";

export interface DLEvent {
  id: string;
  title: string;
  date: string; // ISO yyyy-mm-dd
  time?: string; // HH:mm
  category: EventCategory;
  description: string;
  note?: string;
}

const STORAGE_KEY = "dl_events_v1";
const EVENTS_CHANGED = "dl-events-changed";

const today = new Date();
const offset = (days: number) => {
  const d = new Date(today);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
};

const seed: DLEvent[] = [
  {
    id: "seed-1",
    title: "Korean Language Test (EPS-TOPIK)",
    date: offset(3),
    time: "09:00",
    category: "test",
    description:
      "Reading and listening test for candidates applying to the EPS Korean employment programme. Bring NIC and admission letter.",
    note: "Report by 8:00 AM. Mobile phones not allowed.",
  },
  {
    id: "seed-2",
    title: "Japanese Agent Visit — Tokyo Partner",
    date: offset(7),
    time: "10:30",
    category: "agent",
    description:
      "Visiting agent from our Tokyo partner for interviews and document verification for the caregiver and manufacturing programmes.",
    note: "Bring CV, passport copy and qualification certificates.",
  },
  {
    id: "seed-3",
    title: "Holiday Notice — Office Closed",
    date: offset(12),
    category: "notice",
    description:
      "Office will be closed for the public holiday. Online inquiries will be responded to the next working day.",
  },
  {
    id: "seed-4",
    title: "Romania Welder Trade Test",
    date: offset(18),
    time: "08:30",
    category: "test",
    description:
      "Practical welding trade test for the Romania manufacturing recruitment batch.",
    note: "PPE will be provided at venue.",
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