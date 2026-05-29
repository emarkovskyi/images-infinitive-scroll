import { InjectionToken } from '@angular/core';
import { ImagesService } from './images-service.interface';

export const IMAGES_SERVICE = new InjectionToken<ImagesService>('IMAGES_SERVICE');
