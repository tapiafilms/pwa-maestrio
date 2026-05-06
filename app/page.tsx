import { AvatarChat } from "@/components/AvatarChat";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#0a0f1a] text-white">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-5 max-w-xl mx-auto">
        <img src="/logo-maestrio.png" alt="Maestrio" className="h-8 w-auto" />
        <span className="text-sm text-slate-400 hidden sm:block">Tu técnico en minutos · vía WhatsApp</span>
      </nav>

      {/* Hero */}
      <section className="max-w-xl mx-auto px-6 pt-4 pb-8 flex flex-col items-center gap-6">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 bg-[#4282d8]/10 border border-[#4282d8]/30 rounded-full px-4 py-1.5">
            <span className="w-2 h-2 rounded-full bg-[#4282d8] animate-pulse" />
            <span className="text-sm text-[#4282d8] font-medium">Técnicos disponibles ahora</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black leading-tight">
            Cuéntame tu problema<br />
            <span className="text-[#4282d8]">y busco un técnico.</span>
          </h1>
          <p className="text-slate-400 text-sm">Habla o escribe — te conecto con el maestro indicado vía WhatsApp.</p>
        </div>

        {/* Avatar como pieza central */}
        <div className="w-full">
          <AvatarChat />
        </div>

        {/* Servicios */}
        <div className="w-full">
          <p className="text-center text-slate-500 text-xs uppercase tracking-widest mb-4">Servicios disponibles</p>
          <div className="grid grid-cols-6 gap-2">
            {[
              { icon: "🔧", label: "Gasfíter" },
              { icon: "⚡", label: "Electricista" },
              { icon: "🔑", label: "Cerrajero" },
              { icon: "🖌️", label: "Pintor" },
              { icon: "🛠️", label: "Técnico" },
              { icon: "🧹", label: "Limpieza" },
            ].map(({ icon, label }) => (
              <div key={label} className="flex flex-col items-center gap-1 bg-[#111827] border border-white/5 rounded-xl py-3 hover:border-[#4282d8]/40 transition-colors">
                <span className="text-xl">{icon}</span>
                <span className="text-xs text-slate-500">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="text-center py-6 text-slate-600 text-xs">
        © {new Date().getFullYear()} Maestrio · Todos los derechos reservados ·{" "}
        <a href="/registro" className="text-[#4282d8] hover:underline">¿Eres técnico? Regístrate</a>
      </footer>
    </main>
  );
}
