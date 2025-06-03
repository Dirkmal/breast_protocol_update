import { provideHttpClient } from '@angular/common/http';
import { provideZoneChangeDetection } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';

import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes';
import { DatabaseService } from './app/rxdb/rxdb.service';

async function bootstrap() {
  const dbService = new DatabaseService();
  await dbService.init();

  return bootstrapApplication(AppComponent, {
    providers: [
      {
        provide: DatabaseService,
        useValue: dbService,
      },
      provideZoneChangeDetection({ eventCoalescing: true }),
      provideRouter(routes),
      provideHttpClient(),
    ],
  });
}

bootstrap().catch((err) => console.error(err));
