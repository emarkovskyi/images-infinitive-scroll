import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map, of, shareReplay, tap, finalize, delay } from 'rxjs';
import { ImageItem } from './image-item.interface';
import {
  ImagesService,
  ListImagesParams,
  PaginatedImagesResponse,
} from './images-service.interface';

interface PicsumListItem {
  id: string;
  author: string;
  width: number;
  height: number;
  url: string;
  download_url: string;
}

const PICSUM_LIST_URL = 'https://picsum.photos/v2/list?page=10&limit=100';
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 50;
const CARD_IMAGE_WIDTH = 1200;
const CARD_IMAGE_HEIGHT = 900;

function clampLimit(limit?: number): number {
  if (!limit || Number.isNaN(limit)) {
    return DEFAULT_LIMIT;
  }

  return Math.min(Math.max(Math.trunc(limit), 1), MAX_LIMIT);
}

function encodeCursor(index: number): string {
  return `idx:${index}`;
}

function decodeCursor(cursor?: string | null): number {
  if (!cursor?.startsWith('idx:')) {
    return 0;
  }

  const decodedValue = Number.parseInt(cursor.slice(4), 10);
  return Number.isFinite(decodedValue) && decodedValue >= 0 ? decodedValue : 0;
}

function toImageUrl(id: string): string {
  return `https://picsum.photos/id/${id}/${CARD_IMAGE_WIDTH}/${CARD_IMAGE_HEIGHT}`;
}

function toImageTitle(item: PicsumListItem): string {
  const author = item.author?.trim();
  return author ? `${author} ${item.id}` : `Photo ${item.id}`;
}

function toImageDescription(item: PicsumListItem): string {
  const author = item.author?.trim() || 'an unknown creator';
  return `Seeded Picsum image ${item.id} by ${author}, sized ${item.width} by ${item.height}.`;
}

function mapPicsumItem(item: PicsumListItem): ImageItem {
  return {
    id: item.id,
    title: toImageTitle(item),
    url: toImageUrl(item.id),
    description: toImageDescription(item),
  };
}

@Injectable({
  providedIn: 'root',
})
export class PicsumImagesService implements ImagesService {
  private readonly http = inject(HttpClient);

  private cachedImages: ImageItem[] | null = null;
  private seedRequest$: Observable<ImageItem[]> | null = null;

  listImages(params: ListImagesParams = {}): Observable<PaginatedImagesResponse> {
    const startIndex = decodeCursor(params.cursor);
    const limit = clampLimit(params.limit);

    return this.getSeedImages().pipe(
      delay(300),
      map((images) => {
        const items = images.slice(startIndex, startIndex + limit);
        const nextIndex = startIndex + items.length;
        const hasNextPage = nextIndex < images.length;

        return {
          items,
          pageInfo: {
            nextCursor: hasNextPage ? encodeCursor(nextIndex) : null,
            hasNextPage,
          },
        };
      }),
    );
  }

  getImageById(id: string): Observable<ImageItem | undefined> {
    return this.getSeedImages().pipe(map((images) => images.find((image) => image.id === id)));
  }

  private getSeedImages(): Observable<ImageItem[]> {
    if (this.cachedImages) {
      return of(this.cachedImages);
    }

    if (this.seedRequest$) {
      return this.seedRequest$;
    }

    this.seedRequest$ = this.http.get<PicsumListItem[]>(PICSUM_LIST_URL).pipe(
      map((items) => items.map(mapPicsumItem)),
      tap((images) => {
        this.cachedImages = images;
      }),
      finalize(() => {
        this.seedRequest$ = null;
      }),
      shareReplay(1),
    );

    return this.seedRequest$;
  }
}
