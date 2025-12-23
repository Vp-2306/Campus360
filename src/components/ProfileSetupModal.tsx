import { useState } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase/firebase";
import { useAuth } from "../hooks/useAuth";

export default function ProfileSetupModal({
  onComplete,
}: {
  onComplete: () => void;
}) {
  const { user } = useAuth();

  const [college, setCollege] = useState("");
  const [branch, setBranch] = useState("");
  const [year, setYear] = useState("");
  const [role, setRole] = useState<"student" | "guide">("student");

  if (!user) return null;

  const saveProfile = async () => {
    await updateDoc(doc(db, "users", user.uid), {
      college,
      branch,
      graduationYear: Number(year),
      role,
      profileCompleted: true,
    });
    onComplete();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[9999]">
      <div className="bg-white p-6 rounded-2xl w-full max-w-lg">
        <h2 className="text-xl font-semibold mb-4">
          Complete your profile
        </h2>

        <input
          placeholder="College"
          value={college}
          onChange={(e) => setCollege(e.target.value)}
          className="w-full mb-3 px-4 py-2 border rounded-lg"
        />
        <input
          placeholder="Branch"
          value={branch}
          onChange={(e) => setBranch(e.target.value)}
          className="w-full mb-3 px-4 py-2 border rounded-lg"
        />
        <input
          placeholder="Graduation Year"
          value={year}
          onChange={(e) => setYear(e.target.value)}
          className="w-full mb-4 px-4 py-2 border rounded-lg"
        />

        <div className="flex gap-3 mb-6">
          {["student", "guide"].map((r) => (
            <button
              key={r}
              onClick={() => setRole(r as any)}
              className={`px-4 py-2 rounded-full border ${
                role === r
                  ? "bg-blue-600 text-white"
                  : "text-slate-600"
              }`}
            >
              {r}
            </button>
          ))}
        </div>

        <button
          onClick={saveProfile}
          className="w-full bg-slate-900 text-white py-3 rounded-xl"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
