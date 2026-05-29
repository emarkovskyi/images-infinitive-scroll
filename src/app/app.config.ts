import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

import { routes } from './app.routes';
import { FavoritesStateService } from './services/favorites/favorites-state.service';
import { FAVORITES_STATE } from './services/favorites/favorites-state.token';
import { IMAGES_SERVICE } from './services/image-provider/images-service.token';
import { PicsumImagesService } from './services/image-provider/picsum-images.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideAnimationsAsync(),
    provideHttpClient(),
    provideRouter(routes),
    {
      provide: IMAGES_SERVICE,
      useExisting: PicsumImagesService,
    },
    {
      provide: FAVORITES_STATE,
      useExisting: FavoritesStateService,
    },
  ]
};
