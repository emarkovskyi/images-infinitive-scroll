import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { map, switchMap } from 'rxjs';
import { ImageCardComponent } from '../../components/image-card/image-card.component';
import { FavoritesStateService } from '../../services/favorites/favorites-state.service';
import { IMAGES_SERVICE } from '../../services/image-provider/images-service.token';
import { ButtonComponent } from '../../ui/button/button.component';
import { LoadingLabelComponent } from '../../ui/loading-label/loading-label.component';

@Component({
  selector: 'app-photo-details-page',
  imports: [ImageCardComponent, LoadingLabelComponent, ButtonComponent],
  templateUrl: './photo-details-page.component.html',
  styleUrl: './photo-details-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PhotoDetailsPageComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly imagesService = inject(IMAGES_SERVICE);
  private readonly favoritesState = inject(FavoritesStateService);

  private readonly imageId = toSignal(
    this.route.paramMap.pipe(map((params) => params.get('id'))),
    { initialValue: null },
  );

  protected readonly image = toSignal(
    this.route.paramMap.pipe(
      map((params) => params.get('id')),
      switchMap((id) => this.imagesService.getImageById(id ?? '')),
    ),
    { initialValue: null },
  );

  protected readonly isFavorite = computed(() => {
    const imageId = this.imageId();
    return imageId ? this.favoritesState.isFavorite(imageId) : false;
  });

  protected removeFromFavorites(): void {
    const imageId = this.imageId();

    if (imageId) {
      this.favoritesState.remove(imageId);
    }
  }
}
