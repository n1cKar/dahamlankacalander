import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
  CalendarDays,
  Edit3,
  LogOut,
  Plus,
  ShieldCheck,
  Trash2,
  Eye,
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
import { EventModal } from "@/components/EventModal";
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
    if (login(username, password)) {
      toast.success("Welcome back, admin");
    } else {
      setError("Invalid username or password");
    }
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
            Manage events, tests and announcements.
          </p>

          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <div>
              <label className="text-xs font-medium text-foreground/70">Username</label>
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="mt-1 w-full px-4 py-2.5 rounded-xl bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary/40 text-sm"
                autoComplete="username"
                required
              />
            </div>
            <div>
              <label className="text-xs font-medium text-foreground/70">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 w-full px-4 py-2.5 rounded-xl bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary/40 text-sm"
                autoComplete="current-password"
                required
              />
            </div>
            {error && (
              <p className="text-sm text-event-notice font-medium">{error}</p>
            )}
            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors"
            >
              Sign in
            </button>
          </form>

          <div className="mt-6 rounded-xl bg-muted/60 border border-border/60 p-3 text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">Demo credentials:</span>{" "}
            <code className="text-foreground">{ADMIN_USER}</code> /{" "}
            <code className="text-foreground">{ADMIN_PASS}</code>
          </div>
        </div>
      </div>
    </div>
  );
}

type FormState = {
  id?: string;
  title: string;
  date: string;
  time: string;
  category: EventCategory;
  description: string;
  note: string;
};

const blankForm: FormState = {
  title: "",
  date: new Date().toISOString().slice(0, 10),
  time: "",
  category: "test",
  description: "",
  note: "",
};

