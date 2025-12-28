import { useEffect, useState, useRef } from "react";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp,
  doc,
  getDoc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../../firebase/firebase";
import { useAuth } from "../../hooks/useAuth";
import { useParams } from "react-router-dom";

export default function ChatPage() {
  const { user } = useAuth();
  const { id } = useParams<{ id: string }>();

  const [messages, setMessages] = useState<any[]>([]);
  const [partnerName, setPartnerName] = useState("User");
  const [text, setText] = useState("");

  const bottomRef = useRef<HTMLDivElement>(null);

  /* ---------------- LOAD PARTNER ---------------- */

  useEffect(() => {
    if (!id || !user) return;

    const loadPartner = async () => {
      const connSnap = await getDoc(doc(db, "connections", id));
      if (!connSnap.exists()) return;

      const data = connSnap.data();
      const otherId = data.from === user.uid ? data.to : data.from;

      const userSnap = await getDoc(doc(db, "users", otherId));
      if (userSnap.exists()) setPartnerName(userSnap.data().name || "User");
    };

    loadPartner();
  }, [id, user]);

  /* ---------------- LOAD MESSAGES ---------------- */

  useEffect(() => {
    if (!id) return;

    const q = query(
      collection(db, "chats", id, "messages"),
      orderBy("createdAt", "asc")
    );

    return onSnapshot(q, snap => {
      setMessages(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
  }, [id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /* ---------------- SEND MESSAGE ---------------- */

  const sendMessage = async () => {
    if (!text.trim() || !id || !user) return;

    await addDoc(collection(db, "chats", id, "messages"), {
      text,
      senderId: user.uid,
      senderName: user.name,
      createdAt: serverTimestamp(),
    });

    setText("");
  };

  /* ---------------- CREATE MEET ---------------- */

    const createMeet = async () => {
        if (!id || !user) return;

        // open meet
        window.open("https://meet.google.com/new", "_blank");

        // store system message
        await addDoc(collection(db, "chats", id, "messages"), {
            text: `📹 Google Meet session started by ${user.name}`,
            senderId: "system",
            senderName: "System",
            createdAt: serverTimestamp(),
        });
    };


  /* ---------------- UI ---------------- */

  if (!id || !user) return <p className="p-6">Loading chat...</p>;

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-orange-50 to-white">
      <div className="p-4 bg-white shadow flex justify-between items-center">
        <div className="flex gap-3 items-center">
          <div className="w-10 h-10 bg-indigo-600 rounded-full text-white flex items-center justify-center font-bold">
            {partnerName[0]}
          </div>
          <p className="font-semibold">{partnerName}</p>
        </div>

        <button
          onClick={createMeet}
          className="bg-gradient-to-r from-green-500 to-blue-500 text-white px-4 py-1.5 rounded-full text-xs font-semibold shadow"
        >
          📹 Start Google Meet
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-3">
        {messages.map(m => {
            if (m.senderId === "system") {
                return (
                <div key={m.id} className="text-center my-3">
                    <span className="bg-yellow-100 text-yellow-700 px-4 py-1 rounded-full text-xs font-semibold">
                    {m.text}
                    </span>
                </div>
                );
            }

            return (
                <div
                key={m.id}
                className={`flex ${m.senderId === user.uid ? "justify-end" : "justify-start"}`}
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
            );
        })}
        <div ref={bottomRef}></div>
      </div>

      <div className="p-4 bg-white border-t flex gap-3">
        <input
          value={text}
          onChange={e => setText(e.target.value)}
          className="flex-1 px-4 py-2 border rounded-full"
          placeholder="Type message..."
        />
        <button
          onClick={sendMessage}
          className="bg-indigo-600 text-white px-6 rounded-full"
        >
          Send
        </button>
      </div>
    </div>
  );
}
