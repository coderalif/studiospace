"use client";

import Link from "next/link";
import { Aperture, ArrowLeft, ArrowRight, Eye, EyeOff, LockKeyhole, Mail, UserRound } from "lucide-react";
import Script from "next/script";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "../../components/AppProviders";
import { api } from "../../lib/api";

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

export default function RegisterPage() {
  const router = useRouter();
  const { setUser } = useAuth();
  const [form, setForm] = useState({ name: "", email: "", photoURL: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState("");

  function change(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
    if (field === "password") {
      if (value.length < 6) setPasswordMessage("Use at least 6 characters.");
      else if (!/[A-Z]/.test(value)) setPasswordMessage("Add at least one uppercase letter.");
      else if (!/[a-z]/.test(value)) setPasswordMessage("Add at least one lowercase letter.");
      else setPasswordMessage("");
    }
  }

  async function submit(event) {
    event.preventDefault();
    if (passwordMessage) return;
    setBusy(true);
    try {
      await api("/auth/register", { method: "POST", body: JSON.stringify(form) });
      toast.success("Your account is ready. Sign in to get started.");
      router.push("/login");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setBusy(false);
    }
  }

  async function googleLogin(credential) {
    try {
      const { user } = await api("/auth/google", { method: "POST", body: JSON.stringify({ credential }) });
      setUser(user);
      toast.success("Welcome to StudioSpace.");
      router.replace("/");
    } catch (error) {
      toast.error(error.message);
    }
  }

  function initGoogle() {
    if (!window.google?.accounts?.id || !GOOGLE_CLIENT_ID) return;
    window.google.accounts.id.initialize({ client_id: GOOGLE_CLIENT_ID, callback: ({ credential }) => googleLogin(credential) });
  }

  function handleGoogleClick() {
    if (!GOOGLE_CLIENT_ID) return toast.error("Google sign-in needs a client ID in client/.env.local.");
    if (!window.google?.accounts?.id) return toast.error("Google sign-in is still loading. Please try again.");
    window.google.accounts.id.prompt();
  }

  return (
    <>
      <Script src="https://accounts.google.com/gsi/client" strategy="afterInteractive" onLoad={initGoogle} />
      <div className="auth-page">
        <div className="auth-visual auth-visual-register">
          <Link href="/" className="brand auth-brand"><span className="brand-mark"><Aperture size={22} /></span><span>studio<span className="brand-light">space</span></span></Link>
          <div className="auth-visual-copy"><span className="eyebrow"><span className="eyebrow-dot" /> Your next chapter starts here</span><h2>Good spaces.<br /><em>Good things.</em></h2><p>Meet the people and places that make your best work possible.</p></div>
          <span className="auth-image-credit">A community made for makers.</span>
        </div>
        <div className="auth-form-wrap">
          <div className="auth-form-head"><Link className="back-link" href="/"><ArrowLeft size={15} /> Back home</Link><span>Already a member? <Link href="/login">Sign in</Link></span></div>
          <form className="auth-form register-form" onSubmit={submit}>
            <span className="eyebrow">Come on in</span><h1>Make yourself<br /><em>at home.</em></h1><p>Create your free account and find your kind of space.</p>
            <label>Your name<div className="input-with-icon"><UserRound size={17} /><input autoComplete="name" required maxLength={80} value={form.name} onChange={(event) => change("name", event.target.value)} placeholder="How should we call you?" /></div></label>
            <label>Email address<div className="input-with-icon"><Mail size={17} /><input type="email" autoComplete="email" required value={form.email} onChange={(event) => change("email", event.target.value)} placeholder="you@example.com" /></div></label>
            <label>Photo URL <span className="optional-label">optional</span><div className="input-with-icon"><span className="url-prefix">↗</span><input type="url" value={form.photoURL} onChange={(event) => change("photoURL", event.target.value)} placeholder="https://..." /></div></label>
            <label>Password<div className="input-with-icon"><LockKeyhole size={17} /><input type={showPassword ? "text" : "password"} autoComplete="new-password" required minLength={6} value={form.password} onChange={(event) => change("password", event.target.value)} placeholder="At least 6 characters" /><button className="input-icon-action" type="button" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? "Hide password" : "Show password"}>{showPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button></div><span className={`password-hint ${passwordMessage ? "has-error" : form.password ? "is-valid" : ""}`}>{passwordMessage || "At least 6 characters, with an uppercase and lowercase letter."}</span></label>
            <button className="button button-dark auth-submit" disabled={busy || Boolean(passwordMessage) || form.password.length === 0}>{busy ? "Creating your account…" : "Create account"} <ArrowRight size={17} /></button>
            <div className="auth-divider"><span />or<span /></div>
            <button className="button button-outline google-button" type="button" onClick={handleGoogleClick}><span className="google-g">G</span> Continue with Google</button>
            <p className="auth-terms">By joining, you agree to our <Link href="/terms">Terms</Link> and <Link href="/privacy">Privacy Policy</Link>.</p>
          </form>
        </div>
      </div>
    </>
  );
}
