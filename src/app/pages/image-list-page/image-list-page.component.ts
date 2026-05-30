import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { IMAGES_SERVICE } from '../../services/image-provider/images-service.token';
import { FAVORITES_STATE } from '../../services/favorites/favorites-state.token';
import { LoadingLabelComponent } from '../../ui/loading-label/loading-label.component';
import { ImageListComponent } from '../../components/image-list/image-list.component';
import { ImageItem } from '../../services/image-provider/image-item.interface';
import { PageInfo, PaginatedImagesResponse } from '../../services/image-provider/images-service.interface';

const PHOTO_PAGE_SIZE = 20;

interface PageRequest {
  cursor: string | null;
  append: boolean;
  nonce: number;
}

@Component({
  selector: 'app-image-list-page',
  imports: [ImageListComponent, LoadingLabelComponent],
  templateUrl: './image-list-page.component.html',
  styleUrl: './image-list-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ImageListPageComponent {
  private readonly imagesService = inject(IMAGES_SERVICE);
  private readonly favoritesState = inject(FAVORITES_STATE);

  private readonly pageInfo = signal<PageInfo>({
    nextCursor: null,
    hasNextPage: true,
  });
  private readonly pageRequest = signal<PageRequest>({
    cursor: null,
    append: false,
    nonce: 0,
  });
  private readonly pageResource = rxResource<PaginatedImagesResponse, PageRequest>({
    params: () => this.pageRequest(),
    stream: ({ params }) =>
      this.imagesService.listImages({
        cursor: params.cursor,
        limit: PHOTO_PAGE_SIZE,
      }),
  });

  protected readonly items = signal<ImageItem[]>([]);
  protected readonly isLoadingInitial = computed(
    () => this.pageResource.isLoading() && !this.pageRequest().append,
  );
  protected readonly isLoadingMore = computed(
    () => this.pageResource.isLoading() && this.pageRequest().append,
  );
  protected readonly loadError = computed(() => {
    if (!this.pageResource.error()) {
      return null;
    }

    return this.pageRequest().append
      ? $localize`:@@imageListPage.loadMoreError:Could not load more photos.`
      : $localize`:@@imageListPage.loadError:Could not load photos.`;
  });

  constructor() {
    effect(() => {
      if (!this.pageResource.hasValue() || this.pageResource.status() !== 'resolved') {
        return;
      }

      const page = this.pageResource.value();

      if (this.pageRequest().append) {
        this.items.update((currentItems) => [...currentItems, ...page.items]);
      } else {
        this.items.set(page.items);
      }

      this.pageInfo.set(page.pageInfo);
    });
  }

  protected openImage(imageId: string): void {
    this.favoritesState.add(imageId);
  }

  protected loadMore(): void {
    if (!this.pageInfo().hasNextPage || this.pageResource.isLoading()) {
      return;
    }

    this.pageRequest.update((currentRequest) => ({
      cursor: this.pageInfo().nextCursor,
      append: true,
      nonce: currentRequest.nonce + 1,
    }));
  }
}
