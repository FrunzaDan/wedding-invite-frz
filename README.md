# Wedding Invite

A single-page wedding invitation for Dan & Maria, built with Angular. It shows a countdown, the ceremony and reception details with maps, one-tap "add to calendar" buttons and quick ways to RSVP. It's one component with no backend, hosted on Firebase.

---

## 🚀 Key Features

- **Countdown:** Days and hours until the wedding, refreshed every minute.
- **Event details with maps:** Time, venue and address for the ceremony and the reception, each with an embedded Google Map and a link to open it in Maps.
- **Add to calendar:** Separate buttons for each event: Google Calendar (prefilled link), Samsung (an Android `intent://` link that opens the native "new event" screen) and Apple (a static `.ics` file, also used as the Samsung fallback).
- **RSVP:** Tap-to-call and WhatsApp links for both Dan and Maria.

---

## 🛠 Tech Stack

- **Frontend:** Angular 22.2 (standalone, zoneless), TypeScript, plain CSS. The whole UI is `src/app/app.ts` / `app.html` / `app.css`
- **Backend:** N/A
- **Database / Storage:** N/A
- **Tooling & Other:** Vitest + jsdom, Prettier, Firebase Hosting

---

## 📋 Prerequisites

Before running this project, ensure you have the following installed:

- Node.js `^22.22.3`, `^24.15.0` or `>=26` with npm
- Firebase CLI (`npm install -g firebase-tools`), only if you want to deploy

---

## ⚙️ Local Setup & Running

### 1. Clone the repository

```bash
git clone https://github.com/FrunzaDan/wedding-invite-frz.git
cd wedding-invite-frz
```

### 2. Configuration

There's no config file. Names, the wedding date, venues, map links and phone numbers are fields in `src/app/app.ts`. If you fork this for another wedding, that's the file to edit.

The `.ics` files in `public/calendar/` are written by hand. If you change an event's date or time in `app.ts`, update the matching `.ics` file too, or the Apple button will disagree with the Google one.

### 3. Installation & Run

```bash
npm install
npm start          # dev server on http://localhost:4200
npm test           # Vitest unit tests
npm run build      # production build → dist/wedding-invite/browser
```

---

## 🔌 API / App Usage

To deploy (Firebase project in `.firebaserc`):

```bash
npm run build
firebase deploy
```

`firebase.json` serves `/calendar/**` with `Content-Type: text/calendar; charset=utf-8`. Without that header, some phones download the `.ics` as a generic file instead of offering to add the event.

The Samsung button only works in Android browsers. If you change `buildSamsungCalendarUrl` in `app.ts`, keep it targeting the events collection (`content://com.android.calendar/events`) with `ACTION_INSERT`, otherwise Android calendar apps fail with "Unable to launch event".

---

## 📝 License & Notes

Personal project with no license file. All UI text is in Romanian.

The unit tests in `src/app/app.spec.ts` cover the countdown (including the exact wedding moment and dates after it), the calendar link builders for all three platforms, and the rendered template.
