import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

/**
 * Server-side signup with a hard timeout so the UI never spins forever
 * when Supabase email confirmation is stuck.
 */
export async function POST(request: Request) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    return NextResponse.json(
      { error: "Server is missing Supabase environment variables." },
      { status: 500 }
    );
  }

  let email = "";
  let password = "";
  try {
    const body = (await request.json()) as { email?: string; password?: string };
    email = (body.email ?? "").trim();
    password = body.password ?? "";
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  if (!email || !password || password.length < 6) {
    return NextResponse.json(
      { error: "Enter an email and a password with at least 6 characters." },
      { status: 400 }
    );
  }

  const origin = request.headers.get("origin") ?? undefined;
  const supabase = createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const signupCall = supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: origin ? `${origin}/auth/callback` : undefined,
    },
  });

  const timeout = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error("TIMEOUT")), 10000);
  });

  try {
    const { data, error } = await Promise.race([signupCall, timeout]);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Immediate session = Confirm email is off (best case).
    if (data.session) {
      return NextResponse.json({
        ok: true,
        hasSession: true,
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
      });
    }

    // User row may exist even when email never arrives.
    return NextResponse.json({
      ok: true,
      hasSession: false,
      message:
        "Account created, but email verification is blocking login. Turn Confirm email OFF in Supabase (Authentication → Providers → Email), then log in.",
    });
  } catch (err) {
    if (err instanceof Error && err.message === "TIMEOUT") {
      return NextResponse.json(
        {
          error:
            "Signup timed out waiting on Supabase email. Turn Confirm email OFF in Supabase: Authentication → Providers → Email → Confirm email OFF → Save. Then try Log in.",
        },
        { status: 504 }
      );
    }
    return NextResponse.json(
      { error: "Signup failed. Please try again." },
      { status: 500 }
    );
  }
}
