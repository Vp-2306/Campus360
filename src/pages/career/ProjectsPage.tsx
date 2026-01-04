  import { useState, useEffect } from "react";
  import { motion, AnimatePresence } from "framer-motion";
  import {
    collection,
    onSnapshot,
    addDoc,
    doc,
    updateDoc,
    arrayUnion
  } from "firebase/firestore";
  import { db } from "../../firebase/firebase";
  import { useAuth } from "../../hooks/useAuth";
  import { useNavigate } from "react-router-dom";
  import { GEMINI_API_KEY } from "../../firebase/firebase";



  /* CONSTANTS */
  const DEFAULT_TAGS = ["AI","Web","Blockchain","Healthcare","EdTech","FinTech"];
  const DEFAULT_TECH = ["React","Firebase","Python","Node","Flask","TensorFlow"];


  /* TYPES */

  type Member = { uid:string; name:string };

  type Project = {
    id:string;
    title:string;
    shortDesc:string;
    details:string;
    deadline:string;
    teamSize:number;
    tags:string[];
    tech:string[];
    creatorId:string;
    creatorName:string;
    members:Member[];
  };

  type Event = {
    id: string;
    title: string;
    organiser: string;
    description: string;
    date: string;
    time: string;
    location: string;
    lat: number;
    lng: number;
    maxSeats: number;
    attendees: number;
    tags: string[];
  };

  const DUMMY_EVENTS: Event[] = [
    {
      id: "1",
      title: "AI Bootcamp",
      organiser: "Coding Club",
      description: "Hands-on ML & Deep Learning workshop for beginners.",
      date: "2026-01-10",
      time: "18:00",
      location: "Main Auditorium",
      lat: 13.007,
      lng: 74.794,
      maxSeats: 50,
      attendees: 32,
      tags: ["AI", "Workshop"]
    },
    {
      id: "2",
      title: "Web Dev Hackathon",
      organiser: "DevSoc",
      description: "24-hour full stack hackathon with exciting prizes.",
      date: "2026-01-15",
      time: "10:00",
      location: "Innovation Lab",
      lat: 13.01,
      lng: 74.792,
      maxSeats: 100,
      attendees: 87,
      tags: ["Web", "Hackathon"]
    }
  ];

  /* COMPONENT */

  export default function ProjectsPage(){
    const { user } = useAuth();

    const [tab,setTab] = useState<"explore"|"mine"|"create"|"project-room">("explore");
    const [preview,setPreview] = useState<Project|null>(null);
    const [projects,setProjects] = useState<Project[]>([]);

    /* CREATE FORM */
    const [title,setTitle]=useState("");
    const [shortDesc,setShortDesc]=useState("");
    const [details,setDetails]=useState("");
    const [deadline,setDeadline]=useState("");
    const [teamSize,setTeamSize]=useState(3);
    const [selectedTags,setSelectedTags]=useState<string[]>([]);
    const [selectedTech,setSelectedTech]=useState<string[]>([]);
    const [customTag,setCustomTag]=useState("");
    const [customTech,setCustomTech]=useState("");
    const navigate = useNavigate();

    const [showGemini,setShowGemini] = useState(false);
    const [interestInput, setInterestInput] = useState("");
    const [geminiLoading, setGeminiLoading] = useState(false);
    const [geminiResults, setGeminiResults] = useState<Project[]>([]);


    const [mode, setMode] = useState<"projects" | "events">("projects");
    const [eventTab, setEventTab] = useState<"explore" | "mine" | "create">("explore");
    const [eventTitle, setEventTitle] = useState("");
    const [eventDesc, setEventDesc] = useState("");
    const [eventDate, setEventDate] = useState("");
    const [eventTime, setEventTime] = useState("");
    const [eventLocation, setEventLocation] = useState("");
    const [eventLat, setEventLat] = useState("");
    const [eventLng, setEventLng] = useState("");
    const [eventMaxSeats, setEventMaxSeats] = useState(50);
    const [myEvents, setMyEvents] = useState<Event[]>([]);


    useEffect(()=>{
      return onSnapshot(collection(db,"projects"),snap=>{
        setProjects(snap.docs.map(d=>({id:d.id,...d.data()} as Project)));
      });
    },[]);

    const [events, setEvents] = useState<any[]>([]);
    const [eventPreview, setEventPreview] = useState<any | null>(null);

    useEffect(() => {
      if (mode !== "events") return;

      return onSnapshot(collection(db, "events"), snap => {
        setEvents(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      });
    }, [mode]);


    {events.map(e => (
      <div key={e.id}>
        <h3>{e.title}</h3>
      </div>
    ))}
    
    const toggleItem=(i:string,list:string[],setList:any)=>{
      setList(list.includes(i)?list.filter(t=>t!==i):[...list,i]);
    };
    
    const applyToProject = async () => {
      if (!user || !preview) return;

      // stop if project already full
      if (preview.members.length >= preview.teamSize) return;

      // stop duplicate join
      if (preview.members.some(m => m.uid === user.uid)) return;

      await updateDoc(doc(db,"projects", preview.id), {
        members: arrayUnion({ uid: user.uid, name: user.name })
      });
    };

    const runGemini = async () => {
      if (!interestInput.trim()) return;

      setGeminiLoading(true);

      const projectDump = projects.map(p =>
        `ID:${p.id} | ${p.title} | Tags:${p.tags.join(",")} | Tech:${p.tech.join(",")}`
      ).join("\n");

      const prompt = `
    User wants projects related to: ${interestInput}

    Here are all projects:
    ${projectDump}

    Return ONLY matching project IDs as JSON array.
    Example: ["abc","def"]
    Do not explain.
      `;

      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }]
          })
        }
      );

      const data = await res.json();
      const raw = data.candidates?.[0]?.content?.parts?.[0]?.text || "[]";
      const clean = raw.replace(/```json|```/g,"").trim();

      let ids:string[] = [];
      try { ids = JSON.parse(clean); }
      catch { alert("Gemini returned bad JSON. Check console."); }

      setGeminiResults(projects.filter(p=>ids.includes(p.id)));
      setGeminiLoading(false);
      setShowGemini(false);
    };


    const publishProject=async()=>{
      if(!user||!title||!deadline) return alert("Fill required fields");

      await addDoc(collection(db,"projects"),{
        title,shortDesc,details,deadline,teamSize,
        tags:selectedTags,tech:selectedTech,
        creatorId:user.uid,
        creatorName:user.name,
        members:[{uid:user.uid,name:user.name}],
        createdAt:new Date()
      });

      setTab("explore");
      setTitle("");
      setShortDesc("");
      setDetails("");
      setDeadline("");
      setTeamSize(3);
      setSelectedTags([]);
      setSelectedTech([]);

    };

    const shown =
      tab === "explore" && geminiResults.length > 0
        ? geminiResults
        : tab === "mine" && user
        ? projects.filter(p => p.members.some(m => m.uid === user.uid))
        : projects;


    /* CREATE PAGE */

    if(tab==="create") return (
      <div className="min-h-screen bg-indigo-50 p-10">
        <button onClick={()=>setTab("explore")} className="text-indigo-600 mb-6">← Back</button>
        <div className="max-w-5xl mx-auto bg-white p-10 rounded-3xl shadow-xl space-y-6">
          <h1 className="text-3xl font-extrabold">🚀 Create New Project</h1>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="font-semibold">Project Name</label>
              <input className="w-full border p-3 rounded-xl" value={title} onChange={e=>setTitle(e.target.value)}/>
            </div>
            <div>
              <label className="font-semibold">Deadline</label>
              <input type="date" className="w-full border p-3 rounded-xl" value={deadline} onChange={e=>setDeadline(e.target.value)}/>
            </div>
            <div className="md:col-span-2">
              <label className="font-semibold">Short Description</label>
              <input className="w-full border p-3 rounded-xl" value={shortDesc} onChange={e=>setShortDesc(e.target.value)}/>
            </div>
            <div className="md:col-span-2">
              <label className="font-semibold">Detailed Description</label>
              <textarea rows={4} className="w-full border p-3 rounded-xl" value={details} onChange={e=>setDetails(e.target.value)}/>
            </div>

            <div className="md:col-span-2">
              <label className="font-semibold">Tech Stack</label>
              <div className="flex flex-wrap gap-2 mt-2">
                {DEFAULT_TECH.map(t=>(
                  <button key={t} onClick={()=>toggleItem(t,selectedTech,setSelectedTech)}
                    className={`px-3 py-1 rounded-full text-xs ${selectedTech.includes(t)?"bg-indigo-600 text-white":"bg-slate-100"}`}>
                    {t}
                  </button>
                ))}
              </div>
              <div className="flex gap-2 mt-2">
                <input value={customTech} onChange={e=>setCustomTech(e.target.value)} placeholder="Custom tech"
                  className="border px-3 py-1 rounded-xl"/>
                <button onClick={()=>{ if(customTech){ setSelectedTech([...selectedTech,customTech]); setCustomTech("");}}}
                  className="bg-indigo-600 text-white px-3 rounded-xl">Add</button>
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="font-semibold">Tags</label>
              <div className="flex flex-wrap gap-2 mt-2">
                {DEFAULT_TAGS.map(t=>(
                  <button key={t} onClick={()=>toggleItem(t,selectedTags,setSelectedTags)}
                    className={`px-3 py-1 rounded-full text-xs ${selectedTags.includes(t)?"bg-indigo-600 text-white":"bg-slate-100"}`}>
                    {t}
                  </button>
                ))}
              </div>
              <div className="flex gap-2 mt-2">
                <input value={customTag} onChange={e=>setCustomTag(e.target.value)} placeholder="Custom tag"
                  className="border px-3 py-1 rounded-xl"/>
                <button onClick={()=>{ if(customTag){ setSelectedTags([...selectedTags,customTag]); setCustomTag("");}}}
                  className="bg-indigo-600 text-white px-3 rounded-xl">Add</button>
              </div>
            </div>

            <div>
              <label className="font-semibold">Team Size</label>
              <input type="number" className="border p-3 rounded-xl w-32" value={teamSize}
                onChange={e=>setTeamSize(+e.target.value)}/>
            </div>
          </div>

          <button onClick={publishProject} className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold">
            Publish Project
          </button>
        </div>
      </div>
    );

    /* EXPLORE / MINE */

    return (
      <div className="min-h-screen bg-indigo-50 p-10">
        <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-10 relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#0f172a] via-[#020617] to-black shadow-[0_0_40px_rgba(99,102,241,0.35)]"
      >
        {/* Glow Orbs */}
        <div className="absolute -top-10 -left-10 w-40 h-40 bg-indigo-600/30 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-48 h-48 bg-purple-600/20 rounded-full blur-3xl" />

        <div className="relative z-10 p-8">
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Career Companion Modules
          </h1>
          <p className="text-sm text-white/60 mt-1 max-w-xl">
            Explore student-led projects and campus events to collaborate, build skills, and grow your network.
          </p>

          <div className="flex gap-4 mt-6">
            <motion.button
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setMode("projects")}
              className="backdrop-blur-xl bg-white/10 border border-white/20 text-white px-6 py-2 rounded-full font-semibold shadow-[0_0_20px_rgba(99,102,241,0.6)] hover:bg-indigo-600/40 transition"
            >
              🚀 Projects
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setMode("events")}
              className="backdrop-blur-xl bg-white/10 border border-white/20 text-white px-6 py-2 rounded-full font-semibold shadow-[0_0_20px_rgba(168,85,247,0.6)] hover:bg-purple-600/40 transition"
            >
              📅 Events
            </motion.button>
          </div>
        </div>
      </motion.div>
        {mode === "projects" && (
          <div className="flex gap-3 mb-6">
            {["explore","mine","create"].map(t=>(
              <button
                key={t}
                onClick={() => setTab(t as any)}
                className={`px-4 py-2 rounded-full ${
                  tab === t ? "bg-indigo-600 text-white" : "bg-white shadow"
                }`}
              >
                {t === "explore" ? "Explore" : t === "mine" ? "My Projects" : "Create"}
              </button>
            ))}
          </div>
        )}
        <AnimatePresence>
        {preview && tab == "explore" &&(
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}  
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 120 }}
            className="fixed right-0 top-[72px] h-[calc(100vh-72px)] w-[420px] bg-white shadow-2xl p-8 flex flex-col z-50"
          >
            {/* HEADER */}
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-2xl font-extrabold text-slate-800">
                {preview.title}
              </h2>
              <button
                onClick={() => setPreview(null)}
                className="text-slate-400 hover:text-red-500 text-xl font-bold"
              >
                ✕
              </button>
            </div>

            {/* META */}
            <div className="flex gap-3 text-xs text-slate-500 mb-4">
              <span className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full">
                👥 {preview.members.length}/{preview.teamSize}
              </span>
              <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full">
                ⏳ {preview.deadline}
              </span>
            </div>

            {/* TAGS */}
            <div className="flex flex-wrap gap-2 mb-4">
              {preview.tags.map(t => (
                <span key={t}
                  className="text-xs bg-indigo-100 text-indigo-600 px-3 py-1 rounded-full font-semibold">
                  {t}
                </span>
              ))}
            </div>

            {/* TECH STACK */}
            <div className="mb-4">
              <p className="font-semibold text-sm mb-2">Tech Stack</p>
              <div className="flex flex-wrap gap-2">
                {preview.tech.map(t => (
                  <span key={t}
                    className="text-xs bg-slate-100 text-slate-700 px-3 py-1 rounded-full">
                    {t}
                  </span>
                ))}
              </div>
            </div>

            {/* DETAILS */}
            <p className="text-sm text-slate-600 leading-relaxed flex-1 overflow-y-auto">
              {preview.details}
            </p>

            {/* MEMBERS */}
            <div className="mt-4">
              <p className="font-semibold text-sm mb-2">Team Members</p>
              <div className="space-y-2">
                {preview.members.map((m:any) => (
                  <div
                    key={m.uid}
                    className="flex items-center gap-3 bg-slate-50 px-3 py-2 rounded-xl"
                  >
                    <div className="w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                      {m.name[0]}
                    </div>
                    <p className="text-sm font-medium text-slate-700">
                      {m.name}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* APPLY BUTTON */}
            {preview.members.length >= preview.teamSize ? (
              <button className="mt-6 py-3 rounded-xl bg-slate-300 text-slate-600 font-bold">
                Project Full
              </button>
            ) : preview.members.some((m:any)=>m.uid===user?.uid) ? (
              <button className="mt-6 py-3 rounded-xl bg-green-500 text-white font-bold">
                ✔ Joined
              </button>
            ) : (
              <button
                onClick={applyToProject}
                className="mt-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
              >
                Apply Now
              </button>
            )}
          </motion.div>
        )}
        {mode === "projects" && "explore" && (
          <button
            onClick={()=>setShowGemini(true)}
            className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-2 rounded-full font-bold mb-6 shadow-lg hover:scale-105 transition"
          >
            🔮 Find My Projects with Gemini
          </button>
        )}
        </AnimatePresence>
        <AnimatePresence>
          {showGemini && (
          <motion.div
            initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
            className="fixed inset-0 bg-black/40 flex justify-center items-center z-50"
          >
          <div className="bg-white rounded-3xl p-8 w-[440px] shadow-2xl">
            <div className="flex justify-between mb-3">
              <h2 className="text-xl font-extrabold text-indigo-700">Gemini Career Assistant</h2>
              <button onClick={()=>setShowGemini(false)} className="text-xl">✕</button>
            </div>

            <textarea
              rows={4}
              value={interestInput}
              onChange={e=>setInterestInput(e.target.value)}
              placeholder="Enter your skills, interests or paste resume text..."
              className="w-full border p-3 rounded-xl"
            />

            <button
              onClick={runGemini}
              className="mt-4 w-full bg-indigo-600 text-white py-2 rounded-xl font-bold"
            >
              {geminiLoading?"Thinking...":"Find Projects"}
            </button>

          </div>
          </motion.div>
          )}
        </AnimatePresence>
        
        {mode === "projects" && (
          <div className="grid md:grid-cols-3 gap-6">
            {shown.map(p=>(
              <motion.div
                key={p.id}
                whileHover={{ scale: 1.03 }}
                onClick={() => {
                  if (tab === "mine") {
                    navigate(`/projects/workspace/${p.id}`);
                  } else {
                    setPreview(p);
                  }
                }}
                className={`bg-white p-6 rounded-3xl shadow-xl cursor-pointer border-2
                ${geminiResults.some(g=>g.id===p.id) ? "border-green-500 shadow-green-300" : "border-transparent"}`}
              >

                <div>
                  <h3 className="text-lg font-extrabold text-slate-800">{p.title}</h3>

                  <p className="text-sm text-slate-500 mt-1 line-clamp-2">
                    {p.shortDesc}
                  </p>

                  {/* TAGS UNDER SHORT DESC */}
                  <div className="flex flex-wrap gap-1 mt-2">
                    {p.tags.slice(0, 3).map(t => (
                      <span
                        key={t}
                        className="text-[10px] bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full font-semibold"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex justify-between mt-3 text-xs text-slate-500">
                  <span>👥 {p.members.length}/{p.teamSize}</span>
                  <span className="text-red-500">⏳ {p.deadline}</span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
        {mode === "events" && (
          <>
            {/* EVENT TABS */}
            <div className="flex gap-3 mb-8">
              {["explore","mine","create"].map(t => (
                <button
                  key={t}
                  onClick={() => setEventTab(t as any)}
                  className={`px-5 py-2 rounded-full font-semibold transition-all
                  ${eventTab === t 
                    ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-xl scale-105"
                    : "bg-white shadow hover:scale-105"}`}
                >
                  {t === "explore" ? "Explore Events" : t === "mine" ? "My Events" : "Create Event"}
                </button>
              ))}
            </div>

            {/* CREATE EVENT */}
            {eventTab === "create" && (
              <div className="bg-white p-10 rounded-3xl shadow-xl max-w-4xl mx-auto space-y-6">
                <h2 className="text-2xl font-extrabold text-purple-700">🎉 Create New Event</h2>

                <div className="grid md:grid-cols-2 gap-6">
                  <input placeholder="Event Title" className="border p-3 rounded-xl" value={eventTitle} onChange={e=>setEventTitle(e.target.value)} />
                  <input placeholder="Location" className="border p-3 rounded-xl" value={eventLocation} onChange={e=>setEventLocation(e.target.value)} />
                  <input type="date" className="border p-3 rounded-xl" value={eventDate} onChange={e=>setEventDate(e.target.value)} />
                  <input type="time" className="border p-3 rounded-xl" value={eventTime} onChange={e=>setEventTime(e.target.value)} />
                  <input placeholder="Latitude" className="border p-3 rounded-xl" value={eventLat} onChange={e=>setEventLat(e.target.value)} />
                  <input placeholder="Longitude" className="border p-3 rounded-xl" value={eventLng} onChange={e=>setEventLng(e.target.value)} />
                  <input type="number" placeholder="Max Seats" className="border p-3 rounded-xl" value={eventMaxSeats} onChange={e=>setEventMaxSeats(+e.target.value)} />
                </div>

                <textarea placeholder="Event Description" rows={4} className="border p-4 rounded-xl w-full" value={eventDesc} onChange={e=>setEventDesc(e.target.value)} />

                <button className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 rounded-xl font-bold shadow-xl">
                  Publish Event
                </button>
              </div>
            )}

            {/* EXPLORE EVENTS */}
            {eventTab === "explore" && (
              <div className="grid md:grid-cols-3 gap-6">
                {DUMMY_EVENTS
                  .filter(e => !myEvents.some(me => me.id === e.id))
                  .map(e => (
                  <motion.div
                    key={e.id}
                    whileHover={{ scale: 1.05 }}
                    onClick={() => setEventPreview(e)}
                    className="relative bg-white p-6 rounded-3xl shadow-xl cursor-pointer overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 w-20 h-20 bg-purple-500/20 blur-2xl rounded-full" />
                    <h3 className="text-lg font-extrabold text-purple-700">{e.title}</h3>
                    <p className="text-xs text-slate-500">By {e.organiser}</p>

                    <div className="flex flex-wrap gap-1 mt-2">
                      {e.tags.map(t => (
                        <span key={t} className="bg-purple-100 text-purple-700 px-2 py-0.5 text-[10px] rounded-full font-semibold">
                          {t}
                        </span>
                      ))}
                    </div>

                    <div className="flex justify-between mt-3 text-xs">
                      <span>👥 {e.attendees}/{e.maxSeats}</span>
                      <span className="text-red-500">⏳ {e.date}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </>
        )}
        {mode === "events" && eventTab === "mine" && (
          <div className="grid md:grid-cols-3 gap-6">
            {myEvents.length === 0 && (
              <p className="text-slate-500">You haven't joined any events yet.</p>
            )}

            {myEvents.map(e => (
              <motion.div
                key={e.id}
                whileHover={{ scale: 1.05 }}
                onClick={() => setEventPreview(e)}
                className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-3xl shadow-xl cursor-pointer"
              >
                <h3 className="text-lg font-extrabold text-emerald-700">{e.title}</h3>
                <p className="text-xs text-slate-500">Registered</p>
                <div className="flex justify-between mt-3 text-xs">
                  <span>📍 {e.location}</span>
                  <span>🕒 {e.date}</span>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {eventPreview && mode === "events" && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            className="fixed right-0 top-[72px] h-[calc(100vh-72px)] w-[420px]
            bg-gradient-to-br from-purple-50 to-indigo-50 shadow-2xl p-8 z-50 flex flex-col"
          >
            <div className="flex justify-between mb-4">
              <h2 className="text-2xl font-extrabold text-purple-700">
                {eventPreview.title}
              </h2>
              <button onClick={() => setEventPreview(null)}>✕</button>
            </div>

            <div className="space-y-3 text-sm text-slate-700">
              <p>{eventPreview.description}</p>
              <p><b>Organiser:</b> {eventPreview.organiser}</p>
              <p><b>Date:</b> {eventPreview.date}</p>
              <p><b>Time:</b> {eventPreview.time}</p>
              <p><b>Venue:</b> {eventPreview.location}</p>
              <p><b>Seats:</b> {eventPreview.attendees}/{eventPreview.maxSeats}</p>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() =>
                  window.open(`https://www.google.com/maps?q=${eventPreview.lat},${eventPreview.lng}`)
                }
                className="bg-white shadow px-4 py-2 rounded-xl text-xs font-bold hover:scale-105 transition"
              >
                Open Maps
              </button>

              <button
                onClick={() => {
                  const start = `${eventPreview.date.replace(/-/g,"")}T${eventPreview.time.replace(":","")}00`;
                  window.open(
                    `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(eventPreview.title)}&dates=${start}/${start}&details=${encodeURIComponent(eventPreview.description)}&location=${encodeURIComponent(eventPreview.location)}`
                  );
                }}
                className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 py-2 rounded-xl text-xs font-bold"
              >
                Add to Calendar
              </button>
            </div>

            <button
              onClick={() => {
                if (!myEvents.some(e => e.id === eventPreview.id)) {
                  setMyEvents([...myEvents, eventPreview]);
                  setEventTab("mine");
                }
              }}
              className="mt-8 bg-emerald-600 text-white py-3 rounded-xl font-bold shadow-xl hover:scale-105 transition"
            >
              ✔ Apply for Event
            </button>
          </motion.div>
        )}
      </div>
    );
  }
