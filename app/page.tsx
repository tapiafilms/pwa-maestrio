import { LeadForm } from "@/components/LeadForm";

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col justify-center px-6 py-16">
      <div className="mb-8 space-y-3 text-center">
        <h1 className="text-3xl font-bold text-cyan-300">Chasquilla</h1>
        <p className="text-slate-300">
          Describe your issue and we will connect you with an available technician via WhatsApp.
        </p>
      </div>
      <LeadForm />
    </main>
  );
}
