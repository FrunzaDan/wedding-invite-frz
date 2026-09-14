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
  });
});
