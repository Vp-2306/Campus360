import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../../hooks/useAuth";

export default function Signup() {
  const { signupWithEmail, signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // where user wanted to go originally
  const from =
    (location.state as any)?.from || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const goToProfileSetup = () => {
    navigate("/profile-setup", {
      replace: true,
      state: { from },
    });
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }

    try {
      setLoading(true);
      await signupWithEmail(email, password);
      goToProfileSetup(); // ✅ EXPLICIT
    } catch (err: any) {
      setError(err?.message ?? "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setError("");
    try {
      setLoading(true);
      await signInWithGoogle();
      goToProfileSetup(); // ✅ EXPLICIT
    } catch (err: any) {
      setError(err?.message ?? "Google signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <motion.form
        onSubmit={handleSignup}
        className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl"
      >
        <h1 className="text-2xl font-bold mb-2">Create your account</h1>

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
          className="w-full mb-3 px-4 py-3 border rounded-lg"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <input
          type="password"
          required
          placeholder="Confirm Password"
          className="w-full mb-4 px-4 py-3 border rounded-lg"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
        />

        {error && (
          <p className="text-red-500 text-sm mb-3">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700"
        >
          Sign Up
        </button>

        <div className="my-6 text-center text-slate-400">OR</div>

        <button
          type="button"
          onClick={handleGoogleSignup}
          className="w-full border py-3 rounded-lg hover:bg-slate-50"
        >
          Continue with Google
        </button>
      </motion.form>
    </div>
  );
}
