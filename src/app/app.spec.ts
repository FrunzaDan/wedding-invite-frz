import { ComponentFixture, TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { App } from './app';

describe('App', () => {
  let fixture: ComponentFixture<App>;
  let component: App;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
    }).compileComponents();

    fixture = TestBed.createComponent(App);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should create the app', () => {
    expect(component).toBeTruthy();
  });

  describe('countdown', () => {
    it('computes days and hours remaining before the wedding', () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2027-09-01T00:00:00+03:00'));

      fixture.detectChanges(); // triggers ngOnInit

      expect(component['countdown']).toEqual({ days: 10, hours: 0 });
    });

    it('resets to zero once the wedding date has passed', () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2027-09-12T00:00:00+03:00'));

      fixture.detectChanges();

      expect(component['countdown']).toEqual({ days: 0, hours: 0 });
    });

    it('refreshes on the countdown interval', () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2027-09-01T00:00:00+03:00'));

      fixture.detectChanges();
      expect(component['countdown']).toEqual({ days: 10, hours: 0 });

      vi.setSystemTime(new Date('2027-09-06T00:00:00+03:00'));
      vi.advanceTimersByTime(60_000);

      expect(component['countdown']).toEqual({ days: 4, hours: 23 });
    });

    it('stops refreshing after the component is destroyed', () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2027-09-01T00:00:00+03:00'));

      fixture.detectChanges();
      fixture.destroy();

      vi.setSystemTime(new Date('2027-09-06T00:00:00+03:00'));
      vi.advanceTimersByTime(120_000);

      expect(component['countdown']).toEqual({ days: 10, hours: 0 });
    });

    it('shows zero days and hours at the exact moment the wedding starts', () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2027-09-11T00:00:00+03:00'));

      fixture.detectChanges();

      expect(component['countdown']).toEqual({ days: 0, hours: 0 });
    });

    it('floors partial hours instead of rounding when less than an hour remains', () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2027-09-10T23:30:00+03:00'));

      fixture.detectChanges();

      expect(component['countdown']).toEqual({ days: 0, hours: 0 });
    });

    it('never reports a negative countdown long after the wedding has passed', () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2028-01-01T00:00:00+03:00'));

      fixture.detectChanges();

      expect(component['countdown']).toEqual({ days: 0, hours: 0 });
    });
  });

  describe('calendar links', () => {
    it('points the Apple Calendar links at the static same-origin .ics files', () => {
      expect(component['ceremonyIcsUrl']).toBe('/calendar/ceremonie.ics');
      expect(component['receptionIcsUrl']).toBe('/calendar/receptie.ics');
    });

    it('builds a Google Calendar link for the ceremony with the correct UTC dates and details', () => {
      const url = new URL(component['ceremonyGoogleCalendarUrl']);

      expect(url.origin + url.pathname).toBe('https://calendar.google.com/calendar/render');
      expect(url.searchParams.get('action')).toBe('TEMPLATE');
      expect(url.searchParams.get('text')).toBe('Nuntă Dan & Maria - Ceremonie');
      expect(url.searchParams.get('dates')).toBe('20270911T100000Z/20270911T110000Z');
      expect(url.searchParams.get('location')).toBe(
        'Biserica Ursulinelor, Str. General Magheru 36, Sibiu',
      );
      expect(url.searchParams.get('details')).toBe('Ceremonia religioasă a nunții Dan & Maria.');
    });

    it('builds a Google Calendar link for the reception with the correct UTC dates and details', () => {
      const url = new URL(component['receptionGoogleCalendarUrl']);

      expect(url.searchParams.get('text')).toBe('Nuntă Dan & Maria - Recepție');
      expect(url.searchParams.get('dates')).toBe('20270911T120000Z/20270911T200000Z');
      expect(url.searchParams.get('location')).toBe('Ramada Sibiu, Str. Emil Cioran 2, Sibiu');
      expect(url.searchParams.get('details')).toBe('Recepția nunții Dan & Maria.');
    });

    it('builds a Samsung Calendar intent link for the ceremony with the correct epoch times and details', () => {
      const href = component['ceremonySamsungCalendarUrl'];

      expect(href).toContain(`S.title=${encodeURIComponent('Nuntă Dan & Maria - Ceremonie')}`);
      expect(href).toContain(
        `S.eventLocation=${encodeURIComponent('Biserica Ursulinelor, Str. General Magheru 36, Sibiu')}`,
      );
      expect(href).toContain(
        `S.description=${encodeURIComponent('Ceremonia religioasă a nunții Dan & Maria.')}`,
      );
      expect(href).toContain(`l.beginTime=${new Date('2027-09-11T13:00:00+03:00').getTime()}`);
      expect(href).toContain(`l.endTime=${new Date('2027-09-11T14:00:00+03:00').getTime()}`);
    });

    it('builds a Samsung Calendar intent link for the reception with the correct epoch times and details', () => {
      const href = component['receptionSamsungCalendarUrl'];

      expect(href).toContain(`S.title=${encodeURIComponent('Nuntă Dan & Maria - Recepție')}`);
      expect(href).toContain(`l.beginTime=${new Date('2027-09-11T15:00:00+03:00').getTime()}`);
      expect(href).toContain(`l.endTime=${new Date('2027-09-11T23:00:00+03:00').getTime()}`);
    });

    it('targets the Android Calendar Provider "insert new event" data URI, not a single-event view', () => {
      const ceremonyHref = component['ceremonySamsungCalendarUrl'];
      const receptionHref = component['receptionSamsungCalendarUrl'];

      for (const href of [ceremonyHref, receptionHref]) {
        expect(href).toContain('intent://com.android.calendar/events#Intent;');
        expect(href).toContain('scheme=content;');
        expect(href).toContain('action=android.intent.action.INSERT;');
        expect(href).toContain('package=com.samsung.android.calendar;');
        expect(href.endsWith(';end')).toBe(true);
        // Regression guard: this MIME type addresses a single *existing* event
        // (ACTION_VIEW/ACTION_EDIT) and breaks ACTION_INSERT if reintroduced.
        expect(href).not.toContain('vnd.android.cursor.item/event');
      }
    });

    it('falls back to the same-origin .ics file under the current page origin if no calendar app resolves the intent', () => {
      const ceremonyHref = component['ceremonySamsungCalendarUrl'];
      const receptionHref = component['receptionSamsungCalendarUrl'];

      expect(ceremonyHref).toContain(
        `S.browser_fallback_url=${encodeURIComponent(`${window.location.origin}/calendar/ceremonie.ics`)}`,
      );
      expect(receptionHref).toContain(
        `S.browser_fallback_url=${encodeURIComponent(`${window.location.origin}/calendar/receptie.ics`)}`,
      );
    });

    it('gives each event a distinct Samsung Calendar link', () => {
      expect(component['ceremonySamsungCalendarUrl']).not.toBe(
        component['receptionSamsungCalendarUrl'],
      );
    });
  });

  describe('map embeds', () => {
    function unwrapSafeUrl(safeUrl: unknown): string {
      return (safeUrl as { changingThisBreaksApplicationSecurity: string })
        .changingThisBreaksApplicationSecurity;
    }

    it('builds a sanitized Google Maps embed URL for the ceremony venue', () => {
      const url = unwrapSafeUrl(component['ceremonyMapEmbed']);

      expect(url).toContain('https://www.google.com/maps?q=');
      expect(url).toContain(encodeURIComponent('Str. General Magheru 36 Sibiu'));
      expect(url).toContain('&output=embed');
    });

    it('builds a sanitized Google Maps embed URL for the reception venue', () => {
      const url = unwrapSafeUrl(component['receptionMapEmbed']);

      expect(url).toContain(encodeURIComponent('Ramada Sibiu Str. Emil Cioran 2 Sibiu'));
    });
  });

  describe('template', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('renders the wedding date and countdown labels', () => {
      const compiled: HTMLElement = fixture.nativeElement;
      expect(compiled.querySelector('h1')?.textContent).toContain('Dan & Maria');
      expect(compiled.textContent).toContain(component['date']);
    });

    it('renders tel: links for both phone numbers', () => {
      const compiled: HTMLElement = fixture.nativeElement;
      const links = Array.from(compiled.querySelectorAll('a.phone-button')) as HTMLAnchorElement[];

      expect(links.map((link) => link.getAttribute('href'))).toEqual([
        `tel:${component['danPhone']}`,
        `tel:${component['mariaPhone']}`,
      ]);
    });

    it('renders WhatsApp links that open in a new tab', () => {
      const compiled: HTMLElement = fixture.nativeElement;
      const links = Array.from(
        compiled.querySelectorAll('a.whatsapp-button'),
      ) as HTMLAnchorElement[];

      expect(links).toHaveLength(2);
      for (const link of links) {
        expect(link.getAttribute('target')).toBe('_blank');
        expect(link.getAttribute('rel')).toBe('noopener noreferrer');
      }
    });

    it('renders an Apple Calendar link for each event without target=_blank', () => {
      const compiled: HTMLElement = fixture.nativeElement;
      const appleLinks = Array.from(
        compiled.querySelectorAll('a.calendar-button.apple'),
      ) as HTMLAnchorElement[];

      expect(appleLinks.map((link) => link.getAttribute('href'))).toEqual([
        '/calendar/ceremonie.ics',
        '/calendar/receptie.ics',
      ]);
      for (const link of appleLinks) {
        expect(link.getAttribute('target')).toBeNull();
      }
    });

    it('renders a Google Calendar link for each event that opens in a new tab', () => {
      const compiled: HTMLElement = fixture.nativeElement;
      const googleLinks = Array.from(
        compiled.querySelectorAll('a.calendar-button.google'),
      ) as HTMLAnchorElement[];

      expect(googleLinks).toHaveLength(2);
      for (const link of googleLinks) {
        expect(link.getAttribute('href')).toContain('https://calendar.google.com/calendar/render');
        expect(link.getAttribute('target')).toBe('_blank');
      }
    });

    it('renders a Samsung Calendar link for each event as an Android intent with an .ics fallback', () => {
      const compiled: HTMLElement = fixture.nativeElement;
      const samsungLinks = Array.from(
        compiled.querySelectorAll('a.calendar-button.samsung'),
      ) as HTMLAnchorElement[];

      expect(samsungLinks).toHaveLength(2);
      for (const link of samsungLinks) {
        const href = link.getAttribute('href') ?? '';
        expect(
          href.startsWith('intent://com.android.calendar/events#Intent;scheme=content;'),
        ).toBe(true);
        expect(href).toContain('package=com.samsung.android.calendar');
        expect(link.getAttribute('target')).toBeNull();
      }

      expect(samsungLinks[0].getAttribute('href')).toContain(
        encodeURIComponent('/calendar/ceremonie.ics'),
      );
      expect(samsungLinks[1].getAttribute('href')).toContain(
        encodeURIComponent('/calendar/receptie.ics'),
      );
    });

    it('renders the hero image with a descriptive alt text', () => {
      const compiled: HTMLElement = fixture.nativeElement;
      const img = compiled.querySelector('.image-wrap img') as HTMLImageElement | null;

      expect(img).not.toBeNull();
      expect(img?.getAttribute('src')).toBe(component['imagePath']);
      expect(img?.getAttribute('alt')).toBeTruthy();
    });

    it('renders "Open in Maps" links to the ceremony and reception map URLs in a new tab', () => {
      const compiled: HTMLElement = fixture.nativeElement;
      const mapLinks = Array.from(compiled.querySelectorAll('a.map-link')) as HTMLAnchorElement[];

      expect(mapLinks.map((link) => link.getAttribute('href'))).toEqual([
        component['ceremonyMap'],
        component['receptionMap'],
      ]);
      for (const link of mapLinks) {
        expect(link.getAttribute('target')).toBe('_blank');
        expect(link.getAttribute('rel')).toBe('noopener noreferrer');
      }
    });

    it('renders the sanitized map embed URLs on the ceremony and reception iframes', () => {
      const compiled: HTMLElement = fixture.nativeElement;
      const iframes = Array.from(compiled.querySelectorAll('.map-frame iframe')) as HTMLIFrameElement[];

      expect(iframes).toHaveLength(2);
      expect(iframes[0].getAttribute('src')).toContain(
        encodeURIComponent('Str. General Magheru 36 Sibiu'),
      );
      expect(iframes[1].getAttribute('src')).toContain(
        encodeURIComponent('Ramada Sibiu Str. Emil Cioran 2 Sibiu'),
      );
    });

    it('displays each phone number next to its call and WhatsApp buttons', () => {
      const compiled: HTMLElement = fixture.nativeElement;

      const danNumbers = compiled.querySelectorAll('.dan .phone-number');
      const mariaNumbers = compiled.querySelectorAll('.maria .phone-number');

      expect(danNumbers).toHaveLength(2); // call button + WhatsApp button
      expect(mariaNumbers).toHaveLength(2);
      for (const el of Array.from(danNumbers)) {
        expect(el.textContent).toBe(component['danPhone']);
      }
      for (const el of Array.from(mariaNumbers)) {
        expect(el.textContent).toBe(component['mariaPhone']);
      }
    });

    it('renders the RSVP message and deadline', () => {
      const compiled: HTMLElement = fixture.nativeElement;
      const rsvpBox = compiled.querySelector('.rsvp-box');

      expect(rsvpBox?.textContent).toContain(component['rsvp']);
      expect(rsvpBox?.textContent).toContain(component['rsvpDeadline']);
    });
  });
});
