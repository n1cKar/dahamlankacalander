import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { CalendarGrid } from "@/components/CalendarGrid";
import { EventCard } from "@/components/EventCard";
import { EventModal } from "@/components/EventModal";
import { useEvents, daysUntil, type DLEvent, type EventCategory, categoryMeta } from "@/lib/events-store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/calendar")({
  head: () => ({
    meta: [
      { title: "Calendar — Daham Lanka (PVT) LTD" },
      {
        name: "description",
        content:
          "Interactive calendar of test dates, agent arrivals and important notices from Daham Lanka.",
      },
    ],
  }),
  component: CalendarPage,
});

const FILTERS: { key: "all" | EventCategory; label: string }[] = [
  { key: "all", label: "All" },
  { key: "test", label: "Tests" },
  { key: "agent", label: "Agent arrivals" },
  { key: "notice", label: "Notices" },
];

function CalendarPage() {
  const { events } = useEvents();
  const [selected, setSelected] = useState<DLEvent | null>(null);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | EventCategory>("all");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return events.filter((e) => {
      const matchQ =
        !q ||
        e.title.toLowerCase().includes(q) ||
        e.description.toLowerCase().includes(q);
      const matchF = filter === "all" || e.category === filter;
      return matchQ && matchF;
    });
  }, [events, query, filter]);

  const upcoming = useMemo(
    () =>
      filtered
        .filter((e) => daysUntil(e.date) >= 0)
        .sort((a, b) => a.date.localeCompare(b.date)),
    [filtered],
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
      <div className="mb-8">
        <div className="text-xs font-semibold uppercase tracking-wider text-primary">
          Schedule
        </div>
        <h1 className="mt-2 text-3xl sm:text-4xl font-bold text-foreground">
          Events calendar
        </h1>
        <p className="mt-2 text-muted-foreground">
          Browse all upcoming tests, agent arrivals and important notices.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search events…"
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-card border border-border/60 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>
        <div className="flex items-center gap-1 bg-card border border-border/60 rounded-xl p-1 overflow-x-auto">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={cn(
                "px-3.5 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors",
                filter === f.key
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {(["test", "agent", "notice"] as EventCategory[]).map((k) => {
          const m = categoryMeta[k];
          return (
            <span
              key={k}
              className={cn(
                "inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide px-2.5 py-1 rounded-full border",
                m.chip,
              )}
            >
              <span className={cn("h-1.5 w-1.5 rounded-full", m.dot)} />
              {m.label}
            </span>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-[1fr,340px] gap-6">
        <CalendarGrid events={filtered} onSelectEvent={setSelected} />
        <aside>
          <div className="rounded-2xl bg-card border border-border/60 p-5 shadow-[var(--shadow-soft)]">
            <h3 className="font-semibold text-foreground">Coming up</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              {upcoming.length} event{upcoming.length === 1 ? "" : "s"} ahead
            </p>
            <div className="mt-4 space-y-3 max-h-[520px] overflow-y-auto pr-1">
              {upcoming.length === 0 ? (
                <p className="text-sm text-muted-foreground">No matching events.</p>
              ) : (
                upcoming.map((e) => (
                  <EventCard key={e.id} event={e} onClick={() => setSelected(e)} />
                ))
              )}
            </div>
          </div>
        </aside>
      </div>

      <EventModal event={selected} onClose={() => setSelected(null)} />
    </div>
  );
}