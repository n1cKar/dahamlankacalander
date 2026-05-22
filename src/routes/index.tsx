import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  ArrowRight,
  CalendarDays,
  GraduationCap,
  Globe2,
  ShieldCheck,
  Sparkles,
  Users,
  Phone,
  Mail,
  MapPin,
} from "lucide-react";
import logo from "@/assets/logo.png";
import { EventCard } from "@/components/EventCard";
import { EventModal } from "@/components/EventModal";
import { NoticeBoard } from "@/components/NoticeBoard";
import { useEvents, daysUntil, type DLEvent } from "@/lib/events-store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Daham Lanka (PVT) LTD — Foreign Employment Agency" },
      {
        name: "description",
        content:
          "Licensed foreign employment agency in Sri Lanka. View upcoming tests, agent arrivals, and announcements.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  const { events } = useEvents();
  const [selected, setSelected] = useState<DLEvent | null>(null);

  const upcoming = useMemo(
    () =>
      events
        .filter((e) => daysUntil(e.date) >= 0)
        .sort((a, b) => a.date.localeCompare(b.date))
        .slice(0, 6),
    [events],
  );

  const stats = [
    { value: events.filter((e) => e.category === "test").length, label: "Upcoming tests" },
    { value: events.filter((e) => e.category === "agent").length, label: "Agent arrivals" },
    { value: events.filter((e) => e.category === "notice").length, label: "Active notices" },
  ];

  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0 -z-10"
          style={{ background: "var(--gradient-hero)" }}
        />
        <div className="absolute inset-0 -z-10 opacity-30 [background-image:radial-gradient(circle_at_30%_20%,white_0,transparent_40%),radial-gradient(circle_at_80%_60%,var(--brand-yellow)_0,transparent_35%)]" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-24 sm:pt-24 sm:pb-32">
          <div className="grid lg:grid-cols-[1.1fr,0.9fr] gap-12 items-center">
            <div className="text-primary-foreground">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-medium">
                <Sparkles className="h-3.5 w-3.5 text-secondary" />
                Trusted Foreign Employment Agency
              </div>
              <h1 className="mt-5 text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.05]">
                Building global careers for{" "}
                <span className="bg-gradient-to-r from-secondary to-white bg-clip-text text-transparent">
                  Sri Lankans
                </span>
              </h1>
              <p className="mt-5 text-base sm:text-lg text-white/80 max-w-xl">
                Daham Lanka (PVT) LTD connects skilled workers with trusted overseas
                employers. Stay updated with test dates, agent arrivals and important
                notices — all in one place.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  to="/calendar"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-secondary text-secondary-foreground font-semibold shadow-[var(--shadow-glow)] hover:translate-y-[-1px] transition-transform"
                >
                  <CalendarDays className="h-4 w-4" />
                  View calendar
                </Link>
                <a
                  href="#upcoming"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-white/10 backdrop-blur-md text-white border border-white/20 font-medium hover:bg-white/20 transition-colors"
                >
                  Upcoming events <ArrowRight className="h-4 w-4" />
                </a>
              </div>

              <div className="mt-10 grid grid-cols-3 gap-4 max-w-md">
                {stats.map((s) => (
                  <div
                    key={s.label}
                    className="rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 px-4 py-3"
                  >
                    <div className="text-2xl font-bold text-white">{s.value}</div>
                    <div className="text-[11px] text-white/70 mt-0.5">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="absolute -inset-6 bg-white/10 rounded-[2.5rem] blur-2xl" />
              <div className="relative rounded-[2rem] bg-white/95 backdrop-blur-xl border border-white/40 p-8 shadow-[var(--shadow-elegant)]">
                <div className="flex items-center gap-4">
                  <img src={logo} alt="Daham Lanka" className="h-14 w-auto" />
                  <div>
                    <div className="text-base font-bold text-brand-navy">
                      DAHAM LANKA (PVT) LTD
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Foreign Employment Agency
                    </div>
                  </div>
                </div>
                <div className="mt-6 space-y-3">
                  {upcoming.slice(0, 3).map((e) => (
                    <button
                      key={e.id}
                      onClick={() => setSelected(e)}
                      className="w-full text-left flex items-center gap-3 p-3 rounded-xl hover:bg-muted transition-colors border border-border/40"
                    >
                      <div
                        className="h-10 w-10 rounded-lg flex flex-col items-center justify-center text-[10px] font-semibold text-white"
                        style={{
                          background:
                            e.category === "test"
                              ? "var(--event-test)"
                              : e.category === "agent"
                                ? "var(--event-agent)"
                                : "var(--event-notice)",
                        }}
                      >
                        <span className="leading-none">
                          {new Date(e.date + "T00:00:00").toLocaleDateString(undefined, {
                            month: "short",
                          })}
                        </span>
                        <span className="text-base leading-tight font-bold">
                          {new Date(e.date + "T00:00:00").getDate()}
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-semibold text-foreground truncate">
                          {e.title}
                        </div>
                        <div className="text-xs text-muted-foreground truncate">
                          {e.description}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* NOTICE BOARD */}
      <NoticeBoard />

      {/* UPCOMING */}
      <section id="upcoming" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="flex items-end justify-between gap-4 mb-8">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-primary">
              Schedule
            </div>
            <h2 className="mt-2 text-3xl sm:text-4xl font-bold text-foreground">
              Upcoming events
            </h2>
            <p className="mt-2 text-muted-foreground max-w-xl">
              Tests, agent arrivals and important notices for our applicants.
            </p>
          </div>
          <Link
            to="/calendar"
            className="hidden sm:inline-flex items-center gap-1 text-sm font-semibold text-primary hover:gap-2 transition-all"
          >
            Open calendar <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {upcoming.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-12 text-center text-muted-foreground">
            No upcoming events. Check back soon.
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {upcoming.map((e) => (
              <EventCard key={e.id} event={e} onClick={() => setSelected(e)} />
            ))}
          </div>
        )}
      </section>

      {/* SERVICES */}
      <section className="bg-muted/40 border-y border-border/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center max-w-2xl mx-auto">
            <div className="text-xs font-semibold uppercase tracking-wider text-primary">
              What we do
            </div>
            <h2 className="mt-2 text-3xl sm:text-4xl font-bold text-foreground">
              Services for every step of your journey
            </h2>
          </div>
          <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                icon: GraduationCap,
                title: "Language & trade tests",
                desc: "Coordination for EPS-TOPIK Korean, Japanese language, and trade skill tests.",
              },
              {
                icon: Globe2,
                title: "Overseas placements",
                desc: "Vacancies in Korea, Japan, Romania, Poland and the Middle East through licensed partners.",
              },
              {
                icon: Users,
                title: "Agent & employer visits",
                desc: "On-site interviews and document verification with visiting recruiters.",
              },
              {
                icon: ShieldCheck,
                title: "Documentation support",
                desc: "Passport, medical, attestation and pre-departure guidance handled end-to-end.",
              },
              {
                icon: CalendarDays,
                title: "Schedule notifications",
                desc: "Browser reminders so you never miss a test date or agent arrival.",
              },
              {
                icon: Sparkles,
                title: "Post-departure care",
                desc: "Continuous support for our workers and their families back home.",
              },
            ].map((s) => (
              <div
                key={s.title}
                className="group rounded-2xl bg-card border border-border/60 p-6 hover:shadow-[var(--shadow-elegant)] hover:-translate-y-0.5 transition-all duration-300"
              >
                <div className="h-11 w-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <s.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 font-semibold text-foreground">{s.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ABOUT */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 grid lg:grid-cols-2 gap-12 items-center">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-primary">
            About us
          </div>
          <h2 className="mt-2 text-3xl sm:text-4xl font-bold text-foreground">
            A trusted partner since day one
          </h2>
          <p className="mt-4 text-muted-foreground">
            Daham Lanka (PVT) LTD is a licensed Sri Lankan foreign employment agency.
            We work with vetted international partners to place candidates in
            stable, well-paying roles abroad — and we stand by our workers long
            after they arrive.
          </p>
          <ul className="mt-6 space-y-3 text-sm">
            {[
              "Licensed by the Sri Lanka Bureau of Foreign Employment",
              "Transparent fees and step-by-step process",
              "Dedicated case officers for every applicant",
              "Active partnerships across Asia and Europe",
            ].map((p) => (
              <li key={p} className="flex items-start gap-3 text-foreground/80">
                <ShieldCheck className="h-5 w-5 text-primary mt-0.5" />
                {p}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-3xl p-8 sm:p-10 text-primary-foreground shadow-[var(--shadow-elegant)]"
             style={{ background: "var(--gradient-brand)" }}>
          <h3 className="text-2xl font-bold">Get in touch</h3>
          <p className="mt-1 text-white/85 text-sm">
            Have a question about a test date or vacancy? We're here.
          </p>
          <div className="mt-6 space-y-3 text-sm">
            <div className="flex items-center gap-3"><Phone className="h-4 w-4" /><span>+94 71 577 0939</span></div>
            <div className="flex items-center gap-3"><Mail className="h-4 w-4" /><span>dahamlankacom@yahoo.com</span></div>
            <div className="flex items-center gap-3"><MapPin className="h-4 w-4" /><span>Kaluwala Road, Kossinna, Ganemulla, Sri Lanka</span></div>
          </div>
          <Link
            to="/calendar"
            className="mt-8 inline-flex items-center gap-2 px-5 py-3 rounded-full bg-white text-primary font-semibold hover:bg-secondary hover:text-secondary-foreground transition-colors"
          >
            See all upcoming events <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <EventModal event={selected} onClose={() => setSelected(null)} />
    </>
  );
}
