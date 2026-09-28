# Rental Board

Mobile kanban for the listings found by [rental-hunter](https://github.com/PatrickBossert/rental-hunter). That repo is private.

**This repo contains no data.** It's a single `index.html` served by GitHub Pages. On each device it asks for a fine-grained GitHub token, then reads `data/listings.json` and reads and writes `data/board.json` in the private repo. Every card move, call log, viewing and note becomes a commit there.

The columns are New → Contacted → Viewing booked → Viewed → Shortlist / Rejected.

- Tap **Call**, **Text**, **WhatsApp** or **Email** and the contact is logged automatically. After 48 hours with no viewing booked, the card is flagged **Chase**.
- **Book a viewing** by tapping an open-inspection time or picking your own. Then **Add to calendar** (an .ics file for iPhone, Mac or Outlook) or use the Google Calendar link.
- **Notes** record who wrote them and when. If both of you edit at once, both edits are kept. Undo only reverses your own change.

On iPhone, add it to your home screen: Safari → Share → **Add to Home Screen**.
