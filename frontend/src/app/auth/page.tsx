"use client";

import { useState, FormEvent } from "react";
import { Zap, User, Building2, Eye, EyeOff, AlertCircle } from "lucide-react";
import { useAuth } from "@/lib/auth";
import Button from "@/components/ui/Button";

type Tab = "login" | "register";
type Role = "student" | "company";

export default function AuthPage() {
  const { login, register } = useAuth();
  const [tab, setTab] = useState<Tab>("login");
  const [role, setRole] = useState<Role>("student");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Form fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [companyName, setCompanyName] = useState("");

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ||
        "Invalid email or password. Try demo credentials below.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    if (password !== password2) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      await register({
        email,
        username: email.split("@")[0],
        first_name: firstName,
        last_name: lastName,
        password,
        password2,
        role,
        company_name: role === "company" ? companyName : undefined,
      });
    } catch (err: unknown) {
      const data = (err as { response?: { data?: Record<string, string[]> } })?.response?.data;
      if (data) {
        const messages = Object.values(data).flat().join(" ");
        setError(messages || "Registration failed. Please check your details.");
      } else {
        setError("Could not connect to the server. Check that your backend is running.");
      }
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full rounded-lg bg-gray-800 border border-gray-700 text-white placeholder-gray-500 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all";

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-600">
              <Zap size={20} className="text-white" />
            </div>
            <span className="text-xl font-bold text-white">Agon</span>
          </div>
        </div>

        {/* Card */}
        <div className="rounded-2xl bg-gray-900 border border-gray-800 p-8">
          {/* Tab toggle */}
          <div className="flex gap-1 p-1 rounded-lg bg-gray-800 mb-8">
            {(["login", "register"] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => { setTab(t); setError(""); }}
                className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                  tab === t
                    ? "bg-gray-900 text-white shadow"
                    : "text-gray-500 hover:text-gray-300"
                }`}
              >
                {t === "login" ? "Log In" : "Sign Up"}
              </button>
            ))}
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-start gap-3 p-4 rounded-lg bg-red-900/20 border border-red-700/40 text-red-400 text-sm mb-6">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              {error}
            </div>
          )}

          {/* ── LOGIN FORM ── */}
          {tab === "login" && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Email</label>
                <input
                  type="email"
                  required
                  placeholder="you@example.com"
                  className={inputClass}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="••••••••"
                    className={`${inputClass} pr-10`}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <Button type="submit" loading={loading} className="w-full mt-2" size="lg">
                Log in
              </Button>
            </form>
          )}

          {/* ── REGISTER FORM ── */}
          {tab === "register" && (
            <form onSubmit={handleRegister} className="space-y-4">
              {/* Role selector */}
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-2">
                  I am a...
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {(["student", "company"] as Role[]).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRole(r)}
                      className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                        role === r
                          ? "border-violet-500 bg-violet-600/10"
                          : "border-gray-700 bg-gray-800 hover:border-gray-600"
                      }`}
                    >
                      {r === "student" ? (
                        <User size={22} className={role === r ? "text-violet-400" : "text-gray-500"} />
                      ) : (
                        <Building2 size={22} className={role === r ? "text-violet-400" : "text-gray-500"} />
                      )}
                      <span className={`text-sm font-medium ${role === r ? "text-white" : "text-gray-400"}`}>
                        {r === "student" ? "Student" : "Company"}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">First name</label>
                  <input type="text" required placeholder="Ada" className={inputClass}
                    value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">Last name</label>
                  <input type="text" required placeholder="Lovelace" className={inputClass}
                    value={lastName} onChange={(e) => setLastName(e.target.value)} />
                </div>
              </div>

              {role === "company" && (
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">Company name</label>
                  <input type="text" required placeholder="Acme Corp" className={inputClass}
                    value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Email</label>
                <input type="email" required placeholder="you@example.com" className={inputClass}
                  value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Password</label>
                <div className="relative">
                  <input type={showPassword ? "text" : "password"} required placeholder="8+ characters"
                    className={`${inputClass} pr-10`} value={password}
                    onChange={(e) => setPassword(e.target.value)} />
                  <button type="button" onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Confirm password</label>
                <input type={showPassword ? "text" : "password"} required placeholder="Repeat password"
                  className={inputClass} value={password2}
                  onChange={(e) => setPassword2(e.target.value)} />
              </div>

              <Button type="submit" loading={loading} className="w-full mt-2" size="lg">
                Create account
              </Button>
            </form>
          )}

          {/* Switch tab */}
          <p className="mt-6 text-center text-sm text-gray-500">
            {tab === "login" ? "Don't have an account? " : "Already have an account? "}
            <button
              onClick={() => { setTab(tab === "login" ? "register" : "login"); setError(""); }}
              className="text-violet-400 hover:text-violet-300 font-medium"
            >
              {tab === "login" ? "Sign up" : "Log in"}
            </button>
          </p>
        </div>

        {/* Demo hint */}
        <p className="mt-4 text-center text-xs text-gray-600">
          Backend not running? Register an account to explore with demo data.
        </p>
      </div>
    </div>
  );
}
