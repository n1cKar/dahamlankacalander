import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import logo from "@/assets/logo.png";
import { cn } from "@/lib/utils";

const links = [
  { to: "/", label: "Home" },
  { to: "/calendar", label: "Calendar" },
  { to: "/admin", label: "Admin" },
] as const;

export function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 backdrop-blur-xl bg-background/80 border-b border-border/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group">
          <img
            src={logo}
            alt="Daham Lanka (PVT) LTD"
            className="h-10 w-auto transition-transform group-hover:scale-105"
          />
          <div className="hidden sm:block leading-tight">
            <div className="text-sm font-bold text-brand-navy tracking-tight">
              DAHAM LANKA (PVT) LTD
            </div>
            <div className="text-[11px] text-muted-foreground">
              Foreign Employment Agency
            </div>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="px-4 py-2 text-sm font-medium text-foreground/70 rounded-full hover:text-foreground hover:bg-muted transition-colors"
              activeProps={{
                className:
                  "px-4 py-2 text-sm font-medium rounded-full bg-primary text-primary-foreground hover:bg-primary",
              }}
              activeOptions={{ exact: l.to === "/" }}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <button
          className="md:hidden p-2 rounded-md hover:bg-muted"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      <div
        className={cn(
          "md:hidden overflow-hidden transition-all duration-300 ease-out border-t border-border/60",
          open ? "max-h-64" : "max-h-0",
        )}
      >
        <nav className="px-4 py-3 flex flex-col gap-1 bg-background">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              onClick={() => setOpen(false)}
              className="px-4 py-2.5 text-sm font-medium text-foreground/80 rounded-lg hover:bg-muted"
              activeProps={{
                className:
                  "px-4 py-2.5 text-sm font-medium rounded-lg bg-primary text-primary-foreground",
              }}
              activeOptions={{ exact: l.to === "/" }}
            >
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}