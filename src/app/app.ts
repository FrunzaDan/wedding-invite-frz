import { Component, inject, OnInit, OnDestroy, NgZone } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnInit, OnDestroy {
  private sanitizer = inject(DomSanitizer);

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
  protected readonly receptionGoogleCalendarUrl: string;
  protected readonly receptionIcsUrl = '/calendar/receptie.ics';
  protected readonly ceremonyMapEmbed: SafeResourceUrl;
  protected readonly receptionMapEmbed: SafeResourceUrl;

  protected countdown = {
    days: 0,
    hours: 0,
  };

  private countdownIntervalId?: ReturnType<typeof setInterval>;

  constructor() {
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

    this.ceremonyMapEmbed = this.buildMapEmbed(this.ceremonyStreet, this.ceremonyLocation);
    this.receptionMapEmbed = this.buildMapEmbed(
      `${this.receptionVenue} ${this.receptionStreet}`,
      this.receptionLocation,
    );
  }

  ngOnInit(): void {
    this.updateCountdown();
    this.countdownIntervalId = setInterval(() => this.updateCountdown(), 60_000);
  }

  ngOnDestroy(): void {
    clearInterval(this.countdownIntervalId);
  }

  private updateCountdown(): void {
    const weddingDate = new Date('2027-09-11T00:00:00+03:00').getTime();
    const now = new Date().getTime();
    const diff = weddingDate - now;

    if (diff > 0) {
      this.countdown = {
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
      };
    } else {
      this.countdown = { days: 0, hours: 0 };
    }
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
