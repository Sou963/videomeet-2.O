"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  User,
  Mail,
  Lock,
  ShieldCheck,
  LogOut,
  Save,
  CheckCircle2,
  AlertCircle,
  KeyRound,
} from "lucide-react";
import { api } from "@/lib/api";
import BrandLogo from "@/components/common/BrandLogo";

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
      setMessage("Profile successfully updated.");
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
      setMessage("Password successfully updated.");
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
    <div className="min-h-screen bg-slate-50/70 bg-grid-slate flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/85 backdrop-blur-xl">
        <div className="mx-auto flex h-20 max-w-4xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 shadow-xs transition hover:bg-slate-50"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Dashboard</span>
            </Link>

            <BrandLogo href="/" size="sm" showBadge={false} />
          </div>

          <button
            onClick={logout}
            className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold text-rose-600 transition hover:bg-rose-50"
          >
            <LogOut className="h-4 w-4" />
            <span>Log out</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-4xl w-full flex-1 px-4 py-8 sm:px-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">
            Account Settings
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Manage your personal profile and security preferences
          </p>
        </div>

        {message && (
          <div
            className={`mt-6 flex items-center gap-2.5 rounded-2xl p-4 text-sm font-medium ${
              isSuccess
                ? "border border-emerald-200 bg-emerald-50 text-emerald-800"
                : "border border-red-200 bg-red-50 text-red-800"
            }`}
          >
            {isSuccess ? (
              <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="h-5 w-5 text-red-600 shrink-0" />
            )}
            <span>{message}</span>
          </div>
        )}

        <div className="mt-8 space-y-6">
          {/* Profile Card */}
          <section className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-sm sm:p-8">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                <User className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">Profile Information</h2>
                <p className="text-xs text-slate-500">Update your public display name</p>
              </div>
            </div>

            <form onSubmit={saveProfile} className="mt-6 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Display Name
                </label>
                <div className="relative max-w-md">
                  <input
                    required
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="h-12 w-full rounded-2xl border border-slate-300/80 bg-slate-50/50 px-4 text-sm font-medium text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Email Address
                </label>
                <div className="relative max-w-md">
                  <input
                    disabled
                    type="email"
                    value={email}
                    className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-100 px-4 text-sm text-slate-500 cursor-not-allowed"
                  />
                </div>
                <p className="mt-1 text-[11px] text-slate-400">
                  Email address cannot be changed once registered.
                </p>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-2 rounded-2xl bg-blue-600 px-6 py-3 text-xs font-bold text-white shadow-sm transition hover:bg-blue-700 active:scale-95 disabled:opacity-50"
                >
                  <Save className="h-4 w-4" />
                  <span>Save Profile</span>
                </button>
              </div>
            </form>
          </section>

          {/* Password Card */}
          <section className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-sm sm:p-8">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                <KeyRound className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">Change Password</h2>
                <p className="text-xs text-slate-500">Ensure your account is using a strong password</p>
              </div>
            </div>

            <form onSubmit={changePassword} className="mt-6 space-y-4">
              <div className="max-w-md">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Current Password
                </label>
                <input
                  required
                  type="password"
                  placeholder="Enter current password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="h-12 w-full rounded-2xl border border-slate-300/80 bg-slate-50/50 px-4 text-sm font-medium text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                />
              </div>

              <div className="max-w-md">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  New Password (min 8 characters)
                </label>
                <input
                  required
                  minLength={8}
                  type="password"
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="h-12 w-full rounded-2xl border border-slate-300/80 bg-slate-50/50 px-4 text-sm font-medium text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-2 rounded-2xl border border-slate-300 bg-white px-6 py-3 text-xs font-bold text-slate-700 shadow-xs transition hover:border-blue-400 hover:text-blue-600 active:scale-95 disabled:opacity-50"
                >
                  <Lock className="h-4 w-4" />
                  <span>Update Password</span>
                </button>
              </div>
            </form>
          </section>
        </div>
      </main>
    </div>
  );
}
