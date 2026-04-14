import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { gooeyToast } from "@/components/ui/goey-toaster";
import { Eye, EyeSlash } from "@phosphor-icons/react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { authApi } from "@/api/auth.api";
import { useAuthStore } from "@/stores/authStore";
import { getErrorMessage } from "@/lib/utils";

const schema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type FormValues = z.infer<typeof schema>;

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const from =
    (location.state as { from?: { pathname: string } })?.from?.pathname ?? "/";

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
  });

  const { mutate, isPending } = useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      login(data.user, data.token);
      gooeyToast.success(data.message, {
        description: `Welcome back, ${data.user.name}!`,
      });
      const destination = data.user.role === "admin" ? "/admin" : from;
      navigate(destination, { replace: true });
    },
    onError: (err: unknown) => {
      gooeyToast.error(getErrorMessage(err, "Login failed"));
    },
  });

  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex">
      <div className="hidden lg:flex flex-col justify-between w-1/2 bg-card border-r border-border/60 p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--primary)/8%,_transparent_60%)]" />
        <div className="flex items-center gap-2 z-10"></div>
        <div className="z-10 space-y-4">
          <blockquote className="font-heading text-3xl font-bold leading-tight">
            "The magic of movies starts with a single ticket."
          </blockquote>
          <p className="text-muted-foreground text-sm">
            Sign in to book your next show.
          </p>
        </div>
        <p className="text-xs text-muted-foreground/40 z-10">
          © {new Date().getFullYear()} BookMyTicket
        </p>
      </div>

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm space-y-6">
          <div>
            <h1 className="font-heading text-2xl font-bold">Sign in</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="text-primary hover:underline underline-offset-4"
              >
                Create one
              </Link>
            </p>
          </div>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit((v) => mutate(v))}
              className="space-y-4"
            >
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="you@example.com"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          {...field}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword((v) => !v)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showPassword ? (
                            <EyeSlash size={15} />
                          ) : (
                            <Eye size={15} />
                          )}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full" disabled={isPending}>
                {isPending ? "Signing in…" : "Sign in"}
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}
