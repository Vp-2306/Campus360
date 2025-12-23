import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../../hooks/useAuth";

export default function Login() {
  const { loginWithEmail, signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // where user wanted to go before login
  const from =
    (location.state as any)?.from || "/career/guidance";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      setLoading(true);
      await loginWithEmail(email, password);
      navigate(from, { replace: true }); // ✅ RETURN BACK
    } catch (err: any) {
      setError(err?.message ?? "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError("");
    try {
      setLoading(true);
      await signInWithGoogle();
      navigate(from, { replace: true }); // ✅ RETURN BACK
    } catch (err: any) {
      setError(err?.message ?? "Google login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <motion.form
        onSubmit={handleLogin}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl"
      >
        <h1 className="text-2xl font-bold mb-2">Welcome back</h1>
        <p className="text-sm text-slate-500 mb-6">
          Log in to continue
        </p>

        <input
          type="email"
          required
          placeholder="Email"
          className="w-full mb-3 px-4 py-3 border rounded-lg"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          required
          placeholder="Password"
          className="w-full mb-4 px-4 py-3 border rounded-lg"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {error && (
          <p className="text-red-500 text-sm mb-3">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-slate-900 text-white py-3 rounded-lg font-semibold hover:bg-slate-800 cursor-pointer"
        >
          Log In
        </button>

        <div className="my-6 text-center text-slate-400">OR</div>

        <button
          type="button"
          onClick={handleGoogleLogin}
          className="w-full border py-3 rounded-lg hover:bg-slate-50 cursor-pointer"
        >
          Continue with Google
        </button>

        <p className="mt-6 text-sm text-center text-slate-500">
          Don’t have an account?{" "}
          <Link
            to="/auth/signup"
            className="text-blue-600 font-medium hover:underline"
          >
            Sign up
          </Link>
        </p>
      </motion.form>
    </div>
  );
}
