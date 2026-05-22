import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import { useServerFn } from "@tanstack/react-start";
import {
  CalendarDays,
  Edit3,
  LogOut,
  Plus,
  ShieldCheck,
  Trash2,
  Eye,
  Megaphone,
  Plane,
  Languages,
  Loader2,
  Pin,
  Copy,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth, login, logout, ADMIN_USER, ADMIN_PASS } from "@/lib/auth";
import {
  useEvents,
  categoryMeta,
  formatDate,
  type DLEvent,
  type EventCategory,
} from "@/lib/events-store";
import { useNotices, type DLNotice } from "@/lib/notices-store";
import {
  useFlights,
  flightShareUrl,
  type DLFlight,
} from "@/lib/flights-store";
import { EventModal } from "@/components/EventModal";
import { translateToSinhala } from "@/lib/translate.functions";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin — Daham Lanka (PVT) LTD" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: AdminPage,
});

function AdminPage() {
  const { authed, hydrated } = useAuth();
  if (!hydrated) return null;
  return authed ? <Dashboard /> : <LoginForm />;
}

function LoginForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (login(username, password)) toast.success("Welcome back, admin");
    else setError("Invalid username or password");
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="rounded-3xl bg-card border border-border/60 shadow-[var(--shadow-elegant)] p-8">
          <div className="h-12 w-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-4">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Admin sign in</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage events, notices, and flight details.
          </p>
          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <LabeledInput label="Username" value={username} onChange={setUsername} autoComplete="username" />
            <LabeledInput label="Password" value={password} onChange={setPassword} type="password" autoComplete="current-password" />
            {error && <p className="text-sm text-event-notice font-medium">{error}</p>}
            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors"
            >
              Sign in
            </button>
          </form>
          {/* <div className="mt-6 rounded-xl bg-muted/60 border border-border/60 p-3 text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">Demo credentials:</span>{" "}
            <code className="text-foreground">{ADMIN_USER}</code> /{" "}
            <code className="text-foreground">{ADMIN_PASS}</code>
          </div> */}
        </div>
      </div>
    </div>
  );
}

/* ===================================================================== */
/*                              DASHBOARD                                */
/* ===================================================================== */

type Tab = "events" | "notices" | "flights";

function Dashboard() {
  const [tab, setTab] = useState<Tab>("events");

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
      <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-primary">Admin</div>
          <h1 className="mt-2 text-3xl sm:text-4xl font-bold text-foreground">Dashboard</h1>
          <p className="mt-2 text-muted-foreground">
            Add or edit information shown on the public website.
          </p>
        </div>
        <button
          onClick={() => { logout(); toast.message("Signed out"); }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-border bg-card hover:bg-muted text-sm font-medium"
        >
          <LogOut className="h-4 w-4" /> Sign out
        </button>
      </div>

      {/* Tabs */}
      <div className="inline-flex rounded-2xl bg-muted/60 border border-border/60 p-1 mb-6">
        <TabBtn active={tab === "events"} onClick={() => setTab("events")} icon={<CalendarDays className="h-4 w-4" />}>
          Events
        </TabBtn>
        <TabBtn active={tab === "notices"} onClick={() => setTab("notices")} icon={<Megaphone className="h-4 w-4" />}>
          Notices
        </TabBtn>
        <TabBtn active={tab === "flights"} onClick={() => setTab("flights")} icon={<Plane className="h-4 w-4" />}>
          Flights
        </TabBtn>
      </div>

      <FormattingHelp />

      {tab === "events" && <EventsTab />}
      {tab === "notices" && <NoticesTab />}
      {tab === "flights" && <FlightsTab />}
    </div>
  );
}

function TabBtn({ active, onClick, icon, children }: { active: boolean; onClick: () => void; icon: ReactNode; children: ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-colors",
        active
          ? "bg-card text-foreground shadow-sm border border-border/60"
          : "text-muted-foreground hover:text-foreground",
      )}
    >
      {icon}
      {children}
    </button>
  );
}

