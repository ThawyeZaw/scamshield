export default function HomePage() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-7 w-7 text-[#DAA520]"
            aria-hidden="true"
          >
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            <path d="m9 12 2 2 4-4" />
          </svg>
          <h1 className="text-2xl font-bold tracking-tight text-[#0F172A]">
            ScamShield
          </h1>
        </div>
        <p className="mt-2 text-sm text-[#475569]">
          Project scaffold is ready. Run <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs font-medium text-[#0F172A]">/continue</code> to start building the ScamShield MVP.
        </p>
      </div>
    </main>
  );
}
