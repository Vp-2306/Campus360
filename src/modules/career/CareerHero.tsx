export default function CareerHero() {
  return (
    <section className="text-center py-20">
      <h1 className="text-6xl md:text-7xl font-extrabold text-slate-900 leading-tight tracking-tight">
        Your Career Companion for <br />
        <span className="text-blue-600">
        Guidance, Projects & Events
        </span>
      </h1>
      <p className="mt-6 text-lg text-slate-600 max-w-2xl mx-auto">
        Connect with seniors, discover exciting projects, and never miss a
        campus event. Everything you need to grow, all in one place.
      </p>

      <div className="mt-8 flex justify-center gap-4 flex-wrap">
        {["Mentorship", "Project Openings", "Tech Events", "Community"].map(
          (tag) => (
            <span
              key={tag}
              className="px-4 py-2 bg-white rounded-full border text-sm shadow-sm"
            >
              {tag}
            </span>
          )
        )}
      </div>
    </section>
  );
}