function FormattingHelp() {
  return (
    <div className="mb-5 rounded-xl border border-secondary/60 bg-secondary/20 px-4 py-3 text-xs text-foreground/80">
      <span className="font-semibold">Tip · ඉඟිය:</span>{" "}
      Wrap important words with <code className="px-1 bg-card rounded">**double asterisks**</code>
      {" "}to make them <strong className="text-destructive">bold red</strong>{" "}
      (like the yellow highlighter on paper). Sinhala translation can be filled automatically by clicking{" "}
      <span className="inline-flex items-center gap-1 font-medium"><Languages className="h-3 w-3" />Translate</span>.
    </div>
  );
}

/* ===================================================================== */
/*                               EVENTS                                  */
/* ===================================================================== */

type EventForm = {
  id?: string;
  title: string;
  titleSi: string;
  date: string;
  time: string;
  category: EventCategory;
  description: string;
  descriptionSi: string;
  note: string;
  noteSi: string;
};

const blankEvent: EventForm = {
  title: "",
  titleSi: "",
  date: new Date().toISOString().slice(0, 10),
  time: "",
  category: "test",
  description: "",
  descriptionSi: "",
  note: "",
  noteSi: "",
};

function EventsTab() {
  const { events, addEvent, updateEvent, removeEvent } = useEvents();
  const [form, setForm] = useState<EventForm>(blankEvent);
  const [editing, setEditing] = useState<string | null>(null);
  const [preview, setPreview] = useState<DLEvent | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const sorted = useMemo(
    () => [...events].sort((a, b) => a.date.localeCompare(b.date)),
    [events],
  );

  useEffect(() => {
    if (!editing) return;
    const e = events.find((x) => x.id === editing);
    if (e) {
      setForm({
        id: e.id, title: e.title, titleSi: e.titleSi ?? "",
        date: e.date, time: e.time ?? "", category: e.category,
        description: e.description, descriptionSi: e.descriptionSi ?? "",
        note: e.note ?? "", noteSi: e.noteSi ?? "",
      });
    }
  }, [editing, events]);

  const resetForm = () => { setForm(blankEvent); setEditing(null); setErrors({}); };

  const validate = () => {
    const er: Record<string, string> = {};
    if (!form.title.trim()) er.title = "Required";
    if (!form.date) er.date = "Required";
    if (!form.description.trim()) er.description = "Required";
    setErrors(er);
    return Object.keys(er).length === 0;
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    const payload = {
      title: form.title.trim(),
      titleSi: form.titleSi.trim() || undefined,
      date: form.date,
      time: form.time || undefined,
      category: form.category,
      description: form.description.trim(),
      descriptionSi: form.descriptionSi.trim() || undefined,
      note: form.note.trim() || undefined,
      noteSi: form.noteSi.trim() || undefined,
    };
    if (editing) { updateEvent(editing, payload); toast.success("Event updated"); }
    else { addEvent(payload); toast.success("Event added"); }
    resetForm();
  };

  const previewEvent: DLEvent = {
    id: form.id ?? "preview",
    title: form.title || "Untitled event",
    titleSi: form.titleSi || undefined,
    date: form.date,
    time: form.time || undefined,
    category: form.category,
    description: form.description || "Description preview…",
    descriptionSi: form.descriptionSi || undefined,
    note: form.note || undefined,
    noteSi: form.noteSi || undefined,
  };

  return (
    <div className="grid lg:grid-cols-[1fr,460px] gap-6">
      {/* List */}
      <div className="rounded-2xl bg-card border border-border/60 shadow-[var(--shadow-soft)] overflow-hidden">
        <ListHeader title="All events" count={sorted.length} onNew={resetForm} icon={<CalendarDays className="h-4 w-4 text-primary" />} />
        <div className="divide-y divide-border/60 max-h-[640px] overflow-y-auto">
          {sorted.length === 0 && <EmptyState>No events yet.</EmptyState>}
          {sorted.map((e) => {
            const m = categoryMeta[e.category];
            return (
              <div key={e.id} className="p-4 sm:p-5 flex items-start gap-4">
                <span className={cn("h-2.5 w-2.5 mt-1.5 rounded-full shrink-0", m.dot)} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-foreground truncate">{e.title}</h3>
                    <span className={cn("text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full border", m.chip)}>
                      {m.label}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {formatDate(e.date)}{e.time ? ` • ${e.time}` : ""}
                  </p>
                  <p className="text-sm text-foreground/75 mt-1 line-clamp-2">{e.description}</p>
                </div>
                <RowActions
                  onPreview={() => setPreview(e)}
                  onEdit={() => setEditing(e.id)}
                  onDelete={() => {
                    if (confirm(`Delete "${e.title}"?`)) {
                      removeEvent(e.id);
                      toast.success("Event deleted");
                      if (editing === e.id) resetForm();
                    }
                  }}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Form */}
      <aside>
        <form onSubmit={onSubmit} className="rounded-2xl bg-card border border-border/60 shadow-[var(--shadow-soft)] p-5">
          <h2 className="font-semibold text-foreground mb-4">
            {editing ? "Edit event" : "Add new event"}
          </h2>
          <div className="space-y-3">
            <BilingualField
              label="Title"
              error={errors.title}
              en={form.title}
              si={form.titleSi}
              onEn={(v) => setForm({ ...form, title: v })}
              onSi={(v) => setForm({ ...form, titleSi: v })}
              singleLine
            />
            <div className="grid grid-cols-2 gap-3">
              <Field label="Date" error={errors.date}>
                <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className={inputCls} />
              </Field>
              <Field label="Time (optional)">
                <input type="time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} className={inputCls} />
              </Field>
            </div>
            <Field label="Category">
              <div className="grid grid-cols-3 gap-2">
                {(["test", "agent", "notice"] as EventCategory[]).map((k) => {
                  const m = categoryMeta[k];
                  const active = form.category === k;
                  return (
                    <button type="button" key={k} onClick={() => setForm({ ...form, category: k })}
                      className={cn(
                        "px-2 py-2 rounded-lg text-xs font-semibold border transition-colors flex items-center justify-center gap-1.5",
                        active ? m.chip + " ring-2 " + m.ring : "border-border text-muted-foreground hover:text-foreground",
                      )}>
                      <span className={cn("h-1.5 w-1.5 rounded-full", m.dot)} />
                      {m.label}
                    </button>
                  );
                })}
              </div>
            </Field>
            <BilingualField
              label="Description (use **word** for highlight)"
              error={errors.description}
              en={form.description}
              si={form.descriptionSi}
              onEn={(v) => setForm({ ...form, description: v })}
              onSi={(v) => setForm({ ...form, descriptionSi: v })}
              rows={4}
            />
            <BilingualField
              label="Special note (optional)"
              en={form.note}
              si={form.noteSi}
              onEn={(v) => setForm({ ...form, note: v })}
              onSi={(v) => setForm({ ...form, noteSi: v })}
              rows={2}
            />
          </div>

          <div className="mt-5 flex gap-2">
            <button type="submit" className="flex-1 py-2.5 rounded-lg bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-colors">
              {editing ? "Save changes" : "Add event"}
            </button>
            <button type="button" onClick={() => setPreview(previewEvent)} className="px-3 py-2.5 rounded-lg border border-border bg-background text-sm font-medium hover:bg-muted">
              Preview
            </button>
            {editing && (
              <button type="button" onClick={resetForm} className="px-3 py-2.5 rounded-lg border border-border bg-background text-sm font-medium hover:bg-muted">
                Cancel
              </button>
            )}
          </div>
        </form>
      </aside>

      <EventModal event={preview} onClose={() => setPreview(null)} />
    </div>
  );
}

/* ===================================================================== */
/*                               NOTICES                                 */
/* ===================================================================== */

type NoticeForm = {
  id?: string;
  title: string;
  titleSi: string;
  body: string;
  bodySi: string;
  pinned: boolean;
};

const blankNotice: NoticeForm = { title: "", titleSi: "", body: "", bodySi: "", pinned: false };

function NoticesTab() {
  const { notices, addNotice, updateNotice, removeNotice } = useNotices();
  const [form, setForm] = useState<NoticeForm>(blankNotice);
  const [editing, setEditing] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!editing) return;
    const n = notices.find((x) => x.id === editing);
    if (n) setForm({
      id: n.id, title: n.title, titleSi: n.titleSi ?? "",
      body: n.body, bodySi: n.bodySi ?? "", pinned: !!n.pinned,
    });
  }, [editing, notices]);

  const resetForm = () => { setForm(blankNotice); setEditing(null); setErrors({}); };

  const sorted = useMemo(() => {
    return [...notices].sort((a, b) => {
      if (!!b.pinned !== !!a.pinned) return b.pinned ? 1 : -1;
      return b.createdAt.localeCompare(a.createdAt);
    });
  }, [notices]);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const er: Record<string, string> = {};
    if (!form.title.trim()) er.title = "Required";
    if (!form.body.trim()) er.body = "Required";
    setErrors(er);
    if (Object.keys(er).length) return;
    const payload = {
      title: form.title.trim(),
      titleSi: form.titleSi.trim() || undefined,
      body: form.body.trim(),
      bodySi: form.bodySi.trim() || undefined,
      pinned: form.pinned,
    };
    if (editing) { updateNotice(editing, payload); toast.success("Notice updated"); }
    else { addNotice(payload); toast.success("Notice added"); }
    resetForm();
  };

  return (
    <div className="grid lg:grid-cols-[1fr,460px] gap-6">
      <div className="rounded-2xl bg-card border border-border/60 shadow-[var(--shadow-soft)] overflow-hidden">
        <ListHeader title="All notices" count={sorted.length} onNew={resetForm} icon={<Megaphone className="h-4 w-4 text-primary" />} />
        <div className="divide-y divide-border/60 max-h-[640px] overflow-y-auto">
          {sorted.length === 0 && <EmptyState>No notices yet.</EmptyState>}
          {sorted.map((n) => (
            <div key={n.id} className="p-4 sm:p-5 flex items-start gap-4">
              {n.pinned && <Pin className="h-4 w-4 text-secondary-foreground mt-1 shrink-0" />}
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-foreground">{n.title}</h3>
                {n.titleSi && <p className="text-xs text-muted-foreground mt-0.5" lang="si">{n.titleSi}</p>}
                <p className="text-sm text-foreground/75 mt-1 line-clamp-2">{n.body}</p>
              </div>
              <RowActions
                onEdit={() => setEditing(n.id)}
                onDelete={() => {
                  if (confirm(`Delete this notice?`)) {
                    removeNotice(n.id);
                    toast.success("Notice deleted");
                    if (editing === n.id) resetForm();
                  }
                }}
              />
            </div>
          ))}
        </div>
      </div>

      <aside>
        <form onSubmit={onSubmit} className="rounded-2xl bg-card border border-border/60 shadow-[var(--shadow-soft)] p-5">
          <h2 className="font-semibold text-foreground mb-4">{editing ? "Edit notice" : "Add new notice"}</h2>
          <div className="space-y-3">
            <BilingualField
              label="Title" error={errors.title}
              en={form.title} si={form.titleSi}
              onEn={(v) => setForm({ ...form, title: v })}
              onSi={(v) => setForm({ ...form, titleSi: v })}
              singleLine
            />
            <BilingualField
              label="Body (use **word** for highlight)" error={errors.body}
              en={form.body} si={form.bodySi}
              onEn={(v) => setForm({ ...form, body: v })}
              onSi={(v) => setForm({ ...form, bodySi: v })}
              rows={5}
            />
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox" checked={form.pinned}
                onChange={(e) => setForm({ ...form, pinned: e.target.checked })}
                className="h-4 w-4 rounded border-border"
              />
              <Pin className="h-3.5 w-3.5 text-secondary-foreground" /> Pin to top
            </label>
          </div>
          <div className="mt-5 flex gap-2">
            <button type="submit" className="flex-1 py-2.5 rounded-lg bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-colors">
              {editing ? "Save changes" : "Add notice"}
            </button>
            {editing && (
              <button type="button" onClick={resetForm} className="px-3 py-2.5 rounded-lg border border-border bg-background text-sm font-medium hover:bg-muted">
                Cancel
              </button>
            )}
          </div>
        </form>
      </aside>
    </div>
  );
}

