import { useState } from "react";
import { motion } from "framer-motion";

type BuzzPost = {
  id: string;
  name: string;
  role: string;
  time: string;
  avatar: string;
  tag: "PLACEMENT" | "RESEARCH" | "HACKATHON" | "ACHIEVEMENT";
  title: string;
  short: string;
  full: string;
  aiSummary: string;
  likes: number;
};

const POSTS: BuzzPost[] = [
  {
    id: "1",
    name: "Ananya Singh",
    role: "ECE Senior",
    time: "5 hours ago",
    avatar: "https://i.pravatar.cc/150?img=32",
    tag: "PLACEMENT",
    title: "Placed at Microsoft",
    short: "I’m excited to announce that I’ll be joining Microsoft this summer as a Software Engineer...",
    full:
      "I’m excited to announce that I’ll be joining Microsoft this summer as a Software Engineer. "
      + "This journey involved months of consistent DSA practice, system design interviews, "
      + "and mock interview sessions. The process was extremely challenging but incredibly rewarding.",
    aiSummary:
      "Ananya secured a competitive Software Engineer role at Microsoft after clearing multiple technical rounds.",
    likes: 350,
  },
  {
    id: "2",
    name: "Rahul Mehta",
    role: "CSE Junior",
    time: "1 day ago",
    avatar: "https://i.pravatar.cc/150?img=56",
    tag: "RESEARCH",
    title: "Research Paper Accepted at CVPR 2026",
    short: "Our multimodal emotion recognition research work has been accepted at CVPR 2026...",
    full:
      "Our multimodal emotion recognition research paper has been accepted at CVPR 2026. "
      + "The project focused on combining vision transformers with contextual NLP embeddings "
      + "to improve emotion detection accuracy across domains.",
    aiSummary:
      "Rahul’s research on multimodal emotion recognition was accepted at CVPR, a top-tier conference.",
    likes: 210,
  },
  {
    id: "3",
    name: "Sneha Patel",
    role: "IT Sophomore",
    time: "2 days ago",
    avatar: "https://i.pravatar.cc/150?img=15",
    tag: "HACKATHON",
    title: "Winners of Smart India Hackathon",
    short: "Our team secured first place at Smart India Hackathon with an AI-based forgery detector...",
    full:
      "Our team secured first place at Smart India Hackathon with an AI-based document forgery "
      + "detection platform. We worked for 36 continuous hours to design, train, and deploy the system.",
    aiSummary:
      "Sneha led her team to victory at Smart India Hackathon by building an AI forgery detection platform.",
    likes: 420,
  },
];

const TAG_STYLE: Record<string, string> = {
  PLACEMENT: "bg-purple-100 text-purple-700",
  RESEARCH: "bg-blue-100 text-blue-700",
  HACKATHON: "bg-emerald-100 text-emerald-700",
  ACHIEVEMENT: "bg-orange-100 text-orange-700",
};

export default function CampusBuzzPage() {
  const [openPost, setOpenPost] = useState<string | null>(null);
  const [likes, setLikes] = useState<Record<string, number>>({});

  const toggleLike = (id: string, base: number) => {
    setLikes(prev => ({ ...prev, [id]: prev[id] ? prev[id] - 1 : base + 1 }));
  };

  return (
    <div className="min-h-screen bg-slate-50 py-16 px-6">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="flex justify-between items-center mb-14">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">
              Campus Buzz
            </h1>
            <p className="text-slate-500 mt-2 max-w-xl">
              A live feed of placements, research wins, hackathon victories and student achievements across the campus.
            </p>

            <div className="flex gap-2 mt-4">
              <span className="px-3 py-1 text-xs rounded-full bg-purple-100 text-purple-700 font-semibold">
                Placements
              </span>
              <span className="px-3 py-1 text-xs rounded-full bg-blue-100 text-blue-700 font-semibold">
                Research
              </span>
              <span className="px-3 py-1 text-xs rounded-full bg-emerald-100 text-emerald-700 font-semibold">
                Hackathons
              </span>
              <span className="px-3 py-1 text-xs rounded-full bg-orange-100 text-orange-700 font-semibold">
                Achivements
              </span>
            </div>
          </div>

          <button className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-7 py-2.5 rounded-full font-semibold shadow-lg hover:scale-105 transition">
            Create Post
          </button>
        </div>

        {/* Posts */}
        <div className="space-y-10">
          {POSTS.map(p => {
            const expanded = openPost === p.id;
            const likeCount = likes[p.id] ?? p.likes;

            return (
              <motion.div
                key={p.id}
                layout
                className="bg-white rounded-3xl p-10 shadow-xl border border-slate-200"
              >
                {/* Header */}
                <div className="flex justify-between items-center">
                  <div className="flex gap-4 items-center">
                    <img src={p.avatar} className="w-14 h-14 rounded-full" />
                    <div>
                      <p className="font-semibold text-slate-800">{p.name}</p>
                      <p className="text-xs text-slate-500">{p.role} • {p.time}</p>
                    </div>
                  </div>

                  <span className={`px-4 py-1 text-xs rounded-full font-bold ${TAG_STYLE[p.tag]}`}>
                    {p.tag}
                  </span>
                </div>

                {/* Content */}
                <h2 className="mt-6 text-2xl font-bold text-slate-800">{p.title}</h2>
                <p className="text-slate-600 mt-3 leading-relaxed">
                  {expanded ? p.full : p.short}
                </p>

                {/* AI Summary */}
                <div className="mt-6 border border-purple-200 bg-purple-50 p-4 rounded-xl">
                  <p className="text-xs font-semibold text-purple-600 mb-1">AI SUMMARY</p>
                  <p className="text-sm text-purple-700 italic">"{p.aiSummary}"</p>
                </div>

                {/* Actions */}
                <div className="flex justify-between items-center mt-8 text-sm">
                  <button
                    onClick={() => toggleLike(p.id, p.likes)}
                    className="text-slate-500 hover:text-red-500 transition"
                  >
                    ♥ {likeCount}
                  </button>

                  <button
                    onClick={() => setOpenPost(expanded ? null : p.id)}
                    className="text-indigo-600 font-semibold"
                  >
                    {expanded ? "Show less" : "Read more"}
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
