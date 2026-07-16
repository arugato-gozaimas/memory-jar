# Memory Jar

### Product Requirements Document (v1.2)

---

# Product Vision

Memory Jar is a digital keepsake inspired by the experience of pulling handwritten notes from a glass jar.

Rather than presenting farewell messages as a slideshow or document, the application invites the recipient to slowly discover one memory at a time through a tactile, object-centered interaction.

The interface intentionally disappears. The jar is the product.

---

# Experience Principles

Every design decision should reinforce one feeling:

> **"I'm opening something someone left for me."**

The experience should feel:

- Personal
- Quiet
- Tactile
- Intentional
- Warm
- Unhurried
- Discoverable

The application should never feel like a website, dashboard, or presentation.

---

# Core Interaction

The application consists of a single interaction.

> Click the Memory Jar.

Everything else is a consequence of that action.

There are no menus.

No navigation.

No buttons.

No onboarding.

No tutorials.

The object teaches the interaction.

---

# Landing Experience

The application opens directly into the experience.

### Environment

- Full-screen black background
- No interface chrome
- Single realistic glass jar centered on screen
- Jar remains open
- Folded notes visible inside the jar
- Ambient lighting creates depth while maintaining focus

No instructional text should be required beyond a subtle invitation such as:

> *Click the jar to pull out a memory.*

---

# Visual Language

The visual style combines realism with restraint.

### Mood & Palette

- Background: near-black, not pure black — a very dark warm charcoal reads less clinical than `#000000`.
- Glass: warm amber-tinted glass, not clear/neutral glass — evokes candlelight rather than a lab jar.
- Light source: a single soft, warm glow (like candlelight or late-afternoon sun), not cool/blue lighting. This is the one accent "color" in the whole app — everything else stays neutral.
- Paper: warm off-white / cream, never stark white, to avoid looking like a UI card.

### Realistic elements

- Glass jar
- Folded paper notes
- Paper texture
- Soft shadows
- Natural reflections

### Minimal interface

Everything outside the jar should disappear.

Avoid:

- Buttons
- Decorative graphics
- Panels
- Borders
- Dashboard layouts
- Excessive typography

The jar should feel like the only object that exists.

---

# Idle State

The interface should never feel static.

Subtle ambient animation may include:

- Slight paper movement
- Gentle lighting changes across the glass
- Soft floating shadow

Animations should be nearly imperceptible.

---

# Opening Interaction

When the user clicks the jar:

1. One folded note is selected.
2. The note rises naturally from the pile.
3. It floats upward.
4. It rotates slightly.
5. The fold opens.
6. The message becomes readable.

The animation should communicate physical behavior rather than software transitions.

Approximate duration:

**1–2 seconds**

---

# Memory Card

The unfolded note becomes the reading surface.

## Text-only memory

Displays:

- Message
- Optional signature

The layout emphasizes whitespace and readability.

## Memory with image

If an image exists:

- Image appears first
- Message below
- Signature at bottom
- Card height expands naturally to accommodate content

The image should feel attached to the note, like a printed photograph placed on paper.

## Long message handling

Messages can be up to 1,000 characters. The card should **grow taller to fit the content** rather than scrolling internally or shrinking the font — scrolling inside a "note" breaks the physical-object illusion, and shrinking text past a certain point hurts readability.

- Set a comfortable max-width for the card (readable line length, not full-screen-wide) so tall cards still feel like a note, not a document.
- If a card would be taller than the viewport on small screens, allow the *page* to scroll (not an inner scroll container), keeping the "outside the card" tap-to-close area reachable at the top/bottom.

---

# Typography

Typography should balance warmth with readability.

### Message

Readable serif or clean body font.

### Signature

Handwritten font.

Example:

```
Thank you for making every Monday easier.

— Sarah
```

Avoid rendering long paragraphs entirely in handwriting.

---

# Closing Interaction

### Desktop / larger screens

Clicking anywhere outside the unfolded note closes it.

### Mobile / touch

On small screens there is little or no "outside the card" space to tap. To keep the interaction reliable on touch devices:

