import { useEffect, useMemo, useState } from "react";
import { Bell, X } from "lucide-react";
import { useEvents, daysUntil, categoryMeta } from "@/lib/events-store";
import { cn } from "@/lib/utils";

export function NotificationBanner() {
  const { events } = useEvents();
  const [dismissed, setDismissed] = useState<string | null>(null);

  useEffect(() => {
    if (typeof Notification === "undefined") return;
    if (Notification.permission === "default") {
      // Ask quietly once per session
      const asked = sessionStorage.getItem("dl_notif_asked");
      if (!asked) {
        sessionStorage.setItem("dl_notif_asked", "1");
        Notification.requestPermission().catch(() => {});
      }
    }
  }, []);

  const upcoming = useMemo(() => {
    return events
      .map((e) => ({ e, d: daysUntil(e.date) }))
      .filter((x) => x.d >= 0 && x.d <= 2)
      .sort((a, b) => a.d - b.d)[0];
  }, [events]);

  if (!upcoming || dismissed === upcoming.e.id) return null;

  const { e, d } = upcoming;
  const meta = categoryMeta[e.category];
  const when = d === 0 ? "today" : d === 1 ? "tomorrow" : `in ${d} days`;

  return (
    <div
      className={cn(
        "relative overflow-hidden border-b border-border/60",
        "bg-gradient-to-r from-primary/5 via-secondary/20 to-primary/5",
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex items-center gap-3">
        <span className={cn("h-2 w-2 rounded-full animate-pulse", meta.dot)} />
        <Bell className="h-4 w-4 text-primary shrink-0" />
        <p className="text-sm text-foreground/90 truncate">
          <span className="font-semibold">{meta.label}:</span>{" "}
          <span className="text-foreground">{e.title}</span>{" "}
          <span className="text-muted-foreground">— starts {when}</span>
        </p>
        <button
          onClick={() => setDismissed(e.id)}
          className="ml-auto p-1 rounded hover:bg-muted"
          aria-label="Dismiss"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}