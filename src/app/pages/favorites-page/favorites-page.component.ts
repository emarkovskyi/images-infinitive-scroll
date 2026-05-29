import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { ImageListComponent } from '../../components/image-list/image-list.component';
import { IMAGES_SERVICE } from '../../services/image-provider/images-service.token';
import { FavoritesStateService } from '../../services/favorites/favorites-state.service';
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
  private readonly favoritesState = inject(FavoritesStateService);
  private readonly router = inject(Router);

  private readonly images = toSignal(this.imagesService.getImages(), {
    initialValue: undefined,
  });

  protected readonly favoriteImages = computed(() => {
    const images = this.images();
    const favoriteIds = this.favoritesState.favoriteIds();

    if (!images) {
      return undefined;
    }

    return images.filter((image) => favoriteIds.includes(image.id));
  });

  protected openImage(imageId: string): void {
    void this.router.navigate(['/photos', imageId]);
  }
}
