// send-mail — drains email_outbox through Microsoft Graph, sending as the WorkOS
// mailbox (workos@crea.asia) with an Entra app registration's client credentials.
//
// Called by pg_net (a trigger on email_outbox and a 5-minute cron) with the shared
// header x-workos-key. Every call drains whatever is pending, so the body is ignored.
//
// Secrets (Project Settings → Edge Functions → Secrets):
//   WORKOS_MAIL_KEY   same value as vault secret workos_mail_key
//   MS_TENANT_ID      Entra tenant (GUID or crea.asia)
//   MS_CLIENT_ID      app registration (client) id
//   MS_CLIENT_SECRET  client secret value
//   MAIL_FROM         mailbox to send as, default workos@crea.asia
// SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are provided by the platform.
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const BATCH = 25;
const MAX_ATTEMPTS = 5;

type OutboxRow = {
  id: number; to_email: string; subject: string; html: string; text_body: string | null;
  attempts: number;
};

function json(status: number, body: unknown) {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
}

async function graphToken(): Promise<string> {
  const tenant = Deno.env.get("MS_TENANT_ID"), id = Deno.env.get("MS_CLIENT_ID"), secret = Deno.env.get("MS_CLIENT_SECRET");
  if (!tenant || !id || !secret) throw new Error("Microsoft credentials not configured (MS_TENANT_ID / MS_CLIENT_ID / MS_CLIENT_SECRET)");
  const res = await fetch(`https://login.microsoftonline.com/${tenant}/oauth2/v2.0/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: id, client_secret: secret, grant_type: "client_credentials",
      scope: "https://graph.microsoft.com/.default",
    }),
  });
  const data = await res.json();
  if (!res.ok || !data.access_token) throw new Error(`token: ${data.error_description || data.error || res.status}`);
  return data.access_token as string;
}

async function sendOne(token: string, from: string, row: OutboxRow) {
  const res = await fetch(`https://graph.microsoft.com/v1.0/users/${encodeURIComponent(from)}/sendMail`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      message: {
        subject: row.subject,
        body: { contentType: "HTML", content: row.html },
        toRecipients: [{ emailAddress: { address: row.to_email } }],
      },
      saveToSentItems: false,
    }),
  });
  if (res.status !== 202) {
    let detail = "";
    try { detail = JSON.stringify((await res.json()).error ?? {}); } catch { /* no body */ }
    throw new Error(`graph ${res.status} ${detail}`.trim());
  }
}

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") return json(405, { error: "POST only" });
  const expected = Deno.env.get("WORKOS_MAIL_KEY");
  if (!expected) return json(503, { error: "WORKOS_MAIL_KEY not configured" });
  if (req.headers.get("x-workos-key") !== expected) return json(401, { error: "bad key" });

  const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

  // claim a batch: pending, or failed with attempts left
  const { data: rows, error } = await db.from("email_outbox")
    .select("id,to_email,subject,html,text_body,attempts")
    .in("status", ["pending", "failed"]).lt("attempts", MAX_ATTEMPTS)
    .order("created_at").limit(BATCH);
  if (error) return json(500, { error: error.message });
  if (!rows?.length) return json(200, { sent: 0, failed: 0, note: "nothing pending" });

  const ids = rows.map((r) => r.id);
  await db.from("email_outbox").update({ status: "sending" }).in("id", ids);

  let token: string;
  try { token = await graphToken(); }
  catch (e) {
    // credentials missing or rejected: put the rows back, count the attempt, say why
    const msg = (e as Error).message;
    for (const r of rows) {
      await db.from("email_outbox").update({ status: "failed", attempts: r.attempts + 1, error: msg }).eq("id", r.id);
    }
    return json(502, { error: msg, failed: rows.length });
  }

  const from = Deno.env.get("MAIL_FROM") || "workos@crea.asia";
  let sent = 0, failed = 0;
  for (const r of rows as OutboxRow[]) {
    try {
      await sendOne(token, from, r);
      await db.from("email_outbox").update({ status: "sent", sent_at: new Date().toISOString(), error: null, attempts: r.attempts + 1 }).eq("id", r.id);
      sent++;
    } catch (e) {
      await db.from("email_outbox").update({ status: "failed", attempts: r.attempts + 1, error: (e as Error).message.slice(0, 500) }).eq("id", r.id);
      failed++;
    }
  }
  return json(200, { sent, failed });
});
