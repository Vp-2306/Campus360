import { useAuth } from "../hooks/useAuth";

export default function Navbar() {
  const { user, loading, signIn, logout } = useAuth();

  return (
    <nav className="sticky top-0 z-[9999] bg-white/70 backdrop-blur border-b pointer-events-auto">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

        {/* Logo */}
        <div className="flex items-center gap-2 font-semibold text-lg">
          <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center">
            CC
          </div>
          CareerCompanion
        </div>

        {/* Nav links */}
        <div className="hidden md:flex gap-8 text-sm font-medium text-slate-700">
          <a className="text-blue-600 cursor-pointer">Home</a>
          <a className="hover:text-blue-600 cursor-pointer">Guidance</a>
          <a className="hover:text-blue-600 cursor-pointer">
            Projects & Events
          </a>
          <a className="hover:text-blue-600 cursor-pointer">Profile</a>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4">
          {loading ? null : !user ? (
            <>
              <button
                onClick={signIn}
                className="text-sm text-slate-600 hover:text-slate-900"
              >
                Log In
              </button>

              <button
                onClick={signIn}
                className="bg-slate-900 text-white px-5 py-2 rounded-full text-sm hover:bg-slate-800 transition"
              >
                Sign Up
              </button>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <span className="text-sm text-slate-600">
                {user.name}
              </span>

              <button
                onClick={logout}
                className="px-4 py-1.5 text-sm rounded-full border border-slate-300 hover:bg-slate-100 transition"
              >
                Logout
              </button>
            </div>
          )}
        </div>

      </div>
    </nav>
  );
}
