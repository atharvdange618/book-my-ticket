import { useQuery } from "@tanstack/react-query";
import { Ticket } from "@phosphor-icons/react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { adminApi } from "@/api/admin.api";
import { formatCurrency, formatDateTime } from "@/lib/utils";

export default function AdminBookingsPage() {
  const { data: bookings, isLoading } = useQuery({
    queryKey: ["admin-bookings"],
    queryFn: adminApi.getBookings,
  });

  const confirmed = (bookings ?? []).filter(
    (b) => b.status === "confirmed",
  ).length;
  const cancelled = (bookings ?? []).filter(
    (b) => b.status === "cancelled",
  ).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-xl font-bold flex items-center gap-2">
          <Ticket size={20} />
          All Bookings
        </h1>
        {bookings && (
          <p className="text-sm text-muted-foreground mt-0.5">
            {bookings.length} total · {confirmed} confirmed · {cancelled}{" "}
            cancelled
          </p>
        )}
      </div>

      <div className="border border-border/60 overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Movie</TableHead>
              <TableHead>Seat</TableHead>
              <TableHead>Screen</TableHead>
              <TableHead>Show Time</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Booked At</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 8 }).map((_, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (bookings ?? []).length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="text-center text-muted-foreground py-12"
                >
                  No bookings yet.
                </TableCell>
              </TableRow>
            ) : (
              (bookings ?? []).map((b) => (
                <TableRow key={b.id}>
                  <TableCell>
                    <div>
                      <p className="text-sm font-medium">{b.user_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {b.user_email}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm font-medium">
                    {b.movie_title}
                  </TableCell>
                  <TableCell className="font-mono text-xs">
                    {b.seats
                      .map((s) => `${s.row_letter}${s.seat_number}`)
                      .join(", ")}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    Screen {b.screen_number}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
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
                  <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                    {formatDateTime(b.booking_time)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
