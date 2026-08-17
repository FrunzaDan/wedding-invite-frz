import { Component, inject, OnInit, OnDestroy, NgZone } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnInit, OnDestroy {
  private sanitizer = inject(DomSanitizer);

  protected readonly couple = 'Dan & Maria';
  protected readonly danParents = 'Adelinei & lui Mircea-Dan Frunza';
  protected readonly mariaParents = 'Luminiței & lui Nelu Solomon';
  protected readonly date = '11 septembrie 2027';
  protected readonly danPhone = '+40773851161';
  protected readonly mariaPhone = '+40742256541';
  protected readonly danWhatsApp = 'https://wa.me/40773851161';
  protected readonly mariaWhatsApp = 'https://wa.me/40742256541';
  protected readonly rsvpDeadline = '01 martie 2027';
  protected readonly ceremonyTime = '13:00';
  protected readonly ceremonyVenue = 'Biserica Ursulinelor';
  protected readonly ceremonyStreet = 'Strada General Magheru 36';
  protected readonly ceremonyLocation = 'Sibiu, România';
  protected readonly ceremonyMap =
    'https://www.google.com/maps/search/?api=1&query=Biserica+Ursulinelor+Strada+General+Magheru+36+Sibiu';
  protected readonly receptionTime = '15:00';
  protected readonly receptionVenue = 'Ramada Sibiu';
  protected readonly receptionStreet = 'Strada Emil Cioran 2';
  protected readonly receptionLocation = 'Sibiu, România';
  protected readonly receptionMap =
    'https://www.google.com/maps/search/?api=1&query=Ramada+Sibiu+Strada+Emil+Cioran+2+Sibiu';
  protected readonly rsvp = 'Așteptăm cu plăcere să sărbătorim cu voi';
  protected readonly imagePath = '/images/chunk_invites_you.webp';

  protected countdown = {
    days: 0,
    hours: 0,
  };

  ngOnInit(): void {
    this.updateCountdown();
  }

  ngOnDestroy(): void {}

  private updateCountdown(): void {
    const weddingDate = new Date('2027-09-11T00:00:00').getTime();
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

  protected getCeremonyMapEmbed(): SafeResourceUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(
      'https://www.google.com/maps?q=Strada%20General%20Magheru%2036%20Sibiu&output=embed',
    );
  }

  protected getReceptionMapEmbed(): SafeResourceUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(
      'https://www.google.com/maps?q=Ramada%20Sibiu%20Strada%20Emil%20Cioran%202%20Sibiu&output=embed',
    );
  }
}
