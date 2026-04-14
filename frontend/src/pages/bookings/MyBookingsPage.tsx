import { useQuery } from "@tanstack/react-query";
import { Ticket, UserPlus } from "@phosphor-icons/react";
import { Link } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { BookingCard } from "@/components/shared/BookingCard";
import { bookingsApi } from "@/api/bookings.api";
import { useAuthStore } from "@/stores/authStore";
import type { Booking } from "@/types";

export default function MyBookingsPage() {
  const { user } = useAuthStore();

  const { data: bookingsData, isLoading } = useQuery({
    queryKey: ["my-bookings"],
    queryFn: bookingsApi.getMine,
  });

  const bookings = bookingsData?.sort(
    (a, b) => new Date(a.show_time).getTime() - new Date(b.show_time).getTime(),
  );

  if (user?.role === "admin") {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        <div className="mb-8">
          <h1 className="font-heading text-2xl font-bold flex items-center gap-2">
            <Ticket size={22} />
            My Bookings
          </h1>
        </div>
        <div className="py-20 text-center border border-dashed border-border/60">
          <UserPlus
            size={36}
            className="text-muted-foreground/30 mx-auto mb-3"
          />
          <p className="text-lg font-medium mb-2">
            Admin accounts cannot book tickets
          </p>
          <p className="text-sm text-muted-foreground mb-4">
            Please create a regular user account to book movie tickets.
          </p>
          <Link to="/register">
            <Button size="sm" className="gap-2">
              <UserPlus size={16} />
              Create User Account
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const confirmed = (bookings ?? []).filter((b) => b.status === "confirmed");
  const cancelled = (bookings ?? []).filter((b) => b.status === "cancelled");

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-8">
        <h1 className="font-heading text-2xl font-bold flex items-center gap-2">
          <Ticket size={22} />
          My Bookings
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {bookings ? `${bookings.length} total bookings` : "Loading…"}
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-4 border border-border/60 p-4">
              <Skeleton className="w-20 h-28 shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-3 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
          ))}
        </div>
      ) : !bookings || bookings.length === 0 ? (
        <div className="py-20 text-center border border-dashed border-border/60">
          <Ticket size={36} className="text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground">No bookings yet.</p>
          <p className="text-sm text-muted-foreground/60 mt-1">
            Browse movies and book your first seat!
          </p>
        </div>
      ) : (
        <Tabs defaultValue="confirmed">
          <TabsList className="mb-6">
            <TabsTrigger value="confirmed" className="gap-2">
              Confirmed
              {confirmed.length > 0 && (
                <span className="bg-primary/15 text-primary text-xs px-1.5 py-0.5 font-mono">
                  {confirmed.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="cancelled" className="gap-2">
              Cancelled
              {cancelled.length > 0 && (
                <span className="bg-muted text-muted-foreground text-xs px-1.5 py-0.5 font-mono">
                  {cancelled.length}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="confirmed" className="space-y-3">
            {confirmed.length === 0 ? (
              <p className="text-muted-foreground text-sm py-8 text-center">
                No confirmed bookings.
              </p>
            ) : (
              confirmed.map((b: Booking) => (
                <BookingCard key={b.id} booking={b} />
              ))
            )}
          </TabsContent>
          <TabsContent value="cancelled" className="space-y-3">
            {cancelled.length === 0 ? (
              <p className="text-muted-foreground text-sm py-8 text-center">
                No cancelled bookings.
              </p>
            ) : (
              cancelled.map((b: Booking) => (
                <BookingCard key={b.id} booking={b} />
              ))
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
