"use client";

import { useEffect, useMemo, useState } from "react";
import {
  browserLocalPersistence,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  setPersistence,
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
    "auth/weak-password": "Use at least six characters for the password.",
    "auth/too-many-requests": "Too many attempts. Try again later.",
    "auth/user-not-found": "No account was found for that email."
  };

  return messages[error.code] || error.message;
}

function displayNameFor(user) {
  return user?.displayName || user?.email || "Customer";
}

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
      await sendPasswordResetEmail(auth, email);
      setStatus({ kind: "success", message: "Password reset email sent." });
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
