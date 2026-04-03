import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

export async function GET() {
  const checks: Record<string, string> = { app: "ok" };
  let healthy = true;

  // Check Supabase
  try {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_KEY;
    if (url && key) {
      const supabase = createClient(url, key);
      const { error } = await supabase.from("factory_clients").select("id").limit(1);
      if (error?.message?.includes("schema cache") || error?.message?.includes("does not exist")) {
        checks.supabase = "connected (table pending)";
      } else if (error) {
        checks.supabase = `error: ${error.message}`;
        healthy = false;
      } else {
        checks.supabase = "ok";
      }
    } else {
      checks.supabase = "missing env vars";
      healthy = false;
    }
  } catch (e) {
    checks.supabase = `error: ${(e as Error).message}`;
    healthy = false;
  }

  // Check Claude API key
  checks.claude_key = process.env.ANTHROPIC_API_KEY ? "configured" : "missing";
  if (!process.env.ANTHROPIC_API_KEY) healthy = false;

  // Check Cerebro password
  checks.cerebro_password = process.env.CEREBRO_PASSWORD ? "configured" : "missing";

  return NextResponse.json(
    { status: healthy ? "healthy" : "degraded", checks, timestamp: new Date().toISOString() },
    { status: healthy ? 200 : 503 }
  );
}
