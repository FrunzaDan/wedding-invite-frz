# Wedding Invite

A single-page wedding invitation for Dan & Maria, built with Angular. It's a small app on purpose — one component, no backend — but it packs in the stuff you'd actually want for a wedding site: a live countdown, venue details with embedded maps, one-tap "add to calendar" for the ceremony and reception, and quick ways to RSVP by phone or WhatsApp.

## What it does

- **Countdown** to the wedding date, refreshed every minute (days + hours remaining).
- **Ceremony & reception details** — time, venue, address — each with an embedded Google Maps view and a link to open the full map.
- **Add to calendar**, one button per platform, for both events:
  - **Google** — opens `calendar.google.com` with the event prefilled.
  - **Samsung** — fires an Android intent URL straight into the Calendar Provider's "insert event" flow, so it opens the native "new event" screen instead of downloading a file.
  - **Apple** — links to a static `.ics` file (also the fallback for the Samsung button if the intent can't be resolved).
- **RSVP** — tap-to-call and WhatsApp links for both Dan and Maria.

Everything is in Romanian, hardcoded for this specific wedding — dates, names, venues, and phone numbers live as component fields in `src/app/app.ts`, not in a CMS or config file. If you're forking this for your own wedding, that's the file to edit.

## Stack

- **Angular 22** (standalone components, no NgModules) — the whole UI is one component: `app.ts` / `app.html` / `app.css`.
- **Vitest** for unit tests, via Angular's native `@angular/build:unit-test` builder (not Karma/Jasmine).
- **Firebase Hosting** for deployment — see `firebase.json`.
- Plain CSS, no UI framework or component library.

## A couple of things worth knowing before you touch this

- **The `.ics` files in `public/calendar/` are static and hand-written**, not generated at build time. If you change an event's date/time in `app.ts`, you also need to update the matching `.ics` file, or the Apple/Samsung-fallback buttons will silently disagree with the Google Calendar button.
- Firebase Hosting is configured to serve `/calendar/**` with `Content-Type: text/calendar; charset=utf-8` (see `firebase.json`) — without that header, some devices treat the download as a generic file and won't offer to open it as a calendar event.
- The Samsung Calendar button uses an `intent://` URL rather than a plain link. Chrome/Samsung Internet on Android parse that scheme specially to launch a native app intent; it does nothing useful on desktop or iOS, which is why it's Android-only by design. If you ever touch `buildSamsungCalendarUrl` in `app.ts`, be careful with the MIME type / data URI — it needs to target the calendar _events collection_ (`content://com.android.calendar/events`) for `ACTION_INSERT`, not a single-event view type, or every Android calendar app will fail to open it with an "Unable to launch event" error.

## Getting started

```bash
npm install
npm start        # ng serve — http://localhost:4200
```

The dev server live-reloads on changes to anything in `src/`.

## Testing

```bash
npm test          # ng test — runs the Vitest suite once
```

The suite (`src/app/app.spec.ts`) covers the countdown logic (including edge cases at the exact wedding moment and long after), the calendar link builders for all three platforms, and the rendered template (maps, phone numbers, RSVP text, etc.).

## Building & deploying

```bash
npm run build      # outputs to dist/wedding-invite/browser
firebase deploy    # ships that build to Firebase Hosting
```

`ng build` alone won't deploy anything — you need the Firebase CLI configured against the project in `.firebaserc` and to run `firebase deploy` yourself (or however your deploy process is wired up).
