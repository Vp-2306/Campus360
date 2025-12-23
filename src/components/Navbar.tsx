import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function Navbar() {
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <nav className="sticky top-0 z-50 bg-white/70 backdrop-blur border-b">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

        {/* Logo */}
        <div
          onClick={() => navigate("/")}
          className="flex items-center gap-2 font-semibold text-lg cursor-pointer"
        >
          <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center">
            CC
          </div>
          CareerCompanion
        </div>

        {/* Nav links */}
        <div className="hidden md:flex gap-8 text-sm font-medium text-slate-700">
          <Link to="/" className="hover:text-blue-600">
            Home
          </Link>
          <Link to="/career/guidance" className="hover:text-blue-600">
            Guidance
          </Link>
          <Link to="/career/projects" className="hover:text-blue-600">
            Projects & Events
          </Link>
          <Link to="/career/buzz" className="hover:text-blue-600">
            Campus Buzz
          </Link>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4">
          {loading ? null : !user ? (
            <>
              <Link
                to="/auth/login"
                className="text-sm text-slate-600 hover:text-slate-900"
              >
                Log In
              </Link>

              <Link
                to="/auth/signup"
                className="bg-slate-900 text-white px-5 py-2 rounded-full text-sm hover:bg-slate-800 transition"
              >
                Sign Up
              </Link>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <span className="text-sm text-slate-600">
                {user.name ?? "User"}
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
