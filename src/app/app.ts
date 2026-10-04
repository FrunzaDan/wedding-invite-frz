import { DOCUMENT } from '@angular/common';
import {
  afterNextRender,
  Component,
  DestroyRef,
  inject,
  signal,
} from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  private readonly sanitizer = inject(DomSanitizer);
  private readonly document = inject(DOCUMENT);

  protected readonly date = '11 septembrie 2027';
  protected readonly danPhone = '+40773851161';
  protected readonly mariaPhone = '+40742256541';
  protected readonly danWhatsApp = 'https://wa.me/40773851161';
  protected readonly mariaWhatsApp = 'https://wa.me/40742256541';
  protected readonly rsvpDeadline = '01 martie 2027';
  protected readonly ceremonyTime = '13:00';
  protected readonly ceremonyVenue = 'Biserica Ursulinelor';
  protected readonly ceremonyStreet = 'Str. General Magheru 36';
  protected readonly ceremonyLocation = 'Sibiu';
  protected readonly ceremonyMap = 'https://maps.app.goo.gl/VZJZRpi2mzZjpBsp7';
  protected readonly receptionTime = '15:00';
  protected readonly receptionVenue = 'Ramada Sibiu';
  protected readonly receptionStreet = 'Str. Emil Cioran 2';
  protected readonly receptionLocation = 'Sibiu';
  protected readonly receptionMap = 'https://maps.app.goo.gl/AB5fqmhwW2yEqxmY7';
  protected readonly rsvp = 'Așteptăm cu plăcere să sărbătorim cu voi';
  protected readonly imagePath = '/images/chunk_invites_you.webp';

  // Romania is on EEST (UTC+3) in September.
  private readonly ceremonyStartIso = '2027-09-11T13:00:00+03:00';
  private readonly ceremonyEndIso = '2027-09-11T14:00:00+03:00';
  private readonly receptionStartIso = '2027-09-11T15:00:00+03:00';
  private readonly receptionEndIso = '2027-09-11T23:00:00+03:00';

  protected readonly ceremonyGoogleCalendarUrl: string;
  protected readonly ceremonyIcsUrl = '/calendar/ceremonie.ics';
  protected readonly ceremonySamsungCalendarUrl: string;
  protected readonly receptionGoogleCalendarUrl: string;
  protected readonly receptionIcsUrl = '/calendar/receptie.ics';
  protected readonly receptionSamsungCalendarUrl: string;
  protected readonly ceremonyMapEmbed: SafeResourceUrl;
  protected readonly receptionMapEmbed: SafeResourceUrl;

  protected readonly countdown = signal(this.computeCountdown());

  constructor() {
    // Render hooks only run in the browser, so the timer never starts on a server.
    let countdownIntervalId: ReturnType<typeof setInterval> | undefined;
    // Still ticks every second so the minute rolls over on time; unchanged values don't touch the DOM.
    afterNextRender(() => {
      this.countdown.set(this.computeCountdown());
      countdownIntervalId = setInterval(
        () => this.countdown.set(this.computeCountdown()),
        1_000,
      );
    });
    inject(DestroyRef).onDestroy(() => clearInterval(countdownIntervalId));

    const ceremonyTitle = 'Nuntă Dan & Maria - Ceremonie';
    const ceremonyLocationStr = `${this.ceremonyVenue}, ${this.ceremonyStreet}, ${this.ceremonyLocation}`;
    const ceremonyDetails = 'Ceremonia religioasă a nunții Dan & Maria.';

    const receptionTitle = 'Nuntă Dan & Maria - Recepție';
    const receptionLocationStr = `${this.receptionVenue}, ${this.receptionStreet}, ${this.receptionLocation}`;
    const receptionDetails = 'Recepția nunții Dan & Maria.';

    this.ceremonyGoogleCalendarUrl = this.buildGoogleCalendarUrl(
      ceremonyTitle,
      this.timedGoogleDates(this.ceremonyStartIso, this.ceremonyEndIso),
      ceremonyLocationStr,
      ceremonyDetails,
    );

    this.receptionGoogleCalendarUrl = this.buildGoogleCalendarUrl(
      receptionTitle,
      this.timedGoogleDates(this.receptionStartIso, this.receptionEndIso),
      receptionLocationStr,
      receptionDetails,
    );

    this.ceremonySamsungCalendarUrl = this.buildSamsungCalendarUrl(
      ceremonyTitle,
      ceremonyLocationStr,
      ceremonyDetails,
      this.ceremonyStartIso,
      this.ceremonyEndIso,
      this.ceremonyIcsUrl,
    );

    this.receptionSamsungCalendarUrl = this.buildSamsungCalendarUrl(
      receptionTitle,
      receptionLocationStr,
      receptionDetails,
      this.receptionStartIso,
      this.receptionEndIso,
      this.receptionIcsUrl,
    );

    this.ceremonyMapEmbed = this.buildMapEmbed(
      this.ceremonyStreet,
      this.ceremonyLocation,
    );
    this.receptionMapEmbed = this.buildMapEmbed(
      `${this.receptionVenue} ${this.receptionStreet}`,
      this.receptionLocation,
    );
  }

  private computeCountdown(): { days: number; hours: number; minutes: number } {
    const weddingDate = new Date('2027-09-11T00:00:00+03:00').getTime();
    const totalSeconds = Math.floor((weddingDate - Date.now()) / 1000);

    if (totalSeconds <= 0) {
      return { days: 0, hours: 0, minutes: 0 };
    }
    return {
      days: Math.floor(totalSeconds / (60 * 60 * 24)),
      hours: Math.floor((totalSeconds % (60 * 60 * 24)) / (60 * 60)),
      minutes: Math.floor((totalSeconds % (60 * 60)) / 60),
    };
  }

  private buildMapEmbed(street: string, location: string): SafeResourceUrl {
    const query = encodeURIComponent(`${street} ${location}`);
    return this.sanitizer.bypassSecurityTrustResourceUrl(
      `https://www.google.com/maps?q=${query}&output=embed`,
    );
  }

  private formatGoogleDate(iso: string): string {
    const utcIso = new Date(iso).toISOString();
    return utcIso.replace(/[-:]/g, '').split('.')[0] + 'Z';
  }

  private timedGoogleDates(startIso: string, endIso: string): string {
    return `${this.formatGoogleDate(startIso)}/${this.formatGoogleDate(endIso)}`;
  }

  private buildSamsungCalendarUrl(
    title: string,
    venueLocation: string,
    details: string,
    startIso: string,
    endIso: string,
    fallbackIcsUrl: string,
  ): string {
    const beginTime = new Date(startIso).getTime();
    const endTime = new Date(endIso).getTime();
    const fallbackUrl = encodeURIComponent(
      `${this.document.location.origin}${fallbackIcsUrl}`,
    );

    return (
      'intent://com.android.calendar/events#Intent;' +
      'scheme=content;' +
      'action=android.intent.action.INSERT;' +
      `S.title=${encodeURIComponent(title)};` +
      `S.eventLocation=${encodeURIComponent(venueLocation)};` +
      `S.description=${encodeURIComponent(details)};` +
      `l.beginTime=${beginTime};` +
      `l.endTime=${endTime};` +
      'package=com.samsung.android.calendar;' +
      `S.browser_fallback_url=${fallbackUrl};` +
      'end'
    );
  }

  private buildGoogleCalendarUrl(
    title: string,
    dates: string,
    location: string,
    details: string,
  ): string {
    const params = new URLSearchParams({
      action: 'TEMPLATE',
      text: title,
      dates,
      details,
      location,
    });
    return `https://calendar.google.com/calendar/render?${params.toString()}`;
  }
}
