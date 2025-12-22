import { motion, type Variants } from "framer-motion";
import { useNavigate } from "react-router-dom";

const cardVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 24,
  },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.15,
      duration: 0.5,
      ease: "easeOut",
    },
  }),
};

export default function CareerCards() {
  const navigate = useNavigate();

  return (
    <section className="grid gap-8 pb-28">

      {/* ================= TOP ROW ================= */}
      <div className="grid md:grid-cols-2 gap-8">

        {/* -------- GUIDANCE CARD -------- */}
        <motion.div
          custom={0}
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          whileHover={{ y: -8, scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          className="
            group cursor-pointer
            rounded-2xl p-12
            bg-gradient-to-br from-orange-100 to-orange-50
            shadow-sm hover:shadow-xl
            transition-shadow
          "
          onClick={() => navigate("/career/guidance")}
        >
          <span className="inline-block mb-4 text-xs font-semibold tracking-wide text-orange-600 bg-orange-200/60 px-3 py-1 rounded-full">
            MENTORSHIP
          </span>

          <h3
            className="
              text-3xl font-semibold text-slate-900
              transition-all duration-300
              group-hover:text-orange-600
              group-hover:drop-shadow-[0_0_12px_rgba(251,146,60,0.6)]
            "
          >
            Guidance Window
          </h3>

          <p className="mt-4 text-slate-600 max-w-md text-lg">
            Connect with seniors, ask questions, and earn trophies for your growth journey.
          </p>

          <div className="mt-8 flex gap-3 flex-wrap">
            <button className="px-5 py-2.5 bg-white rounded-full shadow text-sm font-medium">
              Ask Seniors
            </button>
            <button className="px-5 py-2.5 bg-white rounded-full shadow text-sm font-medium">
              Earn Trophies
            </button>
          </div>

          <button className="mt-8 text-orange-600 font-semibold">
            Enter Guidance Zone →
          </button>
        </motion.div>

        {/* -------- PROJECTS & EVENTS CARD -------- */}
        <motion.div
          custom={1}
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          whileHover={{ y: -8, scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          className="
            group cursor-pointer
            rounded-2xl p-12
            bg-gradient-to-br from-blue-100 to-indigo-50
            shadow-sm hover:shadow-xl
            transition-shadow
          "
          onClick={() => navigate("/career/projects")}
        >
          <span className="inline-block mb-4 text-xs font-semibold tracking-wide text-blue-600 bg-blue-200/60 px-3 py-1 rounded-full">
            COLLABORATION
          </span>

          <h3
            className="
              text-3xl font-semibold text-slate-900
              transition-all duration-300
              group-hover:text-blue-600
              group-hover:drop-shadow-[0_0_14px_rgba(59,130,246,0.6)]
            "
          >
            Projects & Events
          </h3>

          <p className="mt-4 text-slate-600 max-w-md text-lg">
            Discover new projects, join hackathons, and build amazing things together.
          </p>

          <div className="mt-8 flex gap-3 flex-wrap">
            <button className="px-5 py-2.5 bg-white rounded-full shadow text-sm font-medium">
              Explore Projects
            </button>
            <button className="px-5 py-2.5 bg-white rounded-full shadow text-sm font-medium">
              Join Events
            </button>
          </div>

          <button className="mt-8 text-blue-600 font-semibold">
            Explore Opportunities →
          </button>
        </motion.div>
      </div>

      {/* ================= CAMPUS BUZZ ================= */}
      <motion.div
        custom={2}
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        whileHover={{ y: -4, scale: 1.005 }}
        whileTap={{ scale: 0.99 }}
        className="
          group cursor-pointer
          rounded-2xl p-14
          bg-gradient-to-r from-purple-100 to-pink-100
          shadow-sm hover:shadow-lg
          transition-shadow
        "
        onClick={() => navigate("/career/buzz")}
      >
        <span className="inline-block mb-4 text-xs font-semibold tracking-wide text-purple-600 bg-purple-200/60 px-3 py-1 rounded-full">
          CAMPUS BUZZ
        </span>

        <h3
          className="
            text-4xl font-semibold text-slate-900
            transition-all duration-300
            group-hover:text-purple-600
            group-hover:drop-shadow-[0_0_16px_rgba(168,85,247,0.6)]
          "
        >
          What's Happening?
        </h3>

        <p className="mt-4 text-slate-600 max-w-xl text-lg">
          Celebrate student achievements and catch up on the latest campus news.
        </p>

        <button className="mt-8 text-purple-600 font-semibold">
          Read Latest Stories →
        </button>
      </motion.div>

    </section>
  );
}