- Provide a small, unobtrusive close affordance (e.g. a subtle fade-in touch target near the top of the card, or the card itself remaining tappable-to-close after a short delay so an accidental tap while reading doesn't immediately close it).
- This affordance should stay visually minimal and only appear on touch devices — it shouldn't read as a "UI button" on desktop.

### Sequence (both platforms)

1. Note folds itself.
2. Floats downward.
3. Slides gently back into the jar.
4. Disappears into the pile.

The closing animation should feel as intentional as the opening.

---

# Device Targets

The experience must work well on:

- Desktop/laptop browsers (primary design target — mouse hover/click)
- Mobile phones (touch), since the recipient may open the shared link on their phone

Touch targets (the jar, the close affordance) should be comfortably tappable (44px+ effective hit area). Animations should stay smooth on mid-range phones — prefer `transform`/`opacity` animations over layout-triggering properties.

---

# Memory Order

The application should randomize the deck once per session.

Each note should only appear once until every note has been viewed.

No immediate repetition.

Session state is **in-memory only** (plain app state, no localStorage/sessionStorage) — refreshing the page starts a fresh, freshly-shuffled session.

## Empty State

When all memories have been opened, the jar appears empty and displays:

> **You've opened every memory. ❤️**

Below this, the **jar itself remains the single interactive object**: clicking the empty jar again reshuffles the deck and refills it, restarting the experience. No separate "restart" button or link — consistent with "no menus, no buttons" elsewhere in this spec.

---

# Content Collection

All memories are collected externally through a Google Form.

## Fields

### Leave a memory *(Required)*

Paragraph

Maximum length:

**1,000 characters**

Prompt:

> Share a memory, thank you, inside joke, or message you'd like them to carry with them.

### Add a photo *(Optional)*

Single image upload.

Accepted formats:

- JPG
- PNG
- HEIC (converted before import if necessary)

### Sign your name *(Optional)*

Short answer.

Leaving the field blank presents the message anonymously.

---

# Data Model

```ts
interface Memory {
  id: string
  message: string
  author?: string
  image?: string
}
```

---

# Technical Constraints

The project intentionally minimizes technical complexity.

## Stack

- React
- Vite
- TypeScript
- Tailwind CSS
- Framer Motion

## Data Source

Live-synced from Google Form responses — no manual export step.

- The linked Google Sheet is read directly by a small Google Apps Script, deployed as a free Web App endpoint.
- The Apps Script also handles making each uploaded photo viewable (Drive files uploaded via Forms are private by default) and returns a ready-to-use image URL.
- The React app fetches this endpoint on page load and builds the deck from whatever is currently in the Sheet — new Form submissions appear the next time the page loads, with no rebuild or redeploy needed.

No database. No custom backend server. No authentication for the recipient. The only "backend" is Google's own free Apps Script infrastructure sitting in front of the Sheet.

Requires an internet connection each time the page loads (it's fetching live data) — the app is no longer offline-capable, which is the trade-off for real-time sync.

---

# Definition of Done

The experience is complete when:

- The application opens directly into the Memory Jar.
- The jar is the primary and only interface element.
- Clicking the jar reveals one randomly ordered, previously unseen memory.
- Messages support optional images and optional signatures, including long (near 1,000-character) messages, without breaking the card layout.
- Clicking outside the note (desktop) or using the touch close affordance (mobile) returns it naturally to the jar.
- Every memory can be explored without repetition until the deck is exhausted, within a single session.
- Reaching the empty state and clicking the jar again restarts the experience with a fresh shuffle.
- The application works smoothly on both desktop and mobile.
- New Form submissions appear automatically the next time the page is loaded — no manual export or redeploy needed.
- A brief, on-brand loading moment (jar visible but notes not yet interactive, or similar) covers the live data fetch — never a blank screen or a generic spinner.
- The interaction feels less like using software and more like handling a physical keepsake.

---

## Design North Star

> **The recipient should forget they're using an application.**
>
> They should feel like they're sitting at a desk, slowly pulling handwritten notes from a jar that friends filled over time.

