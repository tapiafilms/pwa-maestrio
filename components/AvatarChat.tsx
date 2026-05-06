"use client";

import { useState, useRef, useEffect, useCallback } from "react";

type BubbleType = "idle" | "user" | "loading" | "doc";

export function AvatarChat() {
  const [bubbleText, setBubbleText] = useState("Hola, ¿qué problema tienes en tu hogar?");
  const [bubbleType, setBubbleType] = useState<BubbleType>("doc");
  const [input, setInput] = useState("");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [micAvailable, setMicAvailable] = useState(false);

  const recognitionRef = useRef<any>(null);
  const typeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  /* ── Voz del navegador ── */
  function getVoice() {
  const voices = window.speechSynthesis?.getVoices() ?? [];
  return (
    voices.find(v => v.lang.startsWith("es") && /jorge|diego|carlos|miguel|pablo|juan|antonio|male/i.test(v.name)) ||
    voices.find(v => v.lang === "es-ES" && !/mónica|monica|lucía|lucia|elena|female|paulina|marisol/i.test(v.name)) ||
    voices.find(v => v.lang.startsWith("es") && !/mónica|monica|lucía|lucia|elena|female|paulina|marisol/i.test(v.name)) ||
    voices.find(v => v.lang.startsWith("es")) ||
    null
  );
}

  function speak(text: string) {
    if (!window.speechSynthesis) { setIsSpeaking(false); return; }
    window.speechSynthesis.cancel();
    const utt = new SpeechSynthesisUtterance(text);
    utt.lang = "es-ES";
    utt.rate = 0.92;
    utt.pitch = 1.05;
    utt.volume = 1.0;
    const voice = getVoice();
    if (voice) utt.voice = voice;
    utt.onstart = () => setIsSpeaking(true);
    utt.onend = () => setIsSpeaking(false);
    utt.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utt);
  }

  /* ── Burbuja con efecto de escritura ── */
  function showBubble(text: string, type: BubbleType) {
    if (typeTimerRef.current) { clearTimeout(typeTimerRef.current); typeTimerRef.current = null; }
    setBubbleType(type);
    if (type === "doc") {
      setBubbleText("");
      let i = 0;
      function typeNext() {
        if (i < text.length) {
          setBubbleText(prev => prev + text[i++]);
          typeTimerRef.current = setTimeout(typeNext, 18);
        }
      }
      typeNext();
    } else {
      setBubbleText(text);
    }
  }

  /* ── Inicializar reconocimiento de voz ── */
  useEffect(() => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return;
    setMicAvailable(true);

    const rec = new SR();
    rec.lang = "es-CL";
    rec.continuous = false;
    rec.interimResults = true;

    rec.onstart = () => {
      setIsListening(true);
      setIsSpeaking(false);
      window.speechSynthesis?.cancel();
    };

    rec.onresult = (e: any) => {
      const transcript = Array.from(e.results as any[]).map((r: any) => r[0].transcript).join("");
      setInput(transcript);
    };

    rec.onend = () => {
      setIsListening(false);
      const val = inputRef.current?.value.trim();
      if (val) sendMessage(val);
    };

    rec.onerror = () => setIsListening(false);

    recognitionRef.current = rec;

    if (window.speechSynthesis) {
      window.speechSynthesis.getVoices();
      window.speechSynthesis.addEventListener("voiceschanged", () => window.speechSynthesis.getVoices());
    }
  }, []);

  /* ── Enviar mensaje ── */
  const sendMessage = useCallback(async (text?: string) => {
    const msg = (text ?? input).trim();
    if (!msg || isLoading) return;
    setInput("");
    setIsLoading(true);

    showBubble(msg, "user");

    // Unlock speechSynthesis en iOS
    if (window.speechSynthesis) {
      const unlock = new SpeechSynthesisUtterance(" ");
      unlock.volume = 0;
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(unlock);
    }

    setTimeout(() => { if (isLoading) showBubble("", "loading"); }, 400);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: msg })
      });
      const data = await res.json();
      const reply = data.text || "No pude procesar tu mensaje.";
      showBubble(reply, "doc");
      speak(reply);
    } catch {
      showBubble("No pude conectarme. Intenta en un momento.", "doc");
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading]);

  function toggleMic() {
    if (!recognitionRef.current) return;
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      if (window.speechSynthesis) {
        const u = new SpeechSynthesisUtterance(" ");
        u.volume = 0;
        window.speechSynthesis.speak(u);
      }
      try { recognitionRef.current.start(); } catch {}
    }
  }

  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-sm mx-auto">

      {/* Avatar video */}
      <div className="relative w-48 h-48">
        <video
          id="avatar-escuchando"
          src="/avatar-escuchando.mp4"
          autoPlay loop muted playsInline
          className={`absolute inset-0 w-full h-full object-cover rounded-full border-4 transition-all duration-300 ${
            isSpeaking ? "opacity-0 scale-95" : "opacity-100 scale-100 border-[#4282d8]/50 shadow-[0_0_30px_rgba(66,130,216,0.3)]"
          }`}
        />
        <video
          id="avatar-hablando"
          src="/avatar-hablando.mp4"
          autoPlay loop muted playsInline
          className={`absolute inset-0 w-full h-full object-cover rounded-full border-4 transition-all duration-300 ${
            isSpeaking ? "opacity-100 scale-100 border-[#4282d8] shadow-[0_0_40px_rgba(66,130,216,0.5)]" : "opacity-0 scale-95"
          }`}
        />
        {/* Indicador escuchando */}
        {isListening && (
          <div className="absolute inset-0 rounded-full border-4 border-red-400 animate-pulse" />
        )}
      </div>

      {/* Burbuja de diálogo */}
      <div className={`relative w-full rounded-2xl px-4 py-3 text-sm min-h-[52px] transition-all duration-300 ${
        bubbleType === "user"
          ? "bg-[#4282d8]/20 border border-[#4282d8]/30 text-slate-300 text-right"
          : "bg-[#111827] border border-white/10 text-slate-200"
      }`}>
        {bubbleType === "loading" ? (
          <span className="flex gap-1 items-center">
            <span className="w-2 h-2 bg-[#4282d8] rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
            <span className="w-2 h-2 bg-[#4282d8] rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
            <span className="w-2 h-2 bg-[#4282d8] rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
          </span>
        ) : (
          <span>{bubbleText}</span>
        )}
      </div>

      {/* Input */}
      <div className="flex w-full gap-2">
        <input
          ref={inputRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && sendMessage()}
          placeholder={isListening ? "Escuchando..." : "Escribe tu problema..."}
          className="flex-1 rounded-xl bg-[#0a0f1a] border border-white/10 text-slate-100 placeholder-slate-600 px-4 py-3 text-sm outline-none focus:border-[#4282d8]/60 focus:ring-1 focus:ring-[#4282d8]/30 transition"
        />

        {micAvailable && (
          <button
            onClick={toggleMic}
            className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
              isListening
                ? "bg-red-500 text-white animate-pulse"
                : "bg-[#111827] border border-white/10 text-slate-400 hover:text-white hover:border-[#4282d8]/40"
            }`}
          >
            🎤
          </button>
        )}

        <button
          onClick={() => sendMessage()}
          disabled={isLoading || !input.trim()}
          className="w-12 h-12 rounded-xl bg-[#4282d8] hover:bg-[#5291e8] disabled:bg-slate-700 disabled:text-slate-500 text-white flex items-center justify-center transition-all"
        >
          {isLoading ? (
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : "→"}
        </button>
      </div>
    </div>
  );
}
