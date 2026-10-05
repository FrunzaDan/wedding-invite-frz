# Wedding Invite

Wedding Invite is a single-page digital invitation for Dan & Maria's wedding. Guests see a countdown to the day, the ceremony and reception details with embedded maps, and ways to RSVP. Each event has one-tap buttons to add it to Google, Samsung or Apple Calendar, so guests don't have to type anything in. The whole app is one Angular component with no backend, and all the details are hardcoded in `app.ts`. It's written in Romanian and hosted on Firebase Hosting.

---

## Key Features

- **Countdown:** Shows the days, hours and minutes left until the wedding (11 September 2027, Romanian time). It is recalculated every second so the minute rolls over on time, runs only in the browser, and stops at zero once the day has arrived instead of counting into negative numbers.
- **Event details with maps:** The ceremony and the reception each have a time, venue and address. Each one also has an embedded Google Map and a link that opens the location in the Maps app.
- **Add to calendar:** Each event has three buttons. Google opens a prefilled Google Calendar event, Samsung uses an Android `intent://` link to open the phone's native "new event" screen, and Apple downloads a static `.ics` file, which is also the fallback for the Samsung button.
- **RSVP:** Tap-to-call and WhatsApp buttons for both Dan and Maria, so guests can answer with one tap from their phone.

---

## Tech Stack

- **Frontend:** Angular 22.2 (standalone, zoneless), TypeScript, plain CSS. The whole UI is `src/app/app.ts` / `app.html` / `app.css`
- **Backend:** N/A
- **Database / Storage:** N/A
- **Tooling & Other:** Vitest + jsdom, ESLint (angular-eslint), Prettier, Firebase Hosting

---

## Prerequisites

Before running this project, ensure you have the following installed:

- Node.js `^22.22.3`, `^24.15.0` or `>=26` with npm
- Firebase CLI (`npm install -g firebase-tools`), only if you want to deploy

---

## Local Setup & Running

### 1. Clone the repository

```bash
git clone https://github.com/FrunzaDan/wedding-invite-frz.git
cd wedding-invite-frz
```

### 2. Configuration

There's no config file. Names, venues, map links, phone numbers and the event start/end times (`ceremonyStartIso` and so on) are fields in `src/app/app.ts`. The countdown's target date is hardcoded in `computeCountdown()` in the same file. If you fork this for another wedding, that's the file to edit, and the tests in `app.spec.ts` pin the current dates, so update them too.

The `.ics` files in `public/calendar/` are written by hand. If you change an event's date or time in `app.ts`, update the matching `.ics` file too, or the Apple button will disagree with the Google one.

### 3. Installation & Run

The scripts in the repo root do the usual steps for you:

```bash
./build.sh               # npm ci, format check, lint, build, unit tests (--skip-tests to skip them)
./run.sh                 # dev server, opened in your browser (runs npm ci first if node_modules is missing)
```

Or run the npm scripts yourself:

```bash
npm install
npm start          # dev server on http://localhost:4209
npm test           # Vitest unit tests
npm run lint       # ESLint
npm run format     # Prettier, fixes formatting in place (format:check only reports)
npm run build      # production build → dist/wedding-invite/browser
```

---

## API / App Usage

To deploy (Firebase project in `.firebaserc`):

```bash
npm run build
firebase deploy
```

`firebase.json` serves `/calendar/**` with `Content-Type: text/calendar; charset=utf-8`. Without that header, some phones download the `.ics` as a generic file instead of offering to add the event.

The Samsung button only works in Android browsers. If you change `buildSamsungCalendarUrl` in `app.ts`, keep it targeting the events collection (`content://com.android.calendar/events`) with `ACTION_INSERT`, otherwise Android calendar apps fail with "Unable to launch event".

---

## License & Notes

Personal project with no license file. All UI text is in Romanian.

The unit tests in `src/app/app.spec.ts` cover the countdown (including the exact wedding moment and dates after it), the calendar link builders for all three platforms, and the rendered template.
