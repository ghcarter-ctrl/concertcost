"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Music2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { ThemeSelector } from "@/components/ThemeSelector";
import { ToastProvider, useToast } from "@/components/Toast";
import { friendlyAuthError } from "@/lib/errors";
import { primaryBtnClass } from "@/lib/ui";

function LoginForm() {
  const router = useRouter();
  const { showToast } = useToast();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const fromVerify = params.get("message");
    if (fromVerify) {
      setMessage(fromVerify);
      setMode("login");
    }
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    const supabase = createClient();

    if (mode === "signup") {
      try {
        const res = await fetch("/api/auth/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });

        const payload = (await res.json()) as {
          error?: string;
          ok?: boolean;
          hasSession?: boolean;
          access_token?: string;
          refresh_token?: string;
          message?: string;
        };

        if (!res.ok) {
          const msg = friendlyAuthError(payload.error ?? "Signup failed.");
          setError(msg);
          showToast(msg, "error");
          setLoading(false);
          return;
        }

        if (payload.hasSession && payload.access_token && payload.refresh_token) {
          const { error: sessionError } = await supabase.auth.setSession({
            access_token: payload.access_token,
            refresh_token: payload.refresh_token,
          });
          if (sessionError) {
            const msg = friendlyAuthError(sessionError.message);
            setError(msg);
            showToast(msg, "error");
            setLoading(false);
            return;
          }
          showToast("Welcome! You’re signed in.", "success");
          router.push("/dashboard");
          router.refresh();
          return;
        }

        // Try logging in anyway — works once Confirm email is off / user is confirmed.
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (!signInError) {
          showToast("Welcome! You’re signed in.", "success");
          router.push("/dashboard");
          router.refresh();
          return;
        }

        const successMsg =
          payload.message ??
          "Account created. Turn Confirm email OFF in Supabase, then log in with the same email and password.";
        setMessage(successMsg);
        showToast(successMsg, "error");
        setMode("login");
        setLoading(false);
        return;
      } catch {
        setError(
          "Signup timed out or failed. In Supabase turn Confirm email OFF, then try Log in."
        );
        showToast("Signup failed — try Log in after disabling Confirm email.", "error");
        setLoading(false);
        return;
      }
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      const msg = friendlyAuthError(signInError.message);
      setError(msg);
      showToast(msg, "error");
      setLoading(false);
      return;
    }

    showToast("Welcome back!", "success");
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-base-200">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,color-mix(in_oklch,var(--color-primary)_25%,transparent),transparent_55%),radial-gradient(ellipse_at_bottom_right,color-mix(in_oklch,var(--color-secondary)_20%,transparent),transparent_45%),linear-gradient(160deg,var(--color-base-200),var(--color-base-300))]" />
      <div className="absolute inset-0 opacity-[0.07] [background-image:radial-gradient(circle_at_1px_1px,_currentColor_1px,_transparent_0)] [background-size:22px_22px]" />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-6xl flex-col px-4 py-6 sm:px-6">
        <div className="mb-8 flex items-center justify-between gap-3 animate-fade-in">
          <div className="flex items-center gap-2 text-base-content/80">
            <Music2 className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium tracking-wide">Live music, tracked</span>
          </div>
          <ThemeSelector />
        </div>

        <div className="flex flex-1 flex-col items-center justify-center gap-10 pb-12 lg:flex-row lg:items-center lg:gap-16">
          <div className="max-w-xl text-center animate-fade-up lg:text-left">
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-base-content/80">
              <span className="text-primary">●</span> Your shows. Your spend. Your fun.
            </p>
            <h1 className="font-display text-4xl font-extrabold leading-tight tracking-tight text-base-content sm:text-5xl lg:text-6xl">
              Concert Cost Tracker
            </h1>
            <p className="mt-4 text-lg text-base-content/85 sm:text-xl">
              Log every ticket, taco, and T-shirt — then see which shows gave you the best night
              for your money.
            </p>
          </div>

          <div className="card w-full max-w-md border border-base-300/60 bg-base-100/95 shadow-xl backdrop-blur animate-fade-up stagger-2">
            <div className="card-body">
              <div className="tabs tabs-box mb-2 w-full">
                <button
                  type="button"
                  className={`tab flex-1 transition-all ${mode === "login" ? "tab-active" : ""}`}
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
                  className={`tab flex-1 transition-all ${mode === "signup" ? "tab-active" : ""}`}
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
                  : "Create an account with your email and password to start tracking concerts."}
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
                <div className="grid grid-cols-1 items-center gap-3 sm:grid-cols-[5.5rem_1fr]">
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

                <button
                  type="submit"
                  className={`${primaryBtnClass} w-full`}
                  disabled={loading}
                >
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

export default function LoginPage() {
  return (
    <ToastProvider>
      <LoginForm />
    </ToastProvider>
  );
}
