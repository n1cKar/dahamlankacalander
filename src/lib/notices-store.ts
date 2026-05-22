import { useCallback, useEffect, useState } from "react";

export interface DLNotice {
  id: string;
  title: string;
  titleSi?: string;
  body: string;      // English, supports **highlight**
  bodySi?: string;   // Sinhala
  pinned?: boolean;
  createdAt: string; // ISO
}

const STORAGE_KEY = "dl_notices_v1";
const CHANGED = "dl-notices-changed";

const seed: DLNotice[] = [
  {
    id: "seed-pcc-1",
    title: "Police Clearance (PCC) — apply before test date",
    titleSi: "පොලිස් සහතිකය (PCC) — පරීක්ෂණ දිනට පෙර අයදුම් කරන්න",
    body:
      "At least apply for the **PCC one day before test date** from Police Headquarters.",
    bodySi:
      "අවම වශයෙන් පරීක්ෂණ දිනට **එක් දිනකට පෙර** පොලිස් මූලස්ථානයෙන් PCC සඳහා අයදුම් කරන්න.",
    pinned: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "seed-pcc-2",
    title: "Bring applied proof to the test",
    titleSi: "අයදුම් කළ සාක්ෂිය පරීක්ෂණයට ගෙන එන්න",
    body: "**Bring the applied proof** on the test date.",
    bodySi: "පරීක්ෂණ දිනයේ දී **අයදුම් කළ සාක්ෂිය ගෙන එන්න**.",
    pinned: true,
    createdAt: new Date().toISOString(),
  },
];

function read(): DLNotice[] {
  if (typeof window === "undefined") return seed;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
      return seed;
    }
    return JSON.parse(raw) as DLNotice[];
  } catch {
    return seed;
  }
}

function write(items: DLNotice[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event(CHANGED));
}

export function useNotices() {
  const [notices, setNotices] = useState<DLNotice[]>([]);
  useEffect(() => {
    setNotices(read());
    const onChange = () => setNotices(read());
    window.addEventListener(CHANGED, onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener(CHANGED, onChange);
      window.removeEventListener("storage", onChange);
    };
  }, []);

  const addNotice = useCallback((n: Omit<DLNotice, "id" | "createdAt">) => {
    const all = read();
    write([
      { ...n, id: crypto.randomUUID(), createdAt: new Date().toISOString() },
      ...all,
    ]);
  }, []);

  const updateNotice = useCallback(
    (id: string, patch: Partial<DLNotice>) => {
      const all = read();
      write(all.map((n) => (n.id === id ? { ...n, ...patch } : n)));
    },
    [],
  );

  const removeNotice = useCallback((id: string) => {
    const all = read();
    write(all.filter((n) => n.id !== id));
  }, []);

  return { notices, addNotice, updateNotice, removeNotice };
}