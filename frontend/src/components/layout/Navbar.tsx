import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  FilmSlate,
  Ticket,
  SignOut,
  List,
  Sun,
  Moon,
} from "@phosphor-icons/react";
import { useAuthStore } from "../../stores/authStore";
import { useTheme } from "../theme-provider";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "../ui/dropdown-menu";
import { Facehash } from "facehash";
import { gooeyToast } from "../ui/goey-toaster";

const navLinks = [{ to: "/movies", label: "Movies" }];

export function Navbar() {
  const { user, logout } = useAuthStore();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    gooeyToast.success("Logged out successfully");
    navigate("/");
  };

  return (
    <header className="border-b border-border/60 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <div className="bg-primary p-1.5">
            <FilmSlate
              size={18}
              weight="fill"
              className="text-primary-foreground"
            />
          </div>
          <span className="font-heading font-bold text-base tracking-tight">
            BookMyTicket
          </span>
        </Link>

        <nav className="hidden sm:flex items-center gap-1">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `px-3 py-1.5 text-sm transition-colors ${
                  isActive
                    ? "text-foreground font-medium"
                    : "text-muted-foreground hover:text-foreground"
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
          </Button>

          {user ? (
            <>
              {user.role !== "admin" && (
                <Link to="/bookings">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="hidden sm:flex gap-1.5 text-sm"
                  >
                    <Ticket size={15} />
                    My Bookings
                  </Button>
                </Link>
              )}

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 outline-none">
                    <Facehash
                      name={user.name}
                      size={32}
                      enableBlink
                      colorClasses={["bg-primary"]}
                    />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52">
                  <div className="px-2 py-1.5">
                    <p className="text-sm font-medium">{user.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                  <DropdownMenuSeparator />
                  {user.role !== "admin" && (
                    <DropdownMenuItem asChild>
                      <Link
                        to="/bookings"
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <Ticket size={14} />
                        My Bookings
                      </Link>
                    </DropdownMenuItem>
                  )}
                  {user.role === "admin" && (
                    <DropdownMenuItem asChild>
                      <Link
                        to="/admin"
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <List size={14} />
                        Admin Panel
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="text-destructive focus:text-destructive flex items-center gap-2 cursor-pointer"
                  >
                    <SignOut size={14} />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login">
                <Button variant="ghost" size="sm" className="text-sm">
                  Sign in
                </Button>
              </Link>
              <Link to="/register">
                <Button size="sm" className="text-sm">
                  Get started
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
