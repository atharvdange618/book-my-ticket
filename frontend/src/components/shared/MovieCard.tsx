import { Link } from "react-router-dom";
import { Clock, Star } from "@phosphor-icons/react";
import { Badge } from "../ui/badge";
import type { Movie } from "../../types";
import { formatCurrency } from "@/lib/utils";

interface MovieCardProps {
  movie: Movie;
}

export function MovieCard({ movie }: MovieCardProps) {
  return (
    <Link to={`/movies/${movie.id}`} className="group block">
      <div className="overflow-hidden border border-border/60 bg-card transition-colors hover:border-border">
        <div className="aspect-2/3 overflow-hidden bg-muted relative">
          {movie.poster_url ? (
            <img
              src={movie.poster_url}
              alt={movie.title}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground/30">
              <span className="text-5xl">🎬</span>
            </div>
          )}
          <div className="absolute top-2 left-2">
            <Badge variant="secondary" className="text-xs font-mono">
              {movie.rating}
            </Badge>
          </div>
        </div>

        <div className="p-3 space-y-1.5">
          <h3 className="font-heading font-semibold text-sm leading-tight line-clamp-1 group-hover:text-primary transition-colors">
            {movie.title}
          </h3>
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">{movie.genre}</span>
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock size={11} />
              {movie.duration}m
            </span>
          </div>
          <div className="flex items-center justify-between pt-0.5">
            <span className="text-xs font-medium text-primary">
              from {formatCurrency(movie.base_price)}
            </span>
            <span className="flex items-center gap-0.5 text-xs text-amber-500">
              <Star size={11} weight="fill" />
              {movie.rating}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
