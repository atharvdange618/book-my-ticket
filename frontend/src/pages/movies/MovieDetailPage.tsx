import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  Clock,
  CalendarBlank,
  Television,
  Ticket,
  ArrowLeft,
} from "@phosphor-icons/react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { moviesApi } from "@/api/movies.api";
import { formatCurrency, formatDate, formatDateTime } from "@/lib/utils";

export default function MovieDetailPage() {
  const { id } = useParams<{ id: string }>();
  const movieId = Number(id);

  const { data: movie, isLoading: movieLoading } = useQuery({
    queryKey: ["movie", movieId],
    queryFn: () => moviesApi.getById(movieId),
    enabled: !!movieId,
  });

  const { data: shows, isLoading: showsLoading } = useQuery({
    queryKey: ["movie-shows", movieId],
    queryFn: () => moviesApi.getShows(movieId),
    enabled: !!movieId,
  });

  // Group shows by date
  const showsByDate = (shows ?? []).reduce(
    (acc, show) => {
      const date = new Date(show.show_time).toDateString();
      if (!acc[date]) acc[date] = [];
      acc[date].push(show);
      return acc;
    },
    {} as Record<string, typeof shows>,
  );

  if (movieLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="flex gap-8">
          <Skeleton className="w-56 aspect-[2/3] shrink-0" />
          <div className="flex-1 space-y-4 pt-2">
            <Skeleton className="h-8 w-2/3" />
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-20 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-20 text-center text-muted-foreground">
        Movie not found.
      </div>
    );
  }

  return (
    <div>
      {/* Hero */}
      <div className="border-b border-border/60 bg-card/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <Link
            to="/movies"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
          >
            <ArrowLeft size={14} />
            Back to movies
          </Link>

          <div className="flex flex-col sm:flex-row gap-8">
            {/* Poster */}
            <div className="w-44 sm:w-56 shrink-0">
              {movie.poster_url ? (
                <img
                  src={movie.poster_url}
                  alt={movie.title}
                  className="w-full aspect-[2/3] object-cover border border-border/60"
                />
              ) : (
                <div className="w-full aspect-[2/3] bg-muted border border-border/60 flex items-center justify-center text-4xl">
                  🎬
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="secondary">{movie.rating}</Badge>
                  <Badge variant="outline">{movie.genre}</Badge>
                </div>
                <h1 className="font-heading text-3xl sm:text-4xl font-bold">
                  {movie.title}
                </h1>
              </div>

              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Clock size={14} />
                  {movie.duration} minutes
                </span>
                <span className="text-primary font-semibold">
                  from {formatCurrency(movie.base_price)}
                </span>
              </div>

              <p className="text-muted-foreground leading-relaxed max-w-2xl">
                {movie.description}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Shows */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <h2 className="font-heading text-xl font-bold mb-6">Available Shows</h2>

        {showsLoading ? (
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i}>
                <Skeleton className="h-5 w-32 mb-3" />
                <div className="flex gap-3">
                  {[1, 2, 3].map((j) => (
                    <Skeleton key={j} className="h-16 w-32" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : Object.keys(showsByDate).length === 0 ? (
          <div className="py-16 text-center text-muted-foreground border border-dashed border-border/60">
            Currently no shows scheduled for this movie.
          </div>
        ) : (
          <div className="flex gap-6 overflow-x-auto pb-2">
            {Object.entries(showsByDate).map(([date, dateShows]) => (
              <div key={date} className="shrink-0">
                <div className="flex items-center gap-2 mb-3 text-sm text-muted-foreground">
                  <CalendarBlank size={14} />
                  {formatDate(dateShows![0].show_time)}
                </div>
                <div className="flex flex-col gap-3">
                  {dateShows!.map((show) => (
                    <Link key={show.id} to={`/shows/${show.id}`}>
                      <div className="border border-border/60 bg-card hover:border-primary/50 hover:bg-primary/5 transition-colors p-4 min-w-[9rem] group cursor-pointer">
                        <p className="text-sm font-semibold group-hover:text-primary transition-colors">
                          {formatDateTime(show.show_time)}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                          <Television size={11} />
                          Screen {show.screen_number}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {show.available_seats} seats left
                        </p>
                        <div className="mt-2">
                          <span className="text-xs text-primary flex items-center gap-1">
                            <Ticket size={11} />
                            Select seats
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
