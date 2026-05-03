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
        body: JSON.stringify({ message, phone })
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload?.error ?? "Unexpected error");
      }

      setState("success");
      setFeedback("We are contacting technicians now. You will get a WhatsApp soon.");
      setMessage("");
      setPhone("");
    } catch (error) {
      setState("error");
      setFeedback(error instanceof Error ? error.message : "Failed to submit request");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-xl bg-slate-900 p-6 shadow-lg">
      <div>
        <label htmlFor="message" className="mb-2 block text-sm text-slate-200">
          Describe your problem
        </label>
        <textarea
          id="message"
          required
          minLength={10}
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          className="min-h-32 w-full rounded-md border border-slate-700 bg-slate-950 p-3 text-slate-100 outline-none ring-cyan-500 transition focus:ring-2"
          placeholder="Example: water leak under kitchen sink"
        />
      </div>

      <div>
        <label htmlFor="phone" className="mb-2 block text-sm text-slate-200">
          Phone number (with country code)
        </label>
        <input
          id="phone"
          required
          value={phone}
          onChange={(event) => setPhone(event.target.value)}
          className="w-full rounded-md border border-slate-700 bg-slate-950 p-3 text-slate-100 outline-none ring-cyan-500 transition focus:ring-2"
          placeholder="+51999999999"
        />
      </div>

      <button
        type="submit"
        disabled={state === "loading"}
        className="w-full rounded-md bg-cyan-500 px-4 py-3 font-medium text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:bg-slate-600 disabled:text-slate-300"
      >
        {state === "loading" ? "Searching..." : "Find solution"}
      </button>

      {feedback ? (
        <p className={state === "error" ? "text-sm text-rose-400" : "text-sm text-emerald-400"}>
          {feedback}
        </p>
      ) : null}
    </form>
  );
}
