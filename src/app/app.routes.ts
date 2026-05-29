import { Routes } from '@angular/router';
import { FavoritesPageComponent } from './pages/favorites-page/favorites-page.component';
import { ImageListPageComponent } from './pages/image-list-page/image-list-page.component';
import { PhotoDetailsPageComponent } from './pages/photo-details-page/photo-details-page.component';

export const routes: Routes = [
  {
    path: '',
    component: ImageListPageComponent,
  },
  {
    path: 'photos/:id',
    component: PhotoDetailsPageComponent,
  },
  {
    path: 'favorites',
    component: FavoritesPageComponent,
  },
  {
    path: '**',
    redirectTo: '',
  },
];
