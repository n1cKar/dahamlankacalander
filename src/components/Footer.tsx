import { Mail, Phone, MapPin } from "lucide-react";
import logo from "@/assets/logo.png";
import { Link } from "@tanstack/react-router";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-border/60 bg-muted/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid gap-10 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="flex items-center gap-3 mb-4">
            <img src={logo} alt="Daham Lanka" className="h-11 w-auto" />
            <div>
              <div className="font-bold text-brand-navy">DAHAM LANKA (PVT) LTD</div>
              <div className="text-xs text-muted-foreground">
                Foreign Employment Agency
              </div>
            </div>
          </div>
          <p className="text-sm text-muted-foreground max-w-md">
            Licensed foreign employment agency helping Sri Lankans build careers
            abroad through trusted partners, transparent processes and continuous
            support.
          </p>
        </div>

        <div>
          <div className="text-sm font-semibold text-foreground mb-3">Quick links</div>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/" className="hover:text-primary">Home</Link></li>
            <li><Link to="/calendar" className="hover:text-primary">Calendar</Link></li>
            <li><Link to="/admin" className="hover:text-primary">Admin</Link></li>
          </ul>
        </div>

        <div>
          <div className="text-sm font-semibold text-foreground mb-3">Contact</div>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-primary" />
              <span>+94 11 234 5678</span>
            </li>
            <li className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-primary" />
              <span>info@dahamlanka.lk</span>
            </li>
            <li className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" />
              <span>Colombo, Sri Lanka</span>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 text-xs text-muted-foreground flex flex-wrap items-center justify-between gap-2">
          <span>© {new Date().getFullYear()} Daham Lanka (PVT) LTD. All rights reserved.</span>
          <span>Licensed Foreign Employment Agency</span>
        </div>
      </div>
    </footer>
  );
}