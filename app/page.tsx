export default function HomePage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-4 text-center">
      {/* Badge */}
      <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium text-slate-400 backdrop-blur-sm">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
        </span>
        Foundation · Phase 1
      </div>

      {/* Main Heading */}
      <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl">
        Cloud Certitude{" "}
        <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
          E-Commerce
        </span>{" "}
        Demo
      </h1>

      {/* Sub-heading */}
      <p className="mt-6 max-w-2xl text-lg text-slate-400 sm:text-xl">
        Powered by{" "}
        <span className="font-semibold text-white">Next.js</span>
        {", "}
        <span className="font-semibold text-white">Supabase</span>
        {", and "}
        <span className="font-semibold text-white">Vercel</span>
      </p>

      {/* Tech Stack Pills */}
      <div className="mt-10 flex flex-wrap justify-center gap-3">
        {[
          { label: "Next.js 15", color: "bg-white/10 text-white" },
          { label: "TypeScript", color: "bg-blue-500/20 text-blue-300" },
          { label: "Tailwind CSS", color: "bg-cyan-500/20 text-cyan-300" },
          { label: "Supabase", color: "bg-emerald-500/20 text-emerald-300" },
          { label: "Vercel", color: "bg-slate-500/20 text-slate-300" },
        ].map((tech) => (
          <span
            key={tech.label}
            className={`rounded-full px-4 py-1.5 text-sm font-medium border border-white/10 ${tech.color}`}
          >
            {tech.label}
          </span>
        ))}
      </div>

      {/* Status Card */}
      <div className="mt-14 w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-6 text-left backdrop-blur-sm">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-400">
          Project Status
        </h2>
        <ul className="mt-4 space-y-3">
          {[
            { label: "Project foundation", done: true },
            { label: "Supabase client config", done: true },
            { label: "Folder structure", done: true },
            { label: "Authentication", done: false },
            { label: "Product catalogue", done: false },
            { label: "Shopping cart", done: false },
            { label: "Checkout & payments", done: false },
          ].map((item) => (
            <li key={item.label} className="flex items-center gap-3 text-sm">
              <span
                className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                  item.done
                    ? "bg-emerald-500/20 text-emerald-400"
                    : "bg-slate-700 text-slate-500"
                }`}
              >
                {item.done ? "✓" : "·"}
              </span>
              <span className={item.done ? "text-slate-200" : "text-slate-500"}>
                {item.label}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* Footer note */}
      <p className="mt-10 text-xs text-slate-600">
        Cloud Certitude E-Commerce Demo · Built with Next.js App Router
      </p>
    </main>
  );
}
