import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { categoryMeta, formatDate, daysUntil, type DLEvent } from "@/lib/events-store";
import { cn } from "@/lib/utils";
import { Calendar, Clock, StickyNote, Bell } from "lucide-react";

interface Props {
  event: DLEvent | null;
  onClose: () => void;
}

export function EventModal({ event, onClose }: Props) {
  const meta = event ? categoryMeta[event.category] : null;
  const d = event ? daysUntil(event.date) : 0;
  const reminder =
    d < 0 ? "Past event" : d === 0 ? "Happening today" : d === 1 ? "Tomorrow" : `In ${d} days`;

  return (
    <Dialog open={!!event} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-lg p-0 overflow-hidden rounded-2xl">
        {event && meta && (
          <>
            <div
              className="h-2 w-full"
              style={{
                background:
                  event.category === "test"
                    ? "var(--event-test)"
                    : event.category === "agent"
                      ? "var(--event-agent)"
                      : "var(--event-notice)",
              }}
            />
            <div className="p-6">
              <DialogHeader>
                <div className="flex items-center gap-2 mb-3">
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
                <DialogTitle className="text-xl text-left">{event.title}</DialogTitle>
              </DialogHeader>

              <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-primary" /> {formatDate(event.date)}
                </span>
                {event.time && (
                  <span className="inline-flex items-center gap-2">
                    <Clock className="h-4 w-4 text-primary" /> {event.time}
                  </span>
                )}
              </div>

              <p className="mt-5 text-sm leading-relaxed text-foreground/80">
                {event.description}
              </p>

              {event.note && (
                <div className="mt-5 rounded-xl border border-secondary/60 bg-secondary/30 p-4">
                  <div className="flex items-center gap-2 text-xs font-semibold text-secondary-foreground mb-1">
                    <StickyNote className="h-3.5 w-3.5" /> Special note
                  </div>
                  <p className="text-sm text-secondary-foreground/90">{event.note}</p>
                </div>
              )}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}