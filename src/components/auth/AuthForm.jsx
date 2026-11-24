"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { api } from "@/lib/api";
import BrandLogo from "@/components/common/BrandLogo";

const fieldClass =
  "h-11 w-full rounded-lg border border-hairline bg-paper pl-10 pr-4 text-sm text-ink outline-none transition-colors duration-150 placeholder:text-ink-3 focus:border-brand focus:bg-surface";

const iconClass =
  "pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-ink-3";

export default function AuthForm({ mode }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirm: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const router = useRouter();
  const isRegister = mode === "register";

  async function submit(e) {
    e.preventDefault();
    setError("");

    if (isRegister && form.password !== form.confirm) {
      return setError("Passwords do not match.");
    }

    setLoading(true);

    try {
      await api(`/auth/${isRegister ? "register" : "login"}`, {
        method: "POST",
        body: JSON.stringify(
          isRegister
            ? { name: form.name, email: form.email, password: form.password }
            : { email: form.email, password: form.password }
        ),
      });

      router.replace("/dashboard");
    } catch (err) {
      setError(err.message || "Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen flex-col bg-paper">
      <div className="mx-auto w-full max-w-md px-4 py-6 sm:px-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-ink-2 transition-colors duration-150 hover:text-ink"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={1.75} />
          Back to home
        </Link>
      </div>

      <div className="flex flex-1 items-start justify-center px-4 pb-16 pt-2 sm:px-6 sm:pt-6">
        <div className="w-full max-w-md">
          <div className="rounded-2xl border border-hairline bg-surface p-6 sm:p-8">
            <BrandLogo href="/" size="md" />

            <h1 className="mt-6 text-2xl font-medium tracking-[-0.01em] text-ink">
              {isRegister ? "Create an account" : "Sign in"}
            </h1>
            <p className="mt-1.5 text-sm text-ink-2">
              {isRegister
                ? "Host meetings and keep a history of your rooms."
                : "Access your meetings, history and settings."}
            </p>

            <form onSubmit={submit} className="mt-6 space-y-4">
              {isRegister && (
                <div>
                  <label
                    htmlFor="name"
                    className="mb-1.5 block text-[13px] font-medium text-ink"
                  >
                    Full name
                  </label>
                  <div className="relative">
                    <div className={iconClass}>
                      <User className="h-4 w-4" strokeWidth={1.75} />
                    </div>
                    <input
                      id="name"
                      required
                      type="text"
                      autoComplete="name"
                      placeholder="Jane Doe"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className={fieldClass}
                    />
                  </div>
                </div>
              )}

              <div>
                <label
                  htmlFor="email"
                  className="mb-1.5 block text-[13px] font-medium text-ink"
                >
                  Email
                </label>
                <div className="relative">
                  <div className={iconClass}>
                    <Mail className="h-4 w-4" strokeWidth={1.75} />
                  </div>
                  <input
                    id="email"
                    required
                    type="email"
                    autoComplete="email"
                    placeholder="you@company.com"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className={fieldClass}
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="mb-1.5 block text-[13px] font-medium text-ink"
                >
                  Password
                </label>
                <div className="relative">
                  <div className={iconClass}>
                    <Lock className="h-4 w-4" strokeWidth={1.75} />
                  </div>
                  <input
                    id="password"
                    required
                    minLength={8}
                    type={showPassword ? "text" : "password"}
                    autoComplete={isRegister ? "new-password" : "current-password"}
                    placeholder={isRegister ? "At least 8 characters" : "Your password"}
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className={`${fieldClass} pr-11`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-ink-3 transition-colors duration-150 hover:text-ink"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" strokeWidth={1.75} />
                    ) : (
                      <Eye className="h-4 w-4" strokeWidth={1.75} />
                    )}
                  </button>
                </div>
              </div>

              {isRegister && (
                <div>
                  <label
                    htmlFor="confirm"
                    className="mb-1.5 block text-[13px] font-medium text-ink"
                  >
                    Confirm password
                  </label>
                  <div className="relative">
                    <div className={iconClass}>
                      <Lock className="h-4 w-4" strokeWidth={1.75} />
                    </div>
                    <input
                      id="confirm"
                      required
                      minLength={8}
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      placeholder="Repeat the password"
                      value={form.confirm}
                      onChange={(e) => setForm({ ...form, confirm: e.target.value })}
                      className={fieldClass}
                    />
                  </div>
                </div>
              )}

              {error && (
                <div className="flex items-start gap-2 rounded-lg border border-negative/25 bg-negative/5 p-3 text-[13px] text-negative">
                  <AlertCircle
                    className="mt-0.5 h-4 w-4 shrink-0"
                    strokeWidth={1.75}
                  />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="flex h-11 w-full items-center justify-center gap-1.5 rounded-lg bg-brand text-sm font-medium text-white transition-colors duration-150 hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.75} />
                    <span>Please wait</span>
                  </>
                ) : (
                  <>
                    <span>{isRegister ? "Create account" : "Sign in"}</span>
                    <ArrowRight className="h-4 w-4" strokeWidth={1.75} />
                  </>
                )}
              </button>
            </form>

            <p className="mt-6 border-t border-hairline pt-5 text-sm text-ink-2">
              {isRegister ? (
                <>
                  Already have an account?{" "}
                  <Link
                    href="/login"
                    className="font-medium text-brand transition-colors duration-150 hover:text-brand-hover"
                  >
                    Sign in
                  </Link>
                </>
              ) : (
                <>
                  No account yet?{" "}
                  <Link
                    href="/register"
                    className="font-medium text-brand transition-colors duration-150 hover:text-brand-hover"
                  >
                    Create one
                  </Link>
                </>
              )}
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
