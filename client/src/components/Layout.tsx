import { BarChart3, FolderKanban, LogOut } from "lucide-react";
import type { ReactNode } from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../state/AuthContext";

export function Layout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const link = "inline-flex h-10 items-center gap-2 rounded-md px-3 text-sm font-semibold";

  return (
    <div className="min-h-screen bg-[#f6f7f9]">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
          <div>
            <p className="text-lg font-extrabold text-ink">Team Task Manager</p>
            <p className="text-xs text-slate-500">{user?.name} · {user?.email}</p>
          </div>
          <nav className="flex items-center gap-2">
            <NavLink to="/" className={({ isActive }) => `${link} ${isActive ? "bg-mist text-pine" : "text-slate-600 hover:bg-slate-100"}`}>
              <BarChart3 size={18} /> Dashboard
            </NavLink>
            <NavLink to="/projects" className={({ isActive }) => `${link} ${isActive ? "bg-mist text-pine" : "text-slate-600 hover:bg-slate-100"}`}>
              <FolderKanban size={18} /> Projects
            </NavLink>
            <button className="btn btn-secondary" onClick={logout} title="Log out">
              <LogOut size={18} /> Logout
            </button>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">{children}</main>
    </div>
  );
}
