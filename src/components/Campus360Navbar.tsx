import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function Campus360Navbar() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  return (
    <nav className="sticky top-0 z-50 bg-white/60 backdrop-blur-xl border-b border-white/20 shadow-sm">
      <div className="max-w-7xl mx-auto px-10 py-4 flex justify-between items-center">

        {/* ===== LOGO ===== */}
        <div
          onClick={() => navigate("/")}
          className="flex items-center gap-4 cursor-pointer"
        >
          {/* LOGO ICON */}
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 shadow-md flex items-center justify-center">
            <div className="grid grid-cols-3 grid-rows-3 gap-[2px] w-6 h-6">
              <div className="bg-white/90 rounded-sm col-span-3 h-[4px]" />
              <div className="bg-white/90 rounded-sm" />
              <div className="bg-white/60 rounded-sm" />
              <div className="bg-white/90 rounded-sm" />
              <div className="bg-white/60 rounded-sm" />
              <div className="bg-white/90 rounded-sm" />
              <div className="bg-white/90 rounded-sm col-span-3 h-[4px]" />
            </div>
          </div>

          <div className="flex flex-col leading-tight">
            <span className="text-xl font-extrabold tracking-tight text-slate-900">
              Campus360
            </span>
            <span className="text-xs text-slate-500">
              Campus Infrastructure Platform
            </span>
          </div>
        </div>

        {/* ===== ACTIONS ===== */}
        {!user ? (
          <div className="flex gap-3">
            <button
              onClick={() => navigate("/auth/login")}
              className="px-6 py-2 rounded-full text-sm text-slate-600 border border-slate-300 hover:bg-slate-50"
            >
              Login
            </button>
            <button
              onClick={() => navigate("/auth/signup")}
              className="px-6 py-2 rounded-full bg-indigo-600 text-white shadow hover:bg-indigo-700 transition"
            >
              Sign Up
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-slate-100 px-4 py-2 rounded-full">
              <div className="w-7 h-7 bg-indigo-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                {user.name?.[0]}
              </div>
              <span className="text-slate-600 text-sm font-medium">
                {user.name}
              </span>
            </div>

            <button
              onClick={logout}
              className="px-5 py-2 rounded-full text-sm bg-red-50 text-red-600 hover:bg-red-100 transition"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
