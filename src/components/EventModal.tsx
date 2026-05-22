import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { categoryMeta, formatDate, daysUntil, type DLEvent } from "@/lib/events-store";
import { cn } from "@/lib/utils";
import { Calendar, Clock, StickyNote, Bell, ListChecks, Share2, CalendarPlus } from "lucide-react";
import { RichText, stripMarkup } from "@/lib/rich-text";

interface Props {
  event: DLEvent | null;
  onClose: () => void;
}

type Section = { heading: string | null; intro: string[]; items: { qty: string | null; label: string; note?: string }[] };

/** Parse free-form description into intro paragraphs + sections with bullet items. */
function parseDescription(desc: string): Section[] {
  const lines = desc.split(/\r?\n/).map((l) => l.trim());
  const sections: Section[] = [];
  let current: Section = { heading: null, intro: [], items: [] };
  sections.push(current);

  for (const line of lines) {
    if (!line) continue;
    // Section heading like "Requirements:" / "Criteria:" / "Demands:"
    if (/^[A-Za-z][A-Za-z &/]+:$/.test(line)) {
      current = { heading: line.replace(/:$/, ""), intro: [], items: [] };
      sections.push(current);
      continue;
    }
    // Bullet item
    if (/^[•\-*]\s+/.test(line)) {
      const body = line.replace(/^[•\-*]\s+/, "");
      // Try to split quantity prefix: e.g. "100 shuttering", "10 JCB / excavators"
      const m = body.match(/^(\d+)\s+(.*)$/);
      let qty: string | null = null;
      let label = body;
      let note: string | undefined;
      if (m) {
        qty = m[1];
        label = m[2];
      }
      // Pull out "(...)" parenthetical as a note
      const noteMatch = label.match(/\s*\(([^)]+)\)\s*$/);
      if (noteMatch) {
        note = noteMatch[1];
        label = label.replace(noteMatch[0], "").trim();
      }
      current.items.push({ qty, label, note });
    } else {
      current.intro.push(line);
    }
  }

  // Drop empty leading section
  return sections.filter((s) => s.heading || s.intro.length || s.items.length);
}

function totalItems(sections: Section[]): number {
  return sections.reduce((acc, s) => acc + s.items.length, 0);
}

export function EventModal({ event, onClose }: Props) {
  const meta = event ? categoryMeta[event.category] : null;
  const d = event ? daysUntil(event.date) : 0;
  const reminder =
    d < 0 ? "Past event" : d === 0 ? "Happening today" : d === 1 ? "Tomorrow" : `In ${d} days`;

  const sections = event ? parseDescription(event.description) : [];
  const itemCount = totalItems(sections);

  const handleShare = async () => {
    if (!event) return;
    const text = `${event.title} — ${formatDate(event.date)}\n\n${stripMarkup(event.description)}${event.note ? `\n\nNote: ${stripMarkup(event.note)}` : ""}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: event.title, text });
      } else {
        await navigator.clipboard.writeText(text);
      }
    } catch {
      /* user cancelled */
    }
  };

  const handleAddToCalendar = () => {
    if (!event) return;
    const dt = event.date.replace(/-/g, "");
    const url = new URL("https://www.google.com/calendar/render");
    url.searchParams.set("action", "TEMPLATE");
    url.searchParams.set("text", event.title);
    url.searchParams.set("dates", `${dt}/${dt}`);
    url.searchParams.set("details", event.description + (event.note ? `\n\nNote: ${event.note}` : ""));
    window.open(url.toString(), "_blank", "noopener");
  };

  return (
    <Dialog open={!!event} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-2xl p-0 overflow-hidden rounded-2xl max-h-[90vh] flex flex-col">
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
            <div className="px-6 pt-6 pb-4 border-b border-border/60">
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
                {event.titleSi && (
                  <p className="mt-1 text-sm text-muted-foreground text-left" lang="si">
                    {event.titleSi}
                  </p>
                )}
              </DialogHeader>

              <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-primary" /> {formatDate(event.date)}
                </span>
                {event.time && (
                  <span className="inline-flex items-center gap-2">
                    <Clock className="h-4 w-4 text-primary" /> {event.time}
                  </span>
                )}
                {itemCount > 0 && (
                  <span className="inline-flex items-center gap-2">
                    <ListChecks className="h-4 w-4 text-primary" /> {itemCount} item{itemCount === 1 ? "" : "s"}
                  </span>
                )}
              </div>
            </div>

            <div className="px-6 py-5 overflow-y-auto flex-1 space-y-5">
              <div className="rounded-xl border border-border/60 bg-muted/20 px-4 py-3">
                <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                  English
                </div>
                <div className="text-sm leading-relaxed text-foreground/85">
                  <RichText text={event.description} />
                </div>
              </div>
              {event.descriptionSi && (
                <div className="rounded-xl border border-primary/30 bg-primary/5 px-4 py-3" lang="si">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-primary mb-1">
                    සිංහල
                  </div>
                  <div className="text-sm leading-relaxed text-foreground/85">
                    <RichText text={event.descriptionSi} />
                  </div>
                </div>
              )}

              {sections.map((s, idx) => (
                <div key={idx}>
                  {s.heading && (
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                      {s.heading}
                    </h4>
                  )}
                  {s.intro.map((p, i) => (
                    <p key={i} className="text-sm leading-relaxed text-foreground/80 mb-2">
                      <RichText text={p} />
                    </p>
                  ))}
                  {s.items.length > 0 && (
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {s.items.map((it, i) => (
                        <li
                          key={i}
                          className="flex items-center gap-3 rounded-xl border border-border/60 bg-muted/30 px-3 py-2"
                        >
                          {it.qty ? (
                            <span
                              className={cn(
                                "shrink-0 inline-flex items-center justify-center min-w-[2.5rem] h-9 px-2 rounded-lg font-bold text-sm border",
                                meta.chip,
                              )}
                            >
                              {it.qty}
                            </span>
                          ) : (
                            <span className={cn("shrink-0 h-2 w-2 rounded-full", meta.dot)} />
                          )}
                          <div className="min-w-0">
                            <div className="text-sm font-medium text-foreground capitalize truncate">
                              <RichText text={it.label} />
                            </div>
                            {it.note && (
                              <div className="text-[11px] text-muted-foreground truncate">
                                {it.note}
                              </div>
                            )}
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}

              {event.note && (
                <div className="rounded-xl border border-secondary/60 bg-secondary/30 p-4">
                  <div className="flex items-center gap-2 text-xs font-semibold text-secondary-foreground mb-1">
                    <StickyNote className="h-3.5 w-3.5" /> Special note
                  </div>
                  <p className="text-sm text-secondary-foreground/90">
                    <RichText text={event.note} />
                  </p>
                  {event.noteSi && (
                    <p className="mt-2 text-sm text-secondary-foreground/80 pt-2 border-t border-secondary-foreground/20" lang="si">
                      <RichText text={event.noteSi} />
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="px-6 py-3 border-t border-border/60 bg-muted/20 flex flex-wrap gap-2 justify-end">
              <button
                onClick={handleShare}
                className="inline-flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-lg border border-border/60 hover:bg-muted transition-colors"
              >
                <Share2 className="h-3.5 w-3.5" /> Share
              </button>
              <button
                onClick={handleAddToCalendar}
                className="inline-flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
              >
                <CalendarPlus className="h-3.5 w-3.5" /> Add to calendar
              </button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}