import { useCallback, useEffect, useState } from "react";

export interface DLFlight {
  id: string;
  passengerName: string;
  passportNo?: string;
  destination: string;        // e.g. "Doha, Qatar"
  airline: string;
  flightNo: string;
  departureDate: string;      // ISO yyyy-mm-dd
  departureTime?: string;     // HH:mm
  departureAirport?: string;  // e.g. "Colombo (CMB)"
  arrivalDate?: string;
  arrivalTime?: string;
  arrivalAirport?: string;    // e.g. "Doha (DOH)"
  agentName?: string;
  agentPhone?: string;
  notes?: string;             // supports **highlight**
}

const STORAGE_KEY = "dl_flights_v1";
const CHANGED = "dl-flights-changed";

function read(): DLFlight[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as DLFlight[]) : [];
  } catch {
    return [];
  }
}

function write(items: DLFlight[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event(CHANGED));
}

export function useFlights() {
  const [flights, setFlights] = useState<DLFlight[]>([]);
  useEffect(() => {
    setFlights(read());
    const onChange = () => setFlights(read());
    window.addEventListener(CHANGED, onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener(CHANGED, onChange);
      window.removeEventListener("storage", onChange);
    };
  }, []);

  const addFlight = useCallback((f: Omit<DLFlight, "id">) => {
    const all = read();
    const item = { ...f, id: crypto.randomUUID() };
    write([item, ...all]);
    return item;
  }, []);

  const updateFlight = useCallback(
    (id: string, patch: Partial<DLFlight>) => {
      const all = read();
      write(all.map((f) => (f.id === id ? { ...f, ...patch } : f)));
    },
    [],
  );

  const removeFlight = useCallback((id: string) => {
    const all = read();
    write(all.filter((f) => f.id !== id));
  }, []);

  return { flights, addFlight, updateFlight, removeFlight };
}

/* ---------- URL-encoded share token ---------- */
// We pack flight data into the URL itself so agents abroad can open the link
// without needing access to our database.

function utf8ToBase64Url(str: string): string {
  if (typeof window === "undefined") {
    return Buffer.from(str, "utf-8").toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  }
  const b64 = btoa(unescape(encodeURIComponent(str)));
  return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64UrlToUtf8(b64url: string): string {
  const pad = b64url.length % 4 === 0 ? "" : "=".repeat(4 - (b64url.length % 4));
  const b64 = b64url.replace(/-/g, "+").replace(/_/g, "/") + pad;
  if (typeof window === "undefined") {
    return Buffer.from(b64, "base64").toString("utf-8");
  }
  return decodeURIComponent(escape(atob(b64)));
}

export function encodeFlightToken(f: DLFlight): string {
  // Drop empty fields to keep URL short
  const compact: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(f)) {
    if (v !== undefined && v !== null && v !== "") compact[k] = v;
  }
  return utf8ToBase64Url(JSON.stringify(compact));
}

export function decodeFlightToken(token: string): DLFlight | null {
  try {
    const json = base64UrlToUtf8(token);
    return JSON.parse(json) as DLFlight;
  } catch {
    return null;
  }
}

export function flightShareUrl(f: DLFlight, origin?: string): string {
  const base =
    origin ??
    (typeof window !== "undefined" ? window.location.origin : "");
  return `${base}/flight/${encodeFlightToken(f)}`;
}