/** Map common Supabase/auth errors into plain English. */

export function friendlyAuthError(message: string): string {
  const m = message.toLowerCase();

  if (m.includes("rate limit") || m.includes("email rate")) {
    return "Too many signup attempts. Wait a few minutes, then try again.";
  }
  if (m.includes("invalid login") || m.includes("invalid credentials")) {
    return "That email or password doesn’t match. Try again.";
  }
  if (m.includes("user already registered") || m.includes("already been registered")) {
    return "An account with that email already exists. Try logging in.";
  }
  if (m.includes("email address") && m.includes("invalid")) {
    return "Please use a real email address (some test domains are blocked).";
  }
  if (m.includes("password") && (m.includes("least") || m.includes("short"))) {
    return "Use a password with at least 6 characters.";
  }
  if (m.includes("email not confirmed")) {
    return "Please confirm your email first, then log in.";
  }

  return message;
}

export function friendlySaveError(message: string): string {
  const m = message.toLowerCase();
  if (m.includes("jwt") || m.includes("auth") || m.includes("not authenticated")) {
    return "Your session expired. Please log in again.";
  }
  if (m.includes("row-level security") || m.includes("rls")) {
    return "Couldn’t save this concert. Try logging out and back in.";
  }
  return message || "Something went wrong while saving. Please try again.";
}
