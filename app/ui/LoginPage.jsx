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

const serif = "font-['Libre_Baskerville']";
const labelText = "text-[0.72rem] font-black uppercase tracking-[0.09em]";
const authButton = "inline-flex min-h-[2.9rem] items-center justify-center border border-[#1a17142e] px-4 text-[0.78rem] font-black uppercase tracking-[0.08em]";

function cx(...classes) {
  return classes.filter(Boolean).join(" ");
}

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
    <main className="min-h-screen p-[clamp(0.8rem,2vw,1.5rem)]">
      <a className={`${serif} mb-[clamp(0.8rem,2vw,1.25rem)] inline-flex text-[clamp(1.25rem,2vw,2rem)] tracking-[0.04em]`} href="/">ATELIER SUPPLY</a>
      <section className="grid min-h-[calc(100vh-5.8rem)] grid-cols-[minmax(24rem,1fr)_minmax(22rem,0.72fr)] border border-[#1a171424] bg-[#fbf8f2b8] max-[920px]:min-h-0 max-[920px]:grid-cols-1">
        <div className="relative grid min-h-[34rem] grid-rows-[1fr_auto] overflow-hidden bg-[#14191e] text-[#fff9ef] max-[920px]:min-h-0">
          <img className="h-full min-h-80 w-full object-cover saturate-[0.8] contrast-[1.04] max-[920px]:h-[42vh] max-[920px]:min-h-72" src="https://images.unsplash.com/photo-1772026251816-a6d382c67b3b?auto=format&fit=crop&w=1200&q=85" alt="Leather bag on a wood bench" />
          <div className="bg-[#14191e] p-[clamp(1.5rem,4vw,3rem)]">
            <span className={`${labelText} text-[#c7b58e]`}>ACCOUNT ACCESS</span>
            <h1 className={`${serif} my-3 max-w-[14ch] text-[clamp(2.8rem,4.2vw,4.2rem)] leading-[0.94]`}>Studio goods, saved carts, order history.</h1>
            <p className="m-0 max-w-lg leading-relaxed text-[#fff9efb8]">Sign in to keep checkout details, shipping addresses, and fulfillment updates together.</p>
          </div>
        </div>

        <section className="grid content-center gap-3 p-[clamp(1rem,3vw,2rem)]" aria-label="Authentication">
          <div className="grid grid-cols-2 border border-[#1a171424] bg-[#fbf8f2] p-1" role="tablist" aria-label="Authentication mode">
            <button className={cx("min-h-[2.9rem] border-0 bg-transparent text-[0.78rem] font-black uppercase tracking-[0.08em] text-[#1a1714ad]", mode === "signin" && "bg-[#1a1714] text-[#fff9ef]")} onClick={() => setMode("signin")} type="button">
              Sign in
            </button>
            <button className={cx("min-h-[2.9rem] border-0 bg-transparent text-[0.78rem] font-black uppercase tracking-[0.08em] text-[#1a1714ad]", mode === "signup" && "bg-[#1a1714] text-[#fff9ef]")} onClick={() => setMode("signup")} type="button">
              Create account
            </button>
          </div>

          {user ? (
            <div className="grid gap-3">
              <span className={`${labelText} text-[#c7b58e]`}>Signed in</span>
              <h2 className={`${serif} mt-1 text-[clamp(2.1rem,3.2vw,3.2rem)] leading-none`}>{displayNameFor(user)}</h2>
              <p>{user.email}</p>
              <a className={`${authButton} bg-[#1a1714] text-[#fff9ef]`} href="/">Return to store</a>
              <button className={`${authButton} bg-transparent text-[#1a1714] disabled:cursor-wait disabled:opacity-60`} onClick={handleSignOut} disabled={busy} type="button">Sign out</button>
            </div>
          ) : (
            <form className="grid gap-3" onSubmit={handleSubmit}>
              <div>
                <span className={`${labelText} text-[#c7b58e]`}>{mode === "signup" ? "New customer" : "Returning customer"}</span>
                <h2 className={`${serif} mt-1 text-[clamp(2.1rem,3.2vw,3.2rem)] leading-none`}>{mode === "signup" ? "Create your account" : "Welcome back"}</h2>
              </div>

              {mode === "signup" && (
                <label className={`grid gap-2 text-[#1a1714a3] ${labelText}`}>
                  Name
                  <input
                    className="min-h-[3.15rem] border border-[#1a17142e] bg-[#fff9ef] px-4 text-base font-bold normal-case tracking-normal text-[#1a1714] outline-none focus:border-[#741210] focus:shadow-[0_0_0_3px_rgba(116,18,16,0.12)]"
                    autoComplete="name"
                    name="name"
                    onChange={(event) => setDisplayName(event.target.value)}
                    placeholder="Eleanor Grant"
                    value={displayName}
                  />
                </label>
              )}

              <label className={`grid gap-2 text-[#1a1714a3] ${labelText}`}>
                Email
                <input
                  className="min-h-[3.15rem] border border-[#1a17142e] bg-[#fff9ef] px-4 text-base font-bold normal-case tracking-normal text-[#1a1714] outline-none focus:border-[#741210] focus:shadow-[0_0_0_3px_rgba(116,18,16,0.12)]"
                  autoComplete="email"
                  name="email"
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
                  required
                  type="email"
                  value={email}
                />
              </label>

              <label className={`grid gap-2 text-[#1a1714a3] ${labelText}`}>
                Password
                <input
                  className="min-h-[3.15rem] border border-[#1a17142e] bg-[#fff9ef] px-4 text-base font-bold normal-case tracking-normal text-[#1a1714] outline-none focus:border-[#741210] focus:shadow-[0_0_0_3px_rgba(116,18,16,0.12)]"
                  autoComplete={mode === "signup" ? "new-password" : "current-password"}
                  name="password"
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="••••••••"
                  required
                  type="password"
                  value={password}
                />
              </label>

              <button className={`${authButton} border-[#741210] bg-[#741210] text-[#fff9ef] disabled:cursor-wait disabled:opacity-60`} disabled={busy} type="submit">{submitLabel}</button>
              <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 text-[0.72rem] font-black uppercase tracking-[0.08em] text-[#1a17147a] before:h-px before:bg-[#1a17141f] after:h-px after:bg-[#1a17141f]"><span>or</span></div>
              <button className={`${authButton} gap-3 bg-[#fff9ef] text-[#1a1714] disabled:cursor-wait disabled:opacity-60`} disabled={busy} onClick={handleGoogleSignIn} type="button">
                <svg className="h-[1.15rem] w-[1.15rem] fill-current stroke-0" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M21.6 12.2c0-.7-.1-1.3-.2-1.9H12v3.6h5.4a4.6 4.6 0 0 1-2 3v2.5h3.2c1.9-1.8 3-4.3 3-7.2Z" />
                  <path d="M12 22c2.7 0 5-1 6.6-2.6l-3.2-2.5c-.9.6-2 .9-3.4.9a5.8 5.8 0 0 1-5.5-4H3.2v2.6A10 10 0 0 0 12 22Z" />
                  <path d="M6.5 13.8a6 6 0 0 1 0-3.6V7.6H3.2a10 10 0 0 0 0 8.8l3.3-2.6Z" />
                  <path d="M12 6.2c1.5 0 2.8.5 3.8 1.5l2.9-2.9A9.8 9.8 0 0 0 12 2a10 10 0 0 0-8.8 5.6l3.3 2.6A5.8 5.8 0 0 1 12 6.2Z" />
                </svg>
                Continue with Google
              </button>
              <button className={`${authButton} bg-transparent text-[#1a1714] disabled:cursor-wait disabled:opacity-60`} disabled={busy} onClick={handleReset} type="button">Send password reset</button>
            </form>
          )}

          <p className={cx("m-0 border border-[#1a17141f] bg-[#fff9ef] p-4 leading-relaxed text-[#1a1714ad]", status.kind === "error" && "border-[#74121066] text-[#741210]", status.kind === "success" && "border-[#31525f66] text-[#31525f]")}>{status.message}</p>
          <div className="flex flex-wrap gap-2">
            <span className={`${labelText} border border-[#1a171424] px-3 py-2 text-[#1a171494]`}>Firebase email auth</span>
            <span className={`${labelText} border border-[#1a171424] px-3 py-2 text-[#1a171494]`}>Stripe checkout ready</span>
            <span className={`${labelText} border border-[#1a171424] px-3 py-2 text-[#1a171494]`}>Orders stay private</span>
          </div>
        </section>
      </section>
    </main>
  );
}
