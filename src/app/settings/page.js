"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  LogOut,
  Save,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  User,
} from "lucide-react";
import { api } from "@/lib/api";
import BrandLogo from "@/components/common/BrandLogo";

const labelClass = "mb-1.5 block text-[13px] font-medium text-ink";
const fieldClass =
  "h-11 w-full rounded-lg border border-hairline bg-paper px-3.5 text-sm text-ink outline-none transition-colors duration-150 placeholder:text-ink-3 focus:border-brand focus:bg-surface";

export default function SettingsPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api("/users/me")
      .then(({ user }) => {
        setName(user.name);
        setEmail(user.email);
      })
      .catch(() => router.replace("/login"));
  }, [router]);

  async function saveProfile(e) {
    e.preventDefault();
    setMessage("");
    setLoading(true);
    try {
      await api("/users/me", { method: "PUT", body: JSON.stringify({ name }) });
      setMessage("Profile updated.");
      setIsSuccess(true);
    } catch (e) {
      setMessage(e.message);
      setIsSuccess(false);
    } finally {
      setLoading(false);
    }
  }

  async function changePassword(e) {
    e.preventDefault();
    setMessage("");
    setLoading(true);
    try {
      await api("/users/me/password", {
        method: "PUT",
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      setCurrentPassword("");
      setNewPassword("");
      setMessage("Password updated.");
      setIsSuccess(true);
    } catch (e) {
      setMessage(e.message);
      setIsSuccess(false);
    } finally {
      setLoading(false);
    }
  }

  async function logout() {
    await api("/auth/logout", { method: "POST" });
    router.replace("/");
  }

  return (
    <div className="flex min-h-screen flex-col bg-paper">
      <header className="sticky top-0 z-40 border-b border-hairline bg-surface/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-3xl items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              aria-label="Back to dashboard"
              className="flex h-9 w-9 items-center justify-center rounded-lg text-ink-2 transition-colors duration-150 hover:bg-raised hover:text-ink"
            >
              <ArrowLeft className="h-4 w-4" strokeWidth={1.75} />
            </Link>
            <BrandLogo href="/" size="sm" />
          </div>

          <button
            type="button"
            onClick={logout}
            className="flex h-9 items-center gap-1.5 rounded-lg px-3 text-sm text-ink-2 transition-colors duration-150 hover:bg-raised hover:text-ink"
          >
            <LogOut className="h-4 w-4" strokeWidth={1.75} />
            Log out
          </button>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8 sm:px-6 sm:py-10">
        <h1 className="text-[28px] font-medium leading-[1.15] tracking-[-0.02em] text-ink">
          Account settings
        </h1>
        <p className="mt-1 text-[13px] text-ink-2">
          Profile details and password for this account
        </p>

        {message && (
          <div
            className={`mt-6 flex items-start gap-2 rounded-lg border p-3 text-[13px] ${
              isSuccess
                ? "border-positive/25 bg-positive/5 text-positive"
                : "border-negative/25 bg-negative/5 text-negative"
            }`}
          >
            {isSuccess ? (
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={1.75} />
            ) : (
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={1.75} />
            )}
            <span>{message}</span>
          </div>
        )}

        <div className="mt-6 space-y-4">
          <section className="rounded-xl border border-hairline bg-surface p-5 sm:p-6">
            <div className="flex items-center gap-2.5">
              <User className="h-[18px] w-[18px] text-ink-3" strokeWidth={1.5} />
              <h2 className="text-[15px] font-medium text-ink">Profile</h2>
            </div>

            <form onSubmit={saveProfile} className="mt-5 space-y-4">
              <div className="max-w-sm">
                <label htmlFor="display-name" className={labelClass}>
                  Display name
                </label>
                <input
                  id="display-name"
                  required
                  type="text"
                  autoComplete="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={fieldClass}
                />
              </div>

              <div className="max-w-sm">
                <label htmlFor="account-email" className={labelClass}>
                  Email
                </label>
                <input
                  id="account-email"
                  disabled
                  type="email"
                  value={email}
                  className={`${fieldClass} cursor-not-allowed bg-raised text-ink-2`}
                />
                <p className="mt-1.5 text-xs text-ink-3">
                  The email on an account cannot be changed.
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex h-10 items-center gap-1.5 rounded-lg bg-brand px-4 text-sm font-medium text-white transition-colors duration-150 hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Save className="h-4 w-4" strokeWidth={1.75} />
                Save profile
              </button>
            </form>
          </section>

          <section className="rounded-xl border border-hairline bg-surface p-5 sm:p-6">
            <div className="flex items-center gap-2.5">
              <KeyRound className="h-[18px] w-[18px] text-ink-3" strokeWidth={1.5} />
              <h2 className="text-[15px] font-medium text-ink">Password</h2>
            </div>

            <form onSubmit={changePassword} className="mt-5 space-y-4">
              <div className="max-w-sm">
                <label htmlFor="current-password" className={labelClass}>
                  Current password
                </label>
                <input
                  id="current-password"
                  required
                  type="password"
                  autoComplete="current-password"
                  placeholder="Enter current password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className={fieldClass}
                />
              </div>

              <div className="max-w-sm">
                <label htmlFor="new-password" className={labelClass}>
                  New password
                </label>
                <input
                  id="new-password"
                  required
                  minLength={8}
                  type="password"
                  autoComplete="new-password"
                  placeholder="At least 8 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className={fieldClass}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex h-10 items-center gap-1.5 rounded-lg border border-hairline bg-surface px-4 text-sm font-medium text-ink transition-colors duration-150 hover:bg-raised disabled:cursor-not-allowed disabled:opacity-60"
              >
                Update password
              </button>
            </form>
          </section>
        </div>
      </main>
    </div>
  );
}
