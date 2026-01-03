import { useEffect, useState } from "react";
import { collection, onSnapshot, addDoc, query, where } from "firebase/firestore";
import { db } from "../../firebase/firebase";
import { useAuth } from "../../hooks/useAuth";
import { motion } from "framer-motion";

/* ---------- CONFIG ---------- */

const SLOT_HOURS = ["16:00","17:00","18:00","19:00","20:00","21:00","22:00"];

const SPORTS = [
  { id:"basketball", name:"Basketball", img:"/sports/basketball.jfif", venues:["Basketball Court 1","Basketball Court 2"] },
  { id:"tt", name:"Table Tennis", img:"/sports/tt.webp", venues:[
      ...Array.from({length:5},(_,i)=>`TT Table ${i+1} (OSC)`),
      ...Array.from({length:5},(_,i)=>`TT Table ${i+1} (NSC)`),
  ]},
  { id:"tennis", name:"Tennis", img:"/sports/tennis.jpg", venues:["Tennis Court 1","Tennis Court 2","Tennis Court 3"] },
  { id:"volleyball", name:"Volleyball", img:"/sports/volleyball.jpg", venues:["Volleyball Court 1","Volleyball Court 2"] },
  { id:"badminton", name:"Badminton", img:"/sports/badminton.webp", venues:[
      ...Array.from({length:5},(_,i)=>`Badminton Court ${i+1} (OSC)`),
      ...Array.from({length:5},(_,i)=>`Badminton Court ${i+1} (NSC)`),
  ]},
  { id:"football", name:"Football", img:"/sports/football.jpg", venues:["Football Ground A","Football Ground B"] },
  { id:"cricket", name:"Cricket Pitch", img:"/sports/cricket.jpg", venues:["Cricket Pitch 1","Cricket Pitch 2"] },
  { id:"swimming", name:"Swimming", img:"/sports/swimming.jpg", venues:["Main Pool Lane 1","Main Pool Lane 2","Training Pool"] },
  { id:"wrestling", name:"Wrestling", img:"/sports/wrestling.jpg", venues:Array.from({length:3},(_,i)=>`Mat ${i+1} (NSC)`) },
];

/* ---------- COMPONENT ---------- */

export default function SportsHub() {
  const { user } = useAuth();
  const [tab,setTab] = useState<"book"|"mine">("book");
  const [sport,setSport] = useState<any>(null);
  const [venue,setVenue] = useState<string|null>(null);
  const [slot,setSlot] = useState<string|null>(null);
  const [partner,setPartner] = useState("");
  const [purpose,setPurpose] = useState("");
  const [bookings,setBookings] = useState<any[]>([]);

  const today = new Date().toISOString().split("T")[0];

  useEffect(()=>{
    if(!user) return;
    return onSnapshot(
      query(collection(db,"bookings"), where("userId","==",user.uid)),
      snap => setBookings(snap.docs.map(d=>({id:d.id,...d.data()})))
    );
  },[user]);

  const isSlotBooked = (t:string) =>
    bookings.some(b =>
      b.facilityName === venue &&
      b.date === today &&
      b.time === t
    );

  const hasBookedSportToday = () =>
    bookings.some(b => b.sport === sport?.id && b.date === today);

  const confirmBooking = async()=>{
    if(!partner || !purpose) return alert("Fill partner and purpose");
    if(hasBookedSportToday()) return alert("Only one slot per sport per day allowed.");

    await addDoc(collection(db,"bookings"),{
      userId:user?.uid,
      sport:sport.id,
      facilityName:venue,
      date:today,
      time:slot,
      partner,
      purpose,
      createdAt:new Date()
    });

    setSlot(null); setVenue(null); setSport(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 p-10">
      <h1 className="text-5xl font-extrabold mb-2">Campus Sports Hub</h1>
      <p className="text-slate-500 mb-10">Book courts, manage sessions & stay active.</p>

      <div className="flex gap-4 mb-10">
        {["book","mine"].map(t=>(
          <button key={t} onClick={()=>setTab(t as any)}
            className={`px-6 py-2 rounded-full ${tab===t?"bg-emerald-600 text-white":"bg-white shadow"}`}>
            {t==="book"?"Book Now":"My Bookings"}
          </button>
        ))}
      </div>

{/* SPORTS GRID */}
{tab==="book" && !sport && (
  <div className="grid md:grid-cols-4 gap-8">
    {SPORTS.map(s=>(
      <motion.div key={s.id} whileHover={{scale:1.05}} onClick={()=>setSport(s)}
        className="h-60 rounded-3xl overflow-hidden shadow-xl relative cursor-pointer">
        <img src={s.img} className="absolute inset-0 w-full h-full object-cover"/>
        <div className="absolute inset-0 bg-black/40"/>
        <div className="absolute bottom-5 left-5 text-white">
          <h3 className="text-2xl font-bold">{s.name}</h3>
          <p className="text-xs mt-1">{s.venues.length} Venues • 4PM–11PM</p>
        </div>
      </motion.div>
    ))}
  </div>
)}

{/* VENUES */}
{sport && !venue && (
<>
<button onClick={()=>setSport(null)} className="mb-6 text-emerald-600">← Back to Sports</button>
<div className="grid md:grid-cols-3 gap-6">
{sport.venues.map((v:string)=>(
  <div key={v} onClick={()=>setVenue(v)}
    className="bg-white p-6 rounded-2xl shadow cursor-pointer hover:shadow-xl">
    <h3 className="font-bold">{v}</h3>
    <p className="text-xs text-slate-500">Tap to view slots</p>
  </div>
))}
</div>
</>
)}

{/* SLOT PANEL */}
{venue && (
<div className="fixed right-0 top-0 h-full w-[420px] bg-white shadow-2xl p-8">
<button onClick={()=>setVenue(null)}>← Back</button>
<h2 className="text-2xl font-bold mt-4">{venue}</h2>

<div className="grid grid-cols-2 gap-4 mt-6">
{SLOT_HOURS.map(t=>{
  const booked = isSlotBooked(t);
  return (
    <button key={t} disabled={booked}
      onClick={()=>setSlot(t)}
      className={`py-3 rounded-xl ${booked?"line-through bg-red-100 text-red-500":"bg-slate-100"}`}>
      {t}
    </button>
  );
})}
</div>

{slot && (
<div className="mt-6 space-y-3">
<input value={partner} onChange={e=>setPartner(e.target.value)} placeholder="Partner names"
className="w-full border p-2 rounded"/>
<input value={purpose} onChange={e=>setPurpose(e.target.value)} placeholder="Purpose"
className="w-full border p-2 rounded"/>
<button onClick={confirmBooking}
className="w-full bg-emerald-600 text-white py-3 rounded-xl font-bold">
Confirm Booking
</button>
</div>
)}
</div>
)}

{/* MY BOOKINGS */}
{tab==="mine" && (
<div className="grid md:grid-cols-2 gap-6">
{bookings.map(b=>(
<div key={b.id} className="bg-white p-6 rounded-3xl shadow">
<h3 className="font-bold">{b.facilityName}</h3>
<p className="text-xs text-slate-500">{b.date} • {b.time}</p>
<a target="_blank"
href={`https://www.google.com/calendar/render?action=TEMPLATE&text=${b.facilityName}&dates=${b.date.replace(/-/g,"")}T${b.time.replace(":","")}00/${b.date.replace(/-/g,"")}T${b.time.replace(":","")}00`}
className="text-emerald-600 text-sm font-semibold">
Add to Google Calendar →
</a>
</div>
))}
</div>
)}

</div>
);
}
