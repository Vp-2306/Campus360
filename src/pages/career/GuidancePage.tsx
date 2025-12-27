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
  getDoc,
  where,
  limit,
  updateDoc,
} from "firebase/firestore";
import { db } from "../../firebase/firebase";
import { useAuth } from "../../hooks/useAuth";
import { runTransaction, increment } from "firebase/firestore";
import { useNavigate } from "react-router-dom";


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

type GuideUser = {
  totalAnswers?: number;
  totalHelpfulLikes?: number;
  helpfulSessions?: number;
  reputation?: number;
  trophies?: number;
};

/* ----------------------------- COMPONENT -------------------------------- */

export default function GuidancePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
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
  const [connectionStatus, setConnectionStatus] = useState<Record<string,string>>({});
  /* Become Guide */
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [acceptedResponsibility, setAcceptedResponsibility] = useState(false);
  const [alreadyApplied, setAlreadyApplied] = useState(false);

  const [guides, setGuides] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [selectedTag, setSelectedTag] = useState("ALL");
  const [requests, setRequests] = useState<any[]>([]);
  const [pendingMap, setPendingMap] = useState<Record<string, boolean>>({});

  const [leaderboard,setLeaderboard] = useState<any[]>([]);
  const [myConnections, setMyConnections] = useState<any[]>([]);


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

  useEffect(() => {
    const q = query(collection(db, "users"));

    return onSnapshot(q, (snap) => {
      const list: any[] = [];
      snap.docs.forEach(d => {
        const data = d.data();
        if (data.role === "guide") {
          list.push({ id: d.id, ...data });
        }
      });
      setGuides(list);
    });
  }, []);

  useEffect(() => {
    if (!user || user.role !== "guide") return;

    const q = query(
      collection(db,"connections"),
      where("to","==",user.uid),
      where("status","==","pending")
    );

    return onSnapshot(q, snap => {
      const arr:any[] = snap.docs.map(d => ({ id:d.id, ...d.data() }));
      setRequests(arr);
    });
  }, [user]);

  useEffect(() => {
    if (!user || user.role !== "student") return;

    const q = query(collection(db, "users"), where("role", "==", "guide"));
    return onSnapshot(q, snap => {
      const arr: any[] = [];
      snap.forEach(d => arr.push({ id: d.id, ...d.data() }));
      setGuides(arr);
    });
  }, [user]);


  useEffect(() => {
    if (!user || user.role !== "student") return;

    const q = query(collection(db,"connections"), where("from","==",user.uid));

    return onSnapshot(q, snap => {
      const map: Record<string,string> = {};
      snap.docs.forEach(d=>{
        map[d.data().to] = d.data().status; // pending | accepted | rejected
      });
      setConnectionStatus(map);
    });
  }, [user]);


  useEffect(() => {
    const q = query(
      collection(db,"users"),
      where("role","==","guide"),
      orderBy("reputation","desc"),
      limit(5)
    );

    return onSnapshot(q,(snap)=>{
      setLeaderboard(
        snap.docs.map(d => ({ id:d.id, ...d.data() }))
      );
    });
  },[]);

  useEffect(() => {
    if (!user) return;

    const q = user.role === "student"
      ? query(collection(db,"connections"), where("from","==",user.uid), where("status","==","accepted"))
      : query(collection(db,"connections"), where("to","==",user.uid), where("status","==","accepted"));

    return onSnapshot(q, snap => {
      setMyConnections(snap.docs.map(d => ({ id:d.id, ...d.data() })));
    });
  }, [user]);


  /* ----------------------------- ANSWERS --------------------------------- */

  const loadAnswers = (questionId: string) => {
    if (answerUnsub) answerUnsub();

    const unsub = onSnapshot(
      query(collection(db,"questions",questionId,"answers"), orderBy("createdAt","desc")),
      snapshot => {
        const answers: Answer[] = snapshot.docs.map(d => ({
          id: d.id,
          text: d.data().text,
          authorName: d.data().authorName,
          authorId: d.data().authorId,
          helpfulCount: d.data().helpfulCount || 0,
        }));

        setAnswersMap(prev => ({ ...prev, [questionId]: answers }));
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

    const guideRef = doc(db, "users", user.uid);

    await runTransaction(db, async (tx) => {
      const guideSnap = await tx.get(guideRef);
      if (!guideSnap.exists()) return;

      const g = guideSnap.data() as GuideUser;

      const totalAnswers = (g.totalAnswers || 0) + 1;
      const totalHelpful = g.totalHelpfulLikes || 0;
      const sessions = g.helpfulSessions || 0;

      const reputation = totalHelpful * 2 + sessions * 5 + totalAnswers;
      const trophies = Math.floor(reputation / 20);

      tx.update(guideRef, {
        totalAnswers: increment(1),
        reputation,
        trophies,
      });
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

  const toggleAnswerLike = async (qid: string, aid: string, guideId: string) => {
    if (!user) return;

    const likeRef   = doc(db, "questions", qid, "answers", aid, "likes", user.uid);
    const answerRef = doc(db, "questions", qid, "answers", aid);
    const guideRef  = doc(db, "users", guideId);

    try {
      await runTransaction(db, async (tx) => {
        const likeSnap = await tx.get(likeRef);

        // only block THIS answer – not whole page
        if (likeSnap.exists()) return;

        tx.set(likeRef, { createdAt: serverTimestamp() });

        tx.update(answerRef, {
          helpfulCount: increment(1),
        });

        tx.update(guideRef, {
          totalHelpfulLikes: increment(1),
          reputation: increment(4),
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
      await setDoc(doc(db,"users",user.uid),{
        role:"guide",
        totalAnswers:0,
        totalHelpfulLikes:0,
        helpfulSessions:0,
        reputation:0,
        trophies:0
      },{merge:true});


      setShowGuideModal(false);
      setAcceptedResponsibility(false);
      setAlreadyApplied(true);

      alert("You're now a Guide! 🎉");
    } catch (err) {
      console.error("Guide promotion failed", err);
    }
  };

  const sendRequest = async (guideId: string) => {
    if (!user || pendingMap[guideId]) return;

    await addDoc(collection(db, "connections"), {
      from: user.uid,
      fromName: user.name,
      to: guideId,
      status: "pending",
      createdAt: serverTimestamp(),
    });

    setPendingMap(prev => ({ ...prev, [guideId]: true }));
  };

  const acceptRequest = async (id: string, studentId: string) => {
    await updateDoc(doc(db,"connections",id),{
      status:"accepted",
      acceptedAt: serverTimestamp(),
      toName: user!.name
    });

    await setDoc(doc(db,"chats",id),{
      participants:[user!.uid, studentId],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
  };


  const rejectRequest = async (req:any) => {
    await updateDoc(doc(db, "connections", req.id), {
      status: "rejected"
    });
  };

  /* -------------------------------- UI ----------------------------------- */

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      <div className="max-w-7xl mx-auto px-6 py-10">
        <h1 className="text-4xl font-extrabold mb-8">Public Guidance Wall</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* LEFT   */}
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
                                  onClick={() => toggleAnswerLike(q.id, ans.id, ans.authorId)}
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
          <div className="space-y-6">

            {/* BECOME GUIDE CARD */}
            {user?.role === "student" && !alreadyApplied && (
              <div className="rounded-3xl p-6 bg-gradient-to-br from-indigo-50 to-purple-100 shadow-md border border-indigo-100">
                <p className="text-xs text-indigo-400 uppercase tracking-wide mb-1">Want to help?</p>
                <h3 className="text-lg font-bold mb-3 text-indigo-800">Become a Campus Guide</h3>

                <button
                  onClick={() => setShowGuideModal(true)}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 
                            text-white font-semibold shadow hover:scale-[1.02] transition"
                >
                  Apply Now
                </button>
              </div>
            )}

            {/* STUDENT – CONNECT WITH GUIDES */}
            {user?.role === "student" && (
              <div className="bg-white p-6 rounded-3xl shadow-md border border-slate-100">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold">Connect with Guides</h3>
                  <span className="text-xs text-slate-400">{guides.length} mentors</span>
                </div>

                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search by name or skill..."
                  className="w-full mb-3 px-4 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-indigo-200 outline-none"
                />

                <select
                  value={selectedTag}
                  onChange={e => setSelectedTag(e.target.value)}
                  className="w-full mb-4 px-4 py-2 border rounded-xl text-sm"
                >
                  <option>ALL</option>
                  <option>AI</option>
                  <option>WEB</option>
                  <option>CAREER</option>
                </select>

                <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                  {guides
                    .filter(g =>
                      g.name?.toLowerCase().includes(search.toLowerCase()) &&
                      (selectedTag === "ALL" || g.interests?.includes(selectedTag))
                    )
                    .map(g => (
                      <motion.div
                        key={g.id}
                        whileHover={{ scale: 1.01 }}
                        className="flex justify-between items-center bg-gradient-to-br from-slate-50 to-white 
                                  p-4 rounded-2xl shadow-sm border border-slate-100"
                      >
                        <div>
                          <p className="font-semibold text-slate-800">{g.name}</p>

                          <div className="flex flex-wrap gap-1 mt-1 text-xs">
                            {g.interests?.slice(0, 3).map((t: string) => (
                              <span key={t} className="px-2 py-0.5 bg-indigo-100 text-indigo-600 rounded-full">
                                {t}
                              </span>
                            ))}
                          </div>

                          <p className="text-xs text-amber-500 mt-1">🏆 {g.trophies || 0} trophies</p>
                        </div>

                        <button
                          disabled={connectionStatus[g.id] === "pending" || connectionStatus[g.id] === "accepted"}
                          onClick={() => sendRequest(g.id)}
                          className={`px-4 py-1.5 rounded-full text-xs font-semibold transition
                            ${connectionStatus[g.id] === "accepted"
                              ? "bg-blue-500 text-white cursor-default"
                              : connectionStatus[g.id] === "pending"
                              ? "bg-slate-300 text-slate-600 cursor-not-allowed"
                              : "bg-green-600 hover:bg-green-700 text-white"
                            }`}
                        >
                          {connectionStatus[g.id] === "accepted"
                            ? "Connected"
                            : connectionStatus[g.id] === "pending"
                            ? "Pending"
                            : "Connect"}
                        </button>

                      </motion.div>
                    ))}
                </div>
              </div>
            )}

            {/* GUIDE – INCOMING REQUESTS */}
            {user?.role === "guide" && (
              <div className="bg-white p-6 rounded-3xl shadow-md border border-slate-100">
                <h3 className="text-lg font-bold mb-4">Connection Requests</h3>

                {requests.length === 0 && (
                  <p className="text-sm text-slate-400 italic">No new requests yet.</p>
                )}

                {requests.map(r => (
                  <motion.div
                    key={r.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex justify-between items-center bg-slate-50 p-4 rounded-2xl mb-2 border"
                  >
                    <div>
                      <p className="text-sm font-semibold text-slate-700">{r.fromName}</p>
                      <p className="text-xs text-slate-400">wants to connect</p>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => acceptRequest(r.id, r.from)}
                        className="bg-green-600 hover:bg-green-700 text-white text-xs px-3 py-1.5 rounded-full"
                      >
                        Accept
                      </button>

                      <button
                        onClick={() => rejectRequest(r)}
                        className="bg-red-500 hover:bg-red-600 text-white text-xs px-3 py-1.5 rounded-full"
                      >
                        Reject
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}


            <div className="bg-white p-6 rounded-3xl shadow-md border">
              <h3 className="text-lg font-bold mb-3">My Connections</h3>

              {myConnections.map(c=>(
                <div key={c.id} className="flex justify-between items-center bg-slate-50 p-3 rounded-xl mb-2">
                  <p className="text-sm font-medium">
                    {user?.role==="student" ? c.toName : c.fromName}
                  </p>
                  <button
                    onClick={() => navigate(`/career/chat/${c.id}`)}
                    className="text-indigo-600 font-semibold text-sm"
                  >
                    💬 Chat
                  </button>   
                </div>
              ))}
            </div>


            <div className="rounded-3xl p-6 bg-gradient-to-br from-yellow-400 via-orange-400 to-pink-500 shadow-2xl">
              <h3 className="text-white text-lg font-extrabold mb-4 tracking-wide">
                🏆 Top Guides Leaderboard
              </h3>

              <div className="space-y-4">
                {leaderboard.map((g,i)=>(
                  <motion.div
                    key={g.id}
                    initial={{opacity:0,y:10}}
                    animate={{opacity:1,y:0}}
                    className="bg-white/90 backdrop-blur-md rounded-2xl p-4 flex justify-between items-center shadow-lg"
                  >
                    <div>
                      <p className="font-bold text-slate-800">
                        #{i+1} {g.name}
                      </p>
                      <p className="text-xs text-slate-500">
                        💬 {g.totalAnswers} Answers • 👍 {g.totalHelpfulLikes} Helpful
                      </p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        <span className="text-sm font-bold text-yellow-700">
                          🏆 {g.trophies || 0}
                        </span>

                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-xl font-extrabold text-orange-600">
                        {g.reputation}
                      </p>
                      <p className="text-[10px] text-slate-400">REP</p>
                    </div>
                  </motion.div>
                ))}
              </div>
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
