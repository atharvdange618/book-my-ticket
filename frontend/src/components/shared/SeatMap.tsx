import type { Seat } from "../../types";
import { cn, formatCurrency } from "../../lib/utils";

interface SeatMapProps {
  seats: Seat[];
  selectedSeatIds: number[];
  onSeatToggle: (seatId: number) => void;
  basePrice?: number;
}

interface SeatSection {
  name: string;
  rows: string[];
  priceMultiplier: number;
}

function getSeatClasses(seat: Seat, isSelected: boolean): string {
  if (seat.isbooked) {
    return "bg-purple-500/15 text-purple-600 dark:text-purple-400 cursor-not-allowed border-purple-500/40";
  }
  if (isSelected) {
    return "bg-primary text-primary-foreground border-primary cursor-pointer";
  }
  switch (seat.seat_type) {
    case "vip":
      return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/40 hover:bg-amber-500/20 hover:border-amber-500/60 cursor-pointer";
    case "wheelchair":
      return "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/40 hover:bg-blue-500/20 hover:border-blue-500/60 cursor-pointer";
    default:
      return "bg-card text-foreground border-border hover:bg-muted hover:border-border/80 cursor-pointer";
  }
}

function groupByRow(seats: Seat[]): Record<string, Seat[]> {
  return seats.reduce(
    (acc, seat) => {
      const row = seat.row_letter;
      if (!acc[row]) acc[row] = [];
      acc[row].push(seat);
      acc[row].sort((a, b) => a.seat_number - b.seat_number);
      return acc;
    },
    {} as Record<string, Seat[]>,
  );
}

function detectSections(seats: Seat[]): SeatSection[] {
  const rows = groupByRow(seats);
  const rowLetters = Object.keys(rows).sort(
    (a, b) => b.charCodeAt(0) - a.charCodeAt(0),
  );

  const sections: SeatSection[] = [];
  let currentSection: SeatSection | null = null;

  rowLetters.forEach((rowLetter) => {
    const rowSeats = rows[rowLetter];
    const dominantType = rowSeats[0]?.seat_type || "regular";
    const multiplier = parseFloat(rowSeats[0]?.price_multiplier || "1.00");

    if (
      !currentSection ||
      currentSection.priceMultiplier !== multiplier ||
      (dominantType === "vip" && !rowSeats.every((s) => s.seat_type === "vip"))
    ) {
      currentSection = {
        name: dominantType === "vip" ? "Premium" : "Regular",
        rows: [rowLetter],
        priceMultiplier: multiplier,
      };
      sections.push(currentSection);
    } else {
      currentSection.rows.push(rowLetter);
    }
  });

  return sections;
}

export function SeatMap({
  seats,
  selectedSeatIds,
  onSeatToggle,
  basePrice = 300,
}: SeatMapProps) {
  const rows = groupByRow(seats);
  const sections = detectSections(seats);

  return (
    <div className="space-y-4">
      <div className="flex flex-col items-center gap-1 mb-6">
        <div className="w-3/4 h-1.25 bg-linear-to-r from-transparent via-primary/60 to-transparent rounded-full" />
        <span className="text-xs text-muted-foreground tracking-[0.2em] uppercase">
          Screen
        </span>
      </div>

      <div className="space-y-6">
        {sections.map((section, sectionIdx) => {
          const sectionPrice = Math.round(basePrice * section.priceMultiplier);
          return (
            <div key={sectionIdx} className="space-y-3">
              <div className="text-center py-2 border-y border-border/40 bg-muted/30">
                <h3 className="text-sm font-semibold text-foreground tracking-wide">
                  {formatCurrency(sectionPrice)} {section.name.toUpperCase()}
                </h3>
              </div>

              <div className="flex flex-col gap-2 items-center">
                {section.rows.map((rowLetter) => (
                  <div key={rowLetter} className="flex items-center gap-2">
                    <span className="w-5 text-xs font-mono text-muted-foreground shrink-0">
                      {rowLetter}
                    </span>
                    <div className="flex gap-1.5 flex-wrap">
                      {rows[rowLetter].map((seat) => {
                        const isSelected = selectedSeatIds.includes(seat.id);
                        return (
                          <button
                            key={seat.id}
                            onClick={() =>
                              !seat.isbooked && onSeatToggle(seat.id)
                            }
                            disabled={seat.isbooked}
                            title={`${rowLetter}${seat.seat_number} - ${seat.seat_type}${seat.isbooked ? " (booked)" : ""}`}
                            className={cn(
                              "w-8 h-8 border-4 text-xs font-mono font-medium transition-all duration-150 shrink-0 rounded-sm",
                              getSeatClasses(seat, isSelected),
                            )}
                          >
                            {seat.seat_number}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex flex-wrap gap-4 pt-4 border-t border-border/40">
        <LegendItem color="bg-card border border-border" label="Regular" />
        <LegendItem
          color="bg-amber-500/10 border border-amber-500/40"
          label="VIP"
        />
        <LegendItem
          color="bg-blue-500/10 border border-blue-500/40"
          label="Wheelchair"
        />
        <LegendItem color="bg-primary border border-primary" label="Selected" />
        <LegendItem
          color="bg-purple-500/15 border border-purple-500/40"
          label="Booked"
        />
      </div>
    </div>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className={cn("w-4 h-4 shrink-0", color)} />
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  );
}
