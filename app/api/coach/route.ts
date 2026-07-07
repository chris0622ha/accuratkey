import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const key = process.env.GEMINI_KEY || process.env.NEXT_PUBLIC_GEMINI_KEY;
  if (!key) {
    console.error("[coach] No key configured");
    return NextResponse.json({ error: "No key configured" }, { status: 500 });
  }

  const body = await req.json();

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${key}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }
    );
    const data = await res.json();
    if (data?.error) {
      console.error("[coach] Gemini error:", data.error.code, data.error.message);
    } else {
      console.log("[coach] Success:", data?.candidates?.[0]?.finishReason);
    }
    return NextResponse.json(data);
  } catch (e: any) {
    console.error("[coach] Fetch failed:", e.message);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
