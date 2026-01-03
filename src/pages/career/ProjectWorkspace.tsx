import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import {
  doc,
  getDoc,
  updateDoc,
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp
} from "firebase/firestore";
import { db } from "../../firebase/firebase";
import { useAuth } from "../../hooks/useAuth";

export default function ProjectWorkspace() {
  const { projectId } = useParams<{ projectId: string }>();
  const { user } = useAuth();

  const [project, setProject] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState("");
  const [repo, setRepo] = useState("");

  const bottomRef = useRef<HTMLDivElement>(null);

  /* LOAD PROJECT */
  useEffect(() => {
    if (!projectId) return;

    getDoc(doc(db, "projects", projectId)).then(snap => {
      if (snap.exists()) {
        setProject({ id: snap.id, ...snap.data() });
        setRepo(snap.data().repo || "");
      }
    });
  }, [projectId]);

  /* LOAD CHAT */
  useEffect(() => {
    if (!projectId) return;

    const q = query(
      collection(db, "projects", projectId, "chat"),
      orderBy("createdAt", "asc")
    );

    return onSnapshot(q, snap => {
      setMessages(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
  }, [projectId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /* SEND MESSAGE */
  const sendMessage = async () => {
    if (!text.trim() || !user || !projectId) return;

    await addDoc(collection(db, "projects", projectId, "chat"), {
      text,
      senderId: user.uid,
      senderName: user.name,
      createdAt: serverTimestamp()
    });

    setText("");
  };

  /* SAVE GITHUB REPO (CREATOR ONLY) */
  const saveRepo = async () => {
    if (!projectId || !user || project.creatorId !== user.uid) return;
    await updateDoc(doc(db, "projects", projectId), { repo });
  };

  /* START MEET + SYSTEM MESSAGE */
  const startMeet = async () => {
    if (!user || !projectId) return;

    window.open("https://meet.google.com/new", "_blank");

    await addDoc(collection(db, "projects", projectId, "chat"), {
      text: "📞 A Google Meet session has been started.",
      senderId: "system",
      senderName: "System",
      createdAt: serverTimestamp()
    });
  };

  if (!project) return <p className="p-10">Loading...</p>;

  return (
    <div className="h-screen grid grid-cols-[360px_1fr] bg-indigo-50">

      {/* LEFT SIDEBAR */}
      <div className="bg-white p-6 border-r overflow-y-auto">
        <h2 className="text-xl font-extrabold">{project.title}</h2>

        <div className="flex flex-wrap gap-1 mt-3">
          {project.tags.map((t: string) => (
            <span key={t} className="text-xs bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full">
              {t}
            </span>
          ))}
        </div>

        <p className="mt-4 text-sm text-slate-600">{project.details}</p>

        <p className="mt-3 text-sm">👥 Team ({project.members.length}/{project.teamSize})</p>
        <ul className="text-xs text-slate-600 mt-1 space-y-1">
          {project.members.map((m: any) => (
            <li key={m.uid}>• {m.name}</li>
          ))}
        </ul>

        <p className="mt-3 text-sm text-red-500">⏳ {project.deadline}</p>
      </div>

      {/* RIGHT PANEL */}
      <div className="flex flex-col">

        {/* TOP TOOLS */}
        <div className="bg-white p-4 border-b flex gap-3 items-center">
          <input
            value={repo}
            onChange={e => setRepo(e.target.value)}
            disabled={project.creatorId !== user?.uid}
            placeholder="GitHub Repo URL"
            className="border px-3 py-2 rounded-xl flex-1 disabled:bg-slate-100"
          />
          {project.creatorId === user?.uid && (
            <button onClick={saveRepo} className="bg-indigo-600 text-white px-4 py-2 rounded-xl">
              Save
            </button>
          )}
          <button
            onClick={startMeet}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl"
          >
            📹 Start Meet
          </button>
        </div>

        {/* CHAT */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {messages.map(m => (
            <div
              key={m.id}
              className={`flex ${
                m.senderId === "system"
                  ? "justify-center"
                  : m.senderId === user?.uid
                  ? "justify-end"
                  : "justify-start"
              }`}
            >
              <div
                className={`max-w-[70%] px-4 py-2 rounded-2xl shadow text-sm ${
                  m.senderId === "system"
                    ? "bg-yellow-100 text-yellow-700 italic"
                    : m.senderId === user?.uid
                    ? "bg-indigo-600 text-white"
                    : "bg-white text-slate-800"
                }`}
              >
                {m.senderId !== "system" && (
                  <p className="text-xs opacity-70 mb-1">{m.senderName}</p>
                )}
                {m.text}
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        {/* INPUT */}
        <div className="p-4 bg-white border-t flex gap-3">
          <input
            value={text}
            onChange={e => setText(e.target.value)}
            className="flex-1 border px-4 py-2 rounded-full"
            placeholder="Message team..."
          />
          <button onClick={sendMessage} className="bg-indigo-600 text-white px-6 rounded-full">
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
