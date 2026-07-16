# Memory Jar — Build Plan & Cursor Prompts

Decisions locked in:

- **Data pipeline**: live sync via a Google Apps Script Web App reading the linked Sheet directly — no manual export, no manual image handling. New Form submissions show up next page load.
- **Session behavior**: no persistence. Plain React state. Refresh = fresh jar.
- **Hosting**: Vercel free tier, deployed from a GitHub repo.

Keep this file (`PRD.md` too) in the project root. Every Cursor prompt below tells Cursor to reference them instead of re-pasting spec details — this is what keeps token usage down across multiple prompts.

---

## Step 0 — One-time setup (you do this, not Cursor)

```bash
npm create vite@latest memory-jar -- --template react-ts
cd memory-jar
npm install
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
npm install framer-motion
git init && git add . && git commit -m "scaffold"
```

Then:

1. Save the PRD you have as `PRD.md` in the project root.
2. Save this file as `BUILD_PLAN.md` in the project root.
3. Open the folder in Cursor.

---

## Step 1 — Build the Google Form (manual, one time)

1. Go to forms.google.com → blank form.
2. **Field 1 — "Leave a memory"**: Add question → type **Paragraph** → mark **Required**. Optionally add response validation → Length → Maximum character count → `1000`. Question text: *"Share a memory, thank you, inside joke, or message you'd like them to carry with them."*
3. **Field 2 — "Add a photo"**: Add question → type **File upload** → confirm (this requires respondents to be signed into a Google account — worth a heads-up when you share the link). Set **max files: 1**, **max file size: 10 MB**. Not required.
4. **Field 3 — "Sign your name"**: Add question → type **Short answer**. Not required.
5. **Responses tab** → click the green Sheets icon → **Create a new spreadsheet**. This is the Sheet the Apps Script below will read from.
6. Copy the form's **Send** link to share with your ~100–200 coworkers whenever you're ready.

---

## Step 2 — Apps Script live-sync endpoint (ready to use, paste as-is)

This replaces manual export entirely. It reads the Sheet directly and serves JSON your app fetches on load — no rebuild needed for new responses.

1. Open the linked Google **Sheet** (not the Form) → **Extensions → Apps Script**.
2. Delete the default code and paste the contents of `apps-script/Code.gs` from this repo.

**Important:** Form file-upload cells look like Drive links in the Sheet UI, but `getValues()` often only returns the **filename**. The script reads the real hyperlink via `getRichTextValue().getLinkUrl()`.

3. Click **Deploy → New deployment → Web app** (or **Manage deployments → ✎ → New version** if updating).
  - **Execute as**: Me
  - **Who has access**: Anyone
4. Click **Deploy**, then **Authorize access** (it needs Drive permission to make photos viewable — that's expected and safe, it only touches files from this form's folder).
5. Copy the **Web app URL** it gives you (looks like `https://script.google.com/macros/s/XXXXXXXX/exec`). This is your live data endpoint.
6. Test it: paste the URL into a browser tab. You should see JSON with an `"image"` field on rows that have photos.
7. If images are still missing, open `YOUR_URL?debug=1` — it shows detected column indexes and the raw photo cell value the script actually read.

Keep this URL — you'll give it to Cursor in Prompt A below as an environment variable.

---

## Step 3 — Cursor prompts (paste one at a time, let each finish before the next)

### Prompt A — Scaffold & theme + live data fetch

```
Reference PRD.md and BUILD_PLAN.md in the project root for full context — don't ask me to repeat the spec.

Set up the base of this Vite + React + TypeScript + Tailwind + Framer Motion app called Memory Jar:

1. Configure Tailwind for a full-screen, no-scroll, black-background app (index.css / App.tsx).
2. Add Google Fonts (or a comparable free serif) for message text, and a handwritten-style font (e.g. Caveat or Homemade Apple from Google Fonts) for signatures. Load via CSS @import, not npm packages.
3. Set up src/types.ts with the Memory interface from PRD.md.
4. Add a .env file with VITE_MEMORIES_ENDPOINT set to my Apps Script Web App URL (I'll paste the real URL in). Create a useMemories() hook that fetches this endpoint on mount, returns { memories, isLoading, error }, and handles the endpoint being briefly unavailable (show an on-brand loading state per PRD.md, never a blank screen or generic spinner).
5. Create the App shell: full-viewport black container, centered content area, no header/nav/chrome of any kind.

Don't build the jar visuals or interactions yet — just the shell, fonts, data fetching hook, and Tailwind config working correctly.
```

