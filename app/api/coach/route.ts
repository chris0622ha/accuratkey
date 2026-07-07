import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  // Edge runtime doesn't reliably get NEXT_PUBLIC_ vars, check both
  const key = process.env.GEMINI_KEY || process.env.NEXT_PUBLIC_GEMINI_KEY;
  if (!key) return NextResponse.json({ error: "No key configured" }, { status: 500 });

  const body = await req.json();

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${key}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }
  );

  const data = await res.json();
  return NextResponse.json(data);
}
// 1783449553
