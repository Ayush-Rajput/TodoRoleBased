import { FormEvent, useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { ApiError } from "../api";
import { useAuth } from "../state/AuthContext";

export function AuthPage() {
  const { login, signup } = useAuth();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");

    try {
      if (mode === "signup") {
        await signup(name, email, password);
      } else {
        await login(email, password);
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Unable to authenticate");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="grid min-h-screen bg-[#f6f7f9] lg:grid-cols-[1fr_520px]">
      <section className="flex items-center px-6 py-12 sm:px-10 lg:px-16">
        <div className="max-w-2xl">
          <p className="mb-4 text-sm font-bold uppercase tracking-widest text-pine">Full-stack team operations</p>
          <h1 className="text-4xl font-extrabold leading-tight text-ink sm:text-5xl">Team Task Manager</h1>
          <p className="mt-5 max-w-xl text-lg leading-8 text-slate-600">
            Create projects, invite teammates, assign work, and track status from one role-aware dashboard.
          </p>
          <div className="mt-8 grid gap-3 text-sm text-slate-700 sm:grid-cols-2">
            {["JWT authentication", "Admin/member access", "Task assignment", "Overdue tracking"].map((item) => (
              <div className="flex items-center gap-2" key={item}>
                <CheckCircle2 className="text-pine" size={18} />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="flex items-center bg-white px-6 py-10 shadow-xl sm:px-10">
        <form onSubmit={handleSubmit} className="w-full space-y-5">
          <div>
            <h2 className="text-2xl font-extrabold text-ink">{mode === "login" ? "Welcome back" : "Create account"}</h2>
            <p className="mt-1 text-sm text-slate-500">Use admin@example.com / password123 after seeding.</p>
          </div>

          <div className="grid grid-cols-2 rounded-md bg-mist p-1">
            <button type="button" className={`rounded-md py-2 text-sm font-bold ${mode === "login" ? "bg-white text-pine shadow-sm" : "text-slate-600"}`} onClick={() => setMode("login")}>
              Login
            </button>
            <button type="button" className={`rounded-md py-2 text-sm font-bold ${mode === "signup" ? "bg-white text-pine shadow-sm" : "text-slate-600"}`} onClick={() => setMode("signup")}>
              Signup
            </button>
          </div>

          {mode === "signup" && (
            <label className="block text-sm font-semibold text-slate-700">
              Name
              <input className="field mt-1" value={name} onChange={(event) => setName(event.target.value)} required minLength={2} />
            </label>
          )}

          <label className="block text-sm font-semibold text-slate-700">
            Email
            <input className="field mt-1" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
          </label>

          <label className="block text-sm font-semibold text-slate-700">
            Password
            <input className="field mt-1" type="password" value={password} onChange={(event) => setPassword(event.target.value)} required minLength={8} />
          </label>

          {error && <p className="rounded-md bg-coral/10 px-3 py-2 text-sm font-semibold text-coral">{error}</p>}

          <button className="btn btn-primary w-full" disabled={busy}>
            {busy ? "Working..." : mode === "login" ? "Login" : "Create account"}
          </button>
        </form>
      </section>
    </main>
  );
}
