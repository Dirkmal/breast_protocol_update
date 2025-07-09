import { provideHttpClient, withFetch } from '@angular/common/http';
import { provideZoneChangeDetection, isDevMode } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';

import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes';
import { DatabaseService } from './app/rxdb/rxdb.service';
import { provideServiceWorker } from '@angular/service-worker';

async function bootstrap() {
  const dbService = new DatabaseService();
  await dbService.db;

  return bootstrapApplication(AppComponent, {
    providers: [
      {
        provide: DatabaseService,
        useValue: dbService,
      },
      provideZoneChangeDetection({ eventCoalescing: true }),
      provideRouter(routes),
      provideHttpClient(), provideServiceWorker('ngsw-worker.js', {
            enabled: !isDevMode(),
            registrationStrategy: 'registerWhenStable:30000'
          }),
    ],
  });
}

bootstrap().catch((err) => console.error(err));
