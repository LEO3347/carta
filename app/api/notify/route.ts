type NotificationPayload = {
  event?: string; response?: string | null; date?: string; time?: string;
  sessionId?: string; userAgent?: string; language?: string; screen?: string;
};

const subjects: Record<string, string> = {
  open: "💌 Abrió tu sorpresa",
  letter: "💌 Está leyendo tu carta",
  yes: "💚💚💚 ¡DIJO QUE SÍ! 💚💚💚",
  no: "💌 Ya respondió tu pregunta",
};

const clean = (value: unknown, max = 500) => typeof value === "string" ? value.slice(0, max) : "—";

export async function POST(request: Request) {
  let data: NotificationPayload;
  try { data = await request.json() as NotificationPayload; }
  catch { return Response.json({ ok: false, error: "Invalid JSON" }, { status: 400 }); }
  const event = clean(data.event, 20);
  if (!Object.hasOwn(subjects, event)) return Response.json({ ok: false, error: "Invalid event" }, { status: 400 });

  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.NOTIFICATION_EMAIL;
  const from = process.env.FROM_EMAIL;
  if (!apiKey || !to || !from) {
    console.info("Notification skipped: email variables are not configured.", { event });
    return Response.json({ ok: true, configured: false });
  }

  const rows = [
    ["Evento", event], ["Respuesta", clean(data.response, 10)], ["Fecha", clean(data.date, 40)],
    ["Hora", clean(data.time, 40)], ["Session ID", clean(data.sessionId, 100)],
    ["Dispositivo / navegador", clean(data.userAgent)], ["Idioma", clean(data.language, 50)],
    ["Pantalla aproximada", clean(data.screen, 50)],
  ];
  const html = `<div style="font-family:Arial,sans-serif;color:#12372a"><h2>${subjects[event]}</h2>${rows.map(([k,v]) => `<p><strong>${k}:</strong> ${v.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!))}</p>`).join("")}</div>`;
  const result = await fetch("https://api.resend.com/emails", {
    method: "POST", headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from, to: [to], subject: subjects[event], html }),
  });
  if (!result.ok) return Response.json({ ok: false, error: "Email provider rejected the request" }, { status: 502 });
  return Response.json({ ok: true, configured: true });
}