### Prompt B — Jar visual + idle state

```
Reference PRD.md for the full "Landing Experience," "Visual Language," and "Idle State" sections.

Build the JarScene component:
- A centered, realistic-looking glass jar (SVG or layered divs with gradients/shadows — your choice, favor SVG for crisp scaling) with visible folded paper notes inside.
- Subtle ambient animation using Framer Motion: gentle floating shadow, slight paper shift, soft light change across the glass — nearly imperceptible, looping, no jank.
- A small, subtle text hint below the jar: "Click the jar to pull out a memory."
- Make the jar clickable with an obvious hover affordance (cursor + slight scale/glow) without adding any visible UI chrome.

No opening interaction yet — just the idle jar, ready to be clicked.
```

### Prompt C — Opening interaction + Memory Card

```
Reference PRD.md's "Opening Interaction," "Memory Card," and "Typography" sections closely — the animation sequence and card layout are specified in detail there.

Implement:
1. On jar click: pick one unseen memory at random from the memories returned by useMemories(), animate a folded note rising from the pile, floating up, rotating slightly, then unfolding into a readable card (~1-2s total, Framer Motion).
2. MemoryCard component: image (if present) above the message, message in the serif/body font, signature in the handwritten font at the bottom, generous whitespace, card height adapts to content.
3. Clicking anywhere outside the open card triggers the closing sequence: card folds, floats down, slides back into the jar pile, disappears.

Keep all animation timing and easing tuned for a physical, tactile feel — not a generic modal transition.
```

### Prompt D — Deck logic & empty state

```
Reference PRD.md's "Memory Order" section.

Implement the deck logic in plain React state (no localStorage/sessionStorage — state should reset on every page reload):
- Once useMemories() finishes loading, shuffle the full memories array.
- Track which memories have been shown this session; never repeat until all have been seen.
- When the last unseen memory is closed, show an empty jar with the text "You've opened every memory. ❤️" and a subtle way to start over (reshuffles and resets the seen list).
```

### Prompt E — Polish pass

```
Reference PRD.md's "Design North Star" and "Definition of Done."

Do a polish pass across the whole app:
- Verify it works well on mobile (touch targets, jar sized/centered correctly on small viewports, text legible without zooming).
- Double check animation performance (no layout thrashing, use transform/opacity where possible).
- Remove any leftover default Vite/Tailwind boilerplate, favicons, or dev artifacts.
- Confirm there is truly zero interface chrome — no headers, footers, borders, or dashboard-like elements anywhere.
```

---

## Step 4 — Deploy to Vercel (free)

1. Push the repo to GitHub (public or private, either is fine on the free tier).
2. Go to vercel.com → **Add New Project** → import the GitHub repo. Vercel auto-detects Vite; default build settings work as-is.
3. Add the environment variable: `VITE_MEMORIES_ENDPOINT` = your Apps Script Web App URL (Project Settings → Environment Variables).
4. Deploy. You'll get a link like `memory-jar-yourname.vercel.app` — that's what you share with your coworker.
5. New Form submissions now show up automatically — nothing to re-run or redeploy. If you ever edit the Apps Script itself, you do need to **Deploy → Manage deployments → Edit → New version** for changes to take effect (the URL stays the same).

**If fetch() from the browser fails with a CORS-looking error:** Apps Script Web Apps normally work fine for `fetch()` since the response comes back via a redirect that allows cross-origin reads. If you do hit an issue, redeploying the Web App as a new version (not just saving) usually resolves it — Apps Script sometimes needs a fresh deployment to pick up code changes.

No custom domain, no payment method, no server of your own anywhere in this flow — the only moving piece beyond your static site is Google's free Apps Script infrastructure.