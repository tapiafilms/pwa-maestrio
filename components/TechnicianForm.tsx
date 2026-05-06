"use client";

import { useState, useRef, ChangeEvent } from "react";

const CATEGORIES = [
  { value: "plumber", label: "Gasfíter / Plomero" },
  { value: "electrician", label: "Electricista" },
  { value: "locksmith", label: "Cerrajero" },
  { value: "painter", label: "Pintor" },
  { value: "appliance_repair", label: "Técnico en electrodomésticos" },
  { value: "cleaning", label: "Limpieza" },
  { value: "other", label: "Otro" },
];

const COMUNAS = [
  "Santiago", "Providencia", "Las Condes", "Ñuñoa", "Macul", "La Florida",
  "Maipú", "Pudahuel", "Quilicura", "Recoleta", "Independencia", "Conchalí",
  "Huechuraba", "Vitacura", "Lo Barnechea", "Peñalolén", "La Reina",
  "Macul", "San Miguel", "La Cisterna", "El Bosque", "Pedro Aguirre Cerda",
  "Lo Espejo", "Estación Central", "Cerrillos", "Búsqueda de talentos",
  "Valparaíso", "Viña del Mar", "Quilpué", "Villa Alemana", "Concón",
  "Otra",
];

type State = "idle" | "loading" | "success" | "error";

export function TechnicianForm() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [category, setCategory] = useState("");
  const [comuna, setComuna] = useState("");
  const [preview, setPreview] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [state, setState] = useState<State>("idle");
  const [feedback, setFeedback] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  function handlePhoto(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    setPreview(URL.createObjectURL(file));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setState("loading");
    setFeedback("");

    const formData = new FormData();
    formData.append("name", name);
    formData.append("phone", phone);
    formData.append("category", category);
    formData.append("comuna", comuna);
    if (photoFile) formData.append("photo", photoFile);

    try {
      const res = await fetch("/api/technician", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "Error inesperado");
      setState("success");
    } catch (err) {
      setState("error");
      setFeedback(err instanceof Error ? err.message : "Error al registrar");
    }
  }

  if (state === "success") {
    return (
      <div className="rounded-2xl bg-[#111827] border border-[#4282d8]/30 p-10 text-center space-y-4">
        <div className="w-20 h-20 rounded-full bg-[#4282d8]/10 flex items-center justify-center mx-auto text-4xl">✅</div>
        <h3 className="text-white font-bold text-2xl">¡Registro exitoso!</h3>
        <p className="text-slate-400 leading-relaxed">
          Bienvenido a Maestrio. Recibirás solicitudes de trabajo por WhatsApp cuando haya un servicio disponible cerca de ti.
        </p>
        <div className="mt-4 bg-[#0a0f1a] rounded-xl p-4 text-sm text-slate-400 border border-white/5">
          <p className="font-medium text-white mb-1">Paso siguiente importante:</p>
          <p>Envía <span className="text-[#4282d8] font-mono font-bold">join make-shoulder </span> al número <span className="text-white font-mono">+14155238886</span> desde tu WhatsApp para activar las notificaciones. Este paso es fundamental para recibir trabajos. ¡Adelante!</p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl bg-[#111827] border border-white/5 p-6 space-y-5">

      {/* Foto */}
      <div className="flex items-center gap-4">
        <button type="button" onClick={() => fileRef.current?.click()}
          className="w-20 h-20 rounded-full border-2 border-dashed border-white/20 hover:border-[#4282d8]/60 flex items-center justify-center overflow-hidden transition-colors flex-shrink-0">
          {preview
            ? <img src={preview} alt="preview" className="w-full h-full object-cover" />
            : <span className="text-2xl">📷</span>}
        </button>
        <div>
          <p className="text-sm font-medium text-slate-300">Foto de perfil</p>
          <p className="text-xs text-slate-500 mt-0.5">Opcional · Genera más confianza</p>
          <button type="button" onClick={() => fileRef.current?.click()}
            className="mt-2 text-xs text-[#4282d8] underline underline-offset-2">
            {preview ? "Cambiar foto" : "Subir foto"}
          </button>
        </div>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
      </div>

      {/* Nombre */}
      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-slate-300">Nombre completo</label>
        <input required value={name} onChange={e => setName(e.target.value)}
          className="w-full rounded-xl bg-[#0a0f1a] border border-white/10 text-slate-100 placeholder-slate-600 px-4 py-3 text-sm outline-none focus:border-[#4282d8]/60 focus:ring-1 focus:ring-[#4282d8]/30 transition"
          placeholder="Juan Pérez" />
      </div>

      {/* Teléfono */}
      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-slate-300">WhatsApp (con código de país)</label>
        <input required value={phone} onChange={e => setPhone(e.target.value)} type="tel"
          className="w-full rounded-xl bg-[#0a0f1a] border border-white/10 text-slate-100 placeholder-slate-600 px-4 py-3 text-sm outline-none focus:border-[#4282d8]/60 focus:ring-1 focus:ring-[#4282d8]/30 transition"
          placeholder="+56 9 1234 5678" />
      </div>

      {/* Especialidad */}
      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-slate-300">Especialidad</label>
        <select required value={category} onChange={e => setCategory(e.target.value)}
          className="w-full rounded-xl bg-[#0a0f1a] border border-white/10 text-slate-100 px-4 py-3 text-sm outline-none focus:border-[#4282d8]/60 focus:ring-1 focus:ring-[#4282d8]/30 transition appearance-none">
          <option value="" disabled>Selecciona tu especialidad</option>
          {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
        </select>
      </div>

      {/* Comuna */}
      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-slate-300">Comuna donde trabajas</label>
        <select required value={comuna} onChange={e => setComuna(e.target.value)}
          className="w-full rounded-xl bg-[#0a0f1a] border border-white/10 text-slate-100 px-4 py-3 text-sm outline-none focus:border-[#4282d8]/60 focus:ring-1 focus:ring-[#4282d8]/30 transition appearance-none">
          <option value="" disabled>Selecciona tu comuna</option>
          {COMUNAS.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {state === "error" && (
        <p className="text-sm text-red-400 bg-red-400/10 rounded-lg px-3 py-2">{feedback}</p>
      )}

      <button type="submit" disabled={state === "loading"}
        className="w-full rounded-xl bg-[#4282d8] hover:bg-[#5291e8] disabled:bg-slate-700 disabled:text-slate-500 text-white font-bold py-3.5 text-sm transition-all flex items-center justify-center gap-2">
        {state === "loading"
          ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>Registrando...</>
          : <>Registrarme como técnico →</>}
      </button>

      <p className="text-center text-slate-600 text-xs">Gratis · Sin comisiones · Solo pagas si quieres</p>
    </form>
  );
}
