import { useEffect, useMemo, useState } from "react";
import { Bell, X } from "lucide-react";
import { useEvents, daysUntil, categoryMeta, formatDate } from "@/lib/events-store";
import { cn } from "@/lib/utils";

export function NotificationBanner() {
  const { events } = useEvents();
  const [hidden, setHidden] = useState(false);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (typeof Notification === "undefined") return;
    if (Notification.permission === "default") {
      Notification.requestPermission().catch(() => {});
    }
  }, []);

  const upcomingList = useMemo(() => {
    return events
      .map((e) => ({ e, d: daysUntil(e.date) }))
      .filter((x) => x.d >= 0)
      .sort((a, b) => a.d - b.d);
  }, [events]);

  // Rotate the banner through all upcoming events
  useEffect(() => {
    if (upcomingList.length <= 1) return;
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % upcomingList.length);
    }, 6000);
    return () => clearInterval(id);
  }, [upcomingList.length]);

  // Fire browser notifications periodically for upcoming events
  useEffect(() => {
    if (typeof Notification === "undefined") return;
    if (upcomingList.length === 0) return;

    const fire = () => {
      if (Notification.permission !== "granted") return;
      const next = upcomingList[0];
      const when =
        next.d === 0 ? "today" : next.d === 1 ? "tomorrow" : `in ${next.d} days`;
      try {
        new Notification("Daham Lanka — upcoming event", {
          body: `${next.e.title} • ${when} (${formatDate(next.e.date)})`,
          tag: `dl-event-${next.e.id}`,
          icon: "/favicon.png",
        });
      } catch {}
    };

    fire();
    const id = setInterval(fire, 5 * 60 * 1000); // every 5 minutes
    return () => clearInterval(id);
  }, [upcomingList]);

  if (hidden || upcomingList.length === 0) return null;

  const safeIndex = index % upcomingList.length;
  const { e, d } = upcomingList[safeIndex];
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
          onClick={() => setHidden(true)}
          className="ml-auto p-1 rounded hover:bg-muted"
          aria-label="Dismiss"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}