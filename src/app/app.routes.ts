import { Routes } from '@angular/router';
import { ImageListPageComponent } from './pages/image-list-page/image-list-page.component';

export const routes: Routes = [
  {
    path: '',
    component: ImageListPageComponent,
  },
  {
    path: 'photos/:id',
    loadComponent: () =>
      import('./pages/photo-details-page/photo-details-page.component').then(
        (module) => module.PhotoDetailsPageComponent,
      ),
  },
  {
    path: 'favorites',
    loadComponent: () =>
      import('./pages/favorites-page/favorites-page.component').then(
        (module) => module.FavoritesPageComponent,
      ),
  },
  {
    path: '**',
    redirectTo: '',
  },
];
