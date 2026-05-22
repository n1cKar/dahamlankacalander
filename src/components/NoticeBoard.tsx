import { Pin, Megaphone } from "lucide-react";
import { useNotices } from "@/lib/notices-store";
import { RichText } from "@/lib/rich-text";

export function NoticeBoard() {
  const { notices } = useNotices();
  if (notices.length === 0) return null;

  // Pinned first, then by createdAt desc
  const sorted = [...notices].sort((a, b) => {
    if (!!b.pinned !== !!a.pinned) return b.pinned ? 1 : -1;
    return b.createdAt.localeCompare(a.createdAt);
  });

  return (
    <section id="notices" className="bg-secondary/30 border-y border-secondary/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-10 w-10 rounded-xl bg-secondary text-secondary-foreground flex items-center justify-center shadow-sm">
            <Megaphone className="h-5 w-5" />
          </div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-primary">
              Notice Board · දැන්වීම් පුවරුව
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
              Important notices
            </h2>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {sorted.map((n) => (
            <article
              key={n.id}
              className="relative rounded-2xl bg-card border border-border/60 p-5 shadow-[var(--shadow-soft)]"
            >
              {n.pinned && (
                <div className="absolute -top-2 -right-2 bg-secondary text-secondary-foreground rounded-full p-1.5 shadow">
                  <Pin className="h-3.5 w-3.5" />
                </div>
              )}
              <h3 className="font-bold text-foreground text-base leading-snug">
                {n.title}
              </h3>
              {n.titleSi && (
                <p className="text-xs text-muted-foreground mt-1" lang="si">
                  {n.titleSi}
                </p>
              )}
              <div className="mt-3 text-sm leading-relaxed text-foreground/85">
                <RichText text={n.body} />
              </div>
              {n.bodySi && (
                <div
                  className="mt-3 pt-3 border-t border-border/60 text-sm leading-relaxed text-foreground/80"
                  lang="si"
                >
                  <RichText text={n.bodySi} />
                </div>
              )}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}