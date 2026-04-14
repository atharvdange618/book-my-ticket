import { NavLink, Outlet, Link } from "react-router-dom";
import {
  ChartBar,
  FilmSlate,
  CalendarBlank,
  Ticket,
  Users,
  ArrowLeft,
} from "@phosphor-icons/react";
import { Facehash } from "facehash";
import { Toaster } from "../ui/sonner";
import { useAuthStore } from "../../stores/authStore";
import { Separator } from "../ui/separator";

const sidebarLinks = [
  { to: "/admin", label: "Dashboard", icon: ChartBar, end: true },
  { to: "/admin/movies", label: "Movies", icon: FilmSlate },
  { to: "/admin/shows", label: "Shows", icon: CalendarBlank },
  { to: "/admin/bookings", label: "Bookings", icon: Ticket },
  { to: "/admin/users", label: "Users", icon: Users },
];

export function AdminLayout() {
  const { user } = useAuthStore();

  return (
    <div className="flex min-h-svh">
      <aside className="hidden md:flex flex-col w-56 shrink-0 border-r border-border/60 bg-sidebar">
        <div className="h-14 flex items-center px-4 border-b border-border/60">
          <div className="flex items-center gap-2">
            <div className="bg-primary p-1.5">
              <FilmSlate
                size={16}
                weight="fill"
                className="text-primary-foreground"
              />
            </div>
            <span className="font-heading font-bold text-sm">Admin</span>
          </div>
        </div>

        <nav className="flex-1 px-2 py-3 flex flex-col gap-0.5">
          {sidebarLinks.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-2.5 py-2 text-sm transition-colors ${
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                }`
              }
            >
              <Icon size={16} />
              {label}
            </NavLink>
          ))}
        </nav>

        <Separator />

        <div className="p-3">
          <Link
            to="/"
            className="flex items-center gap-2 text-xs text-sidebar-foreground/50 hover:text-sidebar-foreground transition-colors px-2 py-1.5"
          >
            <ArrowLeft size={12} />
            Back to site
          </Link>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-14 border-b border-border/60 flex items-center justify-between px-6 bg-background shrink-0">
          <h1 className="text-sm font-medium text-muted-foreground">
            Admin Panel
          </h1>
          {user && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground hidden sm:block">
                {user.name}
              </span>
              <Facehash
                name={user.name}
                size={28}
                enableBlink
                colorClasses={["bg-primary"]}
              />
            </div>
          )}
        </header>

        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>

      <Toaster richColors position="top-right" />
    </div>
  );
}
