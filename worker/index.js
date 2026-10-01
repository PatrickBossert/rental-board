// rentalhunter.app: serves the board (index.html, as a static asset) and the
// calendar files behind its "Add to calendar" button. Holds no data: the board
// reads and writes your private GitHub repo directly from the browser.
import { calendarResponse } from "./calendar.js";

const HOME = "rentalhunter.app";

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.hostname === `www.${HOME}`) {           // one address: www -> apex
      url.hostname = HOME;
      return Response.redirect(url.toString(), 301);
    }
    if (url.pathname.endsWith(".ics")) return calendarResponse(request);
    const res = await env.ASSETS.fetch(request);
    // the page holds the GitHub token in this browser: keep it out of frames and referrers
    const headers = new Headers(res.headers);
    headers.set("X-Frame-Options", "DENY");
    headers.set("Referrer-Policy", "no-referrer");
    headers.set("X-Content-Type-Options", "nosniff");
    return new Response(res.body, { status: res.status, headers });
  },
};
