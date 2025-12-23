import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../firebase/firebase";
import { useAuth } from "../../hooks/useAuth";

const INTERESTS = [
  "AI / ML",
  "Web Development",
  "App Development",
  "Data Science",
  "Cyber Security",
  "Competitive Programming",
  "UI / UX",
];

export default function ProfileSetup() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // original destination
  const from =
    (location.state as any)?.from || "/";

  const [name, setName] = useState(user?.name ?? "");
  const [branch, setBranch] = useState("");
  const [interests, setInterests] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  if (!user) return null;

  const toggleInterest = (value: string) => {
    setInterests((prev) =>
      prev.includes(value)
        ? prev.filter((i) => i !== value)
        : [...prev, value]
    );
  };

  const handleContinue = async () => {
    if (!name || !branch || interests.length === 0) return;

    try {
      setSaving(true);

      await updateDoc(doc(db, "users", user.uid), {
        name,
        branch,
        interests,
        profileCompleted: true,
        updatedAt: serverTimestamp(),
      });

      navigate(from, { replace: true }); // ✅ EXPLICIT
    } catch (err) {
      console.error("Profile setup failed", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-xl bg-white p-8 rounded-2xl shadow-xl"
      >
        <h1 className="text-2xl font-bold mb-1">Complete your profile</h1>

        <input
          className="mt-4 w-full px-4 py-3 border rounded-lg"
          placeholder="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          className="mt-4 w-full px-4 py-3 border rounded-lg"
          placeholder="Branch / Department"
          value={branch}
          onChange={(e) => setBranch(e.target.value)}
        />

        <div className="mt-6 flex flex-wrap gap-2">
          {INTERESTS.map((i) => {
            const active = interests.includes(i);
            return (
              <button
                key={i}
                onClick={() => toggleInterest(i)}
                className={`px-4 py-2 rounded-full border ${
                  active
                    ? "bg-blue-600 text-white"
                    : "hover:border-blue-400"
                }`}
              >
                {i}
              </button>
            );
          })}
        </div>

        <button
          onClick={handleContinue}
          disabled={saving}
          className="mt-8 w-full bg-slate-900 text-white py-3 rounded-lg font-semibold hover:bg-slate-800"
        >
          Continue
        </button>
      </motion.div>
    </div>
  );
}
