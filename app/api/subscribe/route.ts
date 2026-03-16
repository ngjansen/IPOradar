import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({})) as { email?: unknown };
  const { email } = body;

  if (
    typeof email !== "string" ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  ) {
    return NextResponse.json({ error: "Invalid email." }, { status: 400 });
  }

  // TODO: Replace with Resend/Mailchimp API call for production
  // Vercel serverless = read-only filesystem; file writes won't persist
  // Swap this console.log for: fetch("https://api.resend.com/contacts", ...)
  console.log("[subscribe]", email, new Date().toISOString());

  return NextResponse.json({ ok: true });
}
