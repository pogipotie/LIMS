import { ApplicationConfig, provideZoneChangeDetection, DEFAULT_CURRENCY_CODE } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideAnimationsAsync(),
    { provide: DEFAULT_CURRENCY_CODE, useValue: 'PHP' } // Set global currency to Philippine Peso
  ]
};
