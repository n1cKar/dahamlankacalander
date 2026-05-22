import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Plane,
  User,
  MapPin,
  Calendar,
  Clock,
  Phone,
  FileText,
  ShieldCheck,
  ArrowLeft,
} from "lucide-react";
import logo from "@/assets/logo.png";
import { decodeFlightToken, type DLFlight } from "@/lib/flights-store";
import { RichText } from "@/lib/rich-text";

export const Route = createFileRoute("/flight/$token")({
  head: ({ params }) => {
    const f = decodeFlightToken(params.token);
    const title = f
      ? `Flight — ${f.passengerName} → ${f.destination}`
      : "Flight details";
    return {
      meta: [
        { title },
        { name: "description", content: "Confidential flight details for our agent." },
        { name: "robots", content: "noindex,nofollow" },
      ],
    };
  },
  component: FlightPage,
});

function FlightPage() {
  const { token } = Route.useParams();
  const flight = decodeFlightToken(token);

  if (!flight) return <Invalid />;

  return (
    <div className="min-h-[80vh] bg-muted/30 py-8 sm:py-12">
      <div className="max-w-2xl mx-auto px-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <img src={logo} alt="Daham Lanka" className="h-9 w-auto" />
            <div className="text-xs">
              <div className="font-bold text-brand-navy">DAHAM LANKA (PVT) LTD</div>
              <div className="text-muted-foreground">Foreign Employment Agency</div>
            </div>
          </div>
          <span className="inline-flex items-center gap-1 text-[11px] px-2 py-1 rounded-full bg-primary/10 text-primary border border-primary/30">
            <ShieldCheck className="h-3 w-3" /> Confidential
          </span>
        </div>

        <div className="rounded-3xl bg-card border border-border/60 shadow-[var(--shadow-elegant)] overflow-hidden">
          <div
            className="p-6 text-primary-foreground"
            style={{ background: "var(--gradient-brand)" }}
          >
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider opacity-90">
              <Plane className="h-4 w-4" /> Flight details
            </div>
            <h1 className="mt-2 text-2xl sm:text-3xl font-bold">
              {flight.passengerName}
            </h1>
            {flight.passportNo && (
              <p className="mt-1 text-sm text-white/85">
                Passport: <span className="font-mono">{flight.passportNo}</span>
              </p>
            )}
            <div className="mt-4 flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4" />
              <span className="font-medium">Destination:</span>
              <span>{flight.destination}</span>
            </div>
          </div>

          <div className="p-6 space-y-5">
            <Row icon={<Plane className="h-4 w-4" />} label="Flight">
              <span className="font-semibold">{flight.airline}</span> ·{" "}
              <span className="font-mono">{flight.flightNo}</span>
            </Row>
            <div className="grid sm:grid-cols-2 gap-5">
              <Block label="Departure" tone="primary">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-primary" />
                  {fmt(flight.departureDate)}
                  {flight.departureTime && (
                    <>
                      <Clock className="h-4 w-4 ml-2 text-primary" />
                      {flight.departureTime}
                    </>
                  )}
                </div>
                {flight.departureAirport && (
                  <div className="mt-1 text-sm text-muted-foreground">
                    {flight.departureAirport}
                  </div>
                )}
              </Block>
              {(flight.arrivalDate || flight.arrivalAirport) && (
                <Block label="Arrival" tone="agent">
                  <div className="flex items-center gap-2 text-sm">
                    {flight.arrivalDate && (
                      <>
                        <Calendar className="h-4 w-4 text-event-agent" />
                        {fmt(flight.arrivalDate)}
                      </>
                    )}
                    {flight.arrivalTime && (
                      <>
                        <Clock className="h-4 w-4 ml-2 text-event-agent" />
                        {flight.arrivalTime}
                      </>
                    )}
                  </div>
                  {flight.arrivalAirport && (
                    <div className="mt-1 text-sm text-muted-foreground">
                      {flight.arrivalAirport}
                    </div>
                  )}
                </Block>
              )}
            </div>

            {(flight.agentName || flight.agentPhone) && (
              <div className="rounded-xl border border-border/60 bg-muted/30 p-4">
                <div className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">
                  Receiving agent
                </div>
                {flight.agentName && (
                  <div className="mt-1 flex items-center gap-2 text-sm">
                    <User className="h-4 w-4 text-primary" /> {flight.agentName}
                  </div>
                )}
                {flight.agentPhone && (
                  <a
                    href={`tel:${flight.agentPhone}`}
                    className="mt-1 flex items-center gap-2 text-sm text-primary hover:underline"
                  >
                    <Phone className="h-4 w-4" /> {flight.agentPhone}
                  </a>
                )}
              </div>
            )}

            {flight.notes && (
              <div className="rounded-xl border border-secondary/60 bg-secondary/20 p-4">
                <div className="flex items-center gap-2 text-xs font-semibold mb-1">
                  <FileText className="h-3.5 w-3.5" /> Notes
                </div>
                <div className="text-sm text-foreground/85">
                  <RichText text={flight.notes} />
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 text-center">
          <Link
            to="/"
            className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-3 w-3" /> Back to Daham Lanka
          </Link>
        </div>
      </div>
    </div>
  );
}

function Row({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 text-sm">
      <span className="text-primary">{icon}</span>
      <span className="text-muted-foreground">{label}:</span>
      <span className="text-foreground">{children}</span>
    </div>
  );
}

function Block({
  label,
  tone,
  children,
}: {
  label: string;
  tone: "primary" | "agent";
  children: React.ReactNode;
}) {
  const border = tone === "primary" ? "border-primary/30 bg-primary/5" : "border-event-agent/30 bg-event-agent/5";
  return (
    <div className={`rounded-xl border p-4 ${border}`}>
      <div className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground mb-1">
        {label}
      </div>
      {children}
    </div>
  );
}

function fmt(iso?: string) {
  if (!iso) return "";
  return new Date(iso + "T00:00:00").toLocaleDateString(undefined, {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function Invalid() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="max-w-md text-center">
        <h1 className="text-2xl font-bold">Link not valid</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          This flight share link could not be read. Please ask the agency to send a new one.
        </p>
        <Link
          to="/"
          className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary text-primary-foreground text-sm font-medium"
        >
          Go to home
        </Link>
      </div>
    </div>
  );
}