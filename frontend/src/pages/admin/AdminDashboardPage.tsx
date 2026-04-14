import { useQuery } from "@tanstack/react-query";
import {
  Users,
  Ticket,
  CurrencyDollar,
  FilmSlate,
  CalendarBlank,
  CheckCircle,
  XCircle,
  Clock,
} from "@phosphor-icons/react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { adminApi } from "@/api/admin.api";
import { formatCurrency, formatDateTime } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  sub?: string;
}

function StatCard({ label, value, icon, sub }: StatCardProps) {
  return (
    <div className="border border-border/60 bg-card p-5">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">
            {label}
          </p>
          <p className="font-heading text-2xl font-bold">{value}</p>
          {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
        </div>
        <div className="text-muted-foreground/60">{icon}</div>
      </div>
    </div>
  );
}

export default function AdminDashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: adminApi.getStats,
  });

  const stats = data?.stats;
  const recentBookings = data?.recentBookings ?? [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-xl font-bold">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Platform overview
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Total Users"
            value={stats?.totalUsers ?? 0}
            icon={<Users size={22} />}
          />
          <StatCard
            label="Total Bookings"
            value={stats?.totalBookings ?? 0}
            icon={<Ticket size={22} />}
            sub={`${stats?.confirmedBookings ?? 0} confirmed · ${stats?.cancelledBookings ?? 0} cancelled`}
          />
          <StatCard
            label="Revenue"
            value={formatCurrency(stats?.totalRevenue ?? 0)}
            icon={<CurrencyDollar size={22} />}
            sub="from confirmed bookings"
          />
          <StatCard
            label="Movies"
            value={stats?.totalMovies ?? 0}
            icon={<FilmSlate size={22} />}
          />
          <StatCard
            label="Total Shows"
            value={stats?.totalShows ?? 0}
            icon={<CalendarBlank size={22} />}
          />
          <StatCard
            label="Upcoming Shows"
            value={stats?.upcomingShows ?? 0}
            icon={<Clock size={22} />}
          />
          <StatCard
            label="Confirmed"
            value={stats?.confirmedBookings ?? 0}
            icon={<CheckCircle size={22} />}
          />
          <StatCard
            label="Cancelled"
            value={stats?.cancelledBookings ?? 0}
            icon={<XCircle size={22} />}
          />
        </div>
      )}

      <div>
        <h2 className="font-heading text-base font-semibold mb-4">
          Recent Bookings
        </h2>
        <div className="border border-border/60 overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Movie</TableHead>
                <TableHead>Show Time</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 6 }).map((_, j) => (
                      <TableCell key={j}>
                        <Skeleton className="h-4 w-full" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : recentBookings.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center text-muted-foreground py-8"
                  >
                    No bookings yet
                  </TableCell>
                </TableRow>
              ) : (
                recentBookings.map((b) => (
                  <TableRow key={b.id}>
                    <TableCell>
                      <div>
                        <p className="text-sm font-medium">{b.user_name}</p>
                        <p className="text-xs text-muted-foreground">
                          {b.user_email}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{b.movie_title}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {formatDateTime(b.show_time)}
                    </TableCell>
                    <TableCell className="text-sm font-medium">
                      {formatCurrency(b.total_price)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          b.status === "confirmed" ? "default" : "secondary"
                        }
                        className="text-xs capitalize"
                      >
                        {b.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
