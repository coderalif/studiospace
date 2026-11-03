"use client";

import Link from "next/link";
import {
  Aperture,
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
} from "lucide-react";
import Script from "next/script";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useRef, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "../../components/AppProviders";
import { api } from "../../lib/api";

const GOOGLE_CLIENT_ID =
  process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
  "553926041182-avnf2pbge8g9v5k4023fmlen6fatpeap.apps.googleusercontent.com";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const { setUser } = useAuth();
  const googleButtonRef = useRef(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [googleReady, setGoogleReady] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    try {
      const { user } = await api("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      setUser(user);
      toast.success("Welcome back. Your next idea is waiting.");
      // Protected pages pass their destination as `next`; otherwise return home.
      router.replace(params.get("next") || "/");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setBusy(false);
    }
  }

  async function googleLogin(credential) {
    try {
      const { user } = await api("/auth/google", {
        method: "POST",
        body: JSON.stringify({ credential }),
      });
      setUser(user);
      toast.success("Welcome to StudioSpace.");
      router.replace(params.get("next") || "/");
    } catch (error) {
      toast.error(error.message);
    }
  }

  function initGoogle() {
    // The script and button can become ready in either order; render only once both exist.
    if (
      !window.google?.accounts?.id ||
      !GOOGLE_CLIENT_ID ||
      !googleButtonRef.current ||
      googleButtonRef.current.dataset.googleReady
    )
      return;
    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: ({ credential }) => googleLogin(credential),
    });
    const width = Math.min(
      Math.max(Math.floor(googleButtonRef.current.clientWidth), 120),
      400,
    );
    window.google.accounts.id.renderButton(googleButtonRef.current, {
      theme: "outline",
      size: "large",
      text: "continue_with",
      shape: "rectangular",
      logo_alignment: "left",
      width,
    });
    googleButtonRef.current.dataset.googleReady = "true";
    setGoogleReady(true);
  }

  function handleGoogleClick() {
    if (!GOOGLE_CLIENT_ID) {
      toast.error(
        "Google sign-in is not configured for this site. Add the client ID to the frontend environment and redeploy.",
      );
      return;
    }
    if (!window.google?.accounts?.id) {
      toast.error("Google sign-in is still loading. Please try again.");
      return;
    }
    initGoogle();
  }

  return (
    <>
      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
        onReady={initGoogle}
      />
      <div className="auth-page">
        <div className="auth-visual auth-visual-login">
          <Link href="/" className="brand auth-brand">
            <span className="brand-mark">
              <Aperture size={22} />
            </span>
            <span>
              studio<span className="brand-light">space</span>
            </span>
          </Link>
          <div className="auth-visual-copy">
            <span className="eyebrow">
              <span className="eyebrow-dot" /> A better kind of workspace
            </span>
            <h2>
              Make something
              <br />
              you’re <em>proud of.</em>
            </h2>
            <p>
              Somewhere between the right space and the right idea, something
              good happens.
            </p>
          </div>
          <span className="auth-image-credit">
            A little room to do your thing.
          </span>
        </div>
        <div className="auth-form-wrap">
          <div className="auth-form-head">
            <Link className="back-link" href="/">
              <ArrowLeft size={15} /> Back home
            </Link>
            <span>
              New around here? <Link href="/register">Create an account</Link>
            </span>
          </div>
          <form className="auth-form" onSubmit={submit}>
            <span className="eyebrow">Welcome back</span>
            <h1>
              Good to have
              <br />
              you <em>back.</em>
            </h1>
            <p>Sign in and get back to making.</p>
            <label>
              Email address
              <div className="input-with-icon">
                <Mail size={17} />
                <input
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
                />
              </div>
            </label>
            <label>
              Password
              <div className="input-with-icon">
                <LockKeyhole size={17} />
                <input
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Your password"
                />
                <button
                  className="input-icon-action"
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </label>
            <div className="auth-forgot">
              <span>
                Forgot your password? Contact your workspace administrator.
              </span>
            </div>
            <button className="button button-dark auth-submit" disabled={busy}>
              {busy ? "Signing you in…" : "Sign in"} <ArrowRight size={17} />
            </button>
            <div className="auth-divider">
              <span />
              or
              <span />
            </div>
            <button
              className="button button-outline google-button"
              type="button"
              onClick={handleGoogleClick}
              style={{ display: googleReady ? "none" : undefined }}
            >
              <span className="google-g">G</span> Continue with Google
            </button>
            <div
              className={`google-signin-widget${googleReady ? " is-ready" : ""}`}
              ref={googleButtonRef}
            />
            <p className="auth-terms">
              By continuing, you agree to our <Link href="/terms">Terms</Link>{" "}
              and <Link href="/privacy">Privacy Policy</Link>.
            </p>
          </form>
        </div>
      </div>
    </>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="page-loading">
          <span className="spinner" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
