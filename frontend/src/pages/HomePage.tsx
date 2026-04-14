import { Link } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { ArrowRight, FilmStrip, Ticket } from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { MovieCard } from "@/components/shared/MovieCard"
import { moviesApi } from "@/api/movies.api"
import { useAuthStore } from "@/stores/authStore"

export default function HomePage() {
  const { user } = useAuthStore()
  const { data: movies, isLoading } = useQuery({
    queryKey: ["movies"],
    queryFn: moviesApi.getAll,
  })

  const featured = movies?.slice(0, 8) ?? []

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border/60">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,_var(--primary)/12%,_transparent)]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-20 sm:py-28 relative">
          <div className="max-w-2xl space-y-6">
            <div className="inline-flex items-center gap-2 border border-primary/30 bg-primary/5 px-3 py-1 text-xs text-primary">
              <FilmStrip size={13} weight="fill" />
              Now showing in your city
            </div>
            <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.05] tracking-tight">
              Book your perfect
              <br />
              <span className="text-primary">cinema seat.</span>
            </h1>
            <p className="text-muted-foreground text-lg max-w-lg">
              Browse now-showing films, pick your seats on an interactive map, and confirm your
              booking in seconds.
            </p>
            <div className="flex items-center gap-3">
              <Link to="/movies">
                <Button size="lg" className="gap-2">
                  Browse movies
                  <ArrowRight size={16} />
                </Button>
              </Link>
              {!user && (
                <Link to="/register">
                  <Button size="lg" variant="outline" className="gap-2">
                    <Ticket size={16} />
                    Get started
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Now showing */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-heading text-xl font-bold">Now Showing</h2>
            <p className="text-muted-foreground text-sm mt-0.5">Select a movie to see available shows</p>
          </div>
          <Link to="/movies">
            <Button variant="ghost" size="sm" className="gap-1 text-sm text-muted-foreground">
              View all
              <ArrowRight size={14} />
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="aspect-[2/3] w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            ))}
          </div>
        ) : featured.length === 0 ? (
          <div className="py-20 text-center text-muted-foreground">No movies available yet.</div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {featured.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
