import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Clock,
  Television,
  Ticket,
  ArrowLeft,
  FilmSlate,
  UserPlus,
  CheckCircle,
  CreditCard,
} from "@phosphor-icons/react";
import { gooeyToast } from "@/components/ui/goey-toaster";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SeatMap } from "@/components/shared/SeatMap";
import { showsApi } from "@/api/shows.api";
import { bookingsApi } from "@/api/bookings.api";
import { useAuthStore } from "@/stores/authStore";
import type { Seat } from "@/types";
import { formatCurrency, formatDateTime, getErrorMessage } from "@/lib/utils";

export default function SeatSelectionPage() {
  const { showId } = useParams<{ showId: string }>();
  const id = Number(showId);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const [selectedSeatIds, setSelectedSeatIds] = useState<number[]>([]);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [paymentStep, setPaymentStep] = useState<"processing" | "success">(
    "processing",
  );

  const { data: show, isLoading: showLoading } = useQuery({
    queryKey: ["show", id],
    queryFn: () => showsApi.getById(id),
    enabled: !!id,
  });

  const { data: seats, isLoading: seatsLoading } = useQuery({
    queryKey: ["show-seats", id],
    queryFn: () => showsApi.getSeats(id),
    enabled: !!id,
  });

  const { mutate: book, isPending } = useMutation({
    mutationFn: () =>
      bookingsApi.create({ seatIds: selectedSeatIds, showId: id }),
    onSuccess: (data) => {
      gooeyToast.success(data.message, {
        description: `Seats: ${data.seatLabels} • Total: ${formatCurrency(data.totalPrice)}`,
      });
      queryClient.invalidateQueries({ queryKey: ["my-bookings"] });
      queryClient.invalidateQueries({ queryKey: ["show-seats", id] });
      queryClient.invalidateQueries({ queryKey: ["show", id] });

      setTimeout(() => {
        setPaymentOpen(false);
        navigate("/bookings");
      }, 1500);
    },
    onError: (err: unknown) => {
      gooeyToast.error(getErrorMessage(err, "Booking failed"));
      setPaymentOpen(false);
      setPaymentStep("processing");
    },
  });

  const handleConfirmBooking = () => {
    setConfirmOpen(false);
    setPaymentOpen(true);
    setPaymentStep("processing");

    setTimeout(() => {
      setPaymentStep("success");
      setTimeout(() => {
        book();
      }, 800);
    }, 2000);
  };

  const toggleSeat = (seatId: number) => {
    setSelectedSeatIds((prev) =>
      prev.includes(seatId)
        ? prev.filter((id) => id !== seatId)
        : [...prev, seatId],
    );
  };

  const totalPrice = selectedSeatIds.reduce((total, seatId) => {
    const seat = seats?.find((s) => s.id === seatId);
    if (!seat || !show?.base_price) return total;
    return (
      total + parseFloat(show.base_price) * parseFloat(seat.price_multiplier)
    );
  }, 0);

  const selectedSeats: Seat[] = (seats ?? []).filter((s) =>
    selectedSeatIds.includes(s.id),
  );

  const isLoading = showLoading || seatsLoading;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <Link
        to={show?.movie_id ? `/movies/${show.movie_id}` : "/movies"}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
      >
        <ArrowLeft size={14} />
        Back to movie
      </Link>

      {isLoading ? (
        <div className="space-y-6">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-64 w-full" />
        </div>
      ) : !show ? (
        <div className="py-20 text-center text-muted-foreground">
          Show not found.
        </div>
      ) : (
        <div className="grid lg:grid-cols-[1fr_20rem] gap-8">
          {/* Left: Seat map */}
          <div>
            {/* Show info header */}
            <div className="border border-border/60 bg-card p-4 mb-6 flex gap-4 items-start">
              {show.poster_url && (
                <img
                  src={show.poster_url}
                  alt={show.title}
                  className="w-12 aspect-2/3 object-cover shrink-0"
                />
              )}
              <div className="space-y-1">
                <h1 className="font-heading font-bold text-lg">{show.title}</h1>
                <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock size={12} />
                    {formatDateTime(show.show_time)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Television size={12} />
                    Screen {show.screen_number}
                  </span>
                  <span className="flex items-center gap-1">
                    <FilmSlate size={12} />
                    {show.genre} · {show.duration}m · {show.rating}
                  </span>
                </div>
              </div>
            </div>

            <div className="border border-border/60 bg-card p-6">
              <h2 className="font-heading font-semibold text-sm mb-6 text-muted-foreground uppercase tracking-wider">
                Select Your Seats
              </h2>
              {seats && (
                <SeatMap
                  seats={seats}
                  selectedSeatIds={selectedSeatIds}
                  onSeatToggle={toggleSeat}
                  basePrice={
                    show?.base_price ? parseFloat(show.base_price) : 300
                  }
                />
              )}
            </div>
          </div>

          {/* Right: Summary */}
          <div className="lg:sticky lg:top-20 h-fit">
            <div className="border border-border/60 bg-card p-5 space-y-4">
              <h2 className="font-heading font-semibold text-sm uppercase tracking-wider text-muted-foreground">
                Booking Summary
              </h2>

              {selectedSeats.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">
                  Select seats on the map to continue
                </p>
              ) : (
                <>
                  <div className="space-y-2">
                    {selectedSeats.map((seat) => (
                      <div
                        key={seat.id}
                        className="flex items-center justify-between text-sm"
                      >
                        <span className="font-mono">
                          {seat.row_letter}
                          {seat.seat_number}
                          <span className="text-xs text-muted-foreground ml-1.5 capitalize">
                            ({seat.seat_type})
                          </span>
                        </span>
                        <span>
                          {formatCurrency(
                            parseFloat(show.base_price ?? "0") *
                              parseFloat(seat.price_multiplier),
                          )}
                        </span>
                      </div>
                    ))}
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between font-semibold">
                    <span>Total</span>
                    <span className="text-primary text-lg">
                      {formatCurrency(totalPrice.toFixed(0))}
                    </span>
                  </div>
                </>
              )}

              {!user ? (
                <Link
                  to="/login"
                  state={{ from: { pathname: `/shows/${id}` } }}
                >
                  <Button className="w-full gap-2">
                    <Ticket size={16} />
                    Sign in to book
                  </Button>
                </Link>
              ) : user.role === "admin" ? (
                <div className="space-y-3">
                  <p className="text-xs text-center text-muted-foreground">
                    Admin accounts cannot book tickets
                  </p>
                  <Link to="/register">
                    <Button className="w-full gap-2" variant="outline">
                      <UserPlus size={16} />
                      Create User Account
                    </Button>
                  </Link>
                </div>
              ) : (
                <Button
                  className="w-full gap-2"
                  disabled={selectedSeatIds.length === 0 || isPending}
                  onClick={() => setConfirmOpen(true)}
                >
                  <Ticket size={16} />
                  {isPending
                    ? "Booking…"
                    : `Confirm ${selectedSeatIds.length} seat${selectedSeatIds.length !== 1 ? "s" : ""}`}
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Dialog */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Ticket size={20} />
              Confirm Booking
            </DialogTitle>
            <DialogDescription>
              Please review your booking details before proceeding to payment
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Movie Info */}
            <div className="flex gap-3">
              {show?.poster_url && (
                <img
                  src={show.poster_url}
                  alt={show.title}
                  className="w-16 aspect-2/3 object-cover rounded"
                />
              )}
              <div className="space-y-1">
                <h3 className="font-semibold">{show?.title}</h3>
                <p className="text-xs text-muted-foreground">
                  {show?.genre} · {show?.duration}m · {show?.rating}
                </p>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock size={12} />
                  {show?.show_time && formatDateTime(show.show_time)}
                </p>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Television size={12} />
                  Screen {show?.screen_number}
                </p>
              </div>
            </div>

            <Separator />

            {/* Seats */}
            <div className="space-y-2">
              <p className="text-sm font-medium">Selected Seats</p>
              {selectedSeats.map((seat) => (
                <div
                  key={seat.id}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="font-mono">
                    {seat.row_letter}
                    {seat.seat_number}
                    <span className="text-xs text-muted-foreground ml-1.5 capitalize">
                      ({seat.seat_type})
                    </span>
                  </span>
                  <span>
                    {formatCurrency(
                      parseFloat(show?.base_price ?? "0") *
                        parseFloat(seat.price_multiplier),
                    )}
                  </span>
                </div>
              ))}
            </div>

            <Separator />

            {/* Total */}
            <div className="flex items-center justify-between font-semibold text-lg">
              <span>Total Amount</span>
              <span className="text-primary">
                {formatCurrency(totalPrice.toFixed(0))}
              </span>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setConfirmOpen(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button onClick={handleConfirmBooking} className="flex-1 gap-2">
              <CreditCard size={16} />
              Proceed to Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Payment Processing Modal */}
      <Dialog open={paymentOpen} onOpenChange={() => {}}>
        <DialogContent
          className="sm:max-w-md"
          onPointerDownOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}
        >
          <div className="py-8">
            {paymentStep === "processing" ? (
              <div className="flex flex-col items-center gap-6">
                <div className="relative">
                  <div className="w-20 h-20 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
                  <CreditCard
                    size={32}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-primary"
                  />
                </div>
                <div className="text-center space-y-2">
                  <h3 className="font-semibold text-lg">Processing Payment</h3>
                  <p className="text-sm text-muted-foreground">
                    Please wait while we process your payment...
                  </p>
                  <p className="text-xs text-muted-foreground font-mono">
                    Amount: {formatCurrency(totalPrice.toFixed(0))}
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-6">
                <div className="relative">
                  <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center animate-in zoom-in duration-300">
                    <CheckCircle
                      size={48}
                      weight="fill"
                      className="text-green-500"
                    />
                  </div>
                </div>
                <div className="text-center space-y-2">
                  <h3 className="font-semibold text-lg text-green-500">
                    Payment Successful!
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Your booking is being confirmed...
                  </p>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
