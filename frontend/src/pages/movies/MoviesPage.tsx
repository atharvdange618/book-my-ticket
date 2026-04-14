import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { MagnifyingGlass, FunnelSimple } from "@phosphor-icons/react"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { MovieCard } from "@/components/shared/MovieCard"
import { moviesApi } from "@/api/movies.api"

const ALL_GENRES = "All"

export default function MoviesPage() {
  const [search, setSearch] = useState("")
  const [genre, setGenre] = useState(ALL_GENRES)

  const { data: movies, isLoading } = useQuery({
    queryKey: ["movies"],
    queryFn: moviesApi.getAll,
  })

  // Derive unique genres
  const genres = [ALL_GENRES, ...Array.from(new Set(movies?.map((m) => m.genre) ?? []))]

  const filtered = (movies ?? []).filter((m) => {
    const matchesSearch = m.title.toLowerCase().includes(search.toLowerCase())
    const matchesGenre = genre === ALL_GENRES || m.genre === genre
    return matchesSearch && matchesGenre
  })

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-heading text-2xl font-bold">All Movies</h1>
        <p className="text-muted-foreground text-sm mt-1">
          {movies ? `${movies.length} movies available` : "Loading…"}
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-8">
        <div className="relative flex-1 max-w-xs">
          <MagnifyingGlass
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search movies…"
            className="pl-9"
          />
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          <FunneySimpleIcon />
          {genres.map((g) => (
            <button
              key={g}
              onClick={() => setGenre(g)}
              className={`px-3 py-1 text-xs border transition-colors ${
                genre === g
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-border text-muted-foreground hover:text-foreground hover:border-border/80"
              }`}
            >
              {g}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="aspect-[2/3] w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-24 text-center text-muted-foreground">
          No movies match your search.
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filtered.map((movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      )}
    </div>
  )
}

// Inline small icon component
function FunneySimpleIcon() {
  return (
    <span className="text-muted-foreground flex items-center">
      <FunnelSimple size={15} />
    </span>
  )
}
