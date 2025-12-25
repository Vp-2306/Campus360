import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  collection,
  orderBy,
  query,
  addDoc,
  serverTimestamp,
  onSnapshot,
  doc,
  setDoc,
  deleteDoc,
  getDocs,
  getDoc,
} from "firebase/firestore";
import { db } from "../../firebase/firebase";
import { useAuth } from "../../hooks/useAuth";
import { runTransaction, increment } from "firebase/firestore";


/* -------------------------------- TYPES -------------------------------- */

type Question = {
  id: string;
  title: string;
  description: string;
  tag: string;
  helpfulCount: number;
};

type Answer = {
  id: string;
  text: string;
  authorName: string;
  authorId: string;
  helpfulCount: number;
};

/* ----------------------------- COMPONENT -------------------------------- */

export default function GuidancePage() {
  const { user } = useAuth();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const [answersMap, setAnswersMap] = useState<Record<string, Answer[]>>({});
  const [answerText, setAnswerText] = useState("");
  const [loading, setLoading] = useState(true);

  /* Ask Doubt */
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tag, setTag] = useState("AI / ML");
  const [submitting, setSubmitting] = useState(false);
  const [answerUnsub, setAnswerUnsub] = useState<null | (() => void)>(null);
  const [liking, setLiking] = useState<Record<string, boolean>>({});

  /* Become Guide */
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [acceptedResponsibility, setAcceptedResponsibility] = useState(false);
  const [alreadyApplied, setAlreadyApplied] = useState(false);

  /* -------------------------- REAL-TIME QUESTIONS ------------------------- */

  useEffect(() => {
    const q = query(collection(db, "questions"), orderBy("createdAt", "desc"));

    const unsub = onSnapshot(q, async (snapshot) => {
      const data: Question[] = [];

      for (const d of snapshot.docs) {
        

        data.push({
          id: d.id,
          title: d.data().title,
          description: d.data().description,
          tag: d.data().tag,
          helpfulCount: 0,
        });
      }

      setQuestions(data);
      setLoading(false);
    });

    return () => unsub();
  }, [user]);

  /* ----------------------------- GUIDE CHECK ------------------------------ */

  useEffect(() => {
    if (!user) return;

    getDoc(doc(db, "guideApplications", user.uid)).then((snap) => {
      if (snap.exists()) setAlreadyApplied(true);
    });
  }, []);

  /* ----------------------------- ANSWERS --------------------------------- */

  const loadAnswers = (questionId: string) => {
  if (answerUnsub) answerUnsub();

  const unsub = onSnapshot(
    query(collection(db, "questions", questionId, "answers"), orderBy("createdAt", "desc")),
    { includeMetadataChanges: true },
    async (snapshot) => {

      const answers: Answer[] = [];

      for (const d of snapshot.docs) {
        answers.push({
          id: d.id,
          text: d.data().text,
          authorName: d.data().authorName,
          authorId: d.data().authorId,
          helpfulCount: d.data().helpfulCount || 0,
        });
      }


      setAnswersMap((prev) => ({ ...prev, [questionId]: answers }));
    }
  );

  setAnswerUnsub(() => unsub);
};


  const postAnswer = async (questionId: string) => {
    if (!user || user.role !== "guide" || !answerText.trim()) return;

    await addDoc(collection(db, "questions", questionId, "answers"), {
      text: answerText,
      authorName: user.name,
      authorId: user.uid,
      helpfulCount: 0,
      createdAt: serverTimestamp(),
    });


    setAnswerText("");
  };

  /* ----------------------------- POST QUESTION ---------------------------- */

  const handlePostQuestion = async () => {
    if (!title.trim()) return;
    setSubmitting(true);

    await addDoc(collection(db, "questions"), {
      title,
      description,
      tag,
      createdAt: serverTimestamp(),
    });

    setTitle("");
    setDescription("");
    setTag("AI / ML");
    setShowModal(false);
    setSubmitting(false);
  };

  const toggleAnswerLike = async (qid: string, aid: string) => {
    if (!user) return;

    const likeRef = doc(db, "questions", qid, "answers", aid, "likes", user.uid);
    const answerRef = doc(db, "questions", qid, "answers", aid);

    // 🔹 Optimistic UI update
    setAnswersMap((prev) => ({
      ...prev,
      [qid]: prev[qid].map((a) =>
        a.id === aid ? { ...a, helpfulCount: a.helpfulCount + 1 } : a
      ),
    }));

    try {
      await runTransaction(db, async (tx) => {
        const likeSnap = await tx.get(likeRef);

        if (likeSnap.exists()) return; // user already liked

        tx.set(likeRef, { createdAt: Date.now() });

        tx.update(answerRef, {
          helpfulCount: increment(1),
        });
      });
    } catch (err) {
      console.error("Like failed", err);
    }
  };

  /* -------------------------- APPLY TO GUIDE ------------------------------ */

  const applyToBeGuide = async () => {
    if (!user || !acceptedResponsibility) return;

    try {
      // 1️⃣ Save application (for records)
      await setDoc(doc(db, "guideApplications", user.uid), {
        uid: user.uid,
        name: user.name,
        email: user.email,
        status: "approved", // auto-approved for now
        createdAt: serverTimestamp(),
      });

      // 2️⃣ Promote user to guide
      await setDoc(
        doc(db, "users", user.uid),
        { role: "guide" },
        { merge: true }
      );

      setShowGuideModal(false);
      setAcceptedResponsibility(false);
      setAlreadyApplied(true);

      alert("You're now a Guide! 🎉");
    } catch (err) {
      console.error("Guide promotion failed", err);
    }
  };


  /* -------------------------------- UI ----------------------------------- */

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      <div className="max-w-7xl mx-auto px-6 py-10">
        <h1 className="text-4xl font-extrabold mb-8">Public Guidance Wall</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* LEFT */}
          <div className="lg:col-span-2">
            <button
              onClick={() => setShowModal(true)}
              className="mb-6 bg-orange-500 text-white px-6 py-3 rounded-full font-semibold"
            >
              Ask a Doubt
            </button>

            {loading && <p>Loading...</p>}

            <div className="space-y-6">
              {questions.map((q) => {
                const isExpanded = expandedId === q.id;

                return (
                  <motion.div
                    key={q.id}
                    layout
                    className="bg-white p-6 rounded-2xl shadow-sm cursor-pointer"
                    onClick={() => {
                      if (isExpanded) {
                        if (answerUnsub) answerUnsub();
                        setExpandedId(null);
                      } else {
                        loadAnswers(q.id);
                        setExpandedId(q.id);
                      }
                    }}

                  >
                    <span
                      className={`inline-block mb-3 text-xs font-semibold px-3 py-1 rounded-full ${
                        tagColorMap[q.tag]
                      }`}
                    >
                      {q.tag}
                    </span>

                    <h3 className="text-xl font-semibold">{q.title}</h3>

                    

                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div className="mt-6 pt-6 border-t border-slate-100">
                          <p className="text-slate-600 border-l-4 border-orange-400 pl-4 mb-6">
                            {q.description}
                          </p>

                          {/* ANSWERS LIST */}
                          <div className="space-y-4 mb-6">
                            {(answersMap[q.id] || []).map((ans) => (
                            <motion.div
                              key={ans.id}
                              initial={{ opacity: 0, y: 6 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="bg-gradient-to-br from-white to-slate-100 p-5 rounded-2xl shadow-md border border-slate-100"
                            >
                              {/* AUTHOR HEADER */}
                              <div className="flex items-center gap-3 mb-3">
                                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 
                                                text-white flex items-center justify-center text-sm font-bold">
                                  {ans.authorName?.[0] || "G"}
                                </div>

                                <div>
                                  <p className="text-sm font-semibold text-slate-800">
                                    {ans.authorName}
                                  </p>
                                  <p className="text-xs text-slate-400">Verified Guide</p>
                                </div>
                              </div>

                              {/* ANSWER TEXT */}
                              <p className="text-sm text-slate-800 leading-relaxed">
                                {ans.text}
                              </p>

                              {/* LIKE BUTTON */}
                              <div
                                className="flex justify-end mt-4"
                                onPointerDown={(e) => e.stopPropagation()}
                                onClick={(e) => e.stopPropagation()}
                              >
                                <button
                                  onClick={() => toggleAnswerLike(q.id, ans.id)}
                                  className="flex items-center gap-2 px-5 py-2 rounded-full 
                                            bg-green-100 hover:bg-green-200 text-green-700 
                                            text-sm font-semibold transition shadow-sm"
                                >
                                  👍 Helpful · {ans.helpfulCount}
                                </button>
                              </div>
                            </motion.div>

                            ))}
                          </div>

                          {/* ANSWER INPUT BELOW ANSWERS */}
                          {user?.role === "guide" ? (
                            <div
                              className="bg-white border border-slate-200 rounded-2xl p-5 shadow-inner"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <textarea
                                value={answerText}
                                onChange={(e) => setAnswerText(e.target.value)}
                                rows={4}
                                placeholder="Share your knowledge with students..."
                                className="w-full resize-none bg-transparent outline-none text-sm text-slate-700 placeholder:text-slate-400"
                              />

                              <div className="flex justify-end mt-4">
                                <button
                                  onClick={() => postAnswer(q.id)}
                                  className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-full text-sm font-semibold transition shadow-md"
                                >
                                  Post Answer
                                </button>
                              </div>
                            </div>
                          ) : (
                            <p className="text-xs text-slate-400 italic mt-6">
                              Only verified guides can answer.
                            </p>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* RIGHT */}
          <div className="space-y-8">
            {user?.role === "student" && !alreadyApplied && (
              <div className="rounded-2xl p-5 bg-gradient-to-br from-blue-50 to-purple-50">
                <p className="text-xs text-slate-500 mb-2 uppercase">
                  Want to help?
                </p>
                <button
                  onClick={() => setShowGuideModal(true)}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold"
                >
                  Become a Guide
                </button>
              </div>
            )}

            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="font-semibold mb-2">Connect with Guides</h3>
              <p className="text-sm text-slate-500">
                Mentor profiles coming soon
              </p>
            </div>

            <div className="rounded-2xl p-6 bg-gradient-to-br from-orange-500 to-pink-500 text-white shadow-lg">
              <h3 className="font-semibold mb-2">
                Top Guides Leaderboard
              </h3>
              <p className="text-sm opacity-90">
                Based on answers & likes
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ASK DOUBT MODAL */}
      <AnimatePresence>
        {showModal && (
          <motion.div className="fixed inset-0 bg-black/40 flex items-center justify-center">
            <motion.div className="bg-white p-6 rounded-2xl w-full max-w-lg">
              <h2 className="text-xl font-semibold mb-4">Ask a Doubt</h2>

              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Title"
                className="w-full mb-3 px-4 py-2 border rounded-lg"
              />

              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                placeholder="Description"
                className="w-full mb-3 px-4 py-2 border rounded-lg"
              />

              <select
                value={tag}
                onChange={(e) => setTag(e.target.value)}
                className="w-full mb-5 px-4 py-2 border rounded-lg"
              >
                {Object.keys(tagColorMap).map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>

              <div className="flex justify-end gap-3">
                <button onClick={() => setShowModal(false)}>Cancel</button>
                <button
                  onClick={handlePostQuestion}
                  disabled={submitting}
                  className="bg-orange-500 text-white px-5 py-2 rounded-lg"
                >
                  {submitting ? "Posting..." : "Post"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* GUIDE MODAL */}
      <AnimatePresence>
        {showGuideModal && (
          <motion.div className="fixed inset-0 bg-black/40 flex items-center justify-center">
            <motion.div className="bg-white p-6 rounded-2xl w-full max-w-md">
              <h2 className="text-xl font-bold mb-2">Become a Guide</h2>

              <label className="flex gap-3 mb-6 text-sm">
                <input
                  type="checkbox"
                  checked={acceptedResponsibility}
                  onChange={(e) =>
                    setAcceptedResponsibility(e.target.checked)
                  }
                />
                I agree to provide respectful and high-quality guidance.
              </label>

              <div className="flex justify-end gap-3">
                <button onClick={() => setShowGuideModal(false)}>
                  Cancel
                </button>
                <button
                  disabled={!acceptedResponsibility}
                  onClick={applyToBeGuide}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg disabled:opacity-50"
                >
                  Apply
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ------------------------------ TAG COLORS ------------------------------- */

const tagColorMap: Record<string, string> = { 
  "AI / ML": "bg-blue-100 text-blue-600",
  "WEB DEV": "bg-purple-100 text-purple-600",
  CAREER: "bg-green-100 text-green-600",
};
