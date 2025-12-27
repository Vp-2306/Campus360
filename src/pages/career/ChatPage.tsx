import { useEffect, useRef, useState } from "react";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { useParams } from "react-router-dom";
import { db } from "../../firebase/firebase";
import { useAuth } from "../../hooks/useAuth";

export default function ChatPage() {
  const { user } = useAuth();
  const { chatId } = useParams<{ chatId: string }>();

  const [messages, setMessages] = useState<any[]>([]);
  const [partnerName, setPartnerName] = useState("");
  const [text, setText] = useState("");
  const [meetLink, setMeetLink] = useState<string | null>(null);

  const bottomRef = useRef<HTMLDivElement>(null);

  /* ---------------- SAFETY ---------------- */

  if (!chatId || !user) return null;

  /* ---------------- LOAD PARTNER ---------------- */

  useEffect(() => {
    const loadPartner = async () => {
      const connSnap = await getDoc(doc(db, "connections", chatId));
      if (!connSnap.exists()) return;

      const data = connSnap.data();
      const otherId = data.from === user.uid ? data.to : data.from;

      const userSnap = await getDoc(doc(db, "users", otherId));
      setPartnerName(userSnap.data()?.name || "User");
    };

    loadPartner();
  }, [chatId, user.uid]);

  /* ---------------- LOAD MESSAGES ---------------- */

  useEffect(() => {
    const q = query(
      collection(db, "chats", chatId, "messages"),
      orderBy("createdAt", "asc")
    );

    return onSnapshot(q, snap => {
      setMessages(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
  }, [chatId]);

  /* ---------------- LOAD MEET LINK ---------------- */

  useEffect(() => {
    const chatRef = doc(db, "chats", chatId);

    return onSnapshot(chatRef, snap => {
      if (snap.exists()) setMeetLink(snap.data().meetLink || null);
    });
  }, [chatId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /* ---------------- SEND MESSAGE ---------------- */

  const sendMessage = async () => {
    if (!text.trim()) return;

    await addDoc(collection(db, "chats", chatId, "messages"), {
      text,
      senderId: user.uid,
      senderName: user.name,
      createdAt: serverTimestamp(),
    });

    setText("");
  };

  /* ---------------- MEET CONTROL ---------------- */

  const createMeet = async () => {
    const meetUrl = "https://meet.google.com/new";
    window.open(meetUrl, "_blank");

    await updateDoc(doc(db, "chats", chatId), {
      meetLink: meetUrl,
      updatedAt: serverTimestamp(),
    });
  };

  const endMeet = async () => {
    await updateDoc(doc(db, "chats", chatId), {
      meetLink: null,
      updatedAt: serverTimestamp(),
    });

    setMeetLink(null);
  };

  /* ---------------- UI ---------------- */

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-orange-50 to-white">
      {/* HEADER */}
      <div className="p-4 bg-white shadow flex justify-between items-center">
        <div className="flex gap-3 items-center">
          <div className="w-10 h-10 bg-indigo-600 rounded-full text-white flex items-center justify-center font-bold">
            {partnerName[0]}
          </div>
          <p className="font-semibold">{partnerName}</p>
        </div>

        <button
          onClick={createMeet}
          className="bg-gradient-to-r from-green-500 to-blue-500 text-white px-4 py-1.5 rounded-full text-xs font-semibold shadow hover:scale-105 transition"
        >
          📹 Start Google Meet
        </button>
      </div>

      {/* ACTIVE MEET BAR */}
      {meetLink && (
        <div className="bg-indigo-600 text-white px-4 py-2 flex justify-between items-center">
          <span>📞 Active Google Meet session</span>
          <div className="flex gap-2">
            <a
              href={meetLink}
              target="_blank"
              className="bg-white text-indigo-600 px-3 py-1 rounded-full text-xs font-semibold"
            >
              Join
            </a>
            <button
              onClick={endMeet}
              className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-full text-xs font-semibold"
            >
              End
            </button>
          </div>
        </div>
      )}

      {/* MESSAGES */}
      <div className="flex-1 overflow-y-auto p-5 space-y-3">
        {messages.map(m => (
          <div
            key={m.id}
            className={`w-full flex ${
              m.senderId === user.uid ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[70%] px-4 py-2 rounded-2xl shadow break-words ${
                m.senderId === user.uid
                  ? "bg-indigo-600 text-white"
                  : "bg-white text-slate-800"
              }`}
            >
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
          className="flex-1 px-4 py-2 border rounded-full outline-none"
          placeholder="Type message..."
        />
        <button
          onClick={sendMessage}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 rounded-full"
        >
          Send
        </button>
      </div>
    </div>
  );
}
