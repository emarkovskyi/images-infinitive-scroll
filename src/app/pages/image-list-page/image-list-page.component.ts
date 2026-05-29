import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { IMAGES_SERVICE } from '../../services/image-provider/images-service.token';
import { FavoritesStateService } from '../../services/favorites/favorites-state.service';
import { LoadingLabelComponent } from '../../ui/loading-label/loading-label.component';
import { ImageListComponent } from '../../components/image-list/image-list.component';

@Component({
  selector: 'app-image-list-page',
  imports: [ImageListComponent, LoadingLabelComponent],
  templateUrl: './image-list-page.component.html',
  styleUrl: './image-list-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ImageListPageComponent {
  private readonly imagesService = inject(IMAGES_SERVICE);
  private readonly favoritesState = inject(FavoritesStateService);
  private readonly router = inject(Router);

  protected readonly images = toSignal(this.imagesService.getImages(), {
    initialValue: undefined,
  });

  protected openImage(imageId: string): void {
    this.favoritesState.add(imageId);
    void this.router.navigate(['/photos', imageId]);
  }
}
