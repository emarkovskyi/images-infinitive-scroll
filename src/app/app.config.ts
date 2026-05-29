import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

import { routes } from './app.routes';
import { IMAGES_SERVICE } from './services/image-provider/images-service.token';
import { MockImagesService } from './services/image-provider/mock-images.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideAnimationsAsync(),
    provideRouter(routes),
    {
      provide: IMAGES_SERVICE,
      useExisting: MockImagesService,
    },
  ]
};
