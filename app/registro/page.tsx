import { TechnicianForm } from "@/components/TechnicianForm";

export default function RegistroPage() {
  return (
    <main className="min-h-screen bg-[#0a0f1a] text-white">
      <nav className="flex items-center justify-between px-6 py-5 max-w-2xl mx-auto">
        <img src="/logo-maestrio.png" alt="Maestrio" className="h-8 w-auto" />
        <a href="/" className="text-sm text-slate-400 hover:text-white transition-colors">← Volver</a>
      </nav>

      <section className="max-w-2xl mx-auto px-6 pt-8 pb-16">
        <div className="mb-8 space-y-2">
          <div className="inline-flex items-center gap-2 bg-[#4282d8]/10 border border-[#4282d8]/30 rounded-full px-4 py-1.5 mb-2">
            <span className="text-sm text-[#4282d8] font-medium">🔧 Únete como técnico</span>
          </div>
          <h1 className="text-3xl font-black">Regístrate y recibe<br /><span className="text-[#4282d8]">solicitudes de trabajo</span></h1>
          <p className="text-slate-400">Completa el formulario y te contactaremos por WhatsApp cuando haya un trabajo disponible.</p>
        </div>

        <TechnicianForm />

        <div className="mt-8 grid grid-cols-3 gap-4 text-center">
          {[
            { icon: "💬", text: "Recibe trabajos por WhatsApp" },
            { icon: "📍", text: "Clientes cerca de ti" },
            { icon: "🆓", text: "Sin costo de registro" },
          ].map(({ icon, text }) => (
            <div key={text} className="bg-[#111827] border border-white/5 rounded-xl p-4">
              <div className="text-2xl mb-2">{icon}</div>
              <p className="text-xs text-slate-400">{text}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
