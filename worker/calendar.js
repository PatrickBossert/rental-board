// Calendar files for the board's "Add to calendar" button (served at /viewing.ics).
//
// iPhone only opens a pre-filled Calendar event from a real web address that
// serves a text/calendar file; it blocks calendar files a web page builds itself.
// This turns the board's "Add to calendar" link into that file. It stores nothing:
// everything it needs is in the link.
//
//   GET /viewing.ics?title=…&start=20261003T003000Z&end=20261003T010000Z
//                   &location=…&details=…&url=https://…&uid=…
//

const MAX = 400;  // per field: plenty for an address or a few lines of agent details

const clean = (v) => (v || "").slice(0, MAX);
// iCalendar text escaping (RFC 5545 §3.3.11), plus no raw line breaks
const icsText = (v) => clean(v).replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");
// fold long lines at 74 chars (RFC 5545 §3.1)
const fold = (line) => line.match(/.{1,74}/g).join("\r\n ");
const isStamp = (v) => /^\d{8}T\d{6}Z$/.test(v || "");

export async function calendarResponse(request) {
  const url = new URL(request.url);
  if (request.method !== "GET") return new Response("Method not allowed", { status: 405 });
  if (!url.pathname.endsWith(".ics")) {
    return new Response("Rental Board calendar service. Use /viewing.ics?title=…&start=…", { status: 404 });
  }
  const q = url.searchParams;
  const start = q.get("start"), end = q.get("end");
  if (!isStamp(start) || (end && !isStamp(end))) {
    return new Response("start/end must look like 20261003T003000Z", { status: 400 });
  }
  const link = /^https:\/\//.test(q.get("url") || "") ? clean(q.get("url")) : "";
  const uid = (q.get("uid") || "").replace(/[^\w.@-]/g, "").slice(0, 120) || `${start}@rental-board`;
  const stamp = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");

  const lines = [
    "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Rental Board//EN", "CALSCALE:GREGORIAN", "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${uid}`, `DTSTAMP:${stamp}`, `DTSTART:${start}`, `DTEND:${end || start}`,
    `SUMMARY:${icsText(q.get("title") || "Rental viewing")}`,
    q.get("location") ? `LOCATION:${icsText(q.get("location"))}` : null,
    q.get("details") ? `DESCRIPTION:${icsText(q.get("details"))}` : null,
    link ? `URL:${link}` : null,
    "BEGIN:VALARM", "ACTION:DISPLAY", "DESCRIPTION:Rental viewing", "TRIGGER:-PT1H", "END:VALARM",
    "END:VEVENT", "END:VCALENDAR",
  ].filter(Boolean).map(fold);

  return new Response(lines.join("\r\n") + "\r\n", {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      // inline: iPhone shows the event with "Add to Calendar" instead of downloading a file
      "Content-Disposition": 'inline; filename="viewing.ics"',
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
