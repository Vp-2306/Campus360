import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Campus360Navbar from "../components/Campus360Navbar";

export default function Campus360() {
  const navigate = useNavigate();

  return (
    <>
      <Campus360Navbar />

      <div className="min-h-screen bg-gradient-to-br from-[#020617] via-[#0f172a] to-black text-white px-12 py-20">

        {/* GLOW ELEMENTS */}
        <div className="absolute top-[-120px] left-[-80px] w-96 h-96 bg-indigo-600/40 blur-3xl rounded-full" />
        <div className="absolute bottom-[-120px] right-[-80px] w-[480px] h-[480px] bg-purple-600/30 blur-3xl rounded-full" />

        {/* HEADER */}
        <div className="relative z-10 max-w-7xl mx-auto mb-20">
            <h1 className="text-6xl font-extrabold tracking-tight leading-tight">
                Your campus, <span className="text-indigo-400">re-imagined.</span>
            </h1>

            <p className="mt-5 text-white/70 max-w-2xl text-lg">
                Campus360 brings together your academic growth, campus facilities
                and social life into one seamless student ecosystem.
            </p>

            <div className="flex gap-2 mt-6">
                {["Career Growth", "Sports Facilities", "Student Life"].map(t => (
                <span
                    key={t}
                    className="px-4 py-1.5 rounded-full text-xs font-semibold bg-white/10 text-white/70"
                >
                    {t}
                </span>
                ))}
            </div>
        </div>


        {/* MODULE GRID */}
        <div className="relative z-10 max-w-7xl mx-auto grid grid-cols-2 gap-10">

          {/* CAREER COMPANION */}
          <motion.div
            whileHover={{ y: -10, scale: 1.01 }}
            className="group cursor-pointer rounded-3xl p-10 bg-gradient-to-br from-indigo-600/20 to-indigo-600/5 border border-indigo-500/30 shadow-xl"
            onClick={() => navigate("/career")}
          >
            <div className="flex gap-2 mb-4">
              {["Projects", "Events", "Collaboration"].map(t => (
                <span key={t} className="text-xs px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300">
                  {t}
                </span>
              ))}
            </div>

            <h3 className="text-3xl font-bold">Career Companion</h3>
            <p className="mt-4 text-white/70 text-lg">
              Discover student-led projects, join campus events and collaborate
              with peers to build real experience beyond classrooms.
            </p>

            <p className="mt-6 text-indigo-400 font-semibold">
              Enter Career Companion →
            </p>
          </motion.div>

          {/* SPORTS HUB */}
          <motion.div
            whileHover={{ y: -10, scale: 1.01 }}
            className="group cursor-pointer rounded-3xl p-10 bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 border border-emerald-400/30 shadow-xl"
            onClick={() => navigate("/sports")}
          >
            <div className="flex gap-2 mb-4">
              {["Courts", "Gym", "Live Slots"].map(t => (
                <span key={t} className="text-xs px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300">
                  {t}
                </span>
              ))}
            </div>

            <h3 className="text-3xl font-bold">Sports Hub</h3>
            <p className="mt-4 text-white/70 text-lg">
              Reserve badminton courts, football grounds and gym slots
              instantly with real-time availability.
            </p>

            <p className="mt-6 text-emerald-400 font-semibold">
              Explore Sports Facilities →
            </p>
          </motion.div>

          {/* CAMPUS CIRCLE – SOCIAL */}
          <motion.div
            whileHover={{ y: -10, scale: 1.01 }}
            className="group cursor-pointer col-span-2 rounded-3xl p-12 bg-gradient-to-br from-purple-500/20 to-pink-500/10 border border-purple-400/30 shadow-xl"
          >
            <div className="flex gap-2 mb-4">
              {["Parties", "Watch Parties", "Club Events", "Hangouts"].map(t => (
                <span key={t} className="text-xs px-3 py-1 rounded-full bg-purple-500/20 text-purple-300">
                  {t}
                </span>
              ))}
            </div>

            <h3 className="text-4xl font-bold">Campus Circle</h3>
            <p className="mt-4 text-white/70 text-lg max-w-3xl">
              The casual social space for students — host watch parties,
              invite friends to events, share moments and stay connected
              beyond academics.
            </p>

            <p className="mt-6 text-purple-400 font-semibold text-lg">
              Open Campus Circle →
            </p>
          </motion.div>

        </div>
      </div>
    </>
  );
}
