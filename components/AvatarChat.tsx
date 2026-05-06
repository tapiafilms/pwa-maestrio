"use client";

import { useState, useRef, useEffect, useCallback } from "react";

type Stage = "problem" | "comuna" | "phone" | "search" | "done";
type BubbleType = "doc" | "user" | "loading";

interface Message { role: "user" | "assistant"; content: string; }

export function AvatarChat() {
  const [stage, setStage] = useState<Stage>("problem");
  const [messages, setMessages] = useState<Message[]>([]);
  const [problem, setProblem] = useState("");
  const [comuna, setComuna] = useState("");
  const [phone, setPhone] = useState("");
  const [input, setInput] = useState("");
  const [bubbleText, setBubbleText] = useState("");
  const [bubbleType, setBubbleType] = useState<BubbleType>("loading");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [micAvailable, setMicAvailable] = useState(false);
  const [done, setDone] = useState(false);

  const recognitionRef = useRef<any>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const typeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const initialized = useRef(false);

  /* ── Voz masculina ── */
  function getVoice() {
    const voices = window.speechSynthesis?.getVoices() ?? [];
    return (
      voices.find(v => v.lang.startsWith("es") && /jorge|diego|carlos|miguel|pablo|juan|antonio/i.test(v.name)) ||
      voices.find(v => v.lang === "es-ES" && !/mónica|monica|lucía|lucia|elena|paulina|marisol|female/i.test(v.name)) ||
      voices.find(v => v.lang.startsWith("es") && !/mónica|monica|lucía|lucia|elena|female/i.test(v.name)) ||
      voices.find(v => v.lang.startsWith("es")) ||
      null
    );
  }

  function speak(text: string) {
    if (!window.speechSynthesis) { setIsSpeaking(false); return; }
    window.speechSynthesis.cancel();
    const utt = new SpeechSynthesisUtterance(text);
    utt.lang = "es-ES"; utt.rate = 0.92; utt.pitch = 0.9; utt.volume = 1.0;
    const voice = getVoice();
    if (voice) utt.voice = voice;
    utt.onstart = () => setIsSpeaking(true);
    utt.onend = () => setIsSpeaking(false);
    utt.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utt);
  }

  function typeText(text: string) {
    if (typeTimerRef.current) clearTimeout(typeTimerRef.current);
    setBubbleType("doc");
    setBubbleText("");
    let i = 0;
    function next() {
      if (i < text.length) {
        setBubbleText(prev => prev + text[i++]);
        typeTimerRef.current = setTimeout(next, 18);
      }
    }
    next();
  }

  /* ── Llamada al API ── */
  const callChat = useCallback(async (userMsg: string, currentStage: Stage, currentMessages: Message[], currentProblem: string, currentComuna: string, currentPhone: string) => {
    setIsLoading(true);
    setBubbleType("loading");
    setBubbleText("");

    const newMessages: Message[] = [...currentMessages, { role: "user", content: userMsg }];

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages,
          stage: currentStage,
          problem: currentProblem,
          comuna: currentComuna,
          phone: currentPhone
        })
      });

      const data = await res.json();
      const reply = data.text || "Lo siento, no pude procesar eso.";
      const nextStage = data.stage as Stage;

      const updatedMessages: Message[] = [...newMessages, { role: "assistant", content: reply }];
      setMessages(updatedMessages);
      setStage(nextStage);

      // Extraer datos según etapa
      if (currentStage === "problem") setProblem(userMsg);
      if (currentStage === "comuna") setComuna(userMsg);
      if (currentStage === "phone") setPhone(userMsg);
      if (nextStage === "done") setDone(true);

      typeText(reply);
      speak(reply);

    } catch {
      const err = "No pude conectarme. Intenta de nuevo.";
      typeText(err);
      speak(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /* ── Inicialización: saludo del avatar ── */
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    if (window.speechSynthesis) {
      window.speechSynthesis.getVoices();
      window.speechSynthesis.addEventListener("voiceschanged", () => window.speechSynthesis.getVoices());
    }

    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SR) {
      setMicAvailable(true);
      const rec = new SR();
      rec.lang = "es-CL"; rec.continuous = false; rec.interimResults = true;
      rec.onstart = () => { setIsListening(true); window.speechSynthesis?.cancel(); };
      rec.onresult = (e: any) => {
        const t = Array.from(e.results as any[]).map((r: any) => r[0].transcript).join("");
        setInput(t);
        if (inputRef.current) inputRef.current.value = t;
      };
      rec.onend = () => {
        setIsListening(false);
        const val = inputRef.current?.value.trim();
        if (val) { setInput(""); sendMessage(val); }
      };
      rec.onerror = () => setIsListening(false);
      recognitionRef.current = rec;
    }

    // Saludo inicial
    setTimeout(() => {
      callChat("inicio", "problem", [], "", "", "");
    }, 500);
  }, [callChat]);

  /* ── Enviar mensaje ── */
  function sendMessage(text?: string) {
    const msg = (text ?? input).trim();
    if (!msg || isLoading || done) return;
    setInput("");
    setBubbleType("user");
    setBubbleText(msg);

    if (window.speechSynthesis) {
      const u = new SpeechSynthesisUtterance(" ");
      u.volume = 0;
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(u);
    }

    // Actualizar datos locales antes de llamar
    let p = problem, c = comuna, ph = phone;
    if (stage === "problem") p = msg;
    if (stage === "comuna") c = msg;
    if (stage === "phone") ph = msg;

    callChat(msg, stage, messages, p, c, ph);
  }

  function toggleMic() {
    if (!recognitionRef.current) return;
    if (isListening) { recognitionRef.current.stop(); return; }
    if (window.speechSynthesis) {
      const u = new SpeechSynthesisUtterance(" ");
      u.volume = 0; window.speechSynthesis.speak(u);
    }
    try { recognitionRef.current.start(); } catch {}
  }

  const placeholder = isListening ? "Escuchando..." :
    stage === "phone" ? "+56 9 1234 5678" :
    stage === "comuna" ? "Ej: Providencia, Las Condes..." :
    "Describe tu problema...";

  return (
    <div className="w-full rounded-2xl bg-[#111827] border border-white/5 shadow-xl overflow-hidden">

      {/* Avatar + burbuja */}
      <div className="flex flex-col items-center gap-4 px-6 pt-8 pb-6">
        <div className="relative w-36 h-36 flex-shrink-0">
          <video src="/avatar-escuchando.mp4" autoPlay loop muted playsInline
            className={`absolute inset-0 w-full h-full object-cover rounded-full border-4 transition-all duration-300 ${
              isSpeaking ? "opacity-0 scale-95" : "opacity-100 scale-100 border-[#4282d8]/50 shadow-[0_0_30px_rgba(66,130,216,0.3)]"
            }`} />
          <video src="/avatar-hablando.mp4" autoPlay loop muted playsInline
            className={`absolute inset-0 w-full h-full object-cover rounded-full border-4 transition-all duration-300 ${
              isSpeaking ? "opacity-100 scale-100 border-[#4282d8] shadow-[0_0_40px_rgba(66,130,216,0.5)]" : "opacity-0 scale-95"
            }`} />
          {isListening && <div className="absolute inset-0 rounded-full border-4 border-red-400 animate-pulse" />}
        </div>

        {/* Burbuja */}
        <div className={`w-full rounded-2xl px-4 py-3 text-sm min-h-[52px] transition-all duration-300 ${
          bubbleType === "user"
            ? "bg-[#4282d8]/20 border border-[#4282d8]/30 text-slate-300 text-right"
            : "bg-[#0a0f1a] border border-white/10 text-slate-200"
        }`}>
          {bubbleType === "loading" ? (
            <span className="flex gap-1 items-center">
              <span className="w-2 h-2 bg-[#4282d8] rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
              <span className="w-2 h-2 bg-[#4282d8] rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
              <span className="w-2 h-2 bg-[#4282d8] rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
            </span>
          ) : <span>{bubbleText}</span>}
        </div>
      </div>

      {/* Input */}
      {!done && (
        <div className="px-6 pb-6 flex gap-2">
          <input
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && sendMessage()}
            placeholder={placeholder}
            disabled={isLoading}
            className="flex-1 rounded-xl bg-[#0a0f1a] border border-white/10 text-slate-100 placeholder-slate-600 px-4 py-3 text-sm outline-none focus:border-[#4282d8]/60 focus:ring-1 focus:ring-[#4282d8]/30 transition disabled:opacity-50"
          />
          {micAvailable && (
            <button onClick={toggleMic} disabled={isLoading}
              className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
                isListening ? "bg-red-500 animate-pulse" : "bg-[#0a0f1a] border border-white/10 text-slate-400 hover:text-white"
              }`}>🎤</button>
          )}
          <button onClick={() => sendMessage()} disabled={isLoading || !input.trim()}
            className="w-12 h-12 rounded-xl bg-[#4282d8] hover:bg-[#5291e8] disabled:bg-slate-700 disabled:text-slate-500 text-white flex items-center justify-center transition-all">
            {isLoading
              ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              : "→"}
          </button>
        </div>
      )}

      {done && (
        <div className="px-6 pb-6 text-center">
          <p className="text-[#4282d8] text-sm font-medium">✅ ¡Técnico en camino! Revisa tu WhatsApp.</p>
        </div>
      )}
    </div>
  );
}
