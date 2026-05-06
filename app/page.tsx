import { LeadForm } from "@/components/LeadForm";
import { AvatarChat } from "@/components/AvatarChat";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#0a0f1a] text-white">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-5 max-w-5xl mx-auto">
        <div className="flex items-center gap-2">
          <img src="/logo-maestrio.png" alt="Maestrio" className="h-8 w-auto" />
        </div>
        <span className="text-sm text-slate-400 hidden sm:block">Tu técnico en minutos · vía WhatsApp</span>
      </nav>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-6 pt-8 pb-8 grid md:grid-cols-2 gap-12 items-center">
        <div className="space-y-6 flex flex-col items-center md:items-start">
          <div className="inline-flex items-center gap-2 bg-[#4282d8]/10 border border-[#4282d8]/30 rounded-full px-4 py-1.5">
            <span className="w-2 h-2 rounded-full bg-[#4282d8] animate-pulse"></span>
            <span className="text-sm text-[#4282d8] font-medium">Técnicos disponibles ahora</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-black leading-tight text-center md:text-left">
            Cuéntame tu problema<br />
            <span className="text-[#4282d8]">y busco un técnico.</span>
          </h1>

          <p className="text-slate-400 text-base leading-relaxed text-center md:text-left">
            Háblame o escríbeme lo que necesitas. Te conecto con el maestro indicado vía WhatsApp.
          </p>

          {/* Avatar */}
          <AvatarChat />
        </div>

        <div>
          <div className="text-center mb-4">
            <span className="text-slate-500 text-sm">O completa el formulario directamente</span>
          </div>
          <LeadForm />
        </div>
      </section>

      {/* Services */}
      <section className="max-w-5xl mx-auto px-6 py-12">
        <p className="text-center text-slate-500 text-sm uppercase tracking-widest mb-8">Servicios disponibles</p>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {[
            { icon: "🔧", label: "Gasfiter" },
            { icon: "⚡", label: "Electricista" },
            { icon: "🔑", label: "Cerrajero" },
            { icon: "🖌️", label: "Pintor" },
            { icon: "🛠️", label: "Técnico" },
            { icon: "🧹", label: "Limpieza" },
          ].map(({ icon, label }) => (
            <div key={label} className="flex flex-col items-center gap-2 bg-[#111827] border border-white/5 rounded-2xl py-4 px-2 hover:border-[#4282d8]/40 transition-colors">
              <span className="text-2xl">{icon}</span>
              <span className="text-xs text-slate-400">{label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="text-center py-8 text-slate-600 text-sm">
        © {new Date().getFullYear()} Maestrio · Todos los derechos reservados
      </footer>
    </main>
  );
}
