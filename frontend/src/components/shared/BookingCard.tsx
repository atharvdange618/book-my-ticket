import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Clock, Seat, Television, XCircle } from "@phosphor-icons/react";
import { gooeyToast } from "@/components/ui/goey-toaster";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import type { Booking } from "../../types";
import { bookingsApi } from "../../api/bookings.api";
import {
  formatCurrency,
  formatDateTimeShort,
  getErrorMessage,
} from "@/lib/utils";

interface BookingCardProps {
  booking: Booking;
}

export function BookingCard({ booking }: BookingCardProps) {
  const [cancelOpen, setCancelOpen] = useState(false);
  const queryClient = useQueryClient();

  const { mutate: cancel, isPending } = useMutation({
    mutationFn: () => bookingsApi.cancel(booking.id),
    onSuccess: (data) => {
      gooeyToast.success(data.message, {
        description: `Refund amount: ${formatCurrency(data.refundAmount)}`,
      });
      queryClient.invalidateQueries({ queryKey: ["my-bookings"] });
      setCancelOpen(false);
    },
    onError: (err: unknown) => {
      gooeyToast.error(getErrorMessage(err, "Failed to cancel booking"));
    },
  });

  const seatLabels = booking.seats
    .map((s) => `${s.row_letter}${s.seat_number}`)
    .join(", ");

  return (
    <>
      <div className="border border-border/60 bg-card flex gap-0 overflow-hidden">
        <div className="w-20 shrink-0 bg-muted">
          {booking.movie.poster_url ? (
            <img
              src={booking.movie.poster_url}
              alt={booking.movie.title}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="h-full flex items-center justify-center text-muted-foreground/30 text-2xl">
              🎬
            </div>
          )}
        </div>

        <div className="flex-1 p-4 flex flex-col gap-2">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-heading font-semibold text-sm">
                {booking.movie.title}
              </h3>
              <p className="text-xs text-muted-foreground">
                {booking.movie.genre} · {booking.movie.duration}m ·{" "}
                {booking.movie.rating}
              </p>
            </div>
            <Badge
              variant={booking.status === "confirmed" ? "default" : "secondary"}
              className="shrink-0 text-xs capitalize"
            >
              {booking.status}
            </Badge>
          </div>

          <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock size={12} />
              {formatDateTimeShort(booking.show_time)}
            </span>
            <span className="flex items-center gap-1">
              <Television size={12} />
              Screen {booking.screen_number}
            </span>
            <span className="flex items-center gap-1">
              <Seat size={12} />
              {seatLabels}
            </span>
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-sm font-semibold text-primary">
              {formatCurrency(booking.total_price)}
            </span>
            {booking.status === "confirmed" && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCancelOpen(true)}
                className="text-destructive hover:text-destructive hover:bg-destructive/10 h-7 px-2 text-xs"
              >
                <XCircle size={13} className="mr-1" />
                Cancel
              </Button>
            )}
          </div>

          {booking.status === "cancelled" && booking.cancellation_time && (
            <p className="text-xs text-muted-foreground/60">
              Cancelled on {formatDateTimeShort(booking.cancellation_time)}
            </p>
          )}
        </div>
      </div>

      <Dialog open={cancelOpen} onOpenChange={setCancelOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel booking?</DialogTitle>
            <DialogDescription>
              Cancel your booking for <strong>{booking.movie.title}</strong> on{" "}
              {formatDateTimeShort(booking.show_time)}? This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCancelOpen(false)}
              disabled={isPending}
            >
              Keep it
            </Button>
            <Button
              variant="destructive"
              onClick={() => cancel()}
              disabled={isPending}
            >
              {isPending ? "Cancelling…" : "Yes, cancel"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
