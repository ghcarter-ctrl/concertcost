"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Music2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { ThemeSelector } from "@/components/ThemeSelector";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    const supabase = createClient();

    if (mode === "signup") {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (signUpError) {
        setError(signUpError.message);
        setLoading(false);
        return;
      }

      if (data.session) {
        router.push("/dashboard");
        router.refresh();
        return;
      }

      setMessage(
        "Account created! Check your email to confirm, then log in. For easier local testing, you can turn off email confirmation in Supabase Auth settings."
      );
      setMode("login");
      setLoading(false);
      return;
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError(signInError.message);
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-base-200">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_oklch(var(--p)/0.25),_transparent_55%),radial-gradient(ellipse_at_bottom_right,_oklch(var(--s)/0.2),_transparent_45%),linear-gradient(160deg,_oklch(var(--b2)),_oklch(var(--b3)))]" />
      <div className="absolute inset-0 opacity-[0.07] [background-image:radial-gradient(circle_at_1px_1px,_currentColor_1px,_transparent_0)] [background-size:22px_22px]" />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-6xl flex-col px-4 py-6 sm:px-6">
        <div className="mb-8 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-base-content/80">
            <Music2 className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium tracking-wide">Live music, tracked</span>
          </div>
          <ThemeSelector />
        </div>

        <div className="flex flex-1 flex-col items-center justify-center gap-10 pb-12 lg:flex-row lg:items-center lg:gap-16">
          <div className="max-w-xl text-center lg:text-left">
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-primary">
              Your shows. Your spend. Your fun.
            </p>
            <h1 className="font-display text-4xl font-extrabold leading-tight tracking-tight text-base-content sm:text-5xl lg:text-6xl">
              Concert Cost Tracker
            </h1>
            <p className="mt-4 text-lg text-base-content/75 sm:text-xl">
              Log every ticket, taco, and T-shirt — then see which shows gave you the best night
              for your money.
            </p>
          </div>

          <div className="card w-full max-w-md border border-base-300/60 bg-base-100/95 shadow-xl backdrop-blur">
            <div className="card-body">
              <div className="tabs tabs-box mb-2 w-full">
                <button
                  type="button"
                  className={`tab flex-1 ${mode === "login" ? "tab-active" : ""}`}
                  onClick={() => {
                    setMode("login");
                    setError(null);
                    setMessage(null);
                  }}
                >
                  Log in
                </button>
                <button
                  type="button"
                  className={`tab flex-1 ${mode === "signup" ? "tab-active" : ""}`}
                  onClick={() => {
                    setMode("signup");
                    setError(null);
                    setMessage(null);
                  }}
                >
                  Sign up
                </button>
              </div>

              <p className="mb-4 text-sm text-base-content/65">
                {mode === "login"
                  ? "Welcome back — ready to check your concert spending?"
                  : "Create a free account to start tracking your concerts."}
              </p>

              {error ? (
                <div className="alert alert-error mb-3 py-2 text-sm">
                  <span>{error}</span>
                </div>
              ) : null}
              {message ? (
                <div className="alert alert-success mb-3 py-2 text-sm">
                  <span>{message}</span>
                </div>
              ) : null}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-[5.5rem_1fr] items-center gap-3">
                  <label htmlFor="email" className="text-sm font-medium">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    autoComplete="email"
                    className="input input-bordered w-full"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                  />

                  <label htmlFor="password" className="text-sm font-medium">
                    Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    required
                    minLength={6}
                    autoComplete={mode === "login" ? "current-password" : "new-password"}
                    className="input input-bordered w-full"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 6 characters"
                  />
                </div>

                <button type="submit" className="btn btn-primary w-full" disabled={loading}>
                  {loading ? (
                    <>
                      <span className="loading loading-spinner loading-sm" />
                      Please wait…
                    </>
                  ) : mode === "login" ? (
                    "Log in"
                  ) : (
                    "Create account"
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
