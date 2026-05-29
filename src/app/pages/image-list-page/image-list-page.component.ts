import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { take } from 'rxjs';
import { IMAGES_SERVICE } from '../../services/image-provider/images-service.token';
import { FAVORITES_STATE } from '../../services/favorites/favorites-state.token';
import { LoadingLabelComponent } from '../../ui/loading-label/loading-label.component';
import { ImageListComponent } from '../../components/image-list/image-list.component';
import { ImageItem } from '../../services/image-provider/image-item.interface';

const PHOTO_PAGE_SIZE = 20;

@Component({
  selector: 'app-image-list-page',
  imports: [ImageListComponent, LoadingLabelComponent],
  templateUrl: './image-list-page.component.html',
  styleUrl: './image-list-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ImageListPageComponent {
  private readonly destroyRef = inject(DestroyRef);
  private readonly imagesService = inject(IMAGES_SERVICE);
  private readonly favoritesState = inject(FAVORITES_STATE);
  private readonly router = inject(Router);

  protected readonly items = signal<ImageItem[]>([]);
  protected readonly nextCursor = signal<string | null>(null);
  protected readonly hasNextPage = signal(true);
  protected readonly isLoadingInitial = signal(true);
  protected readonly isLoadingMore = signal(false);
  protected readonly loadError = signal<string | null>(null);

  constructor() {
    this.loadInitialPage();
  }

  protected openImage(imageId: string): void {
    this.favoritesState.add(imageId);
    void this.router.navigate(['/photos', imageId]);
  }

  protected loadMore(): void {
    if (!this.hasNextPage() || this.isLoadingInitial() || this.isLoadingMore()) {
      return;
    }

    this.loadPage({
      cursor: this.nextCursor(),
      append: true,
    });
  }

  private loadInitialPage(): void {
    this.loadPage({
      cursor: null,
      append: false,
    });
  }

  private loadPage(options: { cursor: string | null; append: boolean }): void {
    if (options.append) {
      this.isLoadingMore.set(true);
    } else {
      this.isLoadingInitial.set(true);
      this.items.set([]);
    }

    this.loadError.set(null);

    this.imagesService
      .listImages({
        cursor: options.cursor,
        limit: PHOTO_PAGE_SIZE,
      })
      .pipe(take(1), takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.items.update((currentItems) =>
            options.append ? [...currentItems, ...response.items] : response.items,
          );
          this.nextCursor.set(response.pageInfo.nextCursor);
          this.hasNextPage.set(response.pageInfo.hasNextPage);
          this.isLoadingInitial.set(false);
          this.isLoadingMore.set(false);
        },
        error: () => {
          this.loadError.set(
            options.append ? 'Could not load more photos.' : 'Could not load photos.',
          );
          this.isLoadingInitial.set(false);
          this.isLoadingMore.set(false);
        },
      });
  }
}
