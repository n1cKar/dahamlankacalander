import { Calendar, Clock, Bell } from "lucide-react";
import { categoryMeta, daysUntil, formatDate, type DLEvent } from "@/lib/events-store";
import { cn } from "@/lib/utils";
import { RichText, stripMarkup } from "@/lib/rich-text";

interface Props {
  event: DLEvent;
  onClick?: () => void;
}

export function EventCard({ event, onClick }: Props) {
  const meta = categoryMeta[event.category];
  const d = daysUntil(event.date);
  const reminder =
    d < 0
      ? "Past"
      : d === 0
        ? "Today"
        : d === 1
          ? "Tomorrow"
          : `In ${d} days`;

  return (
    <button
      onClick={onClick}
      className={cn(
        "group text-left w-full rounded-2xl bg-card border border-border/60 p-5",
        "shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-elegant)] hover:-translate-y-0.5",
        "transition-all duration-300",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <span
          className={cn(
            "inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide px-2.5 py-1 rounded-full border",
            meta.chip,
          )}
        >
          <span className={cn("h-1.5 w-1.5 rounded-full", meta.dot)} />
          {meta.label}
        </span>
        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground">
          <Bell className="h-3 w-3" /> {reminder}
        </span>
      </div>
      <h3 className="mt-3 font-semibold text-foreground group-hover:text-primary transition-colors">
        {event.title}
      </h3>
      {event.titleSi && (
        <p className="text-xs text-muted-foreground mt-0.5" lang="si">
          {event.titleSi}
        </p>
      )}
      <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
        <RichText text={stripMarkup(event.description).slice(0, 160)} />
      </p>
      <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <Calendar className="h-3.5 w-3.5" /> {formatDate(event.date)}
        </span>
        {event.time && (
          <span className="inline-flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" /> {event.time}
          </span>
        )}
      </div>
    </button>
  );
}