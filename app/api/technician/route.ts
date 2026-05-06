import { NextRequest, NextResponse } from "next/server";
import { getSupabaseClient } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    const name = formData.get("name") as string;
    const phone = formData.get("phone") as string;
    const category = formData.get("category") as string;
    const comuna = formData.get("comuna") as string;
    const photo = formData.get("photo") as File | null;

    if (!name || !phone || !category || !comuna) {
      return NextResponse.json({ error: "Faltan campos obligatorios" }, { status: 400 });
    }

    const supabase = getSupabaseClient();
    let photo_url: string | null = null;

    if (photo && photo.size > 0) {
      const bytes = await photo.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const ext = photo.name.split(".").pop() ?? "jpg";
      const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("technician-photos")
        .upload(filename, buffer, { contentType: photo.type });

      if (!uploadError) {
        const { data } = supabase.storage.from("technician-photos").getPublicUrl(filename);
        photo_url = data.publicUrl;
      }
    }

    const { error } = await supabase.from("technicians").insert({
      name,
      phone,
      category,
      comuna,
      photo_url,
      active: true,
    });

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json({ error: "Este número de teléfono ya está registrado" }, { status: 409 });
      }
      throw new Error(error.message);
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Technician registration error:", err);
    return NextResponse.json({ error: "Error al registrar técnico" }, { status: 500 });
  }
}
