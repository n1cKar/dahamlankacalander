import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { categoryMeta, type DLEvent } from "@/lib/events-store";
import { cn } from "@/lib/utils";

interface Props {
  events: DLEvent[];
  onSelectEvent: (e: DLEvent) => void;
}

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function CalendarGrid({ events, onSelectEvent }: Props) {
  const today = new Date();
  const [cursor, setCursor] = useState(new Date(today.getFullYear(), today.getMonth(), 1));

  const { cells, monthLabel } = useMemo(() => {
    const year = cursor.getFullYear();
    const month = cursor.getMonth();
    const first = new Date(year, month, 1);
    const startWeekday = first.getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const cells: { date: Date | null; iso: string | null }[] = [];
    for (let i = 0; i < startWeekday; i++) cells.push({ date: null, iso: null });
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(year, month, d);
      cells.push({ date, iso: date.toISOString().slice(0, 10) });
    }
    while (cells.length % 7 !== 0) cells.push({ date: null, iso: null });

    return {
      cells,
      monthLabel: first.toLocaleDateString(undefined, { month: "long", year: "numeric" }),
    };
  }, [cursor]);

  const byDate = useMemo(() => {
    const m = new Map<string, DLEvent[]>();
    for (const e of events) {
      const arr = m.get(e.date) ?? [];
      arr.push(e);
      m.set(e.date, arr);
    }
    return m;
  }, [events]);

  const todayIso = today.toISOString().slice(0, 10);

  return (
    <div className="rounded-2xl bg-card border border-border/60 shadow-[var(--shadow-soft)] overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-border/60">
        <div>
          <h2 className="text-lg font-semibold text-foreground">{monthLabel}</h2>
          <p className="text-xs text-muted-foreground">Click any event for details</p>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() =>
              setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))
            }
            className="p-2 rounded-lg hover:bg-muted transition-colors"
            aria-label="Previous month"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => setCursor(new Date(today.getFullYear(), today.getMonth(), 1))}
            className="px-3 py-1.5 text-sm rounded-lg hover:bg-muted transition-colors"
          >
            Today
          </button>
          <button
            onClick={() =>
              setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))
            }
            className="p-2 rounded-lg hover:bg-muted transition-colors"
            aria-label="Next month"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 border-b border-border/60 bg-muted/30">
        {DAYS.map((d) => (
          <div
            key={d}
            className="px-2 py-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground text-center"
          >
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7">
        {cells.map((c, i) => {
          const isToday = c.iso === todayIso;
          const dayEvents = c.iso ? byDate.get(c.iso) ?? [] : [];
          const hasEvents = dayEvents.length > 0;
          return (
            <div
              key={i}
              className={cn(
                "min-h-[92px] sm:min-h-[110px] border-b border-r border-border/60 p-1.5 sm:p-2 relative",
                !c.date && "bg-muted/20",
                hasEvents && "cursor-pointer hover:bg-muted/40 transition-colors",
                (i + 1) % 7 === 0 && "border-r-0",
              )}
              onClick={() => hasEvents && onSelectEvent(dayEvents[0])}
              role={hasEvents ? "button" : undefined}
            >
              {c.date && (
                <>
                  <div
                    className={cn(
                      "inline-flex items-center justify-center h-6 w-6 text-xs font-medium rounded-full",
                      isToday
                        ? "bg-primary text-primary-foreground"
                        : "text-foreground/70",
                    )}
                  >
                    {c.date.getDate()}
                  </div>
                  <div className="mt-1 space-y-1">
                    {dayEvents.slice(0, 2).map((e) => {
                      const m = categoryMeta[e.category];
                      return (
                        <button
                          key={e.id}
                          onClick={(ev) => {
                            ev.stopPropagation();
                            onSelectEvent(e);
                          }}
                          className={cn(
                            "w-full text-left text-[11px] leading-tight px-1.5 py-1 rounded-md border truncate",
                            "hover:translate-x-0.5 transition-transform",
                            m.chip,
                          )}
                        >
                          <span className="font-medium">{e.title}</span>
                        </button>
                      );
                    })}
                    {dayEvents.length > 2 && (
                      <button
                        onClick={(ev) => {
                          ev.stopPropagation();
                          onSelectEvent(dayEvents[2]);
                        }}
                        className="text-[10px] text-muted-foreground hover:text-primary px-1.5"
                      >
                        +{dayEvents.length - 2} more
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}