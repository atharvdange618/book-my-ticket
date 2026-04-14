import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, CalendarBlank, Television } from "@phosphor-icons/react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { Resolver } from "react-hook-form";
import { gooeyToast } from "@/components/ui/goey-toaster";
import { DateTimePicker } from "@/components/ui/datetime-picker";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { moviesApi } from "@/api/movies.api";
import { showsApi } from "@/api/shows.api";
import { formatDateTime, getErrorMessage } from "@/lib/utils";

const schema = z.object({
  movieId: z.coerce.number().min(1, "Select a movie"),
  showTime: z.date({ message: "Show time is required" }),
  screenNumber: z.coerce.number().min(1).max(20),
});

type FormValues = z.infer<typeof schema>;

export default function AdminShowsPage() {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: movies } = useQuery({
    queryKey: ["movies"],
    queryFn: moviesApi.getAll,
  });

  const { data: allShows, isLoading } = useQuery({
    queryKey: ["all-shows"],
    queryFn: async () => {
      if (!movies || movies.length === 0) return [];
      const results = await Promise.all(
        movies.map((m) => moviesApi.getShows(m.id)),
      );
      return results
        .flat()
        .map((show) => ({
          ...show,
          movieTitle:
            movies.find((m) => m.id === show.movie_id)?.title ?? "Unknown",
        }))
        .sort(
          (a, b) =>
            new Date(a.show_time).getTime() - new Date(b.show_time).getTime(),
        );
    },
    enabled: !!movies,
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(schema) as Resolver<FormValues>,
    defaultValues: {
      movieId: 0,
      showTime: undefined,
      screenNumber: 1,
    },
  });

  const { mutate: create, isPending } = useMutation({
    mutationFn: (v: FormValues) => {
      const year = v.showTime.getFullYear();
      const month = String(v.showTime.getMonth() + 1).padStart(2, "0");
      const day = String(v.showTime.getDate()).padStart(2, "0");
      const hours = String(v.showTime.getHours()).padStart(2, "0");
      const minutes = String(v.showTime.getMinutes()).padStart(2, "0");
      const formattedDateTime = `${year}-${month}-${day} ${hours}:${minutes}:00`;

      return showsApi.create({
        movieId: v.movieId,
        showTime: formattedDateTime,
        screenNumber: v.screenNumber,
      });
    },
    onSuccess: (data) => {
      const movie = movies?.find((m) => m.id === data.show.movie_id);
      gooeyToast.success(data.message, {
        description: movie
          ? `${movie.title} • Screen ${data.show.screen_number} • ${formatDateTime(data.show.show_time)}`
          : `Screen ${data.show.screen_number}`,
      });
      queryClient.invalidateQueries({ queryKey: ["all-shows"] });
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
      form.reset();
      setOpen(false);
    },
    onError: (err: unknown) => {
      gooeyToast.error(getErrorMessage(err, "Failed to schedule show"));
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-xl font-bold">Shows</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {allShows ? `${allShows.length} shows` : "Loading…"}
          </p>
        </div>
        <Button onClick={() => setOpen(true)} className="gap-2">
          <Plus size={16} />
          Schedule show
        </Button>
      </div>

      <div className="border border-border/60 overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Movie</TableHead>
              <TableHead>Show Time</TableHead>
              <TableHead>Screen</TableHead>
              <TableHead>Available Seats</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading || !allShows ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 4 }).map((_, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : allShows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="text-center text-muted-foreground py-10"
                >
                  No shows scheduled yet.
                </TableCell>
              </TableRow>
            ) : (
              allShows.map((show) => (
                <TableRow key={show.id}>
                  <TableCell className="font-medium text-sm">
                    {(show as typeof show & { movieTitle: string }).movieTitle}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <CalendarBlank size={12} />
                      {formatDateTime(show.show_time)}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm">
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <Television size={12} />
                      Screen {show.screen_number}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm">
                    {show.available_seats}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Schedule Show</DialogTitle>
          </DialogHeader>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit((v) => create(v))}
              className="space-y-4"
            >
              <FormField
                control={form.control}
                name="movieId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Movie</FormLabel>
                    <Select
                      onValueChange={(v) => field.onChange(Number(v))}
                      value={field.value ? String(field.value) : ""}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a movie" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {(movies ?? []).map((m) => (
                          <SelectItem key={m.id} value={String(m.id)}>
                            {m.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Controller
                control={form.control}
                name="showTime"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel>Show Date & Time</FormLabel>
                    <FormControl>
                      <DateTimePicker
                        date={field.value}
                        onDateChange={field.onChange}
                        placeholder="Select show date and time"
                      />
                    </FormControl>
                    {fieldState.error && (
                      <p className="text-sm text-destructive">
                        {fieldState.error.message}
                      </p>
                    )}
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="screenNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Screen Number</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        max={20}
                        placeholder="1"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                  disabled={isPending}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isPending}>
                  {isPending ? "Scheduling…" : "Schedule show"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
