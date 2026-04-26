import * as SecureStore from "expo-secure-store";
import * as AppleAuthentication from "expo-apple-authentication";
import { apiUrl } from "./config";

export interface CustomerSession {
  /** Stable Apple user id (sub) — primary key for the customer record */
  appleUserId: string;
  /** Email — only present on first sign-in unless user shares it again */
  email?: string;
  /** Display name from Apple — only present on first sign-in */
  displayName?: string;
  /** Server-issued session token (returned by /api/customer/apple-signin) */
  sessionToken?: string;
}

const SESSION_KEY = "customer_session_v1";

export async function loadSession(): Promise<CustomerSession | null> {
  const raw = await SecureStore.getItemAsync(SESSION_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as CustomerSession;
  } catch {
    return null;
  }
}

export async function saveSession(session: CustomerSession): Promise<void> {
  await SecureStore.setItemAsync(SESSION_KEY, JSON.stringify(session));
}

export async function clearSession(): Promise<void> {
  await SecureStore.deleteItemAsync(SESSION_KEY);
}

export async function isAppleAuthAvailable(): Promise<boolean> {
  return AppleAuthentication.isAvailableAsync();
}

/**
 * Run the full Apple Sign-In handshake:
 * 1. Native sign-in dialog
 * 2. POST identity token to /api/customer/apple-signin
 * 3. Save session locally, return it
 *
 * Throws on user cancel or network error.
 */
export async function signInWithApple(): Promise<CustomerSession> {
  const credential = await AppleAuthentication.signInAsync({
    requestedScopes: [
      AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
      AppleAuthentication.AppleAuthenticationScope.EMAIL,
    ],
  });

  const displayName = credential.fullName
    ? [credential.fullName.givenName, credential.fullName.familyName]
        .filter(Boolean)
        .join(" ")
        .trim() || undefined
    : undefined;

  const session: CustomerSession = {
    appleUserId: credential.user,
    email: credential.email ?? undefined,
    displayName,
  };

  // Best-effort exchange for a server session. If the server isn't
  // reachable we still keep the local session — the user is signed in
  // client-side and can browse / save favorites.
  if (credential.identityToken) {
    try {
      const res = await fetch(apiUrl("/api/customer/apple-signin"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identityToken: credential.identityToken,
          authorizationCode: credential.authorizationCode,
          appleUserId: credential.user,
          email: credential.email,
          displayName,
        }),
      });
      if (res.ok) {
        const json = (await res.json()) as { sessionToken?: string };
        if (json.sessionToken) session.sessionToken = json.sessionToken;
      }
    } catch {
      // Server unreachable — local session still valid.
    }
  }

  await saveSession(session);
  return session;
}

export async function checkAppleCredentialState(
  appleUserId: string
): Promise<AppleAuthentication.AppleAuthenticationCredentialState> {
  return AppleAuthentication.getCredentialStateAsync(appleUserId);
}
