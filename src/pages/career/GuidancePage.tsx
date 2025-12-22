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
} from "firebase/firestore";
import { db } from "../../firebase/firebase";
import { useAuth } from "../../hooks/useAuth";

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
};

/* ----------------------------- COMPONENT -------------------------------- */

export default function GuidancePage() {
  const { user } = useAuth();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [liked, setLiked] = useState<Record<string, boolean>>({});
  const [answersMap, setAnswersMap] = useState<Record<string, Answer[]>>({});
  const [answerText, setAnswerText] = useState("");
  const [loading, setLoading] = useState(true);

  // Ask Doubt modal
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tag, setTag] = useState("AI / ML");
  const [submitting, setSubmitting] = useState(false);

  /* -------------------------- REAL-TIME QUESTIONS ------------------------- */

  useEffect(() => {
    const q = query(
      collection(db, "questions"),
      orderBy("createdAt", "desc")
    );

    const unsub = onSnapshot(q, async (snapshot) => {
      const data: Question[] = [];

      for (const d of snapshot.docs) {
        const likesSnap = await getDocs(
          collection(db, "questions", d.id, "likes")
        );

        data.push({
          id: d.id,
          title: d.data().title,
          description: d.data().description,
          tag: d.data().tag,
          helpfulCount: likesSnap.size,
        });

        if (user) {
          setLiked((prev) => ({
            ...prev,
            [d.id]: likesSnap.docs.some(
              (l) => l.id === user.uid
            ),
          }));
        }
      }

      setQuestions(data);
      setLoading(false);
    });

    return () => unsub();
  }, [user]);

  /* ----------------------------- LIKES ----------------------------------- */

  const toggleLike = async (questionId: string) => {
    if (!user) return;

    const likeRef = doc(
      db,
      "questions",
      questionId,
      "likes",
      user.uid
    );

    const alreadyLiked = liked[questionId];

    // optimistic UI
    setLiked((prev) => ({
      ...prev,
      [questionId]: !alreadyLiked,
    }));

    setQuestions((prev) =>
      prev.map((q) =>
        q.id === questionId
          ? {
              ...q,
              helpfulCount:
                q.helpfulCount + (alreadyLiked ? -1 : 1),
            }
          : q
      )
    );

    if (alreadyLiked) {
      await deleteDoc(likeRef);
    } else {
      await setDoc(likeRef, {
        createdAt: serverTimestamp(),
      });
    }
  };

  /* ----------------------------- ANSWERS --------------------------------- */

  const loadAnswers = (questionId: string) => {
    return onSnapshot(
      collection(db, "questions", questionId, "answers"),
      (snapshot) => {
        const answers: Answer[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<Answer, "id">),
        }));

        setAnswersMap((prev) => ({
          ...prev,
          [questionId]: answers,
        }));
      }
    );
  };

  const postAnswer = async (questionId: string) => {
    if (!user || user.role !== "guide" || !answerText.trim())
      return;

    await addDoc(
      collection(db, "questions", questionId, "answers"),
      {
        text: answerText,
        authorName: user.name,
        authorId: user.uid,
        createdAt: serverTimestamp(),
      }
    );

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

  /* -------------------------------- UI ----------------------------------- */

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      <div className="max-w-7xl mx-auto px-6 py-10">
        <h1 className="text-4xl font-extrabold mb-8">
          Public Guidance Wall
        </h1>

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
                      if (!isExpanded) loadAnswers(q.id);
                      setExpandedId(isExpanded ? null : q.id);
                    }}
                  >
                    <span
                      className={`inline-block mb-3 text-xs font-semibold px-3 py-1 rounded-full ${
                        tagColorMap[q.tag]
                      }`}
                    >
                      {q.tag}
                    </span>

                    <h3 className="text-xl font-semibold">
                      {q.title}
                    </h3>

                    <div
                      className="mt-5 flex gap-6 text-sm"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={() => toggleLike(q.id)}
                        className={`${
                          liked[q.id]
                            ? "text-green-600 font-semibold"
                            : "text-slate-500"
                        }`}
                      >
                        👍 {q.helpfulCount} Helpful
                      </button>

                      <button
                        onClick={() =>
                          setExpandedId(isExpanded ? null : q.id)
                        }
                        className="text-slate-500"
                      >
                        💬 Answers
                      </button>
                    </div>

                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="mt-6 pt-6 border-t border-slate-100"
                        >
                          <p className="text-slate-600 border-l-4 border-orange-400 pl-4 mb-6">
                            {q.description}
                          </p>

                          {/* ANSWER BOX */}
                          {user?.role === "guide" ? (
                            <div
                              className="bg-slate-50 border rounded-xl p-4 mb-4"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <textarea
                                value={answerText}
                                onChange={(e) =>
                                  setAnswerText(e.target.value)
                                }
                                rows={3}
                                placeholder="Write your answer..."
                                className="w-full bg-transparent outline-none text-sm"
                              />
                              <div className="flex justify-end mt-3">
                                <button
                                  onClick={() => postAnswer(q.id)}
                                  className="bg-blue-600 text-white text-sm px-4 py-1.5 rounded-lg"
                                >
                                  Post Answer
                                </button>
                              </div>
                            </div>
                          ) : (
                            <p className="text-xs text-slate-400 italic mb-4">
                              Only verified guides can answer.
                            </p>
                          )}

                          {/* ANSWERS LIST */}
                          {(answersMap[q.id] || []).map((ans) => (
                            <div
                              key={ans.id}
                              className="bg-white rounded-xl p-4 shadow-sm mb-3"
                            >
                              <p className="text-sm text-slate-700">
                                {ans.text}
                              </p>
                              <p className="mt-2 text-xs text-slate-400">
                                — {ans.authorName}
                              </p>
                            </div>
                          ))}
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
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="font-semibold mb-2">
                Connect with Guides
              </h3>
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
              <h2 className="text-xl font-semibold mb-4">
                Ask a Doubt
              </h2>

              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Title"
                className="w-full mb-3 px-4 py-2 border rounded-lg"
              />

              <textarea
                value={description}
                onChange={(e) =>
                  setDescription(e.target.value)
                }
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
                <button onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button
                onClick={handlePostQuestion}
                disabled={submitting}
                className="bg-orange-500 text-white px-5 py-2 rounded-lg disabled:opacity-60"
                >
                {submitting ? "Posting..." : "Post"}
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
