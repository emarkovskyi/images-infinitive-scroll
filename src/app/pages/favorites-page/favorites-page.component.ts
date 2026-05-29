import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { forkJoin, map, of, switchMap } from 'rxjs';
import { ImageListComponent } from '../../components/image-list/image-list.component';
import { ImageItem } from '../../services/image-provider/image-item.interface';
import { FAVORITES_STATE } from '../../services/favorites/favorites-state.token';
import { IMAGES_SERVICE } from '../../services/image-provider/images-service.token';
import { LoadingLabelComponent } from '../../ui/loading-label/loading-label.component';

@Component({
  selector: 'app-favorites-page',
  imports: [ImageListComponent, LoadingLabelComponent],
  templateUrl: './favorites-page.component.html',
  styleUrl: './favorites-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FavoritesPageComponent {
  private readonly imagesService = inject(IMAGES_SERVICE);
  private readonly favoritesState = inject(FAVORITES_STATE);
  private readonly router = inject(Router);

  protected readonly favoriteImages = toSignal(
    toObservable(this.favoritesState.favoriteIds).pipe(
      switchMap((favoriteIds) => {
        if (!favoriteIds.length) {
          return of([] as ImageItem[]);
        }

        return forkJoin(
          favoriteIds.map((favoriteId) => this.imagesService.getImageById(favoriteId)),
        ).pipe(map((images) => images.filter((image): image is ImageItem => image !== undefined)));
      }),
    ),
    { initialValue: undefined },
  );

  protected openImage(imageId: string): void {
    void this.router.navigate(['/photos', imageId]);
  }
}
