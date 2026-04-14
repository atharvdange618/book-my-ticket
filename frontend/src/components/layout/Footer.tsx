import { FilmSlate } from "@phosphor-icons/react";

export function Footer() {
  return (
    <footer className="border-t border-border/60 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-muted-foreground">
          <div className="bg-primary/10 p-1">
            <FilmSlate size={14} weight="fill" className="text-primary" />
          </div>
          <span className="text-sm font-medium text-foreground">
            BookMyTicket
          </span>
          <span className="text-xs">- book seats, enjoy movies</span>
        </div>
      </div>
    </footer>
  );
}
