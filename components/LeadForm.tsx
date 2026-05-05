"use client";

import { FormEvent, useState } from "react";

type SubmitState = "idle" | "loading" | "success" | "error";

export function LeadForm() {
  const [message, setMessage] = useState("");
  const [phone, setPhone] = useState("");
  const [state, setState] = useState<SubmitState>("idle");
  const [feedback, setFeedback] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState("loading");
    setFeedback("");

    try {
      const response = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, phone }),
      });

      const payload = await response.json();
      if (!response.ok) throw new Error(payload?.error ?? "Error inesperado");

      setState("success");
      setFeedback("¡Listo! Estamos contactando técnicos. Recibirás un WhatsApp pronto.");
      setMessage("");
      setPhone("");
    } catch (error) {
      setState("error");
      setFeedback(error instanceof Error ? error.message : "No se pudo enviar la solicitud");
    }
  }

  if (state === "success") {
    return (
      <div className="rounded-2xl bg-[#111827] border border-[#4282d8]/30 p-8 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-[#4282d8]/10 flex items-center justify-center mx-auto text-3xl">
          ✅
        </div>
        <h3 className="text-white font-bold text-xl">¡Solicitud enviada!</h3>
        <p className="text-slate-400 text-sm leading-relaxed">{feedback}</p>
        <button
          onClick={() => setState("idle")}
          className="mt-4 text-[#4282d8] text-sm underline underline-offset-4 hover:text-blue-300 transition-colors"
        >
          Enviar otra solicitud
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl bg-[#111827] border border-white/5 p-6 space-y-5 shadow-xl">
      <div className="space-y-1">
        <h2 className="text-white font-bold text-lg">¿Qué necesitas reparar?</h2>
        <p className="text-slate-500 text-sm">Cuéntanos el problema y te conectamos con el maestro ideal.</p>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="message" className="block text-sm font-medium text-slate-300">
          Describe el problema
        </label>
        <textarea
          id="message"
          required
          minLength={10}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={4}
          className="w-full rounded-xl bg-[#0a0f1a] border border-white/10 text-slate-100 placeholder-slate-600 p-3.5 text-sm outline-none focus:border-[#4282d8]/60 focus:ring-1 focus:ring-[#4282d8]/30 transition resize-none"
          placeholder="Ej: Se me tapó el baño y está desbordando agua..."
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="phone" className="block text-sm font-medium text-slate-300">
          Tu número de WhatsApp
        </label>
        <div className="relative">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-sm">📱</span>
          <input
            id="phone"
            required
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full rounded-xl bg-[#0a0f1a] border border-white/10 text-slate-100 placeholder-slate-600 pl-9 pr-4 py-3 text-sm outline-none focus:border-[#4282d8]/60 focus:ring-1 focus:ring-[#4282d8]/30 transition"
            placeholder="+56 9 1234 5678"
          />
        </div>
      </div>

      {state === "error" && (
        <p className="text-sm text-red-400 bg-red-400/10 rounded-lg px-3 py-2">{feedback}</p>
      )}

      <button
        type="submit"
        disabled={state === "loading"}
        className="w-full rounded-xl bg-[#4282d8] hover:bg-[#5291e8] disabled:bg-slate-700 disabled:text-slate-500 text-white font-bold py-3.5 text-sm transition-all duration-200 flex items-center justify-center gap-2"
      >
        {state === "loading" ? (
          <>
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            Buscando técnico...
          </>
        ) : (
          <>
            Solicitar técnico ahora
            <span>→</span>
          </>
        )}
      </button>

      <p className="text-center text-slate-600 text-xs">
        Gratis · Sin registro · Respuesta en minutos
      </p>
    </form>
  );
}
