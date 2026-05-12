"use client";

import { useEffect, useMemo, useState } from "react";
import {
  browserLocalPersistence,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  onAuthStateChanged,
  sendPasswordResetEmail,
  setPersistence,
  signInWithPopup,
  signInWithEmailAndPassword,
  signOut,
  updateProfile
} from "firebase/auth";
import { auth } from "../../lib/firebase";

function authMessage(error) {
  if (!error?.code) return "Authentication failed. Check the details and try again.";

  const messages = {
    "auth/email-already-in-use": "That email already has an account.",
    "auth/invalid-credential": "Email or password is not correct.",
    "auth/invalid-email": "Use a valid email address.",
    "auth/missing-password": "Enter a password.",
    "auth/network-request-failed": "Network request failed. Check the connection and try again.",
    "auth/operation-not-allowed": "Email and password authentication is not enabled in Firebase.",
    "auth/weak-password": "Use at least six characters for the password.",
    "auth/too-many-requests": "Too many attempts. Try again later.",
    "auth/user-not-found": "No account was found for that email."
  };

  return messages[error.code] || error.message;
}

function displayNameFor(user) {
  return user?.displayName || user?.email || "Customer";
}

const googleProvider = new GoogleAuthProvider();
googleProvider.addScope("profile");
googleProvider.addScope("email");

export default function LoginPage() {
  const [mode, setMode] = useState("signin");
  const [user, setUser] = useState(null);
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState({ kind: "idle", message: "Secure customer access is powered by Firebase Auth." });
  const [busy, setBusy] = useState(false);

  const submitLabel = useMemo(() => {
    if (busy) return "Working";
    return mode === "signup" ? "Create account" : "Sign in";
  }, [busy, mode]);

  useEffect(() => {
    return onAuthStateChanged(auth, setUser);
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    setBusy(true);
    setStatus({ kind: "idle", message: "Checking your credentials..." });

    try {
      await setPersistence(auth, browserLocalPersistence);
      if (mode === "signup") {
        const credential = await createUserWithEmailAndPassword(auth, email, password);
        if (displayName.trim()) {
          await updateProfile(credential.user, { displayName: displayName.trim() });
        }
        setStatus({ kind: "success", message: "Account created. You are signed in." });
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        setStatus({ kind: "success", message: "Signed in. Your cart and orders are ready." });
      }
      window.location.assign("/");
    } catch (error) {
      setStatus({ kind: "error", message: authMessage(error) });
    } finally {
      setBusy(false);
    }
  }

  async function handleReset() {
    if (!email) {
      setStatus({ kind: "error", message: "Enter your email before requesting a reset link." });
      return;
    }

    setBusy(true);
    try {
      await sendPasswordResetEmail(auth, email, {
        url: `${window.location.origin}/login?email=${encodeURIComponent(email)}`,
        handleCodeInApp: false
      });
      setStatus({
        kind: "success",
        message: "If this email has a password account, Firebase will send a reset link. Check inbox and spam."
      });
    } catch (error) {
      setStatus({ kind: "error", message: authMessage(error) });
    } finally {
      setBusy(false);
    }
  }

  async function handleGoogleSignIn() {
    setBusy(true);
    setStatus({ kind: "idle", message: "Opening Google sign in..." });

    try {
      await setPersistence(auth, browserLocalPersistence);
      await signInWithPopup(auth, googleProvider);
      setStatus({ kind: "success", message: "Signed in with Google. Your account is ready." });
      window.location.assign("/");
    } catch (error) {
      setStatus({ kind: "error", message: authMessage(error) });
    } finally {
      setBusy(false);
    }
  }

  async function handleSignOut() {
    setBusy(true);
    await signOut(auth);
    setStatus({ kind: "success", message: "Signed out." });
    setBusy(false);
  }

  return (
    <main className="loginShell">
      <a className="loginBrand" href="/">ATELIER SUPPLY</a>
      <section className="loginSurface">
        <div className="loginArtwork">
          <img src="https://images.unsplash.com/photo-1772026251816-a6d382c67b3b?auto=format&fit=crop&w=1200&q=85" alt="Leather bag on a wood bench" />
          <div>
            <span>ACCOUNT ACCESS</span>
            <h1>Studio goods, saved carts, order history.</h1>
            <p>Sign in to keep checkout details, shipping addresses, and fulfillment updates together.</p>
          </div>
        </div>

        <section className="loginPanel" aria-label="Authentication">
          <div className="authSwitch" role="tablist" aria-label="Authentication mode">
            <button className={mode === "signin" ? "active" : ""} onClick={() => setMode("signin")} type="button">
              Sign in
            </button>
            <button className={mode === "signup" ? "active" : ""} onClick={() => setMode("signup")} type="button">
              Create account
            </button>
          </div>

          {user ? (
            <div className="signedInCard">
              <span>Signed in</span>
              <h2>{displayNameFor(user)}</h2>
              <p>{user.email}</p>
              <a href="/">Return to store</a>
              <button onClick={handleSignOut} disabled={busy} type="button">Sign out</button>
            </div>
          ) : (
            <form className="authForm" onSubmit={handleSubmit}>
              <div>
                <span>{mode === "signup" ? "New customer" : "Returning customer"}</span>
                <h2>{mode === "signup" ? "Create your account" : "Welcome back"}</h2>
              </div>

              {mode === "signup" && (
                <label>
                  Name
                  <input
                    autoComplete="name"
                    name="name"
                    onChange={(event) => setDisplayName(event.target.value)}
                    placeholder="Eleanor Grant"
                    value={displayName}
                  />
                </label>
              )}

              <label>
                Email
                <input
                  autoComplete="email"
                  name="email"
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
                  required
                  type="email"
                  value={email}
                />
              </label>

              <label>
                Password
                <input
                  autoComplete={mode === "signup" ? "new-password" : "current-password"}
                  name="password"
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="••••••••"
                  required
                  type="password"
                  value={password}
                />
              </label>

              <button className="authSubmit" disabled={busy} type="submit">{submitLabel}</button>
              <div className="authDivider"><span>or</span></div>
              <button className="googleButton" disabled={busy} onClick={handleGoogleSignIn} type="button">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M21.6 12.2c0-.7-.1-1.3-.2-1.9H12v3.6h5.4a4.6 4.6 0 0 1-2 3v2.5h3.2c1.9-1.8 3-4.3 3-7.2Z" />
                  <path d="M12 22c2.7 0 5-1 6.6-2.6l-3.2-2.5c-.9.6-2 .9-3.4.9a5.8 5.8 0 0 1-5.5-4H3.2v2.6A10 10 0 0 0 12 22Z" />
                  <path d="M6.5 13.8a6 6 0 0 1 0-3.6V7.6H3.2a10 10 0 0 0 0 8.8l3.3-2.6Z" />
                  <path d="M12 6.2c1.5 0 2.8.5 3.8 1.5l2.9-2.9A9.8 9.8 0 0 0 12 2a10 10 0 0 0-8.8 5.6l3.3 2.6A5.8 5.8 0 0 1 12 6.2Z" />
                </svg>
                Continue with Google
              </button>
              <button className="resetButton" disabled={busy} onClick={handleReset} type="button">Send password reset</button>
            </form>
          )}

          <p className={`authStatus ${status.kind}`}>{status.message}</p>
          <div className="authNotes">
            <span>Firebase email auth</span>
            <span>Stripe checkout ready</span>
            <span>Orders stay private</span>
          </div>
        </section>
      </section>
    </main>
  );
}
