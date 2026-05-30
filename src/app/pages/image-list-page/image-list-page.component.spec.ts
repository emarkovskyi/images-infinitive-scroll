import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { By } from '@angular/platform-browser';
import { delay, mergeMap, Observable, of, throwError, timer } from 'rxjs';
import { ImageListComponent } from '../../components/image-list/image-list.component';
import { FavoritesStateService } from '../../services/favorites/favorites-state.service';
import { FAVORITES_STATE } from '../../services/favorites/favorites-state.token';
import { ImageItem } from '../../services/image-provider/image-item.interface';
import {
  ImagesService,
  ListImagesParams,
  PaginatedImagesResponse,
} from '../../services/image-provider/images-service.interface';
import { IMAGES_SERVICE } from '../../services/image-provider/images-service.token';
import { ImageListPageComponent } from './image-list-page.component';

class MockIntersectionObserver {
  readonly observe = vi.fn();
  readonly disconnect = vi.fn();

  constructor(public readonly callback: IntersectionObserverCallback) {}
}

const TEST_IMAGES: ImageItem[] = Array.from({ length: 25 }, (_, index) => ({
  id: `image-${index + 1}`,
  title: `Image ${index + 1}`,
  url: `https://example.com/${index + 1}.jpg`,
  description: `Description ${index + 1}`,
}));

class FakeImagesService implements ImagesService {
  readonly listImages = vi.fn((params?: ListImagesParams): Observable<PaginatedImagesResponse> => {
    const limit = params?.limit ?? 20;
    const startIndex = params?.cursor ? Number.parseInt(params.cursor.replace('idx:', ''), 10) : 0;
    const items = TEST_IMAGES.slice(startIndex, startIndex + limit);
    const nextIndex = startIndex + items.length;
    const hasNextPage = nextIndex < TEST_IMAGES.length;

    return of({
      items,
      pageInfo: {
        nextCursor: hasNextPage ? `idx:${nextIndex}` : null,
        hasNextPage,
      },
    }).pipe(delay(100));
  });

  readonly getImageById = vi.fn((id: string) =>
    of(TEST_IMAGES.find((image) => image.id === id)).pipe(delay(100)),
  );
}

describe('ImageListPageComponent', () => {
  const originalIntersectionObserver = globalThis.IntersectionObserver;
  let service: FakeImagesService;

  beforeEach(() => {
    vi.useFakeTimers();
    globalThis.IntersectionObserver = MockIntersectionObserver as unknown as typeof IntersectionObserver;
    service = new FakeImagesService();
  });

  afterEach(() => {
    vi.useRealTimers();
    globalThis.IntersectionObserver = originalIntersectionObserver;
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ImageListPageComponent],
      providers: [
        provideRouter([]),
        FavoritesStateService,
        { provide: FAVORITES_STATE, useExisting: FavoritesStateService },
        { provide: IMAGES_SERVICE, useValue: service },
      ],
    }).compileComponents();
  });

  async function flushRequest(fixture: ComponentFixture<ImageListPageComponent>) {
    await vi.advanceTimersByTimeAsync(100);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  }

  function delayedError(message = 'Request failed'): Observable<never> {
    return timer(100).pipe(mergeMap(() => throwError(() => new Error(message))));
  }

  it('should load the first page on init', async () => {
    const fixture = TestBed.createComponent(ImageListPageComponent);
    fixture.detectChanges();

    await flushRequest(fixture);

    expect(service.listImages).toHaveBeenCalledTimes(1);
    expect(service.listImages).toHaveBeenCalledWith({ cursor: null, limit: 20 });
    expect(fixture.nativeElement.querySelectorAll('.image-list__button').length).toBe(20);
  });

  it('should append the next page and ignore duplicate in-flight load-more requests', async () => {
    const fixture = TestBed.createComponent(ImageListPageComponent);
    fixture.detectChanges();

    await flushRequest(fixture);

    const imageList = fixture.debugElement.query(By.directive(ImageListComponent))
      .componentInstance as ImageListComponent;

    imageList.loadMoreRequested.emit();
    imageList.loadMoreRequested.emit();
    fixture.detectChanges();

    expect(service.listImages).toHaveBeenCalledTimes(2);

    await flushRequest(fixture);

    expect(fixture.nativeElement.querySelectorAll('.image-list__button').length).toBe(25);

    imageList.loadMoreRequested.emit();
    fixture.detectChanges();

    expect(service.listImages).toHaveBeenCalledTimes(2);
  });

  it('should render an error state when the initial load fails', async () => {
    service.listImages.mockReturnValueOnce(delayedError());

    const fixture = TestBed.createComponent(ImageListPageComponent);
    fixture.detectChanges();

    await flushRequest(fixture);

    expect(service.listImages).toHaveBeenCalledTimes(1);
    expect(fixture.nativeElement.querySelectorAll('.image-list__button').length).toBe(0);
    expect(fixture.nativeElement.textContent).toContain('Could not load photos.');
  });

  it('should preserve loaded items and show an incremental error when load more fails', async () => {
    const fixture = TestBed.createComponent(ImageListPageComponent);
    fixture.detectChanges();

    await flushRequest(fixture);

    service.listImages.mockReturnValueOnce(delayedError('Load more failed'));

    const imageList = fixture.debugElement.query(By.directive(ImageListComponent))
      .componentInstance as ImageListComponent;

    imageList.loadMoreRequested.emit();
    fixture.detectChanges();

    await flushRequest(fixture);

    expect(service.listImages).toHaveBeenCalledTimes(2);
    expect(fixture.nativeElement.querySelectorAll('.image-list__button').length).toBe(20);
    expect(fixture.nativeElement.textContent).toContain('Could not load more photos.');
  });
});