/* ===================================================================== */
/*                                FLIGHTS                                */
/* ===================================================================== */

type FlightForm = Omit<DLFlight, "id"> & { id?: string };

const blankFlight: FlightForm = {
  passengerName: "", passportNo: "", destination: "",
  airline: "", flightNo: "",
  departureDate: new Date().toISOString().slice(0, 10), departureTime: "", departureAirport: "Colombo (CMB)",
  arrivalDate: "", arrivalTime: "", arrivalAirport: "",
  agentName: "", agentPhone: "", notes: "",
};

function FlightsTab() {
  const { flights, addFlight, updateFlight, removeFlight } = useFlights();
  const [form, setForm] = useState<FlightForm>(blankFlight);
  const [editing, setEditing] = useState<string | null>(null);

  useEffect(() => {
    if (!editing) return;
    const f = flights.find((x) => x.id === editing);
    if (f) setForm(f);
  }, [editing, flights]);

  const reset = () => { setForm(blankFlight); setEditing(null); };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!form.passengerName.trim() || !form.destination.trim() || !form.airline.trim() || !form.flightNo.trim() || !form.departureDate) {
      toast.error("Fill passenger, destination, airline, flight no. and departure date");
      return;
    }
    const { id: _ignore, ...payload } = form;
    void _ignore;
    if (editing) { updateFlight(editing, payload); toast.success("Flight updated"); }
    else {
      const f = addFlight(payload);
      copyShareLink(f);
      toast.success("Flight added — share link copied to clipboard");
    }
    reset();
  };

  const copyShareLink = (f: DLFlight) => {
    const url = flightShareUrl(f);
    navigator.clipboard.writeText(url).then(
      () => toast.success("Share link copied"),
      () => toast.error("Could not copy"),
    );
  };

  const sorted = useMemo(
    () => [...flights].sort((a, b) => b.departureDate.localeCompare(a.departureDate)),
    [flights],
  );

  return (
    <div className="grid lg:grid-cols-[1fr,520px] gap-6">
      <div className="rounded-2xl bg-card border border-border/60 shadow-[var(--shadow-soft)] overflow-hidden">
        <ListHeader title="All flights" count={sorted.length} onNew={reset} icon={<Plane className="h-4 w-4 text-primary" />} />
        <div className="divide-y divide-border/60 max-h-[640px] overflow-y-auto">
          {sorted.length === 0 && <EmptyState>No flights yet. Add one to generate a share link.</EmptyState>}
          {sorted.map((f) => (
            <div key={f.id} className="p-4 sm:p-5 flex items-start gap-4">
              <Plane className="h-4 w-4 mt-1 text-primary shrink-0" />
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-foreground">{f.passengerName} → {f.destination}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {f.airline} {f.flightNo} • {formatDate(f.departureDate)}
                  {f.departureTime ? ` ${f.departureTime}` : ""}
                </p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button onClick={() => copyShareLink(f)} className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-primary" title="Copy share link">
                  <Copy className="h-4 w-4" />
                </button>
                <a href={flightShareUrl(f)} target="_blank" rel="noopener" className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground" title="Open">
                  <ExternalLink className="h-4 w-4" />
                </a>
                <RowActions
                  onEdit={() => setEditing(f.id)}
                  onDelete={() => {
                    if (confirm(`Delete flight for ${f.passengerName}?`)) {
                      removeFlight(f.id);
                      toast.success("Flight deleted");
                      if (editing === f.id) reset();
                    }
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <aside>
        <form onSubmit={onSubmit} className="rounded-2xl bg-card border border-border/60 shadow-[var(--shadow-soft)] p-5">
          <h2 className="font-semibold text-foreground mb-1">{editing ? "Edit flight" : "Add new flight"}</h2>
          <p className="text-xs text-muted-foreground mb-4">After saving, a public share link is generated for the receiving agent.</p>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Passenger name *"><input value={form.passengerName} onChange={(e) => setForm({ ...form, passengerName: e.target.value })} className={inputCls} /></Field>
              <Field label="Passport no."><input value={form.passportNo} onChange={(e) => setForm({ ...form, passportNo: e.target.value })} className={inputCls} /></Field>
            </div>
            <Field label="Destination (country) *"><input value={form.destination} onChange={(e) => setForm({ ...form, destination: e.target.value })} className={inputCls} placeholder="e.g. Doha, Qatar" /></Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Airline *"><input value={form.airline} onChange={(e) => setForm({ ...form, airline: e.target.value })} className={inputCls} placeholder="Qatar Airways" /></Field>
              <Field label="Flight no. *"><input value={form.flightNo} onChange={(e) => setForm({ ...form, flightNo: e.target.value })} className={inputCls} placeholder="QR 665" /></Field>
            </div>
            <Section label="Departure">
              <div className="grid grid-cols-2 gap-3">
                <Field label="Date *"><input type="date" value={form.departureDate} onChange={(e) => setForm({ ...form, departureDate: e.target.value })} className={inputCls} /></Field>
                <Field label="Time"><input type="time" value={form.departureTime} onChange={(e) => setForm({ ...form, departureTime: e.target.value })} className={inputCls} /></Field>
              </div>
              <Field label="Airport"><input value={form.departureAirport} onChange={(e) => setForm({ ...form, departureAirport: e.target.value })} className={inputCls} /></Field>
            </Section>
            <Section label="Arrival">
              <div className="grid grid-cols-2 gap-3">
                <Field label="Date"><input type="date" value={form.arrivalDate} onChange={(e) => setForm({ ...form, arrivalDate: e.target.value })} className={inputCls} /></Field>
                <Field label="Time"><input type="time" value={form.arrivalTime} onChange={(e) => setForm({ ...form, arrivalTime: e.target.value })} className={inputCls} /></Field>
              </div>
              <Field label="Airport"><input value={form.arrivalAirport} onChange={(e) => setForm({ ...form, arrivalAirport: e.target.value })} className={inputCls} placeholder="e.g. Doha (DOH)" /></Field>
            </Section>
            <Section label="Receiving agent">
              <div className="grid grid-cols-2 gap-3">
                <Field label="Name"><input value={form.agentName} onChange={(e) => setForm({ ...form, agentName: e.target.value })} className={inputCls} /></Field>
                <Field label="Phone"><input value={form.agentPhone} onChange={(e) => setForm({ ...form, agentPhone: e.target.value })} className={inputCls} /></Field>
              </div>
            </Section>
            <Field label="Notes (optional, supports **highlight**)">
              <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} className={inputCls + " resize-none"} />
            </Field>
          </div>
          <div className="mt-5 flex gap-2">
            <button type="submit" className="flex-1 py-2.5 rounded-lg bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-colors">
              {editing ? "Save changes" : "Add flight & copy link"}
            </button>
            {editing && (
              <button type="button" onClick={reset} className="px-3 py-2.5 rounded-lg border border-border bg-background text-sm font-medium hover:bg-muted">
                Cancel
              </button>
            )}
          </div>
        </form>
      </aside>
    </div>
  );
}

/* ===================================================================== */
/*                            SHARED PIECES                              */
/* ===================================================================== */

const inputCls =
  "w-full px-3 py-2 rounded-lg bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/40";

function LabeledInput({ label, value, onChange, type = "text", autoComplete }: { label: string; value: string; onChange: (v: string) => void; type?: string; autoComplete?: string }) {
  return (
    <div>
      <label className="text-xs font-medium text-foreground/70">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={"mt-1 " + inputCls}
        autoComplete={autoComplete}
        required
      />
    </div>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: ReactNode }) {
  return (
    <div>
      <label className="text-xs font-medium text-foreground/70">{label}</label>
      <div className="mt-1">{children}</div>
      {error && <p className="mt-1 text-xs text-event-notice">{error}</p>}
    </div>
  );
}

function Section({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="rounded-lg border border-border/60 bg-muted/20 p-3 space-y-3">
      <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{label}</div>
      {children}
    </div>
  );
}

function ListHeader({ title, count, onNew, icon }: { title: string; count: number; onNew: () => void; icon: ReactNode }) {
  return (
    <div className="px-5 py-4 border-b border-border/60 flex items-center justify-between">
      <div className="flex items-center gap-2">
        {icon}
        <h2 className="font-semibold text-foreground">{title}</h2>
        <span className="text-xs text-muted-foreground">({count})</span>
      </div>
      <button onClick={onNew} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90">
        <Plus className="h-3.5 w-3.5" /> New
      </button>
    </div>
  );
}

function EmptyState({ children }: { children: ReactNode }) {
  return <div className="p-8 text-center text-sm text-muted-foreground">{children}</div>;
}

function RowActions({ onPreview, onEdit, onDelete }: { onPreview?: () => void; onEdit: () => void; onDelete: () => void }) {
  return (
    <div className="flex items-center gap-1 shrink-0">
      {onPreview && (
        <button onClick={onPreview} className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground" title="Preview">
          <Eye className="h-4 w-4" />
        </button>
      )}
      <button onClick={onEdit} className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-primary" title="Edit">
        <Edit3 className="h-4 w-4" />
      </button>
      <button onClick={onDelete} className="p-2 rounded-lg hover:bg-event-notice/10 text-muted-foreground hover:text-event-notice" title="Delete">
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}

/** English + Sinhala paired input with a one-click AI translate button. */
function BilingualField({
  label,
  error,
  en,
  si,
  onEn,
  onSi,
  rows,
  singleLine,
}: {
  label: string;
  error?: string;
  en: string;
  si: string;
  onEn: (v: string) => void;
  onSi: (v: string) => void;
  rows?: number;
  singleLine?: boolean;
}) {
  const [loading, setLoading] = useState(false);
  const translate = useServerFn(translateToSinhala);

  const doTranslate = async () => {
    if (!en.trim()) {
      toast.error("Type the English text first");
      return;
    }
    setLoading(true);
    try {
      const { sinhala } = await translate({ data: { text: en } });
      onSi(sinhala);
      toast.success("Translated to Sinhala");
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Translation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <label className="text-xs font-medium text-foreground/70">{label}</label>
        <button
          type="button"
          onClick={doTranslate}
          disabled={loading}
          className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:text-primary/80 disabled:opacity-50"
          title="Auto-translate English → Sinhala"
        >
          {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Languages className="h-3 w-3" />}
          Translate
        </button>
      </div>
      <div className="mt-1 space-y-2">
        {singleLine ? (
          <input value={en} onChange={(e) => onEn(e.target.value)} className={inputCls} placeholder="English" />
        ) : (
          <textarea value={en} onChange={(e) => onEn(e.target.value)} rows={rows ?? 3} className={inputCls + " resize-none"} placeholder="English" />
        )}
        {singleLine ? (
          <input value={si} onChange={(e) => onSi(e.target.value)} className={inputCls} placeholder="සිංහල (auto-filled by Translate)" lang="si" />
        ) : (
          <textarea value={si} onChange={(e) => onSi(e.target.value)} rows={rows ?? 3} className={inputCls + " resize-none"} placeholder="සිංහල (auto-filled by Translate)" lang="si" />
        )}
      </div>
      {error && <p className="mt-1 text-xs text-event-notice">{error}</p>}
    </div>
  );
}