function Dashboard() {
  const { events, addEvent, updateEvent, removeEvent } = useEvents();
  const [form, setForm] = useState<FormState>(blankForm);
  const [editing, setEditing] = useState<string | null>(null);
  const [preview, setPreview] = useState<DLEvent | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const sorted = useMemo(
    () => [...events].sort((a, b) => a.date.localeCompare(b.date)),
    [events],
  );

  useEffect(() => {
    if (editing) {
      const e = events.find((x) => x.id === editing);
      if (e) {
        setForm({
          id: e.id,
          title: e.title,
          date: e.date,
          time: e.time ?? "",
          category: e.category,
          description: e.description,
          note: e.note ?? "",
        });
      }
    }
  }, [editing, events]);

  const resetForm = () => {
    setForm(blankForm);
    setEditing(null);
    setErrors({});
  };

  const validate = () => {
    const er: Record<string, string> = {};
    if (!form.title.trim()) er.title = "Title is required";
    if (!form.date) er.date = "Date is required";
    if (!form.description.trim()) er.description = "Description is required";
    setErrors(er);
    return Object.keys(er).length === 0;
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    const payload = {
      title: form.title.trim(),
      date: form.date,
      time: form.time || undefined,
      category: form.category,
      description: form.description.trim(),
      note: form.note.trim() || undefined,
    };
    if (editing) {
      updateEvent(editing, payload);
      toast.success("Event updated");
    } else {
      addEvent(payload);
      toast.success("Event added");
    }
    resetForm();
  };

  const previewEvent: DLEvent = {
    id: form.id ?? "preview",
    title: form.title || "Untitled event",
    date: form.date,
    time: form.time || undefined,
    category: form.category,
    description: form.description || "Description preview…",
    note: form.note || undefined,
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
      <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-primary">
            Admin
          </div>
          <h1 className="mt-2 text-3xl sm:text-4xl font-bold text-foreground">
            Event dashboard
          </h1>
          <p className="mt-2 text-muted-foreground">
            Manage tests, agent arrivals, and announcements shown on the public site.
          </p>
        </div>
        <button
          onClick={() => {
            logout();
            toast.message("Signed out");
          }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-border bg-card hover:bg-muted text-sm font-medium"
        >
          <LogOut className="h-4 w-4" /> Sign out
        </button>
      </div>

      <div className="grid lg:grid-cols-[1fr,420px] gap-6">
        {/* LEFT: list */}
        <div className="rounded-2xl bg-card border border-border/60 shadow-[var(--shadow-soft)] overflow-hidden">
          <div className="px-5 py-4 border-b border-border/60 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-primary" />
              <h2 className="font-semibold text-foreground">All events</h2>
              <span className="text-xs text-muted-foreground">({sorted.length})</span>
            </div>
            <button
              onClick={resetForm}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Plus className="h-3.5 w-3.5" /> New
            </button>
          </div>
          <div className="divide-y divide-border/60 max-h-[640px] overflow-y-auto">
            {sorted.length === 0 && (
              <div className="p-8 text-center text-sm text-muted-foreground">
                No events yet. Create your first one.
              </div>
            )}
            {sorted.map((e) => {
              const m = categoryMeta[e.category];
              return (
                <div key={e.id} className="p-4 sm:p-5 flex items-start gap-4">
                  <span
                    className={cn("h-2.5 w-2.5 mt-1.5 rounded-full shrink-0", m.dot)}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-foreground truncate">
                        {e.title}
                      </h3>
                      <span
                        className={cn(
                          "text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full border",
                          m.chip,
                        )}
                      >
                        {m.label}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {formatDate(e.date)}
                      {e.time ? ` • ${e.time}` : ""}
                    </p>
                    <p className="text-sm text-foreground/75 mt-1 line-clamp-2">
                      {e.description}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => setPreview(e)}
                      className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground"
                      title="Preview"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setEditing(e.id)}
                      className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-primary"
                      title="Edit"
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Delete "${e.title}"?`)) {
                          removeEvent(e.id);
                          toast.success("Event deleted");
                          if (editing === e.id) resetForm();
                        }
                      }}
                      className="p-2 rounded-lg hover:bg-event-notice/10 text-muted-foreground hover:text-event-notice"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT: form */}
        <aside className="space-y-6">
          <form
            onSubmit={onSubmit}
            className="rounded-2xl bg-card border border-border/60 shadow-[var(--shadow-soft)] p-5"
          >
            <h2 className="font-semibold text-foreground mb-4">
              {editing ? "Edit event" : "Add new event"}
            </h2>
            <div className="space-y-3">
              <Field label="Title" error={errors.title}>
                <input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Date" error={errors.date}>
                  <input
                    type="date"
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                </Field>
                <Field label="Time (optional)">
                  <input
                    type="time"
                    value={form.time}
                    onChange={(e) => setForm({ ...form, time: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                </Field>
              </div>
              <Field label="Category">
                <div className="grid grid-cols-3 gap-2">
                  {(["test", "agent", "notice"] as EventCategory[]).map((k) => {
                    const m = categoryMeta[k];
                    const active = form.category === k;
                    return (
                      <button
                        type="button"
                        key={k}
                        onClick={() => setForm({ ...form, category: k })}
                        className={cn(
                          "px-2 py-2 rounded-lg text-xs font-semibold border transition-colors flex items-center justify-center gap-1.5",
                          active
                            ? m.chip + " ring-2 " + m.ring
                            : "border-border text-muted-foreground hover:text-foreground",
                        )}
                      >
                        <span className={cn("h-1.5 w-1.5 rounded-full", m.dot)} />
                        {m.label}
                      </button>
                    );
                  })}
                </div>
              </Field>
              <Field label="Description" error={errors.description}>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
                />
              </Field>
              <Field label="Special note (optional)">
                <textarea
                  value={form.note}
                  onChange={(e) => setForm({ ...form, note: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 rounded-lg bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
                />
              </Field>
            </div>

            <div className="mt-5 flex gap-2">
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-lg bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-colors"
              >
                {editing ? "Save changes" : "Add event"}
              </button>
              <button
                type="button"
                onClick={() => setPreview(previewEvent)}
                className="px-3 py-2.5 rounded-lg border border-border bg-background text-sm font-medium hover:bg-muted"
              >
                Preview
              </button>
              {editing && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-3 py-2.5 rounded-lg border border-border bg-background text-sm font-medium hover:bg-muted"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </aside>
      </div>

      <EventModal event={preview} onClose={() => setPreview(null)} />
    </div>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="text-xs font-medium text-foreground/70">{label}</label>
      <div className="mt-1">{children}</div>
      {error && <p className="mt-1 text-xs text-event-notice">{error}</p>}
    </div>
  );
}